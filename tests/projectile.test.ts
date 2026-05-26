import { describe, it, expect } from 'vitest';
import { Projectile, resolveProjectileClashes } from '../src/entities/projectile.js';

describe('projectile', () => {
  describe('Projectile', () => {
    it('can be created', () => {
      const p = new Projectile(100, -200, 1, 30, 0, 'ryo');
      expect(p).toBeDefined();
    });
    it('has correct x', () => {
      const p = new Projectile(100, -200, 1, 30, 0, 'ryo');
      expect(p.x).toBe(100);
    });
    it('update moves position', () => {
      const p = new Projectile(100, -200, 1, 30, 0, 'ryo');
      p.update();
      expect(p.x).toBeGreaterThan(100);
    });
    it('active is true initially', () => {
      const p = new Projectile(100, -200, 1, 30, 0, 'ryo');
      expect(p.active).toBe(true);
    });
    it('charId is set correctly', () => {
      const p = new Projectile(100, -200, 1, 30, 0, 'ryo');
      expect(p.charId).toBe('ryo');
    });
  });

  describe('resolveProjectileClashes', () => {
    it('returns array', () => {
      const result = resolveProjectileClashes([], []);
      expect(Array.isArray(result)).toBe(true);
    });
    it('no clashes with empty arrays', () => {
      const result = resolveProjectileClashes([], []);
      expect(result.length).toBe(0);
    });
  });
});
