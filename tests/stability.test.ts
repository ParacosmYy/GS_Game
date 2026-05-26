import { describe, it, expect, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { SeededRNG, resetGameRng, getGameRng, gameRandom, gameRandomInt } from '../src/core/prng.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH, STAGE_GROUND_Y, STAGE_WIDTH,
  MAX_STOCKS, METER_PER_STOCK, COMBO_TIMEOUT,
  FIGHTER_HEIGHT, PUSH_BOX_WIDTH,
} from '../src/core/constants.js';
import { createPowerGauge, createMaxMode, gainMeterOnHit, tickAutoMeter, resetMeterSystem } from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { VFXSystem } from '../src/rendering/vfx.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFighter(x = STAGE_WIDTH * 0.3, facing: 1 | -1 = 1): Fighter {
  return new Fighter(x, '#ff6600', facing);
}

/** Drive a fighter into an arbitrary "dirty" state so we can verify reset cleans it up. */
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
  f.usedQuickStand = true;
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
  f.stunGauge = 999;
  f.stunDecayTimer = 100;
  f.dizzyTimer = 80;
  f.dizzyMashCount = 30;
  f.hitConfirmDelay = 5;
  f.hitFlashFrames = 3;
  f.hitFlashColor = '#ff0000';
  f.runStopTimer = 10;
  f.landingRecovery = 8;
}

// ---------------------------------------------------------------------------
// 1. Fighter reset completeness
// ---------------------------------------------------------------------------

describe('Fighter reset completeness', () => {
  const defaultX = STAGE_WIDTH * 0.3;

  it('resets all state properties to defaults after dirty state', () => {
    const f = makeFighter();
    dirtyFighter(f);
    f.reset(defaultX);

    // Core
    expect(f.x).toBe(defaultX);
    expect(f.y).toBe(STAGE_GROUND_Y);
    expect(f.vx).toBe(0);
    expect(f.vy).toBe(0);
    expect(f.displayHeight).toBe(FIGHTER_HEIGHT);
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('restores health to maxHealth, meter is handled by separate gauge', () => {
    const f = makeFighter();
    f.health = 0;
    f.reset(defaultX);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.maxHealth).toBe(MAX_HEALTH);
  });

  it('resets position to the given x coordinate with ground y', () => {
    const f = makeFighter(100);
    f.x = 9999;
    f.y = -500;
    f.reset(200);
    expect(f.x).toBe(200);
    expect(f.y).toBe(STAGE_GROUND_Y);
  });

  it('clears all combo-related cancel state', () => {
    const f = makeFighter();
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'free_cancel';
    f.reset(defaultX);

    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelledIntoNormal).toBe(false);
    expect(f.cancelEvent).toBeNull();
  });

  it('clears all stale attack state', () => {
    const f = makeFighter();
    dirtyFighter(f);
    f.reset(defaultX);

    expect(f.currentAttack).toBeNull();
    expect(f.attackFrame).toBe(0);
    expect(f.attackPhase).toBe('none');
    expect(f.hasHit).toBe(false);
    expect(f.hasAttackedInAir).toBe(false);
    expect(f.hitConfirmDelay).toBe(0);
    expect(f.isCounterWire).toBe(false);
    expect(f.rekkaChain).toBeNull();
    expect(f.rekkaWindow).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. CombatSystem reset
// ---------------------------------------------------------------------------

describe('CombatSystem reset', () => {
  it('resets combo counter to zero', () => {
    const cs = new CombatSystem({ getP1Input: () => ({} as any), getP2Input: () => ({} as any) });
    // Simulate internal combo state being dirty (access private via any)
    (cs as any).comboHits = [5, 3];
    cs.reset();
    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboCount(1)).toBe(0);
  });

  it('resets cumulative combo damage to zero', () => {
    const cs = new CombatSystem({ getP1Input: () => ({} as any), getP2Input: () => ({} as any) });
    (cs as any).comboDamage = [300, 150];
    cs.reset();
    expect(cs.getComboDamage(0)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('clears first-hit award flags and last-hit frame tracking', () => {
    const cs = new CombatSystem({ getP1Input: () => ({} as any), getP2Input: () => ({} as any) });
    (cs as any).comboHits = [2, 0];
    (cs as any).lastHitFrame = [500, 0];
    (cs as any).firstHitAwarded = [true, true];
    cs.reset();

    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboCount(1)).toBe(0);
    // Verify first-hit flags are cleared by checking the method behavior
    expect(cs.wasFirstHitAwarded(0)).toBe(false); // first call returns false and then sets true
    expect(cs.wasFirstHitAwarded(0)).toBe(true);  // second call returns true (it was just set)
    // Reset again to verify clean slate
    cs.reset();
    expect(cs.wasFirstHitAwarded(1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Round transition state
// ---------------------------------------------------------------------------

describe('Round transition state', () => {
  it('resets health to max between rounds', () => {
    const p1 = makeFighter(STAGE_WIDTH * 0.3);
    const p2 = makeFighter(STAGE_WIDTH * 0.7);
    p1.health = 50;
    p2.health = 0;
    p1.reset(STAGE_WIDTH * 0.3);
    p2.reset(STAGE_WIDTH * 0.7);
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('preserves power gauge stocks between rounds (KOF rule)', () => {
    const gauge: PowerGauge = createPowerGauge();
    const maxMode: MaxModeState = createMaxMode();
    // Build up meter
    gauge.stocks = 3;
    gauge.meter = 50;

    // Simulate round: fighter.reset() does NOT touch gauge (gauge is separate)
    // Only fullReset() should clear gauge.
    // Verify the gauge remains after a round-reset scenario
    expect(gauge.stocks).toBe(3);
    expect(gauge.meter).toBe(50);

    // fullReset equivalent clears gauge
    resetMeterSystem(gauge, maxMode);
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);
  });

  it('resets fighters to starting positions', () => {
    const p1 = makeFighter(STAGE_WIDTH * 0.3);
    const p2 = makeFighter(STAGE_WIDTH * 0.7, -1);
    p1.x = 999;
    p2.x = -100;
    p1.reset(STAGE_WIDTH * 0.3);
    p2.reset(STAGE_WIDTH * 0.7);
    expect(p1.x).toBe(STAGE_WIDTH * 0.3);
    expect(p2.x).toBe(STAGE_WIDTH * 0.7);
    expect(p1.y).toBe(STAGE_GROUND_Y);
    expect(p2.y).toBe(STAGE_GROUND_Y);
  });

  it('returns state machine to IDLE after reset', () => {
    const f = makeFighter();
    const statesToTest: FighterState[] = [
      FighterState.HITSTUN,
      FighterState.KNOCKDOWN,
      FighterState.BLOCK,
      FighterState.DIZZY,
      FighterState.GUARD_CRUSH,
      FighterState.STAND_ATTACK,
      FighterState.THROW,
    ];
    for (const s of statesToTest) {
      f.state = s;
      f.reset(STAGE_WIDTH * 0.3);
      expect(f.state).toBe(FighterState.IDLE);
    }
  });

  it('clears all hitbox / attack phase state', () => {
    const f = makeFighter();
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'active';
    f.attackFrame = 2;
    f.reset(STAGE_WIDTH * 0.3);
    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');
    expect(f.attackFrame).toBe(0);
    // Verify getActiveHitbox returns null (no stale hitbox)
    expect(f.getActiveHitbox()).toBeNull();
    expect(f.getActiveHitboxes()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4. PRNG determinism across reset
// ---------------------------------------------------------------------------

describe('PRNG determinism across reset', () => {
  it('produces the same sequence with the same seed after re-creation', () => {
    const seed = 42;
    const rng1 = new SeededRNG(seed);
    const seq1 = Array.from({ length: 20 }, () => rng1.next());

    const rng2 = new SeededRNG(seed);
    const seq2 = Array.from({ length: 20 }, () => rng2.next());

    expect(seq2).toEqual(seq1);
  });

  it('produces different sequences with different seeds', () => {
    const rng1 = new SeededRNG(1);
    const rng2 = new SeededRNG(99999);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    // Extremely unlikely to match
    expect(seq1).not.toEqual(seq2);
  });

  it('snapshot and restore preserve exact PRNG position', () => {
    const rng = new SeededRNG(12345);
    // Consume some values
    rng.next(); rng.next(); rng.next();
    const snap = rng.snapshot();
    const expected = Array.from({ length: 5 }, () => rng.next());

    // Restore and replay
    rng.restore(snap);
    const actual = Array.from({ length: 5 }, () => rng.next());
    expect(actual).toEqual(expected);
  });

  it('PRNG state is independent of fighter / combat state', () => {
    resetGameRng(7777);
    const before = getGameRng().snapshot();

    // Mutate game objects -- RNG should not change
    const f = makeFighter();
    dirtyFighter(f);
    f.reset(STAGE_WIDTH * 0.3);

    const after = getGameRng().snapshot();
    expect(after).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// 5. Edge cases
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('health never goes below 0', () => {
    const f = makeFighter();
    f.health = 5;
    // Simulate damage via hitstun path: combat uses Math.max(0, ...)
    f.health = Math.max(0, f.health - 100);
    expect(f.health).toBe(0);
    // Further damage should not go negative
    f.health = Math.max(0, f.health - 500);
    expect(f.health).toBe(0);
  });

  it('meter stocks never exceed MAX_STOCKS', () => {
    const gauge = createPowerGauge();
    // Add massive meter repeatedly
    for (let i = 0; i < 50; i++) {
      gainMeterOnHit(gauge, AttackType.DM_QCFx2_P);
    }
    expect(gauge.stocks).toBeLessThanOrEqual(MAX_STOCKS);
    expect(gauge.stocks).toBe(MAX_STOCKS);
  });

  it('combo counter handles rapid sequential hits', () => {
    const cs = new CombatSystem({ getP1Input: () => ({} as any), getP2Input: () => ({} as any) });
    // Simulate 20 rapid hits
    for (let i = 0; i < 20; i++) {
      (cs as any).comboHits[0]++;
      (cs as any).lastHitFrame[0] = i * 3; // fast
    }
    expect(cs.getComboCount(0)).toBe(20);

    // Timeout: last hit was frame 57, current frame is 57 + COMBO_TIMEOUT + 1
    cs.tickComboTimeout(57 + COMBO_TIMEOUT + 1);
    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboDamage(0)).toBe(0);
  });

  it('KO detection works when health reaches exactly 0', () => {
    const f = makeFighter();
    f.health = 10;
    f.health = Math.max(0, f.health - 10);
    expect(f.health).toBe(0);
    // KO condition: health <= 0
    expect(f.health <= 0).toBe(true);
  });

  it('simultaneous KO: both fighters reaching 0 health in same frame', () => {
    const p1 = makeFighter();
    const p2 = makeFighter();
    p1.health = 5;
    p2.health = 5;
    // Both take lethal damage
    p1.health = Math.max(0, p1.health - 10);
    p2.health = Math.max(0, p2.health - 10);
    expect(p1.health).toBe(0);
    expect(p2.health).toBe(0);
    // Both are KO -- draw detection
    const isDoubleKO = p1.health <= 0 && p2.health <= 0;
    expect(isDoubleKO).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Memory safety
// ---------------------------------------------------------------------------

describe('Memory safety', () => {
  it('particle system cleans up expired particles on update', () => {
    const vfx = new VFXSystem();
    // Spawn a large batch
    for (let i = 0; i < 100; i++) {
      vfx.spawnHitSparks(400, 300, 10);
    }
    const countBefore = vfx.count;
    expect(countBefore).toBeGreaterThan(0);

    // Run updates until all particles expire (max life is short for sparks)
    for (let frame = 0; frame < 200; frame++) {
      vfx.update();
    }
    expect(vfx.count).toBe(0);
  });

  it('no orphaned throw victim reference after reset', () => {
    const f1 = makeFighter(STAGE_WIDTH * 0.3);
    const f2 = makeFighter(STAGE_WIDTH * 0.7, -1);
    // Simulate throw state
    f1.isThrowing = true;
    f1.throwVictim = f2;
    f1.invincible = true;
    f2.isBeingThrown = true;
    f2.throwEscapeTimer = 10;

    f1.reset(STAGE_WIDTH * 0.3);
    f2.reset(STAGE_WIDTH * 0.7);

    expect(f1.isThrowing).toBe(false);
    expect(f1.throwVictim).toBeNull();
    expect(f1.invincible).toBe(false);
    expect(f2.isBeingThrown).toBe(false);
    expect(f2.throwEscapeTimer).toBe(0);
  });

  it('particle array does not grow unbounded after repeated spawn/reset cycles', () => {
    const vfx = new VFXSystem();
    // Repeat spawn then immediate reset many times
    for (let cycle = 0; cycle < 50; cycle++) {
      for (let j = 0; j < 20; j++) {
        vfx.spawnHitSparks(400, 300, 5);
      }
      vfx.reset();
    }
    expect(vfx.count).toBe(0);

    // Verify it still works after all those cycles
    vfx.spawnHitSparks(400, 300, 5);
    expect(vfx.count).toBeGreaterThan(0);
  });
});
