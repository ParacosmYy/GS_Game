import { describe, it, expect } from 'vitest';
import { RYO_HITBOX_KEYS, getRyoHitboxOffsets, RYO_ATTACK_FRAME_KEYS } from '../src/content/characters/ryo/hitboxes.js';

describe('ryoHitboxes', () => {
  it('RYO_HITBOX_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_HITBOX_KEYS)).toBe(true);
    expect(RYO_HITBOX_KEYS.length).toBeGreaterThan(0);
  });
  it('getRyoHitboxOffsets returns object', () => {
    const offsets = getRyoHitboxOffsets();
    expect(offsets).toBeDefined();
    expect(typeof offsets).toBe('object');
  });
  it('RYO_ATTACK_FRAME_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_ATTACK_FRAME_KEYS)).toBe(true);
    expect(RYO_ATTACK_FRAME_KEYS.length).toBeGreaterThan(0);
  });
  it('RYO_HITBOX_KEYS contains RYO_KOOU', () => {
    expect(RYO_HITBOX_KEYS).toContain('RYO_KOOU');
  });
  it('getRyoHitboxOffsets has RYO_KOOU entry', () => {
    const offsets = getRyoHitboxOffsets();
    expect(offsets).toHaveProperty('RYO_KOOU');
  });
});
