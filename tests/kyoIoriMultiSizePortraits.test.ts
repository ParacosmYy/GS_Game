/**
 * Kyo & Iori Multi-Size Pixel Portrait Tests
 *
 * Validates all 6 multi-size portrait files (select/hud/win) for both characters.
 * These were not covered by allPixelPortraits.test.ts which only tests base portraits.
 */
import { describe, it, expect } from 'vitest';
import type { PixelPortraitData } from '../src/rendering/pixelPortraits.js';
import { kyoSelectPortrait } from '../src/rendering/portraits/kyoSelectPortrait.js';
import { kyoHudPortrait } from '../src/rendering/portraits/kyoHudPortrait.js';
import { kyoWinPortrait } from '../src/rendering/portraits/kyoWinPortrait.js';
import { ioriSelectPortrait } from '../src/rendering/portraits/ioriSelectPortrait.js';
import { ioriHudPortrait } from '../src/rendering/portraits/ioriHudPortrait.js';
import { ioriWinPortrait } from '../src/rendering/portraits/ioriWinPortrait.js';

function validatePortrait(p: PixelPortraitData, label: string) {
  describe(`${label}`, () => {
    it('has width > 0', () => {
      expect(p.width, `${label}.width`).toBeGreaterThan(0);
    });
    it('has height > 0', () => {
      expect(p.height, `${label}.height`).toBeGreaterThan(0);
    });
    it('has palette', () => {
      expect(p.palette).toBeDefined();
      expect(Object.keys(p.palette).length, `${label}.palette entries`).toBeGreaterThan(0);
    });
    it('has pixel rows', () => {
      expect(p.pixels.length, `${label}.pixels rows`).toBeGreaterThan(0);
    });
    it('pixel rows have columns', () => {
      for (let y = 0; y < p.pixels.length; y++) {
        expect(p.pixels[y].length, `${label}.pixels[${y}] cols`).toBeGreaterThan(0);
      }
    });
  });
}

// ===== Kyo =====
validatePortrait(kyoSelectPortrait, 'KYO_SELECT');
validatePortrait(kyoHudPortrait, 'KYO_HUD');
validatePortrait(kyoWinPortrait, 'KYO_WIN');

// ===== Iori =====
validatePortrait(ioriSelectPortrait, 'IORI_SELECT');
validatePortrait(ioriHudPortrait, 'IORI_HUD');
validatePortrait(ioriWinPortrait, 'IORI_WIN');

// ===== Size expectations =====
describe('Multi-size portrait size expectations', () => {
  it('select portraits are larger than hud portraits (Kyo)', () => {
    expect(kyoSelectPortrait.width).toBeGreaterThan(kyoHudPortrait.width);
  });
  it('select portraits are larger than hud portraits (Iori)', () => {
    expect(ioriSelectPortrait.width).toBeGreaterThan(ioriHudPortrait.width);
  });
  it('win portraits have valid dimensions (Kyo)', () => {
    expect(kyoWinPortrait.width).toBeGreaterThan(0);
    expect(kyoWinPortrait.height).toBeGreaterThan(0);
  });
  it('win portraits have valid dimensions (Iori)', () => {
    expect(ioriWinPortrait.width).toBeGreaterThan(0);
    expect(ioriWinPortrait.height).toBeGreaterThan(0);
  });
});
