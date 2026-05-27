import { describe, it, expect } from 'vitest';
import { KO_FLASH_DURATION, KO_ANNOUNCE_DURATION, KO_TRANSITION_PAUSE, CinematicState } from '../src/state/cinematicState.js';

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

  describe('hitstop decay — KOF2002 freeze→ease→resume', () => {
    it('triggerHitStop sets total and phase=full', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(8, 1, 1);
      expect(cs.hitStop).toBe(8);
      expect(cs.getHitStopPhase()).toBe('full');
      expect(cs.getHitStopProgress()).toBeCloseTo(0, 1);
    });

    it('isFrozen decrements hitStop and transitions full→ease→none', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(5, 0, 1);
      // frame 0: remaining=5 → full
      expect(cs.isFrozen()).toBe(true);
      expect(cs.hitStop).toBe(4);
      expect(cs.getHitStopPhase()).toBe('full');
      // frame 1: remaining=4 → full
      expect(cs.isFrozen()).toBe(true);
      expect(cs.hitStop).toBe(3);
      expect(cs.getHitStopPhase()).toBe('full');
      // frame 2: remaining=3 → full
      expect(cs.isFrozen()).toBe(true);
      expect(cs.hitStop).toBe(2);
      expect(cs.getHitStopPhase()).toBe('full');
      // frame 3: remaining=2 → full (>=2 threshold)
      expect(cs.isFrozen()).toBe(true);
      expect(cs.hitStop).toBe(1);
      expect(cs.getHitStopPhase()).toBe('ease');
      // frame 4: remaining=1 → ease
      expect(cs.isFrozen()).toBe(true);
      expect(cs.hitStop).toBe(0);
      expect(cs.getHitStopPhase()).toBe('ease');
      // frame 5: remaining=0 → unfrozen, phase=none
      expect(cs.isFrozen()).toBe(false);
      expect(cs.getHitStopPhase()).toBe('none');
    });

    it('progress increases from 0 to 1 during hitstop', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(4, 0, 0);
      expect(cs.getHitStopProgress()).toBeCloseTo(0);
      cs.isFrozen(); // tick 1
      expect(cs.getHitStopProgress()).toBeCloseTo(0.25, 1);
      cs.isFrozen(); // tick 2
      expect(cs.getHitStopProgress()).toBeCloseTo(0.5, 1);
      cs.isFrozen(); // tick 3
      expect(cs.getHitStopProgress()).toBeCloseTo(0.75, 1);
      cs.isFrozen(); // tick 4
      expect(cs.getHitStopProgress()).toBeCloseTo(1.0);
    });

    it('addHitStop accumulates total frames', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(4, 0, 0);
      cs.addHitStop(3, 0);
      expect(cs.hitStop).toBe(7);
      expect(cs.getHitStopProgress()).toBeCloseTo(0);
    });

    it('reset clears total and phase', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(8, 0, 1);
      cs.reset();
      expect(cs.hitStop).toBe(0);
      expect(cs.getHitStopPhase()).toBe('none');
      expect(cs.getHitStopProgress()).toBe(1);
    });

    it('resetForNewRound clears total and phase', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(8, 0, 1);
      cs.resetForNewRound();
      expect(cs.hitStop).toBe(0);
      expect(cs.getHitStopPhase()).toBe('none');
    });

    it('short hitstop (2 frames) goes directly to ease', () => {
      const cs = new CinematicState();
      cs.triggerHitStop(2, 0, 0);
      expect(cs.getHitStopPhase()).toBe('full');
      cs.isFrozen(); // remaining=1 → ease
      expect(cs.getHitStopPhase()).toBe('ease');
      cs.isFrozen(); // remaining=0 → ease
      expect(cs.getHitStopPhase()).toBe('ease');
      expect(cs.isFrozen()).toBe(false);
      expect(cs.getHitStopPhase()).toBe('none');
    });
  });
});
