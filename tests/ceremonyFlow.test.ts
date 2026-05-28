/**
 * Ceremony & Flow regression tests
 * Protects ceremony/flow features: three-beat round start, announce sequence ceremony,
 * transition types, announcer calls, countdown SFX.
 */
import { describe, it, expect } from 'vitest';
import { createRoundStartSequence, createKOSequence, createTimeOverSequence, createWinnerSequence } from '../src/state/announcePresets.js';

describe('Ceremony & Flow regression tests', () => {

  // === Three-beat round start sequence ===
  describe('createRoundStartSequence — three-beat', () => {
    it('has exactly 3 steps: ROUND → READY → FIGHT', () => {
      const seq = createRoundStartSequence(1);
      expect(seq).toHaveLength(3);
    });

    it('step order is round_display, ready_display, fight_display', () => {
      const seq = createRoundStartSequence(2);
      expect(seq[0].id).toBe('round_display');
      expect(seq[1].id).toBe('ready_display');
      expect(seq[2].id).toBe('fight_display');
    });

    it('READY step has correct properties', () => {
      const seq = createRoundStartSequence(1);
      const ready = seq[1];
      expect(ready.text).toBe('READY?');
      expect(ready.duration).toBe(40);
      expect(ready.sfxId).toBe('ready');
      expect(ready.fillColor).toBe('#ffffff');
      expect(ready.glowColor).toBe('#4488ff');
    });

    it('FIGHT step still has burst animation', () => {
      const seq = createRoundStartSequence(1);
      const fight = seq[2];
      expect(fight.text).toBe('FIGHT!');
      expect(fight.duration).toBe(50);
      expect(fight.sfxId).toBe('fight');
      expect(fight.flash).not.toBeNull();
      expect(fight.shockwaveRings).toBeGreaterThanOrEqual(3);
    });

    it('ROUND step shows correct round number', () => {
      const seq3 = createRoundStartSequence(3);
      expect(seq3[0].text).toBe('ROUND 3');
    });

    it('final round shows FINAL ROUND text', () => {
      const seq = createRoundStartSequence(5, true);
      expect(seq[0].text).toBe('FINAL ROUND');
      expect(seq[0].fillColor).toBe('#ff4400');
      expect(seq[0].flash).not.toBeNull();
    });

    it('total sequence duration is 170 frames (80+40+50)', () => {
      const seq = createRoundStartSequence(1);
      const total = seq.reduce((sum, s) => sum + s.duration, 0);
      expect(total).toBe(170);
    });
  });

  // === KO sequence ===
  describe('createKOSequence', () => {
    it('non-perfect KO has 1 step', () => {
      const seq = createKOSequence(false);
      expect(seq).toHaveLength(1);
      expect(seq[0].id).toBe('ko_display');
    });

    it('perfect KO has 2 steps: KO + PERFECT', () => {
      const seq = createKOSequence(true);
      expect(seq).toHaveLength(2);
      expect(seq[0].id).toBe('ko_display');
      expect(seq[1].id).toBe('perfect_display');
      expect(seq[1].text).toBe('PERFECT!');
    });
  });

  // === Time over sequence ===
  describe('createTimeOverSequence', () => {
    it('has exactly 1 step', () => {
      const seq = createTimeOverSequence();
      expect(seq).toHaveLength(1);
      expect(seq[0].id).toBe('time_over_display');
      expect(seq[0].text).toBe('TIME OVER');
    });
  });

  // === Winner sequence ===
  describe('createWinnerSequence', () => {
    it('shows winner name', () => {
      const seq = createWinnerSequence('Ryo Sakazaki');
      expect(seq).toHaveLength(1);
      expect(seq[0].text).toBe('Ryo Sakazaki');
      expect(seq[0].sfxId).toBe('victory');
    });
  });

  // === Announce step structure integrity ===
  describe('announce step structure', () => {
    it('every step has required fields', () => {
      const allSteps = [
        ...createRoundStartSequence(1),
        ...createKOSequence(false),
        ...createKOSequence(true),
        ...createTimeOverSequence(),
        ...createWinnerSequence('Test'),
      ];
      for (const step of allSteps) {
        expect(step.id).toBeTruthy();
        expect(step.text).toBeTruthy();
        expect(step.duration).toBeGreaterThan(0);
        expect(step.fillColor).toBeTruthy();
        expect(step.glowColor).toBeTruthy();
        expect(step.fontSize).toBeGreaterThan(0);
        expect(typeof step.scaleCurve).toBe('function');
        expect(typeof step.alphaCurve).toBe('function');
        expect(step.sfxId).toBeTruthy();
      }
    });

    it('scale curves accept [0,1] range', () => {
      const steps = createRoundStartSequence(1);
      for (const step of steps) {
        expect(step.scaleCurve(0)).toBeGreaterThan(0);
        expect(step.scaleCurve(0.5)).toBeGreaterThan(0);
        expect(step.scaleCurve(1)).toBeGreaterThan(0);
      }
    });

    it('alpha curves stay in [0,1] range', () => {
      const steps = createRoundStartSequence(1);
      for (const step of steps) {
        for (const p of [0, 0.1, 0.5, 0.9, 1]) {
          const alpha = step.alphaCurve(p);
          expect(alpha).toBeGreaterThanOrEqual(0);
          expect(alpha).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});
