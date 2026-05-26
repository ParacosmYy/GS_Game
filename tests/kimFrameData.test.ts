/**
 * Kim Kaphwan frame data validation tests.
 *
 * Validates that Kim-specific specials have reasonable values and
 * obey KOF2002 structural conventions (damage hierarchy, knockdown
 * rules, chip damage, hitLevel, blockstun, pushback).
 *
 * Data source: APPROX based on KOF2002UM frame data.
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

// Kim special move keys from FRAME_DATA_CHARS
const KIM_SPECIAL_KEYS = [
  'KIM_HIENZAN',
  'KIM_HANGETSU',
  'KIM_HAKI',
  'KIM_HISHOU',
  'KIM_SANREN',
] as const;

const KIM_DM_KEYS = [
  'DM_YATAGARASU',
  'DM_POWER_GEYSER',
  'DM_PHOENIX_KICK',
  'DM_HIGH_ANGLE_GEYSER',
  'DM_PHOENIX_HITEN',
] as const;

const KIM_SDM_KEYS = [
  'SDM_YATAGARASU',
  'SDM_POWER_GEYSER',
  'SDM_PHOENIX_KICK',
] as const;

// Command normals live in frameDataConstants (not frameDataChars)
const KIM_CMD_NORMAL_KEYS = [
  'KIM_HISHOU_KICK',
  'KIM_HANSEN',
] as const;

const ALL_KIM_SPECIALS = [...KIM_SPECIAL_KEYS] as const;
const ALL_KIM_KEYS = [...KIM_SPECIAL_KEYS, ...KIM_DM_KEYS, ...KIM_SDM_KEYS] as const;

// DP-type moves (anti-air, should have knockdown + chip)
const KIM_DP_MOVES = new Set([
  'KIM_HIENZAN',
]);

// Rush moves that knock down but are not DP-type (no chipDamage)
const KIM_RUSH_MOVES = new Set([
  'KIM_HISHOU',
]);

function getKimData(key: string): FrameDataEntry {
  const data = FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS];
  if (!data) throw new Error(`Missing Kim frame data: ${key}`);
  return data as unknown as FrameDataEntry;
}

function getFrameData(key: string): FrameDataEntry {
  const data = FRAME_DATA[key as keyof typeof FRAME_DATA];
  if (!data) throw new Error(`Missing frame data: ${key}`);
  return data as unknown as FrameDataEntry;
}

// ── Existence ──

describe('Kim frame data -- specials exist', () => {
  it('all Kim special keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of ALL_KIM_SPECIALS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('all Kim DM keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of KIM_DM_KEYS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('all Kim SDM keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of KIM_SDM_KEYS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('should have at least 5 KIM_ prefixed special entries', () => {
    const kimKeys = Object.keys(FRAME_DATA_CHARS).filter(k => k.startsWith('KIM_'));
    expect(kimKeys.length).toBeGreaterThanOrEqual(5);
  });

  it('Kim command normals should exist in FRAME_DATA', () => {
    for (const key of KIM_CMD_NORMAL_KEYS) {
      expect(
        FRAME_DATA[key as keyof typeof FRAME_DATA],
        `${key} should exist in FRAME_DATA`,
      ).toBeDefined();
    }
  });
});

// ── Startup ──

describe('Kim frame data -- startup values', () => {
  it('startup should be in range 2-10 frames for Kim specials', () => {
    for (const key of ALL_KIM_SPECIALS) {
      const fd = getKimData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be >= 2`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be <= 10`,
      ).toBeLessThanOrEqual(10);
    }
  });

  it('DM startup should be in range 6-18 frames', () => {
    for (const key of KIM_DM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be >= 6`,
      ).toBeGreaterThanOrEqual(6);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be <= 18`,
      ).toBeLessThanOrEqual(18);
    }
  });

  it('Hishou (fastest special) should have startup <= 3 frames', () => {
    const fd = getKimData('KIM_HISHOU');
    expect(
      fd.startup,
      `KIM_HISHOU startup (${fd.startup}) should be <= 3`,
    ).toBeLessThanOrEqual(3);
  });
});

// ── Active ──

describe('Kim frame data -- active values', () => {
  it('active should be in range 5-14 frames for specials', () => {
    for (const key of ALL_KIM_SPECIALS) {
      const fd = getKimData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be >= 5`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be <= 14`,
      ).toBeLessThanOrEqual(14);
    }
  });

  it('DM active frames should be >= 5', () => {
    for (const key of KIM_DM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be >= 5`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('SDM active frames should be >= 12', () => {
    for (const key of KIM_SDM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be >= 12`,
      ).toBeGreaterThanOrEqual(12);
    }
  });
});

// ── Recovery ──

describe('Kim frame data -- recovery values', () => {
  it('recovery should be in range 14-30 frames for specials', () => {
    for (const key of ALL_KIM_SPECIALS) {
      const fd = getKimData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 14`,
      ).toBeGreaterThanOrEqual(14);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be <= 30`,
      ).toBeLessThanOrEqual(30);
    }
  });

  it('DM recovery should be >= 30 frames', () => {
    for (const key of KIM_DM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 30`,
      ).toBeGreaterThanOrEqual(30);
    }
  });
});

// ── Damage hierarchy ──

describe('Kim frame data -- damage hierarchy', () => {
  it('SDM damage should exceed DM damage', () => {
    const dm = getKimData('DM_YATAGARASU');
    const sdm = getKimData('SDM_YATAGARASU');
    expect(
      sdm.damage,
      `SDM damage (${sdm.damage}) should exceed DM (${dm.damage})`,
    ).toBeGreaterThan(dm.damage);
  });

  it('DM damage should be higher than any single special damage', () => {
    const dm = getKimData('DM_YATAGARASU');
    const strongestSpecial = getKimData('KIM_HIENZAN');
    expect(
      dm.damage,
      `DM damage (${dm.damage}) should exceed strongest special (${strongestSpecial.damage})`,
    ).toBeGreaterThan(strongestSpecial.damage);
  });

  it('all SDM damage values should be >= 290', () => {
    for (const key of KIM_SDM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.damage,
        `${key}.damage=${fd.damage} should be >= 290`,
      ).toBeGreaterThanOrEqual(290);
    }
  });
});

// ── Knockdown consistency ──

describe('Kim frame data -- knockdown consistency', () => {
  it('DP moves and rush moves should cause knockdown', () => {
    for (const key of [...KIM_DP_MOVES, ...KIM_RUSH_MOVES]) {
      const fd = getKimData(key);
      expect(
        fd.knockdown,
        `${key} should cause knockdown`,
      ).toBe(true);
    }
  });

  it('all DM/SDM moves should cause knockdown', () => {
    for (const key of [...KIM_DM_KEYS, ...KIM_SDM_KEYS]) {
      const fd = getKimData(key);
      expect(
        fd.knockdown,
        `${key} (DM/SDM) should cause knockdown`,
      ).toBe(true);
    }
  });

  it('Haki (low sweep) should NOT cause knockdown', () => {
    const fd = getKimData('KIM_HAKI');
    expect(fd.knockdown, 'KIM_HAKI should not cause knockdown').toBe(false);
  });

  it('Sanren (chain kick) should cause knockdown', () => {
    const fd = getKimData('KIM_SANREN');
    expect(fd.knockdown, 'KIM_SANREN should cause knockdown').toBe(true);
  });
});

// ── Chip damage ──

describe('Kim frame data -- chip damage', () => {
  it('DP moves should have chipDamage > 0', () => {
    for (const key of KIM_DP_MOVES) {
      const fd = getKimData(key);
      expect(
        fd.chipDamage,
        `${key} (DP) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('all DM moves should have chipDamage > 0', () => {
    for (const key of KIM_DM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.chipDamage,
        `${key} (DM) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('all SDM moves should have chipDamage > 0', () => {
    for (const key of KIM_SDM_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.chipDamage,
        `${key} (SDM) should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('Haki and Sanren should NOT have chip damage', () => {
    const haki = getKimData('KIM_HAKI');
    const sanren = getKimData('KIM_SANREN');
    expect(haki.chipDamage, 'KIM_HAKI should not have chipDamage').toBeUndefined();
    expect(sanren.chipDamage, 'KIM_SANREN should not have chipDamage').toBeUndefined();
  });
});

// ── Blockstun ──

describe('Kim frame data -- blockstun', () => {
  it('special blockstun should be >= 17 for all Kim specials', () => {
    for (const key of ALL_KIM_SPECIALS) {
      const fd = getKimData(key);
      expect(
        fd.blockstun,
        `${key}.blockstun=${fd.blockstun} should be >= 17`,
      ).toBeGreaterThanOrEqual(17);
    }
  });

  it('DM/SDM blockstun should be 21', () => {
    for (const key of [...KIM_DM_KEYS, ...KIM_SDM_KEYS]) {
      const fd = getKimData(key);
      expect(
        fd.blockstun,
        `${key}.blockstun=${fd.blockstun} should be 21`,
      ).toBe(21);
    }
  });

  it('hitstun should be greater than blockstun for non-DM specials', () => {
    for (const key of KIM_SPECIAL_KEYS) {
      const fd = getKimData(key);
      expect(
        fd.hitstun,
        `${key}.hitstun=${fd.hitstun} should be > blockstun=${fd.blockstun}`,
      ).toBeGreaterThan(fd.blockstun);
    }
  });
});

// ── HitLevel ──

describe('Kim frame data -- hitLevel', () => {
  it('Haki should be LOW hitLevel', () => {
    const fd = getKimData('KIM_HAKI');
    expect(fd.hitLevel, 'KIM_HAKI should be LOW').toBe('LOW');
  });

  it('Hishou Kick command normal should be HIGH hitLevel (overhead)', () => {
    const fd = getFrameData('KIM_HISHOU_KICK');
    expect(fd.hitLevel, 'KIM_HISHOU_KICK should be HIGH').toBe('HIGH');
  });

  it('Hienzan should be MID hitLevel', () => {
    const fd = getKimData('KIM_HIENZAN');
    expect(fd.hitLevel, 'KIM_HIENZAN should be MID').toBe('MID');
  });
});

// ── Pushback ──

describe('Kim frame data -- pushback', () => {
  it('pushback should be > 0 for all non-throw specials', () => {
    for (const key of ALL_KIM_SPECIALS) {
      const fd = getKimData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('DM/SDM pushback should be >= 8', () => {
    for (const key of [...KIM_DM_KEYS, ...KIM_SDM_KEYS]) {
      const fd = getKimData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be >= 8`,
      ).toBeGreaterThanOrEqual(8);
    }
  });

  it('Hienzan (DP) should have higher pushback than Haki (low)', () => {
    const dp = getKimData('KIM_HIENZAN');
    const low = getKimData('KIM_HAKI');
    expect(
      dp.pushback,
      `Hienzan pushback (${dp.pushback}) should be > Haki (${low.pushback})`,
    ).toBeGreaterThan(low.pushback);
  });
});
