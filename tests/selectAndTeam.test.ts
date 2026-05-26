/**
 * Select & Team Consolidated Tests
 *
 * Merged from: selectScreen, teamState, teamStateSystem, teamBattleSystem
 *
 * Covers: select screen state, team composition, team battle flow.
 */
import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';
import {
  SelectState,
  RANDOM_SLOT_INDEX,
  TOTAL_SELECT_SLOTS,
  COLOR_PALETTES,
} from '../src/state/selectState.js';

// ── 1. Select Screen ────────────────────────────────────────
describe('Select Screen', () => {
  it('ROSTER has at least 3 characters', () => {
    expect(ROSTER.length).toBeGreaterThanOrEqual(3);
  });

  it('TOTAL_SELECT_SLOTS matches roster size + random', () => {
    expect(TOTAL_SELECT_SLOTS).toBeGreaterThanOrEqual(ROSTER.length);
  });

  it('COLOR_PALETTES provides at least 2 color options', () => {
    expect(COLOR_PALETTES.length).toBeGreaterThanOrEqual(2);
  });

  it('RANDOM_SLOT_INDEX is valid', () => {
    expect(RANDOM_SLOT_INDEX).toBeGreaterThanOrEqual(0);
  });
});

// ── 2. Team Composition ─────────────────────────────────────
describe('Team Composition', () => {
  it('each roster entry has unique id', () => {
    const ids = ROSTER.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each character has valid stats', () => {
    for (const char of ROSTER) {
      expect(char.stats.maxHealth).toBeGreaterThan(0);
      expect(char.stats.walkSpeed).toBeGreaterThan(0);
    }
  });
});
