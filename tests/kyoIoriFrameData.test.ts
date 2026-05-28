/**
 * Kyo / Iori Frame Data Regression Test
 * Verifies all frame data entries have valid startup/active/recovery/damage and correct hierarchy.
 */
import { describe, it, expect } from 'vitest';
import { KYO_FRAME_DATA } from '../src/content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../src/content/characters/iori/frameData/ioriFrameData.js';

interface FrameEntry {
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
}

const KYO_KEYS = Object.keys(KYO_FRAME_DATA) as (keyof typeof KYO_FRAME_DATA)[];
const IORI_KEYS = Object.keys(IORI_FRAME_DATA) as (keyof typeof IORI_FRAME_DATA)[];

function expectValidFrame(entry: FrameEntry, label: string) {
  expect(entry.startup, `${label} startup`).toBeGreaterThan(0);
  expect(entry.active, `${label} active`).toBeGreaterThan(0);
  expect(entry.recovery, `${label} recovery`).toBeGreaterThan(0);
  expect(entry.damage, `${label} damage`).toBeGreaterThan(0);
  // DM/SDM/HSDM may have hitstun=0 for cinematic sequences
  if (!label.includes('DM_') && !label.includes('SDM_') && !label.includes('HSDM_')) {
    expect(entry.hitstun, `${label} hitstun`).toBeGreaterThan(0);
    expect(entry.blockstun, `${label} blockstun`).toBeGreaterThan(0);
  }
  expect(entry.pushback, `${label} pushback`).toBeGreaterThanOrEqual(0);
  expect(entry.hitLevel, `${label} hitLevel`).toBeTruthy();
}

describe('Kyo Frame Data', () => {
  it('has at least 19 entries', () => {
    expect(KYO_KEYS.length).toBeGreaterThanOrEqual(19);
  });

  it('all entries have valid frame structure', () => {
    for (const key of KYO_KEYS) {
      expectValidFrame((KYO_FRAME_DATA as any)[key] as FrameEntry, `KYO ${key}`);
    }
  });

  it('Oniyaki C has more damage than Oniyaki A', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI_C.damage).toBeGreaterThan(KYO_FRAME_DATA.KYO_ONIYAKI.damage);
  });

  it('Oniyaki C has more active frames than A', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI_C.active).toBeGreaterThan(KYO_FRAME_DATA.KYO_ONIYAKI.active);
  });

  it('Yamibarai C has more damage than A', () => {
    expect(KYO_FRAME_DATA.KYO_YAMIBARAI_C.damage).toBeGreaterThan(KYO_FRAME_DATA.KYO_YAMIBARAI.damage);
  });

  it('DM has more damage than specials', () => {
    const dmDmg = KYO_FRAME_DATA.DM_OROCHINAGI.damage;
    for (const key of ['KYO_ONIYAKI', 'KYO_YAMIBARAI', 'KYO_75KAI'] as const) {
      expect(dmDmg, `DM > ${key}`).toBeGreaterThan((KYO_FRAME_DATA as any)[key].damage);
    }
  });

  it('SDM has more damage than DM', () => {
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI.damage).toBeGreaterThan(KYO_FRAME_DATA.DM_OROCHINAGI.damage);
  });

  it('HSDM has most damage', () => {
    expect(KYO_FRAME_DATA.HSDM_OROCHINAGI.damage).toBeGreaterThan(KYO_FRAME_DATA.SDM_OROCHINAGI.damage);
  });

  it('knockdown moves are correctly flagged', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI.knockdown).toBe(true);
    expect(KYO_FRAME_DATA.KYO_ONIYAKI_C.knockdown).toBe(true);
    expect(KYO_FRAME_DATA.KYO_RED_KICK.knockdown).toBe(true);
    expect(KYO_FRAME_DATA.KYO_75KAI_2.knockdown).toBe(true);
  });

  it('non-knockdown moves are correctly flagged', () => {
    expect(KYO_FRAME_DATA.KYO_YAMIBARAI.knockdown).toBe(false);
    expect(KYO_FRAME_DATA.KYO_75KAI.knockdown).toBe(false);
  });

  it('command normals have startup < 20', () => {
    expect(KYO_FRAME_DATA.CMD_GOFU_YOU.startup).toBeLessThan(20);
    expect(KYO_FRAME_DATA.CMD_NARAKU.startup).toBeLessThan(20);
  });

  it('hitstun > blockstun for non-DM entries', () => {
    for (const key of KYO_KEYS) {
      const entry = (KYO_FRAME_DATA as any)[key] as FrameEntry;
      if (key.startsWith('DM_') || key.startsWith('SDM_') || key.startsWith('HSDM_')) continue;
      expect(entry.hitstun, `${key} hitstun > blockstun`).toBeGreaterThan(entry.blockstun);
    }
  });
});

describe('Iori Frame Data', () => {
  it('has at least 15 entries', () => {
    expect(IORI_KEYS.length).toBeGreaterThanOrEqual(15);
  });

  it('all entries have valid frame structure', () => {
    for (const key of IORI_KEYS) {
      expectValidFrame((IORI_FRAME_DATA as any)[key] as FrameEntry, `IORI ${key}`);
    }
  });

  it('Oniyaki C has more damage than Oniyaki A', () => {
    expect(IORI_FRAME_DATA.IORI_ONIYAKI_C.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_ONIYAKI.damage);
  });

  it('Oniyaki C has more active frames than A', () => {
    expect(IORI_FRAME_DATA.IORI_ONIYAKI_C.active).toBeGreaterThan(IORI_FRAME_DATA.IORI_ONIYAKI.active);
  });

  it('Yamibarai C has more damage than A', () => {
    expect(IORI_FRAME_DATA.IORI_YAMIBARAI_C.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_YAMIBARAI.damage);
  });

  it('DM has more damage than specials', () => {
    const dmDmg = IORI_FRAME_DATA.DM_YATAGARASU.damage;
    for (const key of ['IORI_ONIYAKI', 'IORI_YAMIBARAI', 'IORI_AOIHANA'] as const) {
      expect(dmDmg, `DM > ${key}`).toBeGreaterThan((IORI_FRAME_DATA as any)[key].damage);
    }
  });

  it('SDM has more damage than DM', () => {
    expect(IORI_FRAME_DATA.SDM_YATAGARASU.damage).toBeGreaterThan(IORI_FRAME_DATA.DM_YATAGARASU.damage);
  });

  it('HSDM has most damage', () => {
    expect(IORI_FRAME_DATA.HSDM_YAOTOME.damage).toBeGreaterThan(IORI_FRAME_DATA.SDM_YATAGARASU.damage);
  });

  it('knockdown moves are correctly flagged', () => {
    expect(IORI_FRAME_DATA.IORI_ONIYAKI.knockdown).toBe(true);
    expect(IORI_FRAME_DATA.IORI_ONIYAKI_C.knockdown).toBe(true);
  });

  it('hitstun > blockstun for non-DM entries', () => {
    for (const key of IORI_KEYS) {
      const entry = (IORI_FRAME_DATA as any)[key] as FrameEntry;
      if (key.startsWith('DM_') || key.startsWith('SDM_') || key.startsWith('HSDM_')) continue;
      expect(entry.hitstun, `${key} hitstun > blockstun`).toBeGreaterThan(entry.blockstun);
    }
  });

  it('Kuzukaze is not a knockdown', () => {
    expect(IORI_FRAME_DATA.IORI_KUZUKAZE.knockdown).toBe(false);
  });
});
