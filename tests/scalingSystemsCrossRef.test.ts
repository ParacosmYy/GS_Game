/**
 * Damage Scaling Systems Cross-Reference Tests
 *
 * Validates consistency between two scaling systems:
 * 1. COMBO_DAMAGE_SCALE (constants.ts) — legacy tier table
 * 2. SCALING_TABLE (damageScaling.ts) — new tier table
 *
 * Also validates:
 * - COMBO_MIN_SCALE consistency between both modules
 * - DM_COMBO_PENALTY produces sensible results
 * - Starter proration values are in [0,1]
 * - Damage floors match constants.ts min scale values
 */
import { describe, it, expect } from 'vitest';
import {
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  DAMAGE_SCALE_MIN_NORMAL,
  DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM,
} from '../src/core/constants.js';
import {
  SCALING_TABLE,
  DAMAGE_FLOORS,
  STARTER_PRORATION,
  getComboScale,
  getStarterProration,
  getDamageFloor,
  getAttackTier,
  classifyStarter,
  computeScaledDamage,
  scaleComboDamage,
  getScalingBreakdown,
} from '../src/core/damageScaling.js';

describe('Scaling systems consistency', () => {
  it('COMBO_MIN_SCALE matches across modules', () => {
    // COMBO_MIN_SCALE from constants.ts should equal the last SCALING_TABLE entry scale
    const lastEntry = SCALING_TABLE[SCALING_TABLE.length - 1];
    expect(COMBO_MIN_SCALE).toBe(lastEntry.scale);
  });

  it('SCALING_TABLE and COMBO_DAMAGE_SCALE cover same hit ranges', () => {
    // COMBO_DAMAGE_SCALE keys: 3, 6, 9 → ranges [1-3], [4-6], [7-9]
    // SCALING_TABLE entries should have maxHits matching these thresholds
    const thresholds = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
    const tableThresholds = SCALING_TABLE.slice(0, -1).map(e => e.maxHits);
    // They should have same number of finite entries
    expect(tableThresholds.length).toBe(thresholds.length);
    for (let i = 0; i < thresholds.length; i++) {
      expect(tableThresholds[i]).toBe(thresholds[i]);
    }
  });

  it('scaling values between systems are consistent', () => {
    // COMBO_DAMAGE_SCALE[3] should be 1.0 (first tier, full damage)
    expect(COMBO_DAMAGE_SCALE[3]).toBe(1.0);
    // SCALING_TABLE first entry should also be 1.0
    expect(SCALING_TABLE[0].scale).toBe(1.0);
  });
});

describe('Damage floor ↔ constants consistency', () => {
  it('DAMAGE_FLOORS.normal <= DAMAGE_SCALE_MIN_NORMAL', () => {
    expect(DAMAGE_FLOORS.normal).toBeLessThanOrEqual(DAMAGE_SCALE_MIN_NORMAL);
  });

  it('DAMAGE_FLOORS.special <= DAMAGE_SCALE_MIN_SPECIAL', () => {
    expect(DAMAGE_FLOORS.special).toBeLessThanOrEqual(DAMAGE_SCALE_MIN_SPECIAL);
  });

  it('DAMAGE_FLOORS.dm <= DAMAGE_SCALE_MIN_DM', () => {
    expect(DAMAGE_FLOORS.dm).toBeLessThanOrEqual(DAMAGE_SCALE_MIN_DM);
  });

  it('damage floors are in ascending order by tier', () => {
    expect(DAMAGE_FLOORS.normal).toBeLessThan(DAMAGE_FLOORS.command);
    expect(DAMAGE_FLOORS.command).toBeLessThan(DAMAGE_FLOORS.special);
    expect(DAMAGE_FLOORS.special).toBeLessThan(DAMAGE_FLOORS.dm);
    expect(DAMAGE_FLOORS.dm).toBeLessThan(DAMAGE_FLOORS.sdm);
  });

  it('all damage floors are between 0 and 1', () => {
    for (const [tier, floor] of Object.entries(DAMAGE_FLOORS)) {
      expect(floor, `${tier} floor`).toBeGreaterThan(0);
      expect(floor, `${tier} floor`).toBeLessThanOrEqual(1);
    }
  });
});

describe('Starter proration consistency', () => {
  it('all starter proration values are in (0, 1]', () => {
    for (const [type, value] of Object.entries(STARTER_PRORATION)) {
      expect(value, `${type} proration`).toBeGreaterThan(0);
      expect(value, `${type} proration`).toBeLessThanOrEqual(1);
    }
  });

  it('light starters have lower proration than heavy', () => {
    expect(STARTER_PRORATION.light).toBeLessThan(STARTER_PRORATION.heavy);
  });

  it('throw starters have full proration (1.0)', () => {
    expect(STARTER_PRORATION.throw).toBe(1.0);
  });

  it('special starters have lowest proration', () => {
    const values = Object.values(STARTER_PRORATION);
    expect(STARTER_PRORATION.special).toBe(Math.min(...values));
  });

  it('getStarterProration returns 1.0 for unknown starters', () => {
    expect(getStarterProration('unknown' as any)).toBe(1.0);
  });
});

describe('DM combo penalty', () => {
  it('DM_COMBO_PENALTY is positive and less than 0.5', () => {
    expect(DM_COMBO_PENALTY).toBeGreaterThan(0);
    expect(DM_COMBO_PENALTY).toBeLessThan(0.5);
  });

  it('DM in combo still does at least floor damage', () => {
    const dmg = computeScaledDamage(100, 5, 'DM_TEN_HA_OU', 'heavy');
    const floor = getDamageFloor('dm');
    expect(dmg).toBeGreaterThanOrEqual(Math.round(100 * floor));
  });
});

describe('getComboScale progression', () => {
  it('1-hit combo has full scale (1.0)', () => {
    expect(getComboScale(1)).toBe(1.0);
  });

  it('3-hit combo has full scale', () => {
    expect(getComboScale(3)).toBe(1.0);
  });

  it('4-hit combo has reduced scale', () => {
    expect(getComboScale(4)).toBeLessThan(1.0);
  });

  it('10+ hit combo reaches minimum scale', () => {
    expect(getComboScale(10)).toBe(COMBO_MIN_SCALE);
    expect(getComboScale(50)).toBe(COMBO_MIN_SCALE);
  });

  it('scale decreases monotonically with combo count', () => {
    for (let i = 1; i < 15; i++) {
      expect(getComboScale(i + 1)).toBeLessThanOrEqual(getComboScale(i));
    }
  });
});

describe('computeScaledDamage edge cases', () => {
  it('first hit is always full damage', () => {
    expect(computeScaledDamage(80, 1, 'STAND_C')).toBe(80);
    expect(computeScaledDamage(120, 1, 'DM_TEN_HA_OU')).toBe(120);
  });

  it('damage is always at least 1', () => {
    expect(computeScaledDamage(5, 20, 'STAND_A')).toBeGreaterThanOrEqual(1);
    expect(computeScaledDamage(1, 50, 'STAND_A')).toBeGreaterThanOrEqual(1);
  });

  it('higher combo count produces less or equal damage', () => {
    const dmg5 = computeScaledDamage(80, 5, 'STAND_C');
    const dmg10 = computeScaledDamage(80, 10, 'STAND_C');
    expect(dmg10).toBeLessThanOrEqual(dmg5);
  });
});

describe('classifyStarter ↔ getAttackTier consistency', () => {
  it('light starters (STAND_A, CLOSE_B) classify as normal tier', () => {
    expect(getAttackTier('STAND_A')).toBe('normal');
    expect(getAttackTier('CLOSE_B')).toBe('normal');
  });

  it('DM attacks classify as dm tier', () => {
    expect(getAttackTier('DM_TEN_HA_OU')).toBe('dm');
    expect(getAttackTier('SDM_OROCHINAGI')).toBe('sdm');
    expect(getAttackTier('HSDM_RYUKO_RANBU')).toBe('sdm');
  });

  it('special attacks classify as special tier', () => {
    expect(getAttackTier('RYO_KOOU')).toBe('special');
    expect(getAttackTier('KYO_ONIYAKI')).toBe('special');
  });

  it('command normals classify as command tier', () => {
    expect(getAttackTier('CMD_GOFU_YOU')).toBe('command');
  });

  it('classifyStarter matches expectations', () => {
    expect(classifyStarter('STAND_A')).toBe('light');
    expect(classifyStarter('STAND_C')).toBe('heavy');
    expect(classifyStarter('CLOSE_D')).toBe('heavy');
    expect(classifyStarter('JUMP_C')).toBe('jump_in');
    expect(classifyStarter('CMD_GOFU_YOU')).toBe('command_normal');
    expect(classifyStarter('RYO_KOOU')).toBe('special');
    expect(classifyStarter('THROW_FORWARD')).toBe('throw');
    expect(classifyStarter('DM_TEN_HA_OU')).toBe('special');
  });
});

describe('getScalingBreakdown structure', () => {
  it('returns all fields', () => {
    const breakdown = getScalingBreakdown(80, 5, 'STAND_C');
    expect(breakdown).toHaveProperty('baseScale');
    expect(breakdown).toHaveProperty('proration');
    expect(breakdown).toHaveProperty('dmPenalty');
    expect(breakdown).toHaveProperty('floor');
    expect(breakdown).toHaveProperty('finalScale');
    expect(breakdown).toHaveProperty('scaledDamage');
  });

  it('finalScale >= floor', () => {
    const breakdown = getScalingBreakdown(80, 10, 'STAND_A');
    expect(breakdown.finalScale).toBeGreaterThanOrEqual(breakdown.floor);
  });

  it('scaledDamage >= 1', () => {
    const breakdown = getScalingBreakdown(10, 20, 'STAND_A');
    expect(breakdown.scaledDamage).toBeGreaterThanOrEqual(1);
  });
});
