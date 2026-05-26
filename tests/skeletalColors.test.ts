import { describe, it, expect } from 'vitest';
import { getHairColor, getHeadbandColor, getEyeColor } from '../src/rendering/skeletalParts.js';

describe('skeletalParts color functions', () => {
  it('getHairColor returns string for ryo', () => {
    const c = getHairColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getHairColor returns string for kyo', () => {
    const c = getHairColor('kyo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getHeadbandColor returns string for ryo', () => {
    const c = getHeadbandColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getEyeColor returns string for ryo', () => {
    const c = getEyeColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('colorIndex parameter works for ryo', () => {
    const c0 = getHairColor('ryo', 0);
    const c1 = getHairColor('ryo', 1);
    expect(typeof c0).toBe('string');
    expect(typeof c1).toBe('string');
  });
});
