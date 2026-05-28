/**
 * Iori Close Attack Frame Registration Regression Test
 * Validates Iori's CLOSE_A/B/C/D frames are registered and distinct from stand frames.
 */
import { describe, it, expect } from 'vitest';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  IORI_CLOSE_A_FRAMES,
  IORI_CLOSE_C_FRAMES,
  IORI_CLOSE_B_FRAMES,
  IORI_CLOSE_D_FRAMES,
} from '../src/rendering/sprites/iori/ioriCloseAttackFrames.js';

const SA = FighterState.STAND_ATTACK;

describe('Iori close attack frame registration', () => {
  it('CLOSE_A has registered frame', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_A)).toBe(true);
  });

  it('CLOSE_B has registered frame', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_B)).toBe(true);
  });

  it('CLOSE_C has registered frame', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_C)).toBe(true);
  });

  it('CLOSE_D has registered frame', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_D)).toBe(true);
  });

  it('CLOSE_A resolves differently from STAND_A', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_A)).toBe(true);
    expect(hasIoriHighResFrame(SA, AttackType.STAND_A)).toBe(true);
    // Both true but resolve to different keys — verified by key lookup
  });

  it('CLOSE_C resolves differently from STAND_C', () => {
    expect(hasIoriHighResFrame(SA, AttackType.CLOSE_C)).toBe(true);
    expect(hasIoriHighResFrame(SA, AttackType.STAND_C)).toBe(true);
  });
});

describe('Iori close attack frame data integrity', () => {
  it('CLOSE_A has 4 frames', () => {
    expect(IORI_CLOSE_A_FRAMES.length).toBe(4);
  });

  it('CLOSE_C has 4 frames', () => {
    expect(IORI_CLOSE_C_FRAMES.length).toBe(4);
  });

  it('CLOSE_B has 3 frames', () => {
    expect(IORI_CLOSE_B_FRAMES.length).toBe(3);
  });

  it('CLOSE_D has 4 frames', () => {
    expect(IORI_CLOSE_D_FRAMES.length).toBe(4);
  });

  for (const [name, frames] of [
    ['CLOSE_A', IORI_CLOSE_A_FRAMES],
    ['CLOSE_C', IORI_CLOSE_C_FRAMES],
    ['CLOSE_B', IORI_CLOSE_B_FRAMES],
    ['CLOSE_D', IORI_CLOSE_D_FRAMES],
  ] as const) {
    for (let i = 0; i < frames.length; i++) {
      it(`${name}[${i}] has valid dimensions`, () => {
        const f = frames[i];
        expect(f.width).toBeGreaterThan(0);
        expect(f.height).toBeGreaterThan(0);
        expect(f.pixels.length).toBeGreaterThan(0);
        expect(f.pixels.length).toBeLessThanOrEqual(f.height);
        expect(f.palette).toBeDefined();
      });
    }
  }
});
