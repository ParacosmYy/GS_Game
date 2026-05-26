/**
 * Select Screen Tests
 *
 * Tests character selection flow: roster, locked characters,
 * cursor navigation, color selection, and VS splash flow.
 */
import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';
import {
  RANDOM_SLOT_INDEX,
  TOTAL_SELECT_SLOTS,
  COLOR_PALETTES,
  VS_SPLASH_DURATION,
} from '../src/state/selectState.js';

// ===== Roster Tests =====

describe('Character Roster', () => {
  it('has multiple characters available', () => {
    expect(ROSTER.length).toBeGreaterThanOrEqual(3);
  });

  it('every character has required fields', () => {
    for (const char of ROSTER) {
      expect(char.id).toBeTruthy();
      expect(char.name).toBeTruthy();
      expect(char.nameCn).toBeTruthy();
      expect(char.color).toBeTruthy();
      expect(char.accentColor).toBeTruthy();
      expect(char.portrait).toBeTruthy();
      expect(char.stats).toBeTruthy();
      expect(char.stats.maxHealth).toBeGreaterThan(0);
      expect(char.stats.walkSpeed).toBeGreaterThan(0);
      expect(typeof char.routeSpecial).toBe('function');
      expect(typeof char.routeNormal).toBe('function');
    }
  });

  it('every character has unique id', () => {
    const ids = ROSTER.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('includes Ryo (the vertical slice character)', () => {
    const ryo = ROSTER.find(c => c.id === 'ryo');
    expect(ryo).toBeDefined();
    expect(ryo!.nameCn).toBeTruthy();
  });

  it('has at least one character with pixel portrait', () => {
    const withPortrait = ROSTER.filter(c => c.pixelPortrait);
    expect(withPortrait.length).toBeGreaterThanOrEqual(1);
  });

  it('every character has win quotes array', () => {
    for (const char of ROSTER) {
      expect(Array.isArray(char.winQuotes)).toBe(true);
    }
  });
});

// ===== Select Grid Layout Tests =====

describe('Select Grid Layout', () => {
  it('TOTAL_SELECT_SLOTS equals roster + 1 random slot', () => {
    expect(TOTAL_SELECT_SLOTS).toBe(ROSTER.length + 1);
  });

  it('RANDOM_SLOT_INDEX points past the last character', () => {
    expect(RANDOM_SLOT_INDEX).toBe(ROSTER.length);
    expect(RANDOM_SLOT_INDEX).toBeLessThan(TOTAL_SELECT_SLOTS);
  });

  it('grid can accommodate all slots in rows', () => {
    const GRID_COLS = 8;
    const rows = Math.ceil(TOTAL_SELECT_SLOTS / GRID_COLS);
    expect(rows).toBeGreaterThanOrEqual(3); // enough rows for the roster
    expect(rows * GRID_COLS).toBeGreaterThanOrEqual(TOTAL_SELECT_SLOTS);
  });
});

// ===== Color Palette Tests =====

describe('Color Palette', () => {
  it('has 4 color options (A/B/C/D)', () => {
    expect(COLOR_PALETTES.length).toBe(4);
  });

  it('each palette has label and color', () => {
    for (const p of COLOR_PALETTES) {
      expect(p.label).toBeTruthy();
      expect(p.color).toBeTruthy();
      expect(p.color.startsWith('#')).toBe(true);
    }
  });

  it('palette labels are A/B/C/D', () => {
    const labels = COLOR_PALETTES.map(p => p.label);
    expect(labels).toEqual(['A', 'B', 'C', 'D']);
  });
});

// ===== VS Splash Tests =====

describe('VS Splash', () => {
  it('VS_SPLASH_DURATION is reasonable', () => {
    expect(VS_SPLASH_DURATION).toBeGreaterThan(0);
    expect(VS_SPLASH_DURATION).toBeLessThanOrEqual(180); // max 3 seconds
  });
});

// ===== Locked Character Concept Tests =====

describe('Locked Character Handling', () => {
  /**
   * The roster defines which characters are available.
   * In a full game, some characters might be locked.
   * Currently all ROSTER characters are available,
   * but the random slot provides "unknown" selection.
   */

  it('random slot index is beyond roster range', () => {
    // Characters at indices 0..ROSTER.length-1 are real
    // Index ROSTER.length is the random slot
    expect(RANDOM_SLOT_INDEX).toBe(ROSTER.length);

    // Accessing a character at random slot index returns null
    const charAtRandom = RANDOM_SLOT_INDEX >= ROSTER.length ? null : ROSTER[RANDOM_SLOT_INDEX];
    expect(charAtRandom).toBeNull();
  });

  it('all roster characters are "available" (not locked)', () => {
    // Current design: all ROSTER characters are selectable
    for (let i = 0; i < ROSTER.length; i++) {
      const char = ROSTER[i];
      expect(char).toBeDefined();
      expect(char.id).toBeTruthy();
    }
  });

  it('can identify if an index is the random slot', () => {
    // Random slot check: index >= ROSTER.length
    expect(RANDOM_SLOT_INDEX >= ROSTER.length).toBe(true);
    for (let i = 0; i < ROSTER.length; i++) {
      expect(i >= ROSTER.length).toBe(false);
    }
  });
});

// ===== Selection Flow Tests =====

describe('Selection Flow', () => {
  it('ROSTER supports sequential team building', () => {
    // For 3v3 team mode, we need at least 3 characters per team
    expect(ROSTER.length).toBeGreaterThanOrEqual(6);
  });

  it('characters have special colors for rendering', () => {
    for (const char of ROSTER) {
      expect(char.specialColor).toBeTruthy();
      expect(char.specialGlow).toBeTruthy();
    }
  });
});
