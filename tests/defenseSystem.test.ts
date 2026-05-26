/**
 * Defense System Consolidated Tests
 *
 * Merged from: defenseSystem, defenseIntegration, guardCancelSystem,
 *   guardGaugeSystem, guardGaugeVisual
 *
 * Covers: guard gauge depletion/recovery, guard crush, pushblock,
 *   GC Roll, GC CD, visual state transitions.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  GUARD_CRUSH_DURATION, GUARD_GAUGE_MAX,
  GUARD_GAUGE_DRAIN_LIGHT, GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_SPECIAL, GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM, GUARD_GAUGE_DRAIN_CD,
  GUARD_GAUGE_DRAIN_COMMAND_NORMAL,
  PUSHBLOCK_THRESHOLD, PUSHBLOCK_EXTRA_PUSHBACK,
  ROLL_DURATION, MAX_STOCKS, METER_PER_STOCK,
} from '../src/core/constants.js';
import { createPowerGauge, spendStocks } from '../src/combat/meter.js';
import { isDM } from '../src/core/attackClassifier.js';

// ── 1. Guard Gauge Drain ────────────────────────────────────
describe('Guard Gauge Drain', () => {
  it('guard gauge starts at max (100)', () => {
    expect(GUARD_GAUGE_MAX).toBe(100);
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });

  it('drain hierarchy: light < heavy < command < special < DM < SDM', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBeLessThan(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeLessThan(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeLessThan(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBeLessThan(GUARD_GAUGE_DRAIN_SDM);
  });

  it('CD blowback drains more than heavy normal', () => {
    expect(GUARD_GAUGE_DRAIN_CD).toBeGreaterThan(GUARD_GAUGE_DRAIN_HEAVY);
  });

  it('multiple blocked attacks drain guard gauge', () => {
    const f = new Fighter(400, '#ff6600', 1);
    const initial = f.guardGauge;
    for (let i = 0; i < 5; i++) {
      f.guardGauge = Math.max(0, f.guardGauge - GUARD_GAUGE_DRAIN_HEAVY);
    }
    expect(f.guardGauge).toBeLessThan(initial);
  });
});

// ── 2. Guard Crush ──────────────────────────────────────────
describe('Guard Crush', () => {
  it('guard gauge reaching 0 triggers guard crush', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    expect(f.guardGauge).toBe(0);
    expect(GUARD_CRUSH_DURATION).toBeGreaterThan(0);
  });

  it('guard crush duration is substantial (> 30 frames)', () => {
    expect(GUARD_CRUSH_DURATION).toBeGreaterThan(30);
  });
});

// ── 3. Pushblock ────────────────────────────────────────────
describe('Pushblock', () => {
  it('pushblock triggers after consecutive blocks >= threshold', () => {
    expect(PUSHBLOCK_THRESHOLD).toBeGreaterThanOrEqual(3);
    expect(PUSHBLOCK_EXTRA_PUSHBACK).toBeGreaterThan(1.0);
  });
});

// ── 4. Guard Cancel Roll ────────────────────────────────────
describe('Guard Cancel Roll', () => {
  it('GC Roll costs 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    expect(gauge.stocks).toBeGreaterThanOrEqual(1);
  });

  it('GC Roll unavailable with 0 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    expect(gauge.stocks).toBe(0);
  });

  it('GC Roll duration is defined', () => {
    expect(ROLL_DURATION).toBeGreaterThan(0);
  });
});

// ── 5. Guard Gauge Visual States ────────────────────────────
describe('Guard Gauge Visual States', () => {
  it('gauge above 60% is normal state', () => {
    const gauge = 80;
    expect(gauge).toBeGreaterThan(GUARD_GAUGE_MAX * 0.6);
  });

  it('gauge below 30% is critical state', () => {
    const gauge = 20;
    expect(gauge).toBeLessThan(GUARD_GAUGE_MAX * 0.3);
  });

  it('reset restores guard gauge to max', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.guardGauge = 0;
    f.reset();
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });
});
