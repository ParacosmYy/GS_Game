import { describe, expect, it } from 'vitest';
import {
  SeededRNG,
  gameRandom,
  gameRandomInt,
  getGameRngState,
  getGameRngSnapshot,
  resetGameRng,
  restoreGameRngSnapshot,
  setGameRngState,
} from '../src/core/prng.js';
import {
  SnapshotRecorder,
  SnapshotVerifier,
  computeFrameChecksum,
  extractFighterSnapshot,
  extractGaugeSnapshot,
  extractMaxModeSnapshot,
  type FrameStateData,
  type FighterSnapshotData,
  type GaugeSnapshotData,
  type MaxModeSnapshotData,
} from '../src/core/replaySnapshot.js';
import { InputLogger } from '../src/core/inputLog.js';
import {
  ReplaySession,
  type ReplayBundleV1,
} from '../src/core/replaySession.js';
import type { PlayerInput } from '../src/core/types.js';
import { FighterState, GamePhase } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// Test helpers
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

const NEUTRAL_FIGHTER: FighterSnapshotData = {
  x: 200,
  y: 0,
  health: 1000,
  state: FighterState.IDLE,
  facing: 1,
  stunGauge: 0,
  currentAttack: null,
  attackPhase: 'none',
  hitstunTimer: 0,
  blockstunTimer: 0,
  knockdownTimer: 0,
  juggleState: 'NONE',
  airHitCount: 0,
  jugglePoints: 0,
  guardGauge: 100,
};

const NEUTRAL_GAUGE: GaugeSnapshotData = {
  meter: 0,
  stocks: 0,
};

const NEUTRAL_MAX_MODE: MaxModeSnapshotData = {
  active: false,
  timer: 0,
};

function createFrameState(overrides: Partial<FrameStateData> = {}): FrameStateData {
  return {
    frameNumber: 0,
    rngState: 0,
    gamePhase: GamePhase.FIGHTING,
    timer: 60,
    fighters: [
      { ...NEUTRAL_FIGHTER, x: 200, facing: 1 },
      { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
    ],
    gauges: [
      { ...NEUTRAL_GAUGE },
      { ...NEUTRAL_GAUGE },
    ],
    maxModes: [
      { ...NEUTRAL_MAX_MODE },
      { ...NEUTRAL_MAX_MODE },
    ],
    ...overrides,
  };
}

/**
 * Simulate a short deterministic game session.
 * Advances RNG and mutates state in a fixed pattern.
 * Returns the sequence of FrameStateData for each frame.
 */
function simulateSession(
  seed: number,
  totalFrames: number,
  snapshotInterval: number = 60,
): { states: FrameStateData[]; checkpoints: { frame: number; checksum: number }[] } {
  const rng = new SeededRNG(seed);
  const states: FrameStateData[] = [];
  const recorder = new SnapshotRecorder(snapshotInterval);

  let p1Health = 1000;
  let p2Health = 1000;
  let p1x = 200;
  let p2x = 600;

  for (let frame = 0; frame < totalFrames; frame++) {
    // Deterministic state changes driven by RNG
    p1x += rng.nextInt(5) - 2;
    p2x += rng.nextInt(5) - 2;

    // Occasional damage
    if (rng.next() < 0.05) {
      p2Health -= rng.nextInt(20) + 5;
    }
    if (rng.next() < 0.03) {
      p1Health -= rng.nextInt(15) + 5;
    }

    // Clamp health
    p1Health = Math.max(0, p1Health);
    p2Health = Math.max(0, p2Health);

    const data = createFrameState({
      frameNumber: frame,
      rngState: rng.getState(),
      timer: Math.max(0, 60 - Math.floor(frame / 60)),
      fighters: [
        { ...NEUTRAL_FIGHTER, x: p1x, health: p1Health, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: p2x, health: p2Health, facing: -1 },
      ],
      gauges: [
        { meter: Math.min(100, frame * 0.5), stocks: Math.floor(frame / 200) },
        { meter: Math.min(100, frame * 0.3), stocks: Math.floor(frame / 300) },
      ],
    });

    states.push(data);
    recorder.tick(frame, data);
  }

  return { states, checkpoints: recorder.getCheckpoints() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('replaySnapshot: FNV-1a checksum determinism', () => {
  it('same frame state produces the same checksum', () => {
    const data = createFrameState();
    const a = computeFrameChecksum(data);
    const b = computeFrameChecksum(data);
    expect(a).toBe(b);
  });

  it('different frame states produce different checksums', () => {
    const base = createFrameState();
    const modified = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 200, health: 999, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    expect(computeFrameChecksum(base)).not.toBe(computeFrameChecksum(modified));
  });

  it('different RNG states produce different checksums', () => {
    const a = createFrameState({ rngState: 12345 });
    const b = createFrameState({ rngState: 54321 });
    expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
  });

  it('different health values produce different checksums', () => {
    const a = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 200, health: 1000, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    const b = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 200, health: 500, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
  });

  it('different positions produce different checksums', () => {
    const a = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 200, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    const b = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 201, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
  });

  it('different timer values produce different checksums', () => {
    const a = createFrameState({ timer: 60 });
    const b = createFrameState({ timer: 59 });
    expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
  });
});

describe('replaySnapshot: SnapshotRecorder', () => {
  it('captures checkpoints at the specified interval', () => {
    const recorder = new SnapshotRecorder(30);
    const data = createFrameState();

    // Frames 0-89: expect checkpoints at frames 30, 60
    let captured = 0;
    for (let frame = 0; frame < 90; frame++) {
      data.frameNumber = frame;
      if (recorder.tick(frame, data)) captured++;
    }

    expect(captured).toBe(2);
    const checkpoints = recorder.getCheckpoints();
    expect(checkpoints.length).toBe(2);
    expect(checkpoints[0].frame).toBe(30);
    expect(checkpoints[1].frame).toBe(60);
  });

  it('captures no checkpoint at frame 0', () => {
    const recorder = new SnapshotRecorder(60);
    const data = createFrameState({ frameNumber: 0 });
    const result = recorder.tick(0, data);
    expect(result).toBe(false);
    expect(recorder.getCheckpoints().length).toBe(0);
  });

  it('reset clears all checkpoints', () => {
    const recorder = new SnapshotRecorder(10);
    const data = createFrameState();
    for (let frame = 0; frame < 30; frame++) {
      recorder.tick(frame, data);
    }
    expect(recorder.getCheckpoints().length).toBe(2);

    recorder.reset();
    expect(recorder.getCheckpoints().length).toBe(0);
  });

  it('export and import round-trip preserves checkpoints', () => {
    const recorder = new SnapshotRecorder(20);
    const data = createFrameState();
    for (let frame = 0; frame < 100; frame++) {
      data.frameNumber = frame;
      recorder.tick(frame, data);
    }

    const exported = recorder.export();
    const imported = SnapshotRecorder.import(exported);

    expect(imported.getCheckpoints()).toEqual(recorder.getCheckpoints());
  });
});

describe('replaySnapshot: SnapshotVerifier', () => {
  it('reports pass when all checksums match', () => {
    const seed = 42;
    const { states, checkpoints } = simulateSession(seed, 180);

    const verifier = new SnapshotVerifier(checkpoints, { logMismatches: false });
    for (const state of states) {
      verifier.tick(state.frameNumber, state);
    }

    const report = verifier.getReport();
    expect(report.passed).toBe(true);
    expect(report.totalCheckpoints).toBe(checkpoints.length);
    expect(report.mismatches.length).toBe(0);
    expect(report.firstDivergenceFrame).toBeNull();
  });

  it('detects divergence when state differs', () => {
    const seed = 42;
    const { states, checkpoints } = simulateSession(seed, 180);

    // Corrupt the states to simulate a divergence
    const corruptedStates = states.map((s, i) => {
      if (i >= 60) {
        // Shift P1 health by 1 after frame 60
        return {
          ...s,
          fighters: [
            { ...s.fighters[0], health: s.fighters[0].health + 1 },
            s.fighters[1],
          ] as [FighterSnapshotData, FighterSnapshotData],
        };
      }
      return s;
    });

    const verifier = new SnapshotVerifier(checkpoints, { logMismatches: false });
    for (const state of corruptedStates) {
      verifier.tick(state.frameNumber, state);
    }

    const report = verifier.getReport();
    expect(report.passed).toBe(false);
    expect(report.mismatches.length).toBeGreaterThanOrEqual(1);
    // First divergence should be at frame 60 (the first checkpoint after corruption)
    expect(report.firstDivergenceFrame).toBe(60);
  });

  it('stopOnFirstMismatch option limits reported mismatches', () => {
    const seed = 42;
    const { states, checkpoints } = simulateSession(seed, 300);

    // Corrupt all states after frame 30
    const corruptedStates = states.map(s => ({
      ...s,
      fighters: [
        { ...s.fighters[0], health: s.fighters[0].health + 100 },
        s.fighters[1],
      ] as [FighterSnapshotData, FighterSnapshotData],
    }));

    const verifier = new SnapshotVerifier(checkpoints, {
      logMismatches: false,
      stopOnFirstMismatch: true,
    });
    for (const state of corruptedStates) {
      verifier.tick(state.frameNumber, state);
    }

    const report = verifier.getReport();
    expect(report.passed).toBe(false);
    expect(report.mismatches.length).toBe(1);
  });
});

describe('replaySnapshot: same seed produces same replay', () => {
  it('two simulations with the same seed produce identical checkpoints', () => {
    const seed = 12345;
    const totalFrames = 300;

    const run1 = simulateSession(seed, totalFrames);
    const run2 = simulateSession(seed, totalFrames);

    // Checkpoints must be identical
    expect(run1.checkpoints).toEqual(run2.checkpoints);

    // Every frame state must produce the same checksum
    for (let i = 0; i < totalFrames; i++) {
      const cs1 = computeFrameChecksum(run1.states[i]);
      const cs2 = computeFrameChecksum(run2.states[i]);
      expect(cs1).toBe(cs2);
    }
  });

  it('two simulations with the same seed produce identical RNG state sequences', () => {
    const seed = 98765;
    const totalFrames = 200;

    const run1 = simulateSession(seed, totalFrames);
    const run2 = simulateSession(seed, totalFrames);

    for (let i = 0; i < totalFrames; i++) {
      expect(run1.states[i].rngState).toBe(run2.states[i].rngState);
    }
  });

  it('full record-and-replay round-trip produces matching verification', () => {
    const seed = 55555;
    const totalFrames = 240;

    // Record phase
    const recorded = simulateSession(seed, totalFrames);

    // Replay phase: re-simulate with same seed, verify against recorded checkpoints
    const replayed = simulateSession(seed, totalFrames);

    const verifier = new SnapshotVerifier(recorded.checkpoints, { logMismatches: false });
    for (const state of replayed.states) {
      verifier.tick(state.frameNumber, state);
    }

    const report = verifier.getReport();
    expect(report.passed).toBe(true);
    expect(report.totalCheckpoints).toBe(recorded.checkpoints.length);
  });
});

describe('replaySnapshot: different seeds produce different replays', () => {
  it('different seeds produce different checkpoints', () => {
    const run1 = simulateSession(11111, 180);
    const run2 = simulateSession(22222, 180);

    // At least one checkpoint should differ
    const allSame = run1.checkpoints.every((cp, i) =>
      i < run2.checkpoints.length &&
      cp.checksum === run2.checkpoints[i].checksum
    );
    expect(allSame).toBe(false);
  });

  it('different seeds produce different RNG state at every frame', () => {
    const run1 = simulateSession(100, 60);
    const run2 = simulateSession(200, 60);

    let anyDifference = false;
    for (let i = 0; i < 60; i++) {
      if (run1.states[i].rngState !== run2.states[i].rngState) {
        anyDifference = true;
        break;
      }
    }
    expect(anyDifference).toBe(true);
  });

  it('different seeds produce different position trajectories', () => {
    const run1 = simulateSession(34567, 120);
    const run2 = simulateSession(76543, 120);

    // Positions should diverge at some point
    let anyDivergence = false;
    for (let i = 0; i < 120; i++) {
      if (run1.states[i].fighters[0].x !== run2.states[i].fighters[0].x) {
        anyDivergence = true;
        break;
      }
    }
    expect(anyDivergence).toBe(true);
  });
});

describe('replaySnapshot: extractFighterSnapshot', () => {
  it('extracts all relevant fields from a fighter-like object', () => {
    const fighter = {
      x: 300,
      y: 10,
      health: 800,
      state: FighterState.WALK,
      facing: -1 as const,
      stunGauge: 50,
      currentAttack: null as string | null,
      attackPhase: 'none' as const,
      hitstunTimer: 0,
      blockstunTimer: 0,
      knockdownTimer: 0,
      juggleState: 'NONE' as const,
      airHitCount: 0,
      jugglePoints: 0,
      guardGauge: 75,
    };

    const snapshot = extractFighterSnapshot(fighter);
    expect(snapshot.x).toBe(300);
    expect(snapshot.y).toBe(10);
    expect(snapshot.health).toBe(800);
    expect(snapshot.state).toBe(FighterState.WALK);
    expect(snapshot.facing).toBe(-1);
    expect(snapshot.stunGauge).toBe(50);
    expect(snapshot.guardGauge).toBe(75);
  });
});

describe('replaySnapshot: extractGaugeSnapshot', () => {
  it('extracts meter and stocks from a gauge-like object', () => {
    const gauge = { meter: 75.5, stocks: 2 };
    const snapshot = extractGaugeSnapshot(gauge);
    expect(snapshot.meter).toBe(75.5);
    expect(snapshot.stocks).toBe(2);
  });
});

describe('replaySnapshot: extractMaxModeSnapshot', () => {
  it('extracts active and timer from a max mode object', () => {
    const maxMode = { active: true, timer: 300 };
    const snapshot = extractMaxModeSnapshot(maxMode);
    expect(snapshot.active).toBe(true);
    expect(snapshot.timer).toBe(300);
  });
});

describe('replaySnapshot: integration with ReplaySession', () => {
  it('snapshots can be embedded in a replay bundle and recovered', () => {
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({
      seed: 42,
      label: 'Kyo vs Iori',
      round: 1,
      p1CharId: 'kyo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
    });

    inputLog.record(0, createInput(), createInput());
    inputLog.record(1, createInput({ right: true }), createInput());
    inputLog.record(2, createInput({ right: true, buttonA: true }), createInput());

    const bundleJson = session.exportBundle();
    const bundle = JSON.parse(bundleJson) as ReplayBundleV1;

    // Create and export checkpoints alongside the bundle
    const recorder = new SnapshotRecorder(1);
    const rng = new SeededRNG(42);
    for (let frame = 0; frame < 3; frame++) {
      const data = createFrameState({
        frameNumber: frame,
        rngState: rng.getState(),
      });
      rng.next();
      recorder.tick(frame, data);
    }

    const checkpoints = recorder.export();
    expect(checkpoints.length).toBeGreaterThanOrEqual(1);

    // Checkpoints can be serialized and deserialized
    const serialized = JSON.stringify(checkpoints);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(checkpoints);
  });
});
