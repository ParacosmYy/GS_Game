/**
 * Game Screen Flow and Transition Tests
 *
 * Validates the screen flow state machine from src/core/gameScreens.ts.
 * Tests transition structure, validity checks, and flow completeness.
 */
import { describe, it, expect } from 'vitest';
import {
  VALID_TRANSITIONS,
  TRANSITION_DURATIONS,
  isValidTransition,
  getTransition,
} from '../src/core/gameScreens.js';
import type { GameScreen } from '../src/core/gameScreens.js';

const ALL_SCREENS: GameScreen[] = [
  'title', 'mode_select', 'character_select', 'team_order',
  'stage_select', 'battle_intro', 'battle', 'ko',
  'win_quote', 'victory', 'continue', 'game_over',
];

describe('VALID_TRANSITIONS structure', () => {
  it('has entries', () => {
    expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);
  });

  it('every transition has valid from/to screens', () => {
    const screenSet = new Set(ALL_SCREENS);
    for (const t of VALID_TRANSITIONS) {
      expect(screenSet.has(t.from), `${t.from} is valid screen`).toBe(true);
      expect(screenSet.has(t.to), `${t.to} is valid screen`).toBe(true);
    }
  });

  it('no transition goes from a screen to itself', () => {
    for (const t of VALID_TRANSITIONS) {
      expect(t.from === t.to, `${t.from} -> ${t.to}`).toBe(false);
    }
  });

  it('every transition has non-negative duration', () => {
    for (const t of VALID_TRANSITIONS) {
      expect(t.duration, `${t.from}->${t.to}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('every transition has a valid type', () => {
    const validTypes = new Set(['fade', 'wipe_left', 'wipe_right', 'zoom']);
    for (const t of VALID_TRANSITIONS) {
      expect(validTypes.has(t.type), `${t.from}->${t.to} type=${t.type}`).toBe(true);
    }
  });
});

describe('Screen flow completeness', () => {
  it('title has outgoing transitions', () => {
    const titleOut = VALID_TRANSITIONS.filter(t => t.from === 'title');
    expect(titleOut.length).toBeGreaterThan(0);
  });

  it('game_over leads to title', () => {
    expect(isValidTransition('game_over', 'title')).toBe(true);
  });

  it('battle leads to ko', () => {
    expect(isValidTransition('battle', 'ko')).toBe(true);
  });

  it('ko leads to win_quote', () => {
    expect(isValidTransition('ko', 'win_quote')).toBe(true);
  });

  it('win_quote leads to battle_intro (next round)', () => {
    expect(isValidTransition('win_quote', 'battle_intro')).toBe(true);
  });

  it('win_quote leads to victory (match winner)', () => {
    expect(isValidTransition('win_quote', 'victory')).toBe(true);
  });

  it('continue leads to battle_intro or game_over', () => {
    expect(isValidTransition('continue', 'battle_intro')).toBe(true);
    expect(isValidTransition('continue', 'game_over')).toBe(true);
  });

  it('every screen (except game_over) has at least one outgoing transition', () => {
    for (const screen of ALL_SCREENS) {
      if (screen === 'game_over') continue; // game_over only leads to title
      const out = VALID_TRANSITIONS.filter(t => t.from === screen);
      expect(out.length, `${screen} has outgoing transitions`).toBeGreaterThan(0);
    }
  });
});

describe('isValidTransition', () => {
  it('returns false for invalid transitions', () => {
    expect(isValidTransition('title', 'battle')).toBe(false);
    expect(isValidTransition('battle', 'character_select')).toBe(false);
    expect(isValidTransition('ko', 'title')).toBe(false);
  });

  it('returns false for same screen', () => {
    expect(isValidTransition('battle', 'battle')).toBe(false);
  });
});

describe('getTransition', () => {
  it('returns transition for valid pair', () => {
    const t = getTransition('title', 'mode_select');
    expect(t).toBeDefined();
    expect(t!.from).toBe('title');
    expect(t!.to).toBe('mode_select');
  });

  it('returns undefined for invalid pair', () => {
    expect(getTransition('battle', 'title')).toBeUndefined();
  });
});

describe('TRANSITION_DURATIONS', () => {
  it('fade is positive', () => {
    expect(TRANSITION_DURATIONS.fade).toBeGreaterThan(0);
  });

  it('wipe durations are positive', () => {
    expect(TRANSITION_DURATIONS.wipe_left).toBeGreaterThan(0);
    expect(TRANSITION_DURATIONS.wipe_right).toBeGreaterThan(0);
  });

  it('zoom is positive', () => {
    expect(TRANSITION_DURATIONS.zoom).toBeGreaterThan(0);
  });
});
