import { describe, it, expect } from 'vitest';
import {
  popIn,
  fadeInHoldOut,
  burstIn,
  createRoundStartSequence,
  createKOSequence,
  createTimeOverSequence,
  createWinnerSequence,
} from '../src/state/announcePresets.js';

describe('announcePresets', () => {
  describe('popIn', () => {
    it('returns > 1 for early progress', () => expect(popIn(0)).toBeGreaterThan(1));
    it('returns 1 for progress >= 0.15', () => expect(popIn(0.2)).toBe(1));
    it('returns 1 at progress 1', () => expect(popIn(1)).toBe(1));
    it('decreases as progress increases from 0 to 0.15', () => {
      expect(popIn(0)).toBeGreaterThan(popIn(0.1));
    });
  });

  describe('fadeInHoldOut', () => {
    it('returns 0 at start', () => expect(fadeInHoldOut(0)).toBe(0));
    it('returns 1 at mid progress', () => expect(fadeInHoldOut(0.5)).toBe(1));
    it('returns 0 at end', () => expect(fadeInHoldOut(1)).toBeCloseTo(0, 1));
    it('fades in during first 15%', () => {
      expect(fadeInHoldOut(0.1)).toBeGreaterThan(0);
      expect(fadeInHoldOut(0.1)).toBeLessThan(1);
    });
  });

  describe('burstIn', () => {
    it('returns > 1 for early progress', () => expect(burstIn(0)).toBeGreaterThan(1));
    it('returns 1 for progress >= 0.1', () => expect(burstIn(0.2)).toBe(1));
    it('burstIn(0) > popIn(0)', () => expect(burstIn(0)).toBeGreaterThan(popIn(0)));
  });

  describe('createRoundStartSequence', () => {
    it('returns non-empty array of AnnounceStep', () => {
      const steps = createRoundStartSequence(1);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach(s => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('text');
        expect(s).toHaveProperty('duration');
        expect(s.duration).toBeGreaterThan(0);
      });
    });

    it('contains FIGHT text', () => {
      const steps = createRoundStartSequence(1);
      const texts = steps.map(s => s.text);
      expect(texts.some(t => t.includes('FIGHT') || t.includes('ROUND'))).toBe(true);
    });
  });

  describe('createKOSequence', () => {
    it('returns non-empty array', () => {
      const steps = createKOSequence();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].duration).toBeGreaterThan(0);
    });

    it('contains KO text', () => {
      const steps = createKOSequence();
      expect(steps.some(s => s.text.includes('K'))).toBe(true);
    });
  });

  describe('createTimeOverSequence', () => {
    it('returns non-empty array', () => {
      const steps = createTimeOverSequence();
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('createWinnerSequence', () => {
    it('returns non-empty array with winner name', () => {
      const steps = createWinnerSequence('Ryo');
      expect(steps.length).toBeGreaterThan(0);
    });
  });
});
