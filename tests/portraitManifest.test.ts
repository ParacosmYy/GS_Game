/**
 * Portrait Manifest Regression Test
 * Verifies portrait sizes, query functions, and manifest data consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  PORTRAIT_SIZES,
  PORTRAIT_MANIFEST,
  getPortrait,
  getSelectPortrait,
  getHUDPortrait,
  getVSPortrait,
  getWinPortrait,
  hasPixelPortraitData,
  getPortraitFallbackColor,
  getPortraitFallbackAccent,
  type PortraitSize,
  type PortraitManifest,
} from '../src/core/portraitManifest.js';

const ALL_SIZES: PortraitSize[] = ['select', 'vs', 'hud', 'win'];

describe('PORTRAIT_SIZES', () => {
  it('has all 4 size variants', () => {
    for (const size of ALL_SIZES) {
      expect(PORTRAIT_SIZES[size], size).toBeDefined();
      expect(PORTRAIT_SIZES[size].width, `${size} width`).toBeGreaterThan(0);
      expect(PORTRAIT_SIZES[size].height, `${size} height`).toBeGreaterThan(0);
    }
  });

  it('select is 120x120', () => {
    expect(PORTRAIT_SIZES.select).toEqual({ width: 120, height: 120 });
  });

  it('vs is 160x160', () => {
    expect(PORTRAIT_SIZES.vs).toEqual({ width: 160, height: 160 });
  });

  it('hud is 48x48', () => {
    expect(PORTRAIT_SIZES.hud).toEqual({ width: 48, height: 48 });
  });

  it('win is 200x200', () => {
    expect(PORTRAIT_SIZES.win).toEqual({ width: 200, height: 200 });
  });

  it('vs > select > hud in size', () => {
    expect(PORTRAIT_SIZES.vs.width).toBeGreaterThan(PORTRAIT_SIZES.select.width);
    expect(PORTRAIT_SIZES.select.width).toBeGreaterThan(PORTRAIT_SIZES.hud.width);
  });
});

describe('Query functions with mock manifest', () => {
  const mockManifest: PortraitManifest = {
    version: 1,
    portraits: {
      testchar: {
        select: { charId: 'testchar', size: 'select', atlasX: 0, atlasY: 0, width: 120, height: 120, fallbackColor: '#ff0000', fallbackAccent: '#00ff00', hasPixelPortrait: true },
        vs: { charId: 'testchar', size: 'vs', atlasX: 160, atlasY: 0, width: 160, height: 160, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
        hud: { charId: 'testchar', size: 'hud', atlasX: 360, atlasY: 0, width: 48, height: 48, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
        win: { charId: 'testchar', size: 'win', atlasX: 420, atlasY: 0, width: 200, height: 200, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
      },
    },
  };

  it('getPortrait returns entry for valid char+size', () => {
    expect(getPortrait(mockManifest, 'testchar', 'select')).toBeDefined();
    expect(getPortrait(mockManifest, 'testchar', 'hud')!.width).toBe(48);
  });

  it('getPortrait returns undefined for unknown char', () => {
    expect(getPortrait(mockManifest, 'unknown', 'select')).toBeUndefined();
  });

  it('getSelectPortrait convenience', () => {
    expect(getSelectPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getHUDPortrait convenience', () => {
    expect(getHUDPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getVSPortrait convenience', () => {
    expect(getVSPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getWinPortrait convenience', () => {
    expect(getWinPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('hasPixelPortraitData returns true when set', () => {
    expect(hasPixelPortraitData(mockManifest, 'testchar', 'select')).toBe(true);
  });

  it('hasPixelPortraitData returns false when not set', () => {
    expect(hasPixelPortraitData(mockManifest, 'testchar', 'vs')).toBe(false);
  });

  it('getPortraitFallbackColor returns color', () => {
    expect(getPortraitFallbackColor(mockManifest, 'testchar', 'hud')).toBe('#ff0000');
  });

  it('getPortraitFallbackAccent returns accent', () => {
    expect(getPortraitFallbackAccent(mockManifest, 'testchar', 'hud')).toBe('#00ff00');
  });

  it('fallback queries return undefined for unknown char', () => {
    expect(getPortraitFallbackColor(mockManifest, 'nobody')).toBeUndefined();
    expect(getPortraitFallbackAccent(mockManifest, 'nobody')).toBeUndefined();
  });
});

describe('PORTRAIT_MANIFEST global', () => {
  it('has version 1', () => {
    expect(PORTRAIT_MANIFEST.version).toBe(1);
  });

  it('portraits is an object', () => {
    expect(typeof PORTRAIT_MANIFEST.portraits).toBe('object');
  });
});
