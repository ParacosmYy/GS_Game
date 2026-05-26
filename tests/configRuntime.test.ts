import { describe, it, expect, beforeEach } from 'vitest';
import {
  KOF2002_CONFIG,
  getActiveConfig,
  getGameConfig,
  updateGameConfig,
  resetGameConfig,
  validateGameConfig,
  safeUpdateGameConfig,
  type GameConfig,
  type ConfigValidationError,
} from '../src/core/gameConfig.js';

describe('Config Runtime', () => {
  beforeEach(() => {
    resetGameConfig();
  });

  describe('getActiveConfig', () => {
    it('returns the active config with correct values', () => {
      const c1 = getActiveConfig();
      const c2 = getActiveConfig();
      expect(c1).toEqual(c2);
      expect(c1.round.roundTime).toBe(99);
    });

    it('returns KOF2002 defaults after reset', () => {
      const config = getActiveConfig();
      expect(config.round.roundTime).toBe(99);
      expect(config.damage.comboScaleStep).toBe(0.05);
      expect(config.meter.maxStocks).toBe(3);
    });
  });

  describe('updateGameConfig', () => {
    it('applies a partial override to the active config', () => {
      updateGameConfig({ round: { roundTime: 60 } });
      const config = getActiveConfig();
      expect(config.round.roundTime).toBe(60);
      // Non-overridden fields preserved
      expect(config.round.maxRounds).toBe(3);
      expect(config.damage.comboScaleStep).toBe(0.05);
    });

    it('applies damage config overrides', () => {
      updateGameConfig({ damage: { comboScaleMinDM: 0.50 } });
      const config = getActiveConfig();
      expect(config.damage.comboScaleMinDM).toBe(0.50);
      expect(config.damage.comboScaleStep).toBe(0.05);
    });

    it('applies meter config overrides', () => {
      updateGameConfig({ meter: { maxStocks: 5 } });
      const config = getActiveConfig();
      expect(config.meter.maxStocks).toBe(5);
    });

    it('can be called multiple times (stacking overrides)', () => {
      updateGameConfig({ round: { roundTime: 60 } });
      updateGameConfig({ damage: { chipDamageRatio: 0.15 } });
      const config = getActiveConfig();
      expect(config.round.roundTime).toBe(60);
      expect(config.damage.chipDamageRatio).toBe(0.15);
    });
  });

  describe('resetGameConfig', () => {
    it('resets all values back to KOF2002 defaults', () => {
      updateGameConfig({ round: { roundTime: 60 }, damage: { chipDamageRatio: 0.5 } });
      resetGameConfig();
      const config = getActiveConfig();
      expect(config).toEqual(KOF2002_CONFIG);
    });
  });

  describe('validateGameConfig', () => {
    it('returns empty errors for valid partial config', () => {
      const errors = validateGameConfig({ round: { roundTime: 60 } });
      expect(errors).toEqual([]);
    });

    it('returns errors for negative round time', () => {
      const errors = validateGameConfig({ round: { roundTime: -1 } });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].path).toBe('round.roundTime');
    });

    it('returns errors for invalid maxStocks', () => {
      const errors = validateGameConfig({ meter: { maxStocks: 0 } });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].path).toBe('meter.maxStocks');
    });

    it('returns errors for out-of-range chipDamageRatio', () => {
      const errors1 = validateGameConfig({ damage: { chipDamageRatio: -0.1 } });
      expect(errors1.length).toBeGreaterThan(0);
      const errors2 = validateGameConfig({ damage: { chipDamageRatio: 1.5 } });
      expect(errors2.length).toBeGreaterThan(0);
    });

    it('returns errors when dizzyDurationMin > dizzyDurationMax', () => {
      const errors = validateGameConfig({ stun: { dizzyDurationMin: 200, dizzyDurationMax: 100 } });
      const match = errors.find(e => e.path === 'stun.dizzyDurationMin');
      expect(match).toBeDefined();
    });

    it('accepts Infinity for round time', () => {
      const errors = validateGameConfig({ round: { roundTime: Infinity } });
      const match = errors.find(e => e.path === 'round.roundTime');
      expect(match).toBeUndefined();
    });

    it('returns empty errors for empty partial config', () => {
      const errors = validateGameConfig({});
      expect(errors).toEqual([]);
    });
  });

  describe('safeUpdateGameConfig', () => {
    it('applies valid config and returns empty errors', () => {
      const errors = safeUpdateGameConfig({ round: { roundTime: 60 } });
      expect(errors).toEqual([]);
      expect(getActiveConfig().round.roundTime).toBe(60);
    });

    it('rejects invalid config and does not apply changes', () => {
      const errors = safeUpdateGameConfig({ round: { roundTime: -10 } });
      expect(errors.length).toBeGreaterThan(0);
      // Should still have default value
      expect(getActiveConfig().round.roundTime).toBe(99);
    });
  });

  describe('getGameConfig', () => {
    it('returns active config when training=false', () => {
      updateGameConfig({ round: { roundTime: 75 } });
      const config = getGameConfig(false);
      expect(config.round.roundTime).toBe(75);
    });

    it('returns training overrides when training=true', () => {
      const config = getGameConfig(true);
      expect(config.round.roundTime).toBe(Infinity);
    });

    it('preserves non-overridden fields in training mode', () => {
      const config = getGameConfig(true);
      expect(config.damage.comboScaleStep).toBe(KOF2002_CONFIG.damage.comboScaleStep);
    });
  });
});
