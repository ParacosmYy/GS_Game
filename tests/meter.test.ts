import { describe, it, expect } from 'vitest';
import { createPowerGauge, createMaxMode, isDesperation } from '../src/combat/meter.js';

describe('meter system', () => {
  it('createPowerGauge returns zero meter and stocks', () => {
    const g = createPowerGauge();
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(0);
    expect(g.maxMeter).toBeGreaterThan(0);
  });
  it('createMaxMode returns inactive state', () => {
    const m = createMaxMode();
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
    expect(m.maxDuration).toBeGreaterThan(0);
  });
  it('isDesperation returns true when health < 25%', () => {
    expect(isDesperation(200, 1000)).toBe(true);
    expect(isDesperation(249, 1000)).toBe(true);
  });
  it('isDesperation returns false when health >= 25%', () => {
    expect(isDesperation(250, 1000)).toBe(false);
    expect(isDesperation(1000, 1000)).toBe(false);
  });
  it('isDesperation returns false for zero health', () => {
    expect(isDesperation(0, 1000)).toBe(false);
  });
  it('isDesperation returns false for zero maxHealth', () => {
    expect(isDesperation(50, 0)).toBe(false);
  });
});
