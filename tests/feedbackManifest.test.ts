import { describe, it, expect } from 'vitest';
import { FEEDBACK_TIERS, inferTier, FEEDBACK_MANIFEST, getFeedback, getFeedbackByTier, getFeedbackTier, type FeedbackTier, type FeedbackParams } from '../src/core/feedbackManifest.js';

const ALL_TIERS: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];

describe('feedbackManifest', () => {
  describe('FEEDBACK_TIERS completeness', () => {
    it('has all 6 tiers', () => {
      for (const t of ALL_TIERS) {
        expect(FEEDBACK_TIERS[t]).toBeDefined();
      }
      expect(Object.keys(FEEDBACK_TIERS).length).toBe(6);
    });

    it('each tier has all required params', () => {
      const requiredKeys: (keyof FeedbackParams)[] = [
        'tier', 'hitstop', 'blockstop', 'shakeIntensity', 'shakeDuration',
        'blockShakeIntensity', 'blockShakeDuration', 'sparkCount', 'sparkSize',
        'sparkStarRatio', 'hitFlashFrames', 'bgmDuckVolume', 'bgmDuckDuration',
        'sparkPalette', 'sparkType', 'sparkSpeed', 'hitPushbackScale',
        'blockPushbackScale', 'impactRingCount', 'impactRingScale',
        'hitstunBodyShake', 'hitstunBodyShakeDecay',
      ];
      for (const t of ALL_TIERS) {
        const tier = FEEDBACK_TIERS[t];
        for (const key of requiredKeys) {
          expect(tier[key], `tier ${t} missing ${key}`).toBeDefined();
        }
      }
    });

    it('hitstop escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].hitstop).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].hitstop,
        );
      }
    });

    it('shake intensity escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].shakeIntensity).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].shakeIntensity,
        );
      }
    });

    it('spark count escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].sparkCount).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].sparkCount,
        );
      }
    });

    it('pushback scale escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].hitPushbackScale).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].hitPushbackScale,
        );
      }
    });

    it('impact ring count escalates from special to hsdm', () => {
      expect(FEEDBACK_TIERS.light.impactRingCount).toBe(1);
      expect(FEEDBACK_TIERS.heavy.impactRingCount).toBe(1);
      expect(FEEDBACK_TIERS.special.impactRingCount).toBe(2);
      expect(FEEDBACK_TIERS.dm.impactRingCount).toBe(3);
      expect(FEEDBACK_TIERS.sdm.impactRingCount).toBe(4);
      expect(FEEDBACK_TIERS.hsdm.impactRingCount).toBe(5);
    });

    it('spark types are valid', () => {
      const validTypes = ['small', 'medium', 'large', 'burst', 'mega', 'hyper'];
      for (const t of ALL_TIERS) {
        expect(validTypes).toContain(FEEDBACK_TIERS[t].sparkType);
      }
    });

    it('all params are positive numbers where expected', () => {
      for (const t of ALL_TIERS) {
        const tier = FEEDBACK_TIERS[t];
        expect(tier.hitstop).toBeGreaterThan(0);
        expect(tier.blockstop).toBeGreaterThan(0);
        expect(tier.shakeIntensity).toBeGreaterThan(0);
        expect(tier.shakeDuration).toBeGreaterThan(0);
        expect(tier.sparkCount).toBeGreaterThan(0);
        expect(tier.sparkSize).toBeGreaterThan(0);
        expect(tier.hitFlashFrames).toBeGreaterThan(0);
        expect(tier.hitPushbackScale).toBeGreaterThan(0);
      }
    });
  });

  describe('inferTier', () => {
    it('light attacks return light', () => {
      expect(inferTier('STAND_A')).toBe('light');
      expect(inferTier('STAND_B')).toBe('light');
      expect(inferTier('CROUCH_A')).toBe('light');
      expect(inferTier('JUMP_A')).toBe('light');
      expect(inferTier('CLOSE_A')).toBe('light');
    });

    it('heavy attacks return heavy', () => {
      expect(inferTier('STAND_C')).toBe('heavy');
      expect(inferTier('STAND_D')).toBe('heavy');
      expect(inferTier('CROUCH_D')).toBe('heavy');
      expect(inferTier('JUMP_C')).toBe('heavy');
      expect(inferTier('JUMP_D')).toBe('heavy');
      expect(inferTier('STAND_CD')).toBe('heavy');
    });

    it('DM/SDM/HSDM prefixes return correct tiers', () => {
      expect(inferTier('DM_SOME_MOVE')).toBe('dm');
      expect(inferTier('SDM_SOME_MOVE')).toBe('sdm');
      expect(inferTier('HSDM_SOME_MOVE')).toBe('hsdm');
    });

    it('special character prefixes return special', () => {
      expect(inferTier('RYO_KOOU')).toBe('special');
      expect(inferTier('KYO_ONIYAKI')).toBe('special');
      expect(inferTier('IORI_YAMIBARAI')).toBe('special');
    });

    it('throw returns special', () => {
      expect(inferTier('THROW')).toBe('special');
      expect(inferTier('THROW_FORWARD')).toBe('special');
    });

    it('unknown attacks default to light', () => {
      expect(inferTier('UNKNOWN')).toBe('light');
    });
  });

  describe('FEEDBACK_MANIFEST attackTierMap', () => {
    it('maps Ryo attacks correctly', () => {
      expect(FEEDBACK_MANIFEST.attackTierMap.STAND_A).toBe('light');
      expect(FEEDBACK_MANIFEST.attackTierMap.STAND_C).toBe('heavy');
      expect(FEEDBACK_MANIFEST.attackTierMap.RYO_KOOU).toBe('special');
      expect(FEEDBACK_MANIFEST.attackTierMap.DM_TEN_HA_OU).toBe('dm');
      expect(FEEDBACK_MANIFEST.attackTierMap.SDM_TEN_HA_OU).toBe('sdm');
      expect(FEEDBACK_MANIFEST.attackTierMap.HSDM_RYUKO_RANBU).toBe('hsdm');
    });

    it('maps Kyo attacks correctly', () => {
      expect(FEEDBACK_MANIFEST.attackTierMap.KYO_YAMIBARAI).toBe('special');
      expect(FEEDBACK_MANIFEST.attackTierMap.KYO_ONIYAKI).toBe('special');
      expect(FEEDBACK_MANIFEST.attackTierMap.DM_OROCHINAGI).toBe('dm');
      expect(FEEDBACK_MANIFEST.attackTierMap.SDM_OROCHINAGI).toBe('sdm');
      expect(FEEDBACK_MANIFEST.attackTierMap.HSDM_OROCHINAGI).toBe('hsdm');
    });

    it('maps Iori attacks correctly', () => {
      expect(FEEDBACK_MANIFEST.attackTierMap.IORI_YAMIBARAI).toBe('special');
      expect(FEEDBACK_MANIFEST.attackTierMap.IORI_ONIYAKI).toBe('special');
      expect(FEEDBACK_MANIFEST.attackTierMap.DM_YATAGARASU).toBe('dm');
      expect(FEEDBACK_MANIFEST.attackTierMap.HSDM_YAOTOME).toBe('hsdm');
    });
  });

  describe('getFeedback / getFeedbackTier', () => {
    it('returns correct params for mapped attack', () => {
      const fb = getFeedback('STAND_A');
      expect(fb.tier).toBe('light');
      expect(fb.hitstop).toBe(4);
    });

    it('returns correct params for heavy', () => {
      const fb = getFeedback('STAND_C');
      expect(fb.tier).toBe('heavy');
      expect(fb.hitstop).toBe(8);
    });

    it('fallback for unknown attack returns light', () => {
      const fb = getFeedback('UNKNOWN_ATTACK');
      expect(fb.tier).toBe('light');
    });

    it('getFeedbackTier returns string tier', () => {
      expect(getFeedbackTier('STAND_C')).toBe('heavy');
      expect(getFeedbackTier('DM_TEN_HA_OU')).toBe('dm');
    });
  });

  describe('getFeedbackByTier', () => {
    it('returns correct tier for each level', () => {
      for (const t of ALL_TIERS) {
        expect(getFeedbackByTier(t).tier).toBe(t);
      }
    });
  });
});
