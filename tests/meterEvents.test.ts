import { describe, it, expect, beforeEach } from 'vitest';
import { getMeterEventBus, resetMeterEventBus, snapshotGauge } from '../src/core/meterEvents.js';

describe('meterEvents', () => {
  beforeEach(() => { resetMeterEventBus(); });

  describe('getMeterEventBus', () => {
    it('returns an event bus object', () => {
      const bus = getMeterEventBus();
      expect(bus).toBeDefined();
    });
    it('has on method', () => {
      const bus = getMeterEventBus();
      expect(typeof bus.on).toBe('function');
    });
    it('has off method', () => {
      const bus = getMeterEventBus();
      expect(typeof bus.off).toBe('function');
    });
    it('has emit method', () => {
      const bus = getMeterEventBus();
      expect(typeof bus.emit).toBe('function');
    });
  });

  describe('resetMeterEventBus', () => {
    it('does not throw', () => {
      expect(() => resetMeterEventBus()).not.toThrow();
    });
  });

  describe('snapshotGauge', () => {
    it('returns a snapshot with meter and stocks', () => {
      const gauge = { meter: 50, stocks: 1, maxStocks: 3, maxMeter: 100 };
      const snap = snapshotGauge(gauge as any);
      expect(snap.meter).toBe(50);
      expect(snap.stocks).toBe(1);
    });
  });
});
