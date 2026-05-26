import { describe, it, expect } from 'vitest';
import {
  createPowerGauge, createMaxMode, isDesperation,
  gainMeterOnHit, gainMeterOnBlock, gainMeterOnWhiff,
  spendStocks, spendGCRoll, spendGCCD
} from '../src/combat/meter.js';

describe('meter', () => {
  describe('createPowerGauge', () => {
    it('creates a gauge with zero meter', () => {
      const gauge = createPowerGauge();
      expect(gauge.meter).toBe(0);
    });
    it('has zero stocks', () => {
      const gauge = createPowerGauge();
      expect(gauge.stocks).toBe(0);
    });
  });

  describe('createMaxMode', () => {
    it('creates inactive max mode', () => {
      const mm = createMaxMode();
      expect(mm.active).toBe(false);
    });
    it('is a valid object', () => {
      const mm = createMaxMode();
      expect(typeof mm).toBe('object');
    });
  });

  describe('isDesperation', () => {
    it('returns true when health is low', () => {
      expect(isDesperation(10, 100)).toBe(true);
    });
    it('returns false when health is high', () => {
      expect(isDesperation(80, 100)).toBe(false);
    });
  });

  describe('gainMeterOnHit', () => {
    it('increases meter on gauge', () => {
      const gauge = createPowerGauge();
      gainMeterOnHit(gauge, 'STAND_A');
      expect(gauge.meter).toBeGreaterThan(0);
    });
  });

  describe('gainMeterOnBlock', () => {
    it('increases meter on gauge', () => {
      const gauge = createPowerGauge();
      gainMeterOnBlock(gauge, 'STAND_A');
      expect(gauge.meter).toBeGreaterThan(0);
    });
  });

  describe('gainMeterOnWhiff', () => {
    it('does not throw on call', () => {
      const gauge = createPowerGauge();
      expect(() => gainMeterOnWhiff(gauge, 'STAND_A')).not.toThrow();
    });
  });

  describe('spendStocks', () => {
    it('returns false with no stocks', () => {
      const gauge = createPowerGauge();
      expect(spendStocks(gauge, 1)).toBe(false);
    });
  });

  describe('spendGCRoll', () => {
    it('returns false with no stocks', () => {
      const gauge = createPowerGauge();
      expect(spendGCRoll(gauge)).toBe(false);
    });
  });

  describe('spendGCCD', () => {
    it('returns false with no stocks', () => {
      const gauge = createPowerGauge();
      expect(spendGCCD(gauge)).toBe(false);
    });
  });
});
