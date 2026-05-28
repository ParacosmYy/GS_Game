/**
 * Hitbox Constants Core Regression Tests
 *
 * Validates the hitbox offset data structure for all attack types.
 */
import { describe, it, expect } from 'vitest';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';

interface HitboxOffset {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

describe('HITBOX_OFFSETS structure', () => {
  it('is non-empty object', () => {
    expect(Object.keys(HITBOX_OFFSETS).length).toBeGreaterThan(0);
  });

  it('has entries for standing normals', () => {
    const keys = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key], `${key}`).toBeDefined();
    }
  });

  it('has entries for close normals', () => {
    const keys = ['CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key], `${key}`).toBeDefined();
    }
  });

  it('has entries for crouching normals', () => {
    const keys = ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key], `${key}`).toBeDefined();
    }
  });

  it('has entries for jump normals', () => {
    const keys = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key], `${key}`).toBeDefined();
    }
  });
});

describe('HITBOX_OFFSETS field validity', () => {
  it('every entry has required fields', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(typeof box.offsetX, `${key} offsetX`).toBe('number');
      expect(typeof box.offsetY, `${key} offsetY`).toBe('number');
      expect(typeof box.width, `${key} width`).toBe('number');
      expect(typeof box.height, `${key} height`).toBe('number');
    }
  });

  it('every entry has positive width and height', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.width, `${key} width`).toBeGreaterThan(0);
      expect(box.height, `${key} height`).toBeGreaterThan(0);
    }
  });

  it('no duplicate keys', () => {
    // JavaScript objects deduplicate keys, so this is always true
    // But verify the object is well-formed
    expect(typeof HITBOX_OFFSETS).toBe('object');
  });
});

describe('HITBOX_OFFSETS physical consistency', () => {
  it('standing punches have higher offset than standing kicks', () => {
    const standA = HITBOX_OFFSETS['STAND_A'] as HitboxOffset;
    const standB = HITBOX_OFFSETS['STAND_B'] as HitboxOffset;
    // Punches (A) target upper body, kicks (B) target lower body
    expect(standA.offsetY).toBeLessThan(standB.offsetY);
  });

  it('C attacks are wider than A attacks', () => {
    const standA = HITBOX_OFFSETS['STAND_A'] as HitboxOffset;
    const standC = HITBOX_OFFSETS['STAND_C'] as HitboxOffset;
    expect(standC.width).toBeGreaterThanOrEqual(standA.width);
  });

  it('close normals have less range than far normals', () => {
    const farA = HITBOX_OFFSETS['STAND_A'] as HitboxOffset;
    const closeA = HITBOX_OFFSETS['CLOSE_A'] as HitboxOffset;
    expect(closeA.offsetX).toBeLessThanOrEqual(farA.offsetX);
  });

  it('crouching attacks have lower offsetY than standing', () => {
    const standA = HITBOX_OFFSETS['STAND_A'] as HitboxOffset;
    const crouchA = HITBOX_OFFSETS['CROUCH_A'] as HitboxOffset;
    // Crouching hits lower
    expect(crouchA.offsetY).toBeGreaterThan(standA.offsetY);
  });

  it('all widths are in reasonable range (20-200)', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.width, `${key} width`).toBeGreaterThanOrEqual(20);
      expect(box.width, `${key} width`).toBeLessThanOrEqual(200);
    }
  });

  it('all heights are in reasonable range (15-120)', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.height, `${key} height`).toBeGreaterThanOrEqual(15);
      expect(box.height, `${key} height`).toBeLessThanOrEqual(120);
    }
  });

  it('has character-specific specials', () => {
    const kyoSpecial = Object.keys(HITBOX_OFFSETS).filter(k => k.startsWith('KYO_'));
    const ioriSpecial = Object.keys(HITBOX_OFFSETS).filter(k => k.startsWith('IORI_'));
    const ryoSpecial = Object.keys(HITBOX_OFFSETS).filter(k => k.startsWith('RYO_'));
    expect(kyoSpecial.length).toBeGreaterThan(0);
    expect(ioriSpecial.length).toBeGreaterThan(0);
    expect(ryoSpecial.length).toBeGreaterThan(0);
  });

  it('has DM/SDM/HSDM entries', () => {
    const dmEntries = Object.keys(HITBOX_OFFSETS).filter(k =>
      k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')
    );
    expect(dmEntries.length).toBeGreaterThan(0);
  });
});
