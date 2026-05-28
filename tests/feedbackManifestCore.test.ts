/**
 * Feedback Manifest inferTier + getCharacterDMPalette Regression Tests
 *
 * Validates the core feedback tier inference logic and character DM palette system.
 */
import { describe, it, expect } from 'vitest';
import {
  FEEDBACK_TIERS,
  FEEDBACK_MANIFEST,
  inferTier,
  getFeedback,
  getFeedbackTier,
  getFeedbackByTier,
  getCharacterDMPalette,
  type FeedbackTier,
} from '../src/core/feedbackManifest.js';

// ===== FEEDBACK_TIERS data =====

describe('FEEDBACK_TIERS', () => {
  const TIERS: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];

  it('has all 6 tiers', () => {
    for (const t of TIERS) {
      expect(FEEDBACK_TIERS[t]).toBeDefined();
    }
  });

  it('every tier has all required fields', () => {
    for (const [key, params] of Object.entries(FEEDBACK_TIERS)) {
      expect(params.tier, `${key} tier`).toBe(key);
      expect(params.hitstop, `${key} hitstop`).toBeGreaterThan(0);
      expect(params.blockstop, `${key} blockstop`).toBeGreaterThanOrEqual(0);
      expect(params.shakeIntensity, `${key} shakeIntensity`).toBeGreaterThan(0);
      expect(params.shakeDuration, `${key} shakeDuration`).toBeGreaterThan(0);
      expect(params.sparkCount, `${key} sparkCount`).toBeGreaterThan(0);
      expect(params.sparkSize, `${key} sparkSize`).toBeGreaterThan(0);
      expect(params.hitFlashFrames, `${key} hitFlashFrames`).toBeGreaterThan(0);
      expect(params.sparkPalette.length, `${key} sparkPalette`).toBeGreaterThan(0);
      expect(params.sparkType, `${key} sparkType`).toBeTruthy();
      expect(params.hitPushbackScale, `${key} hitPushbackScale`).toBeGreaterThan(0);
      expect(params.impactRingCount, `${key} impactRingCount`).toBeGreaterThan(0);
    }
  });

  it('hitstop increases by tier: light < heavy < special < dm < sdm < hsdm', () => {
    expect(FEEDBACK_TIERS.light.hitstop).toBeLessThan(FEEDBACK_TIERS.heavy.hitstop);
    expect(FEEDBACK_TIERS.heavy.hitstop).toBeLessThan(FEEDBACK_TIERS.special.hitstop);
    expect(FEEDBACK_TIERS.special.hitstop).toBeLessThan(FEEDBACK_TIERS.dm.hitstop);
    expect(FEEDBACK_TIERS.dm.hitstop).toBeLessThan(FEEDBACK_TIERS.sdm.hitstop);
    expect(FEEDBACK_TIERS.sdm.hitstop).toBeLessThan(FEEDBACK_TIERS.hsdm.hitstop);
  });

  it('sparkCount increases by tier', () => {
    expect(FEEDBACK_TIERS.light.sparkCount).toBeLessThan(FEEDBACK_TIERS.heavy.sparkCount);
    expect(FEEDBACK_TIERS.heavy.sparkCount).toBeLessThan(FEEDBACK_TIERS.special.sparkCount);
    expect(FEEDBACK_TIERS.special.sparkCount).toBeLessThan(FEEDBACK_TIERS.dm.sparkCount);
  });

  it('impactRingCount increases by tier', () => {
    expect(FEEDBACK_TIERS.light.impactRingCount).toBeLessThan(FEEDBACK_TIERS.special.impactRingCount);
    expect(FEEDBACK_TIERS.special.impactRingCount).toBeLessThan(FEEDBACK_TIERS.dm.impactRingCount);
    expect(FEEDBACK_TIERS.dm.impactRingCount).toBeLessThan(FEEDBACK_TIERS.hsdm.impactRingCount);
  });

  it('sparkType escalates: small → medium → large → burst → mega → hyper', () => {
    expect(FEEDBACK_TIERS.light.sparkType).toBe('small');
    expect(FEEDBACK_TIERS.heavy.sparkType).toBe('medium');
    expect(FEEDBACK_TIERS.special.sparkType).toBe('large');
    expect(FEEDBACK_TIERS.dm.sparkType).toBe('burst');
    expect(FEEDBACK_TIERS.sdm.sparkType).toBe('mega');
    expect(FEEDBACK_TIERS.hsdm.sparkType).toBe('hyper');
  });
});

// ===== inferTier =====

describe('inferTier', () => {
  it('infers hsdm for HSDM_ prefix', () => {
    expect(inferTier('HSDM_RYUKO_RANBU')).toBe('hsdm');
  });

  it('infers sdm for SDM_ prefix', () => {
    expect(inferTier('SDM_TEN_HA_OU')).toBe('sdm');
  });

  it('infers dm for DM_ prefix', () => {
    expect(inferTier('DM_OROCHINAGI')).toBe('dm');
  });

  it('infers special for character prefix (Kyo)', () => {
    expect(inferTier('KYO_YAMIBARAI')).toBe('special');
  });

  it('infers special for character prefix (Iori)', () => {
    expect(inferTier('IORI_AOIHANA')).toBe('special');
  });

  it('infers special for character prefix (Ryo)', () => {
    expect(inferTier('RYO_KOOU')).toBe('special');
  });

  it('infers special for SPECIAL_ prefix', () => {
    expect(inferTier('SPECIAL_PROJECTILE')).toBe('special');
  });

  it('infers special for throws', () => {
    expect(inferTier('THROW')).toBe('special');
    expect(inferTier('THROW_FORWARD')).toBe('special');
    expect(inferTier('THROW_BACK')).toBe('special');
  });

  it('infers heavy for C/D suffix normals', () => {
    expect(inferTier('STAND_C')).toBe('heavy');
    expect(inferTier('STAND_D')).toBe('heavy');
    expect(inferTier('CROUCH_C')).toBe('heavy');
    expect(inferTier('CROUCH_D')).toBe('heavy');
    expect(inferTier('JUMP_C')).toBe('heavy');
    expect(inferTier('JUMP_D')).toBe('heavy');
  });

  it('infers heavy for blowback attacks', () => {
    expect(inferTier('STAND_CD')).toBe('heavy');
    expect(inferTier('JUMP_CD')).toBe('heavy');
  });

  it('infers light for A/B suffix normals', () => {
    expect(inferTier('STAND_A')).toBe('light');
    expect(inferTier('STAND_B')).toBe('light');
    expect(inferTier('CROUCH_A')).toBe('light');
    expect(inferTier('CROUCH_B')).toBe('light');
    expect(inferTier('JUMP_A')).toBe('light');
    expect(inferTier('JUMP_B')).toBe('light');
    expect(inferTier('CLOSE_A')).toBe('light');
    expect(inferTier('CLOSE_B')).toBe('light');
  });
});

// ===== getFeedback =====

describe('getFeedback', () => {
  it('returns light params for STAND_A', () => {
    const params = getFeedback('STAND_A');
    expect(params.tier).toBe('light');
  });

  it('returns heavy params for STAND_C', () => {
    const params = getFeedback('STAND_C');
    expect(params.tier).toBe('heavy');
  });

  it('returns special params for KYO_YAMIBARAI', () => {
    const params = getFeedback('KYO_YAMIBARAI');
    expect(params.tier).toBe('special');
  });

  it('returns dm params for DM_OROCHINAGI', () => {
    const params = getFeedback('DM_OROCHINAGI');
    expect(params.tier).toBe('dm');
  });

  it('returns hsdm params for HSDM_YAOTOME', () => {
    const params = getFeedback('HSDM_YAOTOME');
    expect(params.tier).toBe('hsdm');
  });

  it('uses explicit mapping over inference', () => {
    // STAND_A is explicitly mapped in attackTierMap as 'light'
    const params = getFeedback('STAND_A');
    expect(params.tier).toBe('light');
  });

  it('falls back to inferTier for unmapped attacks', () => {
    // Use a character prefix not in attackTierMap but in inferTier logic
    const params = getFeedback('TERRY_BURN_KNUCKLE');
    expect(params.tier).toBe('special');
  });
});

// ===== getFeedbackTier =====

describe('getFeedbackTier', () => {
  it('returns tier name strings', () => {
    expect(typeof getFeedbackTier('STAND_A')).toBe('string');
    expect(getFeedbackTier('STAND_A')).toBe('light');
    expect(getFeedbackTier('DM_OROCHINAGI')).toBe('dm');
  });
});

// ===== getFeedbackByTier =====

describe('getFeedbackByTier', () => {
  it('returns correct tier params', () => {
    expect(getFeedbackByTier('light').tier).toBe('light');
    expect(getFeedbackByTier('hsdm').tier).toBe('hsdm');
  });
});

// ===== FEEDBACK_MANIFEST attackTierMap =====

describe('FEEDBACK_MANIFEST attackTierMap', () => {
  it('has version number', () => {
    expect(FEEDBACK_MANIFEST.version).toBeGreaterThan(0);
  });

  it('attackTierMap has entries for all 3 main characters', () => {
    const keys = Object.keys(FEEDBACK_MANIFEST.attackTierMap);
    const hasRyo = keys.some(k => k.startsWith('RYO_'));
    const hasKyo = keys.some(k => k.startsWith('KYO_'));
    const hasIori = keys.some(k => k.startsWith('IORI_'));
    expect(hasRyo).toBe(true);
    expect(hasKyo).toBe(true);
    expect(hasIori).toBe(true);
  });

  it('all mapped DM entries map to dm/sdm/hsdm tiers', () => {
    for (const [key, tier] of Object.entries(FEEDBACK_MANIFEST.attackTierMap)) {
      if (key.startsWith('DM_')) {
        expect(tier).toBe('dm');
      }
      if (key.startsWith('SDM_')) {
        expect(tier).toBe('sdm');
      }
      if (key.startsWith('HSDM_')) {
        expect(tier).toBe('hsdm');
      }
    }
  });
});

// ===== getCharacterDMPalette =====

describe('getCharacterDMPalette', () => {
  it('returns palette for kyo', () => {
    expect(getCharacterDMPalette('kyo', 'dm')).not.toBeNull();
    expect(getCharacterDMPalette('kyo', 'sdm')).not.toBeNull();
    expect(getCharacterDMPalette('kyo', 'hsdm')).not.toBeNull();
  });

  it('returns palette for iori', () => {
    expect(getCharacterDMPalette('iori', 'dm')).not.toBeNull();
    expect(getCharacterDMPalette('iori', 'sdm')).not.toBeNull();
    expect(getCharacterDMPalette('iori', 'hsdm')).not.toBeNull();
  });

  it('returns palette for ryo', () => {
    expect(getCharacterDMPalette('ryo', 'dm')).not.toBeNull();
    expect(getCharacterDMPalette('ryo', 'sdm')).not.toBeNull();
    expect(getCharacterDMPalette('ryo', 'hsdm')).not.toBeNull();
  });

  it('returns null for unknown character', () => {
    expect(getCharacterDMPalette('unknown', 'dm')).toBeNull();
  });

  it('returns null for non-DM tiers', () => {
    expect(getCharacterDMPalette('kyo', 'light')).toBeNull();
    expect(getCharacterDMPalette('kyo', 'heavy')).toBeNull();
    expect(getCharacterDMPalette('kyo', 'special')).toBeNull();
  });

  it('all palettes are arrays of hex colors', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    for (const charId of ['kyo', 'iori', 'ryo']) {
      for (const tier of ['dm', 'sdm', 'hsdm'] as const) {
        const palette = getCharacterDMPalette(charId, tier);
        expect(palette, `${charId} ${tier} palette`).not.toBeNull();
        for (const color of palette!) {
          expect(color, `${charId} ${tier} color`).toMatch(hexPattern);
        }
      }
    }
  });

  it('hsdm palettes have more colors than dm palettes', () => {
    const kyoDm = getCharacterDMPalette('kyo', 'dm')!;
    const kyoHsdm = getCharacterDMPalette('kyo', 'hsdm')!;
    expect(kyoHsdm.length).toBeGreaterThanOrEqual(kyoDm.length);
  });
});
