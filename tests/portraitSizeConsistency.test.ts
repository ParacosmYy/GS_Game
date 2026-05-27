/**
 * Portrait Size Consistency Test
 *
 * Validates that Ryo, Kyo, and Iori all have complete portrait data
 * for all 4 standard sizes (select, vs, hud, win).
 * Gap matrix 1.1: portrait manifest must cover all sizes.
 */
import { describe, it, expect } from 'vitest';
import { PORTRAIT_SIZES, getPortrait } from '../src/core/portraitManifest.js';
import { getPortraitForSize } from '../src/rendering/manifestRenderData.js';
import type { PortraitSize } from '../src/core/portraitManifest.js';

const MAIN_CHARS = ['ryo', 'kyo', 'iori'] as const;
const REQUIRED_SIZES: PortraitSize[] = ['select', 'vs', 'hud', 'win'];

describe('Portrait size consistency', () => {
  describe('PORTRAIT_SIZES defines all 4 standard sizes', () => {
    it('has select size (120x120)', () => {
      expect(PORTRAIT_SIZES.select).toBeDefined();
      expect(PORTRAIT_SIZES.select.width).toBe(120);
      expect(PORTRAIT_SIZES.select.height).toBe(120);
    });
    it('has vs size (160x160)', () => {
      expect(PORTRAIT_SIZES.vs).toBeDefined();
      expect(PORTRAIT_SIZES.vs.width).toBe(160);
      expect(PORTRAIT_SIZES.vs.height).toBe(160);
    });
    it('has hud size (48x48)', () => {
      expect(PORTRAIT_SIZES.hud).toBeDefined();
      expect(PORTRAIT_SIZES.hud.width).toBe(48);
      expect(PORTRAIT_SIZES.hud.height).toBe(48);
    });
    it('has win size (200x200)', () => {
      expect(PORTRAIT_SIZES.win).toBeDefined();
      expect(PORTRAIT_SIZES.win.width).toBe(200);
      expect(PORTRAIT_SIZES.win.height).toBe(200);
    });
  });

  for (const charId of MAIN_CHARS) {
    describe(`${charId} portrait coverage`, () => {
      for (const size of REQUIRED_SIZES) {
        it(`has ${size} portrait via getPortraitForSize`, () => {
          const portrait = getPortraitForSize(charId, size);
          expect(portrait, `${charId} missing ${size} portrait`).not.toBeNull();
          expect(portrait!.width).toBeGreaterThan(0);
          expect(portrait!.height).toBeGreaterThan(0);
        });

        it(`${size} portrait has pixel data`, () => {
          const portrait = getPortraitForSize(charId, size);
          expect(portrait!.pixels).toBeDefined();
          expect(portrait!.pixels.length).toBeGreaterThan(0);
        });
      }
    });
  }
});
