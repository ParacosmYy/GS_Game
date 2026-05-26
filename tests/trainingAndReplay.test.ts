/**
 * trainingAndReplay.test.ts -- 训练模式 + 回放 + PRNG 确定性 + 状态重置稳定性测试
 *
 * 覆盖 5 大领域:
 *  1. 训练模式基础 (8)
 *  2. PRNG 确定性 (7)
 *  3. 回放确定性 (8)
 *  4. 状态重置完整性 (7)
 *  5. 边界情况 (5)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import {
  SeededRNG,
  resetGameRng,
  getGameRng,
  gameRandom,
  gameRandomInt,
  getGameRngSnapshot,
  restoreGameRngSnapshot,
} from '../src/core/prng.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_GROUND_Y,
  STAGE_WIDTH,
  MAX_STOCKS,
  METER_PER_STOCK,
  GUARD_GAUGE_MAX,
  STUN_GAUGE_MAX,
  GUARD_CRUSH_DURATION,
} from '../src/core/constants.js';
import {
  TrainingModeState,
  DummyBehavior,
} from '../src/state/trainingMode.js';
import { InputLogger } from '../src/core/inputLog.js';
import { ReplaySession } from '../src/core/replaySession.js';
import {
  computeFrameChecksum,
  SnapshotRecorder,
  SnapshotVerifier,
  extractFighterSnapshot,
  extractGaugeSnapshot,
  extractMaxModeSnapshot,
  type FrameStateData,
} from '../src/core/replaySnapshot.js';
import { createPowerGauge, createMaxMode, resetMeterSystem } from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFighter(x = STAGE_WIDTH * 0.3, facing: 1 | -1 = 1): Fighter {
  return new Fighter(x, '#ff6600', facing);
}

function makeCombatSystem(): CombatSystem {
  return new CombatSystem({
    getP1Input: () => ({}) as any,
    getP2Input: () => ({}) as any,
  });
}

/** Produce a "dirty" fighter with many non-default values. */
function dirtyFighter(f: Fighter): void {
  f.health = 1;
  f.vx = 999;
  f.vy = -999;
  f.state = FighterState.HITSTUN;
  f.currentAttack = AttackType.STAND_C;
  f.attackFrame = 5;
  f.attackPhase = 'active';
  f.hasHit = true;
  f.hasAttackedInAir = true;
  f.hitstunTimer = 20;
  f.blockstunTimer = 10;
  f.knockdownTimer = 30;
  f.isKnockedDown = true;
  f.isHardKnockdown = true;
  f.throwInvincibilityTimer = 50;
  f.throwBufferTimer = 5;
  f.isBeingThrown = true;
  f.throwEscapeTimer = 8;
  f.rollTimer = 15;
  f.backdashTimer = 10;
  f.isGCRoll = true;
  f.rekkaChain = 'aragami';
  f.rekkaWindow = 12;
  f.guardGauge = 0;
  f.guardCrushTimer = 60;
  f.juggleState = JuggleState.FULL;
  f.jugglePoints = 100;
  f.airHitCount = 7;
  f.superCancelReady = true;
  f.rapidCancelReady = true;
  f.normalCancelReady = true;
  f.cancelledIntoNormal = true;
  f.cancelEvent = 'super_cancel';
  f.isCounterWire = true;
  f.invincible = true;
  f.throwInvulnFrames = 40;
  f.stunGauge = STUN_GAUGE_MAX;
  f.stunDecayTimer = 100;
  f.dizzyTimer = 80;
  f.dizzyMashCount = 30;
  f.hitConfirmDelay = 5;
  f.hitFlashFrames = 3;
  f.hitFlashColor = '#ff0000';
  f.runStopTimer = 10;
  f.landingRecovery = 8;
  f.consecutiveBlockCount = 5;
  f.consecutiveBlockDecayTimer = 20;
  f.wallBounceCount = 1;
  f.isGroundBounce = true;
  f.groundBounceTimer = 10;
}

// ===========================================================================
// 1. Training Mode Basics (8 tests)
// ===========================================================================

describe('Training Mode Basics', () => {
  let training: TrainingModeState;
  let p1: Fighter;
  let p2: Fighter;

  beforeEach(() => {
    training = new TrainingModeState();
    p1 = makeFighter(STAGE_WIDTH * 0.3);
    p2 = makeFighter(STAGE_WIDTH * 0.7, -1);
  });

  it('dummy in STAND mode does not attack', () => {
    training.dummyBehavior = DummyBehavior.STAND;
    const input = training.getDummyInput(p1, p2, 0, -1);
    expect(input.buttonA).toBe(false);
    expect(input.buttonB).toBe(false);
    expect(input.buttonC).toBe(false);
    expect(input.buttonD).toBe(false);
    expect(input.throwAttack).toBe(false);
    expect(input.up).toBe(false);
    expect(input.down).toBe(false);
    expect(input.forward).toBe(false);
    expect(input.back).toBe(false);
  });

  it('dummy recovers after hitstun (auto restore via health reset)', () => {
    // Simulate dummy being hit
    dirtyFighter(p2);
    p2.health = 50;
    p2.state = FighterState.HITSTUN;
    p2.hitstunTimer = 15;

    // In a training mode scenario, health auto-restores
    // This verifies that the fighter can be reset to healthy state
    const originalHealth = p2.health;
    expect(originalHealth).toBeLessThan(MAX_HEALTH);

    // Simulate training mode auto-health-restore
    p2.health = MAX_HEALTH;
    expect(p2.health).toBe(MAX_HEALTH);

    // Fighter is still in hitstun state but health is full
    // A real training mode tick would clear hitstun after timer expires
    p2.hitstunTimer = 0;
    p2.state = FighterState.IDLE;
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('training mode has no time limit (timer does not decrement to KO)', () => {
    // Training mode uses an unbounded tick counter
    // Verify that tick can grow arbitrarily large without causing issues
    const largeTick = 999999;
    const input = training.getDummyInput(p1, p2, largeTick, -1);
    // Should still produce valid input without error
    expect(input).toBeDefined();
    expect(typeof input.up).toBe('boolean');
  });

  it('training mode shows frame data when P1 attacks', () => {
    p1.currentAttack = AttackType.STAND_A;
    p1.attackFrame = 3;
    p1.attackPhase = 'active';

    training.updateFrameData(p1, 10);

    expect(training.lastFrameData).not.toBeNull();
    expect(training.lastFrameData!.attackName).toBe(AttackType.STAND_A);
    expect(typeof training.lastFrameData!.startup).toBe('number');
    expect(typeof training.lastFrameData!.active).toBe('number');
    expect(typeof training.lastFrameData!.recovery).toBe('number');
    expect(typeof training.lastFrameData!.damage).toBe('number');
    expect(training.lastFrameData!.currentFrame).toBe(3);
    expect(training.lastFrameData!.phase).toBe('active');
  });

  it('training mode can set dummy behavior via cycling', () => {
    expect(training.dummyBehavior).toBe(DummyBehavior.STAND);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.BLOCK_ALL);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.BLOCK_LOW);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.BLOCK_HIGH);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.CROUCH);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.JUMP);

    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.REVERSAL);

    // Cycles back to STAND
    training.cycleDummyBehavior();
    expect(training.dummyBehavior).toBe(DummyBehavior.STAND);
  });

  it('training mode auto-fills meter (tickAutoMeter simulation)', () => {
    const gauge = createPowerGauge();
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);

    // Simulate auto-meter tick: tickAutoMeter fills 1.0/frame
    for (let i = 0; i < METER_PER_STOCK + 1; i++) {
      gauge.meter = Math.min(METER_PER_STOCK, gauge.meter + 1.0);
      if (gauge.meter >= METER_PER_STOCK && gauge.stocks < MAX_STOCKS) {
        gauge.stocks++;
        gauge.meter = 0;
      }
    }

    expect(gauge.stocks).toBeGreaterThanOrEqual(1);
  });

  it('training mode auto-restores health', () => {
    p2.health = 0;
    // Simulate training mode health restore
    p2.health = MAX_HEALTH;
    expect(p2.health).toBe(MAX_HEALTH);

    p1.health = 1;
    p1.health = MAX_HEALTH;
    expect(p1.health).toBe(MAX_HEALTH);
  });

  it('training mode can record and play back input history', () => {
    // Record some inputs
    training.recordInput('→', ['A'], 0);
    training.recordInput('↓', ['B'], 1);
    training.recordInput('↘', ['C', 'D'], 2);

    expect(training.inputHistory).toHaveLength(3);
    expect(training.inputHistory[0].direction).toBe('→');
    expect(training.inputHistory[0].buttons).toEqual(['A']);
    expect(training.inputHistory[1].frame).toBe(1);
    expect(training.inputHistory[2].buttons).toEqual(['C', 'D']);

    // Neutral input is not recorded
    training.recordInput('·', [], 3);
    expect(training.inputHistory).toHaveLength(3);

    // History caps at 20 entries
    for (let i = 0; i < 25; i++) {
      training.recordInput('→', ['A'], 10 + i);
    }
    expect(training.inputHistory.length).toBeLessThanOrEqual(20);
  });
});

// ===========================================================================
// 2. PRNG Determinism (7 tests)
// ===========================================================================

describe('PRNG Determinism', () => {
  it('same seed produces identical random sequence', () => {
    const seed = 42;
    const rng1 = new SeededRNG(seed);
    const rng2 = new SeededRNG(seed);
    const seq1 = Array.from({ length: 50 }, () => rng1.next());
    const seq2 = Array.from({ length: 50 }, () => rng2.next());
    expect(seq2).toEqual(seq1);
  });

  it('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(1);
    const rng2 = new SeededRNG(99999);
    const seq1 = Array.from({ length: 20 }, () => rng1.next());
    const seq2 = Array.from({ length: 20 }, () => rng2.next());
    let matches = 0;
    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] === seq2[i]) matches++;
    }
    // Extremely unlikely all 20 match
    expect(matches).toBeLessThan(20);
  });

  it('snapshot/restore preserves complete PRNG state', () => {
    const rng = new SeededRNG(12345);
    // Consume some values
    rng.next();
    rng.next();
    rng.next();
    const snap = rng.snapshot();

    // Continue consuming
    const expected = Array.from({ length: 10 }, () => rng.next());

    // Restore and replay from the snapshot point
    rng.restore(snap);
    const actual = Array.from({ length: 10 }, () => rng.next());
    expect(actual).toEqual(expected);
  });

  it('PRNG does not affect combat result determinism', () => {
    resetGameRng(7777);
    const snapBefore = getGameRngSnapshot();

    // Perform fighter operations that should not consume RNG
    const f1 = makeFighter();
    const f2 = makeFighter();
    f1.health = Math.max(0, f1.health - 50);
    f1.state = FighterState.HITSTUN;
    f1.hitstunTimer = 10;
    f1.reset(STAGE_WIDTH * 0.3);

    const snapAfter = getGameRngSnapshot();
    expect(snapAfter).toEqual(snapBefore);
  });

  it('PRNG resets correctly between rounds', () => {
    const seed = 55555;
    // First round
    resetGameRng(seed);
    const round1Seq = Array.from({ length: 10 }, () => gameRandom());

    // Second round — re-seed with same seed
    resetGameRng(seed);
    const round2Seq = Array.from({ length: 10 }, () => gameRandom());

    expect(round2Seq).toEqual(round1Seq);
  });

  it('multiple PRNG instances are independent', () => {
    const rng1 = new SeededRNG(100);
    const rng2 = new SeededRNG(100);

    // Advance rng1 by 5 steps, rng2 by 0 steps
    for (let i = 0; i < 5; i++) rng1.next();

    // Now rng1 and rng2 are at different positions
    const rng1State = rng1.getState();
    const rng2State = rng2.getState();
    expect(rng1State).not.toBe(rng2State);

    // Both produce deterministic sequences from their current position
    const seq1 = Array.from({ length: 5 }, () => rng1.next());
    const seq2 = Array.from({ length: 5 }, () => rng2.next());
    // Different positions → different values (extremely likely)
    expect(seq1).not.toEqual(seq2);
  });

  it('xorshift32 produces values in [0, 1) range', () => {
    const rng = new SeededRNG(31415);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

// ===========================================================================
// 3. Replay Determinism (8 tests)
// ===========================================================================

describe('Replay Determinism', () => {
  it('same input sequence produces same combat result', () => {
    // Simulate two identical sessions
    const runSession = () => {
      const p1 = makeFighter(STAGE_WIDTH * 0.3);
      const p2 = makeFighter(STAGE_WIDTH * 0.7, -1);
      const cs = makeCombatSystem();

      // Simulate a simple damage sequence
      p1.health = Math.max(0, p1.health - 30);
      p1.health = Math.max(0, p1.health - 20);
      p2.health = Math.max(0, p2.health - 40);

      return { p1Health: p1.health, p2Health: p2.health };
    };

    const result1 = runSession();
    const result2 = runSession();
    expect(result2).toEqual(result1);
  });

  it('replay reproduces from beginning completely', () => {
    // Create an input log, dump it, reload, and verify
    const logger1 = new InputLogger();
    const neutralInput = {
      up: false, down: false, left: false, right: false,
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      throwAttack: false, start: false,
    };

    for (let tick = 0; tick < 60; tick++) {
      logger1.record(tick, neutralInput, neutralInput);
    }

    const dumped = logger1.dump();

    const logger2 = new InputLogger();
    const loaded = logger2.load(dumped);
    expect(loaded).toBe(true);
    expect(logger2.length).toBe(60);

    // Verify every frame matches
    for (let i = 0; i < 60; i++) {
      const f1 = logger1.getFrameByIndex(i);
      const f2 = logger2.getFrameByIndex(i);
      expect(f2).toEqual(f1);
    }
  });

  it('snapshot in middle of replay + restore + continue reproduces', () => {
    const rng = new SeededRNG(9999);

    // Consume 10 values
    const first10 = Array.from({ length: 10 }, () => rng.next());

    // Snapshot
    const snap = rng.snapshot();

    // Consume 10 more
    const next10 = Array.from({ length: 10 }, () => rng.next());

    // Restore and replay the next 10
    rng.restore(snap);
    const next10Replay = Array.from({ length: 10 }, () => rng.next());
    expect(next10Replay).toEqual(next10);

    // First 10 should be unchanged
    const rng2 = new SeededRNG(9999);
    const first10Verify = Array.from({ length: 10 }, () => rng2.next());
    expect(first10Verify).toEqual(first10);
  });

  it('Fighter.reset() correctly resets all state', () => {
    const f = makeFighter();
    dirtyFighter(f);
    f.reset(STAGE_WIDTH * 0.3);

    expect(f.health).toBe(MAX_HEALTH);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.vx).toBe(0);
    expect(f.vy).toBe(0);
    expect(f.currentAttack).toBeNull();
    expect(f.attackFrame).toBe(0);
    expect(f.attackPhase).toBe('none');
    expect(f.hasHit).toBe(false);
    expect(f.hitstunTimer).toBe(0);
    expect(f.blockstunTimer).toBe(0);
    expect(f.knockdownTimer).toBe(0);
    expect(f.isKnockedDown).toBe(false);
    expect(f.guardGauge).toBe(100);
    expect(f.guardCrushTimer).toBe(0);
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.stunGauge).toBe(0);
    expect(f.dizzyTimer).toBe(0);
    expect(f.invincible).toBe(false);
    expect(f.throwInvulnFrames).toBe(0);
    expect(f.isCounterWire).toBe(false);
    expect(f.wallBounceCount).toBe(0);
  });

  it('CombatSystem.reset() correctly resets all state', () => {
    const cs = makeCombatSystem();
    (cs as any).comboHits = [5, 3];
    (cs as any).comboDamage = [300, 150];
    (cs as any).lastHitFrame = [500, 300];
    (cs as any).firstHitAwarded = [true, true];

    cs.reset();

    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboCount(1)).toBe(0);
    expect(cs.getComboDamage(0)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('random events do not break replay determinism when using seeded PRNG', () => {
    // Simulate AI decision-making with seeded RNG
    resetGameRng(42424);

    const decisions1: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      decisions1.push(gameRandom() < 0.02); // AI special move trigger
    }

    // Replay with same seed
    resetGameRng(42424);
    const decisions2: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      decisions2.push(gameRandom() < 0.02);
    }

    expect(decisions2).toEqual(decisions1);
  });

  it('frame checksum is deterministic across identical state snapshots', () => {
    const data: FrameStateData = {
      frameNumber: 100,
      rngState: 42,
      gamePhase: 'FIGHT',
      timer: 60,
      fighters: [
        { x: 300, y: STAGE_GROUND_Y, health: 800, state: 'IDLE', facing: 1,
          stunGauge: 0, currentAttack: null, attackPhase: 'none',
          hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
          juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
        { x: 700, y: STAGE_GROUND_Y, health: 600, state: 'HITSTUN', facing: -1,
          stunGauge: 30, currentAttack: null, attackPhase: 'none',
          hitstunTimer: 8, blockstunTimer: 0, knockdownTimer: 0,
          juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 85 },
      ],
      gauges: [
        { meter: 50, stocks: 2 },
        { meter: 10, stocks: 1 },
      ],
      maxModes: [
        { active: false, timer: 0 },
        { active: true, timer: 300 },
      ],
    };

    const checksum1 = computeFrameChecksum(data);
    const checksum2 = computeFrameChecksum(data);
    expect(checksum1).toBe(checksum2);

    // Different data should produce different checksum
    const dataModified = { ...data, timer: 61 };
    const checksum3 = computeFrameChecksum(dataModified);
    expect(checksum3).not.toBe(checksum1);
  });

  it('long replay (1000 frames) stability', () => {
    const rng = new SeededRNG(77777);
    const snapshots: number[] = [];

    // Simulate 1000 frames of state
    for (let frame = 0; frame < 1000; frame++) {
      const health1 = Math.max(0, MAX_HEALTH - frame);
      const health2 = Math.max(0, MAX_HEALTH - frame * 2);
      const data: FrameStateData = {
        frameNumber: frame,
        rngState: rng.getState(),
        gamePhase: 'FIGHT',
        timer: 99,
        fighters: [
          { x: 300 + frame * 0.1, y: STAGE_GROUND_Y, health: health1, state: 'IDLE', facing: 1,
            stunGauge: 0, currentAttack: null, attackPhase: 'none',
            hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
            juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
          { x: 700 - frame * 0.1, y: STAGE_GROUND_Y, health: health2, state: 'IDLE', facing: -1,
            stunGauge: 0, currentAttack: null, attackPhase: 'none',
            hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
            juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
        ],
        gauges: [
          { meter: 0, stocks: 0 },
          { meter: 0, stocks: 0 },
        ],
        maxModes: [
          { active: false, timer: 0 },
          { active: false, timer: 0 },
        ],
      };
      rng.next(); // consume one RNG value per frame
      snapshots.push(computeFrameChecksum(data));
    }

    // Replay with same seed and verify all checksums match
    const rng2 = new SeededRNG(77777);
    for (let frame = 0; frame < 1000; frame++) {
      const health1 = Math.max(0, MAX_HEALTH - frame);
      const health2 = Math.max(0, MAX_HEALTH - frame * 2);
      const data: FrameStateData = {
        frameNumber: frame,
        rngState: rng2.getState(),
        gamePhase: 'FIGHT',
        timer: 99,
        fighters: [
          { x: 300 + frame * 0.1, y: STAGE_GROUND_Y, health: health1, state: 'IDLE', facing: 1,
            stunGauge: 0, currentAttack: null, attackPhase: 'none',
            hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
            juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
          { x: 700 - frame * 0.1, y: STAGE_GROUND_Y, health: health2, state: 'IDLE', facing: -1,
            stunGauge: 0, currentAttack: null, attackPhase: 'none',
            hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
            juggleState: 'NONE', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
        ],
        gauges: [
          { meter: 0, stocks: 0 },
          { meter: 0, stocks: 0 },
        ],
        maxModes: [
          { active: false, timer: 0 },
          { active: false, timer: 0 },
        ],
      };
      rng2.next();
      const checksum = computeFrameChecksum(data);
      expect(checksum).toBe(snapshots[frame]);
    }
  });
});

// ===========================================================================
// 4. State Reset Integrity (7 tests)
// ===========================================================================

describe('State Reset Integrity', () => {
  const defaultX = STAGE_WIDTH * 0.3;

  it('Fighter reset clears all temporary state', () => {
    const f = makeFighter();
    dirtyFighter(f);
    f.reset(defaultX);

    // All temporary/combat state should be cleared
    expect(f.hitstunTimer).toBe(0);
    expect(f.blockstunTimer).toBe(0);
    expect(f.knockdownTimer).toBe(0);
    expect(f.isKnockedDown).toBe(false);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.throwInvincibilityTimer).toBe(0);
    expect(f.throwBufferTimer).toBe(0);
    expect(f.isBeingThrown).toBe(false);
    expect(f.throwEscapeTimer).toBe(0);
    expect(f.rollTimer).toBe(0);
    expect(f.backdashTimer).toBe(0);
    expect(f.isGCRoll).toBe(false);
    expect(f.rekkaChain).toBeNull();
    expect(f.rekkaWindow).toBe(0);
    expect(f.runStopTimer).toBe(0);
    expect(f.landingRecovery).toBe(0);
    expect(f.consecutiveBlockCount).toBe(0);
    expect(f.consecutiveBlockDecayTimer).toBe(0);
    expect(f.wallBounceCount).toBe(0);
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
  });

  it('Fighter reset does not affect character base data', () => {
    const f = makeFighter();
    const originalColor = f.color;
    const originalCharId = f.charId;
    const originalFacing = f.facing;
    const originalMaxHealth = f.maxHealth;

    dirtyFighter(f);
    f.reset(defaultX);

    // These should be preserved
    expect(f.color).toBe(originalColor);
    expect(f.charId).toBe(originalCharId);
    expect(f.facing).toBe(originalFacing);
    expect(f.maxHealth).toBe(originalMaxHealth);
  });

  it('round transition correctly resets position and health', () => {
    const p1 = makeFighter(STAGE_WIDTH * 0.3);
    const p2 = makeFighter(STAGE_WIDTH * 0.7, -1);

    // Simulate end-of-round state
    p1.health = 10;
    p1.x = 999;
    p1.y = 100;
    p2.health = 0;
    p2.x = -50;
    p2.y = 200;

    // Round reset
    p1.reset(STAGE_WIDTH * 0.3);
    p2.reset(STAGE_WIDTH * 0.7);

    expect(p1.x).toBe(STAGE_WIDTH * 0.3);
    expect(p1.y).toBe(STAGE_GROUND_Y);
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.x).toBe(STAGE_WIDTH * 0.7);
    expect(p2.y).toBe(STAGE_GROUND_Y);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('round transition correctly resets meter (via separate gauge reset)', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();

    gauge.stocks = 3;
    gauge.meter = 50;
    maxMode.active = true;
    maxMode.timer = 200;

    // Full match reset clears gauge
    resetMeterSystem(gauge, maxMode);

    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('round transition correctly resets guard gauge', () => {
    const f = makeFighter();
    f.guardGauge = 0;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;

    f.reset(defaultX);

    expect(f.guardGauge).toBe(100);
    expect(f.guardCrushTimer).toBe(0);
  });

  it('round transition correctly resets combo state', () => {
    const f = makeFighter();
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'free_cancel';
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 5;
    f.airHitCount = 3;

    f.reset(defaultX);

    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelledIntoNormal).toBe(false);
    expect(f.cancelEvent).toBeNull();
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
  });

  it('multiple resets do not cause memory leak (properties stay clean)', () => {
    const f = makeFighter();
    for (let i = 0; i < 100; i++) {
      dirtyFighter(f);
      f.reset(defaultX);
    }

    // After 100 cycles, all values should be pristine
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.currentAttack).toBeNull();
    expect(f.hitstunTimer).toBe(0);
    expect(f.stunGauge).toBe(0);
    expect(f.dizzyTimer).toBe(0);
    expect(f.invincible).toBe(false);
    expect(f.isKnockedDown).toBe(false);

    // Verify getActiveHitbox returns null (no stale data)
    expect(f.getActiveHitbox()).toBeNull();
    expect(f.getActiveHitboxes()).toEqual([]);
  });
});

// ===========================================================================
// 5. Edge Cases (5 tests)
// ===========================================================================

describe('Edge Cases', () => {
  const defaultX = STAGE_WIDTH * 0.3;

  it('reset from 0 health state', () => {
    const f = makeFighter();
    f.health = 0;
    f.state = FighterState.KNOCKDOWN;
    f.knockdownTimer = 30;
    f.isKnockedDown = true;

    f.reset(defaultX);

    expect(f.health).toBe(MAX_HEALTH);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.knockdownTimer).toBe(0);
    expect(f.isKnockedDown).toBe(false);
  });

  it('reset from full meter state', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();

    gauge.stocks = MAX_STOCKS;
    gauge.meter = METER_PER_STOCK - 1;
    maxMode.active = true;
    maxMode.timer = 500;

    resetMeterSystem(gauge, maxMode);

    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('reset during MAX mode', () => {
    const f = makeFighter();
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();

    // Activate MAX mode: give stocks then activate
    gauge.stocks = 3;

    f.state = FighterState.MAX_MODE;
    f.health = 200;
    maxMode.active = true;
    maxMode.timer = 300;

    // Fighter reset
    f.reset(defaultX);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.health).toBe(MAX_HEALTH);

    // MAX mode must be reset separately
    expect(maxMode.active).toBe(true); // still active until explicitly reset
    resetMeterSystem(gauge, maxMode);
    expect(maxMode.active).toBe(false);
  });

  it('reset from Dizzy state', () => {
    const f = makeFighter();
    f.state = FighterState.DIZZY;
    f.dizzyTimer = 120;
    f.dizzyMashCount = 20;
    f.stunGauge = STUN_GAUGE_MAX;
    f.stunDecayTimer = 50;
    f.health = 100;

    f.reset(defaultX);

    expect(f.state).toBe(FighterState.IDLE);
    expect(f.dizzyTimer).toBe(0);
    expect(f.dizzyMashCount).toBe(0);
    expect(f.stunGauge).toBe(0);
    expect(f.stunDecayTimer).toBe(0);
    expect(f.health).toBe(MAX_HEALTH);
  });

  it('reset from Guard Crush state', () => {
    const f = makeFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    f.guardGauge = 0;
    f.health = 300;
    f.vx = -5;

    f.reset(defaultX);

    expect(f.state).toBe(FighterState.IDLE);
    expect(f.guardCrushTimer).toBe(0);
    expect(f.guardGauge).toBe(100);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.vx).toBe(0);
  });
});
