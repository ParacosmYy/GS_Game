/**
 * MeterEventBus event flow regression tests
 *
 * Protects: subscription lifecycle, emitGaugeChange transitions,
 * emitMaxActivate/Expire, emitDesperation, onAny/offAny, event field accuracy.
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
} from '../src/core/meterEvents.js';
import type { MeterEvent, MeterEventType } from '../src/core/meterEvents.js';
import { MAX_STOCKS } from '../src/core/constants.js';

function makeGauge(meter: number, stocks: number, maxMeter = 100) {
  return { meter, stocks, maxMeter, maxStocks: MAX_STOCKS } as any;
}

function collectEvents(bus: ReturnType<typeof getMeterEventBus>, ...types: MeterEventType[]) {
  const events: MeterEvent[] = [];
  for (const t of types) {
    bus.on(t, (e) => events.push(e));
  }
  return events;
}

describe('MeterEventBus subscription lifecycle', () => {
  beforeEach(() => { resetMeterEventBus(); });

  it('on+emit delivers event to type-specific handler', () => {
    const bus = getMeterEventBus();
    const received: MeterEvent[] = [];
    bus.on('gain', (e) => received.push(e));
    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 30, stocks: 0, maxMeter: 100, source: 'hit', amount: 30 });
    expect(received).toHaveLength(1);
    expect(received[0].amount).toBe(30);
  });

  it('onAny receives all event types', () => {
    const bus = getMeterEventBus();
    const received: MeterEvent[] = [];
    bus.onAny((e) => received.push(e));
    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 20, stocks: 0, maxMeter: 100, source: 'whiff', amount: 20 });
    bus.emit({ playerIndex: 1, type: 'spend', prevMeter: 50, prevStocks: 1, meter: 0, stocks: 0, maxMeter: 100, source: 'dm', amount: -50 });
    expect(received).toHaveLength(2);
    expect(received[0].type).toBe('gain');
    expect(received[1].type).toBe('spend');
  });

  it('off removes type-specific handler', () => {
    const bus = getMeterEventBus();
    const received: MeterEvent[] = [];
    const handler = (e: MeterEvent) => received.push(e);
    bus.on('stock_up', handler);
    bus.off('stock_up', handler);
    bus.emit({ playerIndex: 0, type: 'stock_up', prevMeter: 90, prevStocks: 0, meter: 10, stocks: 1, maxMeter: 100, source: 'hit', amount: 1 });
    expect(received).toHaveLength(0);
  });

  it('offAny removes all-event handler', () => {
    const bus = getMeterEventBus();
    const received: MeterEvent[] = [];
    const handler = (e: MeterEvent) => received.push(e);
    bus.onAny(handler);
    bus.offAny(handler);
    bus.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 10, stocks: 0, maxMeter: 100, source: 'auto', amount: 10 });
    expect(received).toHaveLength(0);
  });

  it('clear removes all listeners', () => {
    const bus = getMeterEventBus();
    const received: MeterEvent[] = [];
    bus.on('gain', (e) => received.push(e));
    bus.onAny((e) => received.push(e));
    resetMeterEventBus();
    const bus2 = getMeterEventBus();
    bus2.emit({ playerIndex: 0, type: 'gain', prevMeter: 0, prevStocks: 0, meter: 10, stocks: 0, maxMeter: 100, source: 'whiff', amount: 10 });
    expect(received).toHaveLength(0);
  });

  it('off with unknown handler is no-op', () => {
    const bus = getMeterEventBus();
    expect(() => bus.off('gain', () => {})).not.toThrow();
  });

  it('offAny with unknown handler is no-op', () => {
    const bus = getMeterEventBus();
    expect(() => bus.offAny(() => {})).not.toThrow();
  });
});

describe('emitGaugeChange event routing', () => {
  beforeEach(() => { resetMeterEventBus(); });

  it('emits gain when total meter increases', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'gain');
    const before = snapshotGauge(makeGauge(0, 0));
    const after = makeGauge(40, 0);
    emitGaugeChange(0, before, after, 'hit');
    expect(events).toHaveLength(1);
    expect(events[0].amount).toBe(40);
    expect(events[0].source).toBe('hit');
  });

  it('emits spend when total meter decreases', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'spend');
    const before = snapshotGauge(makeGauge(80, 1));
    const after = makeGauge(30, 0);
    emitGaugeChange(0, before, after, 'dm');
    expect(events).toHaveLength(1);
    expect(events[0].amount).toBeLessThan(0);
    expect(events[0].source).toBe('dm');
  });

  it('emits stock_up when stocks increase', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'stock_up');
    const before = snapshotGauge(makeGauge(90, 0));
    const after = makeGauge(10, 1);
    emitGaugeChange(0, before, after, 'hit');
    expect(events).toHaveLength(1);
    expect(events[0].prevStocks).toBe(0);
    expect(events[0].stocks).toBe(1);
  });

  it('emits stock_down when stocks decrease', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'stock_down');
    const before = snapshotGauge(makeGauge(0, 2));
    const after = makeGauge(0, 1);
    emitGaugeChange(0, before, after, 'gc_roll');
    expect(events).toHaveLength(1);
    expect(events[0].prevStocks).toBe(2);
    expect(events[0].stocks).toBe(1);
  });

  it('emits full_meter when all stocks reached', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'full_meter');
    const before = snapshotGauge(makeGauge(0, MAX_STOCKS - 1));
    const after = makeGauge(50, MAX_STOCKS);
    emitGaugeChange(0, before, after, 'auto');
    expect(events).toHaveLength(1);
    expect(events[0].stocks).toBe(MAX_STOCKS);
    expect(events[0].amount).toBe(1);
  });

  it('does NOT emit full_meter when already at max stocks', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'full_meter');
    const before = snapshotGauge(makeGauge(20, MAX_STOCKS));
    const after = makeGauge(60, MAX_STOCKS);
    emitGaugeChange(0, before, after, 'hit');
    expect(events).toHaveLength(0);
  });

  it('no events emitted when nothing changed', () => {
    const bus = getMeterEventBus();
    const allEvents: MeterEvent[] = [];
    bus.onAny((e) => allEvents.push(e));
    const before = snapshotGauge(makeGauge(50, 2));
    const after = makeGauge(50, 2);
    emitGaugeChange(0, before, after, 'hit');
    expect(allEvents).toHaveLength(0);
  });

  it('emits multiple events for complex transitions', () => {
    const bus = getMeterEventBus();
    const allEvents: MeterEvent[] = [];
    bus.onAny((e) => allEvents.push(e));
    // meter fills, crosses stock boundary, and reaches max
    const before = snapshotGauge(makeGauge(90, MAX_STOCKS - 1));
    const after = makeGauge(10, MAX_STOCKS);
    emitGaugeChange(0, before, after, 'hit');
    // Should emit: gain (total increased 20), stock_up (+1 stock), full_meter
    const types = allEvents.map(e => e.type);
    expect(types).toContain('gain');
    expect(types).toContain('stock_up');
    expect(types).toContain('full_meter');
  });

  it('playerIndex is propagated correctly', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'gain');
    const before = snapshotGauge(makeGauge(0, 0));
    const after = makeGauge(30, 0);
    emitGaugeChange(1, before, after, 'block');
    expect(events[0].playerIndex).toBe(1);
  });

  it('calculates total delta accounting for stock conversions', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'gain');
    // Spent 1 stock (100) + 50 meter = 150 total, gained 10 meter = net -140
    // So we should test gain correctly
    const before = snapshotGauge(makeGauge(0, 0));
    const after = makeGauge(50, 1); // total: 100+50=150, was 0, gain=150
    emitGaugeChange(0, before, after, 'hit');
    expect(events).toHaveLength(1);
    expect(events[0].amount).toBe(150);
  });
});

describe('emitMaxActivate', () => {
  beforeEach(() => { resetMeterEventBus(); });

  it('emits max_activate event', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'max_activate');
    const gauge = makeGauge(20, 2);
    emitMaxActivate(0, gauge, {} as any);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('max_activate');
    expect(events[0].source).toBe('max_mode');
    expect(events[0].amount).toBe(3);
  });

  it('prevStocks includes the 3 spent stocks', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'max_activate');
    const gauge = makeGauge(20, 2);
    emitMaxActivate(1, gauge, {} as any);
    expect(events[0].prevStocks).toBe(5); // 2 + 3
    expect(events[0].stocks).toBe(2);
  });

  it('preserves gauge meter and maxMeter', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'max_activate');
    const gauge = makeGauge(45, 1, 100);
    emitMaxActivate(0, gauge, {} as any);
    expect(events[0].meter).toBe(45);
    expect(events[0].maxMeter).toBe(100);
  });
});

describe('emitMaxExpire', () => {
  beforeEach(() => { resetMeterEventBus(); });

  it('emits max_expire event', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'max_expire');
    emitMaxExpire(0);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('max_expire');
    expect(events[0].source).toBe('max_mode');
  });

  it('uses playerIndex correctly', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'max_expire');
    emitMaxExpire(1);
    expect(events[0].playerIndex).toBe(1);
  });
});

describe('emitDesperation', () => {
  beforeEach(() => { resetMeterEventBus(); });

  it('emits desperation event', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'desperation');
    const gauge = makeGauge(30, 1);
    emitDesperation(0, gauge, 200, 1000);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('desperation');
    expect(events[0].source).toBe('desperation_bonus');
  });

  it('amount is health percentage', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'desperation');
    const gauge = makeGauge(0, 0);
    emitDesperation(0, gauge, 200, 1000);
    expect(events[0].amount).toBe(20); // 200/1000 * 100
  });

  it('preserves gauge fields', () => {
    const bus = getMeterEventBus();
    const events = collectEvents(bus, 'desperation');
    const gauge = makeGauge(55, 3);
    emitDesperation(1, gauge, 100, 1000);
    expect(events[0].meter).toBe(55);
    expect(events[0].stocks).toBe(3);
    expect(events[0].prevMeter).toBe(55);
    expect(events[0].prevStocks).toBe(3);
  });
});

describe('snapshotGauge accuracy', () => {
  it('captures exact meter and stocks', () => {
    const gauge = makeGauge(73, 2);
    const snap = snapshotGauge(gauge);
    expect(snap.meter).toBe(73);
    expect(snap.stocks).toBe(2);
  });

  it('snapshot is independent of later gauge mutation', () => {
    const gauge = makeGauge(50, 1);
    const snap = snapshotGauge(gauge);
    gauge.meter = 99;
    gauge.stocks = 5;
    expect(snap.meter).toBe(50);
    expect(snap.stocks).toBe(1);
  });
});
