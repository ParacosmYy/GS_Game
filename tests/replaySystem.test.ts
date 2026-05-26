import { describe, expect, it } from 'vitest';
import { InputLogger } from '../src/core/inputLog.js';
import { ReplaySession, type ReplayBundleV1 } from '../src/core/replaySession.js';
import { createReplayInputSource } from '../src/core/replayInputSource.js';
import { SeededRNG, resetGameRng, getGameRngSnapshot, restoreGameRngSnapshot, getGameRngState } from '../src/core/prng.js';
import type { PlayerInput } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createInput(overrides: Partial<PlayerInput> = {}): PlayerInput {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    start: false,
    ...overrides,
  };
}

const NEUTRAL = createInput();

const DEFAULT_OPTIONS = {
  seed: 20240526,
  label: 'Ryo vs Iori',
  round: 2,
  p1CharId: 'ryo',
  p2CharId: 'iori',
  stageId: 'temple',
  teamMode: false,
  trainingMode: false,
} as const;

/**
 * Record N frames of input and return { session, inputLog, bundleJson }.
 */
function recordMatch(frameCount: number): {
  session: ReplaySession;
  inputLog: InputLogger;
  bundleJson: string;
} {
  const inputLog = new InputLogger();
  const session = new ReplaySession(inputLog);

  session.beginLiveMatch({ ...DEFAULT_OPTIONS });

  for (let t = 0; t < frameCount; t++) {
    const p1 = createInput({ right: t % 2 === 0, buttonA: t % 3 === 0 });
    const p2 = createInput({ left: t % 2 === 1, buttonB: t % 5 === 0 });
    inputLog.record(t, p1, p2);
  }

  return { session, inputLog, bundleJson: session.exportBundle() };
}

// ===========================================================================
// 1. Recording Lifecycle
// ===========================================================================

describe('Recording Lifecycle', () => {
  it('beginLiveMatch clears the input log and resets RNG', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);

    // Pre-populate with stale data
    inputLog.record(99, createInput({ buttonA: true }), NEUTRAL);
    expect(inputLog.length).toBe(1);

    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    // Input log should be cleared
    expect(inputLog.length).toBe(0);

    // Match envelope should be set
    const envelope = session.getMatchEnvelope();
    expect(envelope).not.toBeNull();
    expect(envelope!.seed).toBe(DEFAULT_OPTIONS.seed);
    expect(envelope!.source).toBe('live');

    // RNG snapshot should be set
    const rngSnap = session.getRngSnapshot();
    expect(rngSnap).not.toBeNull();
    expect(typeof rngSnap!.state).toBe('number');
  });

  it('record captures frame inputs that are retrievable', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    const p1 = createInput({ right: true, buttonA: true });
    const p2 = createInput({ left: true, buttonB: true });
    inputLog.record(42, p1, p2);

    expect(inputLog.length).toBe(1);
    const frame = inputLog.getFrame(42);
    expect(frame).toBeDefined();
    expect(frame!.tick).toBe(42);
    expect(frame!.p1.right).toBe(true);
    expect(frame!.p1.buttonA).toBe(true);
    expect(frame!.p2.left).toBe(true);
    expect(frame!.p2.buttonB).toBe(true);
  });

  it('exportBundle produces a valid JSON string after recording', () => {
    const { session, bundleJson } = recordMatch(5);

    expect(typeof bundleJson).toBe('string');

    const bundle: ReplayBundleV1 = JSON.parse(bundleJson);
    expect(bundle.version).toBe(1);
    expect(bundle.match.seed).toBe(DEFAULT_OPTIONS.seed);
    expect(bundle.match.label).toBe(DEFAULT_OPTIONS.label);
    expect(bundle.rngSnapshot.state).toBeTypeOf('number');
    expect(Array.isArray(bundle.inputLog.frames)).toBe(true);
    expect(bundle.inputLog.frames.length).toBe(5);
  });

  it('bundle contains correct match metadata', () => {
    const { bundleJson } = recordMatch(3);
    const bundle: ReplayBundleV1 = JSON.parse(bundleJson);

    expect(bundle.match).toEqual({
      seed: DEFAULT_OPTIONS.seed,
      label: DEFAULT_OPTIONS.label,
      round: DEFAULT_OPTIONS.round,
      p1CharId: DEFAULT_OPTIONS.p1CharId,
      p2CharId: DEFAULT_OPTIONS.p2CharId,
      stageId: DEFAULT_OPTIONS.stageId,
      teamMode: DEFAULT_OPTIONS.teamMode,
      trainingMode: DEFAULT_OPTIONS.trainingMode,
      source: 'live',
    });
  });
});

// ===========================================================================
// 2. Export / Import Roundtrip
// ===========================================================================

describe('Export/Import Roundtrip', () => {
  it('exportBundle returns valid JSON parseable structure', () => {
    const { bundleJson } = recordMatch(10);

    let parsed: unknown;
    expect(() => { parsed = JSON.parse(bundleJson); }).not.toThrow();

    const bundle = parsed as ReplayBundleV1;
    expect(bundle.version).toBe(1);
    expect(bundle.match).toBeDefined();
    expect(bundle.rngSnapshot).toBeDefined();
    expect(bundle.inputLog).toBeDefined();
    expect(bundle.inputLog.version).toBe(2);
    expect(bundle.inputLog.meta).toBeDefined();
  });

  it('importBundle with valid data returns ok=true', () => {
    const { bundleJson } = recordMatch(5);
    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(bundleJson);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bundle.version).toBe(1);
      expect(result.bundle.match.seed).toBe(DEFAULT_OPTIONS.seed);
    }
  });

  it('importBundle with invalid data returns ok=false with error message', () => {
    const imported = new ReplaySession(new InputLogger());

    // Completely invalid JSON
    const badJson = imported.importBundle('{not valid json}');
    expect(badJson.ok).toBe(false);
    if (!badJson.ok) expect(badJson.error).toContain('invalid');

    // Valid JSON but missing fields
    const empty = imported.importBundle('{}');
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toBeTruthy();
  });

  it('roundtrip: export then import then export produces identical data', () => {
    const { bundleJson: originalJson } = recordMatch(10);

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(originalJson);
    expect(result.ok).toBe(true);

    const reExported = imported.exportBundle();

    // The two JSON strings should be equivalent (parse and compare)
    expect(JSON.parse(reExported)).toEqual(JSON.parse(originalJson));
  });
});

// ===========================================================================
// 3. Input Log Integrity
// ===========================================================================

describe('Input Log Integrity', () => {
  it('recording 100 frames results in length=100', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    for (let t = 0; t < 100; t++) {
      inputLog.record(t, NEUTRAL, NEUTRAL);
    }

    expect(inputLog.length).toBe(100);
  });

  it('every frame contains both p1 and p2 input data', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    const p1 = createInput({ up: true, buttonC: true });
    const p2 = createInput({ down: true, buttonD: true });
    inputLog.record(0, p1, p2);

    const frame = inputLog.getFrame(0)!;
    expect(frame.p1).toEqual(p1);
    expect(frame.p2).toEqual(p2);

    // Verify all PlayerInput keys are present
    const keys: (keyof PlayerInput)[] = [
      'up', 'down', 'left', 'right',
      'buttonA', 'buttonB', 'buttonC', 'buttonD',
      'throwAttack', 'start',
    ];
    for (const key of keys) {
      expect(typeof frame.p1[key]).toBe('boolean');
      expect(typeof frame.p2[key]).toBe('boolean');
    }
  });

  it('clear() empties all recorded frames', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    for (let t = 0; t < 20; t++) {
      inputLog.record(t, NEUTRAL, NEUTRAL);
    }
    expect(inputLog.length).toBe(20);

    inputLog.clear();
    expect(inputLog.length).toBe(0);
    expect(inputLog.getFrame(0)).toBeUndefined();
  });

  it('input order is preserved across dump/load', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({ ...DEFAULT_OPTIONS });

    const ticks = [3, 7, 15, 100, 255];
    for (const t of ticks) {
      inputLog.record(t, createInput({ buttonA: t % 2 === 0 }), createInput({ buttonB: t % 2 === 1 }));
    }

    const dump = inputLog.dump();

    const loaded = new InputLogger();
    expect(loaded.load(dump)).toBe(true);
    expect(loaded.length).toBe(ticks.length);

    for (let i = 0; i < ticks.length; i++) {
      const frame = loaded.getFrameByIndex(i)!;
      expect(frame.tick).toBe(ticks[i]);
    }
  });
});

// ===========================================================================
// 4. RNG Determinism
// ===========================================================================

describe('RNG Determinism', () => {
  it('same seed produces identical random sequences', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const seq1 = Array.from({ length: 50 }, () => rng1.next());
    const seq2 = Array.from({ length: 50 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('snapshot/restore continues producing identical sequences', () => {
    const rng = new SeededRNG(99999);

    // Consume some values
    rng.next();
    rng.next();

    const snap = rng.snapshot();

    // Consume more
    rng.next();
    rng.next();

    // Restore and verify continuation matches a fresh clone
    const restored = new SeededRNG(99999);
    restored.next();
    restored.next();
    restored.restore(snap);
    restored.next();
    restored.next();

    // Both should now be at the same state
    const a = rng.next();
    const b = restored.next();
    expect(a).toBe(b);
  });

  it('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(11111);
    const rng2 = new SeededRNG(22222);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('replay replay uses fully deterministic RNG state', () => {
    // Simulate: record a match with a known seed, then verify that
    // resetting to the same seed produces the same RNG sequence.
    const seed = 77777;
    resetGameRng(seed);
    const snapBefore = getGameRngSnapshot();

    // Consume RNG
    const consumed: number[] = [];
    for (let i = 0; i < 20; i++) consumed.push(getGameRngState());

    // Reset to the same seed
    resetGameRng(seed);
    const snapAfter = getGameRngSnapshot();

    // Snapshot at seed reset should match
    expect(snapAfter.state).toBe(snapBefore.state);

    // Re-consume and verify determinism
    const reconsumed: number[] = [];
    for (let i = 0; i < 20; i++) reconsumed.push(getGameRngState());
    expect(reconsumed).toEqual(consumed);
  });
});

// ===========================================================================
// 5. Bundle Validation
// ===========================================================================

describe('Bundle Validation', () => {
  it('missing version field causes import to fail', () => {
    const { bundleJson } = recordMatch(3);
    const bundle = JSON.parse(bundleJson);
    delete bundle.version;

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(JSON.stringify(bundle));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('version');
  });

  it('missing match field causes import to fail', () => {
    const { bundleJson } = recordMatch(3);
    const bundle = JSON.parse(bundleJson);
    delete bundle.match;

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(JSON.stringify(bundle));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('match');
  });

  it('empty inputLog.frames is still valid (empty match)', () => {
    const { bundleJson } = recordMatch(0);
    const bundle: ReplayBundleV1 = JSON.parse(bundleJson);

    // Frames array should be empty but valid
    expect(bundle.inputLog.frames).toEqual([]);

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(bundleJson);
    expect(result.ok).toBe(true);
  });

  it('version mismatch causes import to fail', () => {
    const { bundleJson } = recordMatch(3);
    const bundle = JSON.parse(bundleJson);
    bundle.version = 99;

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(JSON.stringify(bundle));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Unsupported replay bundle version');
  });
});

// ===========================================================================
// 6. ReplayInputSource Integration
// ===========================================================================

describe('ReplayInputSource', () => {
  it('reads recorded frames and returns neutral for missing ticks', () => {
    const { bundleJson } = recordMatch(5);
    const bundle: ReplayBundleV1 = JSON.parse(bundleJson);
    const source = createReplayInputSource(bundle);

    expect(source.getFrameCount()).toBe(5);

    // Tick 0 was recorded
    const frame0 = source.readFrame(0);
    expect(frame0.recorded).toBe(true);
    expect(frame0.tick).toBe(0);

    // Tick 999 was NOT recorded
    const frame999 = source.readFrame(999);
    expect(frame999.recorded).toBe(false);
    expect(frame999.p1.buttonA).toBe(false);
    expect(frame999.p2.buttonB).toBe(false);
  });

  it('isFinished returns true after the last recorded tick', () => {
    const { bundleJson } = recordMatch(10);
    const bundle: ReplayBundleV1 = JSON.parse(bundleJson);
    const source = createReplayInputSource(bundle);

    // Tick 9 is the last recorded tick (frames 0..9)
    expect(source.isFinished(9)).toBe(false);
    expect(source.isFinished(10)).toBe(true);
    expect(source.isFinished(100)).toBe(true);
  });
});
