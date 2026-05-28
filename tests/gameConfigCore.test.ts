/**
 * Game Config Validation Regression Tests
 *
 * Validates game configuration defaults, validation rules, and deep merge.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  KOF2002_CONFIG,
  TRAINING_CONFIG_OVERRIDES,
  getGameConfig,
  validateGameConfig,
  resetGameConfig,
  safeUpdateGameConfig,
  updateGameConfig,
  type GameConfig,
} from '../src/core/gameConfig.js';

// ===== Default Config Values =====

describe('KOF2002_CONFIG', () => {
  it('has correct round config', () => {
    expect(KOF2002_CONFIG.round.roundTime).toBe(99);
    expect(KOF2002_CONFIG.round.maxRounds).toBe(3);
    expect(KOF2002_CONFIG.round.winsNeeded).toBe(2);
  });

  it('has positive damage values', () => {
    const d = KOF2002_CONFIG.damage;
    expect(d.comboScaleStep).toBeGreaterThan(0);
    expect(d.comboScaleMinNormal).toBeGreaterThan(0);
    expect(d.comboScaleMinSpecial).toBeGreaterThan(0);
    expect(d.comboScaleMinDM).toBeGreaterThan(0);
    expect(d.chDamageBonus).toBeGreaterThan(0);
    expect(d.chHitstunBonus).toBeGreaterThan(0);
  });

  it('has correct chip damage ratio (0-1)', () => {
    expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeGreaterThanOrEqual(0);
    expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeLessThanOrEqual(1);
  });

  it('has meter config with correct values', () => {
    const m = KOF2002_CONFIG.meter;
    expect(m.maxStocks).toBe(3);
    expect(m.maxModeDuration).toBeGreaterThan(0);
    expect(m.desperationThreshold).toBeGreaterThan(0);
    expect(m.desperationThreshold).toBeLessThanOrEqual(1);
  });

  it('stun duration max > min', () => {
    const s = KOF2002_CONFIG.stun;
    expect(s.dizzyDurationMax).toBeGreaterThanOrEqual(s.dizzyDurationMin);
  });

  it('passes self-validation', () => {
    const errors = validateGameConfig(KOF2002_CONFIG);
    expect(errors).toEqual([]);
  });
});

// ===== Training Mode Config =====

describe('TRAINING_CONFIG_OVERRIDES', () => {
  it('has infinite round time', () => {
    expect(TRAINING_CONFIG_OVERRIDES.round?.roundTime).toBe(Infinity);
  });

  it('getGameConfig with training=true has infinite time', () => {
    resetGameConfig();
    const cfg = getGameConfig(true);
    expect(cfg.round.roundTime).toBe(Infinity);
  });
});

// ===== Validation =====

describe('validateGameConfig', () => {
  it('rejects negative round time', () => {
    const errors = validateGameConfig({ round: { roundTime: -10, maxRounds: 3, winsNeeded: 2 } });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.path === 'round.roundTime')).toBe(true);
  });

  it('rejects zero max rounds', () => {
    const errors = validateGameConfig({ round: { maxRounds: 0 } });
    expect(errors.some(e => e.path === 'round.maxRounds')).toBe(true);
  });

  it('rejects max stocks > 5', () => {
    const errors = validateGameConfig({ meter: { maxStocks: 10 } });
    expect(errors.some(e => e.path === 'meter.maxStocks')).toBe(true);
  });

  it('rejects non-integer max stocks', () => {
    const errors = validateGameConfig({ meter: { maxStocks: 2.5 } });
    expect(errors.some(e => e.path === 'meter.maxStocks')).toBe(true);
  });

  it('rejects chip damage ratio > 1', () => {
    const errors = validateGameConfig({ damage: { chipDamageRatio: 1.5 } });
    expect(errors.some(e => e.path === 'damage.chipDamageRatio')).toBe(true);
  });

  it('rejects dizzy min > max', () => {
    const errors = validateGameConfig({ stun: { dizzyDurationMin: 200, dizzyDurationMax: 100 } });
    expect(errors.some(e => e.path === 'stun.dizzyDurationMin')).toBe(true);
  });

  it('accepts valid config with no errors', () => {
    const errors = validateGameConfig({
      round: { roundTime: 60, maxRounds: 5, winsNeeded: 3 },
    });
    expect(errors).toEqual([]);
  });

  it('accepts Infinity round time', () => {
    const errors = validateGameConfig({ round: { roundTime: Infinity } });
    expect(errors.filter(e => e.path === 'round.roundTime')).toEqual([]);
  });

  it('accepts partial config', () => {
    const errors = validateGameConfig({ meter: { maxStocks: 5 } });
    expect(errors).toEqual([]);
  });
});

// ===== Config Update/Reset =====

describe('config update and reset', () => {
  beforeEach(() => {
    resetGameConfig();
  });

  it('updateGameConfig applies partial override', () => {
    updateGameConfig({ round: { roundTime: 60 } });
    const cfg = getGameConfig(false);
    expect(cfg.round.roundTime).toBe(60);
    // Other fields unchanged
    expect(cfg.round.maxRounds).toBe(3);
  });

  it('resetGameConfig restores defaults', () => {
    updateGameConfig({ round: { roundTime: 60 } });
    resetGameConfig();
    const cfg = getGameConfig(false);
    expect(cfg.round.roundTime).toBe(99);
  });

  it('safeUpdateGameConfig rejects invalid and does not apply', () => {
    const errors = safeUpdateGameConfig({ round: { roundTime: -10, maxRounds: 3, winsNeeded: 2 } });
    expect(errors.length).toBeGreaterThan(0);
    // Config should not have changed
    expect(getGameConfig(false).round.roundTime).toBe(99);
  });

  it('safeUpdateGameConfig applies valid config', () => {
    const errors = safeUpdateGameConfig({ round: { roundTime: 60 } });
    expect(errors).toEqual([]);
    expect(getGameConfig(false).round.roundTime).toBe(60);
  });
});
