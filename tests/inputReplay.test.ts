/**
 * Input Replay Tests — InputRecorder + InputPlayback
 *
 * Covers:
 * - Recording starts and captures inputs
 * - Recording stops and returns data
 * - Playback returns correct inputs per tick
 * - Playback returns null for unrecorded ticks
 * - Playback completion detection
 * - Round-trip: record → playback yields same inputs
 */
import { describe, it, expect } from 'vitest';
import { InputRecorder, type RecordedInput } from '../src/core/inputRecorder.js';
import { InputPlayback } from '../src/core/inputPlayback.js';
import type { PlayerInput } from '../src/core/types.js';

function createInput(overrides: Partial<PlayerInput> = {}): PlayerInput {
  return {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false, start: false,
    ...overrides,
  };
}

const NEUTRAL: PlayerInput = createInput();

// ── 1. Recording Lifecycle ──────────────────────────────────
describe('InputRecorder — Recording Lifecycle', () => {
  it('starts recording and sets active state', () => {
    const recorder = new InputRecorder();
    expect(recorder.active).toBe(false);
    recorder.start(0);
    expect(recorder.active).toBe(true);
  });

  it('captures inputs via record() with player argument', () => {
    const recorder = new InputRecorder();
    recorder.start(0);

    recorder.record(0, 1, createInput({ buttonA: true }));
    recorder.record(0, 2, createInput({ buttonC: true }));
    recorder.record(1, 1, createInput({ left: true }));
    recorder.record(1, 2, NEUTRAL);

    expect(recorder.frameCount).toBe(2);
  });

  it('captures inputs via recordFrame() convenience method', () => {
    const recorder = new InputRecorder();
    recorder.start(0);

    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);
    recorder.recordFrame(1, NEUTRAL, createInput({ buttonD: true }));
    recorder.recordFrame(2, createInput({ up: true }), createInput({ down: true }));

    expect(recorder.frameCount).toBe(3);
  });

  it('ignores record calls when not recording', () => {
    const recorder = new InputRecorder();
    // Not started — should be no-op
    recorder.record(0, 1, createInput({ buttonA: true }));
    recorder.recordFrame(0, NEUTRAL, NEUTRAL);
    expect(recorder.frameCount).toBe(0);
  });

  it('records startTick correctly', () => {
    const recorder = new InputRecorder();
    recorder.start(42);
    expect(recorder.recordedFromTick).toBe(42);
  });
});

// ── 2. Recording Stop & Data ────────────────────────────────
describe('InputRecorder — Stop and Return Data', () => {
  it('stop returns RecordedInput[] and deactivates', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);
    recorder.recordFrame(1, NEUTRAL, createInput({ buttonC: true }));

    const data = recorder.stop();
    expect(recorder.active).toBe(false);
    expect(data.length).toBe(4); // 2 ticks × 2 players
  });

  it('stop data has correct tick and player fields', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(5, createInput({ buttonA: true }), createInput({ buttonC: true }));

    const data = recorder.stop();
    const p1Entry = data.find(d => d.player === 1);
    const p2Entry = data.find(d => d.player === 2);

    expect(p1Entry).toBeDefined();
    expect(p1Entry!.tick).toBe(5);
    expect(p1Entry!.input.buttonA).toBe(true);

    expect(p2Entry).toBeDefined();
    expect(p2Entry!.tick).toBe(5);
    expect(p2Entry!.input.buttonC).toBe(true);
  });

  it('getRecording returns data without stopping', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);

    const data = recorder.getRecording();
    expect(data.length).toBe(2);
    expect(recorder.active).toBe(true); // Still recording
  });
});

// ── 3. Playback — Correct Inputs Per Tick ───────────────────
describe('InputPlayback — Correct Inputs Per Tick', () => {
  it('returns correct inputs for recorded ticks', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    const p1Input = createInput({ buttonA: true, right: true });
    const p2Input = createInput({ buttonC: true, left: true });
    recorder.recordFrame(0, p1Input, p2Input);
    recorder.recordFrame(1, NEUTRAL, NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    const result0 = playback.getFrame(0);
    expect(result0).not.toBeNull();
    expect(result0![0].buttonA).toBe(true);
    expect(result0![0].right).toBe(true);
    expect(result0![1].buttonC).toBe(true);
    expect(result0![1].left).toBe(true);
  });

  it('getInput returns per-player data', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ up: true }), createInput({ down: true }));

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    const p1 = playback.getInput(0, 1);
    const p2 = playback.getInput(0, 2);

    expect(p1).not.toBeNull();
    expect(p1!.up).toBe(true);
    expect(p2).not.toBeNull();
    expect(p2!.down).toBe(true);
  });

  it('inputs are deep-copied (mutation safe)', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);

    const data = recorder.stop();
    const playback = new InputPlayback();
    playback.load(data);
    playback.start(0);

    const result1 = playback.getInput(0, 1)!;
    result1.buttonA = false; // Mutate returned value

    const result2 = playback.getInput(0, 1)!;
    expect(result2.buttonA).toBe(true); // Original preserved
  });
});

// ── 4. Playback — Unrecorded Ticks ──────────────────────────
describe('InputPlayback — Unrecorded Ticks', () => {
  it('returns null for ticks not in the recording', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, NEUTRAL, NEUTRAL);
    recorder.recordFrame(2, NEUTRAL, NEUTRAL); // tick 1 is missing

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    expect(playback.getInput(1, 1)).toBeNull();
    expect(playback.getInput(1, 2)).toBeNull();
    expect(playback.getFrame(1)).toBeNull();
  });

  it('returns null before start is called', () => {
    const playback = new InputPlayback();
    playback.load([{ tick: 0, player: 1, input: NEUTRAL }]);
    // Not started yet
    expect(playback.getInput(0, 1)).toBeNull();
  });

  it('returns null when playback is stopped', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, NEUTRAL, NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);
    playback.stop();

    expect(playback.getInput(0, 1)).toBeNull();
  });
});

// ── 5. Playback Completion ──────────────────────────────────
describe('InputPlayback — Completion Detection', () => {
  it('isFinished is false during playback', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, NEUTRAL, NEUTRAL);
    recorder.recordFrame(1, NEUTRAL, NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    expect(playback.isFinished()).toBe(false);
  });

  it('isFinished is true before start', () => {
    const playback = new InputPlayback();
    expect(playback.isFinished()).toBe(true);
  });

  it('isFinished is true after stop', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, NEUTRAL, NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);
    playback.stop();

    expect(playback.isFinished()).toBe(true);
  });

  it('reports frameCount and tickRange', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(5, NEUTRAL, NEUTRAL);
    recorder.recordFrame(10, NEUTRAL, NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());

    expect(playback.frameCount).toBe(2);
    expect(playback.tickRange).toEqual({ first: 5, last: 10 });
  });
});

// ── 6. Round-trip: Record → Playback ───────────────────────
describe('Round-trip: Record → Playback', () => {
  it('record then playback yields identical inputs', () => {
    const recorder = new InputRecorder();
    recorder.start(0);

    const frames: [PlayerInput, PlayerInput][] = [
      [createInput({ buttonA: true, right: true }), createInput({ buttonC: true })],
      [createInput({ up: true }), createInput({ down: true, left: true })],
      [createInput({ buttonB: true, throwAttack: true }), NEUTRAL],
      [NEUTRAL, createInput({ burst: true })],
      [createInput({ buttonD: true }), createInput({ start: true })],
    ];

    for (let i = 0; i < frames.length; i++) {
      recorder.recordFrame(i, frames[i][0], frames[i][1]);
    }

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    for (let i = 0; i < frames.length; i++) {
      const result = playback.getFrame(i);
      expect(result, `Frame ${i} should exist`).not.toBeNull();
      const [p1, p2] = result!;

      // Compare all fields
      for (const key of Object.keys(frames[i][0]) as (keyof PlayerInput)[]) {
        expect(p1[key], `Frame ${i} P1.${key}`).toBe(frames[i][0][key]);
      }
      for (const key of Object.keys(frames[i][1]) as (keyof PlayerInput)[]) {
        expect(p2[key], `Frame ${i} P2.${key}`).toBe(frames[i][1][key]);
      }
    }

    // Frame beyond recording should be null
    expect(playback.getFrame(frames.length)).toBeNull();
  });

  it('record via record() per-player then playback yields correct data', () => {
    const recorder = new InputRecorder();
    recorder.start(0);

    // Record P1 and P2 separately for each tick
    recorder.record(0, 1, createInput({ buttonA: true }));
    recorder.record(0, 2, createInput({ buttonC: true }));
    recorder.record(1, 1, NEUTRAL);
    recorder.record(1, 2, createInput({ buttonD: true }));

    const data = recorder.stop();
    const playback = new InputPlayback();
    playback.load(data);
    playback.start(0);

    const f0p1 = playback.getInput(0, 1);
    const f0p2 = playback.getInput(0, 2);
    expect(f0p1!.buttonA).toBe(true);
    expect(f0p2!.buttonC).toBe(true);

    const f1p1 = playback.getInput(1, 1);
    const f1p2 = playback.getInput(1, 2);
    expect(f1p1!.buttonA).toBe(false);
    expect(f1p2!.buttonD).toBe(true);
  });

  it('getSnapshots → loadSnapshots round-trip (zero-copy path)', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);
    recorder.recordFrame(1, NEUTRAL, createInput({ buttonC: true }));

    // Use the snapshot path (avoids RecordedInput conversion)
    const playback = new InputPlayback();
    playback.loadSnapshots(recorder.getSnapshots());
    playback.start(0);

    expect(playback.getInput(0, 1)!.buttonA).toBe(true);
    expect(playback.getInput(1, 2)!.buttonC).toBe(true);
    expect(playback.frameCount).toBe(2);
  });
});

// ── 7. Edge Cases ───────────────────────────────────────────
describe('Edge Cases', () => {
  it('empty recording loads and plays back without error', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    // Don't record anything
    const data = recorder.stop();

    const playback = new InputPlayback();
    playback.load(data);
    playback.start(0);

    expect(playback.frameCount).toBe(0);
    expect(playback.isFinished()).toBe(true);
    expect(playback.getFrame(0)).toBeNull();
    expect(playback.tickRange).toBeNull();
  });

  it('loading new data resets previous playback state', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    // Now load different data
    const recorder2 = new InputRecorder();
    recorder2.start(0);
    recorder2.recordFrame(0, createInput({ buttonC: true }), NEUTRAL);
    recorder2.recordFrame(1, NEUTRAL, createInput({ buttonD: true }));

    playback.load(recorder2.stop());
    playback.start(0);

    expect(playback.getInput(0, 1)!.buttonC).toBe(true);
    expect(playback.getInput(0, 1)!.buttonA).toBe(false);
    expect(playback.getInput(1, 2)!.buttonD).toBe(true);
  });

  it('out-of-order ticks are sorted during playback load', () => {
    const playback = new InputPlayback();
    const data: RecordedInput[] = [
      { tick: 5, player: 1, input: NEUTRAL },
      { tick: 5, player: 2, input: NEUTRAL },
      { tick: 1, player: 1, input: createInput({ buttonA: true }) },
      { tick: 1, player: 2, input: NEUTRAL },
      { tick: 3, player: 1, input: NEUTRAL },
      { tick: 3, player: 2, input: createInput({ buttonC: true }) },
    ];

    playback.load(data);
    playback.start(0);

    expect(playback.tickRange).toEqual({ first: 1, last: 5 });
    expect(playback.getInput(1, 1)!.buttonA).toBe(true);
    expect(playback.getInput(3, 2)!.buttonC).toBe(true);
  });

  it('start can be called multiple times (restart)', () => {
    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, createInput({ buttonA: true }), NEUTRAL);
    recorder.recordFrame(1, NEUTRAL, createInput({ buttonC: true }));

    const playback = new InputPlayback();
    playback.load(recorder.stop());

    // First playback
    playback.start(0);
    expect(playback.getInput(0, 1)!.buttonA).toBe(true);

    // Restart
    playback.start(0);
    expect(playback.getInput(0, 1)!.buttonA).toBe(true);
    expect(playback.isFinished()).toBe(false);
  });

  it('all PlayerInput fields are preserved in round-trip', () => {
    const fullInput: PlayerInput = {
      up: true, down: true, left: true, right: true,
      buttonA: true, buttonB: true, buttonC: true, buttonD: true,
      throwAttack: true, burst: true, start: true,
    };

    const recorder = new InputRecorder();
    recorder.start(0);
    recorder.recordFrame(0, fullInput, fullInput);

    const playback = new InputPlayback();
    playback.load(recorder.stop());
    playback.start(0);

    const p1 = playback.getInput(0, 1)!;
    const p2 = playback.getInput(0, 2)!;

    const keys: (keyof PlayerInput)[] = [
      'up', 'down', 'left', 'right',
      'buttonA', 'buttonB', 'buttonC', 'buttonD',
      'throwAttack', 'burst', 'start',
    ];
    for (const key of keys) {
      expect(p1[key], `P1.${key}`).toBe(true);
      expect(p2[key], `P2.${key}`).toBe(true);
    }
  });
});
