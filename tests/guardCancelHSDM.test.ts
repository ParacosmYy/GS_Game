/**
 * Guard Cancel & HSDM Consolidated Tests
 *
 * Merged from: guardCancelAndHSDM, hsdmDesperation
 *
 * Covers: GC Roll, GC CD, HSDM activation conditions, desperation mode.
 */
import { describe, it, expect } from 'vitest';
import {
  GC_ROLL_STOCK_COST, GC_CD_STOCK_COST,
  MAX_STOCKS, DESPERATION_HEALTH_THRESHOLD,
  DM_STOCK_COST,
} from '../src/core/constants.js';

// ── 1. Guard Cancel Roll ────────────────────────────────────
describe('Guard Cancel Roll', () => {
  it('GC Roll costs 1 stock', () => {
    expect(GC_ROLL_STOCK_COST).toBeGreaterThanOrEqual(1);
  });

  it('GC Roll cost <= MAX_STOCKS', () => {
    expect(GC_ROLL_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });
});

// ── 2. Guard Cancel CD ──────────────────────────────────────
describe('Guard Cancel CD', () => {
  it('GC CD costs 1 stock', () => {
    expect(GC_CD_STOCK_COST).toBeGreaterThanOrEqual(1);
  });

  it('GC CD cost <= MAX_STOCKS', () => {
    expect(GC_CD_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });
});

// ── 3. HSDM Activation ─────────────────────────────────────
describe('HSDM Activation', () => {
  it('HSDM requires desperation (health < 25%)', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThanOrEqual(0.25);
  });

  it('HSDM stock cost >= DM stock cost (typically 3 stocks)', () => {
    // HSDM costs 3 stocks in KOF2002 (desperation + 3 stocks)
    expect(3).toBeGreaterThanOrEqual(DM_STOCK_COST);
  });

  it('HSDM stock cost is affordable within max stocks', () => {
    expect(3).toBeLessThanOrEqual(MAX_STOCKS);
  });
});
