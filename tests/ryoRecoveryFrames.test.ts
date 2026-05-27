/**
 * Recovery Frame Uniqueness Tests
 *
 * Verifies that attack recovery frames are NOT identical clones of the guard stance.
 * Each recovery frame should have unique pixel data showing arm/leg retraction.
 */
import { describe, it, expect } from 'vitest';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES, RYO_CLOSE_A_FRAMES, RYO_CLOSE_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryo/ryoKickFrames.js';
import { RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchKickFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCloseKickFrames.js';

function pixelHash(pixels: number[][]): number {
  let h = 0;
  for (let y = 0; y < pixels.length; y++) {
    const row = pixels[y];
    for (let x = 0; x < row.length; x++) {
      h = (h * 31 + row[x]) | 0;
    }
  }
  return h;
}

describe('Recovery Frame Uniqueness', () => {
  describe('STAND_A recovery', () => {
    it('SA_F2 (recovery early) differs from SA_F0 (startup/guard)', () => {
      expect(pixelHash(RYO_STAND_A_FRAMES[2].pixels)).not.toBe(pixelHash(RYO_STAND_A_FRAMES[0].pixels));
    });
    it('SA_F3 (recovery late) differs from SA_F0', () => {
      expect(pixelHash(RYO_STAND_A_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_STAND_A_FRAMES[0].pixels));
    });
    it('SA_F2 and SA_F3 differ from each other', () => {
      expect(pixelHash(RYO_STAND_A_FRAMES[2].pixels)).not.toBe(pixelHash(RYO_STAND_A_FRAMES[3].pixels));
    });
  });

  describe('STAND_C recovery', () => {
    it('SC_F3 (recovery early) differs from SC_F0 (startup)', () => {
      expect(pixelHash(RYO_STAND_C_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_STAND_C_FRAMES[0].pixels));
    });
    it('SC_F4 (recovery late) differs from SC_F0', () => {
      expect(pixelHash(RYO_STAND_C_FRAMES[4].pixels)).not.toBe(pixelHash(RYO_STAND_C_FRAMES[0].pixels));
    });
    it('SC_F3 and SC_F4 differ from each other', () => {
      expect(pixelHash(RYO_STAND_C_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_STAND_C_FRAMES[4].pixels));
    });
  });

  describe('CLOSE_A recovery', () => {
    it('CA_F2 differs from CA_F0', () => {
      expect(pixelHash(RYO_CLOSE_A_FRAMES[2].pixels)).not.toBe(pixelHash(RYO_CLOSE_A_FRAMES[0].pixels));
    });
  });

  describe('CLOSE_C recovery', () => {
    it('CC_F3 differs from CC_F0', () => {
      expect(pixelHash(RYO_CLOSE_C_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_CLOSE_C_FRAMES[0].pixels));
    });
  });

  describe('STAND_B recovery', () => {
    it('SB_F3 differs from SB_F0', () => {
      expect(pixelHash(RYO_STAND_B_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_STAND_B_FRAMES[0].pixels));
    });
  });

  describe('STAND_D recovery', () => {
    it('SD_F4 differs from SD_F0', () => {
      expect(pixelHash(RYO_STAND_D_FRAMES[4].pixels)).not.toBe(pixelHash(RYO_STAND_D_FRAMES[0].pixels));
    });
  });

  describe('CROUCH_B recovery', () => {
    it('CB_F2 differs from CB_F0', () => {
      expect(pixelHash(RYO_CROUCH_B_FRAMES[2].pixels)).not.toBe(pixelHash(RYO_CROUCH_B_FRAMES[0].pixels));
    });
  });

  describe('CROUCH_D recovery', () => {
    it('CD_F4 differs from CD_F0', () => {
      expect(pixelHash(RYO_CROUCH_D_FRAMES[4].pixels)).not.toBe(pixelHash(RYO_CROUCH_D_FRAMES[0].pixels));
    });
  });

  describe('CLOSE_B recovery', () => {
    it('CL_B_F2 differs from CL_B_F0', () => {
      expect(pixelHash(RYO_CLOSE_B_FRAMES[2].pixels)).not.toBe(pixelHash(RYO_CLOSE_B_FRAMES[0].pixels));
    });
  });

  describe('CLOSE_D recovery', () => {
    it('CL_D_F3 differs from CL_D_F0', () => {
      expect(pixelHash(RYO_CLOSE_D_FRAMES[3].pixels)).not.toBe(pixelHash(RYO_CLOSE_D_FRAMES[0].pixels));
    });
  });
});
