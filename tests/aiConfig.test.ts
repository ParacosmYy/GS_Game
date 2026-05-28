/**
 * AI Configuration regression test
 * Verifies difficulty presets, spacing profiles, and hash helpers.
 */
import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_PRESETS,
  difficultyScalarToConfig,
  RANGE_CLOSE, RANGE_MID, RANGE_FAR,
  PUNISH_WINDOW_LARGE, PUNISH_WINDOW_MEDIUM, PUNISH_WINDOW_SMALL,
  ANTIAIR_MAX_HEIGHT,
  SPACING_PROFILES, DEFAULT_SPACING,
  mixHash, mixString, mixBool, mixFloat,
  type AIDifficultyConfig,
} from '../src/ai/aiConfig.js';

describe('AI Difficulty Presets', () => {
  it('has easy/medium/hard presets', () => {
    expect(DIFFICULTY_PRESETS.easy).toBeDefined();
    expect(DIFFICULTY_PRESETS.medium).toBeDefined();
    expect(DIFFICULTY_PRESETS.hard).toBeDefined();
  });

  it('reaction delay decreases with difficulty', () => {
    expect(DIFFICULTY_PRESETS.easy.reactionDelay).toBeGreaterThan(DIFFICULTY_PRESETS.medium.reactionDelay);
    expect(DIFFICULTY_PRESETS.medium.reactionDelay).toBeGreaterThan(DIFFICULTY_PRESETS.hard.reactionDelay);
  });

  it('combo drop rate decreases with difficulty', () => {
    expect(DIFFICULTY_PRESETS.easy.comboDropRate).toBeGreaterThan(DIFFICULTY_PRESETS.medium.comboDropRate);
    expect(DIFFICULTY_PRESETS.medium.comboDropRate).toBeGreaterThan(DIFFICULTY_PRESETS.hard.comboDropRate);
  });

  it('block rate increases with difficulty', () => {
    expect(DIFFICULTY_PRESETS.easy.blockRate).toBeLessThan(DIFFICULTY_PRESETS.medium.blockRate);
    expect(DIFFICULTY_PRESETS.medium.blockRate).toBeLessThan(DIFFICULTY_PRESETS.hard.blockRate);
  });

  it('all preset fields are positive numbers', () => {
    for (const [level, cfg] of Object.entries(DIFFICULTY_PRESETS)) {
      for (const [key, val] of Object.entries(cfg)) {
        expect(typeof val, `${level}.${key}`).toBe('number');
        expect(val, `${level}.${key} >= 0`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('difficultyScalarToConfig', () => {
  it('returns valid config for scalar 0', () => {
    const cfg = difficultyScalarToConfig(0);
    expect(cfg.reactionDelay).toBeGreaterThan(0);
    expect(cfg.blockRate).toBeGreaterThanOrEqual(0);
  });

  it('returns valid config for scalar 1', () => {
    const cfg = difficultyScalarToConfig(1);
    expect(cfg.reactionDelay).toBeLessThan(difficultyScalarToConfig(0).reactionDelay);
    expect(cfg.blockRate).toBeGreaterThan(difficultyScalarToConfig(0).blockRate);
  });

  it('clamps to 0..1 range', () => {
    const under = difficultyScalarToConfig(-1);
    const over = difficultyScalarToConfig(2);
    expect(under.reactionDelay).toBe(difficultyScalarToConfig(0).reactionDelay);
    expect(over.reactionDelay).toBe(difficultyScalarToConfig(1).reactionDelay);
  });
});

describe('Range constants', () => {
  it('ranges are ordered: CLOSE < MID < FAR', () => {
    expect(RANGE_CLOSE).toBeLessThan(RANGE_MID);
    expect(RANGE_MID).toBeLessThan(RANGE_FAR);
  });

  it('punish windows are ordered: SMALL < MEDIUM < LARGE', () => {
    expect(PUNISH_WINDOW_SMALL).toBeLessThan(PUNISH_WINDOW_MEDIUM);
    expect(PUNISH_WINDOW_MEDIUM).toBeLessThan(PUNISH_WINDOW_LARGE);
  });

  it('anti-air height is positive', () => {
    expect(ANTIAIR_MAX_HEIGHT).toBeGreaterThan(0);
  });
});

describe('Spacing Profiles', () => {
  it('has at least 10 character profiles', () => {
    expect(Object.keys(SPACING_PROFILES).length).toBeGreaterThanOrEqual(10);
  });

  it('all profiles have valid preferredDistance', () => {
    for (const [char, profile] of Object.entries(SPACING_PROFILES)) {
      expect(profile.preferredDistance, `${char}.preferredDistance`).toBeGreaterThan(0);
      expect(profile.preferredDistance, `${char}.preferredDistance`).toBeLessThan(300);
    }
  });

  it('all profiles have valid distanceTolerance', () => {
    for (const [char, profile] of Object.entries(SPACING_PROFILES)) {
      expect(profile.distanceTolerance, `${char}.distanceTolerance`).toBeGreaterThan(0);
    }
  });

  it('antiAirType is one of dp/crouchC/standD', () => {
    const valid = ['dp', 'crouchC', 'standD'];
    for (const [char, profile] of Object.entries(SPACING_PROFILES)) {
      expect(valid, `${char}.antiAirType`).toContain(profile.antiAirType);
    }
  });

  it('DEFAULT_SPACING is valid', () => {
    expect(DEFAULT_SPACING.preferredDistance).toBeGreaterThan(0);
    expect(DEFAULT_SPACING.antiAirType).toBe('dp');
  });
});

describe('Hash helpers', () => {
  it('mixHash is deterministic', () => {
    expect(mixHash(123, 456)).toBe(mixHash(123, 456));
  });

  it('mixString is deterministic', () => {
    expect(mixString(0, 'test')).toBe(mixString(0, 'test'));
  });

  it('mixBool is deterministic', () => {
    expect(mixBool(0, true)).toBe(mixBool(0, true));
    expect(mixBool(0, false)).toBe(mixBool(0, false));
    expect(mixBool(0, true)).not.toBe(mixBool(0, false));
  });

  it('mixFloat is deterministic', () => {
    expect(mixFloat(0, 1.5)).toBe(mixFloat(0, 1.5));
  });

  it('different inputs produce different hashes', () => {
    expect(mixHash(0, 1)).not.toBe(mixHash(0, 2));
    expect(mixString(0, 'a')).not.toBe(mixString(0, 'b'));
  });
});
