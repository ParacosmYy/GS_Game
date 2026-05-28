import { describe, it, expect } from 'vitest';
import { FEEDBACK_TIERS, inferTier, FEEDBACK_MANIFEST, getFeedback, getFeedbackByTier, getFeedbackTier, getCharacterDMPalette, type FeedbackTier, type FeedbackParams } from '../src/core/feedbackManifest.js';

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

  describe('getCharacterDMPalette', () => {
    it('returns null for non-DM tiers', () => {
      expect(getCharacterDMPalette('kyo', 'light')).toBeNull();
      expect(getCharacterDMPalette('kyo', 'heavy')).toBeNull();
      expect(getCharacterDMPalette('kyo', 'special')).toBeNull();
    });

    it('returns palette for kyo DM/SDM/HSDM', () => {
      const dm = getCharacterDMPalette('kyo', 'dm');
      const sdm = getCharacterDMPalette('kyo', 'sdm');
      const hsdm = getCharacterDMPalette('kyo', 'hsdm');
      expect(dm).not.toBeNull();
      expect(sdm).not.toBeNull();
      expect(hsdm).not.toBeNull();
      expect(dm!.length).toBeGreaterThanOrEqual(3);
      expect(sdm!.length).toBeGreaterThanOrEqual(dm!.length);
      expect(hsdm!.length).toBeGreaterThanOrEqual(dm!.length);
    });

    it('returns palette for iori DM/SDM/HSDM', () => {
      expect(getCharacterDMPalette('iori', 'dm')).not.toBeNull();
      expect(getCharacterDMPalette('iori', 'sdm')).not.toBeNull();
      expect(getCharacterDMPalette('iori', 'hsdm')).not.toBeNull();
    });

    it('returns palette for ryo DM/SDM/HSDM', () => {
      expect(getCharacterDMPalette('ryo', 'dm')).not.toBeNull();
      expect(getCharacterDMPalette('ryo', 'sdm')).not.toBeNull();
      expect(getCharacterDMPalette('ryo', 'hsdm')).not.toBeNull();
    });

    it('returns null for unknown character', () => {
      expect(getCharacterDMPalette('unknown', 'dm')).toBeNull();
    });

    it('kyo palette has fire colors', () => {
      const dm = getCharacterDMPalette('kyo', 'dm')!;
      const hasRedOrOrange = dm.some(c => c.includes('ff4') || c.includes('ff8'));
      expect(hasRedOrOrange).toBe(true);
    });

    it('iori palette has purple colors', () => {
      const dm = getCharacterDMPalette('iori', 'dm')!;
      const hasPurple = dm.some(c => c.includes('ff') && c.includes('88') || c.includes('cc44'));
      expect(hasPurple).toBe(true);
    });
  });

  describe('spark palette consistency', () => {
    it('all tier palettes have at least 2 colors', () => {
      for (const t of ALL_TIERS) {
        expect(FEEDBACK_TIERS[t].sparkPalette.length, `${t} palette`).toBeGreaterThanOrEqual(2);
      }
    });

    it('spark palettes are valid hex colors', () => {
      for (const t of ALL_TIERS) {
        for (const color of FEEDBACK_TIERS[t].sparkPalette) {
          expect(color, `${t} color`).toMatch(/^#[0-9a-f]{3,6}$/);
        }
      }
    });

    it('spark size escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].sparkSize).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].sparkSize,
        );
      }
    });

    it('bgmDuckVolume decreases (more ducking) across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].bgmDuckVolume).toBeLessThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].bgmDuckVolume,
        );
      }
    });

    it('body shake escalates across tiers', () => {
      for (let i = 1; i < ALL_TIERS.length; i++) {
        expect(FEEDBACK_TIERS[ALL_TIERS[i]].hitstunBodyShake).toBeGreaterThan(
          FEEDBACK_TIERS[ALL_TIERS[i - 1]].hitstunBodyShake,
        );
      }
    });
  });
});
