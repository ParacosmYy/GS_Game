/**
 * Combo System Consolidated Tests
 *
 * Merged from: comboScaling, comboDamageScaling, comboDamageCalc, comboDisplay, comboConfirm
 *
 * Covers: scaling tiers, damage calculation, combo counting, display, confirm windows.
 */
import { describe, it, expect } from 'vitest';
import {
  COMBO_DAMAGE_SCALE, COMBO_MIN_SCALE, DM_COMBO_PENALTY,
  COMBO_TIMEOUT, DAMAGE_SCALE_MIN_NORMAL, DAMAGE_SCALE_MIN_SPECIAL, DAMAGE_SCALE_MIN_DM,
  CANCEL_WINDOW_NORMAL, CANCEL_WINDOW_RAPID, CANCEL_WINDOW_SUPER,
} from '../src/core/constants.js';

// ── 1. Scaling Constants ────────────────────────────────────
describe('Combo Scaling Constants', () => {
  it('COMBO_DAMAGE_SCALE has tier thresholds at 3, 6, 9', () => {
    expect(COMBO_DAMAGE_SCALE[3]).toBeDefined();
    expect(COMBO_DAMAGE_SCALE[6]).toBeDefined();
    expect(COMBO_DAMAGE_SCALE[9]).toBeDefined();
  });

  it('tier 1-3 = 100%, tier 4-6 = 85%, tier 7-9 = 70%', () => {
    expect(COMBO_DAMAGE_SCALE[3]).toBeCloseTo(1.0);
    expect(COMBO_DAMAGE_SCALE[6]).toBeCloseTo(0.85);
    expect(COMBO_DAMAGE_SCALE[9]).toBeCloseTo(0.70);
  });

  it('COMBO_MIN_SCALE = 0.60 (60% minimum)', () => {
    expect(COMBO_MIN_SCALE).toBeCloseTo(0.60);
  });

  it('DM_COMBO_PENALTY = 0.10 (extra -10%)', () => {
    expect(DM_COMBO_PENALTY).toBeCloseTo(0.10);
  });

  it('scale values decrease monotonically and stay above minimum', () => {
    const tiers = Object.values(COMBO_DAMAGE_SCALE).sort((a, b) => b - a);
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i]).toBeLessThanOrEqual(tiers[i - 1]);
    }
    for (const t of tiers) {
      expect(t).toBeGreaterThanOrEqual(COMBO_MIN_SCALE);
    }
  });
});

// ── 2. Damage Calculation Tiers ─────────────────────────────
describe('Damage Calculation Tiers', () => {
  it('hits 1-3: 100% (no scaling)', () => {
    // comboCount 0-2 -> tier 1-3 -> 100%
    const tier = COMBO_DAMAGE_SCALE[3];
    expect(tier).toBeCloseTo(1.0);
  });

  it('hits 4-6: 85% scaling', () => {
    const tier = COMBO_DAMAGE_SCALE[6];
    expect(tier).toBeCloseTo(0.85);
  });

  it('minimum scale floors: DM(30%) > Special(20%) > Normal(10%)', () => {
    expect(DAMAGE_SCALE_MIN_DM).toBeGreaterThan(DAMAGE_SCALE_MIN_SPECIAL);
    expect(DAMAGE_SCALE_MIN_SPECIAL).toBeGreaterThan(DAMAGE_SCALE_MIN_NORMAL);
  });
});

// ── 3. Combo Display ────────────────────────────────────────
describe('Combo Display', () => {
  it('COMBO_TIMEOUT in reasonable range (60-120 frames)', () => {
    expect(COMBO_TIMEOUT).toBeGreaterThanOrEqual(60);
    expect(COMBO_TIMEOUT).toBeLessThanOrEqual(120);
  });
});

// ── 4. Cancel Window Timing ─────────────────────────────────
describe('Cancel Window Timing', () => {
  it('Normal cancel: 3 frames', () => {
    expect(CANCEL_WINDOW_NORMAL).toBe(3);
  });

  it('Rapid cancel: 2 frames', () => {
    expect(CANCEL_WINDOW_RAPID).toBe(2);
  });

  it('Super cancel: >= 5 frames', () => {
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThanOrEqual(5);
  });

  it('cancel windows are ordered: rapid < normal < super', () => {
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeLessThanOrEqual(CANCEL_WINDOW_SUPER);
  });
});
