import { describe, it, expect } from 'vitest';
import {
  KOF2002_CONFIG,
  TRAINING_CONFIG_OVERRIDES,
  getGameConfig,
  type GameConfig,
} from '../src/core/gameConfig.js';

describe('GameConfig', () => {
  describe('KOF2002_CONFIG structure', () => {
    it('has round config', () => {
      expect(KOF2002_CONFIG.round.roundTime).toBe(99);
      expect(KOF2002_CONFIG.round.maxRounds).toBe(3);
      expect(KOF2002_CONFIG.round.winsNeeded).toBe(2);
    });

    it('has damage config', () => {
      expect(KOF2002_CONFIG.damage.comboScaleStep).toBe(0.05);
      expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeGreaterThan(0);
      expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeLessThan(1);
    });

    it('has meter config', () => {
      expect(KOF2002_CONFIG.meter.maxStocks).toBe(3);
      expect(KOF2002_CONFIG.meter.maxModeDuration).toBeGreaterThan(0);
    });

    it('has stun config', () => {
      expect(KOF2002_CONFIG.stun.stunGaugeMax).toBe(100);
      expect(KOF2002_CONFIG.stun.dizzyDurationMin).toBeLessThanOrEqual(KOF2002_CONFIG.stun.dizzyDurationMax);
    });

    it('has guard config', () => {
      expect(KOF2002_CONFIG.guard.guardGaugeMax).toBe(100);
      expect(KOF2002_CONFIG.guard.guardCrushDuration).toBeGreaterThan(0);
    });
  });

  describe('TRAINING_CONFIG_OVERRIDES', () => {
    it('sets round time to Infinity', () => {
      expect(TRAINING_CONFIG_OVERRIDES.round?.roundTime).toBe(Infinity);
    });
  });

  describe('getGameConfig', () => {
    it('returns standard config by default', () => {
      const config = getGameConfig();
      expect(config.round.roundTime).toBe(99);
    });

    it('returns training config when training=true', () => {
      const config = getGameConfig(true);
      expect(config.round.roundTime).toBe(Infinity);
    });

    it('preserves non-overridden fields in training mode', () => {
      const config = getGameConfig(true);
      expect(config.damage.comboScaleStep).toBe(0.05);
      expect(config.meter.maxStocks).toBe(3);
    });
  });
});
