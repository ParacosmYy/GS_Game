import { describe, it, expect } from 'vitest';
import { AnimationBlender, getFighterBlender } from '../src/rendering/animationBlender.js';

describe('animationBlender', () => {
  describe('AnimationBlender', () => {
    it('can be instantiated', () => {
      const blender = new AnimationBlender();
      expect(blender).toBeDefined();
    });
    it('startBlend does not throw', () => {
      const blender = new AnimationBlender();
      expect(() => blender.startBlend('idle', 0, 'walk', 5)).not.toThrow();
    });
    it('startBlend with 0 duration is instant', () => {
      const blender = new AnimationBlender();
      blender.startBlend('idle', 0, 'walk', 0);
    });
    it('update does not throw', () => {
      const blender = new AnimationBlender();
      blender.startBlend('idle', 0, 'walk', 5);
      expect(() => blender.update()).not.toThrow();
    });
    it('isBlending returns false initially', () => {
      const blender = new AnimationBlender();
      expect(blender.isBlending()).toBe(false);
    });
    it('isBlending returns true after startBlend', () => {
      const blender = new AnimationBlender();
      blender.startBlend('idle', 0, 'walk', 5);
      expect(blender.isBlending()).toBe(true);
    });
  });

  describe('getFighterBlender', () => {
    it('returns a blender instance', () => {
      const blender = getFighterBlender('ryo');
      expect(blender).toBeInstanceOf(AnimationBlender);
    });
    it('returns same instance for same charId', () => {
      const a = getFighterBlender('ryo');
      const b = getFighterBlender('ryo');
      expect(a).toBe(b);
    });
  });
});
