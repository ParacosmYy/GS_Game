import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, AttackPhase, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_GROUND_Y,
  STAGE_LEFT,
  STAGE_RIGHT,
  FIGHTER_HEIGHT,
} from '../src/core/constants.js';

/** Helper: create a fresh fighter at a given x (default 400) */
function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

const VALID_ATTACK_PHASES: AttackPhase[] = ['none', 'startup', 'active', 'recovery'];

// ---------------------------------------------------------------------------
// 1. Health Invariants
// ---------------------------------------------------------------------------
describe('Fighter State Integrity — Health Invariants', () => {
  it('health >= 0 after construction', () => {
    const f = createFighter();
    expect(f.health).toBeGreaterThanOrEqual(0);
  });

  it('health never exceeds maxHealth', () => {
    const f = createFighter();
    expect(f.health).toBeLessThanOrEqual(f.maxHealth);

    // Simulate some damage then a reset; health should never exceed maxHealth
    f.health = 500;
    f.health = f.maxHealth + 100;
    expect(f.health).toBeGreaterThan(f.maxHealth); // raw assignment can break it
    // But through reset it should be clamped
    f.reset(400);
    expect(f.health).toBeLessThanOrEqual(f.maxHealth);
  });

  it('maxHealth > 0', () => {
    const f = createFighter();
    expect(f.maxHealth).toBeGreaterThan(0);
    expect(f.maxHealth).toBe(MAX_HEALTH);
  });

  it('health remains >= 0 after applying damage beyond zero', () => {
    const f = createFighter();
    f.health = 0;
    expect(f.health).toBeGreaterThanOrEqual(0);

    f.health = -100;
    // Direct field assignment bypasses clamping; verify the invariant holds through reset
    f.reset(400);
    expect(f.health).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Position Invariants
// ---------------------------------------------------------------------------
describe('Fighter State Integrity — Position Invariants', () => {
  it('x is between STAGE_LEFT and STAGE_RIGHT after construction', () => {
    const f = createFighter(400);
    expect(f.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('y <= STAGE_GROUND_Y (not below ground) after construction', () => {
    const f = createFighter();
    expect(f.y).toBeLessThanOrEqual(STAGE_GROUND_Y);
  });

  it('facing is 1 or -1', () => {
    const fRight = new Fighter(400, '#ff0000', 1);
    expect(fRight.facing === 1 || fRight.facing === -1).toBe(true);

    const fLeft = new Fighter(400, '#0000ff', -1);
    expect(fLeft.facing === 1 || fLeft.facing === -1).toBe(true);
  });

  it('reset restores y to STAGE_GROUND_Y', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y - 50; // simulate airborne
    f.reset(400);
    expect(f.y).toBe(STAGE_GROUND_Y);
  });
});

// ---------------------------------------------------------------------------
// 3. Attack State Machine
// ---------------------------------------------------------------------------
describe('Fighter State Integrity — Attack State Machine', () => {
  it('attackPhase is always one of the valid values', () => {
    const f = createFighter();
    expect(VALID_ATTACK_PHASES).toContain(f.attackPhase);
  });

  it('currentAttack is null implies attackPhase is none', () => {
    const f = createFighter();
    // After construction: no attack
    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');

    // After endAttack: should also hold
    f.startAttack(AttackType.STAND_A);
    f.endAttack();
    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');
  });

  it('attackFrame stays in reasonable range (0–100) during attack lifecycle', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_A);
    // attackFrame is 0 at start
    expect(f.attackFrame).toBeGreaterThanOrEqual(0);
    expect(f.attackFrame).toBeLessThanOrEqual(100);

    // Tick many times — even if the attack doesn't have 100+ recovery frames,
    // endAttack should fire and reset attackFrame to 0
    for (let i = 0; i < 200; i++) {
      f.tickAttack();
    }
    // After full cycle, attack is ended and frame reset
    expect(f.attackFrame).toBe(0);
    expect(f.currentAttack).toBeNull();
  });

  it('startAttack transitions attackPhase to startup', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_C);
    expect(f.attackPhase).toBe('startup');
    expect(f.currentAttack).toBe(AttackType.STAND_C);
  });
});

// ---------------------------------------------------------------------------
// 4. Guard Gauge Invariant
// ---------------------------------------------------------------------------
describe('Fighter State Integrity — Guard Gauge Invariant', () => {
  it('guardGauge is within 0–100 after construction', () => {
    const f = createFighter();
    expect(f.guardGauge).toBeGreaterThanOrEqual(0);
    expect(f.guardGauge).toBeLessThanOrEqual(100);
  });

  it('guardGauge <= 100 is maintained after tickTimers recovery', () => {
    const f = createFighter();
    f.guardGauge = 50; // partially depleted
    for (let i = 0; i < 300; i++) {
      f.tickTimers();
    }
    // Guard gauge recovers in IDLE state but should never exceed 100
    expect(f.guardGauge).toBeLessThanOrEqual(100);
  });

  it('reset restores guardGauge to 100', () => {
    const f = createFighter();
    f.guardGauge = 0; // fully depleted
    f.reset(400);
    expect(f.guardGauge).toBe(100);
  });

  it('guardGauge does not recover during HITSTUN', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.applyHitstun(30, 5);
    for (let i = 0; i < 30; i++) {
      f.tickTimers();
    }
    // Guard gauge should not have recovered during hitstun
    expect(f.guardGauge).toBeLessThanOrEqual(50);
  });
});

// ---------------------------------------------------------------------------
// 5. Reset Completeness
// ---------------------------------------------------------------------------
describe('Fighter State Integrity — Reset Completeness', () => {
  it('reset() restores health to maxHealth', () => {
    const f = createFighter();
    f.health = 0;
    f.reset(400);
    expect(f.health).toBe(f.maxHealth);
  });

  it('reset() clears all attack state', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_C);
    // Simulate being mid-attack
    f.attackFrame = 5;
    f.hasHit = true;

    f.reset(400);

    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');
    expect(f.attackFrame).toBe(0);
    expect(f.hasHit).toBe(false);
  });

  it('reset() restores state to IDLE and clears all timers', () => {
    const f = createFighter();
    // Simulate a complex mid-game state
    f.state = FighterState.HITSTUN;
    f.hitstunTimer = 20;
    f.blockstunTimer = 10;
    f.knockdownTimer = 30;
    f.landingRecovery = 5;
    f.rollTimer = 15;
    f.backdashTimer = 10;
    f.stunGauge = 80;
    f.dizzyTimer = 60;
    f.isKnockedDown = true;
    f.isHardKnockdown = true;
    f.throwInvulnFrames = 10;
    f.invincible = true;
    f.juggleState = JuggleState.FLOATING;
    f.jugglePoints = 50;
    f.airHitCount = 3;

    f.reset(400);

    expect(f.state).toBe(FighterState.IDLE);
    expect(f.hitstunTimer).toBe(0);
    expect(f.blockstunTimer).toBe(0);
    expect(f.knockdownTimer).toBe(0);
    expect(f.landingRecovery).toBe(0);
    expect(f.rollTimer).toBe(0);
    expect(f.backdashTimer).toBe(0);
    expect(f.stunGauge).toBe(0);
    expect(f.dizzyTimer).toBe(0);
    expect(f.isKnockedDown).toBe(false);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.throwInvulnFrames).toBe(0);
    expect(f.invincible).toBe(false);
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
  });

  it('reset() clears cancel and throw state', () => {
    const f = createFighter();
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelEvent = 'super_cancel';
    f.isBeingThrown = true;
    f.throwEscapeTimer = 10;
    f.isThrowing = true;

    f.reset(400);

    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelEvent).toBeNull();
    expect(f.isBeingThrown).toBe(false);
    expect(f.throwEscapeTimer).toBe(0);
    expect(f.isThrowing).toBe(false);
  });
});
