/**
 * Game Screen Transitions Regression Tests
 *
 * Validates screen flow state machine and transition definitions.
 */
import { describe, it, expect } from 'vitest';
import {
  VALID_TRANSITIONS,
  TRANSITION_DURATIONS,
  isValidTransition,
  getTransition,
  type GameScreen,
  type TransitionType,
} from '../src/core/gameScreens.js';

describe('VALID_TRANSITIONS', () => {
  it('is non-empty array', () => {
    expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);
  });

  it('every transition has required fields', () => {
    for (const t of VALID_TRANSITIONS) {
      expect(t.from).toBeTruthy();
      expect(t.to).toBeTruthy();
      expect(typeof t.duration).toBe('number');
      expect(t.duration).toBeGreaterThanOrEqual(0);
      expect(t.type).toBeTruthy();
    }
  });

  it('no duplicate from->to pairs', () => {
    const keys = VALID_TRANSITIONS.map(t => `${t.from}->${t.to}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe('TRANSITION_DURATIONS', () => {
  it('has all 4 transition types', () => {
    const types: TransitionType[] = ['fade', 'wipe_left', 'wipe_right', 'zoom'];
    for (const type of types) {
      expect(TRANSITION_DURATIONS[type]).toBeDefined();
      expect(TRANSITION_DURATIONS[type]).toBeGreaterThan(0);
    }
  });

  it('zoom is longest transition', () => {
    expect(TRANSITION_DURATIONS.zoom).toBeGreaterThan(TRANSITION_DURATIONS.fade);
  });
});

describe('isValidTransition', () => {
  it('accepts valid title -> mode_select', () => {
    expect(isValidTransition('title', 'mode_select')).toBe(true);
  });

  it('accepts valid battle -> ko', () => {
    expect(isValidTransition('battle', 'ko')).toBe(true);
  });

  it('accepts valid ko -> win_quote', () => {
    expect(isValidTransition('ko', 'win_quote')).toBe(true);
  });

  it('accepts valid game_over -> title', () => {
    expect(isValidTransition('game_over', 'title')).toBe(true);
  });

  it('rejects invalid transition', () => {
    expect(isValidTransition('title', 'battle')).toBe(false);
  });

  it('rejects reverse of one-way transition', () => {
    // battle_intro -> battle is valid but battle -> battle_intro is not
    expect(isValidTransition('battle_intro', 'battle')).toBe(true);
    expect(isValidTransition('battle', 'battle_intro')).toBe(false);
  });

  it('rejects title -> battle directly', () => {
    expect(isValidTransition('title', 'battle')).toBe(false);
  });
});

describe('getTransition', () => {
  it('returns transition definition for valid pair', () => {
    const t = getTransition('title', 'mode_select');
    expect(t).toBeDefined();
    expect(t!.from).toBe('title');
    expect(t!.to).toBe('mode_select');
    expect(t!.type).toBe('fade');
  });

  it('returns undefined for invalid pair', () => {
    expect(getTransition('title', 'battle')).toBeUndefined();
  });

  it('battle_intro -> battle has duration 0 (instant)', () => {
    const t = getTransition('battle_intro', 'battle');
    expect(t).toBeDefined();
    expect(t!.duration).toBe(0);
  });

  it('win_quote can go to both victory and battle_intro', () => {
    expect(getTransition('win_quote', 'victory')).toBeDefined();
    expect(getTransition('win_quote', 'battle_intro')).toBeDefined();
  });

  it('continue can go to both battle_intro and game_over', () => {
    expect(getTransition('continue', 'battle_intro')).toBeDefined();
    expect(getTransition('continue', 'game_over')).toBeDefined();
  });
});

describe('Game screen flow completeness', () => {
  it('all standard screens appear in transitions', () => {
    const screens = new Set<string>();
    for (const t of VALID_TRANSITIONS) {
      screens.add(t.from);
      screens.add(t.to);
    }
    const expected: GameScreen[] = [
      'title', 'mode_select', 'character_select', 'team_order',
      'stage_select', 'battle_intro', 'battle', 'ko', 'win_quote',
      'victory', 'continue', 'game_over',
    ];
    for (const s of expected) {
      expect(screens.has(s), `screen ${s} should appear`).toBe(true);
    }
  });

  it('has a path from title to game_over', () => {
    // title -> mode_select -> character_select -> stage_select -> battle_intro
    // -> battle -> ko -> win_quote -> victory -> continue -> game_over
    expect(isValidTransition('title', 'mode_select')).toBe(true);
    expect(isValidTransition('mode_select', 'character_select')).toBe(true);
    expect(isValidTransition('character_select', 'stage_select')).toBe(true);
    expect(isValidTransition('stage_select', 'battle_intro')).toBe(true);
    expect(isValidTransition('battle_intro', 'battle')).toBe(true);
    expect(isValidTransition('battle', 'ko')).toBe(true);
    expect(isValidTransition('ko', 'win_quote')).toBe(true);
    expect(isValidTransition('win_quote', 'victory')).toBe(true);
    expect(isValidTransition('victory', 'continue')).toBe(true);
    expect(isValidTransition('continue', 'game_over')).toBe(true);
  });

  it('has a loop back from game_over to title', () => {
    expect(isValidTransition('game_over', 'title')).toBe(true);
  });
});
