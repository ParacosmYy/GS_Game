/**
 * Portrait Manifest Validation Tests
 *
 * Validates PORTRAIT_MANIFEST data integrity:
 * - Version is 1
 * - All 33 portrait-manifest characters present
 * - All sizes (select, vs, hud, win) present per character
 * - Dimensions match PORTRAIT_SIZES standards
 * - Fallback colors are valid hex
 * - hasPixelPortrait is true for all current characters
 * - sizedPortraits registry for Ryo/Kyo/Iori
 * - Query functions work correctly
 */
import { describe, it, expect } from 'vitest';
import {
  PORTRAIT_MANIFEST,
  PORTRAIT_SIZES,
  getPortrait,
  getSelectPortrait,
  getHUDPortrait,
  getVSPortrait,
  getWinPortrait,
  hasPixelPortraitData,
  getPortraitFallbackColor,
  getPortraitFallbackAccent,
  hasSizedPortrait,
  type PortraitSize,
} from '../src/core/portraitManifest.js';

const ROSTER = [
  'kyo', 'benimaru', 'iori', 'terry', 'andy', 'joe',
  'kim', 'chang', 'choi',
  'ryo', 'robert', 'takuma',
  'leona', 'ralf', 'clark',
  'athena', 'kensou', 'mai', 'yuri',
  'kdash', 'kula',
  'yashiro', 'shermie', 'chris',
  'mature', 'vice',
  'billy', 'yamazaki', 'rugal', 'g_rugal', 'mary', 'xiangfei', 'kasumi',
];

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const SIZES: PortraitSize[] = ['select', 'vs', 'hud', 'win'];

describe('PORTRAIT_MANIFEST structure', () => {
  it('version is 1', () => {
    expect(PORTRAIT_MANIFEST.version).toBe(1);
  });

  it('has all 33 portrait-manifest characters', () => {
    for (const char of ROSTER) {
      expect(PORTRAIT_MANIFEST.portraits[char], `${char} in manifest`).toBeDefined();
    }
  });

  it('no extra characters beyond roster', () => {
    const manifestChars = Object.keys(PORTRAIT_MANIFEST.portraits);
    expect(manifestChars.length).toBe(ROSTER.length);
  });

  it('each character has all 4 size variants', () => {
    for (const char of ROSTER) {
      for (const size of SIZES) {
        expect(PORTRAIT_MANIFEST.portraits[char][size], `${char} ${size}`).toBeDefined();
      }
    }
  });
});

describe('PORTRAIT_MANIFEST dimensions', () => {
  it('width/height match PORTRAIT_SIZES for each variant', () => {
    for (const char of ROSTER) {
      for (const size of SIZES) {
        const entry = PORTRAIT_MANIFEST.portraits[char][size];
        const expected = PORTRAIT_SIZES[size];
        expect(entry.width, `${char} ${size} width`).toBe(expected.width);
        expect(entry.height, `${char} ${size} height`).toBe(expected.height);
      }
    }
  });

  it('PORTRAIT_SIZES select is 120x120', () => {
    expect(PORTRAIT_SIZES.select).toEqual({ width: 120, height: 120 });
  });

  it('PORTRAIT_SIZES vs is 160x160', () => {
    expect(PORTRAIT_SIZES.vs).toEqual({ width: 160, height: 160 });
  });

  it('PORTRAIT_SIZES hud is 48x48', () => {
    expect(PORTRAIT_SIZES.hud).toEqual({ width: 48, height: 48 });
  });

  it('PORTRAIT_SIZES win is 200x200', () => {
    expect(PORTRAIT_SIZES.win).toEqual({ width: 200, height: 200 });
  });
});

describe('PORTRAIT_MANIFEST fallback colors', () => {
  it('all fallbackColors are valid hex', () => {
    for (const char of ROSTER) {
      for (const size of SIZES) {
        const entry = PORTRAIT_MANIFEST.portraits[char][size];
        expect(entry.fallbackColor, `${char} ${size} fallbackColor`).toMatch(HEX_COLOR_RE);
      }
    }
  });

  it('all fallbackAccents are valid hex', () => {
    for (const char of ROSTER) {
      for (const size of SIZES) {
        const entry = PORTRAIT_MANIFEST.portraits[char][size];
        expect(entry.fallbackAccent, `${char} ${size} fallbackAccent`).toMatch(HEX_COLOR_RE);
      }
    }
  });

  it('colors are consistent across sizes within same character', () => {
    for (const char of ROSTER) {
      const base = PORTRAIT_MANIFEST.portraits[char].hud;
      for (const size of SIZES) {
        const entry = PORTRAIT_MANIFEST.portraits[char][size];
        expect(entry.fallbackColor, `${char} ${size} color consistency`).toBe(base.fallbackColor);
        expect(entry.fallbackAccent, `${char} ${size} accent consistency`).toBe(base.fallbackAccent);
      }
    }
  });
});

describe('PORTRAIT_MANIFEST hasPixelPortrait', () => {
  it('all 33 portrait-manifest characters have hasPixelPortrait=true', () => {
    for (const char of ROSTER) {
      const entry = PORTRAIT_MANIFEST.portraits[char].hud;
      expect(entry.hasPixelPortrait, `${char} hasPixelPortrait`).toBe(true);
    }
  });
});

describe('PORTRAIT_MANIFEST atlas coordinates', () => {
  it('atlasX is consistent per size variant', () => {
    const expectedX: Record<PortraitSize, number> = {
      select: 0, vs: 160, hud: 360, win: 420,
    };
    for (const char of ROSTER) {
      for (const size of SIZES) {
        const entry = PORTRAIT_MANIFEST.portraits[char][size];
        expect(entry.atlasX, `${char} ${size} atlasX`).toBe(expectedX[size]);
      }
    }
  });

  it('atlasY increments by 200 per character', () => {
    const chars = Object.keys(PORTRAIT_MANIFEST.portraits);
    for (let i = 0; i < chars.length; i++) {
      const entry = PORTRAIT_MANIFEST.portraits[chars[i]].hud;
      expect(entry.atlasY, `${chars[i]} atlasY`).toBe(i * 200);
    }
  });
});

describe('Portrait query functions', () => {
  it('getPortrait returns correct entry', () => {
    const entry = getPortrait(PORTRAIT_MANIFEST, 'ryo', 'select');
    expect(entry).toBeDefined();
    expect(entry!.charId).toBe('ryo');
    expect(entry!.size).toBe('select');
  });

  it('getPortrait returns undefined for unknown character', () => {
    expect(getPortrait(PORTRAIT_MANIFEST, 'nonexistent', 'hud')).toBeUndefined();
  });

  it('getSelectPortrait returns select size', () => {
    const entry = getSelectPortrait(PORTRAIT_MANIFEST, 'kyo');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('select');
  });

  it('getHUDPortrait returns hud size', () => {
    const entry = getHUDPortrait(PORTRAIT_MANIFEST, 'iori');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('hud');
  });

  it('getVSPortrait returns vs size', () => {
    const entry = getVSPortrait(PORTRAIT_MANIFEST, 'terry');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('vs');
  });

  it('getWinPortrait returns win size', () => {
    const entry = getWinPortrait(PORTRAIT_MANIFEST, 'leona');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('win');
  });

  it('hasPixelPortraitData returns true for all characters', () => {
    for (const char of ROSTER) {
      expect(hasPixelPortraitData(PORTRAIT_MANIFEST, char), `${char}`).toBe(true);
    }
  });

  it('hasPixelPortraitData returns false for unknown char', () => {
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'nobody')).toBe(false);
  });

  it('getPortraitFallbackColor returns valid hex', () => {
    for (const char of ROSTER) {
      const color = getPortraitFallbackColor(PORTRAIT_MANIFEST, char);
      expect(color, `${char} fallbackColor`).toMatch(HEX_COLOR_RE);
    }
  });

  it('getPortraitFallbackAccent returns valid hex', () => {
    for (const char of ROSTER) {
      const accent = getPortraitFallbackAccent(PORTRAIT_MANIFEST, char);
      expect(accent, `${char} fallbackAccent`).toMatch(HEX_COLOR_RE);
    }
  });

  it('getPortraitFallbackColor returns undefined for unknown char', () => {
    expect(getPortraitFallbackColor(PORTRAIT_MANIFEST, 'nobody')).toBeUndefined();
  });
});

describe('Sized portraits registry', () => {
  it('Ryo has sized portraits for select, vs, hud, win', () => {
    expect(hasSizedPortrait('ryo', 'select')).toBe(true);
    expect(hasSizedPortrait('ryo', 'vs')).toBe(true);
    expect(hasSizedPortrait('ryo', 'hud')).toBe(true);
    expect(hasSizedPortrait('ryo', 'win')).toBe(true);
  });

  it('Kyo has sized portraits for select, vs, hud, win', () => {
    expect(hasSizedPortrait('kyo', 'select')).toBe(true);
    expect(hasSizedPortrait('kyo', 'vs')).toBe(true);
    expect(hasSizedPortrait('kyo', 'hud')).toBe(true);
    expect(hasSizedPortrait('kyo', 'win')).toBe(true);
  });

  it('Iori has sized portraits for select, vs, hud, win', () => {
    expect(hasSizedPortrait('iori', 'select')).toBe(true);
    expect(hasSizedPortrait('iori', 'vs')).toBe(true);
    expect(hasSizedPortrait('iori', 'hud')).toBe(true);
    expect(hasSizedPortrait('iori', 'win')).toBe(true);
  });

  it('other characters do not have sized portraits', () => {
    expect(hasSizedPortrait('terry', 'hud')).toBe(false);
    expect(hasSizedPortrait('mai', 'select')).toBe(false);
  });
});
