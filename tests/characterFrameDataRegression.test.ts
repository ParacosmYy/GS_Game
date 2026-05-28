/**
 * Character Frame Data Regression Tests
 *
 * Validates Kyo, Iori, Ryo character-specific frame data:
 * - Required fields present
 * - Positive numeric values
 * - Valid hitLevel
 * - DM/SDM/HSDM hierarchy (damage, chipDamage escalation)
 * - A/B version vs C version strength comparison
 * - Rekka chain completeness
 * - Cross-character isolation
 */
import { describe, it, expect } from 'vitest';
import { KYO_FRAME_DATA } from '../src/content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../src/content/characters/iori/frameData/ioriFrameData.js';
import { RYO_FRAME_DATA } from '../src/content/characters/ryo/frameData/ryoFrameData.js';

type FrameEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: string;
  knockdown: boolean;
  chipDamage?: number;
};

const VALID_HIT_LEVELS = ['MID', 'HIGH', 'LOW', 'UNBLOCKABLE'];
const REQUIRED_FIELDS: (keyof FrameEntry)[] = [
  'startup', 'active', 'recovery', 'damage',
  'hitstun', 'blockstun', 'pushback', 'hitLevel', 'knockdown',
];

function validateEntry(key: string, entry: FrameEntry) {
  for (const field of REQUIRED_FIELDS) {
    expect(entry[field], `${key}.${field}`).toBeDefined();
  }
  expect(entry.startup, `${key}.startup`).toBeGreaterThan(0);
  expect(entry.active, `${key}.active`).toBeGreaterThan(0);
  expect(entry.recovery, `${key}.recovery`).toBeGreaterThan(0);
  expect(entry.damage, `${key}.damage`).toBeGreaterThan(0);
  expect(entry.pushback, `${key}.pushback`).toBeGreaterThanOrEqual(0);
  expect(VALID_HIT_LEVELS, `${key}.hitLevel`).toContain(entry.hitLevel);
  expect(typeof entry.knockdown, `${key}.knockdown`).toBe('boolean');
  if ('chipDamage' in entry && entry.chipDamage !== undefined && entry.chipDamage > 0) {
    expect(entry.chipDamage, `${key}.chipDamage`).toBeGreaterThan(0);
  }
}

// ════════════════════════════════════════════════════════════════
// Kyo Frame Data
// ════════════════════════════════════════════════════════════════

describe('Kyo Frame Data', () => {
  const entries = Object.entries(KYO_FRAME_DATA) as [string, FrameEntry][];

  it('has at least 20 entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(20);
  });

  it('all entries have valid structure', () => {
    for (const [key, entry] of entries) {
      validateEntry(key, entry);
    }
  });

  it('all startup values are at least 4', () => {
    for (const [key, entry] of entries) {
      expect(entry.startup, `${key}.startup`).toBeGreaterThanOrEqual(4);
    }
  });

  it('total frame count is reasonable (10-120)', () => {
    for (const [key, entry] of entries) {
      const total = entry.startup + entry.active + entry.recovery;
      expect(total, `${key} total`).toBeGreaterThanOrEqual(10);
      expect(total, `${key} total`).toBeLessThanOrEqual(120);
    }
  });

  it('has command normals', () => {
    const keys = Object.keys(KYO_FRAME_DATA);
    expect(keys).toContain('CMD_GOFU_YOU');
    expect(keys).toContain('CMD_88SHIKI');
    expect(keys).toContain('CMD_NARAKU');
  });

  it('has specials', () => {
    const keys = Object.keys(KYO_FRAME_DATA);
    expect(keys).toContain('KYO_ONIYAKI');
    expect(keys).toContain('KYO_ONIYAKI_C');
    expect(keys).toContain('KYO_YAMIBARAI');
    expect(keys).toContain('KYO_YAMIBARAI_C');
    expect(keys).toContain('KYO_75KAI');
    expect(keys).toContain('KYO_RED_KICK');
  });

  it('has Aragami rekka chain', () => {
    const keys = Object.keys(KYO_FRAME_DATA);
    expect(keys).toContain('KYO_ARAGAMI');
    expect(keys).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(keys).toContain('KYO_ARAGAMI_YANOSABI');
    expect(keys).toContain('KYO_NANASE');
    expect(keys).toContain('KYO_KOTO_TSUKI');
    expect(keys).toContain('KYO_YAKISOGI');
  });

  it('has Dokugami rekka chain', () => {
    const keys = Object.keys(KYO_FRAME_DATA);
    expect(keys).toContain('KYO_DOKUGAMI');
    expect(keys).toContain('KYO_TSUMIYOMI');
    expect(keys).toContain('KYO_BATSUYOMI');
  });

  it('has DM/SDM/HSDM', () => {
    const keys = Object.keys(KYO_FRAME_DATA);
    expect(keys).toContain('DM_OROCHINAGI');
    expect(keys).toContain('SDM_OROCHINAGI');
    expect(keys).toContain('HSDM_OROCHINAGI');
  });

  it('C versions are stronger than A versions', () => {
    const oniA = KYO_FRAME_DATA.KYO_ONIYAKI;
    const oniC = KYO_FRAME_DATA.KYO_ONIYAKI_C;
    expect(oniC.damage).toBeGreaterThan(oniA.damage);
    expect(oniC.active).toBeGreaterThan(oniA.active);

    const yamiA = KYO_FRAME_DATA.KYO_YAMIBARAI;
    const yamiC = KYO_FRAME_DATA.KYO_YAMIBARAI_C;
    expect(yamiC.damage).toBeGreaterThan(yamiA.damage);
  });

  it('SDM damage > DM damage', () => {
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI.damage).toBeGreaterThan(KYO_FRAME_DATA.DM_OROCHINAGI.damage);
  });

  it('HSDM damage > SDM damage', () => {
    expect(KYO_FRAME_DATA.HSDM_OROCHINAGI.damage).toBeGreaterThan(KYO_FRAME_DATA.SDM_OROCHINAGI.damage);
  });

  it('SDM chipDamage > DM chipDamage', () => {
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI.chipDamage!).toBeGreaterThan(KYO_FRAME_DATA.DM_OROCHINAGI.chipDamage!);
  });

  it('HSDM chipDamage > SDM chipDamage', () => {
    expect(KYO_FRAME_DATA.HSDM_OROCHINAGI.chipDamage!).toBeGreaterThan(KYO_FRAME_DATA.SDM_OROCHINAGI.chipDamage!);
  });

  it('DM/SDM have zero hitstun', () => {
    expect(KYO_FRAME_DATA.DM_OROCHINAGI.hitstun).toBe(0);
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI.hitstun).toBe(0);
  });

  it('overhead moves have HIGH hitLevel', () => {
    expect(KYO_FRAME_DATA.CMD_GOFU_YOU.hitLevel).toBe('HIGH');
    expect(KYO_FRAME_DATA.KYO_ARAGAMI_YANOSABI.hitLevel).toBe('HIGH');
    expect(KYO_FRAME_DATA.KYO_YAKISOGI.hitLevel).toBe('HIGH');
  });

  it('low moves have LOW hitLevel', () => {
    expect(KYO_FRAME_DATA.CMD_88SHIKI.hitLevel).toBe('LOW');
  });

  it('knockdown moves are marked correctly', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI.knockdown).toBe(true);
    expect(KYO_FRAME_DATA.KYO_RED_KICK.knockdown).toBe(true);
    expect(KYO_FRAME_DATA.DM_OROCHINAGI.knockdown).toBe(true);
  });

  it('non-knockdown moves are marked correctly', () => {
    expect(KYO_FRAME_DATA.KYO_75KAI.knockdown).toBe(false);
    expect(KYO_FRAME_DATA.KYO_ARAGAMI.knockdown).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Iori Frame Data
// ════════════════════════════════════════════════════════════════

describe('Iori Frame Data', () => {
  const entries = Object.entries(IORI_FRAME_DATA) as [string, FrameEntry][];

  it('has at least 19 entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(19);
  });

  it('all entries have valid structure', () => {
    for (const [key, entry] of entries) {
      validateEntry(key, entry);
    }
  });

  it('total frame count is reasonable', () => {
    for (const [key, entry] of entries) {
      const total = entry.startup + entry.active + entry.recovery;
      expect(total, `${key} total`).toBeGreaterThanOrEqual(10);
      expect(total, `${key} total`).toBeLessThanOrEqual(120);
    }
  });

  it('has Aoihana A chain', () => {
    const keys = Object.keys(IORI_FRAME_DATA);
    expect(keys).toContain('IORI_AOIHANA');
    expect(keys).toContain('IORI_AOIHANA_2');
    expect(keys).toContain('IORI_AOIHANA_3');
  });

  it('has Aoihana C chain', () => {
    const keys = Object.keys(IORI_FRAME_DATA);
    expect(keys).toContain('IORI_AOIHANA_C');
    expect(keys).toContain('IORI_AOIHANA_C_2');
    expect(keys).toContain('IORI_AOIHANA_C_3');
  });

  it('has specials', () => {
    const keys = Object.keys(IORI_FRAME_DATA);
    expect(keys).toContain('IORI_ONIYAKI');
    expect(keys).toContain('IORI_ONIYAKI_C');
    expect(keys).toContain('IORI_YAMIBARAI');
    expect(keys).toContain('IORI_YAMIBARAI_C');
    expect(keys).toContain('IORI_KOTOTSUKI');
    expect(keys).toContain('IORI_KOTOTSUKI_D');
    expect(keys).toContain('IORI_KUZUKAZE');
  });

  it('has command normals', () => {
    const keys = Object.keys(IORI_FRAME_DATA);
    expect(keys).toContain('IORI_YUMEYUMI');
    expect(keys).toContain('IORI_KATANUGI');
    expect(keys).toContain('IORI_YUKIWARUI');
  });

  it('has DM/SDM/HSDM', () => {
    const keys = Object.keys(IORI_FRAME_DATA);
    expect(keys).toContain('DM_YATAGARASU');
    expect(keys).toContain('SDM_YATAGARASU');
    expect(keys).toContain('HSDM_YAOTOME');
  });

  it('C versions are stronger than A versions', () => {
    const oniA = IORI_FRAME_DATA.IORI_ONIYAKI;
    const oniC = IORI_FRAME_DATA.IORI_ONIYAKI_C;
    expect(oniC.damage).toBeGreaterThan(oniA.damage);
    expect(oniC.active).toBeGreaterThan(oniA.active);

    const yamiA = IORI_FRAME_DATA.IORI_YAMIBARAI;
    const yamiC = IORI_FRAME_DATA.IORI_YAMIBARAI_C;
    expect(yamiC.damage).toBeGreaterThan(yamiA.damage);
  });

  it('Aoihana C chain does more damage than A chain', () => {
    expect(IORI_FRAME_DATA.IORI_AOIHANA_C.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_AOIHANA.damage);
  });

  it('D version specials are stronger than B versions', () => {
    expect(IORI_FRAME_DATA.IORI_KOTOTSUKI_D.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_KOTOTSUKI.damage);
    expect(IORI_FRAME_DATA.IORI_KOTOTSUKI_D.active).toBeGreaterThanOrEqual(IORI_FRAME_DATA.IORI_KOTOTSUKI.active);
  });

  it('SDM damage > DM damage', () => {
    expect(IORI_FRAME_DATA.SDM_YATAGARASU.damage).toBeGreaterThan(IORI_FRAME_DATA.DM_YATAGARASU.damage);
  });

  it('HSDM damage > SDM damage', () => {
    expect(IORI_FRAME_DATA.HSDM_YAOTOME.damage).toBeGreaterThan(IORI_FRAME_DATA.SDM_YATAGARASU.damage);
  });

  it('DM/SDM have zero hitstun', () => {
    expect(IORI_FRAME_DATA.DM_YATAGARASU.hitstun).toBe(0);
    expect(IORI_FRAME_DATA.SDM_YATAGARASU.hitstun).toBe(0);
  });

  it('HSDM has non-zero hitstun (different from DM/SDM)', () => {
    expect(IORI_FRAME_DATA.HSDM_YAOTOME.hitstun).toBeGreaterThan(0);
  });

  it('chipDamage escalation across DM tiers', () => {
    expect(IORI_FRAME_DATA.SDM_YATAGARASU.chipDamage!).toBeGreaterThan(IORI_FRAME_DATA.DM_YATAGARASU.chipDamage!);
    expect(IORI_FRAME_DATA.HSDM_YAOTOME.chipDamage!).toBeGreaterThan(IORI_FRAME_DATA.SDM_YATAGARASU.chipDamage!);
  });

  it('overhead command normal', () => {
    expect(IORI_FRAME_DATA.IORI_YUMEYUMI.hitLevel).toBe('HIGH');
  });

  it('rekka chain final hits cause knockdown', () => {
    expect(IORI_FRAME_DATA.IORI_AOIHANA_3.knockdown).toBe(true);
    expect(IORI_FRAME_DATA.IORI_AOIHANA_C_3.knockdown).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Ryo Frame Data
// ════════════════════════════════════════════════════════════════

describe('Ryo Frame Data', () => {
  const entries = Object.entries(RYO_FRAME_DATA) as [string, FrameEntry][];

  it('has at least 17 entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(17);
  });

  it('all entries have valid structure', () => {
    for (const [key, entry] of entries) {
      validateEntry(key, entry);
    }
  });

  it('has command normals', () => {
    const keys = Object.keys(RYO_FRAME_DATA);
    expect(keys).toContain('RYO_TSURIZAO');
    expect(keys).toContain('RYO_ORISHI');
  });

  it('has specials', () => {
    const keys = Object.keys(RYO_FRAME_DATA);
    expect(keys).toContain('RYO_KOOU');
    expect(keys).toContain('RYO_KOOU_C');
    expect(keys).toContain('RYO_KO_HOU');
    expect(keys).toContain('RYO_KO_HOU_C');
    expect(keys).toContain('RYO_HIEN');
    expect(keys).toContain('RYO_ZANRETSU_KEN');
  });

  it('has DMs', () => {
    const keys = Object.keys(RYO_FRAME_DATA);
    expect(keys).toContain('DM_TEN_HA_OU');
    expect(keys).toContain('DM_RYUKO_RANBU');
  });

  it('has SDM entries', () => {
    const keys = Object.keys(RYO_FRAME_DATA);
    expect(keys).toContain('SDM_RYUKO_RANBU');
    expect(keys).toContain('SDM_TEN_HA_OU');
  });

  it('has HSDM', () => {
    const keys = Object.keys(RYO_FRAME_DATA);
    expect(keys).toContain('HSDM_RYUKO_RANBU');
  });

  it('C versions are stronger than A versions', () => {
    expect(RYO_FRAME_DATA.RYO_KOOU_C.damage).toBeGreaterThan(RYO_FRAME_DATA.RYO_KOOU.damage);
    expect(RYO_FRAME_DATA.RYO_KO_HOU_C.damage).toBeGreaterThan(RYO_FRAME_DATA.RYO_KO_HOU.damage);
    expect(RYO_FRAME_DATA.RYO_KO_HOU_C.active).toBeGreaterThan(RYO_FRAME_DATA.RYO_KO_HOU.active);
  });

  it('SDM damage > DM damage', () => {
    expect(RYO_FRAME_DATA.SDM_RYUKO_RANBU.damage).toBeGreaterThan(RYO_FRAME_DATA.DM_RYUKO_RANBU.damage);
    expect(RYO_FRAME_DATA.SDM_TEN_HA_OU.damage).toBeGreaterThan(RYO_FRAME_DATA.DM_TEN_HA_OU.damage);
  });

  it('HSDM damage > SDM damage', () => {
    expect(RYO_FRAME_DATA.HSDM_RYUKO_RANBU.damage).toBeGreaterThan(RYO_FRAME_DATA.SDM_RYUKO_RANBU.damage);
  });

  it('chipDamage escalation across DM tiers', () => {
    expect(RYO_FRAME_DATA.SDM_RYUKO_RANBU.chipDamage!).toBeGreaterThan(RYO_FRAME_DATA.DM_RYUKO_RANBU.chipDamage!);
    expect(RYO_FRAME_DATA.HSDM_RYUKO_RANBU.chipDamage!).toBeGreaterThan(RYO_FRAME_DATA.SDM_RYUKO_RANBU.chipDamage!);
  });

  it('overhead command normal', () => {
    expect(RYO_FRAME_DATA.RYO_TSURIZAO.hitLevel).toBe('HIGH');
  });

  it('low command normal', () => {
    expect(RYO_FRAME_DATA.RYO_ORISHI.hitLevel).toBe('LOW');
  });

  it('DP moves cause knockdown', () => {
    expect(RYO_FRAME_DATA.RYO_KO_HOU.knockdown).toBe(true);
    expect(RYO_FRAME_DATA.RYO_KO_HOU_C.knockdown).toBe(true);
  });

  it('DMs have zero hitstun', () => {
    expect(RYO_FRAME_DATA.DM_TEN_HA_OU.hitstun).toBe(0);
    expect(RYO_FRAME_DATA.DM_RYUKO_RANBU.hitstun).toBe(0);
    expect(RYO_FRAME_DATA.SDM_RYUKO_RANBU.hitstun).toBe(0);
  });

  it('HSDM has non-zero hitstun', () => {
    expect(RYO_FRAME_DATA.HSDM_RYUKO_RANBU.hitstun).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Validation
// ════════════════════════════════════════════════════════════════

describe('Cross-Character Frame Data', () => {
  it('no overlapping keys between characters', () => {
    const kyoKeys = new Set(Object.keys(KYO_FRAME_DATA));
    const ioriKeys = new Set(Object.keys(IORI_FRAME_DATA));
    const ryoKeys = new Set(Object.keys(RYO_FRAME_DATA));
    for (const key of kyoKeys) {
      expect(ioriKeys.has(key), `Kyo/Iori overlap: ${key}`).toBe(false);
      expect(ryoKeys.has(key), `Kyo/Ryo overlap: ${key}`).toBe(false);
    }
    for (const key of ioriKeys) {
      expect(ryoKeys.has(key), `Iori/Ryo overlap: ${key}`).toBe(false);
    }
  });

  it('all DMs have chipDamage', () => {
    const allData = { ...KYO_FRAME_DATA, ...IORI_FRAME_DATA, ...RYO_FRAME_DATA };
    for (const [key, entry] of Object.entries(allData) as [string, FrameEntry][]) {
      if (key.startsWith('DM_') || key.startsWith('SDM_') || key.startsWith('HSDM_')) {
        expect(entry.chipDamage, `${key}.chipDamage`).toBeGreaterThan(0);
      }
    }
  });

  it('total entries across all 3 characters > 55', () => {
    const total = Object.keys(KYO_FRAME_DATA).length +
      Object.keys(IORI_FRAME_DATA).length +
      Object.keys(RYO_FRAME_DATA).length;
    expect(total).toBeGreaterThan(55);
  });
});
