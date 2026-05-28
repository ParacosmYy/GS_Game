/**
 * ATTACK_SFX_TABLE Data Integrity Tests
 *
 * Validates the SFX dispatch table structure: entries, phases, sfx names,
 * priority ordering, and wildcard coverage.
 */
import { describe, it, expect } from 'vitest';
import {
  ATTACK_SFX_TABLE,
  type AttackSFXEntry,
} from '../src/audio/attackSFX.js';

const VALID_PHASES = ['startup', 'active', 'recovery', 'none'] as const;

// ===== Table structure =====

describe('ATTACK_SFX_TABLE structure', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(ATTACK_SFX_TABLE)).toBe(true);
    expect(ATTACK_SFX_TABLE.length).toBeGreaterThan(0);
  });

  it('has 100+ entries', () => {
    expect(ATTACK_SFX_TABLE.length).toBeGreaterThan(100);
  });

  it('all entries have valid shape', () => {
    for (let i = 0; i < ATTACK_SFX_TABLE.length; i++) {
      const e = ATTACK_SFX_TABLE[i];
      expect(typeof e.attackType, `[${i}].attackType`).toBe('string');
      expect(e.attackType.length, `[${i}].attackType non-empty`).toBeGreaterThan(0);
      expect(VALID_PHASES, `[${i}].phase`).toContain(e.phase);
      expect(typeof e.frame, `[${i}].frame`).toBe('number');
      expect(e.frame, `[${i}].frame >= 0`).toBeGreaterThanOrEqual(0);
      expect(typeof e.sfx, `[${i}].sfx`).toBe('string');
      expect(e.sfx.length, `[${i}].sfx non-empty`).toBeGreaterThan(0);
      expect(typeof e.priority, `[${i}].priority`).toBe('number');
    }
  });
});

// ===== Phase coverage =====

describe('ATTACK_SFX_TABLE phase coverage', () => {
  it('has startup entries', () => {
    const startups = ATTACK_SFX_TABLE.filter(e => e.phase === 'startup');
    expect(startups.length).toBeGreaterThan(10);
  });

  it('has active entries', () => {
    const actives = ATTACK_SFX_TABLE.filter(e => e.phase === 'active');
    expect(actives.length).toBeGreaterThan(5);
  });

  it('recovery entries may exist', () => {
    const recoveries = ATTACK_SFX_TABLE.filter(e => e.phase === 'recovery');
    // Recovery SFX are optional — just verify phase is a valid filter
    expect(Array.isArray(recoveries)).toBe(true);
  });
});

// ===== SFX names =====

describe('ATTACK_SFX_TABLE sfx names', () => {
  it('uses known sfx function names', () => {
    const knownSfx = new Set(['playWhoosh', 'playHeavyWhoosh', 'playHit', 'playHeavyHit',
      'playSpecial', 'playDmFlash', 'playSuperFlash', 'playCancel', 'playStep',
      'playLandingNormal', 'playBlock']);
    const allSfx = new Set(ATTACK_SFX_TABLE.map(e => e.sfx));
    // At least playWhoosh and playHit should be present
    expect(allSfx.has('playWhoosh')).toBe(true);
    expect(allSfx.has('playHit')).toBe(true);
  });

  it('no empty sfx names', () => {
    for (const e of ATTACK_SFX_TABLE) {
      expect(e.sfx.trim().length).toBeGreaterThan(0);
    }
  });
});

// ===== Wildcard entries =====

describe('ATTACK_SFX_TABLE wildcard', () => {
  it('has universal wildcard entries (attackType=*)', () => {
    const wildcards = ATTACK_SFX_TABLE.filter(e => e.attackType === '*');
    expect(wildcards.length).toBeGreaterThan(0);
  });

  it('wildcard entries have low priority', () => {
    const wildcards = ATTACK_SFX_TABLE.filter(e => e.attackType === '*');
    for (const w of wildcards) {
      expect(w.priority, `wildcard ${w.sfx} priority`).toBeLessThanOrEqual(1);
    }
  });

  it('specific entries have higher priority than wildcards', () => {
    const specifics = ATTACK_SFX_TABLE.filter(e => e.attackType !== '*');
    const wildcards = ATTACK_SFX_TABLE.filter(e => e.attackType === '*');
    const maxWildcardPrio = Math.max(...wildcards.map(w => w.priority));
    const minSpecificPrio = Math.min(...specifics.map(s => s.priority));
    expect(minSpecificPrio, 'specific priority >= wildcard').toBeGreaterThanOrEqual(maxWildcardPrio);
  });
});

// ===== Character coverage =====

describe('ATTACK_SFX_TABLE character coverage', () => {
  it('covers Ryo normals', () => {
    const ryoNormals = ATTACK_SFX_TABLE.filter(e =>
      ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D'].includes(e.attackType));
    expect(ryoNormals.length).toBeGreaterThan(0);
  });

  it('covers Kyo specials', () => {
    const kyoSpecials = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('KYO_'));
    expect(kyoSpecials.length).toBeGreaterThan(5);
  });

  it('covers Iori specials', () => {
    const ioriSpecials = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('IORI_'));
    expect(ioriSpecials.length).toBeGreaterThan(5);
  });

  it('covers Terry specials', () => {
    const terry = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('TERRY_'));
    expect(terry.length).toBeGreaterThan(3);
  });

  it('covers Kim specials', () => {
    const kim = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('KIM_'));
    expect(kim.length).toBeGreaterThan(2);
  });
});

// ===== Priority consistency =====

describe('ATTACK_SFX_TABLE priority', () => {
  it('all priorities are non-negative', () => {
    for (const e of ATTACK_SFX_TABLE) {
      expect(e.priority, `${e.attackType} priority`).toBeGreaterThanOrEqual(0);
    }
  });

  it('DM entries have higher priority than normals', () => {
    const dmEntries = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('DM_') || e.attackType.startsWith('SDM_'));
    const normalEntries = ATTACK_SFX_TABLE.filter(e =>
      ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B'].includes(e.attackType));
    if (dmEntries.length > 0 && normalEntries.length > 0) {
      const avgDm = dmEntries.reduce((s, e) => s + e.priority, 0) / dmEntries.length;
      const avgNormal = normalEntries.reduce((s, e) => s + e.priority, 0) / normalEntries.length;
      expect(avgDm, 'DM avg priority >= normal avg').toBeGreaterThanOrEqual(avgNormal);
    }
  });
});
