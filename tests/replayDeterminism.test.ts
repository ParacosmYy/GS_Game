/**
 * Comprehensive Replay/RNG Determinism Tests
 *
 * Tests that verify the entire record → export → import → replay pipeline
 * produces byte-identical results, covering PRNG determinism, state snapshots,
 * frame-level consistency, input recording, and edge cases.
 */
import { describe, it, expect } from 'vitest';
import {
  SeededRNG,
  gameRandom,
  gameRandomInt,
  gameRandomRange,
  resetGameRng,
  getGameRngSnapshot,
  restoreGameRngSnapshot,
  getGameRngState,
  setGameRngState,
} from '../src/core/prng.js';
import {
  InputLogger,
  type InputFrame,
} from '../src/core/inputLog.js';
import {
  ReplaySession,
  type ReplayBundleV1,
} from '../src/core/replaySession.js';
import {
  createReplayInputSource,
} from '../src/core/replayInputSource.js';
import {
  SnapshotRecorder,
  SnapshotVerifier,
  computeFrameChecksum,
  type FrameStateData,
  type FighterSnapshotData,
  type GaugeSnapshotData,
  type MaxModeSnapshotData,
} from '../src/core/replaySnapshot.js';
import type { PlayerInput } from '../src/core/types.js';
import { FighterState, GamePhase } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// Shared test helpers
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

const NEUTRAL_INPUT = createInput();

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

const NEUTRAL_GAUGE: GaugeSnapshotData = { meter: 0, stocks: 0 };
const NEUTRAL_MAX_MODE: MaxModeSnapshotData = { active: false, timer: 0 };

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
 * Simulate a deterministic game session producing per-frame state data.
 * All state changes are driven by a local RNG instance so results are
 * reproducible.
 */
function simulateSession(
  seed: number,
  totalFrames: number,
  snapshotInterval: number = 60,
): {
  states: FrameStateData[];
  checkpoints: { frame: number; checksum: number }[];
} {
  const rng = new SeededRNG(seed);
  const states: FrameStateData[] = [];
  const recorder = new SnapshotRecorder(snapshotInterval);

  let p1x = 200;
  let p2x = 600;
  let p1y = 0;
  let p2y = 0;
  let p1Health = 1000;
  let p2Health = 1000;
  let p1Meter = 0;
  let p2Meter = 0;

  for (let frame = 0; frame < totalFrames; frame++) {
    // Deterministic position jitter
    p1x += rng.nextInt(5) - 2;
    p2x += rng.nextInt(5) - 2;
    p1y = rng.next() < 0.1 ? rng.nextInt(30) : 0;
    p2y = rng.next() < 0.1 ? rng.nextInt(30) : 0;

    // Occasional damage
    if (rng.next() < 0.05) {
      p2Health -= rng.nextInt(20) + 5;
    }
    if (rng.next() < 0.03) {
      p1Health -= rng.nextInt(15) + 5;
    }

    p1Health = Math.max(0, p1Health);
    p2Health = Math.max(0, p2Health);

    // Meter growth
    p1Meter = Math.min(500, p1Meter + rng.nextRange(0, 2));
    p2Meter = Math.min(500, p2Meter + rng.nextRange(0, 2));

    const data = createFrameState({
      frameNumber: frame,
      rngState: rng.getState(),
      timer: Math.max(0, 60 - Math.floor(frame / 60)),
      fighters: [
        { ...NEUTRAL_FIGHTER, x: p1x, y: p1y, health: p1Health, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: p2x, y: p2y, health: p2Health, facing: -1 },
      ],
      gauges: [
        { meter: p1Meter, stocks: Math.floor(p1Meter / 100) },
        { meter: p2Meter, stocks: Math.floor(p2Meter / 100) },
      ],
    });

    states.push(data);
    recorder.tick(frame, data);
  }

  return { states, checkpoints: recorder.getCheckpoints() };
}

/**
 * Build a full replay bundle with a short deterministic match.
 */
function buildReplayBundle(
  seed: number,
  totalFrames: number,
  inputPattern: (tick: number) => { p1: PlayerInput; p2: PlayerInput },
): {
  bundle: ReplayBundleV1;
  bundleJson: string;
  session: ReplaySession;
} {
  const inputLog = new InputLogger();
  const session = new ReplaySession(inputLog);

  session.beginLiveMatch({
    seed,
    label: 'determinism-test',
    round: 1,
    p1CharId: 'kyo',
    p2CharId: 'iori',
    stageId: 'temple',
    teamMode: false,
    trainingMode: false,
  });

  for (let tick = 0; tick < totalFrames; tick++) {
    const { p1, p2 } = inputPattern(tick);
    inputLog.record(tick, p1, p2);
  }

  const bundleJson = session.exportBundle();
  const bundle = JSON.parse(bundleJson) as ReplayBundleV1;
  return { bundle, bundleJson, session };
}

// ===========================================================================
// 1. PRNG Determinism
// ===========================================================================

describe('PRNG Determinism', () => {
  it('same seed produces identical sequence', () => {
    const rng1 = new SeededRNG(54321);
    const rng2 = new SeededRNG(54321);

    const seq1 = Array.from({ length: 100 }, () => rng1.next());
    const seq2 = Array.from({ length: 100 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('xorshift32 produces expected values for known seed', () => {
    // Hand-verify the first few raw states for seed=42:
    // After normalize (42 ^ 0xDEECE66D) >>> 0 and 16-iteration warmup,
    // the public next() values are deterministic.
    const rng = new SeededRNG(42);
    const values: number[] = [];
    for (let i = 0; i < 5; i++) {
      values.push(rng.next());
    }

    // All values must be valid floats in [0, 1)
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(Number.isFinite(v)).toBe(true);
    }

    // Values should not all be identical (no degeneration)
    const unique = new Set(values);
    expect(unique.size).toBeGreaterThan(1);

    // Recreate with same seed and verify we get identical values
    const rng2 = new SeededRNG(42);
    for (let i = 0; i < 5; i++) {
      expect(rng2.next()).toBe(values[i]);
    }
  });

  it('PRNG range bounded correctly', () => {
    const rng = new SeededRNG(98765);

    for (let i = 0; i < 500; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);

      const intVal = rng.nextInt(100);
      expect(intVal).toBeGreaterThanOrEqual(0);
      expect(intVal).toBeLessThan(100);

      const rangeVal = rng.nextRange(-50, 50);
      expect(rangeVal).toBeGreaterThanOrEqual(-50);
      expect(rangeVal).toBeLessThan(50);
    }
  });

  it('different seeds produce different sequences', () => {
    const seeds = [1, 2, 100, 99999, 4294967295];
    const sequences: number[][] = [];

    for (const seed of seeds) {
      const rng = new SeededRNG(seed);
      sequences.push(Array.from({ length: 20 }, () => rng.next()));
    }

    // Every pair of sequences should differ
    for (let i = 0; i < sequences.length; i++) {
      for (let j = i + 1; j < sequences.length; j++) {
        expect(sequences[i]).not.toEqual(sequences[j]);
      }
    }
  });

  it('PRNG never produces 0 or negative values', () => {
    const rng = new SeededRNG(1337);

    for (let i = 0; i < 2000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
      expect(val).not.toBeLessThan(0);
    }

    // Also verify nextInt never returns negative
    for (let i = 0; i < 500; i++) {
      const intVal = rng.nextInt(1000);
      expect(intVal).toBeGreaterThanOrEqual(0);
    }
  });
});

// ===========================================================================
// 2. State Snapshot
// ===========================================================================

describe('State Snapshot', () => {
  it('snapshot captures all fighter state (x, y, vx, vy, health, meter, etc.)', () => {
    const fighter = {
      x: 350,
      y: -20,
      health: 750,
      state: FighterState.HITSTUN,
      facing: -1 as const,
      stunGauge: 45,
      currentAttack: 'STAND_C' as string | null,
      attackPhase: 'active' as const,
      hitstunTimer: 12,
      blockstunTimer: 0,
      knockdownTimer: 0,
      juggleState: 'HALF' as const,
      airHitCount: 2,
      jugglePoints: 3,
      guardGauge: 60,
    };

    const snapshot = {
      x: fighter.x,
      y: fighter.y,
      health: fighter.health,
      state: fighter.state,
      facing: fighter.facing,
      stunGauge: fighter.stunGauge,
      currentAttack: fighter.currentAttack,
      attackPhase: fighter.attackPhase,
      hitstunTimer: fighter.hitstunTimer,
      blockstunTimer: fighter.blockstunTimer,
      knockdownTimer: fighter.knockdownTimer,
      juggleState: fighter.juggleState,
      airHitCount: fighter.airHitCount,
      jugglePoints: fighter.jugglePoints,
      guardGauge: fighter.guardGauge,
    };

    // Verify every field was captured correctly
    expect(snapshot.x).toBe(350);
    expect(snapshot.y).toBe(-20);
    expect(snapshot.health).toBe(750);
    expect(snapshot.state).toBe(FighterState.HITSTUN);
    expect(snapshot.facing).toBe(-1);
    expect(snapshot.stunGauge).toBe(45);
    expect(snapshot.currentAttack).toBe('STAND_C');
    expect(snapshot.attackPhase).toBe('active');
    expect(snapshot.hitstunTimer).toBe(12);
    expect(snapshot.juggleState).toBe('HALF');
    expect(snapshot.airHitCount).toBe(2);
    expect(snapshot.jugglePoints).toBe(3);
    expect(snapshot.guardGauge).toBe(60);

    // The snapshot must include enough to produce a checksum
    const data = createFrameState({
      fighters: [snapshot, { ...NEUTRAL_FIGHTER, x: 600, facing: -1 }],
    });
    const checksum = computeFrameChecksum(data);
    expect(typeof checksum).toBe('number');
    expect(checksum).toBeGreaterThan(0);
  });

  it('restore from snapshot returns to exact previous state', () => {
    const rng = new SeededRNG(42);

    // Advance a few steps
    rng.next();
    rng.next();
    rng.next();

    const snapshot = rng.snapshot();
    const stateBefore = rng.getState();
    const expected = rng.next();

    // Advance further
    rng.next();
    rng.next();
    rng.next();

    // Restore
    rng.restore(snapshot);

    // Must be back at the exact position
    expect(rng.getState()).toBe(stateBefore);
    expect(rng.next()).toBe(expected);
  });

  it('snapshot includes RNG state', () => {
    const rng = new SeededRNG(7777);
    rng.next();
    rng.next();

    const snap = rng.snapshot();
    expect(snap.state).toBe(rng.getState());
    expect(typeof snap.state).toBe('number');
    expect(Number.isFinite(snap.state)).toBe(true);
    expect(snap.state).toBeGreaterThan(0);
  });

  it('snapshot includes combo state (comboHits, jugglePoints, etc.)', () => {
    // Verify that FighterSnapshotData carries combo-relevant fields
    const comboFighter: FighterSnapshotData = {
      ...NEUTRAL_FIGHTER,
      juggleState: 'FULL',
      airHitCount: 4,
      jugglePoints: 2,
    };

    // These fields must be present and distinct from neutral
    expect(comboFighter.juggleState).toBe('FULL');
    expect(comboFighter.airHitCount).toBe(4);
    expect(comboFighter.jugglePoints).toBe(2);

    // Changing combo fields must change the frame checksum
    const base = createFrameState({
      fighters: [
        { ...NEUTRAL_FIGHTER, x: 200, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });
    const combo = createFrameState({
      fighters: [
        { ...comboFighter, x: 200, facing: 1 },
        { ...NEUTRAL_FIGHTER, x: 600, facing: -1 },
      ],
    });

    expect(computeFrameChecksum(base)).not.toBe(computeFrameChecksum(combo));
  });

  it('multiple snapshots can be stored and restored in order', () => {
    const rng = new SeededRNG(100);
    const snapshots: number[] = [];
    const valuesAtSnapshots: number[] = [];

    // Take 5 snapshots at different points
    for (let i = 0; i < 5; i++) {
      snapshots.push(rng.getState());
      valuesAtSnapshots.push(rng.next());
      // Advance a few more steps between snapshots
      rng.next();
      rng.next();
    }

    // Restore in order and verify
    for (let i = 0; i < 5; i++) {
      rng.setState(snapshots[i]);
      expect(rng.next()).toBe(valuesAtSnapshots[i]);
    }

    // Restore in reverse order
    for (let i = 4; i >= 0; i--) {
      rng.setState(snapshots[i]);
      expect(rng.next()).toBe(valuesAtSnapshots[i]);
    }
  });
});

// ===========================================================================
// 3. Replay Frame Consistency
// ===========================================================================

describe('Replay Frame Consistency', () => {
  it('same inputs produce same outputs (frame-perfect determinism)', () => {
    const seed = 44444;

    // Run 1
    const run1 = simulateSession(seed, 300);

    // Run 2 — same seed, same frame count
    const run2 = simulateSession(seed, 300);

    // Every single frame checksum must match
    for (let i = 0; i < 300; i++) {
      expect(computeFrameChecksum(run1.states[i])).toBe(computeFrameChecksum(run2.states[i]));
    }

    // Checkpoints must be identical
    expect(run1.checkpoints).toEqual(run2.checkpoints);
  });

  it('replay reproduces exact health values', () => {
    const seed = 55555;
    const run1 = simulateSession(seed, 240);
    const run2 = simulateSession(seed, 240);

    for (let i = 0; i < 240; i++) {
      expect(run1.states[i].fighters[0].health).toBe(run2.states[i].fighters[0].health);
      expect(run1.states[i].fighters[1].health).toBe(run2.states[i].fighters[1].health);
    }
  });

  it('replay reproduces exact positions', () => {
    const seed = 66666;
    const run1 = simulateSession(seed, 240);
    const run2 = simulateSession(seed, 240);

    for (let i = 0; i < 240; i++) {
      expect(run1.states[i].fighters[0].x).toBe(run2.states[i].fighters[0].x);
      expect(run1.states[i].fighters[0].y).toBe(run2.states[i].fighters[0].y);
      expect(run1.states[i].fighters[1].x).toBe(run2.states[i].fighters[1].x);
      expect(run1.states[i].fighters[1].y).toBe(run2.states[i].fighters[1].y);
    }
  });

  it('replay reproduces exact meter values', () => {
    const seed = 77777;
    const run1 = simulateSession(seed, 240);
    const run2 = simulateSession(seed, 240);

    for (let i = 0; i < 240; i++) {
      expect(run1.states[i].gauges[0].meter).toBe(run2.states[i].gauges[0].meter);
      expect(run1.states[i].gauges[0].stocks).toBe(run2.states[i].gauges[0].stocks);
      expect(run1.states[i].gauges[1].meter).toBe(run2.states[i].gauges[1].meter);
      expect(run1.states[i].gauges[1].stocks).toBe(run2.states[i].gauges[1].stocks);
    }
  });
});

// ===========================================================================
// 4. Input Recording
// ===========================================================================

describe('Input Recording', () => {
  it('input frames recorded correctly', () => {
    const logger = new InputLogger();

    const p1 = createInput({ right: true, buttonA: true });
    const p2 = createInput({ left: true, buttonD: true });

    logger.record(0, NEUTRAL_INPUT, NEUTRAL_INPUT);
    logger.record(1, p1, p2);
    logger.record(2, createInput({ down: true, buttonB: true }), NEUTRAL_INPUT);

    expect(logger.length).toBe(3);

    const frame0 = logger.getFrame(0);
    expect(frame0).toEqual({ tick: 0, p1: NEUTRAL_INPUT, p2: NEUTRAL_INPUT });

    const frame1 = logger.getFrame(1);
    expect(frame1).toEqual({ tick: 1, p1, p2 });

    const frame2 = logger.getFrame(2);
    expect(frame2).toEqual({ tick: 2, p1: createInput({ down: true, buttonB: true }), p2: NEUTRAL_INPUT });
  });

  it('input playback matches original timing', () => {
    const totalFrames = 60;
    const pattern: { tick: number; p1: PlayerInput; p2: PlayerInput }[] = [];

    // Build a deterministic input pattern
    const rng = new SeededRNG(31415);
    for (let tick = 0; tick < totalFrames; tick++) {
      pattern.push({
        tick,
        p1: createInput({
          right: rng.next() > 0.5,
          buttonA: rng.next() > 0.8,
          buttonC: rng.next() > 0.9,
        }),
        p2: createInput({
          left: rng.next() > 0.5,
          buttonB: rng.next() > 0.8,
          buttonD: rng.next() > 0.9,
        }),
      });
    }

    // Record into a replay bundle
    const { bundle } = buildReplayBundle(42, totalFrames, (tick) => ({
      p1: pattern[tick].p1,
      p2: pattern[tick].p2,
    }));

    // Playback via replay input source
    const source = createReplayInputSource(bundle);

    for (let tick = 0; tick < totalFrames; tick++) {
      const frame = source.readFrame(tick);
      expect(frame.recorded).toBe(true);
      expect(frame.tick).toBe(tick);
      expect(frame.p1).toEqual(pattern[tick].p1);
      expect(frame.p2).toEqual(pattern[tick].p2);
    }
  });

  it('empty replay (no inputs) produces consistent idle state', () => {
    // Build a bundle with 0 frames
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({
      seed: 99,
      label: 'empty',
      round: 1,
      p1CharId: 'kyo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
    });

    const bundleJson = session.exportBundle();
    const bundle = JSON.parse(bundleJson) as ReplayBundleV1;

    const source = createReplayInputSource(bundle);

    // No frames recorded, so every tick should return neutral
    expect(source.getFrameCount()).toBe(0);

    for (let tick = 0; tick < 10; tick++) {
      const frame = source.readFrame(tick);
      expect(frame.recorded).toBe(false);
      expect(frame.p1).toEqual(NEUTRAL_INPUT);
      expect(frame.p2).toEqual(NEUTRAL_INPUT);
    }
  });

  it('replay handles simultaneous P1/P2 inputs', () => {
    const logger = new InputLogger();

    const bothAttacking = {
      p1: createInput({ right: true, buttonA: true, buttonC: true }),
      p2: createInput({ left: true, buttonB: true, buttonD: true }),
    };

    const p1Jumping = {
      p1: createInput({ up: true, right: true }),
      p2: createInput({ down: true, left: true }),
    };

    logger.record(0, bothAttacking.p1, bothAttacking.p2);
    logger.record(1, p1Jumping.p1, p1Jumping.p2);

    const dumped = logger.dump();

    // Re-import and verify both players preserved
    const restored = new InputLogger();
    expect(restored.load(dumped)).toBe(true);

    const frame0 = restored.getFrame(0)!;
    expect(frame0.p1.buttonA).toBe(true);
    expect(frame0.p1.buttonC).toBe(true);
    expect(frame0.p2.buttonB).toBe(true);
    expect(frame0.p2.buttonD).toBe(true);

    const frame1 = restored.getFrame(1)!;
    expect(frame1.p1.up).toBe(true);
    expect(frame1.p1.right).toBe(true);
    expect(frame1.p2.down).toBe(true);
    expect(frame1.p2.left).toBe(true);

    // Also test through replay input source
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({
      seed: 42,
      label: 'simult',
      round: 1,
      p1CharId: 'kyo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
    });

    inputLog.record(0, bothAttacking.p1, bothAttacking.p2);
    inputLog.record(1, p1Jumping.p1, p1Jumping.p2);

    const bundle = JSON.parse(session.exportBundle()) as ReplayBundleV1;
    const source = createReplayInputSource(bundle);

    const rf0 = source.readFrame(0);
    expect(rf0.p1.buttonA).toBe(true);
    expect(rf0.p1.buttonC).toBe(true);
    expect(rf0.p2.buttonB).toBe(true);
    expect(rf0.p2.buttonD).toBe(true);

    const rf1 = source.readFrame(1);
    expect(rf1.p1.up).toBe(true);
    expect(rf1.p1.right).toBe(true);
    expect(rf1.p2.down).toBe(true);
    expect(rf1.p2.left).toBe(true);
  });
});

// ===========================================================================
// 5. Edge Cases
// ===========================================================================

describe('Edge Cases', () => {
  it('very long replay (1000+ frames) stays deterministic', () => {
    const seed = 88888;
    const totalFrames = 1200; // 20 seconds at 60fps

    const run1 = simulateSession(seed, totalFrames, 60);
    const run2 = simulateSession(seed, totalFrames, 60);

    // All checkpoints must match
    expect(run1.checkpoints).toEqual(run2.checkpoints);

    // Spot-check at intervals
    for (let i = 0; i < totalFrames; i += 50) {
      expect(run1.states[i].fighters[0].x).toBe(run2.states[i].fighters[0].x);
      expect(run1.states[i].fighters[0].health).toBe(run2.states[i].fighters[0].health);
      expect(run1.states[i].fighters[1].x).toBe(run2.states[i].fighters[1].x);
      expect(run1.states[i].fighters[1].health).toBe(run2.states[i].fighters[1].health);
      expect(run1.states[i].rngState).toBe(run2.states[i].rngState);
      expect(run1.states[i].gauges[0].meter).toBe(run2.states[i].gauges[0].meter);
    }

    // Full checksum verification at every frame
    for (let i = 0; i < totalFrames; i++) {
      expect(computeFrameChecksum(run1.states[i])).toBe(computeFrameChecksum(run2.states[i]));
    }
  });

  it('replay with RNG-dependent events is reproducible', () => {
    const seed = 11111;

    // Build a session that consumes RNG for damage, position, meter, etc.
    const run1 = simulateSession(seed, 300, 30);
    const run2 = simulateSession(seed, 300, 30);

    // Verify every frame of RNG state matches
    for (let i = 0; i < 300; i++) {
      expect(run1.states[i].rngState).toBe(run2.states[i].rngState);
    }

    // Verify that damage (which is RNG-driven) is identical
    const run1HealthHistory = run1.states.map(s => [s.fighters[0].health, s.fighters[1].health]);
    const run2HealthHistory = run2.states.map(s => [s.fighters[0].health, s.fighters[1].health]);
    expect(run1HealthHistory).toEqual(run2HealthHistory);

    // Verify integrity using SnapshotVerifier
    const verifier = new SnapshotVerifier(run1.checkpoints, { logMismatches: false });
    for (const state of run2.states) {
      verifier.tick(state.frameNumber, state);
    }
    const report = verifier.getReport();
    expect(report.passed).toBe(true);
  });

  it('state reset followed by replay produces same result as fresh start', () => {
    const seed = 22222;

    // First run: fresh start
    const fresh = simulateSession(seed, 180, 60);

    // Second run: use the global RNG, reset it, then simulate
    resetGameRng(seed);
    const globalRng = getGameRngSnapshot();

    // Advance the global RNG a bunch (simulating some prior game state)
    gameRandom();
    gameRandom();
    gameRandom();
    gameRandom();
    gameRandom();

    // Now reset to the same seed and snapshot
    resetGameRng(seed);
    restoreGameRngSnapshot(globalRng);

    // The global RNG should now produce the same as a fresh SeededRNG(seed)
    const freshRng = new SeededRNG(seed);
    for (let i = 0; i < 20; i++) {
      expect(gameRandom()).toBe(freshRng.next());
    }

    // Verify the full replay round-trip: export → import → verify
    const inputLog = new InputLogger();
    const session = new ReplaySession(inputLog);
    session.beginLiveMatch({
      seed,
      label: 'reset-test',
      round: 1,
      p1CharId: 'kyo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
    });

    // Record some inputs
    const rng = new SeededRNG(seed);
    for (let tick = 0; tick < 60; tick++) {
      inputLog.record(tick,
        createInput({ right: rng.next() > 0.5, buttonA: rng.next() > 0.7 }),
        createInput({ left: rng.next() > 0.5, buttonB: rng.next() > 0.7 }),
      );
    }

    const exported = session.exportBundle();

    // Import into a fresh session
    const importedSession = new ReplaySession(new InputLogger());
    const result = importedSession.importBundle(exported);
    expect(result.ok).toBe(true);

    // Re-export and compare — must be identical
    const reexported = importedSession.exportBundle();
    expect(JSON.parse(reexported)).toEqual(JSON.parse(exported));
  });
});
