import { describe, it, expect } from 'vitest';
import { RYO_ATTACK_KEYS, getRyoFrameData, getRyoAttackFrameData } from '../src/content/characters/ryo/attacks.js';

describe('ryoAttacks', () => {
  it('RYO_ATTACK_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_ATTACK_KEYS)).toBe(true);
    expect(RYO_ATTACK_KEYS.length).toBeGreaterThan(0);
  });
  it('getRyoFrameData returns object', () => {
    const data = getRyoFrameData();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });
  it('getRyoAttackFrameData returns entry for valid key', () => {
    const firstKey = RYO_ATTACK_KEYS[0];
    const entry = getRyoAttackFrameData(firstKey);
    expect(entry).toBeDefined();
  });
  it('getRyoAttackFrameData returns undefined for invalid key', () => {
    const entry = getRyoAttackFrameData('nonexistent_attack');
    expect(entry).toBeUndefined();
  });
  it('RYO_ATTACK_KEYS contains STAND_A', () => {
    expect(RYO_ATTACK_KEYS).toContain('STAND_A');
  });
});
