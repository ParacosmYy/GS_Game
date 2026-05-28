/**
 * Ryo Hitbox Data Regression Tests
 *
 * Validates hitbox key arrays, offset lookups, and attack frame lookups
 * for the Ryo content package.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_HITBOX_KEYS, getRyoHitboxOffsets,
  RYO_ATTACK_FRAME_KEYS, getRyoAttackFrames,
} from '../src/content/characters/ryo/hitboxes/ryoHitboxes.js';

describe('Ryo Hitbox Keys', () => {
  it('has at least 14 entries', () => {
    expect(RYO_HITBOX_KEYS.length).toBeGreaterThanOrEqual(14);
  });

  it('has command normals', () => {
    expect(RYO_HITBOX_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_HITBOX_KEYS).toContain('RYO_ORISHI');
  });

  it('has specials', () => {
    expect(RYO_HITBOX_KEYS).toContain('RYO_KOOU');
    expect(RYO_HITBOX_KEYS).toContain('RYO_KOOU_C');
    expect(RYO_HITBOX_KEYS).toContain('RYO_KO_HOU');
    expect(RYO_HITBOX_KEYS).toContain('RYO_KO_HOU_C');
    expect(RYO_HITBOX_KEYS).toContain('RYO_HIEN');
    expect(RYO_HITBOX_KEYS).toContain('RYO_ZANRETSU_KEN');
  });

  it('has DM/SDM/HSDM', () => {
    expect(RYO_HITBOX_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_HITBOX_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_HITBOX_KEYS).toContain('SDM_RYUKO_RANBU');
    expect(RYO_HITBOX_KEYS).toContain('HSDM_RYUKO_RANBU');
  });

  it('no duplicate keys', () => {
    const unique = new Set(RYO_HITBOX_KEYS);
    expect(unique.size).toBe(RYO_HITBOX_KEYS.length);
  });
});

describe('Ryo Hitbox Lookups', () => {
  it('getRyoHitboxOffset returns an object', () => {
    const offsets = getRyoHitboxOffsets();
    expect(typeof offsets).toBe('object');
  });
});

describe('Ryo Attack Frame Keys', () => {
  it('has at least 14 entries', () => {
    expect(RYO_ATTACK_FRAME_KEYS.length).toBeGreaterThanOrEqual(14);
  });

  it('has specials', () => {
    expect(RYO_ATTACK_FRAME_KEYS).toContain('RYO_KOOU');
    expect(RYO_ATTACK_FRAME_KEYS).toContain('RYO_KO_HOU');
    expect(RYO_ATTACK_FRAME_KEYS).toContain('RYO_HIEN');
  });

  it('has DM/SDM/HSDM', () => {
    expect(RYO_ATTACK_FRAME_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_ATTACK_FRAME_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_ATTACK_FRAME_KEYS).toContain('HSDM_RYUKO_RANBU');
  });

  it('no duplicate keys', () => {
    const unique = new Set(RYO_ATTACK_FRAME_KEYS);
    expect(unique.size).toBe(RYO_ATTACK_FRAME_KEYS.length);
  });

  it('getRyoAttackFrames returns an object', () => {
    const frames = getRyoAttackFrames();
    expect(typeof frames).toBe('object');
  });

  it('attack frame keys are a superset of hitbox keys', () => {
    // Attack frame keys may have extra entries (e.g. SDM_TEN_HA_OU)
    const hitboxSet = new Set(RYO_HITBOX_KEYS);
    for (const key of hitboxSet) {
      expect(RYO_ATTACK_FRAME_KEYS, `${key} in attack frame keys`).toContain(key);
    }
  });
});
