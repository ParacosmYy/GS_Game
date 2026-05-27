/**
 * Cancel Validator Tests — verifies cancel path validation across all 3 characters
 */
import { describe, it, expect } from 'vitest';
import { checkCancelValid, cancelPathExists } from '../src/combat/cancelValidator.js';
import { AttackType } from '../src/core/types.js';

describe('cancelValidator', () => {
  // ── Ryo cancel paths ──
  describe('Ryo cancel paths', () => {
    it('STAND_A → RYO_KOOU is valid', () => {
      const result = checkCancelValid('ryo', AttackType.STAND_A, AttackType.RYO_KOOU, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('STAND_A → RYO_KO_HOU is valid', () => {
      const result = checkCancelValid('ryo', AttackType.STAND_A, AttackType.RYO_KO_HOU, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('STAND_C → RYO_KOOU_C is valid', () => {
      const result = checkCancelValid('ryo', AttackType.STAND_C, AttackType.RYO_KOOU_C, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('RYO_KOOU → DM_TEN_HA_OU super cancel requires hit', () => {
      const noHit = checkCancelValid('ryo', AttackType.RYO_KOOU, AttackType.DM_TEN_HA_OU, {
        hitConfirmed: false, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(noHit.valid).toBe(false);

      const withHit = checkCancelValid('ryo', AttackType.RYO_KOOU, AttackType.DM_TEN_HA_OU, {
        hitConfirmed: true, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(withHit.valid).toBe(true);
    });

    it('RYO_KOOU → RYO_KO_HOU free cancel in MAX mode', () => {
      const result = checkCancelValid('ryo', AttackType.RYO_KOOU, AttackType.RYO_KO_HOU, {
        hitConfirmed: true, stocks: 0,
        maxModeActive: true, maxModeTimer: 300, maxModeDuration: 600, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── Kyo cancel paths ──
  describe('Kyo cancel paths', () => {
    it('STAND_A → KYO_ARAGAMI is valid', () => {
      const result = checkCancelValid('kyo', AttackType.STAND_A, AttackType.KYO_ARAGAMI, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('STAND_C → KYO_ONIYAKI is valid', () => {
      const result = checkCancelValid('kyo', AttackType.STAND_C, AttackType.KYO_ONIYAKI, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('KYO_ARAGAMI → KYO_ARAGAMI_KONOKIZU rekka chain exists', () => {
      expect(cancelPathExists('kyo', AttackType.KYO_ARAGAMI, AttackType.KYO_ARAGAMI_KONOKIZU)).toBe(true);
    });

    it('KYO_ONIYAKI → DM/SDM/HSDM super cancel requires hit', () => {
      // SDM_OROCHINAGI
      const noHit = checkCancelValid('kyo', AttackType.KYO_ONIYAKI, AttackType.SDM_OROCHINAGI, {
        hitConfirmed: false, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(noHit.valid).toBe(false);

      const withHit = checkCancelValid('kyo', AttackType.KYO_ONIYAKI, AttackType.SDM_OROCHINAGI, {
        hitConfirmed: true, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(withHit.valid).toBe(true);

      // HSDM_OROCHINAGI also valid
      const hsdm = checkCancelValid('kyo', AttackType.KYO_ONIYAKI, AttackType.HSDM_OROCHINAGI, {
        hitConfirmed: true, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(hsdm.valid).toBe(true);
    });
  });

  // ── Iori cancel paths ──
  describe('Iori cancel paths', () => {
    it('STAND_A → IORI_AOIHANA is valid', () => {
      const result = checkCancelValid('iori', AttackType.STAND_A, AttackType.IORI_AOIHANA, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });

    it('IORI_AOIHANA → IORI_AOIHANA_2 rekka chain exists', () => {
      expect(cancelPathExists('iori', AttackType.IORI_AOIHANA, AttackType.IORI_AOIHANA_2)).toBe(true);
    });

    it('IORI_ONIYAKI → DM_YATAGARASU super cancel requires hit', () => {
      const noHit = checkCancelValid('iori', AttackType.IORI_ONIYAKI, AttackType.DM_YATAGARASU, {
        hitConfirmed: false, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(noHit.valid).toBe(false);

      const withHit = checkCancelValid('iori', AttackType.IORI_ONIYAKI, AttackType.DM_YATAGARASU, {
        hitConfirmed: true, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(withHit.valid).toBe(true);
    });

    it('IORI_YAMIBARAI → IORI_ONIYAKI free cancel in MAX mode', () => {
      const result = checkCancelValid('iori', AttackType.IORI_YAMIBARAI, AttackType.IORI_ONIYAKI, {
        hitConfirmed: true, stocks: 0,
        maxModeActive: true, maxModeTimer: 300, maxModeDuration: 600, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── Cross-character isolation ──
  describe('Cross-character isolation', () => {
    it('Ryo path does not accept Kyo attacks', () => {
      const result = checkCancelValid('ryo', AttackType.STAND_A, AttackType.KYO_ONIYAKI, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(false);
    });

    it('Kyo path does not accept Iori attacks', () => {
      const result = checkCancelValid('kyo', AttackType.STAND_A, AttackType.IORI_AOIHANA, {
        hitConfirmed: false, stocks: 0,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(false);
    });

    it('Auto-detects character from attack prefix when characterId is omitted', () => {
      const result = checkCancelValid(undefined, 'RYO_KOOU', 'DM_TEN_HA_OU', {
        hitConfirmed: true, stocks: 3,
        maxModeActive: false, maxModeTimer: 0, maxModeDuration: 0, framesSinceHit: 0,
      });
      expect(result.valid).toBe(true);
    });
  });
});
