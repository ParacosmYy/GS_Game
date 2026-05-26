import { describe, it, expect } from 'vitest';
import { FEEDBACK_TIERS, inferTier, FEEDBACK_MANIFEST, getFeedback, getFeedbackByTier } from '../src/core/feedbackManifest.js';

describe('feedbackManifest', () => {
  describe('FEEDBACK_TIERS', () => {
    it('is an object with tier keys', () => {
      expect(typeof FEEDBACK_TIERS).toBe('object');
      expect(Object.keys(FEEDBACK_TIERS).length).toBeGreaterThan(0);
    });
    it('has light tier', () => expect(FEEDBACK_TIERS.light).toBeDefined());
    it('has heavy tier', () => expect(FEEDBACK_TIERS.heavy).toBeDefined());
    it('has special tier', () => expect(FEEDBACK_TIERS.special).toBeDefined());
  });

  describe('inferTier', () => {
    it('returns a string tier for light attack', () => {
      const tier = inferTier('STAND_A');
      expect(typeof tier).toBe('string');
    });
    it('returns a tier for heavy attack', () => {
      const tier = inferTier('STAND_C');
      expect(typeof tier).toBe('string');
    });
  });

  describe('FEEDBACK_MANIFEST', () => {
    it('is an object', () => {
      expect(typeof FEEDBACK_MANIFEST).toBe('object');
    });
    it('has entries', () => {
      expect(Object.keys(FEEDBACK_MANIFEST).length).toBeGreaterThan(0);
    });
  });

  describe('getFeedback', () => {
    it('returns feedback for ryo STAND_A', () => {
      const fb = getFeedback('ryo', 'STAND_A');
      expect(fb).toBeDefined();
    });
    it('returns fallback for unknown attack', () => {
      const fb = getFeedback('ryo', 'UNKNOWN_ATTACK');
      expect(fb).toBeDefined();
    });
  });

  describe('getFeedbackByTier', () => {
    it('returns feedback by tier name', () => {
      const fb = getFeedbackByTier('light');
      expect(fb).toBeDefined();
    });
    it('returns feedback for heavy tier', () => {
      const fb = getFeedbackByTier('heavy');
      expect(fb).toBeDefined();
    });
  });
});
