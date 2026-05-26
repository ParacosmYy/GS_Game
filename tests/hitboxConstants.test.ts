import { describe, it, expect } from 'vitest';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';

describe('hitboxConstants', () => {
  describe('HITBOX_OFFSETS', () => {
    it('is an object', () => {
      expect(typeof HITBOX_OFFSETS).toBe('object');
    });
    it('has STAND_A attack box', () => {
      expect(HITBOX_OFFSETS.STAND_A).toBeDefined();
      expect(HITBOX_OFFSETS.STAND_A.offsetX).toBeGreaterThan(0);
      expect(HITBOX_OFFSETS.STAND_A.width).toBeGreaterThan(0);
      expect(HITBOX_OFFSETS.STAND_A.height).toBeGreaterThan(0);
    });
    it('has STAND_D attack box', () => {
      expect(HITBOX_OFFSETS.STAND_D).toBeDefined();
      expect(HITBOX_OFFSETS.STAND_D.offsetX).toBeGreaterThan(0);
    });
    it('has CROUCH_A attack box', () => {
      expect(HITBOX_OFFSETS.CROUCH_A).toBeDefined();
    });
    it('has JUMP_A attack box', () => {
      expect(HITBOX_OFFSETS.JUMP_A).toBeDefined();
    });
    it('all boxes have required fields', () => {
      for (const [key, box] of Object.entries(HITBOX_OFFSETS)) {
        expect(box).toHaveProperty('offsetX');
        expect(box).toHaveProperty('offsetY');
        expect(box).toHaveProperty('width');
        expect(box).toHaveProperty('height');
      }
    });
    it('all widths are positive', () => {
      for (const box of Object.values(HITBOX_OFFSETS) as any[]) {
        expect(box.width).toBeGreaterThan(0);
      }
    });
    it('all heights are positive', () => {
      for (const box of Object.values(HITBOX_OFFSETS) as any[]) {
        expect(box.height).toBeGreaterThan(0);
      }
    });
    it('stand punches have higher offset than kicks', () => {
      expect(Math.abs(HITBOX_OFFSETS.STAND_A.offsetY)).toBeGreaterThan(
        Math.abs(HITBOX_OFFSETS.STAND_B.offsetY)
      );
    });
  });
});
