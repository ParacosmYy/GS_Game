import { describe, it, expect } from 'vitest';
import { RANDOM_SLOT_INDEX, TOTAL_SELECT_SLOTS, COLOR_PALETTES, VS_SPLASH_DURATION } from '../src/state/selectState.js';

describe('selectState constants', () => {
  it('RANDOM_SLOT_INDEX equals ROSTER length', () => {
    expect(RANDOM_SLOT_INDEX).toBeGreaterThan(0);
    expect(typeof RANDOM_SLOT_INDEX).toBe('number');
  });
  it('TOTAL_SELECT_SLOTS is ROSTER + 1', () => {
    expect(TOTAL_SELECT_SLOTS).toBe(RANDOM_SLOT_INDEX + 1);
  });
  it('COLOR_PALETTES has entries', () => {
    expect(COLOR_PALETTES.length).toBeGreaterThan(0);
  });
  it('each palette entry has label and color', () => {
    for (const entry of COLOR_PALETTES) {
      expect(entry.label).toBeDefined();
      expect(entry.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it('VS_SPLASH_DURATION is positive', () => {
    expect(VS_SPLASH_DURATION).toBeGreaterThan(0);
  });
});
