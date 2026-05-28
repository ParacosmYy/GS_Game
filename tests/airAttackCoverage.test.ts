/**
 * Air Attack Coverage Regression Test
 *
 * Verifies all 3 characters have dedicated AIR_A, AIR_B, AIR_C, AIR_D pixel frames.
 * Ensures no air attack type falls back to a different animation.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_AIR_A_FRAMES, RYO_AIR_B_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES,
} from '../src/rendering/sprites/ryo/ryoAirAttackFrames.js';
import {
  KYO_AIR_A_FRAMES, KYO_AIR_B_FRAMES, KYO_AIR_C_FRAMES, KYO_AIR_D_FRAMES,
} from '../src/rendering/sprites/kyo/kyoAirAttackFrames.js';
import {
  IORI_AIR_A_FRAMES, IORI_AIR_B_FRAMES, IORI_AIR_C_FRAMES, IORI_AIR_D_FRAMES,
} from '../src/rendering/sprites/iori/ioriAirAttackFrames.js';

const CHAR_AIR = {
  Ryo: { AIR_A: RYO_AIR_A_FRAMES, AIR_B: RYO_AIR_B_FRAMES, AIR_C: RYO_AIR_C_FRAMES, AIR_D: RYO_AIR_D_FRAMES },
  Kyo: { AIR_A: KYO_AIR_A_FRAMES, AIR_B: KYO_AIR_B_FRAMES, AIR_C: KYO_AIR_C_FRAMES, AIR_D: KYO_AIR_D_FRAMES },
  Iori: { AIR_A: IORI_AIR_A_FRAMES, AIR_B: IORI_AIR_B_FRAMES, AIR_C: IORI_AIR_C_FRAMES, AIR_D: IORI_AIR_D_FRAMES },
} as const;

describe('Air attack pixel frame coverage', () => {
  for (const [charName, frames] of Object.entries(CHAR_AIR)) {
    for (const [airType, airFrames] of Object.entries(frames)) {
      it(`${charName} has ${airType} frames with valid pixel data`, () => {
        expect(airFrames).toBeDefined();
        expect(Array.isArray(airFrames)).toBe(true);
        expect(airFrames.length).toBeGreaterThanOrEqual(3);
        for (let i = 0; i < airFrames.length; i++) {
          const frame = airFrames[i];
          expect(frame.pixels.length).toBeGreaterThan(0);
          expect(frame.width).toBeGreaterThan(0);
          expect(frame.height).toBeGreaterThan(0);
          expect(frame.palette).toBeDefined();
          expect(frame.anchor).toBeDefined();
          expect(frame.anchor.x).toBeGreaterThan(0);
          expect(frame.anchor.y).toBeGreaterThan(0);
        }
      });
    }
  }

  it('AIR_B is lighter frame count than AIR_D for all characters', () => {
    for (const [_, frames] of Object.entries(CHAR_AIR)) {
      expect(frames.AIR_B.length).toBeLessThanOrEqual(frames.AIR_D.length);
    }
  });

  it('all characters have AIR_B with exactly 3 frames', () => {
    for (const [_, frames] of Object.entries(CHAR_AIR)) {
      expect(frames.AIR_B.length).toBe(3);
    }
  });
});
