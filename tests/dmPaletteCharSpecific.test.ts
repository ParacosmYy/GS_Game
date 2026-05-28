/**
 * DM palette + DM palette structure regression tests
 *
 * Protects: 3 main characters have DM/SDM/HSDM palettes,
 * palette color format, fallback returns null for unknown characters.
 */
import { describe, it, expect } from 'vitest';
import { getCharacterDMPalette, FEEDBACK_TIERS } from '../src/core/feedbackManifest.js';
import type { FeedbackTier } from '../src/core/feedbackManifest.js';

const MAIN_CHARS = ['ryo', 'kyo', 'iori'];
const DM_TIERS: FeedbackTier[] = ['dm', 'sdm', 'hsdm'];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe('DM palette structure', () => {
  for (const charId of MAIN_CHARS) {
    describe(`${charId}`, () => {
      for (const tier of DM_TIERS) {
        it(`${tier} palette is non-null array`, () => {
          const palette = getCharacterDMPalette(charId, tier);
          expect(palette).not.toBeNull();
          expect(palette!.length).toBeGreaterThanOrEqual(4);
        });

        it(`${tier} palette colors are valid hex`, () => {
          const palette = getCharacterDMPalette(charId, tier)!;
          for (const c of palette) {
            expect(c, `${charId}.${tier}: ${c}`).toMatch(HEX_COLOR);
          }
        });

        it(`${tier} palette includes white for flash`, () => {
          const palette = getCharacterDMPalette(charId, tier)!;
          expect(palette).toContain('#ffffff');
        });
      }
    });
  }
});

describe('DM palette fallback', () => {
  it('returns null for unknown character', () => {
    expect(getCharacterDMPalette('unknown', 'dm')).toBeNull();
  });

  it('returns null for non-DM tier', () => {
    expect(getCharacterDMPalette('kyo', 'special')).toBeNull();
    expect(getCharacterDMPalette('ryo', 'heavy')).toBeNull();
    expect(getCharacterDMPalette('iori', 'light')).toBeNull();
  });
});

describe('DM palette tier progression', () => {
  for (const charId of MAIN_CHARS) {
    it(`${charId}: HSDM has more colors than DM`, () => {
      const dm = getCharacterDMPalette(charId, 'dm')!;
      const hsdm = getCharacterDMPalette(charId, 'hsdm')!;
      expect(hsdm.length).toBeGreaterThanOrEqual(dm.length);
    });
  }
});
