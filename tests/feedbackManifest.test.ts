import { describe, it, expect } from 'vitest';
import {
  getFeedback,
  getFeedbackByTier,
  inferTier,
  FEEDBACK_TIERS,
} from '../src/core/feedbackManifest.js';
import { AttackType } from '../src/core/types.js';

describe('Feedback Manifest', () => {
  it('all 5 tiers have valid params', () => {
    const tiers = ['light', 'heavy', 'special', 'dm', 'sdm'] as const;
    for (const t of tiers) {
      const fb = getFeedbackByTier(t);
      expect(fb.tier).toBe(t);
      expect(fb.hitstop).toBeGreaterThan(0);
      expect(fb.blockstop).toBeGreaterThanOrEqual(0);
      expect(fb.shakeIntensity).toBeGreaterThan(0);
      expect(fb.shakeDuration).toBeGreaterThan(0);
      expect(fb.sparkCount).toBeGreaterThan(0);
      expect(fb.sparkSize).toBeGreaterThan(0);
      expect(fb.hitFlashFrames).toBeGreaterThan(0);
    }
  });

  it('tiers escalate: light < heavy < special < dm < sdm', () => {
    const l = FEEDBACK_TIERS.light;
    const h = FEEDBACK_TIERS.heavy;
    const s = FEEDBACK_TIERS.special;
    const d = FEEDBACK_TIERS.dm;
    const sd = FEEDBACK_TIERS.sdm;
    expect(l.hitstop).toBeLessThan(h.hitstop);
    expect(h.hitstop).toBeLessThan(s.hitstop);
    expect(s.hitstop).toBeLessThan(d.hitstop);
    expect(d.hitstop).toBeLessThan(sd.hitstop);
    expect(l.sparkCount).toBeLessThan(h.sparkCount);
    expect(h.sparkCount).toBeLessThan(s.sparkCount);
    expect(l.sparkSize).toBeLessThan(h.sparkSize);
    expect(h.shakeIntensity).toBeLessThan(d.shakeIntensity);
  });

  it('inferTier classifies Ryo attacks correctly', () => {
    expect(inferTier(AttackType.STAND_A)).toBe('light');
    expect(inferTier(AttackType.STAND_B)).toBe('light');
    expect(inferTier(AttackType.CROUCH_A)).toBe('light');
    expect(inferTier(AttackType.STAND_C)).toBe('heavy');
    expect(inferTier(AttackType.STAND_D)).toBe('heavy');
    expect(inferTier(AttackType.CROUCH_C)).toBe('heavy');
    expect(inferTier(AttackType.JUMP_C)).toBe('heavy');
    expect(inferTier(AttackType.JUMP_D)).toBe('heavy');
  });

  it('getFeedback returns escalating params for light vs heavy', () => {
    const light = getFeedback(AttackType.STAND_A);
    const heavy = getFeedback(AttackType.STAND_C);
    expect(light.hitstop).toBe(4);
    expect(heavy.hitstop).toBe(8);
    expect(heavy.shakeIntensity).toBeGreaterThan(light.shakeIntensity);
    expect(heavy.sparkCount).toBeGreaterThan(light.sparkCount);
    expect(heavy.sparkSize).toBeGreaterThan(light.sparkSize);
  });

  it('counter hit bonus is additive', () => {
    const fb = getFeedback(AttackType.STAND_A);
    const counterBonus = 3;
    expect(fb.hitstop + counterBonus).toBe(7);
  });

  it('Ryo specials get special tier', () => {
    expect(inferTier(AttackType.RYO_KOOU)).toBe('special');
    expect(inferTier(AttackType.RYO_KO_HOU)).toBe('special');
    expect(inferTier(AttackType.RYO_HIEN)).toBe('special');
    expect(inferTier(AttackType.RYO_HAOU)).toBe('special');
  });

  it('DM/SDM get correct tier', () => {
    expect(inferTier(AttackType.DM_TEN_HA_OU)).toBe('dm');
  });
});
