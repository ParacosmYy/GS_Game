import { describe, it, expect } from 'vitest';
import { bone, pose, DEFAULT_PROPORTIONS } from '../src/characters/types.js';

describe('characters/types', () => {
  describe('bone', () => {
    it('creates a BonePose with defaults', () => {
      const b = bone(10, 20);
      expect(b.ox).toBe(10);
      expect(b.oy).toBe(20);
      expect(b.rot).toBe(0);
      expect(b.scale).toBe(1);
    });
    it('accepts rotation and scale', () => {
      const b = bone(5, -10, 90, 2);
      expect(b.rot).toBe(90);
      expect(b.scale).toBe(2);
    });
  });

  describe('pose', () => {
    it('creates default pose', () => {
      const p = pose();
      expect(p).toBeDefined();
      expect(typeof p).toBe('object');
    });
    it('overrides passed values', () => {
      const p = pose({ head: bone(0, -50) });
      expect(p.head).toBeDefined();
    });
  });

  describe('DEFAULT_PROPORTIONS', () => {
    it('is an object', () => {
      expect(DEFAULT_PROPORTIONS).toBeDefined();
      expect(typeof DEFAULT_PROPORTIONS).toBe('object');
    });
    it('has headW and torsoW', () => {
      expect(DEFAULT_PROPORTIONS.headW).toBeDefined();
      expect(DEFAULT_PROPORTIONS.torsoW).toBeDefined();
    });
  });
});
