import { describe, it, expect } from 'vitest';
import { spawnHitSparks, spawnBlockFlash, getSparkSizeScaleFromDamage, Particle } from '../src/rendering/vfxPresets.js';

describe('vfxPresets', () => {
  describe('Particle', () => {
    it('can be created manually', () => {
      const p: Particle = { x: 0, y: 0, vx: 1, vy: -2, life: 10, maxLife: 10, size: 3, color: '#fff', type: 'spark' };
      expect(p.x).toBe(0);
      expect(p.type).toBe('spark');
    });
  });

  describe('spawnHitSparks', () => {
    it('adds particles to array', () => {
      const particles: Particle[] = [];
      spawnHitSparks(particles, 100, -200);
      expect(particles.length).toBeGreaterThan(0);
    });
    it('respects count param', () => {
      const particles: Particle[] = [];
      spawnHitSparks(particles, 100, -200, 4);
      expect(particles.length).toBe(4);
    });
  });

  describe('spawnBlockFlash', () => {
    it('adds particles to array', () => {
      const particles: Particle[] = [];
      spawnBlockFlash(particles, 100, -200);
      expect(particles.length).toBeGreaterThan(0);
    });
  });

  describe('getSparkSizeScaleFromDamage', () => {
    it('returns a number', () => {
      const result = getSparkSizeScaleFromDamage(100);
      expect(typeof result).toBe('number');
    });
    it('higher damage gives equal or larger scale', () => {
      const low = getSparkSizeScaleFromDamage(10);
      const high = getSparkSizeScaleFromDamage(200);
      expect(high).toBeGreaterThanOrEqual(low);
    });
  });
});
