import { describe, it, expect } from 'vitest';
import { SPRITE_MANIFEST, RYO_ANIMATIONS } from '../src/core/spriteManifestData.js';

describe('spriteManifestData', () => {
  describe('SPRITE_MANIFEST', () => {
    it('is an object with characters', () => {
      expect(typeof SPRITE_MANIFEST).toBe('object');
      expect(SPRITE_MANIFEST.characters).toBeDefined();
    });
    it('has ryo character', () => {
      expect(SPRITE_MANIFEST.characters.ryo).toBeDefined();
    });
    it('ryo has animations', () => {
      expect(SPRITE_MANIFEST.characters.ryo.animations).toBeDefined();
    });
    it('ryo has fallbackColors', () => {
      expect(SPRITE_MANIFEST.characters.ryo.fallbackColors).toBeDefined();
    });
    it('ryo has idle animation', () => {
      expect(SPRITE_MANIFEST.characters.ryo.animations.idle).toBeDefined();
    });
  });

  describe('RYO_ANIMATIONS', () => {
    it('is an object', () => {
      expect(typeof RYO_ANIMATIONS).toBe('object');
    });
    it('has idle', () => {
      expect(RYO_ANIMATIONS.idle).toBeDefined();
    });
    it('has walk', () => {
      const keys = Object.keys(RYO_ANIMATIONS);
      expect(keys.some(k => k.includes('walk'))).toBe(true);
    });
    it('idle has frames', () => {
      expect(RYO_ANIMATIONS.idle.frames.length).toBeGreaterThan(0);
    });
    it('idle is a loop animation', () => {
      expect(RYO_ANIMATIONS.idle.loop).toBe(true);
    });
  });
});
