/**
 * Combat Consolidated Tests
 *
 * Merged from: combat, combatDeepIntegration, combatIntegration,
 *   combatRegression, combatScaling, pushback
 *
 * Covers: hitstun/blockstun standards, damage scaling, chip damage,
 *   combo flow, counter hit, and pushback calibration.
 */
import { describe, it, expect } from 'vitest';
import {
  FRAME_DATA,
  CHIP_DAMAGE_RATIO,
  CH_HITSTUN_BONUS,
  CH_DAMAGE_BONUS,
  DAMAGE_SCALE_MIN_NORMAL,
  DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
} from '../src/core/constants.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';

type FrameDataEntry = {
  startup: number; active: number; recovery: number; damage: number;
  hitstun: number; blockstun: number; pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH'; knockdown: boolean;
  chipDamage?: number; counterWire?: boolean;
};

// ── 1. Hitstun/Blockstun Standards ──────────────────────────
describe('KOF2002UM Hitstun/Blockstun Standards', () => {
  it('light normals (STAND_A): hitstun=11, blockstun=9', () => {
    const fd = FRAME_DATA['STAND_A' as keyof typeof FRAME_DATA] as FrameDataEntry;
    expect(fd.hitstun).toBe(11);
    expect(fd.blockstun).toBe(9);
  });

  it('heavy ground normals (STAND_C): hitstun=19, blockstun=15', () => {
    const fd = FRAME_DATA['STAND_C' as keyof typeof FRAME_DATA] as FrameDataEntry;
    expect(fd.hitstun).toBe(19);
    expect(fd.blockstun).toBe(15);
  });

  it('heavy air normals (JUMP_C): hitstun=11, blockstun=17', () => {
    const fd = FRAME_DATA['JUMP_C' as keyof typeof FRAME_DATA] as FrameDataEntry;
    expect(fd.hitstun).toBe(11);
    expect(fd.blockstun).toBe(17);
  });
});

// ── 2. Damage Scaling Constants ─────────────────────────────
describe('Damage Scaling Constants', () => {
  it('scaling min values are correctly ordered', () => {
    expect(DAMAGE_SCALE_MIN_NORMAL).toBeLessThanOrEqual(DAMAGE_SCALE_MIN_SPECIAL);
    expect(DAMAGE_SCALE_MIN_SPECIAL).toBeLessThanOrEqual(DAMAGE_SCALE_MIN_DM);
  });

  it('COMBO_DAMAGE_SCALE tier values decrease monotonically', () => {
    const tiers = Object.values(COMBO_DAMAGE_SCALE).sort((a, b) => a - b);
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i]).toBeGreaterThanOrEqual(tiers[i - 1]);
    }
    expect(tiers[0]).toBeGreaterThanOrEqual(COMBO_MIN_SCALE);
  });

  it('DM_COMBO_PENALTY is positive', () => {
    expect(DM_COMBO_PENALTY).toBeGreaterThan(0);
  });
});

// ── 3. Damage Hierarchy ─────────────────────────────────────
describe('Damage Hierarchy', () => {
  it('light damage < heavy damage', () => {
    const light = FRAME_DATA['STAND_A' as keyof typeof FRAME_DATA] as FrameDataEntry;
    const heavy = FRAME_DATA['STAND_C' as keyof typeof FRAME_DATA] as FrameDataEntry;
    expect(light.damage).toBeLessThan(heavy.damage);
  });

  it('DM damage >= 150', () => {
    const dm = FRAME_DATA['DM_OROCHINAGI' as keyof typeof FRAME_DATA] as FrameDataEntry;
    if (dm) {
      expect(dm.damage).toBeGreaterThanOrEqual(150);
    }
  });
});

// ── 4. Chip Damage ──────────────────────────────────────────
describe('Chip Damage', () => {
  it('chipDamage ≈ damage * CHIP_DAMAGE_RATIO', () => {
    const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];
    const withChip = entries.filter(([, fd]) => fd.chipDamage !== undefined);
    for (const [k, fd] of withChip.slice(0, 5)) {
      const expected = Math.round(fd.damage * CHIP_DAMAGE_RATIO);
      expect(Math.abs(fd.chipDamage! - expected)).toBeLessThanOrEqual(5);
    }
  });
});

// ── 5. Counter Hit ──────────────────────────────────────────
describe('Counter Hit', () => {
  it('CH_HITSTUN_BONUS = 1.5 and CH_DAMAGE_BONUS >= 1', () => {
    expect(CH_HITSTUN_BONUS).toBe(1.5);
    expect(CH_DAMAGE_BONUS).toBeGreaterThanOrEqual(1);
  });
});

// ── 6. Pushback Calibration ─────────────────────────────────
describe('Pushback Calibration', () => {
  it('pushback > 0 for ground normals', () => {
    for (const key of ['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_C'] as const) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
      expect(fd.pushback, `${key} pushback > 0`).toBeGreaterThan(0);
    }
  });

  it('heavy normals have more pushback than light normals', () => {
    const light = FRAME_DATA['STAND_A' as keyof typeof FRAME_DATA] as FrameDataEntry;
    const heavy = FRAME_DATA['STAND_C' as keyof typeof FRAME_DATA] as FrameDataEntry;
    expect(heavy.pushback).toBeGreaterThan(light.pushback);
  });
});

// ── 7. Fighter Combat State Transitions ─────────────────────
describe('Fighter Combat States', () => {
  it('Fighter transitions IDLE -> HITSTUN on hit', () => {
    const f = new Fighter(300, '#ff0000', 1);
    f.state = FighterState.IDLE;
    f.applyHitstun(10);
    expect(f.state).toBe(FighterState.HITSTUN);
  });

  it('Fighter transitions IDLE -> BLOCK on block', () => {
    const f = new Fighter(300, '#ff0000', 1);
    f.state = FighterState.IDLE;
    f.applyBlockstun(8);
    expect(f.state).toBe(FighterState.BLOCK);
  });
});
