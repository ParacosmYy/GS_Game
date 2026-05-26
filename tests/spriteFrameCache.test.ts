import { describe, it, expect } from 'vitest';
import { SpriteFrameCache } from '../src/rendering/spriteFrameCache.js';

describe('spriteFrameCache', () => {
  describe('SpriteFrameCache', () => {
    it('can be instantiated', () => {
      const cache = new SpriteFrameCache();
      expect(cache).toBeDefined();
    });
    it('has returns false for uncached frame', () => {
      const cache = new SpriteFrameCache();
      expect(cache.has('ryo', 'idle', 0, 0)).toBe(false);
    });
    it('get returns null for uncached frame', () => {
      const cache = new SpriteFrameCache();
      expect(cache.get('ryo', 'idle', 0, 0)).toBeNull();
    });
    it('clear does not throw', () => {
      const cache = new SpriteFrameCache();
      expect(() => cache.clear()).not.toThrow();
    });
    it('size returns 0 for empty cache', () => {
      const cache = new SpriteFrameCache();
      expect(cache.size).toBe(0);
    });
  });
});
