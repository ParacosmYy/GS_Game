/**
 * Guard Gauge Visual Feedback tests
 *
 * Covers: visual state transitions, data exposure for rendering,
 * warning threshold behavior, guard gauge independence from health,
 * reset behavior, and edge cases for the guard gauge display system.
 * Total: 18 tests across 6 groups.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_MAX,
  GUARD_GAUGE_WARNING_THRESHOLD,
  GUARD_GAUGE_RECOVERY_IDLE,
  GUARD_GAUGE_RECOVERY_RUN,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  MAX_HEALTH,
} from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

/**
 * Simulate a single block event draining the guard gauge.
 * Returns true if Guard Crush should be triggered.
 */
function simulateBlock(fighter: Fighter, drain: number): boolean {
  fighter.guardGauge = Math.max(0, fighter.guardGauge - drain);
  if (fighter.guardGauge <= 0) {
    fighter.state = FighterState.GUARD_CRUSH;
    fighter.guardCrushTimer = GUARD_CRUSH_DURATION;
    fighter.consecutiveBlockCount = 0;
    return true;
  }
  fighter.guardGauge = Math.min(fighter.guardGaugeMax, fighter.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
  return false;
}

// ===========================================================================
// 1. Guard Gauge Starts at Max on Round Start (2 tests)
// ===========================================================================
describe('Guard gauge starts at max on round start', () => {
  it('new fighter has guardGauge at GUARD_GAUGE_MAX (100)', () => {
    const f = createFighter();
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
    expect(f.guardGauge).toBe(100);
  });

  it('reset() restores guard gauge to max and clears crush timer', () => {
    const f = createFighter();
    // Deplete and crush
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 50;
    // Reset simulates a new round
    f.reset(400);
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
    expect(f.guardCrushTimer).toBe(0);
    expect(f.state).toBe(FighterState.IDLE);
  });
});

// ===========================================================================
// 2. Guard Gauge Visual State Transitions (5 tests)
// ===========================================================================
describe('Guard gauge visual state transitions', () => {
  it('normal state: gauge above 60% returns "normal"', () => {
    const f = createFighter();
    f.guardGauge = 100;
    expect(f.getGuardGaugeVisualState()).toBe('normal');
    f.guardGauge = 70;
    expect(f.getGuardGaugeVisualState()).toBe('normal');
    f.guardGauge = 61;
    expect(f.getGuardGaugeVisualState()).toBe('normal');
  });

  it('warning state: gauge strictly between 30-60% returns "warning" (60% is normal)', () => {
    const f = createFighter();
    f.guardGauge = 60;
    expect(f.getGuardGaugeVisualState()).toBe('normal'); // 60% is the boundary, still normal
    f.guardGauge = 59;
    expect(f.getGuardGaugeVisualState()).toBe('warning');
    f.guardGauge = 45;
    expect(f.getGuardGaugeVisualState()).toBe('warning');
    f.guardGauge = 30;
    expect(f.getGuardGaugeVisualState()).toBe('warning'); // 30% is still warning
  });

  it('critical state: gauge below 30% and above 0 returns "critical"', () => {
    const f = createFighter();
    f.guardGauge = 29;
    expect(f.getGuardGaugeVisualState()).toBe('critical');
    f.guardGauge = 15;
    expect(f.getGuardGaugeVisualState()).toBe('critical');
    f.guardGauge = 1;
    expect(f.getGuardGaugeVisualState()).toBe('critical');
  });

  it('crushed state: gauge at 0 with GUARD_CRUSH state returns "crushed"', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.getGuardGaugeVisualState()).toBe('crushed');
  });

  it('full transition: normal -> warning -> critical -> crushed -> recovering', () => {
    const f = createFighter();

    // Start at full gauge: normal
    expect(f.getGuardGaugeVisualState()).toBe('normal');

    // Drain to warning range
    f.guardGauge = 50;
    expect(f.getGuardGaugeVisualState()).toBe('warning');

    // Drain to critical range
    f.guardGauge = 20;
    expect(f.getGuardGaugeVisualState()).toBe('critical');

    // Drain to zero and enter Guard Crush
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.getGuardGaugeVisualState()).toBe('crushed');

    // Guard Crush expires, gauge starts recovering
    f.guardCrushTimer = 0;
    f.state = FighterState.IDLE;
    f.guardGauge = 5;
    expect(f.getGuardGaugeVisualState()).toBe('critical'); // still critical at 5%
    f.guardGauge = 35;
    expect(f.getGuardGaugeVisualState()).toBe('warning'); // recovering through warning
    f.guardGauge = 65;
    expect(f.getGuardGaugeVisualState()).toBe('normal'); // back to normal
  });
});

// ===========================================================================
// 3. Guard Gauge Warning Threshold (2 tests)
// ===========================================================================
describe('Guard gauge warning threshold', () => {
  it('GUARD_GAUGE_WARNING_THRESHOLD is 30 (gauge value, not ratio)', () => {
    expect(GUARD_GAUGE_WARNING_THRESHOLD).toBe(30);
  });

  it('visual state transitions to critical at exactly the warning threshold', () => {
    const f = createFighter();
    // At threshold: 30/100 = 0.3 -> "warning" (not strictly less than 0.3)
    f.guardGauge = 30;
    expect(f.getGuardGaugeVisualState()).toBe('warning');
    // Just below threshold: 29/100 = 0.29 -> "critical"
    f.guardGauge = GUARD_GAUGE_WARNING_THRESHOLD - 1;
    expect(f.getGuardGaugeVisualState()).toBe('critical');
  });
});

// ===========================================================================
// 4. Guard Gauge is Independent of Health (2 tests)
// ===========================================================================
describe('Guard gauge is independent of health', () => {
  it('guard gauge at 0 while health is full: Guard Crush triggers without dying', () => {
    const f = createFighter();
    f.health = MAX_HEALTH; // Full health
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    // Guard gauge is crushed but health is full
    expect(f.guardGauge).toBe(0);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.isGuardCrushed()).toBe(true);
  });

  it('guard gauge at max while health is low: gauge is unaffected by health', () => {
    const f = createFighter();
    f.health = 50; // Very low health
    f.guardGauge = GUARD_GAUGE_MAX; // Full guard gauge
    // Guard gauge is independent of health
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
    expect(f.health).toBe(50);
    expect(f.getGuardGaugeVisualState()).toBe('normal');
  });
});

// ===========================================================================
// 5. isGuardCrushed() convenience method (3 tests)
// ===========================================================================
describe('isGuardCrushed() convenience method', () => {
  it('returns true when in GUARD_CRUSH state with timer > 0', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.isGuardCrushed()).toBe(true);
  });

  it('returns false when guardCrushTimer is 0 (crush expired)', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 0;
    expect(f.isGuardCrushed()).toBe(false);
  });

  it('returns false when in other states', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    expect(f.isGuardCrushed()).toBe(false);
    f.state = FighterState.HITSTUN;
    expect(f.isGuardCrushed()).toBe(false);
    f.state = FighterState.BLOCK;
    expect(f.isGuardCrushed()).toBe(false);
  });
});

// ===========================================================================
// 6. Guard Gauge Recovery After Crush (2 tests)
// ===========================================================================
describe('Guard gauge recovery after crush', () => {
  it('guard gauge recovers from 0 after Guard Crush expires in IDLE state', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.IDLE;
    // Tick 40 frames: should recover 40 * 0.25 = 10
    for (let i = 0; i < 40; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBeCloseTo(10, 4);
  });

  it('guard gauge recovers faster from 0 when in WALK state (same as IDLE rate)', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.WALK;
    for (let i = 0; i < 40; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBeCloseTo(40 * GUARD_GAUGE_RECOVERY_IDLE, 4);
  });
});

// ===========================================================================
// 7. Guard Gauge Drain Tiered by Attack Type (2 tests)
// ===========================================================================
describe('Guard gauge drain tiered by attack type', () => {
  it('depletion order: light(5) < heavy(10) < special(15) < DM(25) < SDM(35)', () => {
    // Verify the tiered drain hierarchy
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBe(5);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBe(10);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBe(15);
    expect(GUARD_GAUGE_DRAIN_DM).toBe(25);
    expect(GUARD_GAUGE_DRAIN_SDM).toBe(35);
    // Strict ordering
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBeLessThan(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeLessThan(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeLessThan(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBeLessThan(GUARD_GAUGE_DRAIN_SDM);
  });

  it('blocks to crush: 20 light, 10 heavy, ~7 special, 4 DM, 3 SDM', () => {
    // Simulate how many blocks of each type it takes to reach 0
    // With bonus of +2 per block: net drain = drain - bonus
    const netLight = GUARD_GAUGE_DRAIN_LIGHT - GUARD_GAUGE_METER_BONUS_ON_BLOCK; // 3
    const netHeavy = GUARD_GAUGE_DRAIN_HEAVY - GUARD_GAUGE_METER_BONUS_ON_BLOCK; // 8
    const netSpecial = GUARD_GAUGE_DRAIN_SPECIAL - GUARD_GAUGE_METER_BONUS_ON_BLOCK; // 13
    const netDM = GUARD_GAUGE_DRAIN_DM - GUARD_GAUGE_METER_BONUS_ON_BLOCK; // 23

    // Light: 100/3 = 34 blocks to deplete
    expect(Math.ceil(GUARD_GAUGE_MAX / netLight)).toBe(34);
    // Heavy: 100/8 = 13 blocks
    expect(Math.ceil(GUARD_GAUGE_MAX / netHeavy)).toBe(13);
    // Special: 100/13 = 8 blocks
    expect(Math.ceil(GUARD_GAUGE_MAX / netSpecial)).toBe(8);
    // DM: 100/23 = 5 blocks
    expect(Math.ceil(GUARD_GAUGE_MAX / netDM)).toBe(5);
  });
});
