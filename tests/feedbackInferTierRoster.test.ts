/**
 * inferTier 27-character roster coverage regression tests
 *
 * Protects: every ROASTER character's specials are correctly classified,
 * DM/SDM/HSDM prefixes, normal attack classification, heavy detection.
 */
import { describe, it, expect } from 'vitest';
import { inferTier, getFeedback, FEEDBACK_TIERS } from '../src/core/feedbackManifest.js';
import type { FeedbackTier } from '../src/core/feedbackManifest.js';
import { ROSTER } from '../src/characters/index.js';

const CHAR_IDS = ROSTER.map(c => c.id.toUpperCase());

describe('inferTier 27-character coverage', () => {
  it('all 27 character IDs have specials classified as special', () => {
    for (const charId of CHAR_IDS) {
      const attackName = `${charId}_SPECIAL_MOVE`;
      const tier = inferTier(attackName as any);
      expect(tier, `${charId} special should be 'special'`).toBe('special');
    }
  });

  it('DM prefix returns dm', () => {
    for (const charId of CHAR_IDS) {
      const attackName = `DM_${charId}_ATTACK`;
      expect(inferTier(attackName as any)).toBe('dm');
    }
  });

  it('SDM prefix returns sdm', () => {
    expect(inferTier('SDM_TEST' as any)).toBe('sdm');
  });

  it('HSDM prefix returns hsdm', () => {
    expect(inferTier('HSDM_TEST' as any)).toBe('hsdm');
  });

  it('HSDM takes priority over SDM', () => {
    expect(inferTier('HSDM_TEST' as any)).toBe('hsdm');
  });

  it('generic normals classified correctly', () => {
    const lights = ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'];
    const heavies = ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D', 'STAND_CD', 'JUMP_CD'];
    for (const at of lights) {
      expect(inferTier(at as any), `${at} should be light`).toBe('light');
    }
    for (const at of heavies) {
      expect(inferTier(at as any), `${at} should be heavy`).toBe('heavy');
    }
  });

  it('throws classified as special', () => {
    expect(inferTier('THROW' as any)).toBe('special');
    expect(inferTier('THROW_FORWARD' as any)).toBe('special');
    expect(inferTier('THROW_BACK' as any)).toBe('special');
  });

  it('SPECIAL_PROJECTILE classified as special', () => {
    expect(inferTier('SPECIAL_PROJECTILE' as any)).toBe('special');
  });
});

describe('getFeedback fallback works for unlisted characters', () => {
  it('returns valid feedback for Terry special', () => {
    const fb = getFeedback('TERRY_BURN_KNUCKLE' as any);
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
  });

  it('returns valid feedback for Kim special', () => {
    const fb = getFeedback('KIM_HIENZAN' as any);
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
  });

  it('returns light feedback for unknown light attack', () => {
    const fb = getFeedback('STAND_A' as any);
    expect(fb.hitstop).toBe(FEEDBACK_TIERS.light.hitstop);
  });

  it('returns heavy feedback for unknown heavy attack', () => {
    const fb = getFeedback('STAND_C' as any);
    expect(fb.hitstop).toBe(FEEDBACK_TIERS.heavy.hitstop);
  });

  it('feedback tier hierarchy: hsdm > sdm > dm > special > heavy > light', () => {
    const tiers: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];
    const hitstops = tiers.map(t => FEEDBACK_TIERS[t].hitstop);
    for (let i = 1; i < hitstops.length; i++) {
      expect(hitstops[i], `${tiers[i]}.hitstop > ${tiers[i-1]}.hitstop`).toBeGreaterThan(hitstops[i - 1]);
    }
  });
});
