import { describe, it, expect } from 'vitest';
import { CHAR_OUTFIT, RYO_PALETTES, getOutfit } from '../src/rendering/skeletalParts.js';

describe('skeletalParts', () => {
  it('CHAR_OUTFIT has entries', () => {
    expect(Object.keys(CHAR_OUTFIT).length).toBeGreaterThan(0);
  });
  it('CHAR_OUTFIT ryo has outfit fields', () => {
    const ryo = CHAR_OUTFIT['ryo'];
    expect(ryo).toBeDefined();
    expect(ryo).toHaveProperty('shirt');
    expect(ryo).toHaveProperty('pants');
  });
  it('RYO_PALETTES is non-empty array', () => {
    expect(Array.isArray(RYO_PALETTES)).toBe(true);
    expect(RYO_PALETTES.length).toBeGreaterThan(0);
  });
  it('getOutfit returns outfit for ryo', () => {
    const outfit = getOutfit('ryo');
    expect(outfit).toBeDefined();
    expect(outfit.shirt).toBeDefined();
    expect(outfit.pants).toBeDefined();
  });
  it('getOutfit returns default for unknown', () => {
    const outfit = getOutfit('unknown_char');
    expect(outfit).toBeDefined();
    expect(typeof outfit.shirt).toBe('string');
  });
});
