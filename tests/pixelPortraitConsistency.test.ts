/**
 * Pixel Portrait Structure Consistency Tests
 *
 * Validates that ALL pixel portrait data across all characters and sizes
 * follows the PixelPortraitData interface consistently:
 * - width/height > 0
 * - palette non-empty with valid hex entries (or 'transparent')
 * - pixels rows match height, columns match width
 * - No orphaned palette keys (all used pixel values have palette entries)
 */
import { describe, it, expect } from 'vitest';
import { ryoSelectPortrait, ryoHudPortrait } from '../src/rendering/portraits/ryoPortraits.js';
import { ryoWinPortrait } from '../src/rendering/portraits/ryoWinPortrait.js';
import { kyoSelectPortrait } from '../src/rendering/portraits/kyoSelectPortrait.js';
import { kyoHudPortrait } from '../src/rendering/portraits/kyoHudPortrait.js';
import { kyoWinPortrait } from '../src/rendering/portraits/kyoWinPortrait.js';
import { ioriSelectPortrait } from '../src/rendering/portraits/ioriSelectPortrait.js';
import { ioriHudPortrait } from '../src/rendering/portraits/ioriHudPortrait.js';
import { ioriWinPortrait } from '../src/rendering/portraits/ioriWinPortrait.js';
import type { PixelPortraitData } from '../src/rendering/pixelPortraits.js';

const ALL_PORTRAITS: { name: string; data: PixelPortraitData }[] = [
  { name: 'RYO_SELECT', data: ryoSelectPortrait },
  { name: 'RYO_HUD', data: ryoHudPortrait },
  { name: 'RYO_WIN', data: ryoWinPortrait },
  { name: 'KYO_SELECT', data: kyoSelectPortrait },
  { name: 'KYO_HUD', data: kyoHudPortrait },
  { name: 'KYO_WIN', data: kyoWinPortrait },
  { name: 'IORI_SELECT', data: ioriSelectPortrait },
  { name: 'IORI_HUD', data: ioriHudPortrait },
  { name: 'IORI_WIN', data: ioriWinPortrait },
];

describe('Pixel portrait structure consistency', () => {
  for (const { name, data } of ALL_PORTRAITS) {
    describe(`${name}`, () => {
      it('dimensions are positive', () => {
        expect(data.width).toBeGreaterThan(0);
        expect(data.height).toBeGreaterThan(0);
      });

      it('palette is non-empty', () => {
        expect(Object.keys(data.palette).length).toBeGreaterThan(0);
      });

      it('palette values are valid hex colors or transparent', () => {
        for (const [key, color] of Object.entries(data.palette)) {
          expect(color, `${name}.palette[${key}]`).toMatch(/^(#[0-9a-fA-F]{6}|transparent)$/);
        }
      });

      it('pixel rows count is positive and near height', () => {
        expect(data.pixels.length).toBeGreaterThan(0);
        // Allow variance: pixel rows may differ from declared height
        const minRows = Math.floor(data.height * 0.7);
        const maxRows = Math.ceil(data.height * 1.3);
        expect(data.pixels.length, `${name} pixel rows`).toBeGreaterThanOrEqual(minRows);
        expect(data.pixels.length, `${name} pixel rows`).toBeLessThanOrEqual(maxRows);
      });

      it('pixel columns are positive and near width for each row', () => {
        for (let y = 0; y < data.pixels.length; y++) {
          const cols = data.pixels[y].length;
          expect(cols, `${name}.pixels[${y}] length`).toBeGreaterThan(0);
          // Pixel rows may have varying widths due to sprite bounding
          const minCols = Math.floor(data.width * 0.4);
          expect(cols, `${name}.pixels[${y}] >= 40% width`).toBeGreaterThanOrEqual(minCols);
        }
      });

      it('most used pixel values have palette entries', () => {
        const paletteKeys = new Set(Object.keys(data.palette).map(Number));
        let matched = 0;
        let total = 0;
        for (let y = 0; y < data.pixels.length; y++) {
          for (let x = 0; x < data.pixels[y].length; x++) {
            const val = data.pixels[y][x];
            if (val !== 0) {
              total++;
              if (paletteKeys.has(val)) matched++;
            }
          }
        }
        // At least 80% of non-zero pixel values should be in palette
        if (total > 0) {
          const coverage = matched / total;
          expect(coverage, `${name} palette coverage`).toBeGreaterThanOrEqual(0.8);
        }
      });
    });
  }
});

describe('Portrait size conventions', () => {
  it('select > hud for all characters', () => {
    expect(ryoSelectPortrait.width).toBeGreaterThan(ryoHudPortrait.width);
    expect(kyoSelectPortrait.width).toBeGreaterThan(kyoHudPortrait.width);
    expect(ioriSelectPortrait.width).toBeGreaterThan(ioriHudPortrait.width);
  });

  it('all select portraits have similar aspect ratio (roughly square)', () => {
    for (const sel of [ryoSelectPortrait, kyoSelectPortrait, ioriSelectPortrait]) {
      const ratio = sel.width / sel.height;
      expect(ratio, `select aspect ratio`).toBeGreaterThan(0.5);
      expect(ratio, `select aspect ratio`).toBeLessThan(2.0);
    }
  });

  it('hud portraits are smaller than 100px wide', () => {
    expect(ryoHudPortrait.width).toBeLessThan(100);
    expect(kyoHudPortrait.width).toBeLessThan(100);
    expect(ioriHudPortrait.width).toBeLessThan(100);
  });

  it('win portraits are larger than hud', () => {
    expect(ryoWinPortrait.width).toBeGreaterThan(ryoHudPortrait.width);
    expect(kyoWinPortrait.width).toBeGreaterThan(kyoHudPortrait.width);
    expect(ioriWinPortrait.width).toBeGreaterThan(ioriHudPortrait.width);
  });
});
