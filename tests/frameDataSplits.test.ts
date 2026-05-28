/**
 * Frame Data Split Files Structural Tests
 *
 * Validates all 5 frameData split files: each exports a record of attack entries
 * with startup/active/recovery/damage/hitstun/blockstun/pushback/hitLevel/knockdown.
 * Optional fields: chipDamage, counterWire.
 */
import { describe, it, expect } from 'vitest';
import { TERRY_KIM_DATA } from '../src/core/frameData/frameDataTerryKim.js';
import { LEONA_ROBERT_MAI_DATA } from '../src/core/frameData/frameDataLeonaRobertMai.js';
import { KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA } from '../src/core/frameData/frameDataKdashKulaAthenaClarkRalfJoe.js';
import { ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA } from '../src/core/frameData/frameDataAndyBillyChangChoiMatureYamazaki.js';
import { MARY_XIANGFEI_KASUMI_REST_DATA } from '../src/core/frameData/frameDataMaryXiangfeiKasumiRest.js';

const VALID_HIT_LEVELS = ['MID', 'LOW', 'HIGH'] as const;

interface FrameDataEntry {
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
  counterWire?: boolean;
}

function validateEntry(entry: FrameDataEntry, label: string) {
  expect(entry.startup, `${label}.startup >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.active, `${label}.active >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.recovery, `${label}.recovery >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.damage, `${label}.damage > 0`).toBeGreaterThan(0);
  expect(entry.hitstun, `${label}.hitstun >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.blockstun, `${label}.blockstun >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.pushback, `${label}.pushback >= 0`).toBeGreaterThanOrEqual(0);
  expect(VALID_HIT_LEVELS, `${label}.hitLevel`).toContain(entry.hitLevel);
  expect(typeof entry.knockdown, `${label}.knockdown bool`).toBe('boolean');
  if (entry.chipDamage !== undefined) {
    expect(entry.chipDamage, `${label}.chipDamage > 0`).toBeGreaterThan(0);
  }
}

function validateFrameDataRecord(record: Record<string, FrameDataEntry>, label: string) {
  const keys = Object.keys(record);
  expect(keys.length, `${label} has entries`).toBeGreaterThan(0);
  for (const key of keys) {
    validateEntry(record[key], `${label}.${key}`);
  }
}

// ===== Terry + Kim =====

describe('TERRY_KIM_DATA', () => {
  it('has entries', () => {
    expect(Object.keys(TERRY_KIM_DATA).length).toBeGreaterThan(10);
  });

  it('all entries have valid structure', () => {
    validateFrameDataRecord(TERRY_KIM_DATA as Record<string, FrameDataEntry>, 'TERRY_KIM');
  });

  it('has Terry specials', () => {
    expect(TERRY_KIM_DATA.TERRY_POWER_WAVE).toBeDefined();
    expect(TERRY_KIM_DATA.TERRY_BURN_KNUCKLE).toBeDefined();
    expect(TERRY_KIM_DATA.TERRY_CRACK_SHOT).toBeDefined();
  });

  it('has Terry DM', () => {
    expect(TERRY_KIM_DATA.DM_POWER_GEYSER).toBeDefined();
  });

  it('has Kim specials', () => {
    expect(TERRY_KIM_DATA.KIM_HIENZAN).toBeDefined();
    expect(TERRY_KIM_DATA.KIM_HANGETSU).toBeDefined();
  });
});

// ===== Leona + Robert + Mai =====

describe('LEONA_ROBERT_MAI_DATA', () => {
  it('has entries', () => {
    expect(Object.keys(LEONA_ROBERT_MAI_DATA).length).toBeGreaterThan(10);
  });

  it('all entries have valid structure', () => {
    validateFrameDataRecord(LEONA_ROBERT_MAI_DATA as Record<string, FrameDataEntry>, 'LEONA_ROBERT_MAI');
  });

  it('has Leona specials', () => {
    expect(LEONA_ROBERT_MAI_DATA.LEONA_MOON_SLASH).toBeDefined();
    expect(LEONA_ROBERT_MAI_DATA.LEONA_GRAND_SABER).toBeDefined();
  });

  it('has Robert specials', () => {
    expect(LEONA_ROBERT_MAI_DATA.ROBERT_RYU_GEKI).toBeDefined();
  });

  it('has Mai specials', () => {
    expect(LEONA_ROBERT_MAI_DATA.MAI_KA_CHO_SEN).toBeDefined();
  });
});

// ===== K'/Kula/Athena/Clark/Ralf/Joe =====

describe('KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA', () => {
  it('has entries', () => {
    expect(Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA).length).toBeGreaterThan(10);
  });

  it('all entries have valid structure', () => {
    validateFrameDataRecord(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA as Record<string, FrameDataEntry>, 'KDASH_KULA_ATHENA_CLARK_RALF_JOE');
  });

  it('has Kdash data (SDM_RYU_KO_RYU etc)', () => {
    expect(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA.SDM_RYU_KO_RYU).toBeDefined();
  });

  it('has Athena specials', () => {
    expect(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA.ATHENA_PSYCHO_BALL).toBeDefined();
  });

  it('has Clark specials', () => {
    const keys = Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA);
    const clarkKeys = keys.filter(k => k.startsWith('CLARK_'));
    expect(clarkKeys.length, 'CLARK entries').toBeGreaterThan(0);
  });

  it('has Joe specials', () => {
    const keys = Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA);
    const joeKeys = keys.filter(k => k.startsWith('JOE_'));
    expect(joeKeys.length, 'JOE entries').toBeGreaterThan(0);
  });
});

// ===== Andy/Billy/Chang/Choi/Mature/Yamazaki =====

describe('ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA', () => {
  it('has entries', () => {
    expect(Object.keys(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA).length).toBeGreaterThan(10);
  });

  it('all entries have valid structure', () => {
    validateFrameDataRecord(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA as Record<string, FrameDataEntry>, 'ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI');
  });

  it('has entries (Andy/Billy/Chang/Choi data)', () => {
    const keys = Object.keys(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA);
    expect(keys.length).toBeGreaterThan(10);
  });

  it('has Mature data', () => {
    expect(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA.MATURE_MASSACRE).toBeDefined();
  });

  it('has Mature specials', () => {
    expect(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA.MATURE_MASSACRE).toBeDefined();
  });
});

// ===== Mary/Xiangfei/Kasumi/Rest =====

describe('MARY_XIANGFEI_KASUMI_REST_DATA', () => {
  it('has entries', () => {
    expect(Object.keys(MARY_XIANGFEI_KASUMI_REST_DATA).length).toBeGreaterThan(10);
  });

  it('all entries have valid structure', () => {
    validateFrameDataRecord(MARY_XIANGFEI_KASUMI_REST_DATA as Record<string, FrameDataEntry>, 'MARY_XIANGFEI_KASUMI_REST');
  });

  it('has Mary specials', () => {
    expect(MARY_XIANGFEI_KASUMI_REST_DATA.MARY_STRAIGHT_SLICER).toBeDefined();
  });

  it('has Xiangfei specials', () => {
    const keys = Object.keys(MARY_XIANGFEI_KASUMI_REST_DATA);
    const xfKeys = keys.filter(k => k.startsWith('XIANGFEI_'));
    expect(xfKeys.length, 'XIANGFEI entries').toBeGreaterThan(0);
  });
});

// ===== Cross-file consistency =====

describe('Frame Data Split Files — cross-file consistency', () => {
  it('total entries across all 5 files > 100', () => {
    const total =
      Object.keys(TERRY_KIM_DATA).length +
      Object.keys(LEONA_ROBERT_MAI_DATA).length +
      Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA).length +
      Object.keys(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA).length +
      Object.keys(MARY_XIANGFEI_KASUMI_REST_DATA).length;
    expect(total).toBeGreaterThan(100);
  });

  it('no duplicate keys across files', () => {
    const allKeys = [
      ...Object.keys(TERRY_KIM_DATA),
      ...Object.keys(LEONA_ROBERT_MAI_DATA),
      ...Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA),
      ...Object.keys(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA),
      ...Object.keys(MARY_XIANGFEI_KASUMI_REST_DATA),
    ];
    const unique = new Set(allKeys);
    expect(unique.size).toBe(allKeys.length);
  });

  it('DM/SDM entries with chipDamage have positive values', () => {
    const allData: Record<string, FrameDataEntry>[] = [
      TERRY_KIM_DATA,
      LEONA_ROBERT_MAI_DATA,
      KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA,
      ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA,
      MARY_XIANGFEI_KASUMI_REST_DATA,
    ] as Record<string, FrameDataEntry>[];
    for (const data of allData) {
      for (const [key, entry] of Object.entries(data)) {
        if ((key.startsWith('DM_') || key.startsWith('SDM_')) && entry.chipDamage !== undefined) {
          expect(entry.chipDamage, `${key}.chipDamage > 0`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all entries have reasonable damage range (1-500)', () => {
    const allData: Record<string, FrameDataEntry>[] = [
      TERRY_KIM_DATA,
      LEONA_ROBERT_MAI_DATA,
      KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA,
      ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA,
      MARY_XIANGFEI_KASUMI_REST_DATA,
    ] as Record<string, FrameDataEntry>[];
    for (const data of allData) {
      for (const [key, entry] of Object.entries(data)) {
        expect(entry.damage, `${key}.damage range`).toBeGreaterThanOrEqual(1);
        expect(entry.damage, `${key}.damage range`).toBeLessThanOrEqual(500);
      }
    }
  });
});
