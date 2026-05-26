import { describe, it, expect } from 'vitest';
import {
  DAMAGE_FLOORS, STARTER_PRORATION, SCALING_TABLE,
  classifyStarter, getStarterProration, getAttackTier,
  getDamageFloor, getComboScale
} from '../src/core/damageScaling.js';

describe('damageScaling', () => {
  describe('constants', () => {
    it('DAMAGE_FLOORS is an object', () => {
      expect(typeof DAMAGE_FLOORS).toBe('object');
    });
    it('STARTER_PRORATION is an object', () => {
      expect(typeof STARTER_PRORATION).toBe('object');
    });
    it('SCALING_TABLE is an array', () => {
      expect(Array.isArray(SCALING_TABLE)).toBe(true);
    });
  });

  describe('classifyStarter', () => {
    it('classifies light attacks', () => {
      const result = classifyStarter('light');
      expect(result).toBeDefined();
    });
    it('classifies heavy attacks', () => {
      const result = classifyStarter('heavy');
      expect(result).toBeDefined();
    });
    it('classifies special attacks', () => {
      const result = classifyStarter('special');
      expect(result).toBeDefined();
    });
  });

  describe('getStarterProration', () => {
    it('returns a number between 0 and 1', () => {
      const result = getStarterProration('light');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('getAttackTier', () => {
    it('returns a tier for light', () => expect(getAttackTier('light')).toBeDefined());
    it('returns a tier for special', () => expect(getAttackTier('special')).toBeDefined());
    it('returns a tier for dm', () => expect(getAttackTier('dm')).toBeDefined());
  });

  describe('getDamageFloor', () => {
    it('returns a positive number', () => {
      const result = getDamageFloor('normal', 5);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getComboScale', () => {
    it('returns 1.0 for first hit', () => {
      expect(getComboScale(1)).toBeCloseTo(1.0);
    });
    it('returns decreasing values for more hits', () => {
      const scale1 = getComboScale(1);
      const scale5 = getComboScale(5);
      expect(scale5).toBeLessThanOrEqual(scale1);
    });
  });
});
