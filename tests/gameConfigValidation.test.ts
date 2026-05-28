/**
 * Game Config Validation Tests
 *
 * Validates gameConfig module:
 * - KOF2002_CONFIG default values are reasonable
 * - TRAINING_CONFIG_OVERRIDES overrides specific fields
 * - validateGameConfig catches invalid values
 * - deepMerge merges partial configs correctly
 * - getGameConfig returns correct config for normal/training mode
 * - safeUpdateGameConfig rejects invalid configs
 * - Config section consistency (e.g. winsNeeded <= maxRounds)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  KOF2002_CONFIG,
  TRAINING_CONFIG_OVERRIDES,
  validateGameConfig,
  getGameConfig,
  resetGameConfig,
  safeUpdateGameConfig,
  type GameConfig,
} from '../src/core/gameConfig.js';

describe('KOF2002_CONFIG default values', () => {
  it('round time is 99 seconds', () => {
    expect(KOF2002_CONFIG.round.roundTime).toBe(99);
  });

  it('max rounds is 3', () => {
    expect(KOF2002_CONFIG.round.maxRounds).toBe(3);
  });

  it('wins needed is 2', () => {
    expect(KOF2002_CONFIG.round.winsNeeded).toBe(2);
  });

  it('wins needed <= max rounds', () => {
    expect(KOF2002_CONFIG.round.winsNeeded).toBeLessThanOrEqual(KOF2002_CONFIG.round.maxRounds);
  });

  it('combo scale step is positive', () => {
    expect(KOF2002_CONFIG.damage.comboScaleStep).toBeGreaterThan(0);
  });

  it('combo scale min ordering: normal < special < DM', () => {
    expect(KOF2002_CONFIG.damage.comboScaleMinNormal)
      .toBeLessThan(KOF2002_CONFIG.damage.comboScaleMinSpecial);
    expect(KOF2002_CONFIG.damage.comboScaleMinSpecial)
      .toBeLessThan(KOF2002_CONFIG.damage.comboScaleMinDM);
  });

  it('chip damage ratio is between 0 and 1', () => {
    expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeGreaterThan(0);
    expect(KOF2002_CONFIG.damage.chipDamageRatio).toBeLessThanOrEqual(1);
  });

  it('CH damage bonus is >= 1.0', () => {
    expect(KOF2002_CONFIG.damage.chDamageBonus).toBeGreaterThanOrEqual(1.0);
  });

  it('CH hitstun bonus is >= 1.0', () => {
    expect(KOF2002_CONFIG.damage.chHitstunBonus).toBeGreaterThanOrEqual(1.0);
  });

  it('max stocks is between 1 and 5', () => {
    expect(KOF2002_CONFIG.meter.maxStocks).toBeGreaterThanOrEqual(1);
    expect(KOF2002_CONFIG.meter.maxStocks).toBeLessThanOrEqual(5);
  });

  it('max mode duration is 10-15 seconds at 60fps', () => {
    const seconds = KOF2002_CONFIG.meter.maxModeDuration / 60;
    expect(seconds).toBeGreaterThanOrEqual(10);
    expect(seconds).toBeLessThanOrEqual(15);
  });

  it('max mode damage bonus > 1.0', () => {
    expect(KOF2002_CONFIG.meter.maxModeDamageBonus).toBeGreaterThan(1.0);
  });

  it('max mode defense bonus < 1.0', () => {
    expect(KOF2002_CONFIG.meter.maxModeDefenseBonus).toBeLessThan(1.0);
  });

  it('desperation threshold is between 0 and 0.5', () => {
    expect(KOF2002_CONFIG.meter.desperationThreshold).toBeGreaterThan(0);
    expect(KOF2002_CONFIG.meter.desperationThreshold).toBeLessThan(0.5);
  });

  it('desperation DM bonus > 1.0', () => {
    expect(KOF2002_CONFIG.meter.desperationDmBonus).toBeGreaterThan(1.0);
  });

  it('stun gauge max is positive', () => {
    expect(KOF2002_CONFIG.stun.stunGaugeMax).toBeGreaterThan(0);
  });

  it('dizzy duration min <= max', () => {
    expect(KOF2002_CONFIG.stun.dizzyDurationMin)
      .toBeLessThanOrEqual(KOF2002_CONFIG.stun.dizzyDurationMax);
  });

  it('stun decay rate is positive', () => {
    expect(KOF2002_CONFIG.stun.stunDecayRate).toBeGreaterThan(0);
  });

  it('guard gauge max is positive', () => {
    expect(KOF2002_CONFIG.guard.guardGaugeMax).toBeGreaterThan(0);
  });

  it('guard crush duration is positive', () => {
    expect(KOF2002_CONFIG.guard.guardCrushDuration).toBeGreaterThan(0);
  });

  it('guard recovery rate is positive', () => {
    expect(KOF2002_CONFIG.guard.guardGaugeRecoveryRate).toBeGreaterThan(0);
  });
});

describe('TRAINING_CONFIG_OVERRIDES', () => {
  it('round time is Infinity', () => {
    expect(TRAINING_CONFIG_OVERRIDES.round?.roundTime).toBe(Infinity);
  });

  it('max rounds is 1', () => {
    expect(TRAINING_CONFIG_OVERRIDES.round?.maxRounds).toBe(1);
  });

  it('does not override damage config', () => {
    expect(TRAINING_CONFIG_OVERRIDES.damage).toBeUndefined();
  });

  it('does not override meter config', () => {
    expect(TRAINING_CONFIG_OVERRIDES.meter).toBeUndefined();
  });

  it('does not override stun config', () => {
    expect(TRAINING_CONFIG_OVERRIDES.stun).toBeUndefined();
  });

  it('does not override guard config', () => {
    expect(TRAINING_CONFIG_OVERRIDES.guard).toBeUndefined();
  });
});

describe('validateGameConfig', () => {
  it('accepts KOF2002_CONFIG as valid', () => {
    const errors = validateGameConfig(KOF2002_CONFIG);
    expect(errors).toEqual([]);
  });

  it('accepts empty partial config', () => {
    const errors = validateGameConfig({});
    expect(errors).toEqual([]);
  });

  it('rejects negative round time', () => {
    const errors = validateGameConfig({ round: { roundTime: -1, maxRounds: 3, winsNeeded: 2 } });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.path === 'round.roundTime')).toBe(true);
  });

  it('rejects zero maxRounds', () => {
    const errors = validateGameConfig({ round: { roundTime: 99, maxRounds: 0, winsNeeded: 2 } });
    expect(errors.some(e => e.path === 'round.maxRounds')).toBe(true);
  });

  it('rejects non-integer maxStocks', () => {
    const errors = validateGameConfig({
      meter: { meterPerStock: 100, maxStocks: 2.5, maxModeDuration: 900,
        maxModeDamageBonus: 1.2, maxModeDefenseBonus: 0.875,
        desperationThreshold: 0.25, desperationDmBonus: 1.25 },
    });
    expect(errors.some(e => e.path === 'meter.maxStocks')).toBe(true);
  });

  it('rejects maxStocks > 5', () => {
    const errors = validateGameConfig({
      meter: { meterPerStock: 100, maxStocks: 6, maxModeDuration: 900,
        maxModeDamageBonus: 1.2, maxModeDefenseBonus: 0.875,
        desperationThreshold: 0.25, desperationDmBonus: 1.25 },
    });
    expect(errors.some(e => e.path === 'meter.maxStocks')).toBe(true);
  });

  it('rejects maxStocks < 1', () => {
    const errors = validateGameConfig({
      meter: { meterPerStock: 100, maxStocks: 0, maxModeDuration: 900,
        maxModeDamageBonus: 1.2, maxModeDefenseBonus: 0.875,
        desperationThreshold: 0.25, desperationDmBonus: 1.25 },
    });
    expect(errors.some(e => e.path === 'meter.maxStocks')).toBe(true);
  });

  it('rejects chipDamageRatio > 1', () => {
    const errors = validateGameConfig({
      damage: { comboScaleStep: 0.05, comboScaleMinNormal: 0.1,
        comboScaleMinSpecial: 0.2, comboScaleMinDM: 0.3,
        chipDamageRatio: 1.5, chDamageBonus: 1.0, chHitstunBonus: 1.5 },
    });
    expect(errors.some(e => e.path === 'damage.chipDamageRatio')).toBe(true);
  });

  it('rejects dizzyDurationMin > dizzyDurationMax', () => {
    const errors = validateGameConfig({
      stun: { stunGaugeMax: 100, dizzyDurationMin: 200,
        dizzyDurationMax: 100, stunDecayRate: 0.25 },
    });
    expect(errors.some(e => e.path === 'stun.dizzyDurationMin')).toBe(true);
  });

  it('rejects NaN values', () => {
    const errors = validateGameConfig({
      round: { roundTime: NaN, maxRounds: 3, winsNeeded: 2 },
    });
    expect(errors.some(e => e.path === 'round.roundTime')).toBe(true);
  });

  it('accepts Infinity round time', () => {
    const errors = validateGameConfig({
      round: { roundTime: Infinity, maxRounds: 1, winsNeeded: 1 },
    });
    expect(errors).toEqual([]);
  });

  it('returns multiple errors for multiple invalid fields', () => {
    const errors = validateGameConfig({
      round: { roundTime: -1, maxRounds: 0, winsNeeded: 0 },
      damage: { comboScaleStep: -1, comboScaleMinNormal: 0,
        comboScaleMinSpecial: 0, comboScaleMinDM: 0,
        chipDamageRatio: 2, chDamageBonus: 0, chHitstunBonus: 0 },
    });
    expect(errors.length).toBeGreaterThan(3);
  });
});

describe('getGameConfig', () => {
  beforeEach(() => {
    resetGameConfig();
  });

  it('returns KOF2002 defaults for normal mode', () => {
    const config = getGameConfig(false);
    expect(config.round.roundTime).toBe(99);
    expect(config.round.maxRounds).toBe(3);
  });

  it('returns training overrides for training mode', () => {
    const config = getGameConfig(true);
    expect(config.round.roundTime).toBe(Infinity);
    expect(config.round.maxRounds).toBe(1);
  });

  it('training mode preserves non-overridden sections', () => {
    const config = getGameConfig(true);
    expect(config.damage.comboScaleStep).toBe(KOF2002_CONFIG.damage.comboScaleStep);
    expect(config.meter.maxStocks).toBe(KOF2002_CONFIG.meter.maxStocks);
    expect(config.stun.stunGaugeMax).toBe(KOF2002_CONFIG.stun.stunGaugeMax);
    expect(config.guard.guardGaugeMax).toBe(KOF2002_CONFIG.guard.guardGaugeMax);
  });
});

describe('safeUpdateGameConfig', () => {
  beforeEach(() => {
    resetGameConfig();
  });

  it('applies valid partial config', () => {
    const errors = safeUpdateGameConfig({
      round: { roundTime: 60, maxRounds: 5, winsNeeded: 3 },
    });
    expect(errors).toEqual([]);
    const config = getGameConfig(false);
    expect(config.round.roundTime).toBe(60);
    expect(config.round.maxRounds).toBe(5);
  });

  it('rejects invalid partial config', () => {
    const errors = safeUpdateGameConfig({
      round: { roundTime: -10, maxRounds: 3, winsNeeded: 2 },
    });
    expect(errors.length).toBeGreaterThan(0);
    // Config should NOT have changed
    const config = getGameConfig(false);
    expect(config.round.roundTime).toBe(99);
  });

  it('preserves non-updated sections', () => {
    safeUpdateGameConfig({
      round: { roundTime: 60, maxRounds: 3, winsNeeded: 2 },
    });
    const config = getGameConfig(false);
    expect(config.damage.comboScaleStep).toBe(KOF2002_CONFIG.damage.comboScaleStep);
  });
});
