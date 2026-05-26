import { describe, it, expect } from 'vitest';
import { KOF2002_CONFIG, TRAINING_CONFIG_OVERRIDES, getActiveConfig, getGameConfig } from '../src/core/gameConfig.js';

describe('gameConfig', () => {
  describe('KOF2002_CONFIG', () => {
    it('is an object', () => {
      expect(typeof KOF2002_CONFIG).toBe('object');
    });
    it('has round config', () => {
      expect(KOF2002_CONFIG.round).toBeDefined();
      expect(KOF2002_CONFIG.round.roundTime).toBeGreaterThan(0);
    });
    it('has damage config', () => {
      expect(KOF2002_CONFIG.damage).toBeDefined();
    });
    it('has meter config', () => {
      expect(KOF2002_CONFIG.meter).toBeDefined();
      expect(KOF2002_CONFIG.meter.maxStocks).toBeGreaterThan(0);
    });
    it('has stun config', () => {
      expect(KOF2002_CONFIG.stun).toBeDefined();
    });
    it('has guard config', () => {
      expect(KOF2002_CONFIG.guard).toBeDefined();
    });
  });

  describe('TRAINING_CONFIG_OVERRIDES', () => {
    it('is an object', () => {
      expect(typeof TRAINING_CONFIG_OVERRIDES).toBe('object');
    });
  });

  describe('getActiveConfig', () => {
    it('returns KOF2002_CONFIG for versus', () => {
      const config = getActiveConfig('versus');
      expect(config).toBeDefined();
    });
    it('returns training config for training', () => {
      const config = getActiveConfig('training');
      expect(config).toBeDefined();
    });
  });

  describe('getGameConfig', () => {
    it('returns a valid config object', () => {
      const config = getGameConfig();
      expect(config).toBeDefined();
      expect(config.round).toBeDefined();
    });
  });
});
