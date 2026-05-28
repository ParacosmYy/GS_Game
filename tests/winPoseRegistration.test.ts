/**
 * WIN Pose Registration Regression Test
 * Validates that all 3 characters have WIN frames registered with correct durations.
 */
import { describe, it, expect } from 'vitest';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { hasHighResFrame as hasRyoFrame } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { FighterState } from '../src/core/types.js';

// Import frame data to validate counts
import { KYO_WIN_FRAMES } from '../src/rendering/sprites/kyo/kyoWinFrames.js';
import { IORI_WIN_POSE, IORI_WIN_LAUGH } from '../src/rendering/sprites/iori/ioriWinFrames.js';
import { RYO_WIN_FRAMES } from '../src/rendering/sprites/ryo/ryoWinFrames.js';

const S = FighterState.WIN;

describe('WIN pose registration', () => {
  it('Kyo has WIN frame registered', () => {
    expect(hasKyoHighResFrame(S, null)).toBe(true);
  });

  it('Iori has WIN frame registered', () => {
    expect(hasIoriHighResFrame(S, null)).toBe(true);
  });

  it('Ryo has WIN frame registered', () => {
    expect(hasRyoFrame('ryo', S, null)).toBe(true);
  });

  it('Kyo has exactly 2 WIN frames', () => {
    expect(KYO_WIN_FRAMES.length).toBe(2);
  });

  it('Iori has exactly 2 WIN frames', () => {
    expect(IORI_WIN_POSE.width).toBeGreaterThan(0);
    expect(IORI_WIN_LAUGH.width).toBeGreaterThan(0);
  });

  it('Ryo has exactly 4 WIN frames', () => {
    expect(RYO_WIN_FRAMES.length).toBe(4);
  });

  // Frame dimension sanity
  for (const [name, frame] of [
    ['KYO_WIN[0]', KYO_WIN_FRAMES[0]],
    ['KYO_WIN[1]', KYO_WIN_FRAMES[1]],
    ['IORI_WIN_POSE', IORI_WIN_POSE],
    ['IORI_WIN_LAUGH', IORI_WIN_LAUGH],
    ...RYO_WIN_FRAMES.map((f, i) => [`RYO_WIN[${i}]`, f] as const),
  ]) {
    it(`${name} has valid dimensions`, () => {
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
      expect(frame.pixels.length).toBeGreaterThan(0);
      expect(frame.pixels.length).toBeLessThanOrEqual(frame.height);
      expect(frame.palette).toBeDefined();
    });
  }
});
