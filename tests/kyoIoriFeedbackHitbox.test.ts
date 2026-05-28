/**
 * Kyo / Iori Feedback Tiers & Hitbox Coverage Regression Test
 * Verifies feedback tier summaries have correct category distribution and hitbox keys match.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_FEEDBACK_SUMMARY,
  getKyoFeedback,
  getKyoFeedbackTiers,
} from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import {
  IORI_FEEDBACK_SUMMARY,
  getIoriFeedback,
  getIoriFeedbackTiers,
} from '../src/content/characters/iori/feedback/ioriFeedback.js';
import {
  KYO_HITBOX_KEYS,
  KYO_ATTACK_FRAME_KEYS,
} from '../src/content/characters/kyo/hitboxes/kyoHitboxes.js';
import {
  IORI_HITBOX_KEYS,
  IORI_ATTACK_FRAME_KEYS,
} from '../src/content/characters/iori/hitboxes/ioriHitboxes.js';

const ALL_TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;

describe('Kyo Feedback Summary', () => {
  it('has all 6 feedback tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(KYO_FEEDBACK_SUMMARY[tier], `Kyo ${tier}`).toBeDefined();
      expect(KYO_FEEDBACK_SUMMARY[tier].length, `Kyo ${tier} count`).toBeGreaterThan(0);
    }
  });

  it('light tier has basic normals', () => {
    const light = KYO_FEEDBACK_SUMMARY.light;
    expect(light).toContain('STAND_A');
    expect(light).toContain('CROUCH_B');
    expect(light).toContain('JUMP_A');
  });

  it('heavy tier has heavy normals', () => {
    const heavy = KYO_FEEDBACK_SUMMARY.heavy;
    expect(heavy).toContain('STAND_C');
    expect(heavy).toContain('CROUCH_D');
    expect(heavy).toContain('STAND_CD');
  });

  it('special tier has Kyo specials and command normals', () => {
    const special = KYO_FEEDBACK_SUMMARY.special;
    expect(special).toContain('KYO_ONIYAKI');
    expect(special).toContain('KYO_YAMIBARAI');
    expect(special).toContain('CMD_GOFU_YOU');
    expect(special).toContain('KYO_ARAGAMI');
    expect(special).toContain('KYO_DOKUGAMI');
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

  it('no overlap between tiers', () => {
    const allAttacks = ALL_TIERS.flatMap(t => KYO_FEEDBACK_SUMMARY[t]);
    const uniqueAttacks = new Set(allAttacks);
    expect(uniqueAttacks.size).toBe(allAttacks.length);
  });

  it('getKyoFeedback returns valid structure for specials', () => {
    const fb = getKyoFeedback('KYO_ONIYAKI');
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
    expect(fb.shakeIntensity).toBeGreaterThan(0);
  });

  it('getKyoFeedbackTiers returns entries for all attacks', () => {
    const tiers = getKyoFeedbackTiers();
    const totalAttacks = ALL_TIERS.flatMap(t => KYO_FEEDBACK_SUMMARY[t]);
    for (const atk of totalAttacks) {
      expect(tiers[atk], `${atk} tier`).toBeDefined();
    }
  });
});

describe('Iori Feedback Summary', () => {
  it('has all 6 feedback tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(IORI_FEEDBACK_SUMMARY[tier], `Iori ${tier}`).toBeDefined();
      expect(IORI_FEEDBACK_SUMMARY[tier].length, `Iori ${tier} count`).toBeGreaterThan(0);
    }
  });

  it('special tier has Iori specials and command normals', () => {
    const special = IORI_FEEDBACK_SUMMARY.special;
    expect(special).toContain('IORI_ONIYAKI');
    expect(special).toContain('IORI_YAMIBARAI');
    expect(special).toContain('IORI_YUMEYUMI');
    expect(special).toContain('IORI_AOIHANA');
    expect(special).toContain('IORI_KUZUKAZE');
  });

  it('dm tier has DM_YATAGARASU', () => {
    expect(IORI_FEEDBACK_SUMMARY.dm).toContain('DM_YATAGARASU');
  });

  it('hsdm tier has HSDM_YAOTOME', () => {
    expect(IORI_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_YAOTOME');
  });

  it('no overlap between tiers', () => {
    const allAttacks = ALL_TIERS.flatMap(t => IORI_FEEDBACK_SUMMARY[t]);
    const uniqueAttacks = new Set(allAttacks);
    expect(uniqueAttacks.size).toBe(allAttacks.length);
  });

  it('getIoriFeedback returns valid structure', () => {
    const fb = getIoriFeedback('IORI_ONIYAKI');
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
  });
});

describe('Kyo Hitbox Keys', () => {
  it('has at least 22 hitbox keys', () => {
    expect(KYO_HITBOX_KEYS.length).toBeGreaterThanOrEqual(22);
  });

  it('attack frame keys match hitbox keys', () => {
    const hitboxSet = new Set(KYO_HITBOX_KEYS);
    for (const key of KYO_ATTACK_FRAME_KEYS) {
      expect(hitboxSet.has(key), `attack frame ${key} in hitbox keys`).toBe(true);
    }
  });

  it('all DM/SDM/HSDM keys present', () => {
    expect(KYO_HITBOX_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('all rekka chain keys present', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI_YANOSABI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_DOKUGAMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_TSUMIYOMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_BATSUYOMI');
  });
});

describe('Iori Hitbox Keys', () => {
  it('has at least 19 hitbox keys', () => {
    expect(IORI_HITBOX_KEYS.length).toBeGreaterThanOrEqual(19);
  });

  it('attack frame keys match hitbox keys', () => {
    const hitboxSet = new Set(IORI_HITBOX_KEYS);
    for (const key of IORI_ATTACK_FRAME_KEYS) {
      expect(hitboxSet.has(key), `attack frame ${key} in hitbox keys`).toBe(true);
    }
  });

  it('all Aoihana chain keys present', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_3');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_3');
  });

  it('Kuzukaze is in hitbox keys', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_KUZUKAZE');
  });
});
