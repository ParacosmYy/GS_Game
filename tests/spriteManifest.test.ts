import { describe, it, expect } from 'vitest';
import { getAnimation, getFallbackColors, getAnimationNames } from '../src/core/spriteManifest.js';

describe('spriteManifest', () => {
  const mockManifest = {
    characters: {
      ryo: {
        charId: 'ryo',
        animations: {
          idle: { name: 'idle', frames: [], loop: true },
          walk: { name: 'walk', frames: [], loop: true },
        },
        fallbackColors: { hair: '#000000', skin: '#FFCC99', shirt: '#FFFFFF' },
      },
    },
  } as any;

  describe('getAnimation', () => {
    it('returns animation for valid char', () => {
      const anim = getAnimation(mockManifest, 'ryo', 'idle');
      expect(anim).toBeDefined();
      expect(anim!.name).toBe('idle');
    });
    it('returns undefined for unknown char', () => {
      expect(getAnimation(mockManifest, 'unknown', 'idle')).toBeUndefined();
    });
    it('returns undefined for unknown animation', () => {
      expect(getAnimation(mockManifest, 'ryo', 'nonexist')).toBeUndefined();
    });
  });

  describe('getFallbackColors', () => {
    it('returns colors for valid char', () => {
      const colors = getFallbackColors(mockManifest, 'ryo');
      expect(colors).toBeDefined();
      expect(colors!.hair).toBe('#000000');
    });
    it('returns default or empty for unknown char', () => {
      const colors = getFallbackColors(mockManifest, 'unknown');
      expect(colors).toBeDefined();
    });
  });

  describe('getAnimationNames', () => {
    it('returns animation names for valid char', () => {
      const names = getAnimationNames(mockManifest, 'ryo');
      expect(names).toContain('idle');
      expect(names).toContain('walk');
    });
    it('returns empty for unknown char', () => {
      const names = getAnimationNames(mockManifest, 'unknown');
      expect(names).toEqual([]);
    });
  });
});
