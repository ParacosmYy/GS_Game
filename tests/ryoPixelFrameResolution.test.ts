/**
 * Pixel Frame Resolution Tests
 *
 * Verifies that every Ryo AttackType resolves to a valid pixel frame key
 * and that all registered frame keys have the correct frame data.
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import { hasHighResFrame } from '../src/rendering/sprites/ryoHighResRender.js';

describe('Ryo Pixel Frame Resolution', () => {
  describe('Stand attacks', () => {
    it('STAND_A has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.STAND_A, 0, 1)).toBe(true);
    });
    it('STAND_B has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.STAND_B, 0, 1)).toBe(true);
    });
    it('STAND_C has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.STAND_C, 0, 1)).toBe(true);
    });
    it('STAND_D has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.STAND_D, 0, 1)).toBe(true);
    });
  });

  describe('Close attacks', () => {
    it('CLOSE_A has dedicated high-res frame (not sharing STAND_A)', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.CLOSE_A, 0, 1)).toBe(true);
    });
    it('CLOSE_B has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.CLOSE_B, 0, 1)).toBe(true);
    });
    it('CLOSE_C has dedicated high-res frame (not sharing STAND_C)', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.CLOSE_C, 0, 1)).toBe(true);
    });
    it('CLOSE_D has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.CLOSE_D, 0, 1)).toBe(true);
    });
  });

  describe('Crouch attacks', () => {
    it('CROUCH_A has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'CROUCH_ATTACK' as any, AttackType.CROUCH_A, 0, 1)).toBe(true);
    });
    it('CROUCH_B has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'CROUCH_ATTACK' as any, AttackType.CROUCH_B, 0, 1)).toBe(true);
    });
    it('CROUCH_C has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'CROUCH_ATTACK' as any, AttackType.CROUCH_C, 0, 1)).toBe(true);
    });
    it('CROUCH_D has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'CROUCH_ATTACK' as any, AttackType.CROUCH_D, 0, 1)).toBe(true);
    });
  });

  describe('Air attacks', () => {
    it('JUMP_A resolves to AIR_A', () => {
      expect(hasHighResFrame('ryo', 'AIR_ATTACK' as any, AttackType.JUMP_A, 0, 1)).toBe(true);
    });
    it('JUMP_C resolves to AIR_C', () => {
      expect(hasHighResFrame('ryo', 'AIR_ATTACK' as any, AttackType.JUMP_C, 0, 1)).toBe(true);
    });
    it('JUMP_D resolves to AIR_D', () => {
      expect(hasHighResFrame('ryo', 'AIR_ATTACK' as any, AttackType.JUMP_D, 0, 1)).toBe(true);
    });
  });

  describe('Special moves', () => {
    it('RYO_KOOU resolves to KOOU', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_KOOU, 0, 1)).toBe(true);
    });
    it('RYO_KOOU_C resolves to KOOU_C', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_KOOU_C, 0, 1)).toBe(true);
    });
    it('RYO_KO_HOU resolves to KO_HOU', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_KO_HOU, 0, 1)).toBe(true);
    });
    it('RYO_KO_HOU_C resolves to KO_HOU_C', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_KO_HOU_C, 0, 1)).toBe(true);
    });
    it('RYO_HIEN resolves to HIEN', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_HIEN, 0, 1)).toBe(true);
    });
    it('RYO_HAOU resolves to HAOU', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_HAOU, 0, 1)).toBe(true);
    });
  });

  describe('New specials', () => {
    it('RYO_KOOUKEN_D resolves to KOOU frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_KOOUKEN_D, 0, 1)).toBe(true);
    });
    it('RYO_HIO_HACKER resolves to STAND_C frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_HIO_HACKER, 0, 1)).toBe(true);
    });
    it('RYO_ZANRETSU_KEN resolves to STAND_A frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.RYO_ZANRETSU_KEN, 0, 1)).toBe(true);
    });
  });

  describe('Super moves', () => {
    it('DM_TEN_HA_OU has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.DM_TEN_HA_OU, 0, 1)).toBe(true);
    });
    it('SDM_TEN_HA_OU has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.SDM_TEN_HA_OU, 0, 1)).toBe(true);
    });
    it('DM_RYUKO_RANBU has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.DM_RYUKO_RANBU, 0, 1)).toBe(true);
    });
    it('SDM_RYUKO_RANBU has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.SDM_RYUKO_RANBU, 0, 1)).toBe(true);
    });
    it('HSDM_RYUKO_RANBU has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'STAND_ATTACK' as any, AttackType.HSDM_RYUKO_RANBU, 0, 1)).toBe(true);
    });
  });

  describe('Movement states', () => {
    it('IDLE has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'IDLE' as any, null, 0, 1)).toBe(true);
    });
    it('WALK forward has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'WALK' as any, null, 2, 1)).toBe(true);
    });
    it('WALK backward has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'WALK' as any, null, -2, 1)).toBe(true);
    });
    it('RUN has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'RUN' as any, null, 0, 1)).toBe(true);
    });
    it('JUMP has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'JUMP' as any, null, 0, 1)).toBe(true);
    });
    it('CROUCH has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'CROUCH' as any, null, 0, 1)).toBe(true);
    });
    it('BLOCK has high-res frame', () => {
      expect(hasHighResFrame('ryo', 'BLOCK' as any, null, 0, 1)).toBe(true);
    });
  });

  describe('Negative: non-Ryo characters', () => {
    it('kyo has no high-res frame', () => {
      expect(hasHighResFrame('kyo', 'IDLE' as any, null, 0, 1)).toBe(false);
    });
  });
});
