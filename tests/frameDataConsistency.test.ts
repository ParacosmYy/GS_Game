/**
 * Frame Data Consistency Audit
 *
 * Audits all 490 frame data entries across FRAME_DATA_GENERIC and FRAME_DATA_CHARS
 * for internal consistency, sanity bounds, and relationship constraints.
 *
 * Rules source: CLAUDE.md Section 10 (打击感方向), frame data conventions from
 * Dream Cancel Wiki / SuperCombo Wiki KOF2002 reference data.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';

// ── Types ──
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
}

// ── Helpers ──
const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];
const VALID_HIT_LEVELS: Set<string> = new Set(['HIGH', 'LOW', 'MID', 'UNBLOCKABLE']);

/** Check if an entry name indicates a super move (DM / SDM / HSDM) */
function isSuper(name: string): boolean {
  return name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
}

/** Check if an entry name indicates an SDM or HSDM (strongest supers) */
function isSDMorHSDM(name: string): boolean {
  return name.startsWith('SDM_') || name.startsWith('HSDM_');
}

/** Check if an entry looks like a throw (generic throws or command grabs with blockstun=0) */
function isThrow(name: string, fd: FrameDataEntry): boolean {
  if (['THROW', 'THROW_FORWARD', 'THROW_BACK'].includes(name)) return true;
  // Command throws in KOF have blockstun=0 (unblockable on hit)
  if (fd.blockstun === 0 && fd.knockdown) return true;
  return false;
}

/** Extract a base move name by stripping A/C/B/D version suffix and DM/SDM/HSDM prefix */
function getBaseName(name: string): string {
  // Strip version suffix (_A, _C, _B, _D at end)
  let base = name.replace(/_[ABCD]$/, '');
  // Also strip _EX suffix (e.g. SDM_PHOENIX_HITEN_EX -> base PHOENIX_HITEN)
  base = base.replace(/_EX$/, '');
  // Strip tier prefix
  base = base.replace(/^(DM|SDM|HSDM)_/, '');
  return base;
}

// ═══════════════════════════════════════════════════════════════
// 1. Startup Sanity
// ═══════════════════════════════════════════════════════════════
describe('Startup Sanity', () => {
  it('all non-SDM/HSDM attacks have startup >= 2 frames', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (isSDMorHSDM(name)) continue;
      if (fd.startup < 2) {
        violations.push(`${name}: startup=${fd.startup}`);
      }
    }
    expect(violations, `Non-SDM/HSDM attacks with startup < 2:\n${violations.join('\n')}`).toEqual([]);
  });

  it('all attacks have startup <= 30 frames (reasonable upper bound)', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.startup > 30) {
        violations.push(`${name}: startup=${fd.startup}`);
      }
    }
    expect(violations, `Attacks with startup > 30:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Active / Recovery Sanity
// ═══════════════════════════════════════════════════════════════
describe('Active / Recovery Sanity', () => {
  it('all attacks have active >= 1 frame', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.active < 1) {
        violations.push(`${name}: active=${fd.active}`);
      }
    }
    expect(violations, `Attacks with active < 1:\n${violations.join('\n')}`).toEqual([]);
  });

  it('all attacks have recovery >= 1 frame', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      // Jump attacks can have recovery=0 (recovery happens during landing)
      if (name.startsWith('JUMP_')) continue;
      if (fd.recovery < 1) {
        violations.push(`${name}: recovery=${fd.recovery}`);
      }
    }
    expect(violations, `Non-jump attacks with recovery < 1:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Hitstun / Blockstun Relationship
// ═══════════════════════════════════════════════════════════════
describe('Hitstun / Blockstun Relationship', () => {
  it('all attacks with non-zero hitstun have hitstun >= blockstun (except known KOF air/whip exceptions)', () => {
    const violations: string[] = [];
    // KOF authentic: air attacks (JUMP_C/D) have blockstun > hitstun because
    // blockstun uses heavy-ground values while hitstun uses air-standard 11F.
    // Yamazaki Hebi Tsukai (snake whip) has unique hitstun/blockstun per KOF2002.
    const knownExceptions = new Set([
      'JUMP_C', 'JUMP_D',
      'YAMAZAKI_HEBI_TSUKAI_U', 'YAMAZAKI_HEBI_TSUKAI_M', 'YAMAZAKI_HEBI_TSUKAI_L',
    ]);
    for (const [name, fd] of entries) {
      if (fd.hitstun === 0) continue;
      if (knownExceptions.has(name)) continue;
      if (fd.hitstun < fd.blockstun) {
        violations.push(`${name}: hitstun=${fd.hitstun} < blockstun=${fd.blockstun}`);
      }
    }
    expect(violations, `Attacks with hitstun < blockstun:\n${violations.join('\n')}`).toEqual([]);
  });

  it('all attacks with non-zero hitstun have hitstun <= 60 frames (reasonable upper bound)', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.hitstun > 60) {
        violations.push(`${name}: hitstun=${fd.hitstun}`);
      }
    }
    expect(violations, `Attacks with hitstun > 60:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Damage Sanity
// ═══════════════════════════════════════════════════════════════
describe('Damage Sanity', () => {
  it('all non-SDM/HSDM attacks have damage <= 300', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (isSDMorHSDM(name)) continue;
      if (fd.damage > 300) {
        violations.push(`${name}: damage=${fd.damage}`);
      }
    }
    expect(violations, `Non-SDM/HSDM attacks with damage > 300:\n${violations.join('\n')}`).toEqual([]);
  });

  it('all attacks have damage >= 1', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.damage < 1) {
        violations.push(`${name}: damage=${fd.damage}`);
      }
    }
    expect(violations, `Attacks with damage < 1:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Chip Damage
// ═══════════════════════════════════════════════════════════════
describe('Chip Damage', () => {
  it('chipDamage <= damage when chipDamage is defined', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.chipDamage === undefined) continue;
      if (fd.chipDamage > fd.damage) {
        violations.push(`${name}: chipDamage=${fd.chipDamage} > damage=${fd.damage}`);
      }
    }
    expect(violations, `Attacks with chipDamage > damage:\n${violations.join('\n')}`).toEqual([]);
  });

  it('SDM/HSDM chipDamage >= DM chipDamage for matching base moves', () => {
    const violations: string[] = [];
    // Build map: baseName -> { dm: [chipDamage], sdm: [chipDamage] }
    const tiers: Record<string, { dm: number[]; sdm: number[] }> = {};

    for (const [name, fd] of entries) {
      if (fd.chipDamage === undefined) continue;
      const base = getBaseName(name);
      if (!tiers[base]) tiers[base] = { dm: [], sdm: [] };

      if (name.startsWith('DM_')) {
        tiers[base].dm.push(fd.chipDamage);
      } else if (name.startsWith('SDM_') || name.startsWith('HSDM_')) {
        tiers[base].sdm.push(fd.chipDamage);
      }
    }

    for (const [base, data] of Object.entries(tiers)) {
      if (data.dm.length === 0 || data.sdm.length === 0) continue;
      const maxDmChip = Math.max(...data.dm);
      const minSdmChip = Math.min(...data.sdm);
      if (minSdmChip < maxDmChip) {
        violations.push(
          `${base}: SDM/HSDM min chipDamage=${minSdmChip} < DM max chipDamage=${maxDmChip}`,
        );
      }
    }

    expect(violations, `SDM chipDamage < DM chipDamage for same base:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Hit Level Validity
// ═══════════════════════════════════════════════════════════════
describe('Hit Level Validity', () => {
  it('all hitLevel values are HIGH / LOW / MID / UNBLOCKABLE', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (!VALID_HIT_LEVELS.has(fd.hitLevel)) {
        violations.push(`${name}: hitLevel="${fd.hitLevel}"`);
      }
    }
    expect(violations, `Attacks with invalid hitLevel:\n${violations.join('\n')}`).toEqual([]);
  });

  it('all LOW attacks have blockstun > 0', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.hitLevel !== 'LOW') continue;
      if (fd.blockstun <= 0) {
        violations.push(`${name}: hitLevel=LOW but blockstun=${fd.blockstun}`);
      }
    }
    expect(violations, `LOW attacks with blockstun <= 0:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Knockdown Consistency
// ═══════════════════════════════════════════════════════════════
describe('Knockdown Consistency', () => {
  it('knockdown=true attacks with non-zero hitstun have hitstun > blockstun (except known equals)', () => {
    const violations: string[] = [];
    // KOF2002 authentic: some knockdown specials have hitstun == blockstun,
    // meaning the knockdown property (not hitstun delta) is the real reward.
    const knownExceptions = new Set([
      'BILLY_RYUSEI_KYAKU',    // meteor kick: knockdown is the payoff, hitstun=blockstun=16
      'CHOI_TATSUMAKI_SHITOTSU', // tornado: knockdown payoff, hitstun=blockstun=16
      'MARY_SPIN_FALL',         // spin fall: knockdown payoff, hitstun=blockstun=18
    ]);
    for (const [name, fd] of entries) {
      if (!fd.knockdown) continue;
      if (fd.hitstun === 0) continue; // knockdown replaces hitstun, acceptable
      if (knownExceptions.has(name)) continue;
      if (fd.hitstun <= fd.blockstun) {
        violations.push(
          `${name}: knockdown=true, hitstun=${fd.hitstun} <= blockstun=${fd.blockstun}`,
        );
      }
    }
    expect(violations, `Knockdown attacks with hitstun <= blockstun:\n${violations.join('\n')}`).toEqual([]);
  });

  it('counterWire=true implies knockdown=true', () => {
    const violations: string[] = [];
    for (const [name, fd] of entries) {
      if (fd.counterWire && !fd.knockdown) {
        violations.push(`${name}: counterWire=true but knockdown=false`);
      }
    }
    expect(violations, `counterWire without knockdown:\n${violations.join('\n')}`).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. SDM/HSDM vs DM Hierarchy
// ═══════════════════════════════════════════════════════════════
describe('SDM/HSDM vs DM Hierarchy', () => {
  it('SDM/HSDM damage >= corresponding DM damage for same base move', () => {
    const violations: string[] = [];
    // Build map: baseName -> { dm: [damage], sdm: [damage] }
    const tiers: Record<string, { dm: number[]; sdm: number[] }> = {};

    for (const [name, fd] of entries) {
      const base = getBaseName(name);
      if (!tiers[base]) tiers[base] = { dm: [], sdm: [] };

      if (name.startsWith('DM_')) {
        tiers[base].dm.push(fd.damage);
      } else if (name.startsWith('SDM_') || name.startsWith('HSDM_')) {
        tiers[base].sdm.push(fd.damage);
      }
    }

    for (const [base, data] of Object.entries(tiers)) {
      if (data.dm.length === 0 || data.sdm.length === 0) continue;
      const maxDmDmg = Math.max(...data.dm);
      const minSdmDmg = Math.min(...data.sdm);
      if (minSdmDmg < maxDmDmg) {
        violations.push(
          `${base}: SDM/HSDM min damage=${minSdmDmg} < DM max damage=${maxDmDmg}`,
        );
      }
    }

    expect(violations, `SDM/HSDM damage < DM damage for same base:\n${violations.join('\n')}`).toEqual([]);
  });
});
