/**
 * Damage Scaling System Regression Test
 * Verifies combo scaling tiers, starter proration, DM penalty, and damage floors.
 */
import { describe, it, expect } from 'vitest';
import {
  DAMAGE_FLOORS,
  STARTER_PRORATION,
  SCALING_TABLE,
  classifyStarter,
  getStarterProration,
  getAttackTier,
  getDamageFloor,
  getComboScale,
  computeScaledDamage,
  scaleComboDamage,
  getScalingBreakdown,
} from '../src/core/damageScaling.js';

describe('DAMAGE_FLOORS', () => {
  it('has all 5 tiers', () => {
    expect(DAMAGE_FLOORS.normal).toBeDefined();
    expect(DAMAGE_FLOORS.command).toBeDefined();
    expect(DAMAGE_FLOORS.special).toBeDefined();
    expect(DAMAGE_FLOORS.dm).toBeDefined();
    expect(DAMAGE_FLOORS.sdm).toBeDefined();
  });

  it('floors are in ascending order by tier', () => {
    expect(DAMAGE_FLOORS.normal).toBeLessThan(DAMAGE_FLOORS.command);
    expect(DAMAGE_FLOORS.command).toBeLessThan(DAMAGE_FLOORS.special);
    expect(DAMAGE_FLOORS.special).toBeLessThan(DAMAGE_FLOORS.dm);
    expect(DAMAGE_FLOORS.dm).toBeLessThan(DAMAGE_FLOORS.sdm);
  });

  it('all floors are between 0 and 1', () => {
    for (const val of Object.values(DAMAGE_FLOORS)) {
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

describe('STARTER_PRORATION', () => {
  it('has all starter types', () => {
    expect(STARTER_PRORATION.light).toBeDefined();
    expect(STARTER_PRORATION.heavy).toBeDefined();
    expect(STARTER_PRORATION.jump_in).toBeDefined();
    expect(STARTER_PRORATION.command_normal).toBeDefined();
    expect(STARTER_PRORATION.special).toBeDefined();
    expect(STARTER_PRORATION.throw).toBeDefined();
  });

  it('heavy and throw have 1.0 proration', () => {
    expect(STARTER_PRORATION.heavy).toBe(1.0);
    expect(STARTER_PRORATION.throw).toBe(1.0);
  });

  it('light has worst proration', () => {
    expect(STARTER_PRORATION.light).toBeLessThan(STARTER_PRORATION.heavy);
    expect(STARTER_PRORATION.light).toBeLessThan(STARTER_PRORATION.jump_in);
  });
});

describe('SCALING_TABLE', () => {
  it('has at least 3 tiers', () => {
    expect(SCALING_TABLE.length).toBeGreaterThanOrEqual(3);
  });

  it('scales are decreasing', () => {
    for (let i = 1; i < SCALING_TABLE.length; i++) {
      expect(SCALING_TABLE[i].scale).toBeLessThanOrEqual(SCALING_TABLE[i - 1].scale);
    }
  });

  it('first tier is 1.0 scale', () => {
    expect(SCALING_TABLE[0].scale).toBe(1.0);
  });
});

describe('classifyStarter', () => {
  it('classifies A button as light', () => {
    expect(classifyStarter('STAND_A')).toBe('light');
  });

  it('classifies B button as light', () => {
    expect(classifyStarter('CROUCH_B')).toBe('light');
  });

  it('classifies C button as heavy', () => {
    expect(classifyStarter('STAND_C')).toBe('heavy');
  });

  it('classifies D button as heavy', () => {
    expect(classifyStarter('CROUCH_D')).toBe('heavy');
  });

  it('classifies jump attacks as jump_in', () => {
    expect(classifyStarter('JUMP_C')).toBe('jump_in');
    expect(classifyStarter('JUMP_D')).toBe('jump_in');
  });
});

describe('getAttackTier', () => {
  it('DM_ prefix returns dm', () => {
    expect(getAttackTier('DM_TEN_HA_OU')).toBe('dm');
  });

  it('SDM_ prefix returns sdm', () => {
    expect(getAttackTier('SDM_RYUKO_RANBU')).toBe('sdm');
  });

  it('HSDM_ prefix returns sdm', () => {
    expect(getAttackTier('HSDM_RYUKO_RANBU')).toBe('sdm');
  });

  it('normals return normal', () => {
    expect(getAttackTier('STAND_A')).toBe('normal');
    expect(getAttackTier('CROUCH_D')).toBe('normal');
  });
});

describe('getDamageFloor', () => {
  it('returns a positive number for each tier', () => {
    for (const tier of ['normal', 'command', 'special', 'dm', 'sdm'] as const) {
      expect(getDamageFloor(tier), `${tier} floor`).toBeGreaterThan(0);
    }
  });

  it('SDM floor is higher than DM floor', () => {
    expect(getDamageFloor('sdm')).toBeGreaterThan(getDamageFloor('dm'));
  });
});

describe('getComboScale', () => {
  it('combo 1 returns 1.0', () => {
    expect(getComboScale(1)).toBe(1.0);
  });

  it('combo 0 returns 1.0', () => {
    expect(getComboScale(0)).toBe(1.0);
  });

  it('scale decreases with combo count', () => {
    const s3 = getComboScale(3);
    const s7 = getComboScale(7);
    const s12 = getComboScale(12);
    expect(s3).toBeGreaterThanOrEqual(s7);
    expect(s7).toBeGreaterThanOrEqual(s12);
  });
});

describe('computeScaledDamage', () => {
  it('first hit is full damage', () => {
    expect(computeScaledDamage(100, 1, 'STAND_C')).toBe(100);
  });

  it('later hits are scaled down', () => {
    const dmg = computeScaledDamage(100, 5, 'STAND_C');
    expect(dmg).toBeLessThan(100);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it('damage is at least 1', () => {
    const dmg = computeScaledDamage(10, 20, 'STAND_A');
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it('light starter scales more than heavy starter', () => {
    const heavyDmg = computeScaledDamage(100, 8, 'STAND_C', 'heavy');
    const lightDmg = computeScaledDamage(100, 8, 'STAND_C', 'light');
    expect(lightDmg).toBeLessThanOrEqual(heavyDmg);
  });
});

describe('scaleComboDamage', () => {
  it('first hit (comboHits=0) returns full damage', () => {
    expect(scaleComboDamage(100, 0, 'STAND_C')).toBe(100);
  });

  it('scales second hit', () => {
    const dmg = scaleComboDamage(100, 1, 'STAND_C');
    expect(dmg).toBeLessThanOrEqual(100);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it('works with specials', () => {
    const dmg = scaleComboDamage(80, 3, 'KYO_ONIYAKI', 'STAND_C');
    expect(dmg).toBeGreaterThan(0);
  });

  it('works with DMs', () => {
    const dmg = scaleComboDamage(200, 5, 'DM_OROCHINAGI', 'STAND_C');
    expect(dmg).toBeGreaterThan(0);
    expect(dmg).toBeLessThan(200);
  });
});

describe('getScalingBreakdown', () => {
  it('returns all fields', () => {
    const bd = getScalingBreakdown(100, 5, 'STAND_C');
    expect(bd.baseScale).toBeDefined();
    expect(bd.proration).toBeDefined();
    expect(bd.dmPenalty).toBeDefined();
    expect(bd.floor).toBeDefined();
    expect(bd.finalScale).toBeDefined();
    expect(bd.scaledDamage).toBeDefined();
  });

  it('breakdown matches computeScaledDamage', () => {
    const dmg = computeScaledDamage(100, 5, 'STAND_C', 'heavy');
    const bd = getScalingBreakdown(100, 5, 'STAND_C', 'heavy');
    expect(bd.scaledDamage).toBe(dmg);
  });

  it('first hit has baseScale 1.0', () => {
    const bd = getScalingBreakdown(100, 1, 'STAND_C');
    expect(bd.baseScale).toBe(1.0);
  });

  it('DM has non-zero dmPenalty', () => {
    const bd = getScalingBreakdown(200, 5, 'DM_TEN_HA_OU');
    expect(bd.dmPenalty).toBeGreaterThan(0);
  });
});
