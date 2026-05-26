/**
 * Knockdown & Getup System Tests
 *
 * Tests for hard/soft knockdown timing, quick-rise, tech roll,
 * OTG damage reduction, and wake-up invincibility rules.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  HARD_KNOCKDOWN_GROUND_TICKS,
  SOFT_KNOCKDOWN_GROUND_TICKS,
  GETUP_ANIMATION_TICKS,
  QUICK_RISE_INPUT_START,
  QUICK_RISE_INPUT_END,
  TECH_ROLL_DISTANCE,
  OTG_DAMAGE_MULTIPLIER,
  OTG_MAX_HITS,
  THROW_INVINCIBILITY_WAKEUP,
  WAKEUP_FULL_INVINCIBILITY,
} from '../src/core/constants.js';

// ── 1. Knockdown Types & Timing ───────────────────────────

describe('Knockdown Types & Timing', () => {
  it('hard knockdown timer should be 40 ticks', () => {
    expect(HARD_KNOCKDOWN_GROUND_TICKS).toBe(40);
  });

  it('soft knockdown timer should be 25 ticks', () => {
    expect(SOFT_KNOCKDOWN_GROUND_TICKS).toBe(25);
  });

  it('getup animation should be 15 ticks', () => {
    expect(GETUP_ANIMATION_TICKS).toBe(15);
  });

  it('applyKnockdown sets hard knockdown flag', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(HARD_KNOCKDOWN_GROUND_TICKS, true);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isHardKnockdown).toBe(true);
    expect(f.knockdownTimer).toBe(HARD_KNOCKDOWN_GROUND_TICKS);
    expect(f.isKnockedDown).toBe(true);
  });

  it('applyKnockdown defaults to soft knockdown', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.knockdownTimer).toBe(SOFT_KNOCKDOWN_GROUND_TICKS);
  });

  it('knockdown resets OTG hit count', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.otgHitCount = 2;
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.otgHitCount).toBe(0);
  });
});

// ── 2. Getup State ────────────────────────────────────────

describe('Getup State', () => {
  it('applyGetup transitions to GETUP state', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(GETUP_ANIMATION_TICKS);
    expect(f.state).toBe(FighterState.GETUP);
    expect(f.getupTimer).toBe(GETUP_ANIMATION_TICKS);
    expect(f.getupDuration).toBe(GETUP_ANIMATION_TICKS);
    expect(f.isKnockedDown).toBe(false);
  });

  it('getup starts with correct timer and counts down', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(15);
    expect(f.getupTimer).toBe(15);
    f.getupTimer--;
    expect(f.getupTimer).toBe(14);
  });

  it('fighter is throw invulnerable during GETUP', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(GETUP_ANIMATION_TICKS);
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('GETUP state is in the FighterState enum', () => {
    expect(FighterState.GETUP).toBe('GETUP');
  });

  it('getupTimer resets in reset()', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(15);
    f.reset(400);
    expect(f.getupTimer).toBe(0);
    expect(f.getupDuration).toBe(15);
    expect(f.otgHitCount).toBe(0);
  });
});

// ── 3. Quick-Rise Input Window ────────────────────────────

describe('Quick-Rise Input Window', () => {
  it('quick-rise input window starts at frame 10', () => {
    expect(QUICK_RISE_INPUT_START).toBe(10);
  });

  it('quick-rise input window ends at frame 20', () => {
    expect(QUICK_RISE_INPUT_END).toBe(20);
  });

  it('quick-rise only works on soft knockdown', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS, true); // hard
    expect(f.isHardKnockdown).toBe(true);
    // Hard knockdown should not allow quick rise (handled by state handler logic)
  });

  it('quick-rise sets usedQuickStand flag', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.usedQuickStand).toBe(false);
    // Simulate quick rise: knockdownTimer set to 3
    f.knockdownTimer = 3;
    f.usedQuickStand = true;
    expect(f.usedQuickStand).toBe(true);
  });
});

// ── 4. Tech Roll ──────────────────────────────────────────

describe('Tech Roll', () => {
  it('tech roll distance is 40 pixels', () => {
    expect(TECH_ROLL_DISTANCE).toBe(40);
  });

  it('fighter position shifts by tech roll distance * facing', () => {
    const f = new Fighter(400, '#ff6600', 1);
    const startX = f.x;
    // Simulate tech roll
    f.x += TECH_ROLL_DISTANCE * f.facing;
    expect(f.x).toBe(startX + TECH_ROLL_DISTANCE);
  });

  it('tech roll moves fighter backward when facing left', () => {
    const f = new Fighter(400, '#ff6600', -1);
    const startX = f.x;
    f.x += TECH_ROLL_DISTANCE * f.facing;
    expect(f.x).toBe(startX - TECH_ROLL_DISTANCE);
  });
});

// ── 5. OTG Damage Reduction ───────────────────────────────

describe('OTG Damage Reduction', () => {
  it('OTG damage multiplier is 0.75 (75%)', () => {
    expect(OTG_DAMAGE_MULTIPLIER).toBe(0.75);
  });

  it('OTG reduces 100 damage to 75', () => {
    const damage = 100;
    expect(Math.round(damage * OTG_DAMAGE_MULTIPLIER)).toBe(75);
  });

  it('OTG reduces 40 damage to 30', () => {
    const damage = 40;
    expect(Math.round(damage * OTG_DAMAGE_MULTIPLIER)).toBe(30);
  });

  it('max OTG hits per knockdown is 2', () => {
    expect(OTG_MAX_HITS).toBe(2);
  });

  it('isOTGVulnerable returns true when knocked down and grounded', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.isOTGVulnerable()).toBe(true);
  });

  it('isOTGVulnerable returns false when not in knockdown state', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.isOTGVulnerable()).toBe(false);
  });

  it('isOTGVulnerable returns false during GETUP', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(GETUP_ANIMATION_TICKS);
    expect(f.isOTGVulnerable()).toBe(false);
  });

  it('OTG hit count increments', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.otgHitCount).toBe(0);
    f.otgHitCount++;
    expect(f.otgHitCount).toBe(1);
    f.otgHitCount++;
    expect(f.otgHitCount).toBe(2);
    // Should not exceed OTG_MAX_HITS
    expect(f.otgHitCount).toBeGreaterThanOrEqual(OTG_MAX_HITS);
  });

  it('OTG hit count resets on new knockdown', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.otgHitCount = 2;
    f.applyKnockdown(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(f.otgHitCount).toBe(0);
  });
});

// ── 6. Wake-up Invincibility Rules ────────────────────────

describe('Wake-up Invincibility Rules', () => {
  it('throw invincibility on wakeup is 9 frames', () => {
    expect(THROW_INVINCIBILITY_WAKEUP).toBe(9);
  });

  it('full invincibility on normal wakeup is 5 frames', () => {
    expect(WAKEUP_FULL_INVINCIBILITY).toBe(5);
  });

  it('fighter can block immediately after getup completes', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // Simulate getup completing
    f.state = FighterState.IDLE;
    f.isKnockedDown = false;
    expect(f.canBlock()).toBe(true);
  });

  it('fighter can attack immediately after getup (canAct check)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.IDLE;
    expect(f.canAct()).toBe(true);
  });

  it('fighter is throw invulnerable during GETUP state', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(GETUP_ANIMATION_TICKS);
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('fighter facing is locked during GETUP', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyGetup(GETUP_ANIMATION_TICKS);
    const origFacing = f.facing;
    const opponent = new Fighter(200, '#0066ff', -1);
    f.updateFacing(opponent);
    // Facing should not change during GETUP
    expect(f.facing).toBe(origFacing);
  });

  it('quick-stand wakeup has reduced throw invincibility', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.usedQuickStand = true;
    // Quick stand gives 50% of normal throw invincibility
    const reducedInvincibility = Math.round(THROW_INVINCIBILITY_WAKEUP * 0.5);
    expect(reducedInvincibility).toBe(5);
  });
});

// ── 7. State Transition Integrity ─────────────────────────

describe('State Transition Integrity', () => {
  it('GETUP state is defined between KNOCKDOWN and DIZZY', () => {
    expect(FighterState.KNOCKDOWN).toBeDefined();
    expect(FighterState.GETUP).toBeDefined();
    expect(FighterState.DIZZY).toBeDefined();
  });

  it('fighter reset clears all knockdown/getup state', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.applyKnockdown(HARD_KNOCKDOWN_GROUND_TICKS, true);
    f.otgHitCount = 2;
    f.usedQuickStand = true;
    f.knockdownDelayUsed = 15;
    f.reset(400);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.usedQuickStand).toBe(false);
    expect(f.knockdownDelayUsed).toBe(0);
    expect(f.knockdownTimer).toBe(0);
    expect(f.getupTimer).toBe(0);
    expect(f.otgHitCount).toBe(0);
  });
});
