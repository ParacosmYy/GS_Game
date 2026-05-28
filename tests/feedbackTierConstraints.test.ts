/**
 * Feedback Manifest Tier Constraints Regression Test
 * Verifies all 6 feedback tiers follow KOF2002-calibrated progression rules.
 */
import { describe, it, expect } from 'vitest';
import {
  FEEDBACK_TIERS,
  type FeedbackTier,
  type FeedbackParams,
} from '../src/core/feedbackManifest.js';

const TIERS: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];

function getTier(name: FeedbackTier): FeedbackParams {
  return FEEDBACK_TIERS[name];
}

describe('Feedback tier structure', () => {
  it('all 6 tiers exist', () => {
    for (const t of TIERS) {
      const fb = getTier(t);
      expect(fb, `${t} tier`).toBeDefined();
      expect(fb.tier).toBe(t);
    }
  });

  it('all tiers have positive hitstop', () => {
    for (const t of TIERS) {
      expect(getTier(t).hitstop, `${t}.hitstop > 0`).toBeGreaterThan(0);
    }
  });

  it('all tiers have positive shakeDuration', () => {
    for (const t of TIERS) {
      expect(getTier(t).shakeDuration, `${t}.shakeDuration > 0`).toBeGreaterThan(0);
    }
  });

  it('all tiers have positive sparkCount', () => {
    for (const t of TIERS) {
      expect(getTier(t).sparkCount, `${t}.sparkCount > 0`).toBeGreaterThan(0);
    }
  });

  it('all sparkPalettes are non-empty arrays of hex colors', () => {
    for (const t of TIERS) {
      const palette = getTier(t).sparkPalette;
      expect(palette.length, `${t}.sparkPalette non-empty`).toBeGreaterThan(0);
      for (const c of palette) {
        expect(c, `${t} palette color`).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      }
    }
  });

  it('all sparkTypes are valid', () => {
    const valid = new Set(['small', 'medium', 'large', 'burst', 'mega', 'hyper']);
    for (const t of TIERS) {
      expect(valid, `${t}.sparkType`).toContain(getTier(t).sparkType);
    }
  });

  it('all impactRingCount are positive', () => {
    for (const t of TIERS) {
      expect(getTier(t).impactRingCount, `${t}.impactRingCount > 0`).toBeGreaterThan(0);
    }
  });
});

describe('Feedback tier progression — KOF2002 calibrated', () => {
  it('hitstop increases with tier', () => {
    const light = getTier('light').hitstop;
    const heavy = getTier('heavy').hitstop;
    const special = getTier('special').hitstop;
    const dm = getTier('dm').hitstop;
    const sdm = getTier('sdm').hitstop;
    const hsdm = getTier('hsdm').hitstop;
    expect(light).toBeLessThan(heavy);
    expect(heavy).toBeLessThan(special);
    expect(special).toBeLessThan(dm);
    expect(dm).toBeLessThanOrEqual(sdm);
    expect(sdm).toBeLessThanOrEqual(hsdm);
  });

  it('shakeIntensity increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).shakeIntensity);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.shake >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });

  it('sparkCount increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).sparkCount);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.sparkCount >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });

  it('sparkSize increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).sparkSize);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.sparkSize >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });

  it('impactRingCount increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).impactRingCount);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.impactRing >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });

  it('hitPushbackScale increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).hitPushbackScale);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.pushback >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });

  it('hitstunBodyShake increases with tier', () => {
    const vals = TIERS.map(t => getTier(t).hitstunBodyShake);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i], `${TIERS[i]}.bodyShake >= ${TIERS[i - 1]}`).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });
});

describe('Feedback tier specific constraints', () => {
  it('HSDM has the longest hitstop', () => {
    const hsdm = getTier('hsdm').hitstop;
    for (const t of ['light', 'heavy', 'special', 'dm', 'sdm'] as FeedbackTier[]) {
      expect(hsdm, `HSDM hitstop > ${t}`).toBeGreaterThanOrEqual(getTier(t).hitstop);
    }
  });

  it('light tier has smallest sparkSize', () => {
    const light = getTier('light').sparkSize;
    for (const t of ['heavy', 'special', 'dm', 'sdm', 'hsdm'] as FeedbackTier[]) {
      expect(getTier(t).sparkSize, `${t} sparkSize > light`).toBeGreaterThanOrEqual(light);
    }
  });

  it('blockstop is always <= hitstop for same tier', () => {
    for (const t of TIERS) {
      const fb = getTier(t);
      expect(fb.blockstop, `${t} blockstop <= hitstop`).toBeLessThanOrEqual(fb.hitstop);
    }
  });

  it('blockShake is reasonable relative to hit shake', () => {
    for (const t of TIERS) {
      const fb = getTier(t);
      // blockShake can exceed hitShake for light tiers (KOF2002 block feel),
      // but should never be more than 2× hitShake
      expect(fb.blockShakeIntensity, `${t} blockShake <= 2× shake`).toBeLessThanOrEqual(fb.shakeIntensity * 2);
    }
  });
});
