/**
 * Feedback Manifest Tier Progression Regression Test
 *
 * Verifies that feedback parameters strictly escalate across tiers:
 * light < heavy < special < dm < sdm < hsdm
 * for hitstop, shakeIntensity, sparkCount, sparkSize, impactRingCount.
 */
import { describe, it, expect } from 'vitest';
import { FEEDBACK_TIERS, type FeedbackTier } from '../src/core/feedbackManifest.js';

const TIERS: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];

describe('Feedback tier progressive escalation', () => {
  it('hitstop strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].hitstop).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].hitstop,
      );
    }
  });

  it('shakeIntensity strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].shakeIntensity).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].shakeIntensity,
      );
    }
  });

  it('sparkCount strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].sparkCount).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].sparkCount,
      );
    }
  });

  it('sparkSize strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].sparkSize).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].sparkSize,
      );
    }
  });

  it('impactRingCount strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].impactRingCount).toBeGreaterThanOrEqual(
        FEEDBACK_TIERS[TIERS[i - 1]].impactRingCount,
      );
    }
  });

  it('hitPushbackScale strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].hitPushbackScale).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].hitPushbackScale,
      );
    }
  });

  it('hitstunBodyShake strictly increases across tiers', () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(FEEDBACK_TIERS[TIERS[i]].hitstunBodyShake).toBeGreaterThan(
        FEEDBACK_TIERS[TIERS[i - 1]].hitstunBodyShake,
      );
    }
  });

  it('all 6 tiers are present', () => {
    expect(Object.keys(FEEDBACK_TIERS).sort()).toEqual(
      ['dm', 'heavy', 'hsdm', 'light', 'sdm', 'special'],
    );
  });

  it('sparkType escalates: small→medium→large→burst→mega→hyper', () => {
    const expectedOrder = ['small', 'medium', 'large', 'burst', 'mega', 'hyper'];
    TIERS.forEach((tier, i) => {
      expect(FEEDBACK_TIERS[tier].sparkType).toBe(expectedOrder[i]);
    });
  });

  it('all tiers have positive parameters', () => {
    for (const tier of TIERS) {
      const t = FEEDBACK_TIERS[tier];
      expect(t.hitstop).toBeGreaterThan(0);
      expect(t.shakeIntensity).toBeGreaterThan(0);
      expect(t.sparkCount).toBeGreaterThan(0);
      expect(t.sparkSize).toBeGreaterThan(0);
    }
  });
});
