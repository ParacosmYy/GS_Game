/**
 * Screen Manager Tests
 *
 * Tests the screen state machine: transitions, validation, timing,
 * and query methods.
 */
import { describe, it, expect } from 'vitest';
import {
  GameScreen,
  TransitionType,
  ScreenTransition,
  TRANSITION_DURATIONS,
  VALID_TRANSITIONS,
  isValidTransition,
  getTransition,
} from '../src/core/gameScreens.js';
import { ScreenManager, TransitionPhase } from '../src/core/screenManager.js';

// ===== gameScreens.ts Tests =====

describe('gameScreens types and validation', () => {
  it('defines transition durations for all types', () => {
    expect(TRANSITION_DURATIONS.fade).toBeGreaterThan(0);
    expect(TRANSITION_DURATIONS.wipe_left).toBeGreaterThan(0);
    expect(TRANSITION_DURATIONS.wipe_right).toBeGreaterThan(0);
    expect(TRANSITION_DURATIONS.zoom).toBeGreaterThan(0);
  });

  it('has valid transition entries', () => {
    expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);
    for (const t of VALID_TRANSITIONS) {
      expect(t.from).toBeTruthy();
      expect(t.to).toBeTruthy();
      expect(t.duration).toBeGreaterThanOrEqual(0);
      expect(['fade', 'wipe_left', 'wipe_right', 'zoom']).toContain(t.type);
    }
  });

  it('validates title -> mode_select transition', () => {
    expect(isValidTransition('title', 'mode_select')).toBe(true);
  });

  it('validates title -> character_select transition', () => {
    expect(isValidTransition('title', 'character_select')).toBe(true);
  });

  it('validates character_select -> stage_select transition', () => {
    expect(isValidTransition('character_select', 'stage_select')).toBe(true);
  });

  it('validates battle -> ko transition', () => {
    expect(isValidTransition('battle', 'ko')).toBe(true);
  });

  it('validates ko -> win_quote transition', () => {
    expect(isValidTransition('ko', 'win_quote')).toBe(true);
  });

  it('validates win_quote -> victory transition', () => {
    expect(isValidTransition('win_quote', 'victory')).toBe(true);
  });

  it('validates victory -> continue transition', () => {
    expect(isValidTransition('victory', 'continue')).toBe(true);
  });

  it('validates continue -> game_over transition', () => {
    expect(isValidTransition('continue', 'game_over')).toBe(true);
  });

  it('validates game_over -> title transition', () => {
    expect(isValidTransition('game_over', 'title')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidTransition('title', 'battle')).toBe(false);
    expect(isValidTransition('battle', 'title')).toBe(false);
    expect(isValidTransition('game_over', 'battle')).toBe(false);
    expect(isValidTransition('ko', 'title')).toBe(false);
    expect(isValidTransition('continue', 'character_select')).toBe(false);
  });

  it('returns transition definition for valid pairs', () => {
    const t = getTransition('title', 'mode_select');
    expect(t).toBeDefined();
    expect(t!.from).toBe('title');
    expect(t!.to).toBe('mode_select');
    expect(t!.type).toBe('fade');
  });

  it('returns undefined for invalid pairs', () => {
    expect(getTransition('title', 'battle')).toBeUndefined();
    expect(getTransition('ko', 'title')).toBeUndefined();
  });
});

// ===== screenManager.ts Tests =====

describe('ScreenManager', () => {
  it('starts at title screen', () => {
    const sm = new ScreenManager();
    expect(sm.getCurrentScreen()).toBe('title');
    expect(sm.isTransitioning()).toBe(false);
  });

  it('transitions to mode_select', () => {
    const sm = new ScreenManager();
    const result = sm.transitionTo('mode_select');
    expect(result).toBe(true);
    expect(sm.isTransitioning()).toBe(true);
    expect(sm.getTransitionPhase()).toBe('fade_out');
  });

  it('rejects invalid transition', () => {
    const sm = new ScreenManager();
    const result = sm.transitionTo('battle');
    expect(result).toBe(false);
    expect(sm.getCurrentScreen()).toBe('title');
    expect(sm.isTransitioning()).toBe(false);
  });

  it('rejects transition while already transitioning', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    const result = sm.transitionTo('character_select');
    expect(result).toBe(false);
  });

  it('completes fade_out then switches to fade_in', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    const dur = 10; // half of fade duration (20/2)
    for (let i = 0; i < dur; i++) {
      sm.tick();
    }
    // Should now be in fade_in phase with screen switched
    expect(sm.getTransitionPhase()).toBe('fade_in');
    expect(sm.getCurrentScreen()).toBe('mode_select');
  });

  it('completes full transition after fade_in', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    // Tick through both phases
    const fadeOutDur = 10;
    const fadeInDur = 10;
    for (let i = 0; i < fadeOutDur + fadeInDur; i++) {
      sm.tick();
    }
    expect(sm.isTransitioning()).toBe(false);
    expect(sm.getCurrentScreen()).toBe('mode_select');
  });

  it('tracks transition progress', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    expect(sm.getTransitionProgress()).toBe(0);
    sm.tick();
    expect(sm.getTransitionProgress()).toBeGreaterThan(0);
  });

  it('calculates transition alpha correctly', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    // During fade_out, alpha goes from 0 to 1
    expect(sm.getTransitionAlpha()).toBe(0);
    // Tick halfway through fade_out
    for (let i = 0; i < 5; i++) sm.tick();
    const midAlpha = sm.getTransitionAlpha();
    expect(midAlpha).toBeGreaterThan(0);
    expect(midAlpha).toBeLessThan(1);
  });

  it('force sets screen without transition', () => {
    const sm = new ScreenManager();
    sm.forceSetScreen('battle');
    expect(sm.getCurrentScreen()).toBe('battle');
    expect(sm.isTransitioning()).toBe(false);
  });

  it('resets to title screen', () => {
    const sm = new ScreenManager();
    sm.forceSetScreen('battle');
    sm.reset();
    expect(sm.getCurrentScreen()).toBe('title');
    expect(sm.isTransitioning()).toBe(false);
  });

  it('detects battle screens correctly', () => {
    const sm = new ScreenManager();
    expect(sm.isBattleScreen()).toBe(false);
    sm.forceSetScreen('battle');
    expect(sm.isBattleScreen()).toBe(true);
    sm.forceSetScreen('battle_intro');
    expect(sm.isBattleScreen()).toBe(true);
    sm.forceSetScreen('ko');
    expect(sm.isBattleScreen()).toBe(true);
  });

  it('detects menu screens correctly', () => {
    const sm = new ScreenManager();
    expect(sm.isMenuScreen()).toBe(true); // title
    sm.forceSetScreen('mode_select');
    expect(sm.isMenuScreen()).toBe(true);
    sm.forceSetScreen('character_select');
    expect(sm.isMenuScreen()).toBe(true);
    sm.forceSetScreen('battle');
    expect(sm.isMenuScreen()).toBe(false);
  });

  it('supports multi-step flow: title -> mode_select -> character_select', () => {
    const sm = new ScreenManager();

    // title -> mode_select
    sm.transitionTo('mode_select');
    for (let i = 0; i < 30; i++) sm.tick(); // complete transition
    expect(sm.getCurrentScreen()).toBe('mode_select');

    // mode_select -> character_select
    const result = sm.transitionTo('character_select');
    expect(result).toBe(true);
    for (let i = 0; i < 30; i++) sm.tick();
    expect(sm.getCurrentScreen()).toBe('character_select');
  });

  it('supports full game flow', () => {
    const sm = new ScreenManager();

    const flow: GameScreen[] = [
      'character_select',
      'stage_select',
      'battle_intro',
      'battle',
      'ko',
      'win_quote',
      'victory',
      'continue',
      'game_over',
      'title',
    ];

    for (const target of flow) {
      const result = sm.transitionTo(target);
      expect(result).toBe(true);
      // Complete the transition
      for (let i = 0; i < 100; i++) sm.tick();
      expect(sm.getCurrentScreen()).toBe(target);
    }
  });

  it('handles instant transitions (duration 0)', () => {
    const sm = new ScreenManager();
    sm.forceSetScreen('stage_select');
    // battle_intro -> battle has duration 0 (instant, no animation)
    sm.transitionTo('battle_intro');
    // Complete that transition first
    for (let i = 0; i < 100; i++) sm.tick();
    expect(sm.getCurrentScreen()).toBe('battle_intro');
    // Now battle_intro -> battle is instant (duration 0)
    const result = sm.transitionTo('battle');
    expect(result).toBe(true);
    expect(sm.getCurrentScreen()).toBe('battle');
    expect(sm.isTransitioning()).toBe(false);
  });

  it('returns correct transition type', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    expect(sm.getTransitionType()).toBe('fade');
  });

  it('isScreen checks current screen', () => {
    const sm = new ScreenManager();
    expect(sm.isScreen('title')).toBe(true);
    expect(sm.isScreen('battle')).toBe(false);
    sm.forceSetScreen('battle');
    expect(sm.isScreen('battle')).toBe(true);
    expect(sm.isScreen('title')).toBe(false);
  });

  it('tick returns true when transition completes', () => {
    const sm = new ScreenManager();
    sm.transitionTo('mode_select');
    let completed = false;
    for (let i = 0; i < 100; i++) {
      if (sm.tick()) {
        completed = true;
        break;
      }
    }
    expect(completed).toBe(true);
  });

  it('tick returns false when not transitioning', () => {
    const sm = new ScreenManager();
    expect(sm.tick()).toBe(false);
  });
});
