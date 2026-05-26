/**
 * Frame Data Consolidated Tests
 *
 * Merged from: frameData.test.ts, frameDataPrecision.test.ts,
 *   frameDataValidation.test.ts, frameDataConsistency.test.ts
 *
 * Covers: completeness, sanity bounds, hitstun/blockstun relationships,
 * damage hierarchy, SDM/DM tier ordering, chip damage, and hit level validity.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';

type HitLevel = 'HIGH' | 'LOW' | 'MID' | 'UNBLOCKABLE';

interface FrameDataEntry {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: HitLevel;
  knockdown: boolean;
  chipDamage?: number;
  counterWire?: boolean;
  counterOnly?: boolean;
}

const VALID_HIT_LEVELS = new Set<string>(['HIGH', 'LOW', 'MID', 'UNBLOCKABLE']);
const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];

const isSDMorHSDM = (n: string) => n.startsWith('SDM_') || n.startsWith('HSDM_');
const isDM = (n: string) => n.startsWith('DM_');
const isSuper = (n: string) => isDM(n) || isSDMorHSDM(n);

// ── 1. Completeness ──────────────────────────────────────────
describe('Frame Data Completeness', () => {
  it('should have >= 50 entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(50);
  });

  const requiredNormals = [
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD', 'THROW', 'THROW_FORWARD', 'THROW_BACK',
  ];
  it('basic normals and throws should exist', () => {
    for (const atk of requiredNormals) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} missing`).toBeDefined();
    }
  });

  const characterSpecials = [
    'KYO_75KAI', 'KYO_ONIYAKI', 'KYO_YAMIBARAI',
    'IORI_AOIHANA', 'IORI_YAMIBARAI', 'IORI_ONIYAKI',
    'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE',
    'KIM_HIENZAN', 'KIM_HANGETSU',
  ];
  it('key character specials should exist', () => {
    for (const atk of characterSpecials) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} missing`).toBeDefined();
    }
  });

  const dmAttacks = ['DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_POWER_GEYSER', 'DM_PHOENIX_KICK'];
  it('DM supers should exist and have damage >= 150', () => {
    for (const atk of dmAttacks) {
      const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
      expect(fd, `${atk} missing`).toBeDefined();
      expect(fd.damage, `${atk}.damage >= 150`).toBeGreaterThanOrEqual(150);
    }
  });
});

// ── 2. Sanity Bounds ─────────────────────────────────────────
describe('Frame Data Sanity Bounds', () => {
  it('startup: 2-30 for non-SDM/HSDM', () => {
    const bad = entries.filter(([n, fd]) => !isSDMorHSDM(n) && (fd.startup < 2 || fd.startup > 30));
    expect(bad.map(([n]) => n), 'startup out of range').toEqual([]);
  });

  it('active >= 1 and recovery >= 1 (except JUMP_ recovery=0)', () => {
    const badActive = entries.filter(([, fd]) => fd.active < 1);
    const badRecovery = entries.filter(([n, fd]) => !n.startsWith('JUMP_') && fd.recovery < 1);
    expect(badActive.map(([n]) => n), 'active < 1').toEqual([]);
    expect(badRecovery.map(([n]) => n), 'recovery < 1').toEqual([]);
  });

  it('damage: 1-300 for non-SDM/HSDM, >= 1 for all', () => {
    const overDmg = entries.filter(([n, fd]) => !isSDMorHSDM(n) && fd.damage > 300);
    const zeroDmg = entries.filter(([, fd]) => fd.damage < 1);
    expect(overDmg.map(([n]) => n), 'non-SDM damage > 300').toEqual([]);
    expect(zeroDmg.map(([n]) => n), 'damage < 1').toEqual([]);
  });

  it('startup + active + recovery >= 4 for all entries', () => {
    const bad = entries.filter(([, fd]) => fd.startup + fd.active + fd.recovery < 4);
    expect(bad.map(([n]) => n), 'total frames < 4').toEqual([]);
  });
});

// ── 3. Hitstun / Blockstun ───────────────────────────────────
describe('Hitstun / Blockstun Relationships', () => {
  const knownExceptions = new Set([
    'JUMP_C', 'JUMP_D',
    'YAMAZAKI_HEBI_TSUKAI_U', 'YAMAZAKI_HEBI_TSUKAI_M', 'YAMAZAKI_HEBI_TSUKAI_L',
  ]);

  it('hitstun >= blockstun (except known KOF exceptions)', () => {
    const bad = entries.filter(([n, fd]) =>
      fd.hitstun > 0 && !knownExceptions.has(n) && fd.hitstun < fd.blockstun
    );
    expect(bad.map(([n]) => n), 'hitstun < blockstun').toEqual([]);
  });

  it('hitstun <= 60 (reasonable upper bound)', () => {
    const bad = entries.filter(([, fd]) => fd.hitstun > 60);
    expect(bad.map(([n]) => n), 'hitstun > 60').toEqual([]);
  });
});

// ── 4. SDM/DM Hierarchy ──────────────────────────────────────
describe('SDM/HSDM vs DM Hierarchy', () => {
  function getBase(name: string): string {
    return name.replace(/_[ABCD]$/, '').replace(/_EX$/, '').replace(/^(DM|SDM|HSDM)_/, '');
  }

  it('SDM/HSDM damage >= DM damage for same base move', () => {
    const tiers: Record<string, { dm: number[]; sdm: number[] }> = {};
    for (const [n, fd] of entries) {
      const base = getBase(n);
      if (!tiers[base]) tiers[base] = { dm: [], sdm: [] };
      if (n.startsWith('DM_')) tiers[base].dm.push(fd.damage);
      else if (isSDMorHSDM(n)) tiers[base].sdm.push(fd.damage);
    }
    const bad = Object.entries(tiers)
      .filter(([, d]) => d.dm.length > 0 && d.sdm.length > 0)
      .filter(([, d]) => Math.min(...d.sdm) < Math.max(...d.dm));
    expect(bad.map(([b]) => b), 'SDM damage < DM damage').toEqual([]);
  });

  it('SDM/HSDM chipDamage >= DM chipDamage for same base', () => {
    const tiers: Record<string, { dm: number[]; sdm: number[] }> = {};
    for (const [n, fd] of entries) {
      if (fd.chipDamage === undefined) continue;
      const base = getBase(n);
      if (!tiers[base]) tiers[base] = { dm: [], sdm: [] };
      if (n.startsWith('DM_')) tiers[base].dm.push(fd.chipDamage);
      else if (isSDMorHSDM(n)) tiers[base].sdm.push(fd.chipDamage);
    }
    const bad = Object.entries(tiers)
      .filter(([, d]) => d.dm.length > 0 && d.sdm.length > 0)
      .filter(([, d]) => Math.min(...d.sdm) < Math.max(...d.dm));
    expect(bad.map(([b]) => b), 'SDM chip < DM chip').toEqual([]);
  });
});

// ── 5. Chip Damage & Knockdown ───────────────────────────────
describe('Chip Damage and Knockdown Consistency', () => {
  it('chipDamage <= damage when defined', () => {
    const bad = entries.filter(([, fd]) => fd.chipDamage !== undefined && fd.chipDamage > fd.damage);
    expect(bad.map(([n]) => n), 'chipDamage > damage').toEqual([]);
  });

  it('counterWire implies knockdown', () => {
    const bad = entries.filter(([, fd]) => fd.counterWire && !fd.knockdown);
    expect(bad.map(([n]) => n), 'counterWire without knockdown').toEqual([]);
  });

  it('all hitLevel values are valid', () => {
    const bad = entries.filter(([, fd]) => !VALID_HIT_LEVELS.has(fd.hitLevel));
    expect(bad.map(([n]) => n), 'invalid hitLevel').toEqual([]);
  });

  it('LOW attacks have blockstun > 0', () => {
    const bad = entries.filter(([, fd]) => fd.hitLevel === 'LOW' && fd.blockstun <= 0);
    expect(bad.map(([n]) => n), 'LOW with blockstun <= 0').toEqual([]);
  });
});
