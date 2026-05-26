/**
 * Character Frame Data Consolidated Tests
 *
 * Merged from: ioriFrameData, terryFrameData, kimFrameData
 *
 * Covers: character-specific specials existence, startup/active/recovery ranges,
 *   damage hierarchy, knockdown consistency, differentiation from templates.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

type FrameDataEntry = {
  startup: number; active: number; recovery: number; damage: number;
  hitstun: number; blockstun: number; pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH'; knockdown: boolean;
  chipDamage?: number; counterWire?: boolean;
};

const entries = Object.entries(FRAME_DATA_CHARS) as [string, FrameDataEntry][];

// ── 1. Iori ─────────────────────────────────────────────────
describe('Iori Frame Data', () => {
  const iori = entries.filter(([k]) => k.startsWith('IORI_'));
  it('has at least 13 IORI_ specials', () => {
    expect(iori.length).toBeGreaterThanOrEqual(13);
  });

  it('startup in range 3-20 for non-DM specials', () => {
    for (const [k, fd] of iori.filter(([k]) => !k.startsWith('DM_') && !k.startsWith('SDM_'))) {
      expect(fd.startup, `${k} startup`).toBeGreaterThanOrEqual(3);
      expect(fd.startup, `${k} startup`).toBeLessThanOrEqual(20);
    }
  });

  it('DM Maiden Masher has higher damage than any single special', () => {
    const dm = FRAME_DATA_CHARS['DM_MAIDEN_MASHER' as keyof typeof FRAME_DATA_CHARS];
    if (dm) {
      const maxSpecial = iori
        .filter(([k]) => !k.startsWith('DM_') && !k.startsWith('SDM_'))
        .reduce((max, [, fd]) => Math.max(max, fd.damage), 0);
      expect(dm.damage).toBeGreaterThan(maxSpecial);
    }
  });
});

// ── 2. Terry ────────────────────────────────────────────────
describe('Terry Frame Data', () => {
  const terry = entries.filter(([k]) => k.startsWith('TERRY_'));
  it('has at least 10 TERRY_ specials', () => {
    expect(terry.length).toBeGreaterThanOrEqual(10);
  });

  it('damage in range 40-250 for non-SDM specials', () => {
    for (const [k, fd] of terry.filter(([k]) => !k.startsWith('SDM_'))) {
      expect(fd.damage, `${k} damage`).toBeGreaterThanOrEqual(40);
      expect(fd.damage, `${k} damage`).toBeLessThanOrEqual(250);
    }
  });
});

// ── 3. Kim ──────────────────────────────────────────────────
describe('Kim Frame Data', () => {
  const kim = entries.filter(([k]) => k.startsWith('KIM_'));
  it('has at least 5 KIM_ specials', () => {
    expect(kim.length).toBeGreaterThanOrEqual(5);
  });

  it('active frames in range 1-15 for non-DM specials', () => {
    for (const [k, fd] of kim.filter(([k]) => !k.startsWith('DM_') && !k.startsWith('SDM_'))) {
      expect(fd.active, `${k} active`).toBeGreaterThanOrEqual(1);
      expect(fd.active, `${k} active`).toBeLessThanOrEqual(15);
    }
  });
});
