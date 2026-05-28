/**
 * Kyo & Iori Feedback Tier Mapping Regression Tests
 *
 * Validates feedback tier summaries and query functions for Kyo and Iori.
 */
import { describe, it, expect } from 'vitest';
import {
  getKyoFeedbackTiers,
  getKyoFeedback,
  KYO_FEEDBACK_SUMMARY,
} from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import {
  getIoriFeedbackTiers,
  getIoriFeedback,
  IORI_FEEDBACK_SUMMARY,
} from '../src/content/characters/iori/feedback/ioriFeedback.js';

const TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;

// ===== Kyo Feedback Summary =====

describe('KYO_FEEDBACK_SUMMARY', () => {
  it('has all 6 tiers with entries', () => {
    for (const tier of TIERS) {
      expect(KYO_FEEDBACK_SUMMARY[tier].length, `Kyo ${tier}`).toBeGreaterThan(0);
    }
  });

  it('light tier has generic normals (A/B)', () => {
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('STAND_A');
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('STAND_B');
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('CROUCH_A');
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('JUMP_A');
  });

  it('heavy tier has C/D normals', () => {
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_C');
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_D');
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('CROUCH_C');
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_CD');
  });

  it('special tier has Kyo character specials', () => {
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_YAMIBARAI');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ONIYAKI');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ARAGAMI');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_DOKUGAMI');
  });

  it('special tier includes C-version specials', () => {
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_YAMIBARAI_C');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ONIYAKI_C');
  });

  it('special tier includes rekka followups', () => {
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ARAGAMI_YANOSABI');
  });

  it('special tier includes command normals', () => {
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('CMD_GOFU_YOU');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('CMD_88SHIKI');
  });

  it('dm tier has DM_OROCHINAGI', () => {
    expect(KYO_FEEDBACK_SUMMARY.dm).toContain('DM_OROCHINAGI');
  });

  it('sdm tier has SDM_OROCHINAGI', () => {
    expect(KYO_FEEDBACK_SUMMARY.sdm).toContain('SDM_OROCHINAGI');
  });

  it('hsdm tier has HSDM_OROCHINAGI', () => {
    expect(KYO_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_OROCHINAGI');
  });

  it('no entries appear in multiple tiers', () => {
    const allEntries: string[] = [];
    for (const tier of TIERS) {
      allEntries.push(...KYO_FEEDBACK_SUMMARY[tier]);
    }
    const unique = new Set(allEntries);
    expect(unique.size).toBe(allEntries.length);
  });
});

// ===== Iori Feedback Summary =====

describe('IORI_FEEDBACK_SUMMARY', () => {
  it('has all 6 tiers with entries', () => {
    for (const tier of TIERS) {
      expect(IORI_FEEDBACK_SUMMARY[tier].length, `Iori ${tier}`).toBeGreaterThan(0);
    }
  });

  it('light tier has generic normals', () => {
    expect(IORI_FEEDBACK_SUMMARY.light).toContain('STAND_A');
    expect(IORI_FEEDBACK_SUMMARY.light).toContain('CROUCH_A');
    expect(IORI_FEEDBACK_SUMMARY.light).toContain('JUMP_A');
  });

  it('heavy tier has C/D normals', () => {
    expect(IORI_FEEDBACK_SUMMARY.heavy).toContain('STAND_C');
    expect(IORI_FEEDBACK_SUMMARY.heavy).toContain('STAND_D');
    expect(IORI_FEEDBACK_SUMMARY.heavy).toContain('STAND_CD');
  });

  it('special tier has Iori character specials', () => {
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_YAMIBARAI');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_ONIYAKI');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_KUZUKAZE');
  });

  it('special tier includes Aoihana rekka chain', () => {
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA_2');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA_3');
  });

  it('special tier includes C-version Aoihana rekka chain', () => {
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA_C');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA_C_2');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA_C_3');
  });

  it('special tier includes command normals', () => {
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_YUMEYUMI');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_KATANUGI');
  });

  it('dm tier has DM_YATAGARASU', () => {
    expect(IORI_FEEDBACK_SUMMARY.dm).toContain('DM_YATAGARASU');
  });

  it('sdm tier has SDM_YATAGARASU', () => {
    expect(IORI_FEEDBACK_SUMMARY.sdm).toContain('SDM_YATAGARASU');
  });

  it('hsdm tier has HSDM_YAOTOME', () => {
    expect(IORI_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_YAOTOME');
  });

  it('no entries appear in multiple tiers', () => {
    const allEntries: string[] = [];
    for (const tier of TIERS) {
      allEntries.push(...IORI_FEEDBACK_SUMMARY[tier]);
    }
    const unique = new Set(allEntries);
    expect(unique.size).toBe(allEntries.length);
  });
});

// ===== Query Functions =====

describe('getKyoFeedbackTiers', () => {
  it('returns mapping for all Kyo attack keys', () => {
    const tiers = getKyoFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('maps STAND_A to light', () => {
    const tiers = getKyoFeedbackTiers();
    expect(tiers['STAND_A']).toBe('light');
  });

  it('maps KYO_YAMIBARAI to special', () => {
    const tiers = getKyoFeedbackTiers();
    expect(tiers['KYO_YAMIBARAI']).toBe('special');
  });

  it('maps DM_OROCHINAGI to dm', () => {
    const tiers = getKyoFeedbackTiers();
    expect(tiers['DM_OROCHINAGI']).toBe('dm');
  });
});

describe('getKyoFeedback', () => {
  it('returns light params for STAND_A', () => {
    const params = getKyoFeedback('STAND_A');
    expect(params.tier).toBe('light');
  });

  it('returns special params for KYO_ONIYAKI', () => {
    const params = getKyoFeedback('KYO_ONIYAKI');
    expect(params.tier).toBe('special');
  });

  it('returns hsdm params for HSDM_OROCHINAGI', () => {
    const params = getKyoFeedback('HSDM_OROCHINAGI');
    expect(params.tier).toBe('hsdm');
  });
});

describe('getIoriFeedbackTiers', () => {
  it('returns mapping for Iori attack keys', () => {
    const tiers = getIoriFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('maps IORI_AOIHANA to special', () => {
    const tiers = getIoriFeedbackTiers();
    expect(tiers['IORI_AOIHANA']).toBe('special');
  });

  it('maps HSDM_YAOTOME to hsdm', () => {
    const tiers = getIoriFeedbackTiers();
    expect(tiers['HSDM_YAOTOME']).toBe('hsdm');
  });
});

describe('getIoriFeedback', () => {
  it('returns heavy params for STAND_C', () => {
    const params = getIoriFeedback('STAND_C');
    expect(params.tier).toBe('heavy');
  });

  it('returns special params for IORI_ONIYAKI', () => {
    const params = getIoriFeedback('IORI_ONIYAKI');
    expect(params.tier).toBe('special');
  });
});

// ===== Cross-character Consistency =====

describe('Kyo/Iori feedback cross-character consistency', () => {
  it('light and heavy tiers share generic normals', () => {
    expect(KYO_FEEDBACK_SUMMARY.light).toEqual(IORI_FEEDBACK_SUMMARY.light);
    expect(KYO_FEEDBACK_SUMMARY.heavy).toEqual(IORI_FEEDBACK_SUMMARY.heavy);
  });

  it('special tiers have different character-specific entries', () => {
    const kyoSpecial = new Set(KYO_FEEDBACK_SUMMARY.special);
    const ioriSpecial = new Set(IORI_FEEDBACK_SUMMARY.special);
    const overlap = [...kyoSpecial].filter(k => ioriSpecial.has(k));
    expect(overlap.length).toBeLessThan(kyoSpecial.size);
  });

  it('DM tiers have no overlap', () => {
    const kyoDM = new Set(KYO_FEEDBACK_SUMMARY.dm);
    const ioriDM = new Set(IORI_FEEDBACK_SUMMARY.dm);
    for (const k of kyoDM) {
      expect(ioriDM.has(k)).toBe(false);
    }
  });

  it('HSDM tiers have no overlap', () => {
    const kyoHSDM = new Set(KYO_FEEDBACK_SUMMARY.hsdm);
    const ioriHSDM = new Set(IORI_FEEDBACK_SUMMARY.hsdm);
    for (const k of kyoHSDM) {
      expect(ioriHSDM.has(k)).toBe(false);
    }
  });
});
