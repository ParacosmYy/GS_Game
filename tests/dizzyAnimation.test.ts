/**
 * Dizzy Animation Registration Regression Test
 * Validates all 3 characters have DIZZY frames registered and the
 * dizzy state is correctly resolved in their high-res renderers.
 */
import { describe, it, expect } from 'vitest';
import { hasHighResFrame as hasRyoFrame } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { FighterState } from '../src/core/types.js';
import { RYO_DIZZY_FRAMES } from '../src/rendering/sprites/ryo/ryoDizzyFrames.js';
import { KYO_DIZZY_FRAMES } from '../src/rendering/sprites/kyo/kyoDizzyFrames.js';
import { IORI_DIZZY_FRAMES } from '../src/rendering/sprites/iori/ioriDizzyFrames.js';

const DZ = FighterState.DIZZY;

describe('Dizzy animation registration', () => {
  it('Ryo has DIZZY frame registered', () => {
    expect(hasRyoFrame('ryo', DZ, null)).toBe(true);
  });

  it('Kyo has DIZZY frame registered', () => {
    expect(hasKyoHighResFrame(DZ, null)).toBe(true);
  });

  it('Iori has DIZZY frame registered', () => {
    expect(hasIoriHighResFrame(DZ, null)).toBe(true);
  });
});

describe('Dizzy animation frame data integrity', () => {
  it('Ryo has at least 4 dizzy frames', () => {
    expect(RYO_DIZZY_FRAMES.length).toBeGreaterThanOrEqual(4);
  });

  it('Kyo has at least 4 dizzy frames', () => {
    expect(KYO_DIZZY_FRAMES.length).toBeGreaterThanOrEqual(4);
  });

  it('Iori has at least 6 dizzy frames', () => {
    expect(IORI_DIZZY_FRAMES.length).toBeGreaterThanOrEqual(6);
  });

  const frameSets = [
    ['Ryo', RYO_DIZZY_FRAMES],
    ['Kyo', KYO_DIZZY_FRAMES],
    ['Iori', IORI_DIZZY_FRAMES],
  ] as const;

  for (const [name, frames] of frameSets) {
    it(`${name} dizzy frames have valid dimensions`, () => {
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        expect(f.width).toBeGreaterThan(0);
        expect(f.height).toBeGreaterThan(0);
        expect(f.pixels.length).toBeGreaterThan(0);
        expect(f.palette).toBeDefined();
      }
    });
  }
});
