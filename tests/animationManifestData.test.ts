import { describe, it, expect } from 'vitest';
import { ANIMATION_MANIFEST, getCharacterAnimManifest, REQUIRED_SEQUENCES } from '../src/core/animationManifestData.js';

describe('animationManifestData', () => {
  describe('ANIMATION_MANIFEST', () => {
    it('is an object with characters', () => {
      expect(typeof ANIMATION_MANIFEST).toBe('object');
      expect(ANIMATION_MANIFEST.characters).toBeDefined();
    });
    it('has ryo character', () => {
      expect(ANIMATION_MANIFEST.characters.ryo).toBeDefined();
    });
    it('ryo has sequences', () => {
      expect(ANIMATION_MANIFEST.characters.ryo.sequences).toBeDefined();
    });
    it('ryo charId is ryo', () => {
      expect(ANIMATION_MANIFEST.characters.ryo.charId).toBe('ryo');
    });
  });

  describe('getCharacterAnimManifest', () => {
    it('returns manifest for ryo', () => {
      const m = getCharacterAnimManifest('ryo');
      expect(m).toBeDefined();
      expect(m!.charId).toBe('ryo');
    });
    it('returns undefined for unknown character', () => {
      const m = getCharacterAnimManifest('unknown');
      expect(m).toBeUndefined();
    });
  });

  describe('REQUIRED_SEQUENCES', () => {
    it('is an array', () => {
      expect(Array.isArray(REQUIRED_SEQUENCES)).toBe(true);
    });
    it('contains idle', () => {
      expect(REQUIRED_SEQUENCES).toContain('idle');
    });
    it('contains walk or walk_forward', () => {
      const keys = REQUIRED_SEQUENCES as string[];
      expect(keys.some(k => k.includes('walk'))).toBe(true);
    });
  });
});
