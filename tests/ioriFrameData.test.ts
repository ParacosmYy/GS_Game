/**
 * Iori Yagami frame data validation tests.
 *
 * Validates that Iori-specific specials have reasonable values and
 * differ meaningfully from the generic SPECIAL_PROJECTILE / SPECIAL_UPPER
 * templates.
 *
 * Data source: Dream Cancel Wiki KOF2002UM precise data.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

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

// Iori special move keys from FRAME_DATA_CHARS (excludes command normals
// like IORI_YUMEYUMI / IORI_KATANUGI / IORI_YUKIWARUI which live in
// frameDataConstants.ts).
const IORI_SPECIAL_KEYS = [
  'IORI_AOIHANA',
  'IORI_AOIHANA_2',
  'IORI_AOIHANA_3',
  'IORI_AOIHANA_C',
  'IORI_AOIHANA_C_2',
  'IORI_AOIHANA_C_3',
  'IORI_YAMIBARAI',
  'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI',
  'IORI_ONIYAKI_C',
  'IORI_KOTOTSUKI',
  'IORI_KOTOTSUKI_D',
  'IORI_KUZUKAZE',
] as const;

const IORI_DM_KEYS = [
  'DM_MAIDEN_MASHER_A',
  'DM_MAIDEN_MASHER_C',
  'SDM_MAIDEN_MASHER',
] as const;

const ALL_IORI_KEYS = [...IORI_SPECIAL_KEYS, ...IORI_DM_KEYS] as const;

// DM/SDM rush-type moves: pushback and blockstun are 0 by convention
const IORI_DM_RUSH_MOVES = new Set([
  'DM_MAIDEN_MASHER_A',
  'DM_MAIDEN_MASHER_C',
  'SDM_MAIDEN_MASHER',
]);

// Generic templates for comparison
const SPECIAL_PROJECTILE = {
  startup: 10, active: 20, recovery: 32,
  damage: 90, hitstun: 31, blockstun: 29, pushback: 5,
} as const;

const SPECIAL_UPPER = {
  startup: 5, active: 6, recovery: 22,
  damage: 120, hitstun: 25, blockstun: 20, pushback: 8,
} as const;

function getIoriData(key: string): FrameDataEntry {
  const data = FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS];
  if (!data) throw new Error(`Missing Iori frame data: ${key}`);
  return data as unknown as FrameDataEntry;
}

// ── Existence ──

describe('Iori frame data -- specials exist', () => {
  it('all Iori special keys should be present in FRAME_DATA_CHARS', () => {
    for (const key of ALL_IORI_KEYS) {
      expect(
        FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS],
        `${key} should exist in FRAME_DATA_CHARS`,
      ).toBeDefined();
    }
  });

  it('should have at least 13 IORI_ prefixed special entries', () => {
    const ioriKeys = Object.keys(FRAME_DATA_CHARS).filter(k => k.startsWith('IORI_'));
    expect(ioriKeys.length).toBeGreaterThanOrEqual(13);
  });

  it('should have DM_MAIDEN_MASHER entries', () => {
    expect(FRAME_DATA_CHARS['DM_MAIDEN_MASHER_A']).toBeDefined();
    expect(FRAME_DATA_CHARS['DM_MAIDEN_MASHER_C']).toBeDefined();
    expect(FRAME_DATA_CHARS['SDM_MAIDEN_MASHER']).toBeDefined();
  });
});

// ── Startup ──

describe('Iori frame data -- startup values', () => {
  it('startup should be in range 3-20 frames for all Iori specials', () => {
    for (const key of ALL_IORI_KEYS) {
      const fd = getIoriData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be >= 3`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be <= 20`,
      ).toBeLessThanOrEqual(20);
    }
  });
});

// ── Active ──

describe('Iori frame data -- active values', () => {
  it('active should be in range 2-8 frames for non-DM specials', () => {
    for (const key of IORI_SPECIAL_KEYS) {
      const fd = getIoriData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be >= 2`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be <= 8`,
      ).toBeLessThanOrEqual(8);
    }
  });
});

// ── Recovery ──

describe('Iori frame data -- recovery values', () => {
  it('recovery should be in range 10-35 frames for non-DM specials', () => {
    for (const key of IORI_SPECIAL_KEYS) {
      const fd = getIoriData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 10`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be <= 35`,
      ).toBeLessThanOrEqual(35);
    }
  });
});

// ── Damage ──

describe('Iori frame data -- damage values', () => {
  it('damage should be in range 30-250 for non-SDM specials', () => {
    const nonSDM = ALL_IORI_KEYS.filter(k => k !== 'SDM_MAIDEN_MASHER');
    for (const key of nonSDM) {
      const fd = getIoriData(key);
      expect(
        fd.damage,
        `${key}.damage=${fd.damage} should be >= 30`,
      ).toBeGreaterThanOrEqual(30);
      expect(
        fd.damage,
        `${key}.damage=${fd.damage} should be <= 250`,
      ).toBeLessThanOrEqual(250);
    }
  });

  it('SDM damage should be in range 250-400', () => {
    const sdm = getIoriData('SDM_MAIDEN_MASHER');
    expect(sdm.damage).toBeGreaterThanOrEqual(250);
    expect(sdm.damage).toBeLessThanOrEqual(400);
  });
});

// ── Hitstun vs Blockstun ──

describe('Iori frame data -- hitstun vs blockstun', () => {
  it('hitstun should be greater than blockstun for non-DM specials', () => {
    for (const key of IORI_SPECIAL_KEYS) {
      const fd = getIoriData(key);
      expect(
        fd.hitstun,
        `${key}.hitstun=${fd.hitstun} should be > blockstun=${fd.blockstun}`,
      ).toBeGreaterThan(fd.blockstun);
    }
  });

  it('DM/SDM moves should have hitstun=0 and blockstun=0 (knockdown burst)', () => {
    for (const key of IORI_DM_RUSH_MOVES) {
      const fd = getIoriData(key);
      expect(fd.hitstun, `${key}.hitstun should be 0`).toBe(0);
      expect(fd.blockstun, `${key}.blockstun should be 0`).toBe(0);
    }
  });
});

// ── Pushback ──

describe('Iori frame data -- pushback', () => {
  it('pushback should be > 0 for non-DM specials', () => {
    for (const key of IORI_SPECIAL_KEYS) {
      const fd = getIoriData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('pushback should be 0 for DM/SDM rush moves', () => {
    for (const key of IORI_DM_RUSH_MOVES) {
      const fd = getIoriData(key);
      expect(
        fd.pushback,
        `${key}.pushback=${fd.pushback} should be 0 for DM rush`,
      ).toBe(0);
    }
  });
});

// ── Differentiation from generic templates ──

describe('Iori frame data -- differentiation from generic templates', () => {
  it('Iori Yamibarai should differ from generic SPECIAL_PROJECTILE', () => {
    const a = getIoriData('IORI_YAMIBARAI');
    const c = getIoriData('IORI_YAMIBARAI_C');

    // At least one stat field should differ from the generic template.
    const aDiffers =
      a.startup !== SPECIAL_PROJECTILE.startup ||
      a.active !== SPECIAL_PROJECTILE.active ||
      a.recovery !== SPECIAL_PROJECTILE.recovery ||
      a.damage !== SPECIAL_PROJECTILE.damage;
    const cDiffers =
      c.startup !== SPECIAL_PROJECTILE.startup ||
      c.active !== SPECIAL_PROJECTILE.active ||
      c.recovery !== SPECIAL_PROJECTILE.recovery ||
      c.damage !== SPECIAL_PROJECTILE.damage;

    expect(aDiffers, 'IORI_YAMIBARAI should differ from SPECIAL_PROJECTILE').toBe(true);
    expect(cDiffers, 'IORI_YAMIBARAI_C should differ from SPECIAL_PROJECTILE').toBe(true);
  });

  it('Iori Oniyaki should differ from generic SPECIAL_UPPER', () => {
    const a = getIoriData('IORI_ONIYAKI');
    const c = getIoriData('IORI_ONIYAKI_C');

    const aDiffers =
      a.startup !== SPECIAL_UPPER.startup ||
      a.active !== SPECIAL_UPPER.active ||
      a.recovery !== SPECIAL_UPPER.recovery ||
      a.damage !== SPECIAL_UPPER.damage;
    const cDiffers =
      c.startup !== SPECIAL_UPPER.startup ||
      c.active !== SPECIAL_UPPER.active ||
      c.recovery !== SPECIAL_UPPER.recovery ||
      c.damage !== SPECIAL_UPPER.damage;

    expect(aDiffers, 'IORI_ONIYAKI should differ from SPECIAL_UPPER').toBe(true);
    expect(cDiffers, 'IORI_ONIYAKI_C should differ from SPECIAL_UPPER').toBe(true);
  });

  it('Iori Aoihana (A version 3-hit chain) should have distinct data per hit', () => {
    const h1 = getIoriData('IORI_AOIHANA');
    const h2 = getIoriData('IORI_AOIHANA_2');
    const h3 = getIoriData('IORI_AOIHANA_3');

    // The three hits should not all be identical
    const allSame =
      h1.startup === h2.startup && h2.startup === h3.startup &&
      h1.active === h2.active && h2.active === h3.active &&
      h1.recovery === h2.recovery && h2.recovery === h3.recovery &&
      h1.damage === h2.damage && h2.damage === h3.damage;

    expect(allSame, 'IORI_AOIHANA 1/2/3 should not all be identical').toBe(false);
  });

  it('Iori Aoihana C version should differ from A version on hit 1', () => {
    const aVer = getIoriData('IORI_AOIHANA');
    const cVer = getIoriData('IORI_AOIHANA_C');

    const differs =
      aVer.startup !== cVer.startup ||
      aVer.active !== cVer.active ||
      aVer.recovery !== cVer.recovery ||
      aVer.damage !== cVer.damage;

    expect(differs, 'IORI_AOIHANA_C should differ from IORI_AOIHANA').toBe(true);
  });

  it('Iori DM Maiden Masher should have higher damage than any single special', () => {
    const dm = getIoriData('DM_MAIDEN_MASHER_A');
    const oniyakiC = getIoriData('IORI_ONIYAKI_C');

    expect(
      dm.damage,
      `DM damage (${dm.damage}) should exceed strongest special (${oniyakiC.damage})`,
    ).toBeGreaterThan(oniyakiC.damage);
  });

  it('SDM Maiden Masher should have higher damage than DM version', () => {
    const dm = getIoriData('DM_MAIDEN_MASHER_A');
    const sdm = getIoriData('SDM_MAIDEN_MASHER');

    expect(
      sdm.damage,
      `SDM damage (${sdm.damage}) should exceed DM (${dm.damage})`,
    ).toBeGreaterThan(dm.damage);
  });
});

// ── Knockdown consistency ──

describe('Iori frame data -- knockdown consistency', () => {
  it('third hit of rekka chains should cause knockdown', () => {
    const h3 = getIoriData('IORI_AOIHANA_3');
    const h3c = getIoriData('IORI_AOIHANA_C_3');
    expect(h3.knockdown, 'IORI_AOIHANA_3 should cause knockdown').toBe(true);
    expect(h3c.knockdown, 'IORI_AOIHANA_C_3 should cause knockdown').toBe(true);
  });

  it('Oniyaki should cause knockdown (anti-air DP)', () => {
    const a = getIoriData('IORI_ONIYAKI');
    const c = getIoriData('IORI_ONIYAKI_C');
    expect(a.knockdown, 'IORI_ONIYAKI should cause knockdown').toBe(true);
    expect(c.knockdown, 'IORI_ONIYAKI_C should cause knockdown').toBe(true);
  });

  it('Yamibarai should NOT cause knockdown (projectile)', () => {
    const a = getIoriData('IORI_YAMIBARAI');
    const c = getIoriData('IORI_YAMIBARAI_C');
    expect(a.knockdown, 'IORI_YAMIBARAI should not cause knockdown').toBe(false);
    expect(c.knockdown, 'IORI_YAMIBARAI_C should not cause knockdown').toBe(false);
  });

  it('first hit of rekka chains should NOT cause knockdown', () => {
    const h1 = getIoriData('IORI_AOIHANA');
    const h1c = getIoriData('IORI_AOIHANA_C');
    expect(h1.knockdown, 'IORI_AOIHANA should not cause knockdown').toBe(false);
    expect(h1c.knockdown, 'IORI_AOIHANA_C should not cause knockdown').toBe(false);
  });

  it('Kototsuki should cause knockdown (rush grab)', () => {
    const b = getIoriData('IORI_KOTOTSUKI');
    const d = getIoriData('IORI_KOTOTSUKI_D');
    expect(b.knockdown, 'IORI_KOTOTSUKI should cause knockdown').toBe(true);
    expect(d.knockdown, 'IORI_KOTOTSUKI_D should cause knockdown').toBe(true);
  });
});

// ── Chip damage for projectile and DP moves ──

describe('Iori frame data -- chip damage', () => {
  it('Yamibarai should have chipDamage > 0', () => {
    const a = getIoriData('IORI_YAMIBARAI');
    const c = getIoriData('IORI_YAMIBARAI_C');
    expect(a.chipDamage, 'IORI_YAMIBARAI should have chipDamage').toBeGreaterThan(0);
    expect(c.chipDamage, 'IORI_YAMIBARAI_C should have chipDamage').toBeGreaterThan(0);
  });

  it('Oniyaki should have chipDamage > 0', () => {
    const a = getIoriData('IORI_ONIYAKI');
    const c = getIoriData('IORI_ONIYAKI_C');
    expect(a.chipDamage, 'IORI_ONIYAKI should have chipDamage').toBeGreaterThan(0);
    expect(c.chipDamage, 'IORI_ONIYAKI_C should have chipDamage').toBeGreaterThan(0);
  });

  it('DM/SDM should have chipDamage > 0', () => {
    for (const key of IORI_DM_KEYS) {
      const fd = getIoriData(key);
      expect(fd.chipDamage, `${key} should have chipDamage`).toBeGreaterThan(0);
    }
  });
});
