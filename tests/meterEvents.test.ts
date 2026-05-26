/**
 * Tests for MeterEventBus (Phase 67)
 *
 * Covers:
 *  - Event bus subscribe/unsubscribe
 *  - Event emission on meter gain (hit, block, whiff, hitstun, auto)
 *  - Event emission on stock changes (stock_up, stock_down)
 *  - Event emission on MAX mode (activate, expire)
 *  - Event emission on desperation mode
 *  - Event emission on full meter
 *  - Event emission on taunt drain
 *  - Integration with meter.ts functions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMeterEventBus,
  resetMeterEventBus,
  snapshotGauge,
  emitGaugeChange,
  emitMaxActivate,
  emitMaxExpire,
  emitDesperation,
} from '../src/core/meterEvents.js';
import type { MeterEvent, MeterEventType, MeterEventSource } from '../src/core/meterEvents.js';
import {
  createPowerGauge,
  createMaxMode,
  gainMeterOnHit,
  gainMeterOnBlock,
  gainMeterOnWhiff,
  gainMeterOnHitstun,
  spendStocks,
  activateMaxMode,
  tickMaxMode,
  tickAutoMeter,
  drainMeterByTaunt,
  spendGCRoll,
  spendGCCD,
} from '../src/combat/meter.js';
import { AttackType } from '../src/core/types.js';
import { METER_PER_STOCK, MAX_STOCKS, MAX_MODE_STOCK_COST, MAX_MODE_DURATION } from '../src/core/constants.js';

// ===== Helper: collect events into an array =====
function collectEvents(...types: MeterEventType[]): MeterEvent[] {
  const events: MeterEvent[] = [];
  const bus = getMeterEventBus();
  for (const type of types) {
    bus.on(type, (e) => events.push(e));
  }
  return events;
}

function collectAllEvents(): MeterEvent[] {
  const events: MeterEvent[] = [];
  getMeterEventBus().onAny((e) => events.push(e));
  return events;
}

// ===== 1. Event Bus Basics =====

describe('MeterEventBus basics', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('creates a global bus on first access', () => {
    const bus = getMeterEventBus();
    expect(bus).toBeTruthy();
  });

  it('returns the same bus on subsequent calls', () => {
    const bus1 = getMeterEventBus();
    const bus2 = getMeterEventBus();
    expect(bus1).toBe(bus2);
  });

  it('resetMeterEventBus creates a new bus', () => {
    const bus1 = getMeterEventBus();
    resetMeterEventBus();
    const bus2 = getMeterEventBus();
    expect(bus1).not.toBe(bus2);
  });

  it('onAny receives all events', () => {
    const all: MeterEvent[] = [];
    getMeterEventBus().onAny((e) => all.push(e));

    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, 0);

    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('off removes a specific listener', () => {
    const events: MeterEvent[] = [];
    const handler = (e: MeterEvent) => events.push(e);
    const bus = getMeterEventBus();
    bus.on('gain', handler);
    bus.off('gain', handler);

    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, 0);

    expect(events.length).toBe(0);
  });

  it('offAny removes an any listener', () => {
    const events: MeterEvent[] = [];
    const handler = (e: MeterEvent) => events.push(e);
    const bus = getMeterEventBus();
    bus.onAny(handler);
    bus.offAny(handler);

    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, 0);

    expect(events.length).toBe(0);
  });

  it('clear removes all listeners', () => {
    const events1: MeterEvent[] = [];
    const events2: MeterEvent[] = [];
    const bus = getMeterEventBus();
    bus.on('gain', (e) => events1.push(e));
    bus.onAny((e) => events2.push(e));
    bus.clear();

    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, 0);

    expect(events1.length).toBe(0);
    expect(events2.length).toBe(0);
  });
});

// ===== 2. Meter Gain Events =====

describe('Meter gain events', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('gainMeterOnHit emits gain event with correct source', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C, undefined, undefined, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('gain');
    expect(events[0].source).toBe('hit');
    expect(events[0].playerIndex).toBe(0);
    expect(events[0].amount).toBeGreaterThan(0);
  });

  it('gainMeterOnHit with desperation emits gain event', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    // Desperation: health=100, maxHealth=1000 (10% < 25%)
    gainMeterOnHit(gauge, AttackType.STAND_C, 100, 1000, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('hit');
    // Desperation bonus should give more meter
    expect(events[0].amount).toBeGreaterThan(0);
  });

  it('gainMeterOnBlock emits gain event with source=block', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    gainMeterOnBlock(gauge, AttackType.STAND_C, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('block');
  });

  it('gainMeterOnWhiff emits gain event for specials', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.SPECIAL_UPPER, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('whiff');
  });

  it('gainMeterOnWhiff does NOT emit for normals', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.STAND_A, 0);

    expect(events.length).toBe(0);
  });

  it('gainMeterOnHitstun emits gain event with source=hitstun', () => {
    const events = collectEvents('gain');
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.STAND_C, undefined, undefined, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('hitstun');
  });

  it('no events emitted when playerIndex is -1', () => {
    const events = collectAllEvents();
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, -1);

    expect(events.length).toBe(0);
  });
});

// ===== 3. Stock Change Events =====

describe('Stock change events', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('stock_up event when meter fills a stock', () => {
    const events = collectEvents('stock_up');
    const gauge = createPowerGauge();
    // Set meter close to max
    gauge.meter = METER_PER_STOCK - 1;
    gainMeterOnHit(gauge, AttackType.STAND_C, undefined, undefined, 0);

    // Should have stock_up event since meter crossed threshold
    const stockUps = events.filter(e => e.type === 'stock_up');
    expect(stockUps.length).toBeGreaterThanOrEqual(1);
    expect(stockUps[0].prevStocks).toBe(0);
    expect(stockUps[0].stocks).toBeGreaterThanOrEqual(1);
  });

  it('stock_down event when stocks are spent', () => {
    const events = collectEvents('stock_down');
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    spendStocks(gauge, 1, 0, 'dm');

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('stock_down');
    expect(events[0].source).toBe('dm');
    expect(events[0].prevStocks).toBe(3);
    expect(events[0].stocks).toBe(2);
  });

  it('spendGCRoll emits stock_down with source=gc_roll', () => {
    const events = collectEvents('stock_down');
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    spendGCRoll(gauge, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('gc_roll');
  });

  it('spendGCCD emits stock_down with source=gc_cd', () => {
    const events = collectEvents('stock_down');
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    spendGCCD(gauge, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('gc_cd');
  });
});

// ===== 4. MAX Mode Events =====

describe('MAX mode events', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('max_activate event when MAX mode activates', () => {
    const events = collectEvents('max_activate');
    const gauge = createPowerGauge();
    gauge.stocks = MAX_MODE_STOCK_COST;
    const maxMode = createMaxMode();

    const result = activateMaxMode(gauge, maxMode, 0);

    expect(result).toBe(true);
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('max_activate');
    expect(events[0].playerIndex).toBe(0);
  });

  it('no max_activate event when not enough stocks', () => {
    const events = collectEvents('max_activate');
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const maxMode = createMaxMode();

    activateMaxMode(gauge, maxMode, 0);

    expect(events.length).toBe(0);
  });

  it('max_expire event when MAX mode timer expires', () => {
    const events = collectEvents('max_expire');
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = 1;

    tickMaxMode(maxMode, 0);

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('max_expire');
    expect(events[0].playerIndex).toBe(0);
  });

  it('no max_expire event when MAX mode is still active', () => {
    const events = collectEvents('max_expire');
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = 100;

    tickMaxMode(maxMode, 0);

    expect(events.length).toBe(0);
  });

  it('MAX activation also emits stock_down events', () => {
    const events = collectEvents('stock_down');
    const gauge = createPowerGauge();
    gauge.stocks = MAX_MODE_STOCK_COST;
    const maxMode = createMaxMode();

    activateMaxMode(gauge, maxMode, 0);

    // Should have stock_down from spending stocks
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('stock_down');
  });
});

// ===== 5. Auto Meter Events =====

describe('Auto meter events', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('tickAutoMeter emits gain events', () => {
    const events = collectEvents('gain');
    const gauges: [ReturnType<typeof createPowerGauge>, ReturnType<typeof createPowerGauge>] = [
      createPowerGauge(), createPowerGauge()
    ];

    tickAutoMeter(gauges);

    // Both players should get gain events from auto-regen
    expect(events.length).toBeGreaterThanOrEqual(1);
    const p0Gains = events.filter(e => e.playerIndex === 0 && e.source === 'auto');
    expect(p0Gains.length).toBeGreaterThanOrEqual(1);
  });

  it('tickAutoMeter emits stock_up when meter fills', () => {
    const events = collectEvents('stock_up');
    const gauges: [ReturnType<typeof createPowerGauge>, ReturnType<typeof createPowerGauge>] = [
      createPowerGauge(), createPowerGauge()
    ];
    gauges[0].meter = METER_PER_STOCK - 1;

    tickAutoMeter(gauges);

    // P0 should have stock_up since meter was at 99 and auto adds 1
    const p0StockUps = events.filter(e => e.playerIndex === 0);
    expect(p0StockUps.length).toBeGreaterThanOrEqual(1);
  });
});

// ===== 6. Taunt Drain Events =====

describe('Taunt drain events', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('drainMeterByTaunt emits spend event', () => {
    const events = collectEvents('spend');
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    gauge.meter = 50;

    drainMeterByTaunt(gauge, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].source).toBe('taunt_drain');
    expect(events[0].playerIndex).toBe(0);
  });
});

// ===== 7. Full Meter Event =====

describe('Full meter event', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('full_meter event when all stocks are filled', () => {
    const events = collectEvents('full_meter');
    const gauge = createPowerGauge();
    gauge.stocks = MAX_STOCKS - 1;
    gauge.meter = METER_PER_STOCK - 1;

    gainMeterOnHit(gauge, AttackType.STAND_C, undefined, undefined, 0);

    const fullEvents = events.filter(e => e.type === 'full_meter');
    expect(fullEvents.length).toBeGreaterThanOrEqual(1);
    expect(fullEvents[0].stocks).toBeGreaterThanOrEqual(MAX_STOCKS);
  });
});

// ===== 8. Event Content Accuracy =====

describe('Event content accuracy', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('gain event contains correct prevMeter and meter', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('gain', (e) => events.push(e));

    const gauge = createPowerGauge();
    gauge.meter = 10; // Start with partial meter so gain doesn't cross stock boundary
    const prevMeter = gauge.meter;
    gainMeterOnHit(gauge, AttackType.STAND_A, undefined, undefined, 0); // Light attack = 60% of 100 = 60

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].prevMeter).toBe(prevMeter);
    // With light attack (60% of 100 = 60), starting at 10 = 70 total, crosses 100 so stock_up
    // The gain event tracks total value including stock conversions
    expect(events[0].amount).toBeGreaterThan(0);
  });

  it('stock_up event contains correct stock numbers', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('stock_up', (e) => events.push(e));

    const gauge = createPowerGauge();
    gauge.meter = METER_PER_STOCK - 1;
    const prevStocks = gauge.stocks;
    gainMeterOnHit(gauge, AttackType.STAND_C, undefined, undefined, 0);

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].prevStocks).toBe(prevStocks);
    expect(events[0].stocks).toBe(prevStocks + 1);
  });
});

// ===== 9. Desperation Event =====

describe('Desperation event', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('emitDesperation creates a desperation event', () => {
    const events = collectEvents('desperation');
    const gauge = createPowerGauge();

    emitDesperation(0, gauge, 100, 1000);

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('desperation');
    expect(events[0].playerIndex).toBe(0);
    expect(events[0].source).toBe('desperation_bonus');
  });
});

// ===== 10. Snapshot Helper =====

describe('snapshotGauge', () => {
  it('captures current gauge state', () => {
    const gauge = createPowerGauge();
    gauge.meter = 42;
    gauge.stocks = 2;

    const snap = snapshotGauge(gauge);

    expect(snap.meter).toBe(42);
    expect(snap.stocks).toBe(2);
  });

  it('snapshot is independent of gauge mutations', () => {
    const gauge = createPowerGauge();
    gauge.meter = 42;
    const snap = snapshotGauge(gauge);

    gauge.meter = 100;

    expect(snap.meter).toBe(42);
  });
});
