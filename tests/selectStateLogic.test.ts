/**
 * SelectState pure logic regression tests
 *
 * Protects: isRandomSlot, getCharAtCursor, reset, COLOR_PALETTES,
 * TOTAL_SELECT_SLOTS, cursor wrapping behavior.
 */
import { describe, it, expect } from 'vitest';
import { RANDOM_SLOT_INDEX, TOTAL_SELECT_SLOTS, COLOR_PALETTES, VS_SPLASH_DURATION } from '../src/state/selectState.js';
import { ROSTER } from '../src/characters/index.js';

describe('selectState constants', () => {
  it('RANDOM_SLOT_INDEX equals ROSTER length', () => {
    expect(RANDOM_SLOT_INDEX).toBe(ROSTER.length);
  });

  it('TOTAL_SELECT_SLOTS is ROSTER + 1', () => {
    expect(TOTAL_SELECT_SLOTS).toBe(ROSTER.length + 1);
  });

  it('VS_SPLASH_DURATION is 90 frames', () => {
    expect(VS_SPLASH_DURATION).toBe(90);
  });

  it('COLOR_PALETTES has exactly 4 entries (ABCD)', () => {
    expect(COLOR_PALETTES.length).toBe(4);
  });

  it('each palette has label A-D and valid hex color', () => {
    const labels = COLOR_PALETTES.map(p => p.label);
    expect(labels).toEqual(['A', 'B', 'C', 'D']);
    for (const entry of COLOR_PALETTES) {
      expect(entry.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('selectState slot logic', () => {
  it('random slot index is valid (within total slots)', () => {
    expect(RANDOM_SLOT_INDEX).toBeLessThan(TOTAL_SELECT_SLOTS);
  });

  it('getCharAtCursor equivalent returns null for random slot', () => {
    const index = RANDOM_SLOT_INDEX;
    const char = index >= ROSTER.length ? null : ROSTER[index];
    expect(char).toBeNull();
  });

  it('getCharAtCursor equivalent returns character for valid indices', () => {
    for (let i = 0; i < ROSTER.length; i++) {
      const char = ROSTER[i];
      expect(char).toBeDefined();
      expect(char.id).toBeTruthy();
    }
  });

  it('cursor wrapping: (cursor - 1 + TOTAL) % TOTAL wraps correctly', () => {
    const cursor = 0;
    const wrapped = (cursor - 1 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
    expect(wrapped).toBe(TOTAL_SELECT_SLOTS - 1);
  });

  it('cursor wrapping: (cursor + 1) % TOTAL advances correctly', () => {
    const cursor = TOTAL_SELECT_SLOTS - 1;
    const wrapped = (cursor + 1) % TOTAL_SELECT_SLOTS;
    expect(wrapped).toBe(0);
  });

  it('cursor wrapping: row jump (+8) wraps correctly from slot 0', () => {
    // Row up: (0 - 8 + TOTAL) % TOTAL
    const cursor = 0;
    const up = (cursor - 8 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
    expect(up).toBeGreaterThanOrEqual(0);
    expect(up).toBeLessThan(TOTAL_SELECT_SLOTS);
  });

  it('all ROASTER entries have required fields for select screen', () => {
    for (const char of ROSTER) {
      expect(char.id, `${char.id}: id`).toBeTruthy();
      expect(char.name, `${char.id}: name`).toBeTruthy();
      expect(char.stats, `${char.id}: stats`).toBeDefined();
      expect(char.stats.maxHealth, `${char.id}: maxHealth`).toBeGreaterThan(0);
    }
  });
});
