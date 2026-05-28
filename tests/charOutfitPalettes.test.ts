/**
 * Character Outfit & Palette Data Regression Tests
 *
 * Validates CHAR_OUTFIT outfit colors and RYO_PALETTES color variants.
 */
import { describe, it, expect } from 'vitest';
import {
  CHAR_OUTFIT,
  RYO_PALETTES,
  getOutfit,
} from '../src/rendering/skeletal_split/headAndOutfit.js';

const hexPattern = /^#[0-9a-fA-F]{3,6}$/;

// ===== CHAR_OUTFIT =====

describe('CHAR_OUTFIT', () => {
  it('has entries for main characters', () => {
    for (const id of ['kyo', 'iori', 'ryo', 'terry', 'kim', 'leona', 'kdash', 'kula']) {
      expect(CHAR_OUTFIT[id], id).toBeDefined();
    }
  });

  it('all entries have required fields', () => {
    for (const [id, outfit] of Object.entries(CHAR_OUTFIT)) {
      expect(outfit.shirt, `${id} shirt`).toMatch(hexPattern);
      expect(outfit.pants, `${id} pants`).toMatch(hexPattern);
      expect(outfit.belt, `${id} belt`).toMatch(hexPattern);
      expect(outfit.shoes, `${id} shoes`).toMatch(hexPattern);
    }
  });

  it('characters have different shirt colors', () => {
    const shirts = new Set(Object.values(CHAR_OUTFIT).map(v => v.shirt));
    expect(shirts.size).toBeGreaterThan(1);
  });

  it('Ryo has orange gi (shirt == pants)', () => {
    expect(CHAR_OUTFIT.ryo.shirt).toBe(CHAR_OUTFIT.ryo.pants);
  });

  it('count is reasonable (>20 characters)', () => {
    expect(Object.keys(CHAR_OUTFIT).length).toBeGreaterThan(20);
  });
});

// ===== RYO_PALETTES =====

describe('RYO_PALETTES', () => {
  it('has exactly 4 palette variants (A/B/C/D)', () => {
    expect(RYO_PALETTES.length).toBe(4);
  });

  it('all palettes have required color fields', () => {
    const fields = ['shirt', 'pants', 'belt', 'shoes', 'headband', 'hair'] as const;
    for (let i = 0; i < RYO_PALETTES.length; i++) {
      for (const field of fields) {
        expect(RYO_PALETTES[i][field], `palette[${i}].${field}`).toMatch(hexPattern);
      }
    }
  });

  it('each palette has different shirt color', () => {
    const shirts = RYO_PALETTES.map(p => p.shirt);
    expect(new Set(shirts).size).toBe(4);
  });

  it('A palette matches CHAR_OUTFIT.ryo', () => {
    expect(RYO_PALETTES[0].shirt).toBe(CHAR_OUTFIT.ryo.shirt);
    expect(RYO_PALETTES[0].pants).toBe(CHAR_OUTFIT.ryo.pants);
  });

  it('all palettes have same hair color', () => {
    const hairs = RYO_PALETTES.map(p => p.hair);
    expect(new Set(hairs).size).toBe(1);
  });
});

// ===== getOutfit =====

describe('getOutfit', () => {
  it('returns correct outfit for kyo', () => {
    const outfit = getOutfit('kyo');
    expect(outfit.shirt).toBe('#cc4400');
    expect(outfit.pants).toBe('#2a2a55');
  });

  it('returns default for unknown character', () => {
    const outfit = getOutfit('unknown');
    expect(outfit.shirt).toBe('#888');
    expect(outfit.pants).toBe('#556');
  });

  it('returns Ryo A palette by default', () => {
    const outfit = getOutfit('ryo');
    expect(outfit.shirt).toBe('#cc8833');
  });

  it('returns Ryo B palette for colorIndex=1', () => {
    const outfit = getOutfit('ryo', 1);
    expect(outfit.shirt).toBe('#3366cc');
  });

  it('returns Ryo C palette for colorIndex=2', () => {
    const outfit = getOutfit('ryo', 2);
    expect(outfit.shirt).toBe('#cc3333');
  });

  it('returns Ryo D palette for colorIndex=3', () => {
    const outfit = getOutfit('ryo', 3);
    expect(outfit.shirt).toBe('#338833');
  });

  it('clamps colorIndex to valid range', () => {
    const underflow = getOutfit('ryo', -1);
    const overflow = getOutfit('ryo', 99);
    expect(underflow.shirt).toBe(getOutfit('ryo', 0).shirt);
    expect(overflow.shirt).toBe(getOutfit('ryo', 3).shirt);
  });

  it('ignores colorIndex for non-Ryo characters', () => {
    const kyoDefault = getOutfit('kyo');
    const kyoWithColor = getOutfit('kyo', 2);
    expect(kyoDefault.shirt).toBe(kyoWithColor.shirt);
  });
});
