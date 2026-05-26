/**
 * Terry Bogard frame data validation tests.
 *
 * Validates that Terry-specific specials have reasonable values and
 * obey KOF2002 structural conventions (damage hierarchy, knockdown
 * rules, chip damage, hitLevel, blockstun, pushback).
 *
 * Data source: SuperCombo Wiki KOF2002 original (APPROX OG).
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH';
  knockdown: boolean;
  chipDamage?: number;
};

// Terry special move keys from FRAME_DATA_CHARS
const TERRY_SPECIAL_KEYS = [
  'TERRY_POWER_WAVE',
  'TERRY_ROUND_WAVE',
  'TERRY_BURN_KNUCKLE',
  'TERRY_BURN_KNUCKLE_C',
  'TERRY_CRACK_SHOT',
  'TERRY_CRACK_SHOT_D',
  'TERRY_POWER_DUNK',
  'TERRY_POWER_DUNK_D',
  'TERRY_RISING_TACKLE',
  'TERRY_RISING_TACKLE_C',
] as const;

const TERRY_DM_KEYS = [
  'DM_POWER_GEYSER_A',
  'DM_POWER_GEYSER_C',
  'DM_HIGH_ANGLE_GEYSER_B',
  'DM_HIGH_ANGLE_GEYSER_D',
  'SDM_TRIPLE_GEYSER',
] as const;

// Command normals live in frameDataConstants (not frameDataChars)
const TERRY_CMD_NORMAL_KEYS = [
  'TERRY_BACK_KNCKLE',
  'TERRY_COMBO_BLOW',
] as const;

const ALL_TERRY_SPECIALS = [...TERRY_SPECIAL_KEYS] as const;
const ALL_TERRY_KEYS = [...TERRY_SPECIAL_KEYS, ...TERRY_DM_KEYS] as const;

// DP-type moves (anti-air, should have knockdown + chip)
const TERRY_DP_MOVES = new Set([
  'TERRY_POWER_DUNK',
  'TERRY_POWER_DUNK_D',
  'TERRY_RISING_TACKLE',
  'TERRY_RISING_TACKLE_C',
]);

// Projectile moves (should have chip damage)
const TERRY_PROJECTILE_MOVES = new Set([
  'TERRY_POWER_WAVE',
  'TERRY_ROUND_WAVE',
]);

function getTerryData(key: string): FrameDataEntry {
  const data = FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS];
  if (!data) throw new Error(`Missing Terry frame data: ${key}`);
  return data as unknown as FrameDataEntry;
}

function getFrameData(key: string): FrameDataEntry {
  const data = FRAME_DATA[key as keyof typeof FRAME_DATA];
  if (!data) throw new Error(`Missing frame data: ${key}`);
  return data as unknown as FrameDataEntry;
}

// ── Existence ──

describe('Terry frame data -- specials exist', () => {
  it('all Terry special keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('all Terry DM/SDM keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of TERRY_DM_KEYS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('should have at least 10 TERRY_ prefixed special entries', () => {
    const terryKeys = Object.keys(FRAME_DATA_CHARS).filter(k => k.startsWith('TERRY_'));
    expect(terryKeys.length).toBeGreaterThanOrEqual(10);
  });

  it('Terry command normals should exist in FRAME_DATA', () => {
    for (const key of TERRY_CMD_NORMAL_KEYS) {
      expect(
        FRAME_DATA[key as keyof typeof FRAME_DATA],
        `${key} should exist in FRAME_DATA`,
      ).toBeDefined();
    }
  });
});

// ── Startup ──

describe('Terry frame data -- startup values', () => {
  it('startup should be in range 5-22 frames for all Terry specials', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      const fd = getTerryData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be >= 5`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be <= 22`,
      ).toBeLessThanOrEqual(22);
    }
  });

  it('DM/SDM startup should be in range 6-20 frames', () => {
    for (const key of TERRY_DM_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be >= 6`,
      ).toBeGreaterThanOrEqual(6);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be <= 20`,
      ).toBeLessThanOrEqual(20);
    }
  });
});

// ── Active ──

describe('Terry frame data -- active values', () => {
  it('active should be in range 2-20 frames for specials', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      const fd = getTerryData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be >= 2`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be <= 20`,
      ).toBeLessThanOrEqual(20);
    }
  });

  it('Power Wave should have longer active frames than Burn Knuckle (projectile vs strike)', () => {
    const wave = getTerryData('TERRY_POWER_WAVE');
    const knuckle = getTerryData('TERRY_BURN_KNUCKLE');
    expect(
      wave.active,
      `Power Wave active (${wave.active}) should be > Burn Knuckle (${knuckle.active})`,
    ).toBeGreaterThan(knuckle.active);
  });
});

// ── Recovery ──

describe('Terry frame data -- recovery values', () => {
  it('recovery should be in range 10-50 frames for specials', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      const fd = getTerryData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 10`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be <= 50`,
      ).toBeLessThanOrEqual(50);
    }
  });

  it('DP moves should have high recovery (>= 35 frames)', () => {
    for (const key of TERRY_DP_MOVES) {
      const fd = getTerryData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 35`,
      ).toBeGreaterThanOrEqual(35);
    }
  });
});

// ── Damage hierarchy ──

describe('Terry frame data -- damage hierarchy', () => {
  it('SDM Triple Geyser should have highest damage among all Terry moves', () => {
    const sdm = getTerryData('SDM_TRIPLE_GEYSER');
    for (const key of TERRY_SPECIAL_KEYS) {
      const fd = getTerryData(key);
      expect(
        sdm.damage,
        `SDM damage (${sdm.damage}) should exceed ${key} (${fd.damage})`,
      ).toBeGreaterThan(fd.damage);
    }
  });

  it('DM damage should be higher than any single special damage', () => {
    const dm = getTerryData('DM_POWER_GEYSER_A');
    const strongestSpecial = getTerryData('TERRY_RISING_TACKLE_C');
    expect(
      dm.damage,
      `DM damage (${dm.damage}) should exceed strongest special (${strongestSpecial.damage})`,
    ).toBeGreaterThan(strongestSpecial.damage);
  });

  it('SDM damage should be higher than DM damage', () => {
    const dm = getTerryData('DM_POWER_GEYSER_A');
    const sdm = getTerryData('SDM_TRIPLE_GEYSER');
    expect(
      sdm.damage,
      `SDM damage (${sdm.damage}) should exceed DM (${dm.damage})`,
    ).toBeGreaterThan(dm.damage);
  });
});

// ── Knockdown consistency ──

describe('Terry frame data -- knockdown consistency', () => {
  it('DP moves should cause knockdown', () => {
    for (const key of TERRY_DP_MOVES) {
      const fd = getTerryData(key);
      expect(
        fd.knockdown,
        `${key} (DP move) should cause knockdown`,
      ).toBe(true);
    }
  });

  it('all DM/SDM moves should cause knockdown', () => {
    for (const key of TERRY_DM_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.knockdown,
        `${key} (DM/SDM) should cause knockdown`,
      ).toBe(true);
    }
  });

  it('Power Wave should NOT cause knockdown (projectile)', () => {
    const wave = getTerryData('TERRY_POWER_WAVE');
    expect(wave.knockdown, 'TERRY_POWER_WAVE should not cause knockdown').toBe(false);
  });

  it('Crack Shot should NOT cause knockdown (overhead sweep)', () => {
    const cs = getTerryData('TERRY_CRACK_SHOT');
    const csd = getTerryData('TERRY_CRACK_SHOT_D');
    expect(cs.knockdown, 'TERRY_CRACK_SHOT should not cause knockdown').toBe(false);
    expect(csd.knockdown, 'TERRY_CRACK_SHOT_D should not cause knockdown').toBe(false);
  });
});

// ── Chip damage ──

describe('Terry frame data -- chip damage', () => {
  it('projectile moves should have chipDamage > 0', () => {
    for (const key of TERRY_PROJECTILE_MOVES) {
      const fd = getTerryData(key);
      expect(
        fd.chipDamage,
        `${key} (projectile) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('DP moves should have chipDamage > 0', () => {
    for (const key of TERRY_DP_MOVES) {
      const fd = getTerryData(key);
      expect(
        fd.chipDamage,
        `${key} (DP) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('all DM/SDM moves should have chipDamage > 0', () => {
    for (const key of TERRY_DM_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.chipDamage,
        `${key} (DM/SDM) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });
});

// ── Blockstun ──

describe('Terry frame data -- blockstun', () => {
  it('special blockstun should be >= 17 for all Terry specials', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      const fd = getTerryData(key);
      expect(
        fd.blockstun,
        `${key}.blockstun=${fd.blockstun} should be >= 17`,
      ).toBeGreaterThanOrEqual(17);
    }
  });

  it('DM/SDM blockstun should be 21', () => {
    for (const key of TERRY_DM_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.blockstun,
        `${key}.blockstun=${fd.blockstun} should be 21`,
      ).toBe(21);
    }
  });

  it('hitstun should be greater than blockstun for non-DM specials', () => {
    for (const key of TERRY_SPECIAL_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.hitstun,
        `${key}.hitstun=${fd.hitstun} should be > blockstun=${fd.blockstun}`,
      ).toBeGreaterThan(fd.blockstun);
    }
  });
});

// ── Crack Shot hitLevel = HIGH (overhead) ──

describe('Terry frame data -- Crack Shot overhead', () => {
  it('Crack Shot should be HIGH hitLevel (overhead)', () => {
    const cs = getTerryData('TERRY_CRACK_SHOT');
    const csd = getTerryData('TERRY_CRACK_SHOT_D');
    expect(cs.hitLevel, 'TERRY_CRACK_SHOT should be HIGH').toBe('HIGH');
    expect(csd.hitLevel, 'TERRY_CRACK_SHOT_D should be HIGH').toBe('HIGH');
  });
});

// ── Pushback ──

describe('Terry frame data -- pushback', () => {
  it('pushback should be > 0 for all non-throw specials', () => {
    for (const key of ALL_TERRY_SPECIALS) {
      const fd = getTerryData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('DM/SDM pushback should be >= 10', () => {
    for (const key of TERRY_DM_KEYS) {
      const fd = getTerryData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be >= 10`,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it('DP moves should have higher pushback than projectile', () => {
    const dunk = getTerryData('TERRY_POWER_DUNK');
    const wave = getTerryData('TERRY_POWER_WAVE');
    expect(
      dunk.pushback,
      `Power Dunk pushback (${dunk.pushback}) should be > Power Wave (${wave.pushback})`,
    ).toBeGreaterThan(wave.pushback);
  });
});

// ── A vs C version differentiation ──

describe('Terry frame data -- A/C version differentiation', () => {
  it('Burn Knuckle C should differ from A version', () => {
    const a = getTerryData('TERRY_BURN_KNUCKLE');
    const c = getTerryData('TERRY_BURN_KNUCKLE_C');
    const differs =
      a.startup !== c.startup ||
      a.active !== c.active ||
      a.recovery !== c.recovery ||
      a.damage !== c.damage;
    expect(differs, 'TERRY_BURN_KNUCKLE_C should differ from TERRY_BURN_KNUCKLE').toBe(true);
  });

  it('Rising Tackle C should have higher damage than A version', () => {
    const a = getTerryData('TERRY_RISING_TACKLE');
    const c = getTerryData('TERRY_RISING_TACKLE_C');
    expect(
      c.damage,
      `C version damage (${c.damage}) should exceed A (${a.damage})`,
    ).toBeGreaterThan(a.damage);
  });

  it('Crack Shot D should have higher damage than B version', () => {
    const b = getTerryData('TERRY_CRACK_SHOT');
    const d = getTerryData('TERRY_CRACK_SHOT_D');
    expect(
      d.damage,
      `D version damage (${d.damage}) should exceed B (${b.damage})`,
    ).toBeGreaterThan(b.damage);
  });
});
