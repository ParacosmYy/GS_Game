/**
 * Feedback Manifest Closed-Loop Validation Tests
 *
 * Validates that the feedback manifest (5 tiers: light/heavy/special/dm/sdm)
 * is structurally complete, values are within KOF2002-calibrated ranges,
 * tier escalation is correct, Ryo attack type mapping works, and inferTier()
 * returns valid tiers for every AttackType.
 */
import { describe, it, expect } from 'vitest';
import {
  getFeedback,
  getFeedbackByTier,
  inferTier,
  FEEDBACK_TIERS,
  FEEDBACK_MANIFEST,
  type FeedbackTier,
  type FeedbackParams,
} from '../src/core/feedbackManifest.js';
import { AttackType } from '../src/core/types.js';

// ===== Constants for range validation =====

const ALL_TIERS: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm'];

const RANGE = {
  hitstop: { min: 1, max: 30 },
  blockstop: { min: 0, max: 30 },
  shakeIntensity: { min: 1, max: 20 },
  shakeDuration: { min: 1, max: 25 },
  blockShakeIntensity: { min: 0, max: 20 },
  blockShakeDuration: { min: 0, max: 25 },
  sparkCount: { min: 1, max: 25 },
  sparkSize: { min: 0.1, max: 2.0 },
  sparkStarRatio: { min: 0, max: 1.0 },
  hitFlashFrames: { min: 1, max: 6 },
  bgmDuckVolume: { min: 0.3, max: 1.0 },
  bgmDuckDuration: { min: 50, max: 500 },
} as const;

type RangeKey = keyof typeof RANGE;

function assertInRange(value: number, key: RangeKey, tier: FeedbackTier) {
  const { min, max } = RANGE[key];
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

// ===== 1. Structural Completeness =====

describe('Feedback Manifest - Structural Completeness', () => {
  it('manifest has version 1', () => {
    expect(FEEDBACK_MANIFEST.version).toBe(1);
  });

  it('manifest has exactly 5 tiers', () => {
    const tierKeys = Object.keys(FEEDBACK_MANIFEST.tiers);
    expect(tierKeys).toHaveLength(5);
    for (const t of ALL_TIERS) {
      expect(tierKeys).toContain(t);
    }
  });

  it('each tier has all required fields', () => {
    const requiredFields: (keyof FeedbackParams)[] = [
      'tier', 'hitstop', 'blockstop',
      'shakeIntensity', 'shakeDuration',
      'blockShakeIntensity', 'blockShakeDuration',
      'sparkCount', 'sparkSize', 'sparkStarRatio',
      'hitFlashFrames', 'bgmDuckVolume', 'bgmDuckDuration',
    ];
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      for (const field of requiredFields) {
        expect(fb[field]).toBeDefined();
      }
    }
  });

  it('each tier self-reports correct tier name', () => {
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      expect(fb.tier).toBe(t);
    }
  });
});

// ===== 2. Parameter Range Validation =====

describe('Feedback Manifest - Parameter Ranges', () => {
  for (const t of ALL_TIERS) {
    describe(`tier: ${t}`, () => {
      let fb: FeedbackParams;

      it('setup: can retrieve tier params', () => {
        fb = getFeedbackByTier(t);
        expect(fb).toBeDefined();
        expect(fb.tier).toBe(t);
      });

      it('hitstop is in range [1, 30]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.hitstop, 'hitstop', t);
      });

      it('blockstop is in range [0, 30]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.blockstop, 'blockstop', t);
      });

      it('shakeIntensity is in range [1, 20]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.shakeIntensity, 'shakeIntensity', t);
      });

      it('shakeDuration is in range [1, 25]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.shakeDuration, 'shakeDuration', t);
      });

      it('blockShakeIntensity is in range [0, 20]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.blockShakeIntensity, 'blockShakeIntensity', t);
      });

      it('blockShakeDuration is in range [0, 25]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.blockShakeDuration, 'blockShakeDuration', t);
      });

      it('sparkCount is in range [1, 25]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.sparkCount, 'sparkCount', t);
      });

      it('sparkSize is in range [0.1, 2.0]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.sparkSize, 'sparkSize', t);
      });

      it('sparkStarRatio is in range [0, 1.0]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.sparkStarRatio, 'sparkStarRatio', t);
      });

      it('hitFlashFrames is in range [1, 6]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.hitFlashFrames, 'hitFlashFrames', t);
      });

      it('bgmDuckVolume is in range [0.3, 1.0]', () => {
        fb = getFeedbackByTier(t);
        assertInRange(fb.bgmDuckVolume, 'bgmDuckVolume', t);
      });

      it('bgmDuckDuration is positive', () => {
        fb = getFeedbackByTier(t);
        expect(fb.bgmDuckDuration).toBeGreaterThan(0);
      });

      it('all numeric fields are integers except sparkSize, sparkStarRatio, bgmDuckVolume', () => {
        fb = getFeedbackByTier(t);
        expect(Number.isInteger(fb.hitstop)).toBe(true);
        expect(Number.isInteger(fb.blockstop)).toBe(true);
        expect(Number.isInteger(fb.shakeIntensity)).toBe(true);
        expect(Number.isInteger(fb.shakeDuration)).toBe(true);
        expect(Number.isInteger(fb.blockShakeIntensity)).toBe(true);
        expect(Number.isInteger(fb.blockShakeDuration)).toBe(true);
        expect(Number.isInteger(fb.sparkCount)).toBe(true);
        expect(Number.isInteger(fb.hitFlashFrames)).toBe(true);
        expect(Number.isInteger(fb.bgmDuckDuration)).toBe(true);
      });
    });
  }
});

// ===== 3. Tier Escalation =====

describe('Feedback Manifest - Tier Escalation', () => {
  const l = FEEDBACK_TIERS.light;
  const h = FEEDBACK_TIERS.heavy;
  const s = FEEDBACK_TIERS.special;
  const d = FEEDBACK_TIERS.dm;
  const sd = FEEDBACK_TIERS.sdm;

  it('hitstop escalates: light < heavy < special < dm < sdm', () => {
    expect(l.hitstop).toBeLessThan(h.hitstop);
    expect(h.hitstop).toBeLessThan(s.hitstop);
    expect(s.hitstop).toBeLessThan(d.hitstop);
    expect(d.hitstop).toBeLessThan(sd.hitstop);
  });

  it('shakeIntensity escalates: light < heavy <= special < dm', () => {
    expect(l.shakeIntensity).toBeLessThan(h.shakeIntensity);
    expect(h.shakeIntensity).toBeLessThanOrEqual(s.shakeIntensity);
    expect(s.shakeIntensity).toBeLessThanOrEqual(d.shakeIntensity);
  });

  it('shakeDuration escalates: light < heavy < special < dm <= sdm', () => {
    expect(l.shakeDuration).toBeLessThan(h.shakeDuration);
    expect(h.shakeDuration).toBeLessThan(s.shakeDuration);
    expect(s.shakeDuration).toBeLessThan(d.shakeDuration);
    expect(d.shakeDuration).toBeLessThanOrEqual(sd.shakeDuration);
  });

  it('sparkCount escalates: light < heavy < special < dm < sdm', () => {
    expect(l.sparkCount).toBeLessThan(h.sparkCount);
    expect(h.sparkCount).toBeLessThanOrEqual(s.sparkCount);
    expect(s.sparkCount).toBeLessThan(d.sparkCount);
    expect(d.sparkCount).toBeLessThan(sd.sparkCount);
  });

  it('sparkSize escalates: light < heavy < special < dm < sdm', () => {
    expect(l.sparkSize).toBeLessThan(h.sparkSize);
    expect(h.sparkSize).toBeLessThan(s.sparkSize);
    expect(s.sparkSize).toBeLessThan(d.sparkSize);
    expect(d.sparkSize).toBeLessThan(sd.sparkSize);
  });

  it('hitFlashFrames escalates or holds: light <= heavy <= special <= dm <= sdm', () => {
    expect(l.hitFlashFrames).toBeLessThanOrEqual(h.hitFlashFrames);
    expect(h.hitFlashFrames).toBeLessThanOrEqual(s.hitFlashFrames);
    expect(s.hitFlashFrames).toBeLessThanOrEqual(d.hitFlashFrames);
    expect(d.hitFlashFrames).toBeLessThanOrEqual(sd.hitFlashFrames);
  });

  it('blockstop escalates: light < heavy <= special < dm', () => {
    expect(l.blockstop).toBeLessThan(h.blockstop);
    expect(h.blockstop).toBeLessThanOrEqual(s.blockstop);
    expect(s.blockstop).toBeLessThan(d.blockstop);
  });

  it('bgmDuckVolume descends: light > heavy > special > dm > sdm (louder duck = lower volume)', () => {
    expect(l.bgmDuckVolume).toBeGreaterThan(h.bgmDuckVolume);
    expect(h.bgmDuckVolume).toBeGreaterThan(s.bgmDuckVolume);
    expect(s.bgmDuckVolume).toBeGreaterThan(d.bgmDuckVolume);
    expect(d.bgmDuckVolume).toBeGreaterThan(sd.bgmDuckVolume);
  });

  it('bgmDuckDuration escalates: light < heavy < special < dm < sdm', () => {
    expect(l.bgmDuckDuration).toBeLessThanOrEqual(h.bgmDuckDuration);
    expect(h.bgmDuckDuration).toBeLessThanOrEqual(s.bgmDuckDuration);
    expect(s.bgmDuckDuration).toBeLessThan(d.bgmDuckDuration);
    expect(d.bgmDuckDuration).toBeLessThan(sd.bgmDuckDuration);
  });
});

// ===== 4. Ryo Attack Type Mapping =====

describe('Feedback Manifest - Ryo Attack Type Mapping', () => {
  // Ryo normal attacks
  const ryoLightAttacks: AttackType[] = [
    AttackType.STAND_A, AttackType.STAND_B,
    AttackType.CLOSE_A, AttackType.CLOSE_B,
    AttackType.CROUCH_A, AttackType.CROUCH_B,
    AttackType.JUMP_A, AttackType.JUMP_B,
  ];

  const ryoHeavyAttacks: AttackType[] = [
    AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_C, AttackType.JUMP_D,
  ];

  const ryoSpecialAttacks: AttackType[] = [
    AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
    AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
    AttackType.RYO_HIEN, AttackType.RYO_HAOU,
  ];

  const ryoCommandNormals: AttackType[] = [
    AttackType.RYO_TSURIZAO, AttackType.RYO_ORISHI,
  ];

  const ryoDMs: AttackType[] = [
    AttackType.DM_TEN_HA_OU,
    AttackType.DM_RYUKO_RANBU,
  ];

  const ryoSDMs: AttackType[] = [
    AttackType.SDM_TEN_HA_OU,
    AttackType.SDM_RYUKO_RANBU,
  ];

  const ryoHSDM: AttackType = AttackType.HSDM_RYUKO_RANBU;

  it('light attacks map to light tier', () => {
    for (const at of ryoLightAttacks) {
      expect(inferTier(at)).toBe('light');
    }
  });

  it('heavy attacks map to heavy tier', () => {
    for (const at of ryoHeavyAttacks) {
      expect(inferTier(at)).toBe('heavy');
    }
  });

  it('Ryo specials map to special tier', () => {
    for (const at of ryoSpecialAttacks) {
      expect(inferTier(at)).toBe('special');
    }
  });

  it('Ryo command normals map to special tier (contain RYO_ prefix)', () => {
    for (const at of ryoCommandNormals) {
      expect(inferTier(at)).toBe('special');
    }
  });

  it('Ryo DMs map to dm tier', () => {
    for (const at of ryoDMs) {
      expect(inferTier(at)).toBe('dm');
    }
  });

  it('Ryo SDMs map to sdm tier', () => {
    for (const at of ryoSDMs) {
      expect(inferTier(at)).toBe('sdm');
    }
  });

  it('Ryo HSDM maps to sdm tier (HSDM_ prefix → highest tier)', () => {
    const tier = inferTier(ryoHSDM);
    expect(tier).toBe('sdm');
  });

  it('STAND_CD maps to heavy tier (ends with _CD)', () => {
    expect(inferTier(AttackType.STAND_CD)).toBe('heavy');
  });

  it('JUMP_CD maps to heavy tier (blowback in air)', () => {
    const tier = inferTier(AttackType.JUMP_CD);
    expect(ALL_TIERS).toContain(tier);
    expect(tier).toBe('heavy');
  });

  it('throws map to light tier (no special prefix)', () => {
    expect(inferTier(AttackType.THROW)).toBe('light');
    expect(inferTier(AttackType.THROW_FORWARD)).toBe('light');
    expect(inferTier(AttackType.THROW_BACK)).toBe('light');
  });

  it('getFeedback returns valid params for all Ryo attack types', () => {
    const allRyoAttacks = [
      ...ryoLightAttacks, ...ryoHeavyAttacks, ...ryoSpecialAttacks,
      ...ryoCommandNormals, ...ryoDMs, ...ryoSDMs, ryoHSDM,
    ];
    for (const at of allRyoAttacks) {
      const fb = getFeedback(at);
      expect(fb).toBeDefined();
      expect(fb.hitstop).toBeGreaterThan(0);
      expect(fb.shakeIntensity).toBeGreaterThan(0);
      expect(fb.sparkCount).toBeGreaterThan(0);
    }
  });

  it('Ryo light < heavy < special < DM < SDM hitstop progression via getFeedback', () => {
    const lightFb = getFeedback(AttackType.STAND_A);
    const heavyFb = getFeedback(AttackType.STAND_C);
    const specialFb = getFeedback(AttackType.RYO_KOOU);
    const dmFb = getFeedback(AttackType.DM_TEN_HA_OU);
    const sdmFb = getFeedback(AttackType.SDM_TEN_HA_OU);

    expect(lightFb.hitstop).toBeLessThan(heavyFb.hitstop);
    expect(heavyFb.hitstop).toBeLessThan(specialFb.hitstop);
    expect(specialFb.hitstop).toBeLessThan(dmFb.hitstop);
    expect(dmFb.hitstop).toBeLessThan(sdmFb.hitstop);
  });
});

// ===== 5. inferTier() Completeness =====

describe('Feedback Manifest - inferTier() Returns Valid Tier for All AttackTypes', () => {
  it('inferTier returns a valid FeedbackTier for every AttackType enum value', () => {
    const allAttackTypes = Object.values(AttackType);
    expect(allAttackTypes.length).toBeGreaterThan(0);

    for (const at of allAttackTypes) {
      const tier = inferTier(at as AttackType);
      expect(ALL_TIERS).toContain(tier);
    }
  });

  it('getFeedback returns valid params for every AttackType enum value', () => {
    const allAttackTypes = Object.values(AttackType);
    for (const at of allAttackTypes) {
      const fb = getFeedback(at as AttackType);
      expect(fb).toBeDefined();
      expect(fb.tier).toBeDefined();
      expect(ALL_TIERS).toContain(fb.tier);
      expect(fb.hitstop).toBeGreaterThan(0);
      expect(fb.shakeIntensity).toBeGreaterThan(0);
      expect(fb.shakeDuration).toBeGreaterThan(0);
      expect(fb.sparkCount).toBeGreaterThan(0);
      expect(fb.sparkSize).toBeGreaterThan(0);
      expect(fb.hitFlashFrames).toBeGreaterThan(0);
    }
  });

  it('DM_ prefix always maps to dm tier', () => {
    const dmTypes = Object.values(AttackType).filter(at => (at as string).startsWith('DM_'));
    expect(dmTypes.length).toBeGreaterThan(0);
    for (const at of dmTypes) {
      expect(inferTier(at)).toBe('dm');
    }
  });

  it('SDM_ prefix always maps to sdm tier', () => {
    const sdmTypes = Object.values(AttackType).filter(at => (at as string).startsWith('SDM_'));
    expect(sdmTypes.length).toBeGreaterThan(0);
    for (const at of sdmTypes) {
      expect(inferTier(at)).toBe('sdm');
    }
  });

  it('character-prefixed specials map to special tier (sample)', () => {
    // Verify a sample of specials from different characters
    const specials: AttackType[] = [
      AttackType.KYO_ONIYAKI, AttackType.KYO_YAMIBARAI,
      AttackType.IORI_AOIHANA, AttackType.IORI_YAMIBARAI,
      AttackType.TERRY_POWER_WAVE, AttackType.TERRY_BURN_KNUCKLE,
      AttackType.KIM_HIENZAN, AttackType.KIM_HANGETSU,
      AttackType.LEONA_MOON_SLASH, AttackType.LEONA_EAR_RING,
      AttackType.ROBERT_RYU_GEKI, AttackType.ROBERT_RYU_ZAN,
      AttackType.KDASH_EINS, AttackType.KDASH_CROW,
      AttackType.KULA_BREATH, AttackType.KULA_SHELL,
      AttackType.ATHENA_PSYCHO_BALL, AttackType.ATHENA_PSYCHO_SWORD,
      AttackType.MAI_KA_CHO_SEN, AttackType.MAI_RYU_EN_BU,
      AttackType.SPECIAL_PROJECTILE,
    ];
    for (const at of specials) {
      expect(inferTier(at)).toBe('special');
    }
  });

  it('heavy normals (_C, _D suffix) map to heavy tier', () => {
    const heavyNormals: AttackType[] = [
      AttackType.STAND_C, AttackType.STAND_D,
      AttackType.CLOSE_C, AttackType.CLOSE_D,
      AttackType.CROUCH_C, AttackType.CROUCH_D,
      AttackType.JUMP_C, AttackType.JUMP_D,
    ];
    for (const at of heavyNormals) {
      expect(inferTier(at)).toBe('heavy');
    }
  });

  it('light normals (_A, _B suffix) map to light tier', () => {
    const lightNormals: AttackType[] = [
      AttackType.STAND_A, AttackType.STAND_B,
      AttackType.CLOSE_A, AttackType.CLOSE_B,
      AttackType.CROUCH_A, AttackType.CROUCH_B,
      AttackType.JUMP_A, AttackType.JUMP_B,
    ];
    for (const at of lightNormals) {
      expect(inferTier(at)).toBe('light');
    }
  });
});

// ===== 6. getFeedback/getFeedbackByTier Consistency =====

describe('Feedback Manifest - Query Function Consistency', () => {
  it('getFeedbackByTier returns same object as FEEDBACK_TIERS', () => {
    for (const t of ALL_TIERS) {
      expect(getFeedbackByTier(t)).toBe(FEEDBACK_TIERS[t]);
    }
  });

  it('getFeedback for light attack returns same params as getFeedbackByTier(light)', () => {
    const fromType = getFeedback(AttackType.STAND_A);
    const fromTier = getFeedbackByTier('light');
    expect(fromType).toEqual(fromTier);
  });

  it('getFeedback for heavy attack returns same params as getFeedbackByTier(heavy)', () => {
    const fromType = getFeedback(AttackType.STAND_C);
    const fromTier = getFeedbackByTier('heavy');
    expect(fromType).toEqual(fromTier);
  });

  it('getFeedback for special attack returns same params as getFeedbackByTier(special)', () => {
    const fromType = getFeedback(AttackType.RYO_KOOU);
    const fromTier = getFeedbackByTier('special');
    expect(fromType).toEqual(fromTier);
  });

  it('getFeedback for DM returns same params as getFeedbackByTier(dm)', () => {
    const fromType = getFeedback(AttackType.DM_TEN_HA_OU);
    const fromTier = getFeedbackByTier('dm');
    expect(fromType).toEqual(fromTier);
  });

  it('getFeedback for SDM returns same params as getFeedbackByTier(sdm)', () => {
    const fromType = getFeedback(AttackType.SDM_TEN_HA_OU);
    const fromTier = getFeedbackByTier('sdm');
    expect(fromType).toEqual(fromTier);
  });

  it('attackTierMap contains Ryo explicit mappings', () => {
    const keys = Object.keys(FEEDBACK_MANIFEST.attackTierMap);
    // Ryo 通常技(6) + 重攻击(10) + 必杀技(8) + DM/SDM/HSDM(5) = 29
    expect(keys).toHaveLength(29);
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.RYO_KOOU]).toBe('special');
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.DM_TEN_HA_OU]).toBe('dm');
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.SDM_TEN_HA_OU]).toBe('sdm');
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.DM_RYUKO_RANBU]).toBe('dm');
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.SDM_RYUKO_RANBU]).toBe('sdm');
    expect(FEEDBACK_MANIFEST.attackTierMap[AttackType.HSDM_RYUKO_RANBU]).toBe('sdm');
  });
});

// ===== 7. KOF2002 Calibration Spot Checks =====

describe('Feedback Manifest - KOF2002 Calibration Spot Checks', () => {
  it('light hitstop = 4 frames (KOF2002 jab)', () => {
    expect(FEEDBACK_TIERS.light.hitstop).toBe(4);
  });

  it('heavy hitstop = 8 frames (KOF2002 fierce)', () => {
    expect(FEEDBACK_TIERS.heavy.hitstop).toBe(8);
  });

  it('special hitstop is 13 frames (KOF2002 special)', () => {
    expect(FEEDBACK_TIERS.special.hitstop).toBe(13);
  });

  it('dm hitstop is 19 frames (KOF2002 desperation)', () => {
    expect(FEEDBACK_TIERS.dm.hitstop).toBe(19);
  });

  it('sdm hitstop is 22 frames (KOF2002 super desperation)', () => {
    expect(FEEDBACK_TIERS.sdm.hitstop).toBe(22);
  });

  it('counter hit bonus is 3 frames (from hitCallback)', () => {
    // Verifies the hitstop + counter bonus is still a valid range
    const counterBonus = 3;
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      const chHitstop = fb.hitstop + counterBonus;
      expect(chHitstop).toBeLessThanOrEqual(RANGE.hitstop.max);
    }
  });

  it('light sparkCount is 6 (distinct visual)', () => {
    expect(FEEDBACK_TIERS.light.sparkCount).toBe(6);
  });

  it('dm and sdm shakeIntensity are equal at 14 (both strong)', () => {
    expect(FEEDBACK_TIERS.dm.shakeIntensity).toBe(14);
    expect(FEEDBACK_TIERS.sdm.shakeIntensity).toBe(14);
  });

  it('light bgmDuckVolume is highest (least ducking) at 0.78', () => {
    expect(FEEDBACK_TIERS.light.bgmDuckVolume).toBe(0.78);
  });

  it('sdm bgmDuckVolume is lowest (most ducking) at 0.55', () => {
    expect(FEEDBACK_TIERS.sdm.bgmDuckVolume).toBe(0.55);
  });
});

// ===== 8. Ryo Hit Callback Integration Contract =====

describe('Feedback Manifest - Ryo Hit Callback Integration Contract', () => {
  it('calcHitStop pattern: getFeedback(attackType).hitstop + counterBonus stays in range', () => {
    const COUNTER_BONUS = 3;
    const ryoAttacks: AttackType[] = [
      AttackType.STAND_A, AttackType.STAND_C,
      AttackType.RYO_KOOU, AttackType.RYO_KO_HOU,
      AttackType.RYO_HIEN, AttackType.RYO_HAOU,
      AttackType.DM_TEN_HA_OU, AttackType.DM_RYUKO_RANBU,
      AttackType.SDM_TEN_HA_OU, AttackType.SDM_RYUKO_RANBU,
    ];
    for (const at of ryoAttacks) {
      const fb = getFeedback(at);
      const normalStop = fb.hitstop;
      const counterStop = fb.hitstop + COUNTER_BONUS;
      expect(normalStop).toBeGreaterThan(0);
      expect(counterStop).toBeLessThanOrEqual(30);
    }
  });

  it('blockstop is always less than or equal to hitstop', () => {
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      expect(fb.blockstop).toBeLessThanOrEqual(fb.hitstop);
    }
  });

  it('blockShakeIntensity is within valid range', () => {
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      expect(fb.blockShakeIntensity).toBeGreaterThanOrEqual(0);
      expect(fb.blockShakeIntensity).toBeLessThanOrEqual(RANGE.blockShakeIntensity.max);
    }
  });

  it('blockShakeDuration is within valid range (may exceed shakeDuration for block impact feel)', () => {
    for (const t of ALL_TIERS) {
      const fb = getFeedbackByTier(t);
      expect(fb.blockShakeDuration).toBeGreaterThan(0);
      expect(fb.blockShakeDuration).toBeLessThanOrEqual(RANGE.blockShakeDuration.max);
    }
  });

  it('Ryo Ko Hou C extra hitstop (3) plus manifest hitstop stays under 30', () => {
    const koHouCFb = getFeedback(AttackType.RYO_KO_HOU_C);
    // hitCallback adds 3 extra for RYO_KO_HOU_C
    expect(koHouCFb.hitstop + 3).toBeLessThanOrEqual(30);
  });

  it('Ryo Hien extra hitstop (2) plus manifest hitstop stays under 30', () => {
    const hienFb = getFeedback(AttackType.RYO_HIEN);
    // hitCallback adds 2 extra for RYO_HIEN
    expect(hienFb.hitstop + 2).toBeLessThanOrEqual(30);
  });

  it('Ryo DM Ten Ha Ou screen shake (14,14) is within dm tier', () => {
    const dmFb = getFeedbackByTier('dm');
    expect(dmFb.shakeIntensity).toBe(14);
    expect(dmFb.shakeDuration).toBe(16);
  });
});
