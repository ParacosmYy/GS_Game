/**
 * Select & Team State Consolidated Tests
 *
 * Merged from: selectState, selectStateLogic, selectAndTeam, teamState
 *
 * Covers: constants, cursor logic, roster validation, team composition.
 */
import { describe, it, expect } from 'vitest';
import {
  RANDOM_SLOT_INDEX,
  TOTAL_SELECT_SLOTS,
  COLOR_PALETTES,
  VS_SPLASH_DURATION,
} from '../src/state/selectState.js';
import { createTeam, activeChar, defeatActive, switchToNext, teamOrderString } from '../src/state/teamState.js';
import { ROSTER } from '../src/characters/index.js';
import { RyoDef } from '../src/characters/ryo.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';

// ── Select Constants ──────────────────────────────────────────
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
    const labels = COLOR_PALETTES.map(p => p.label);
    expect(labels).toEqual(['A', 'B', 'C', 'D']);
    for (const entry of COLOR_PALETTES) {
      expect(entry.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ── Cursor Logic ──────────────────────────────────────────────
describe('selectState cursor logic', () => {
  it('random slot returns null', () => {
    expect(RANDOM_SLOT_INDEX >= ROSTER.length ? null : ROSTER[RANDOM_SLOT_INDEX]).toBeNull();
  });
  it('cursor wraps left at slot 0', () => {
    expect((0 - 1 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS).toBe(TOTAL_SELECT_SLOTS - 1);
  });
  it('cursor wraps right at last slot', () => {
    expect((TOTAL_SELECT_SLOTS - 1 + 1) % TOTAL_SELECT_SLOTS).toBe(0);
  });
  it('row jump wraps from slot 0', () => {
    const up = (0 - 8 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
    expect(up).toBeGreaterThanOrEqual(0);
    expect(up).toBeLessThan(TOTAL_SELECT_SLOTS);
  });
});

// ── Roster Validation ─────────────────────────────────────────
describe('roster validation', () => {
  it('27 characters in ROSTER', () => {
    expect(ROSTER.length).toBe(27);
  });
  it('all entries have id + name + stats.maxHealth > 0', () => {
    for (const char of ROSTER) {
      expect(char.id, `${char.id}: id`).toBeTruthy();
      expect(char.name, `${char.id}: name`).toBeTruthy();
      expect(char.stats.maxHealth, `${char.id}: maxHealth`).toBeGreaterThan(0);
    }
  });
  it('each entry has unique id', () => {
    const ids = ROSTER.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── Team State ────────────────────────────────────────────────
describe('teamState', () => {
  const team = createTeam([RyoDef, KyoDef, IoriDef]);

  it('createTeam returns 3 members with activeIndex 0', () => {
    expect(team.members.length).toBe(3);
    expect(team.activeIndex).toBe(0);
  });
  it('activeChar returns first member initially', () => {
    expect(activeChar(team).id).toBe('ryo');
  });
  it('defeatActive marks active as defeated', () => {
    expect(defeatActive(team)).toBe(true);
    expect(team.members[0].defeated).toBe(true);
  });
  it('switchToNext advances to next member', () => {
    expect(switchToNext(team)).toBe(true);
    expect(team.activeIndex).toBe(1);
    expect(activeChar(team).id).toBe('kyo');
  });
  it('teamOrderString returns non-empty', () => {
    expect(teamOrderString(team).length).toBeGreaterThan(0);
  });
});
