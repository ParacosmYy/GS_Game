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
} from '../src/core/portraitManifest.js';

describe('portraitManifest', () => {
  describe('PORTRAIT_MANIFEST structure', () => {
    it('has version 1', () => {
      expect(PORTRAIT_MANIFEST.version).toBe(1);
    });

    it('contains ryo entry', () => {
      expect(PORTRAIT_MANIFEST.portraits).toHaveProperty('ryo');
    });

    it('ryo has all 4 size variants', () => {
      const ryo = PORTRAIT_MANIFEST.portraits.ryo;
      expect(ryo).toHaveProperty('select');
      expect(ryo).toHaveProperty('vs');
      expect(ryo).toHaveProperty('hud');
      expect(ryo).toHaveProperty('win');
    });

    it('ryo has hasPixelPortrait=true', () => {
      expect(PORTRAIT_MANIFEST.portraits.ryo.hud.hasPixelPortrait).toBe(true);
    });

    it('ryo fallbackColor matches outfit color', () => {
      const ryo = PORTRAIT_MANIFEST.portraits.ryo.hud;
      expect(ryo.fallbackColor).toBe('#DD6600');
    });

    it('ryo fallbackAccent matches hair color', () => {
      const ryo = PORTRAIT_MANIFEST.portraits.ryo.hud;
      expect(ryo.fallbackAccent).toBe('#8B4513');
    });

    it('all entries for ryo have correct charId', () => {
      const sizes = ['select', 'vs', 'hud', 'win'] as const;
      for (const size of sizes) {
        expect(PORTRAIT_MANIFEST.portraits.ryo[size].charId).toBe('ryo');
      }
    });

    it('portrait dimensions match PORTRAIT_SIZES', () => {
      const ryo = PORTRAIT_MANIFEST.portraits.ryo;
      for (const [size, dims] of Object.entries(PORTRAIT_SIZES)) {
        expect(ryo[size as keyof typeof ryo].width).toBe(dims.width);
        expect(ryo[size as keyof typeof ryo].height).toBe(dims.height);
      }
    });
  });

  describe('query functions', () => {
    it('getPortrait returns ryo hud portrait', () => {
      const p = getPortrait(PORTRAIT_MANIFEST, 'ryo', 'hud');
      expect(p).toBeDefined();
      expect(p!.charId).toBe('ryo');
      expect(p!.size).toBe('hud');
    });

    it('getPortrait returns undefined for unknown char', () => {
      expect(getPortrait(PORTRAIT_MANIFEST, 'unknown', 'hud')).toBeUndefined();
    });

    it('getSelectPortrait returns select variant', () => {
      const p = getSelectPortrait(PORTRAIT_MANIFEST, 'ryo');
      expect(p).toBeDefined();
      expect(p!.size).toBe('select');
    });

    it('getHUDPortrait returns hud variant', () => {
      const p = getHUDPortrait(PORTRAIT_MANIFEST, 'ryo');
      expect(p).toBeDefined();
      expect(p!.size).toBe('hud');
    });

    it('getVSPortrait returns vs variant', () => {
      const p = getVSPortrait(PORTRAIT_MANIFEST, 'ryo');
      expect(p).toBeDefined();
      expect(p!.size).toBe('vs');
    });

    it('getWinPortrait returns win variant', () => {
      const p = getWinPortrait(PORTRAIT_MANIFEST, 'ryo');
      expect(p).toBeDefined();
      expect(p!.size).toBe('win');
    });
  });

  describe('convenience getters', () => {
    it('hasPixelPortraitData returns true for ryo', () => {
      expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'ryo')).toBe(true);
    });

    it('hasPixelPortraitData returns false for unknown', () => {
      expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'unknown')).toBe(false);
    });

    it('getPortraitFallbackColor returns ryo outfit color', () => {
      expect(getPortraitFallbackColor(PORTRAIT_MANIFEST, 'ryo')).toBe('#DD6600');
    });

    it('getPortraitFallbackAccent returns ryo hair color', () => {
      expect(getPortraitFallbackAccent(PORTRAIT_MANIFEST, 'ryo')).toBe('#8B4513');
    });

    it('getPortraitFallbackColor returns undefined for unknown', () => {
      expect(getPortraitFallbackColor(PORTRAIT_MANIFEST, 'unknown')).toBeUndefined();
    });
  });

  describe('Ryo portrait pixel data completeness', () => {
    it('ryoPortrait has 64x80 dimensions', async () => {
      const { ryoPortrait } = await import('../src/rendering/portraits/ryoPortrait.js');
      expect(ryoPortrait.width).toBe(64);
      expect(ryoPortrait.height).toBe(80);
    });

    it('ryoPortrait has correct pixel row count', async () => {
      const { ryoPortrait } = await import('../src/rendering/portraits/ryoPortrait.js');
      expect(ryoPortrait.pixels.length).toBe(80);
    });

    it('ryoPortrait pixel rows are valid (length <= 64, trailing transparent may be omitted)', async () => {
      const { ryoPortrait } = await import('../src/rendering/portraits/ryoPortrait.js');
      for (let i = 0; i < ryoPortrait.pixels.length; i++) {
        // Rows may have trailing transparent (0) values omitted
        expect(ryoPortrait.pixels[i].length).toBeLessThanOrEqual(64);
        expect(ryoPortrait.pixels[i].length).toBeGreaterThan(0);
      }
    });

    it('ryoPortrait palette has expected key colors', async () => {
      const { ryoPortrait } = await import('../src/rendering/portraits/ryoPortrait.js');
      expect(ryoPortrait.palette[0]).toBe('transparent');
      expect(ryoPortrait.palette[1]).toBeDefined();
      expect(ryoPortrait.palette[8]).toBeDefined();
      expect(ryoPortrait.palette[13]).toBeDefined();
      expect(ryoPortrait.palette[19]).toBe('#d83030');
    });
  });
});
