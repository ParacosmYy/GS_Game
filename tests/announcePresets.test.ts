import { describe, it, expect } from 'vitest';
import { popIn, fadeInHoldOut, burstIn, createRoundStartSequence, createKOSequence, createTimeOverSequence } from '../src/state/announcePresets.js';

describe('announcePresets', () => {
  it('popIn returns >1 for early progress', () => {
    expect(popIn(0)).toBeGreaterThan(1);
  });
  it('popIn returns 1 for late progress', () => {
    expect(popIn(0.5)).toBe(1);
    expect(popIn(1)).toBe(1);
  });
  it('fadeInHoldOut ramps up then down', () => {
    expect(fadeInHoldOut(0)).toBeCloseTo(0, 1);
    expect(fadeInHoldOut(0.5)).toBe(1);
    expect(fadeInHoldOut(1)).toBeCloseTo(0, 1);
  });
  it('burstIn returns >1 for early progress', () => {
    expect(burstIn(0)).toBeGreaterThan(1);
  });
  it('burstIn returns 1 for late progress', () => {
    expect(burstIn(0.5)).toBe(1);
  });
  it('createRoundStartSequence returns non-empty array', () => {
    const seq = createRoundStartSequence(1);
    expect(Array.isArray(seq)).toBe(true);
    expect(seq.length).toBeGreaterThan(0);
  });
  it('createKOSequence returns non-empty array', () => {
    const seq = createKOSequence(false);
    expect(Array.isArray(seq)).toBe(true);
    expect(seq.length).toBeGreaterThan(0);
  });
  it('createTimeOverSequence returns non-empty array', () => {
    const seq = createTimeOverSequence();
    expect(Array.isArray(seq)).toBe(true);
    expect(seq.length).toBeGreaterThan(0);
  });
});
