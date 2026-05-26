/**
 * Ryo Color Palette Tests — verify 4 palette variants (A/B/C/D)
 *
 * Tests cover:
 * - RYO_PALETTES structure and completeness
 * - getOutfit returns correct palette per colorIndex
 * - Default and out-of-range fallback behavior
 * - Hair and headband color support
 */
import { describe, it, expect } from 'vitest';
import { RYO_PALETTES, getOutfit, getHairColor, getHeadbandColor } from '../src/rendering/skeletalParts.js';

describe('RYO_PALETTES', () => {
  it('has exactly 4 palette variants', () => {
    expect(RYO_PALETTES).toHaveLength(4);
  });

  it('each variant has all required color fields', () => {
    const requiredFields = ['shirt', 'pants', 'belt', 'shoes', 'headband', 'hair'];
    for (const palette of RYO_PALETTES) {
      for (const field of requiredFields) {
        expect(palette).toHaveProperty(field);
        expect(typeof (palette as Record<string, string>)[field]).toBe('string');
        expect((palette as Record<string, string>)[field]).toMatch(/^#[0-9a-fA-F]{3,6}$/);
      }
    }
  });

  it('A palette (index 0) is classic orange gi', () => {
    const pal = RYO_PALETTES[0];
    expect(pal.shirt).toBe('#cc8833');
    expect(pal.pants).toBe('#cc8833');
  });

  it('B palette (index 1) is blue gi', () => {
    const pal = RYO_PALETTES[1];
    expect(pal.shirt).toBe('#3366cc');
    expect(pal.pants).toBe('#3366cc');
  });

  it('C palette (index 2) is red gi', () => {
    const pal = RYO_PALETTES[2];
    expect(pal.shirt).toBe('#cc3333');
    expect(pal.pants).toBe('#cc3333');
  });

  it('D palette (index 3) is green gi', () => {
    const pal = RYO_PALETTES[3];
    expect(pal.shirt).toBe('#338833');
    expect(pal.pants).toBe('#338833');
  });
});

describe('getOutfit with colorIndex', () => {
  it('returns correct variant for each index', () => {
    expect(getOutfit('ryo', 0).shirt).toBe('#cc8833');
    expect(getOutfit('ryo', 1).shirt).toBe('#3366cc');
    expect(getOutfit('ryo', 2).shirt).toBe('#cc3333');
    expect(getOutfit('ryo', 3).shirt).toBe('#338833');
  });

  it('default (no colorIndex) returns classic palette for ryo', () => {
    const outfit = getOutfit('ryo');
    expect(outfit.shirt).toBe('#cc8833');
    expect(outfit.pants).toBe('#cc8833');
    expect(outfit.belt).toBe('#333');
    expect(outfit.shoes).toBe('#443322');
  });

  it('out-of-range index falls back to default', () => {
    // Negative index clamps to 0
    expect(getOutfit('ryo', -1).shirt).toBe('#cc8833');
    // Index > 3 clamps to 3
    expect(getOutfit('ryo', 99).shirt).toBe('#338833');
    // Index 4 clamps to 3
    expect(getOutfit('ryo', 4).shirt).toBe('#338833');
  });

  it('colorIndex does not affect non-ryo characters', () => {
    const kyoDefault = getOutfit('kyo');
    const kyoWithColor = getOutfit('kyo', 2);
    expect(kyoDefault).toEqual(kyoWithColor);
  });

  it('all 4 palette variants produce distinct shirt colors', () => {
    const colors = [0, 1, 2, 3].map(i => getOutfit('ryo', i).shirt);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });
});

describe('getHairColor with colorIndex', () => {
  it('returns hair color from Ryo palette', () => {
    // All current Ryo palettes use the same hair color
    expect(getHairColor('ryo', 0)).toBe('#8B6914');
    expect(getHairColor('ryo', 1)).toBe('#8B6914');
    expect(getHairColor('ryo', 2)).toBe('#8B6914');
    expect(getHairColor('ryo', 3)).toBe('#8B6914');
  });

  it('returns default hair color when colorIndex is omitted', () => {
    expect(getHairColor('ryo')).toBe('#8B6914');
  });
});

describe('getHeadbandColor with colorIndex', () => {
  it('headband color can vary between palettes', () => {
    const c0 = getHeadbandColor('ryo', 0);
    const c2 = getHeadbandColor('ryo', 2);
    // C palette has a gold headband, different from the red default
    expect(c2).toBe('#ffcc00');
    expect(c0).toBe('#cc2222');
    // Not all headbands are the same
    expect(c0).not.toBe(c2);
  });

  it('returns default headband for non-ryo characters', () => {
    expect(getHeadbandColor('kyo')).toBe('#cc2222');
    expect(getHeadbandColor('kyo', 2)).toBe('#cc2222');
  });
});
