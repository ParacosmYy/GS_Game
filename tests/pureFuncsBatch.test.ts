/**
 * Pure Function & Data Regression Tests (Batch)
 *
 * Covers: getSparkSizeScaleFromDamage, moveList data structure,
 * and various pure-data constants not yet individually tested.
 */
import { describe, it, expect } from 'vitest';
import { getSparkSizeScaleFromDamage } from '../src/rendering/vfxPresets.js';
import { KYO_MOVE_LIST, KYO_WIN_QUOTES, KYO_AVAILABLE_ACTIONS, type KyoMoveEntry } from '../src/content/characters/kyo/commands/kyoCommands.js';
import { IORI_MOVE_LIST, IORI_WIN_QUOTES, IORI_AVAILABLE_ACTIONS, type IoriMoveEntry } from '../src/content/characters/iori/commands/ioriCommands.js';
import { RYO_MOVE_LIST, RYO_WIN_QUOTES, RYO_AVAILABLE_ACTIONS, type RyoMoveEntry } from '../src/content/characters/ryo/commands/ryoCommands.js';

// ===== getSparkSizeScaleFromDamage =====

describe('getSparkSizeScaleFromDamage', () => {
  it('returns 0.5 for damage < 50', () => {
    expect(getSparkSizeScaleFromDamage(10)).toBe(0.5);
    expect(getSparkSizeScaleFromDamage(49)).toBe(0.5);
    expect(getSparkSizeScaleFromDamage(0)).toBe(0.5);
  });

  it('returns 0.8 for damage 50-99', () => {
    expect(getSparkSizeScaleFromDamage(50)).toBe(0.8);
    expect(getSparkSizeScaleFromDamage(99)).toBe(0.8);
    expect(getSparkSizeScaleFromDamage(75)).toBe(0.8);
  });

  it('returns 1.1 for damage 100-149', () => {
    expect(getSparkSizeScaleFromDamage(100)).toBe(1.1);
    expect(getSparkSizeScaleFromDamage(149)).toBe(1.1);
  });

  it('returns 1.4 for damage 150-199', () => {
    expect(getSparkSizeScaleFromDamage(150)).toBe(1.4);
    expect(getSparkSizeScaleFromDamage(199)).toBe(1.4);
  });

  it('returns 1.7 for damage >= 200', () => {
    expect(getSparkSizeScaleFromDamage(200)).toBe(1.7);
    expect(getSparkSizeScaleFromDamage(300)).toBe(1.7);
    expect(getSparkSizeScaleFromDamage(500)).toBe(1.7);
  });

  it('is monotonically non-decreasing', () => {
    const values = [0, 30, 50, 80, 100, 120, 150, 180, 200, 300].map(d => getSparkSizeScaleFromDamage(d));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});

// ===== Move List Data =====

function validateMoveList<T extends { name: string; input: string }>(moves: T[], label: string) {
  expect(moves.length, `${label} has moves`).toBeGreaterThan(0);
  for (let i = 0; i < moves.length; i++) {
    expect(moves[i].name, `${label}[${i}].name`).toBeTruthy();
    expect(moves[i].input, `${label}[${i}].input`).toBeTruthy();
  }
}

describe('KYO_MOVE_LIST', () => {
  it('has moves', () => {
    validateMoveList(KYO_MOVE_LIST, 'KYO');
  });

  it('has at least 5 moves', () => {
    expect(KYO_MOVE_LIST.length).toBeGreaterThanOrEqual(5);
  });

  it('has unique names', () => {
    const names = KYO_MOVE_LIST.map(m => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('IORI_MOVE_LIST', () => {
  it('has moves', () => {
    validateMoveList(IORI_MOVE_LIST, 'IORI');
  });

  it('has at least 5 moves', () => {
    expect(IORI_MOVE_LIST.length).toBeGreaterThanOrEqual(5);
  });

  it('has unique names', () => {
    const names = IORI_MOVE_LIST.map(m => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('RYO_MOVE_LIST', () => {
  it('has moves', () => {
    validateMoveList(RYO_MOVE_LIST, 'RYO');
  });

  it('has at least 5 moves', () => {
    expect(RYO_MOVE_LIST.length).toBeGreaterThanOrEqual(5);
  });

  it('has unique names', () => {
    const names = RYO_MOVE_LIST.map(m => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ===== Win Quotes =====

describe('Win Quotes', () => {
  it('KYO has quotes', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThan(0);
    for (const q of KYO_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });

  it('IORI has quotes', () => {
    expect(IORI_WIN_QUOTES.length).toBeGreaterThan(0);
    for (const q of IORI_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });

  it('RYO has quotes', () => {
    expect(RYO_WIN_QUOTES.length).toBeGreaterThan(0);
  });
});

// ===== Available Actions =====

describe('Available Actions', () => {
  it('KYO has idle and stand_a', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_a');
  });

  it('IORI has idle and stand_a', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('idle');
    expect(IORI_AVAILABLE_ACTIONS).toContain('stand_a');
  });

  it('RYO has idle and stand_a', () => {
    expect(RYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(RYO_AVAILABLE_ACTIONS).toContain('stand_a');
  });

  it('all have reasonable action count (>10)', () => {
    expect(KYO_AVAILABLE_ACTIONS.length).toBeGreaterThan(10);
    expect(IORI_AVAILABLE_ACTIONS.length).toBeGreaterThan(10);
    expect(RYO_AVAILABLE_ACTIONS.length).toBeGreaterThan(10);
  });
});
