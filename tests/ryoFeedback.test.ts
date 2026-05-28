/**
 * Ryo Feedback Tier Regression Tests
 *
 * Expanded from 5 baseline tests to full tier validation.
 */
import { describe, it, expect } from 'vitest';
import { getRyoFeedbackTiers, getRyoFeedback, RYO_FEEDBACK_SUMMARY } from '../src/content/characters/ryo/feedback.js';

const TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;

describe('Ryo Feedback Tier Summary', () => {
  it('all 6 tiers have entries', () => {
    for (const tier of TIERS) {
      expect(RYO_FEEDBACK_SUMMARY[tier].length, `${tier} has entries`).toBeGreaterThan(0);
    }
  });

  it('no overlapping attack types between tiers', () => {
    const allTypes: string[] = [];
    for (const tier of TIERS) {
      allTypes.push(...RYO_FEEDBACK_SUMMARY[tier]);
    }
    expect(new Set(allTypes).size).toBe(allTypes.length);
  });

  it('light tier has stand_a and crouch_a', () => {
    expect(RYO_FEEDBACK_SUMMARY.light).toContain('STAND_A');
    expect(RYO_FEEDBACK_SUMMARY.light).toContain('CROUCH_A');
  });

  it('heavy tier has stand_c and stand_d', () => {
    expect(RYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_C');
    expect(RYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_D');
  });

  it('special tier has Ryo moves', () => {
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_KOOU');
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_KO_HOU');
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_HIEN');
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_ZANRETSU_KEN');
  });

  it('special tier includes command normals', () => {
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_TSURIZAO');
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_ORISHI');
  });

  it('special tier includes C versions', () => {
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_KOOU_C');
    expect(RYO_FEEDBACK_SUMMARY.special).toContain('RYO_KO_HOU_C');
  });

  it('dm tier has both DMs', () => {
    expect(RYO_FEEDBACK_SUMMARY.dm).toContain('DM_TEN_HA_OU');
    expect(RYO_FEEDBACK_SUMMARY.dm).toContain('DM_RYUKO_RANBU');
  });

  it('sdm tier has both SDMs', () => {
    expect(RYO_FEEDBACK_SUMMARY.sdm).toContain('SDM_TEN_HA_OU');
    expect(RYO_FEEDBACK_SUMMARY.sdm).toContain('SDM_RYUKO_RANBU');
  });

  it('hsdm tier has HSDM', () => {
    expect(RYO_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_RYUKO_RANBU');
  });

  it('getRyoFeedbackTiers covers attack keys', () => {
    const tiers = getRyoFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('getRyoFeedback returns valid params for STAND_A', () => {
    const fb = getRyoFeedback('STAND_A');
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
  });

  it('getRyoFeedback returns default for unknown', () => {
    const fb = getRyoFeedback('UNKNOWN_ATTACK');
    expect(fb).toBeDefined();
  });

  it('special tier has more entries than dm tier', () => {
    expect(RYO_FEEDBACK_SUMMARY.special.length).toBeGreaterThan(RYO_FEEDBACK_SUMMARY.dm.length);
  });
});
