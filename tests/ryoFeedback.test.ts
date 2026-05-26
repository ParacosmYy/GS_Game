import { describe, it, expect } from 'vitest';
import { getRyoFeedbackTiers, getRyoFeedback, RYO_FEEDBACK_SUMMARY } from '../src/content/characters/ryo/feedback.js';

describe('ryoFeedback', () => {
  it('getRyoFeedbackTiers returns object', () => {
    const tiers = getRyoFeedbackTiers();
    expect(tiers).toBeDefined();
    expect(typeof tiers).toBe('object');
  });
  it('getRyoFeedback returns object for STAND_A', () => {
    const fb = getRyoFeedback('STAND_A');
    expect(fb).toBeDefined();
  });
  it('getRyoFeedback returns default for unknown', () => {
    const fb = getRyoFeedback('UNKNOWN_ATTACK');
    expect(fb).toBeDefined();
  });
  it('RYO_FEEDBACK_SUMMARY is object', () => {
    expect(RYO_FEEDBACK_SUMMARY).toBeDefined();
    expect(typeof RYO_FEEDBACK_SUMMARY).toBe('object');
  });
  it('RYO_FEEDBACK_SUMMARY has keys', () => {
    expect(Object.keys(RYO_FEEDBACK_SUMMARY).length).toBeGreaterThan(0);
  });
});
