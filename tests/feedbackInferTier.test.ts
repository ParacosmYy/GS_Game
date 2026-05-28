/**
 * inferTier + attackTierMap regression — verifies automatic tier classification
 * and explicit tier mappings for all 3 characters' attack types.
 */
import { describe, it, expect } from 'vitest';
import { inferTier, FEEDBACK_MANIFEST, type FeedbackTier } from '../src/core/feedbackManifest.js';
import { RYO_FEEDBACK_SUMMARY } from '../src/content/characters/ryo/feedback/ryoFeedback.js';
import { KYO_FEEDBACK_SUMMARY } from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import { IORI_FEEDBACK_SUMMARY } from '../src/content/characters/iori/feedback/ioriFeedback.js';

describe('inferTier pattern classification', () => {
  it('classifies HSDM_ prefix as hsdm', () => {
    expect(inferTier('HSDM_ANY' as any)).toBe('hsdm');
  });

  it('classifies SDM_ prefix as sdm', () => {
    expect(inferTier('SDM_ANY' as any)).toBe('sdm');
  });

  it('classifies DM_ prefix as dm', () => {
    expect(inferTier('DM_ANY' as any)).toBe('dm');
  });

  it('classifies special moves as special', () => {
    expect(inferTier('RYO_KOOU' as any)).toBe('special');
    expect(inferTier('KYO_ONIYAKI' as any)).toBe('special');
    expect(inferTier('IORI_YAMIBARAI' as any)).toBe('special');
  });

  it('classifies throws as special', () => {
    expect(inferTier('THROW' as any)).toBe('special');
  });

  it('classifies heavy attacks (C/D) as heavy', () => {
    expect(inferTier('STAND_C' as any)).toBe('heavy');
    expect(inferTier('STAND_D' as any)).toBe('heavy');
    expect(inferTier('CROUCH_C' as any)).toBe('heavy');
    expect(inferTier('CROUCH_D' as any)).toBe('heavy');
    expect(inferTier('JUMP_C' as any)).toBe('heavy');
    expect(inferTier('JUMP_D' as any)).toBe('heavy');
  });

  it('classifies light attacks (A/B) as light', () => {
    expect(inferTier('STAND_A' as any)).toBe('light');
    expect(inferTier('STAND_B' as any)).toBe('light');
    expect(inferTier('CROUCH_A' as any)).toBe('light');
    expect(inferTier('CROUCH_B' as any)).toBe('light');
    expect(inferTier('JUMP_A' as any)).toBe('light');
    expect(inferTier('JUMP_B' as any)).toBe('light');
  });
});

describe('attackTierMap explicit mappings', () => {
  const map = FEEDBACK_MANIFEST.attackTierMap;

  it('maps all 6 tiers', () => {
    const tiers = new Set(Object.values(map));
    expect(tiers.has('light')).toBe(true);
    expect(tiers.has('heavy')).toBe(true);
    expect(tiers.has('special')).toBe(true);
    expect(tiers.has('dm')).toBe(true);
    expect(tiers.has('sdm')).toBe(true);
    expect(tiers.has('hsdm')).toBe(true);
  });

  it('Ryo specials are all mapped to special tier', () => {
    for (const atk of RYO_FEEDBACK_SUMMARY.special) {
      expect(map[atk as keyof typeof map], `Ryo special ${atk}`).toBe('special');
    }
  });

  it('Kyo specials are all mapped to special tier', () => {
    for (const atk of KYO_FEEDBACK_SUMMARY.special) {
      expect(map[atk as keyof typeof map], `Kyo special ${atk}`).toBe('special');
    }
  });

  it('Iori specials are all mapped to special tier', () => {
    for (const atk of IORI_FEEDBACK_SUMMARY.special) {
      expect(map[atk as keyof typeof map], `Iori special ${atk}`).toBe('special');
    }
  });

  it('DMs are mapped to dm tier', () => {
    for (const atk of RYO_FEEDBACK_SUMMARY.dm) {
      expect(map[atk as keyof typeof map], `Ryo DM ${atk}`).toBe('dm');
    }
    for (const atk of KYO_FEEDBACK_SUMMARY.dm) {
      expect(map[atk as keyof typeof map], `Kyo DM ${atk}`).toBe('dm');
    }
    for (const atk of IORI_FEEDBACK_SUMMARY.dm) {
      expect(map[atk as keyof typeof map], `Iori DM ${atk}`).toBe('dm');
    }
  });

  it('SDMs are mapped to sdm tier', () => {
    for (const atk of RYO_FEEDBACK_SUMMARY.sdm) {
      expect(map[atk as keyof typeof map], `Ryo SDM ${atk}`).toBe('sdm');
    }
    for (const atk of KYO_FEEDBACK_SUMMARY.sdm) {
      expect(map[atk as keyof typeof map], `Kyo SDM ${atk}`).toBe('sdm');
    }
    for (const atk of IORI_FEEDBACK_SUMMARY.sdm) {
      expect(map[atk as keyof typeof map], `Iori SDM ${atk}`).toBe('sdm');
    }
  });

  it('HSDMs are mapped to hsdm tier', () => {
    for (const atk of RYO_FEEDBACK_SUMMARY.hsdm) {
      expect(map[atk as keyof typeof map], `Ryo HSDM ${atk}`).toBe('hsdm');
    }
    for (const atk of KYO_FEEDBACK_SUMMARY.hsdm) {
      expect(map[atk as keyof typeof map], `Kyo HSDM ${atk}`).toBe('hsdm');
    }
    for (const atk of IORI_FEEDBACK_SUMMARY.hsdm) {
      expect(map[atk as keyof typeof map], `Iori HSDM ${atk}`).toBe('hsdm');
    }
  });

  it('has at least 70 entries total', () => {
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(70);
  });
});
