import { describe, it, expect } from 'vitest';
import { KO_FLASH_DURATION, KO_ANNOUNCE_DURATION, KO_TRANSITION_PAUSE } from '../src/state/cinematicState.js';

describe('cinematicState', () => {
  describe('KO constants', () => {
    it('KO_FLASH_DURATION is positive', () => {
      expect(KO_FLASH_DURATION).toBeGreaterThan(0);
    });
    it('KO_ANNOUNCE_DURATION is positive', () => {
      expect(KO_ANNOUNCE_DURATION).toBeGreaterThan(0);
    });
    it('KO_TRANSITION_PAUSE is non-negative', () => {
      expect(KO_TRANSITION_PAUSE).toBeGreaterThanOrEqual(0);
    });
    it('flash is shorter than announce', () => {
      expect(KO_FLASH_DURATION).toBeLessThan(KO_ANNOUNCE_DURATION);
    });
    it('all are numbers', () => {
      expect(typeof KO_FLASH_DURATION).toBe('number');
      expect(typeof KO_ANNOUNCE_DURATION).toBe('number');
      expect(typeof KO_TRANSITION_PAUSE).toBe('number');
    });
  });
});
