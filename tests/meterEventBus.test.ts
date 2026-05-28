/**
 * Meter Event Bus Tests
 *
 * Validates the meter event bus system:
 * - Bus singleton creation/reset
 * - on/off/onAny/offAny subscription
 * - emit delivers to type-specific and all listeners
 * - snapshotGauge captures correct state
 * - emitGaugeChange emits correct events for gain/spend/stock_up/stock_down/full_meter
 * - emitMaxActivate/emitMaxExpire/emitDesperation emit correct events
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMeterEventBus,
  resetMeterEventBus,
  snapshotGauge,
  emitGaugeChange,
  emitMaxActivate,
  emitMaxExpire,
  emitDesperation,
  type MeterEvent,
  type MeterEventType,
} from '../src/core/meterEvents.js';
import { MAX_STOCKS } from '../src/core/constants.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';

function makeGauge(overrides: Partial<PowerGauge> = {}): PowerGauge {
  return {
    meter: 0,
    stocks: 0,
    maxMeter: 100,
    ...overrides,
  };
}

function makeMaxMode(overrides: Partial<MaxModeState> = {}): MaxModeState {
  return {
    active: false,
    timer: 0,
    maxDuration: 900,
    ...overrides,
  };
}

describe('MeterEventBus singleton', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('creates bus on first call', () => {
    const bus = getMeterEventBus();
    expect(bus).toBeDefined();
  });

  it('returns same instance on subsequent calls', () => {
    const bus1 = getMeterEventBus();
    const bus2 = getMeterEventBus();
    expect(bus1).toBe(bus2);
  });

  it('reset creates a new instance', () => {
    const bus1 = getMeterEventBus();
    resetMeterEventBus();
    const bus2 = getMeterEventBus();
    expect(bus1).not.toBe(bus2);
  });
});

describe('MeterEventBus on/emit', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('delivers event to type-specific listener', () => {
    const bus = getMeterEventBus();
    const events: MeterEvent[] = [];
    bus.on('gain', e => events.push(e));

    const event: MeterEvent = {
      playerIndex: 0, type: 'gain',
      prevMeter: 0, prevStocks: 0,
      meter: 50, stocks: 0, maxMeter: 100,
      source: 'hit', amount: 50,
    };
    bus.emit(event);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('gain');
    expect(events[0].amount).toBe(50);
  });

  it('does not deliver to wrong type listener', () => {
    const bus = getMeterEventBus();
    const events: MeterEvent[] = [];
    bus.on('spend', e => events.push(e));

    bus.emit({
      playerIndex: 0, type: 'gain',
      prevMeter: 0, prevStocks: 0,
      meter: 50, stocks: 0, maxMeter: 100,
      source: 'hit', amount: 50,
    });

    expect(events).toHaveLength(0);
  });

  it('delivers to multiple listeners of same type', () => {
    const bus = getMeterEventBus();
    let count1 = 0, count2 = 0;
    bus.on('gain', () => count1++);
    bus.on('gain', () => count2++);

    bus.emit({
      playerIndex: 0, type: 'gain',
      prevMeter: 0, prevStocks: 0,
      meter: 50, stocks: 0, maxMeter: 100,
      source: 'hit', amount: 50,
    });

    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  it('onAny receives all events', () => {
    const bus = getMeterEventBus();
    const types: MeterEventType[] = [];
    bus.onAny(e => types.push(e.type));

    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 50, stocks: 0, maxMeter: 100, source: 'hit', amount: 50 });
    bus.emit({ playerIndex: 0, type: 'spend', prevMeter: 50, prevStocks: 0, meter: 0, stocks: 0, maxMeter: 100, source: 'dm', amount: -50 });

    expect(types).toEqual(['gain', 'spend']);
  });

  it('off removes listener', () => {
    const bus = getMeterEventBus();
    let count = 0;
    const handler = () => count++;
    bus.on('gain', handler);
    bus.off('gain', handler);

    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 50, stocks: 0, maxMeter: 100, source: 'hit', amount: 50 });

    expect(count).toBe(0);
  });

  it('offAny removes all-events listener', () => {
    const bus = getMeterEventBus();
    let count = 0;
    const handler = () => count++;
    bus.onAny(handler);
    bus.offAny(handler);

    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 50, stocks: 0, maxMeter: 100, source: 'hit', amount: 50 });

    expect(count).toBe(0);
  });

  it('clear removes all listeners', () => {
    const bus = getMeterEventBus();
    let count = 0;
    bus.on('gain', () => count++);
    bus.onAny(() => count++);
    resetMeterEventBus();

    // New bus should have no listeners
    const bus2 = getMeterEventBus();
    bus2.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 50, stocks: 0, maxMeter: 100, source: 'hit', amount: 50 });

    expect(count).toBe(0);
  });
});

describe('snapshotGauge', () => {
  it('captures meter and stocks', () => {
    const gauge = makeGauge({ meter: 42, stocks: 2 });
    const snap = snapshotGauge(gauge);
    expect(snap.meter).toBe(42);
    expect(snap.stocks).toBe(2);
  });

  it('snapshot is independent of gauge', () => {
    const gauge = makeGauge({ meter: 50, stocks: 1 });
    const snap = snapshotGauge(gauge);
    gauge.meter = 99;
    gauge.stocks = 3;
    expect(snap.meter).toBe(50);
    expect(snap.stocks).toBe(1);
  });
});

describe('emitGaugeChange', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('emits gain event on meter increase', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('gain', e => events.push(e));

    const before = { meter: 0, stocks: 0 };
    const after = makeGauge({ meter: 50, stocks: 0 });
    emitGaugeChange(0, before, after, 'hit');

    expect(events).toHaveLength(1);
    expect(events[0].amount).toBe(50);
    expect(events[0].source).toBe('hit');
    expect(events[0].playerIndex).toBe(0);
  });

  it('emits spend event on meter decrease', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('spend', e => events.push(e));

    const before = { meter: 80, stocks: 1 };
    const after = makeGauge({ meter: 30, stocks: 1 });
    emitGaugeChange(0, before, after, 'dm');

    expect(events).toHaveLength(1);
    expect(events[0].amount).toBe(-50);
  });

  it('emits stock_up when stocks increase', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('stock_up', e => events.push(e));

    const before = { meter: 0, stocks: 0 };
    const after = makeGauge({ meter: 0, stocks: 1 });
    emitGaugeChange(0, before, after, 'hit');

    expect(events).toHaveLength(1);
    expect(events[0].stocks).toBe(1);
    expect(events[0].prevStocks).toBe(0);
  });

  it('emits stock_down when stocks decrease', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('stock_down', e => events.push(e));

    const before = { meter: 0, stocks: 2 };
    const after = makeGauge({ meter: 0, stocks: 1 });
    emitGaugeChange(0, before, after, 'gc_roll');

    expect(events).toHaveLength(1);
    expect(events[0].stocks).toBe(1);
  });

  it('emits full_meter when all stocks filled', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('full_meter', e => events.push(e));

    const before = { meter: 0, stocks: MAX_STOCKS - 1 };
    const after = makeGauge({ meter: 0, stocks: MAX_STOCKS });
    emitGaugeChange(0, before, after, 'hit');

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('full_meter');
  });

  it('does not emit full_meter when already at max', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('full_meter', e => events.push(e));

    const before = { meter: 0, stocks: MAX_STOCKS };
    const after = makeGauge({ meter: 50, stocks: MAX_STOCKS });
    emitGaugeChange(0, before, after, 'hit');

    expect(events).toHaveLength(0);
  });

  it('no events emitted when nothing changed', () => {
    const events: MeterEvent[] = [];
    const bus = getMeterEventBus();
    bus.on('gain', () => events.push({} as MeterEvent));
    bus.on('spend', () => events.push({} as MeterEvent));
    bus.on('stock_up', () => events.push({} as MeterEvent));
    bus.on('stock_down', () => events.push({} as MeterEvent));

    const before = { meter: 50, stocks: 1 };
    const after = makeGauge({ meter: 50, stocks: 1 });
    emitGaugeChange(0, before, after, 'hit');

    expect(events).toHaveLength(0);
  });
});

describe('emitMaxActivate', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('emits max_activate event', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('max_activate', e => events.push(e));

    const gauge = makeGauge({ meter: 0, stocks: 0 });
    const maxMode = makeMaxMode({ active: true, timer: 900 });
    emitMaxActivate(0, gauge, maxMode);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('max_activate');
    expect(events[0].source).toBe('max_mode');
    expect(events[0].playerIndex).toBe(0);
  });
});

describe('emitMaxExpire', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('emits max_expire event', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('max_expire', e => events.push(e));

    emitMaxExpire(1);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('max_expire');
    expect(events[0].playerIndex).toBe(1);
  });
});

describe('emitDesperation', () => {
  beforeEach(() => {
    resetMeterEventBus();
  });

  it('emits desperation event with health percentage', () => {
    const events: MeterEvent[] = [];
    getMeterEventBus().on('desperation', e => events.push(e));

    const gauge = makeGauge({ meter: 50, stocks: 1 });
    emitDesperation(0, gauge, 200, 1000);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('desperation');
    expect(events[0].amount).toBe(20); // 200/1000 * 100
    expect(events[0].source).toBe('desperation_bonus');
  });
});
