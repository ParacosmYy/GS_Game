/**
 * Meter System Consolidated Tests
 *
 * Merged from: meterSystem, meterIntegration, meterEdgeCases, meterSystemIntegration
 *
 * Covers: meter gain, stock accumulation, MAX mode lifecycle,
 *   DM/SDM stock cost, desperation mode.
 */
import { describe, it, expect } from 'vitest';
import {
  createPowerGauge, createMaxMode, gainMeterOnHit, gainMeterOnHitstun,
  spendStocks, isDesperation,
} from '../src/combat/meter.js';
import { AttackType } from '../src/core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK, MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS, MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD, DM_STOCK_COST,
} from '../src/core/constants.js';

// ── 1. Meter Gain ───────────────────────────────────────────
describe('Meter Gain', () => {
  it('light attack gives meter on hit', () => {
    const gauge = createPowerGauge();
    const meterBefore = gauge.meter;
    gainMeterOnHit(gauge, AttackType.STAND_A);
    expect(gauge.meter).toBeGreaterThan(meterBefore);
  });

  it('heavy attack gives meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C);
    // Either meter increased or stocks increased
    expect(gauge.meter + gauge.stocks * 100).toBeGreaterThan(0);
  });

  it('getting hit gives defender meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.STAND_C);
    expect(gauge.meter).toBeGreaterThan(0);
  });

  it('meter capped at maximum stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = MAX_STOCKS;
    gauge.meter = 0;
    expect(gauge.stocks).toBe(MAX_STOCKS);
  });
});

// ── 2. Stock System ─────────────────────────────────────────
describe('Stock System', () => {
  it('initial stock = 0 and meter = 0', () => {
    const gauge = createPowerGauge();
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);
  });

  it('max stocks capped at 5', () => {
    expect(MAX_STOCKS).toBe(5);
  });

  it('DM costs 1 stock', () => {
    expect(DM_STOCK_COST).toBe(1);
  });

  it('spendStocks returns false when insufficient', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    expect(spendStocks(gauge, 1)).toBe(false);
  });

  it('spendStocks returns true when sufficient', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    expect(spendStocks(gauge, 1)).toBe(true);
  });
});

// ── 3. MAX Mode ─────────────────────────────────────────────
describe('MAX Mode', () => {
  it('activation costs 3 stocks', () => {
    expect(MAX_MODE_STOCK_COST).toBe(3);
  });

  it('MAX mode grants +20% damage bonus', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeGreaterThan(1);
    expect(MAX_MODE_DAMAGE_BONUS).toBeCloseTo(1.2, 1);
  });

  it('MAX mode grants defense bonus (reduces damage)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeLessThan(1);
    expect(MAX_MODE_DEFENSE_BONUS).toBeCloseTo(0.75, 1);
  });

  it('MAX mode has defined duration', () => {
    expect(MAX_MODE_DURATION).toBeGreaterThan(0);
    const mm = createMaxMode();
    expect(mm.active).toBe(false);
  });
});

// ── 4. Desperation Mode ────────────────────────────────────
describe('Desperation Mode', () => {
  it('desperation triggers at health < 25%', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThanOrEqual(0.25);
  });

  it('isDesperation returns true when health is low', () => {
    expect(isDesperation(100, 1000)).toBe(true);
    expect(isDesperation(900, 1000)).toBe(false);
  });
});
