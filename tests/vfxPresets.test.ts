import { describe, it, expect } from 'vitest';
import { getSparkSizeScaleFromDamage } from '../src/rendering/vfxPresets.js';

describe('vfxPresets getSparkSizeScaleFromDamage', () => {
  it('returns 0.5 for damage 0', () => {
    expect(getSparkSizeScaleFromDamage(0)).toBe(0.5);
  });
  it('returns 0.5 for damage 49', () => {
    expect(getSparkSizeScaleFromDamage(49)).toBe(0.5);
  });
  it('returns 0.8 for damage 50', () => {
    expect(getSparkSizeScaleFromDamage(50)).toBe(0.8);
  });
  it('returns 0.8 for damage 99', () => {
    expect(getSparkSizeScaleFromDamage(99)).toBe(0.8);
  });
  it('returns 1.1 for damage 100', () => {
    expect(getSparkSizeScaleFromDamage(100)).toBe(1.1);
  });
  it('returns 1.4 for damage 150', () => {
    expect(getSparkSizeScaleFromDamage(150)).toBe(1.4);
  });
  it('returns 1.7 for damage 200', () => {
    expect(getSparkSizeScaleFromDamage(200)).toBe(1.7);
  });
  it('returns 1.7 for damage 500', () => {
    expect(getSparkSizeScaleFromDamage(500)).toBe(1.7);
  });
});
