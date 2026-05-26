import { describe, it, expect } from 'vitest';
import {
  createPowerGauge,
  createMaxMode,
  gainMeterOnHit,
  gainMeterOnBlock,
  gainMeterOnWhiff,
  gainMeterOnHitstun,
  spendStocks,
  spendGCRoll,
  spendGCCD,
  activateMaxMode,
  tickMaxMode,
  tickAutoMeter,
  resetMeterSystem,
  isDesperation,
  drainMeterByTaunt,
} from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { AttackType } from '../src/core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS, MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD, DESPERATION_DM_DAMAGE_BONUS, DESPERATION_METER_GAIN_BONUS,
  GC_ROLL_STOCK_COST, GC_CD_STOCK_COST,
  DM_STOCK_COST,
} from '../src/core/constants.js';

// =====================================================================
// Meter Gain Tests
// =====================================================================
describe('Meter Gain from Attacks', () => {
  it('light normal attack (STAND_A) gives 60% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A);
    // base = 100, light = 60% = 60
    expect(gauge.meter).toBe(60);
    expect(gauge.stocks).toBe(0);
  });

  it('heavy normal attack (STAND_C) gives 100% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C);
    // 100 meter = 1 full stock, meter resets to 0
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(0);
  });

  it('special move gives 150% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.KYO_ONIYAKI);
    // base = 100, special = 150% = 150 -> 1 stock, 50 remaining
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
  });

  it('DM gives 200% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    // base = 100, DM = 200% = 200 -> 2 stocks
    expect(gauge.stocks).toBe(2);
    expect(gauge.meter).toBe(0);
  });

  it('command normal gives 120% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.CMD_GOFU_YOU);
    // base = 100, command = 120% = 120 -> 1 stock, 20 remaining
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(20);
  });

  it('crouch heavy (CROUCH_C) gives 100% of base meter on hit', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.CROUCH_C);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(0);
  });
});

// =====================================================================
// Meter Gain from Being Hit (Defender)
// =====================================================================
describe('Meter Gain from Being Hit', () => {
  it('getting hit by a heavy normal gives defender meter (50% base)', () => {
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.STAND_C);
    // base = 50, heavy = 100% = 50
    expect(gauge.meter).toBe(50);
  });

  it('getting hit by a special gives defender more meter (75)', () => {
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.KYO_ONIYAKI);
    // base = 50, special = 150% = 75
    expect(gauge.meter).toBe(75);
  });

  it('getting hit by a DM gives defender 100 meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.DM_OROCHINAGI);
    // base = 50, DM = 200% = 100 -> 1 stock
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(0);
  });
});

// =====================================================================
// Whiff Meter Gain
// =====================================================================
describe('Whiff Meter Gain', () => {
  it('whiffing a special gives small meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.KYO_ONIYAKI);
    // base = 10, special = 150% = 15
    expect(gauge.meter).toBe(15);
  });

  it('whiffing a DM gives small meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.DM_OROCHINAGI);
    // base = 10, DM = 200% = 20
    expect(gauge.meter).toBe(20);
  });

  it('whiffing a normal gives zero meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.STAND_C);
    expect(gauge.meter).toBe(0);
  });

  it('whiffing a light normal gives zero meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.STAND_A);
    expect(gauge.meter).toBe(0);
  });
});

// =====================================================================
// Stock System Tests
// =====================================================================
describe('Stock System', () => {
  it('meter accumulates and converts to stocks', () => {
    const gauge = createPowerGauge();
    // Hit twice with heavy = 100 * 2 = 200 meter
    gainMeterOnHit(gauge, AttackType.STAND_C);
    gainMeterOnHit(gauge, AttackType.STAND_C);
    expect(gauge.stocks).toBe(2);
    expect(gauge.meter).toBe(0);
  });

  it('stocks cap at MAX_STOCKS (5)', () => {
    const gauge = createPowerGauge();
    // Force max stocks
    gauge.stocks = MAX_STOCKS;
    gauge.meter = 99;
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    expect(gauge.stocks).toBe(MAX_STOCKS);
    expect(gauge.meter).toBeLessThan(METER_PER_STOCK);
  });

  it('DM costs 1 stock', () => {
    expect(DM_STOCK_COST).toBe(1);
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const result = spendStocks(gauge, DM_STOCK_COST);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(2);
  });

  it('MAX activation costs 3 stocks', () => {
    expect(MAX_MODE_STOCK_COST).toBe(3);
  });

  it('Guard Cancel Roll costs 1 stock', () => {
    expect(GC_ROLL_STOCK_COST).toBe(1);
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const result = spendGCRoll(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('Guard Cancel CD costs 1 stock', () => {
    expect(GC_CD_STOCK_COST).toBe(1);
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const result = spendGCCD(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('spendStocks returns false when not enough stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const result = spendStocks(gauge, 1);
    expect(result).toBe(false);
  });
});

// =====================================================================
// MAX Mode Tests
// =====================================================================
describe('MAX Mode', () => {
  it('MAX mode damage bonus is +20%', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBe(1.20);
  });

  it('MAX mode defense bonus is -25% damage taken', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBe(0.75);
  });

  it('MAX mode duration is 720 frames (12 seconds at 60fps)', () => {
    expect(MAX_MODE_DURATION).toBe(720);
  });

  it('activateMaxMode succeeds when 3 stocks available', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    const result = activateMaxMode(gauge, maxMode);
    expect(result).toBe(true);
    expect(maxMode.active).toBe(true);
    expect(maxMode.timer).toBe(MAX_MODE_DURATION);
    expect(gauge.stocks).toBe(0);
  });

  it('activateMaxMode fails when insufficient stocks', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 2;
    const result = activateMaxMode(gauge, maxMode);
    expect(result).toBe(false);
    expect(maxMode.active).toBe(false);
  });

  it('activateMaxMode fails when already active', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 5;
    maxMode.active = true;
    const result = activateMaxMode(gauge, maxMode);
    expect(result).toBe(false);
  });

  it('tickMaxMode decrements timer and deactivates when expired', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = 10;
    for (let i = 0; i < 10; i++) tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('tickMaxMode does nothing when not active', () => {
    const maxMode = createMaxMode();
    maxMode.active = false;
    maxMode.timer = 0;
    tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });
});

// =====================================================================
// Desperation Mode Tests
// =====================================================================
describe('Desperation Mode (health < 25%)', () => {
  it('isDesperation returns true when health < 25%', () => {
    expect(isDesperation(24, 100)).toBe(true);
    expect(isDesperation(1, 100)).toBe(true);
    expect(isDesperation(0, 100)).toBe(false); // dead is not desperation
  });

  it('isDesperation returns false when health >= 25%', () => {
    expect(isDesperation(25, 100)).toBe(false);
    expect(isDesperation(50, 100)).toBe(false);
    expect(isDesperation(100, 100)).toBe(false);
  });

  it('desperation threshold constant is 0.25', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBe(0.25);
  });

  it('desperation DM damage bonus is +30%', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBe(1.30);
  });

  it('desperation meter gain bonus is +50%', () => {
    expect(DESPERATION_METER_GAIN_BONUS).toBe(1.50);
  });

  it('meter gain on hit is boosted in desperation', () => {
    const gauge = createPowerGauge();
    // STAND_C = 100 meter on hit, desperation bonus = 150
    gainMeterOnHit(gauge, AttackType.STAND_C, 20, 100);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
  });

  it('meter gain on being hit is boosted in desperation', () => {
    const gauge = createPowerGauge();
    // STAND_C hitstun base = 50 * 100% = 50, desperation = 50 * 150% = 75
    gainMeterOnHitstun(gauge, AttackType.STAND_C, 20, 100);
    expect(gauge.meter).toBe(75);
  });

  it('no desperation bonus at full health', () => {
    const gauge = createPowerGauge();
    const gaugeFull = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C, 20, 100);
    gainMeterOnHit(gaugeFull, AttackType.STAND_C, 100, 100);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
    expect(gaugeFull.stocks).toBe(1);
    expect(gaugeFull.meter).toBe(0);
    expect(gauge.meter).toBeGreaterThan(gaugeFull.meter);
  });
});

// =====================================================================
// Auto Meter Regen (风云再起 mode)
// =====================================================================
describe('Auto Meter Regen', () => {
  it('auto regen fills meter at 1.0 per frame', () => {
    const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
    tickAutoMeter(gauges);
    expect(gauges[0].meter).toBe(1);
    expect(gauges[1].meter).toBe(1);
  });

  it('auto regen converts meter to stocks when full', () => {
    const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
    gauges[0].meter = METER_PER_STOCK - 1;
    tickAutoMeter(gauges);
    expect(gauges[0].stocks).toBe(1);
    expect(gauges[0].meter).toBe(0);
  });

  it('auto regen stops when at max stocks', () => {
    const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
    gauges[0].stocks = MAX_STOCKS;
    gauges[0].meter = 0;
    tickAutoMeter(gauges);
    // Should not exceed max stocks
    expect(gauges[0].stocks).toBe(MAX_STOCKS);
  });
});

// =====================================================================
// Taunt Meter Drain
// =====================================================================
describe('Taunt Meter Drain', () => {
  it('taunt drains opponent meter when opponent has stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    gauge.meter = 50;
    drainMeterByTaunt(gauge);
    // Should lose ~80 meter, since meter=50 < 80, lose 1 stock and get remainder back
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBeGreaterThanOrEqual(0);
  });

  it('taunt drains partial meter when no stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    gauge.meter = 80;
    drainMeterByTaunt(gauge);
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBeLessThan(80);
  });
});

// =====================================================================
// Reset Tests
// =====================================================================
describe('Meter System Reset', () => {
  it('resetMeterSystem clears gauge and MAX mode', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    gauge.meter = 50;
    maxMode.active = true;
    maxMode.timer = 100;
    resetMeterSystem(gauge, maxMode);
    expect(gauge.meter).toBe(0);
    expect(gauge.stocks).toBe(0);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });
});

// =====================================================================
// Constants Consistency
// =====================================================================
describe('Meter Constants Consistency', () => {
  it('MAX_STOCKS should be 5', () => {
    expect(MAX_STOCKS).toBe(5);
  });

  it('METER_PER_STOCK should be 100', () => {
    expect(METER_PER_STOCK).toBe(100);
  });

  it('meter gain constants are positive', () => {
    expect(METER_PER_STOCK).toBeGreaterThan(0);
  });
});
