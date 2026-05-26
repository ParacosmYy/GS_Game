import { describe, it, expect } from 'vitest';
import { COLOR_PALETTES, VS_SPLASH_DURATION, TOTAL_SELECT_SLOTS, RANDOM_SLOT_INDEX, SelectState } from '../src/state/selectState.js';

describe('selectState', () => {
  it('VS_SPLASH_DURATION is 90', () => {
    expect(VS_SPLASH_DURATION).toBe(90);
  });
  it('TOTAL_SELECT_SLOTS is positive', () => {
    expect(TOTAL_SELECT_SLOTS).toBeGreaterThan(0);
  });
  it('RANDOM_SLOT_INDEX equals TOTAL_SELECT_SLOTS-1', () => {
    expect(RANDOM_SLOT_INDEX).toBe(TOTAL_SELECT_SLOTS - 1);
  });
  it('COLOR_PALETTES is non-empty array', () => {
    expect(Array.isArray(COLOR_PALETTES)).toBe(true);
    expect(COLOR_PALETTES.length).toBeGreaterThan(0);
  });
  it('SelectState can be instantiated', () => {
    const ss = new SelectState();
    expect(ss).toBeDefined();
  });
  it('SelectState has p1Cursor and p2Cursor', () => {
    const ss = new SelectState();
    expect(ss.p1Cursor).toBeDefined();
    expect(ss.p2Cursor).toBeDefined();
  });
  it('SelectState has ready flags', () => {
    const ss = new SelectState();
    expect(typeof ss.p1Ready).toBe('boolean');
    expect(typeof ss.p2Ready).toBe('boolean');
  });
});
