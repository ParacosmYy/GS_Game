/**
 * Game Screens Regression Test
 * Verifies screen flow transitions, validity checks, and transition metadata.
 */
import { describe, it, expect } from 'vitest';
import {
  TRANSITION_DURATIONS,
  VALID_TRANSITIONS,
  isValidTransition,
  getTransition,
} from '../src/core/gameScreens.js';
import { WIN_QUOTE_DURATION } from '../src/rendering/screens.js';

describe('TRANSITION_DURATIONS', () => {
  it('all durations are non-negative', () => {
    for (const [name, dur] of Object.entries(TRANSITION_DURATIONS)) {
      expect(dur, `${name}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('wipes have equal duration', () => {
    expect(TRANSITION_DURATIONS.wipe_left).toBe(TRANSITION_DURATIONS.wipe_right);
  });

  it('zoom is slowest transition', () => {
    expect(TRANSITION_DURATIONS.zoom).toBeGreaterThanOrEqual(TRANSITION_DURATIONS.fade);
    expect(TRANSITION_DURATIONS.zoom).toBeGreaterThanOrEqual(TRANSITION_DURATIONS.wipe_left);
  });
});

describe('VALID_TRANSITIONS', () => {
  it('has at least 12 transitions', () => {
    expect(VALID_TRANSITIONS.length).toBeGreaterThanOrEqual(12);
  });

  it('each transition has valid fields', () => {
    for (const t of VALID_TRANSITIONS) {
      expect(t.from.length, 'from').toBeGreaterThan(0);
      expect(t.to.length, 'to').toBeGreaterThan(0);
      expect(t.duration, `${t.from}→${t.to}`).toBeGreaterThanOrEqual(0);
      expect(['fade', 'wipe_left', 'wipe_right', 'zoom'], `${t.from}→${t.to} type`).toContain(t.type);
    }
  });

  it('no duplicate from→to pairs', () => {
    const keys = VALID_TRANSITIONS.map(t => `${t.from}→${t.to}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers all key screens', () => {
    const screens = new Set<string>();
    for (const t of VALID_TRANSITIONS) {
      screens.add(t.from);
      screens.add(t.to);
    }
    expect(screens.has('title')).toBe(true);
    expect(screens.has('character_select')).toBe(true);
    expect(screens.has('battle')).toBe(true);
    expect(screens.has('ko')).toBe(true);
    expect(screens.has('victory')).toBe(true);
    expect(screens.has('game_over')).toBe(true);
  });

  it('battle_intro → battle has 0 duration (instant)', () => {
    const t = VALID_TRANSITIONS.find(t => t.from === 'battle_intro' && t.to === 'battle');
    expect(t).toBeDefined();
    expect(t!.duration).toBe(0);
  });

  it('battle → ko has 0 duration (instant)', () => {
    const t = VALID_TRANSITIONS.find(t => t.from === 'battle' && t.to === 'ko');
    expect(t).toBeDefined();
    expect(t!.duration).toBe(0);
  });

  it('win_quote can go to victory or battle_intro', () => {
    const toVictory = VALID_TRANSITIONS.some(t => t.from === 'win_quote' && t.to === 'victory');
    const toBattleIntro = VALID_TRANSITIONS.some(t => t.from === 'win_quote' && t.to === 'battle_intro');
    expect(toVictory).toBe(true);
    expect(toBattleIntro).toBe(true);
  });
});

describe('isValidTransition', () => {
  it('title → mode_select is valid', () => {
    expect(isValidTransition('title', 'mode_select')).toBe(true);
  });

  it('battle → ko is valid', () => {
    expect(isValidTransition('battle', 'ko')).toBe(true);
  });

  it('ko → battle is not valid (must go through win_quote)', () => {
    expect(isValidTransition('ko', 'battle')).toBe(false);
  });

  it('title → battle is not valid (must go through select)', () => {
    expect(isValidTransition('title', 'battle')).toBe(false);
  });

  it('game_over → title is valid', () => {
    expect(isValidTransition('game_over', 'title')).toBe(true);
  });

  it('continue → battle_intro is valid', () => {
    expect(isValidTransition('continue', 'battle_intro')).toBe(true);
  });

  it('continue → game_over is valid', () => {
    expect(isValidTransition('continue', 'game_over')).toBe(true);
  });

  it('same screen is not valid', () => {
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

  it('returned transition has duration', () => {
    const t = getTransition('character_select', 'stage_select');
    expect(t).toBeDefined();
    expect(t!.duration).toBeGreaterThanOrEqual(0);
  });

  it('returned transition type is valid', () => {
    const t = getTransition('stage_select', 'battle_intro');
    if (t) {
      expect(['fade', 'wipe_left', 'wipe_right', 'zoom']).toContain(t.type);
    }
  });
});

describe('Screen durations', () => {
  it('WIN_QUOTE_DURATION is 180 frames', () => {
    expect(WIN_QUOTE_DURATION).toBe(180);
  });
});
