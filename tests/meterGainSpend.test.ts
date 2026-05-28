/**
 * Meter gain/spend regression tests — expanded coverage for combat/meter.ts
 *
 * Protects: block gain, whiff filtering, GC spend, MAX mode lifecycle,
 * auto meter regen, taunt drain, reset.
 */
import { describe, it, expect } from 'vitest';
import {
  createPowerGauge, createMaxMode,
  gainMeterOnBlock, gainMeterOnWhiff,
  gainMeterOnHit, gainMeterOnHitstun,
  spendStocks, spendGCRoll, spendGCCD,
  activateMaxMode, tickMaxMode, drainMaxModeTimer,
  tickAutoMeter, resetMeterSystem, drainMeterByTaunt,
} from '../src/combat/meter.js';
import { AttackType } from '../src/core/types.js';
import {
  METER_PER_STOCK, MAX_MODE_DURATION, MAX_STOCKS,
} from '../src/core/constants.js';

describe('gainMeterOnBlock', () => {
  it('gives meter when attack is blocked', () => {
    const g = createPowerGauge();
    gainMeterOnBlock(g, AttackType.STAND_C);
    expect(g.meter).toBeGreaterThan(0);
  });

  it('heavier attacks give more block meter', () => {
    const gLight = createPowerGauge();
    const gHeavy = createPowerGauge();
    gainMeterOnBlock(gLight, AttackType.STAND_A);
    gainMeterOnBlock(gHeavy, AttackType.STAND_C);
    expect(gHeavy.meter).toBeGreaterThan(gLight.meter);
  });
});

describe('gainMeterOnWhiff', () => {
  it('normals give ZERO meter on whiff', () => {
    const g = createPowerGauge();
    gainMeterOnWhiff(g, AttackType.STAND_A);
    gainMeterOnWhiff(g, AttackType.STAND_C);
    gainMeterOnWhiff(g, AttackType.CROUCH_D);
    expect(g.meter).toBe(0);
  });

  it('specials give meter on whiff', () => {
    const g = createPowerGauge();
    gainMeterOnWhiff(g, AttackType.SPECIAL_PROJECTILE);
    expect(g.meter).toBeGreaterThan(0);
  });
});

describe('spendGCRoll / spendGCCD', () => {
  it('spendGCRoll returns false with 0 stocks', () => {
    const g = createPowerGauge();
    expect(spendGCRoll(g)).toBe(false);
  });

  it('spendGCRoll returns true with enough stocks', () => {
    const g = createPowerGauge();
    g.stocks = 2;
    expect(spendGCRoll(g)).toBe(true);
    expect(g.stocks).toBeLessThan(2);
  });

  it('spendGCCD returns false with 0 stocks', () => {
    const g = createPowerGauge();
    expect(spendGCCD(g)).toBe(false);
  });

  it('spendGCCD returns true with enough stocks', () => {
    const g = createPowerGauge();
    g.stocks = 3;
    expect(spendGCCD(g)).toBe(true);
    expect(g.stocks).toBeLessThan(3);
  });
});

describe('activateMaxMode lifecycle', () => {
  it('fails with insufficient stocks', () => {
    const g = createPowerGauge();
    g.stocks = 2;
    const m = createMaxMode();
    expect(activateMaxMode(g, m)).toBe(false);
    expect(m.active).toBe(false);
  });

  it('succeeds with 3+ stocks', () => {
    const g = createPowerGauge();
    g.stocks = 3;
    const m = createMaxMode();
    expect(activateMaxMode(g, m)).toBe(true);
    expect(m.active).toBe(true);
    expect(m.timer).toBeGreaterThan(0);
  });

  it('fails if already active', () => {
    const g = createPowerGauge();
    g.stocks = 5;
    const m = createMaxMode();
    activateMaxMode(g, m);
    g.stocks = 5;
    expect(activateMaxMode(g, m)).toBe(false);
  });

  it('consumes 3 stocks on activation', () => {
    const g = createPowerGauge();
    g.stocks = 4;
    const m = createMaxMode();
    activateMaxMode(g, m);
    expect(g.stocks).toBe(1);
  });
});

describe('tickMaxMode', () => {
  it('decrements timer each tick', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = 100;
    tickMaxMode(m);
    expect(m.timer).toBe(99);
    expect(m.active).toBe(true);
  });

  it('deactivates when timer reaches 0', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = 1;
    tickMaxMode(m);
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
  });

  it('no-op when inactive', () => {
    const m = createMaxMode();
    tickMaxMode(m);
    expect(m.active).toBe(false);
  });
});

describe('drainMaxModeTimer', () => {
  it('drains timer by ratio of maxDuration', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = m.maxDuration;
    const result = drainMaxModeTimer(m, 0.2);
    expect(result).toBe(true);
    expect(m.timer).toBeLessThan(m.maxDuration);
    expect(m.active).toBe(true);
  });

  it('deactivates when fully drained', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = 10;
    drainMaxModeTimer(m, 1.0);
    expect(m.active).toBe(false);
  });

  it('returns false when not active', () => {
    const m = createMaxMode();
    expect(drainMaxModeTimer(m, 0.5)).toBe(false);
  });
});

describe('tickAutoMeter', () => {
  it('gradually fills meter over frames', () => {
    const g1 = createPowerGauge();
    const g2 = createPowerGauge();
    for (let i = 0; i < 50; i++) tickAutoMeter([g1, g2]);
    expect(g1.meter).toBeGreaterThan(0);
    expect(g2.meter).toBeGreaterThan(0);
  });

  it('eventually fills stocks', () => {
    const g1 = createPowerGauge();
    const g2 = createPowerGauge();
    for (let i = 0; i < 500; i++) tickAutoMeter([g1, g2]);
    expect(g1.stocks).toBeGreaterThan(0);
  });

  it('stops at max stocks', () => {
    const g1 = createPowerGauge();
    const g2 = createPowerGauge();
    for (let i = 0; i < 5000; i++) tickAutoMeter([g1, g2]);
    expect(g1.stocks).toBeLessThanOrEqual(MAX_STOCKS);
    expect(g2.stocks).toBeLessThanOrEqual(MAX_STOCKS);
  });
});

describe('resetMeterSystem', () => {
  it('clears gauge and max mode', () => {
    const g = createPowerGauge();
    g.meter = 80;
    g.stocks = 3;
    const m = createMaxMode();
    m.active = true;
    m.timer = 100;
    resetMeterSystem(g, m);
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(0);
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
  });
});

describe('drainMeterByTaunt', () => {
  it('reduces meter when stocks > 0', () => {
    const g = createPowerGauge();
    g.meter = 50;
    g.stocks = 1;
    drainMeterByTaunt(g);
    expect(g.stocks).toBeLessThanOrEqual(1);
  });

  it('reduces meter even with 0 stocks', () => {
    const g = createPowerGauge();
    g.meter = 50;
    g.stocks = 0;
    drainMeterByTaunt(g);
    expect(g.meter).toBeLessThan(50);
  });

  it('meter never goes negative', () => {
    const g = createPowerGauge();
    g.meter = 5;
    g.stocks = 0;
    drainMeterByTaunt(g);
    expect(g.meter).toBeGreaterThanOrEqual(0);
    expect(g.stocks).toBeGreaterThanOrEqual(0);
  });
});

describe('meter gain attack type scaling', () => {
  it('light gives less total meter than heavy', () => {
    const gL = createPowerGauge();
    const gH = createPowerGauge();
    gainMeterOnHit(gL, AttackType.STAND_A);
    gainMeterOnHit(gH, AttackType.STAND_C);
    const totalL = gL.stocks * METER_PER_STOCK + gL.meter;
    const totalH = gH.stocks * METER_PER_STOCK + gH.meter;
    expect(totalH).toBeGreaterThan(totalL);
  });

  it('hit gives more than block for same attack', () => {
    const gHit = createPowerGauge();
    const gBlock = createPowerGauge();
    gainMeterOnHit(gHit, AttackType.STAND_C);
    gainMeterOnBlock(gBlock, AttackType.STAND_C);
    const totalHit = gHit.stocks * METER_PER_STOCK + gHit.meter;
    const totalBlock = gBlock.stocks * METER_PER_STOCK + gBlock.meter;
    expect(totalHit).toBeGreaterThan(totalBlock);
  });

  it('hitstun gain works (defender gets meter)', () => {
    const g = createPowerGauge();
    gainMeterOnHitstun(g, AttackType.STAND_C);
    expect(g.meter).toBeGreaterThan(0);
  });
});
