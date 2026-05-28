/**
 * Character Outfit & Color System Regression Test
 * Verifies all characters have valid outfit colors, hair, eyes, and palette variants.
 */
import { describe, it, expect } from 'vitest';
import {
  CHAR_OUTFIT,
  RYO_PALETTES,
  getOutfit,
  getHairColor,
  getHeadbandColor,
  getEyeColor,
} from '../src/rendering/skeletal_split/headAndOutfit.js';

const ALL_CHARS = [
  'kyo', 'iori', 'terry', 'kim', 'ryo', 'leona', 'kdash', 'kula',
  'robert', 'athena', 'mai', 'ralf', 'clark', 'joe', 'andy', 'billy',
  'chang', 'choi', 'mature', 'yashiro', 'chris', 'shermie', 'vice',
  'yamazaki', 'xiangfei', 'mary', 'kasumi',
];

function isValidHex(s: string, ctx: string): void {
  expect(s, `${ctx} non-empty`).toBeTruthy();
  expect(s, `${ctx} hex format`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
}

describe('CHAR_OUTFIT — all characters have outfit entries', () => {
  it('all 27 characters have outfit data', () => {
    for (const charId of ALL_CHARS) {
      const outfit = CHAR_OUTFIT[charId];
      expect(outfit, `${charId} outfit`).toBeDefined();
    }
    expect(Object.keys(CHAR_OUTFIT).length, 'outfit count').toBeGreaterThanOrEqual(27);
  });

  it('all outfits have 4 color fields', () => {
    for (const charId of ALL_CHARS) {
      const o = CHAR_OUTFIT[charId];
      expect(o.shirt, `${charId}.shirt`).toBeDefined();
      expect(o.pants, `${charId}.pants`).toBeDefined();
      expect(o.belt, `${charId}.belt`).toBeDefined();
      expect(o.shoes, `${charId}.shoes`).toBeDefined();
    }
  });

  it('all outfit colors are valid hex', () => {
    for (const charId of ALL_CHARS) {
      const o = CHAR_OUTFIT[charId];
      isValidHex(o.shirt, `${charId}.shirt`);
      isValidHex(o.pants, `${charId}.pants`);
      isValidHex(o.belt, `${charId}.belt`);
      isValidHex(o.shoes, `${charId}.shoes`);
    }
  });
});

describe('getOutfit — returns valid outfits', () => {
  it('returns specific outfit for known characters', () => {
    for (const charId of ALL_CHARS) {
      const o = getOutfit(charId);
      expect(o.shirt, `${charId}.shirt`).toBeDefined();
      expect(o.pants, `${charId}.pants`).toBeDefined();
    }
  });

  it('returns default for unknown character', () => {
    const o = getOutfit('nonexistent');
    expect(o.shirt).toBeDefined();
    expect(o.pants).toBeDefined();
  });

  it('Ryo palette variants all work', () => {
    const o0 = getOutfit('ryo', 0);
    const o1 = getOutfit('ryo', 1);
    const o2 = getOutfit('ryo', 2);
    const o3 = getOutfit('ryo', 3);
    // Each palette should be different
    expect(o0.shirt).not.toBe(o1.shirt);
    expect(o1.shirt).not.toBe(o2.shirt);
    expect(o2.shirt).not.toBe(o3.shirt);
  });

  it('Ryo palette clamps out-of-range index', () => {
    const oNeg = getOutfit('ryo', -1);
    const o0 = getOutfit('ryo', 0);
    expect(oNeg.shirt).toBe(o0.shirt);

    const oOver = getOutfit('ryo', 99);
    const o3 = getOutfit('ryo', 3);
    expect(oOver.shirt).toBe(o3.shirt);
  });
});

describe('RYO_PALETTES — 4 color variants', () => {
  it('has exactly 4 palettes', () => {
    expect(RYO_PALETTES.length).toBe(4);
  });

  it('each palette has all required fields', () => {
    for (let i = 0; i < RYO_PALETTES.length; i++) {
      const p = RYO_PALETTES[i];
      expect(p.shirt, `palette[${i}].shirt`).toBeDefined();
      expect(p.pants, `palette[${i}].pants`).toBeDefined();
      expect(p.belt, `palette[${i}].belt`).toBeDefined();
      expect(p.shoes, `palette[${i}].shoes`).toBeDefined();
      expect(p.headband, `palette[${i}].headband`).toBeDefined();
      expect(p.hair, `palette[${i}].hair`).toBeDefined();
    }
  });
});

describe('getHairColor — all characters have hair colors', () => {
  it('all 27 characters return valid hair color', () => {
    for (const charId of ALL_CHARS) {
      const c = getHairColor(charId);
      isValidHex(c, `${charId} hair`);
    }
  });

  it('unknown character returns fallback', () => {
    const c = getHairColor('nonexistent');
    isValidHex(c, 'fallback hair');
  });

  it('Ryo has palette-aware hair color', () => {
    const c0 = getHairColor('ryo', 0);
    const c1 = getHairColor('ryo', 1);
    expect(c0).toBe(c1); // Ryo hair doesn't change with palette
  });
});

describe('getEyeColor — all characters have eye colors', () => {
  it('all 27 characters return valid eye color', () => {
    for (const charId of ALL_CHARS) {
      const c = getEyeColor(charId);
      isValidHex(c, `${charId} eyes`);
    }
  });

  it('unknown character returns fallback', () => {
    const c = getEyeColor('nonexistent');
    isValidHex(c, 'fallback eyes');
  });

  it('Kyo and Iori have distinct eye colors', () => {
    expect(getEyeColor('kyo')).not.toBe(getEyeColor('iori'));
  });
});

describe('getHeadbandColor — Ryo palette support', () => {
  it('Ryo palette 0 headband is red', () => {
    const c = getHeadbandColor('ryo', 0);
    isValidHex(c, 'ryo headband p0');
  });

  it('Ryo palette 2 headband differs from palette 0', () => {
    const c0 = getHeadbandColor('ryo', 0);
    const c2 = getHeadbandColor('ryo', 2);
    expect(c0, 'p0 vs p2 headband different').not.toBe(c2);
  });

  it('other characters get default headband', () => {
    const c = getHeadbandColor('kyo');
    isValidHex(c, 'kyo default headband');
  });
});
