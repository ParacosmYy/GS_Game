import { describe, it, expect } from 'vitest';
import {
  TRANSITION_DURATIONS,
  VALID_TRANSITIONS,
} from '../src/core/gameScreens.js';

describe('gameScreens', () => {
  describe('TRANSITION_DURATIONS', () => {
    it('has fade duration > 0', () => {
      expect(TRANSITION_DURATIONS.fade).toBeGreaterThan(0);
    });
    it('has wipe_left duration > 0', () => {
      expect(TRANSITION_DURATIONS.wipe_left).toBeGreaterThan(0);
    });
    it('has wipe_right duration > 0', () => {
      expect(TRANSITION_DURATIONS.wipe_right).toBeGreaterThan(0);
    });
    it('has zoom duration > 0', () => {
      expect(TRANSITION_DURATIONS.zoom).toBeGreaterThan(0);
    });
    it('wipes have equal duration', () => {
      expect(TRANSITION_DURATIONS.wipe_left).toBe(TRANSITION_DURATIONS.wipe_right);
    });
    it('zoom is slowest transition', () => {
      expect(TRANSITION_DURATIONS.zoom).toBeGreaterThanOrEqual(TRANSITION_DURATIONS.fade);
    });
  });

  describe('VALID_TRANSITIONS', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(VALID_TRANSITIONS)).toBe(true);
      expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);
    });

    it('each transition has from/to/duration/type', () => {
      for (const t of VALID_TRANSITIONS) {
        expect(t).toHaveProperty('from');
        expect(t).toHaveProperty('to');
        expect(t).toHaveProperty('duration');
        expect(t).toHaveProperty('type');
      }
    });

    it('has title to mode_select transition', () => {
      expect(VALID_TRANSITIONS.some(t => t.from === 'title' && t.to === 'mode_select')).toBe(true);
    });

    it('has character_select transition', () => {
      expect(VALID_TRANSITIONS.some(t => t.from === 'character_select')).toBe(true);
    });

    it('has battle to ko transition', () => {
      expect(VALID_TRANSITIONS.some(t => t.from === 'battle' && t.to === 'ko')).toBe(true);
    });

    it('has ko transition', () => {
      expect(VALID_TRANSITIONS.some(t => t.from === 'ko')).toBe(true);
    });

    it('has victory transition', () => {
      expect(VALID_TRANSITIONS.some(t => t.from === 'victory')).toBe(true);
    });

    it('covers key screen names', () => {
      const screens = new Set<string>();
      for (const t of VALID_TRANSITIONS) {
        screens.add(t.from as string);
        screens.add(t.to as string);
      }
      expect(screens.has('title')).toBe(true);
      expect(screens.has('battle')).toBe(true);
      expect(screens.has('ko')).toBe(true);
      expect(screens.has('victory')).toBe(true);
    });
  });
});
