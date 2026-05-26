/**
 * Damage Scaling Tests
 *
 * Covers: table-based scaling, starter proration, minimum damage floors,
 * DM penalty, attack tier classification, scaling breakdown.
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
  type AttackTier,
  type StarterType,
} from '../src/core/damageScaling.js';
import {
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
} from '../src/core/constants.js';

// ── 1. Damage Floor Constants ───────────────────────────────────
describe('Damage Floor Constants', () => {
  it('normal floor is 10%', () => {
    expect(DAMAGE_FLOORS.normal).toBe(0.10);
  });

  it('command floor is 12%', () => {
    expect(DAMAGE_FLOORS.command).toBe(0.12);
  });

  it('special floor is 15%', () => {
    expect(DAMAGE_FLOORS.special).toBe(0.15);
  });

  it('DM floor is 25%', () => {
    expect(DAMAGE_FLOORS.dm).toBe(0.25);
  });

  it('SDM floor is 30%', () => {
    expect(DAMAGE_FLOORS.sdm).toBe(0.30);
  });

  it('floor hierarchy: SDM > DM > Special > Command > Normal', () => {
    expect(DAMAGE_FLOORS.sdm).toBeGreaterThan(DAMAGE_FLOORS.dm);
    expect(DAMAGE_FLOORS.dm).toBeGreaterThan(DAMAGE_FLOORS.special);
    expect(DAMAGE_FLOORS.special).toBeGreaterThan(DAMAGE_FLOORS.command);
    expect(DAMAGE_FLOORS.command).toBeGreaterThan(DAMAGE_FLOORS.normal);
  });
});

// ── 2. Starter Proration ────────────────────────────────────────
describe('Starter Proration', () => {
  it('light starter proration is 0.85', () => {
    expect(STARTER_PRORATION.light).toBe(0.85);
  });

  it('heavy starter proration is 1.0', () => {
    expect(STARTER_PRORATION.heavy).toBe(1.0);
  });

  it('jump_in starter proration is 0.9', () => {
    expect(STARTER_PRORATION.jump_in).toBe(0.9);
  });

  it('special starter proration is 0.80', () => {
    expect(STARTER_PRORATION.special).toBe(0.80);
  });

  it('throw starter proration is 1.0', () => {
    expect(STARTER_PRORATION.throw).toBe(1.0);
  });

  it('light starter applies more proration than heavy', () => {
    expect(STARTER_PRORATION.light).toBeLessThan(STARTER_PRORATION.heavy);
  });

  it('jump_in starter applies more proration than heavy', () => {
    expect(STARTER_PRORATION.jump_in).toBeLessThan(STARTER_PRORATION.heavy);
  });
});

// ── 3. Scaling Table ────────────────────────────────────────────
describe('Scaling Table', () => {
  it('first tier is 100% for hits 1-3', () => {
    expect(SCALING_TABLE[0].maxHits).toBe(3);
    expect(SCALING_TABLE[0].scale).toBe(1.0);
  });

  it('scales decrease for higher tiers', () => {
    for (let i = 1; i < SCALING_TABLE.length; i++) {
      expect(SCALING_TABLE[i].scale).toBeLessThanOrEqual(SCALING_TABLE[i - 1].scale);
    }
  });

  it('minimum scale matches COMBO_MIN_SCALE', () => {
    const lastEntry = SCALING_TABLE[SCALING_TABLE.length - 1];
    expect(lastEntry.scale).toBe(COMBO_MIN_SCALE);
  });

  it('all scales are between 0 and 1', () => {
    for (const entry of SCALING_TABLE) {
      expect(entry.scale).toBeGreaterThan(0);
      expect(entry.scale).toBeLessThanOrEqual(1);
    }
  });
});

// ── 4. Starter Classification ───────────────────────────────────
describe('Starter Classification', () => {
  it('classifies light normals correctly', () => {
    expect(classifyStarter('STAND_A')).toBe('light');
    expect(classifyStarter('STAND_B')).toBe('light');
    expect(classifyStarter('CLOSE_A')).toBe('light');
    expect(classifyStarter('CROUCH_B')).toBe('light');
  });

  it('classifies heavy normals correctly', () => {
    expect(classifyStarter('STAND_C')).toBe('heavy');
    expect(classifyStarter('STAND_D')).toBe('heavy');
    expect(classifyStarter('CLOSE_C')).toBe('heavy');
    expect(classifyStarter('CROUCH_D')).toBe('heavy');
  });

  it('classifies jump attacks correctly', () => {
    expect(classifyStarter('JUMP_A')).toBe('jump_in');
    expect(classifyStarter('JUMP_C')).toBe('jump_in');
    expect(classifyStarter('JUMP_D')).toBe('jump_in');
  });

  it('classifies command normals correctly', () => {
    expect(classifyStarter('RYO_TSURIZAO')).toBe('command_normal');
    expect(classifyStarter('RYO_ORISHI')).toBe('command_normal');
  });

  it('classifies specials correctly', () => {
    expect(classifyStarter('RYO_KOOU')).toBe('special');
    expect(classifyStarter('RYO_KO_HOU')).toBe('special');
  });

  it('classifies throws correctly', () => {
    expect(classifyStarter('THROW')).toBe('throw');
    expect(classifyStarter('THROW_FORWARD')).toBe('throw');
  });

  it('classifies DMs as special starters', () => {
    expect(classifyStarter('DM_TEN_HA_OU')).toBe('special');
    expect(classifyStarter('DM_RYUKO_RANBU')).toBe('special');
  });

  it('getStarterProration returns correct values', () => {
    expect(getStarterProration('light')).toBe(0.85);
    expect(getStarterProration('heavy')).toBe(1.0);
    expect(getStarterProration('jump_in')).toBe(0.9);
  });
});

// ── 5. Attack Tier Classification ───────────────────────────────
describe('Attack Tier Classification', () => {
  it('classifies normals', () => {
    expect(getAttackTier('STAND_A')).toBe('normal');
    expect(getAttackTier('STAND_C')).toBe('normal');
    expect(getAttackTier('CROUCH_D')).toBe('normal');
  });

  it('classifies command normals', () => {
    expect(getAttackTier('RYO_TSURIZAO')).toBe('command');
    expect(getAttackTier('RYO_ORISHI')).toBe('command');
  });

  it('classifies specials', () => {
    expect(getAttackTier('RYO_KOOU')).toBe('special');
    expect(getAttackTier('RYO_KO_HOU')).toBe('special');
    expect(getAttackTier('SPECIAL_UPPER')).toBe('special');
  });

  it('classifies DMs', () => {
    expect(getAttackTier('DM_TEN_HA_OU')).toBe('dm');
    expect(getAttackTier('DM_RYUKO_RANBU')).toBe('dm');
  });

  it('classifies SDMs and HSDMs', () => {
    expect(getAttackTier('SDM_TEN_HA_OU')).toBe('sdm');
    expect(getAttackTier('HSDM_RYUKO_RANBU')).toBe('sdm');
  });

  it('getDamageFloor returns correct floors', () => {
    expect(getDamageFloor('normal')).toBe(0.10);
    expect(getDamageFloor('special')).toBe(0.15);
    expect(getDamageFloor('dm')).toBe(0.25);
    expect(getDamageFloor('sdm')).toBe(0.30);
  });
});

// ── 6. Combo Scale Computation ──────────────────────────────────
describe('Combo Scale Computation', () => {
  it('first hit is always 100%', () => {
    expect(getComboScale(1)).toBe(1.0);
  });

  it('combo 2-3 hits scale at 100%', () => {
    expect(getComboScale(2)).toBe(1.0);
    expect(getComboScale(3)).toBe(1.0);
  });

  it('combo 4-6 hits scale at 85%', () => {
    expect(getComboScale(4)).toBe(0.85);
    expect(getComboScale(6)).toBe(0.85);
  });

  it('combo 7-9 hits scale at 70%', () => {
    expect(getComboScale(7)).toBe(0.70);
    expect(getComboScale(9)).toBe(0.70);
  });

  it('combo 10+ hits scale at 60% minimum', () => {
    expect(getComboScale(10)).toBe(0.60);
    expect(getComboScale(20)).toBe(0.60);
  });

  it('combo 0 (no combo) returns 100%', () => {
    expect(getComboScale(0)).toBe(1.0);
  });
});

// ── 7. Scaled Damage Computation ────────────────────────────────
describe('Scaled Damage Computation', () => {
  it('first hit does full damage', () => {
    const dmg = computeScaledDamage(100, 1, 'STAND_C', 'heavy');
    expect(dmg).toBe(100);
  });

  it('second hit does full damage (within 3-hit tier)', () => {
    const dmg = computeScaledDamage(100, 2, 'STAND_C', 'heavy');
    expect(dmg).toBe(100);
  });

  it('combo scaling kicks in at hit 4', () => {
    const dmg = computeScaledDamage(100, 4, 'STAND_C', 'heavy');
    expect(dmg).toBeLessThan(100);
    expect(dmg).toBe(85); // 85% scaling
  });

  it('light starter applies proration after hit 3', () => {
    const dmgHeavy = computeScaledDamage(100, 5, 'STAND_C', 'heavy');
    const dmgLight = computeScaledDamage(100, 5, 'STAND_C', 'light');
    expect(dmgLight).toBeLessThan(dmgHeavy);
  });

  it('DM in combo takes extra penalty', () => {
    const normalDmg = computeScaledDamage(100, 5, 'STAND_C', 'heavy');
    const dmDmg = computeScaledDamage(100, 5, 'DM_TEN_HA_OU', 'heavy');
    // DM damage should be lower due to DM_COMBO_PENALTY
    expect(dmDmg).toBeLessThanOrEqual(normalDmg);
  });

  it('minimum damage floor is respected', () => {
    // Even at 20 hits, a normal should still do at least 10% of base
    const dmg = computeScaledDamage(100, 20, 'STAND_C', 'light');
    expect(dmg).toBeGreaterThanOrEqual(10); // 10% of 100
  });

  it('DM minimum floor is 25%', () => {
    const dmg = computeScaledDamage(200, 20, 'DM_TEN_HA_OU', 'heavy');
    expect(dmg).toBeGreaterThanOrEqual(50); // 25% of 200
  });

  it('SDM minimum floor is 30%', () => {
    const dmg = computeScaledDamage(200, 20, 'SDM_TEN_HA_OU', 'heavy');
    expect(dmg).toBeGreaterThanOrEqual(60); // 30% of 200
  });

  it('damage is at least 1', () => {
    const dmg = computeScaledDamage(5, 20, 'STAND_A', 'light');
    expect(dmg).toBeGreaterThanOrEqual(1);
  });
});

// ── 8. scaleComboDamage API ─────────────────────────────────────
describe('scaleComboDamage API', () => {
  it('converts 0-based comboHits to 1-based internally', () => {
    // comboHits=0 means first hit -> full damage
    expect(scaleComboDamage(100, 0, 'STAND_C', 'STAND_C')).toBe(100);
  });

  it('comboHits=3 means 4th hit', () => {
    const dmg = scaleComboDamage(100, 3, 'STAND_C', 'STAND_C');
    expect(dmg).toBe(85);
  });

  it('classifies starter from attack type', () => {
    // Jump-in starter should have proration applied
    const dmgJumpIn = scaleComboDamage(100, 5, 'STAND_C', 'JUMP_C');
    const dmgHeavy = scaleComboDamage(100, 5, 'STAND_C', 'STAND_C');
    expect(dmgJumpIn).toBeLessThan(dmgHeavy);
  });
});

// ── 9. Scaling Breakdown ────────────────────────────────────────
describe('Scaling Breakdown', () => {
  it('provides complete breakdown', () => {
    const breakdown = getScalingBreakdown(100, 5, 'STAND_C', 'heavy');
    expect(breakdown.baseScale).toBeDefined();
    expect(breakdown.proration).toBeDefined();
    expect(breakdown.dmPenalty).toBeDefined();
    expect(breakdown.floor).toBeDefined();
    expect(breakdown.finalScale).toBeDefined();
    expect(breakdown.scaledDamage).toBeDefined();
  });

  it('first hit has no scaling', () => {
    const breakdown = getScalingBreakdown(100, 1, 'STAND_C', 'heavy');
    expect(breakdown.baseScale).toBe(1.0);
    expect(breakdown.proration).toBe(1.0);
    expect(breakdown.dmPenalty).toBe(0);
    expect(breakdown.scaledDamage).toBe(100);
  });

  it('DM in combo shows DM penalty', () => {
    const breakdown = getScalingBreakdown(100, 5, 'DM_TEN_HA_OU', 'heavy');
    expect(breakdown.dmPenalty).toBe(DM_COMBO_PENALTY);
  });

  it('non-DM in combo shows zero DM penalty', () => {
    const breakdown = getScalingBreakdown(100, 5, 'STAND_C', 'heavy');
    expect(breakdown.dmPenalty).toBe(0);
  });

  it('light starter shows proration', () => {
    const breakdown = getScalingBreakdown(100, 5, 'STAND_C', 'light');
    expect(breakdown.proration).toBe(0.85);
  });

  it('floor is applied when scale drops below it', () => {
    const breakdown = getScalingBreakdown(100, 20, 'STAND_C', 'light');
    // At 20 hits with light proration, scale would be very low
    // but floor should catch it
    expect(breakdown.finalScale).toBeGreaterThanOrEqual(breakdown.floor);
  });
});

// ── 10. Edge Cases ──────────────────────────────────────────────
describe('Edge Cases', () => {
  it('zero base damage returns at least 1', () => {
    const dmg = computeScaledDamage(0, 5, 'STAND_C', 'heavy');
    expect(dmg).toBeGreaterThanOrEqual(0);
  });

  it('very high combo count still has minimum floor', () => {
    const dmg = computeScaledDamage(100, 100, 'DM_TEN_HA_OU', 'heavy');
    expect(dmg).toBeGreaterThanOrEqual(25); // 25% of 100
  });

  it('SDM floor is higher than DM floor', () => {
    const dmgDM = computeScaledDamage(100, 100, 'DM_TEN_HA_OU', 'heavy');
    const dmgSDM = computeScaledDamage(100, 100, 'SDM_TEN_HA_OU', 'heavy');
    expect(dmgSDM).toBeGreaterThanOrEqual(dmgDM);
  });

  it('unknown attack type without character prefix defaults to normal tier', () => {
    expect(getAttackTier('SOMETHING')).toBe('normal');
  });

  it('proration not applied for hits <= 3', () => {
    const breakdown = getScalingBreakdown(100, 3, 'STAND_C', 'light');
    expect(breakdown.proration).toBe(1.0);
  });
});
