import { describe, it, expect } from 'vitest';
import {
  getCancelWindowFrames,
  getDefaultTimingWindow,
  calculateTotalDamage,
  calculateScaledTotalDamage,
  createTrialRuntime,
  resetTrialRuntime,
  buildEvaluation,
  calculateScore,
  validateTrial,
  onTrialHit,
  tickTrialTimeout,
} from '../src/state/comboTrial.js';
import { AttackType } from '../src/core/types.js';
import type { ComboTrial, ComboTrialStep, TrialRuntime } from '../src/state/comboTrial.js';

describe('comboTrial', () => {
  describe('getCancelWindowFrames', () => {
    it('returns positive number for normal', () => {
      expect(getCancelWindowFrames('normal')).toBeGreaterThan(0);
    });
    it('returns positive number for rapid', () => {
      expect(getCancelWindowFrames('rapid')).toBeGreaterThan(0);
    });
    it('returns positive number for super', () => {
      expect(getCancelWindowFrames('super')).toBeGreaterThan(0);
    });
    it('returns positive number for free', () => {
      expect(getCancelWindowFrames('free')).toBeGreaterThan(0);
    });
  });

  describe('getDefaultTimingWindow', () => {
    it('beginner >= expert for same cancelType', () => {
      expect(getDefaultTimingWindow('beginner', 'normal'))
        .toBeGreaterThanOrEqual(getDefaultTimingWindow('expert', 'normal'));
    });
    it('all difficulty/cancel combos return positive', () => {
      const diffs = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
      const cancels = ['normal', 'rapid', 'special', 'super', 'free'] as const;
      for (const d of diffs) {
        for (const c of cancels) {
          expect(getDefaultTimingWindow(d, c)).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('calculateTotalDamage', () => {
    it('sums damage from FRAME_DATA', () => {
      const steps: ComboTrialStep[] = [
        { attackType: AttackType.STAND_A, timingWindow: 10, cancelType: 'normal', description: 'A' },
        { attackType: AttackType.STAND_B, timingWindow: 10, cancelType: 'rapid', description: 'B' },
      ];
      const total = calculateTotalDamage(steps);
      expect(total).toBeGreaterThan(0);
    });

    it('empty steps return 0', () => {
      expect(calculateTotalDamage([])).toBe(0);
    });
  });

  describe('calculateScaledTotalDamage', () => {
    it('returns <= unscaled total', () => {
      const steps: ComboTrialStep[] = Array.from({ length: 10 }, (_, i) => ({
        attackType: AttackType.STAND_A,
        timingWindow: 10,
        cancelType: 'normal' as const,
        description: `step${i}`,
      }));
      const unscaled = calculateTotalDamage(steps);
      const scaled = calculateScaledTotalDamage(steps);
      expect(scaled).toBeLessThanOrEqual(unscaled);
    });
  });

  describe('createTrialRuntime', () => {
    it('creates fresh runtime', () => {
      const rt = createTrialRuntime('test_01');
      expect(rt.trialId).toBe('test_01');
      expect(rt.currentStep).toBe(0);
      expect(rt.completed).toBe(false);
      expect(rt.failed).toBe(false);
      expect(rt.hitCount).toBe(0);
      expect(rt.waitingForFirstInput).toBe(true);
    });
  });

  describe('resetTrialRuntime', () => {
    it('resets all fields', () => {
      const rt = createTrialRuntime('test');
      rt.hitCount = 5;
      rt.completed = true;
      resetTrialRuntime(rt);
      expect(rt.hitCount).toBe(0);
      expect(rt.completed).toBe(false);
    });
  });

  describe('buildEvaluation', () => {
    it('builds from runtime', () => {
      const rt = createTrialRuntime('test');
      const ev = buildEvaluation(rt);
      expect(ev.currentStep).toBe(0);
      expect(ev.completed).toBe(false);
      expect(ev.failed).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('returns 0 for failed', () => {
      const rt = createTrialRuntime('test');
      rt.failed = true;
      expect(calculateScore(rt)).toBe(0);
    });
    it('returns 0 for incomplete', () => {
      expect(calculateScore(createTrialRuntime('test'))).toBe(0);
    });
    it('returns 100 for completed single-step with no deviations', () => {
      const rt = createTrialRuntime('test');
      rt.completed = true;
      rt.timingDeviations = [];
      expect(calculateScore(rt)).toBe(100);
    });
  });

  describe('onTrialHit', () => {
    const simpleTrial: ComboTrial = {
      id: 'test', charId: 'ryo', name: 'test', difficulty: 'beginner',
      steps: [
        { attackType: AttackType.STAND_A, timingWindow: 12, cancelType: 'normal', description: 'A' },
        { attackType: AttackType.STAND_B, timingWindow: 12, cancelType: 'rapid', description: 'B' },
      ],
      totalDamage: 0,
    };

    it('advances on correct attack', () => {
      const rt = createTrialRuntime('test');
      const ev = onTrialHit(rt, simpleTrial, AttackType.STAND_A, 0, 5);
      expect(ev.failed).toBe(false);
      expect(rt.currentStep).toBe(1);
      expect(rt.hitCount).toBe(1);
    });

    it('fails on wrong attack', () => {
      const rt = createTrialRuntime('test');
      const ev = onTrialHit(rt, simpleTrial, AttackType.STAND_C, 0, 5);
      expect(ev.failed).toBe(true);
    });

    it('completes when all steps hit', () => {
      const rt = createTrialRuntime('test');
      onTrialHit(rt, simpleTrial, AttackType.STAND_A, 0, 5);
      const ev = onTrialHit(rt, simpleTrial, AttackType.STAND_B, 5, 5);
      expect(ev.completed).toBe(true);
      expect(ev.hitCount).toBe(2);
    });
  });

  describe('tickTrialTimeout', () => {
    it('fails when window expires', () => {
      const trial: ComboTrial = {
        id: 't', charId: 'ryo', name: 't', difficulty: 'beginner',
        steps: [
          { attackType: AttackType.STAND_A, timingWindow: 5, cancelType: 'normal', description: 'A' },
          { attackType: AttackType.STAND_B, timingWindow: 5, cancelType: 'rapid', description: 'B' },
        ],
        totalDamage: 0,
      };
      const rt = createTrialRuntime('t');
      onTrialHit(rt, trial, AttackType.STAND_A, 0, 5);
      const ev = tickTrialTimeout(rt, trial, 10);
      expect(ev.failed).toBe(true);
    });
  });

  describe('validateTrial', () => {
    it('validates correct trial with 0 errors', () => {
      const trial: ComboTrial = {
        id: 'test', charId: 'ryo', name: 'test', difficulty: 'beginner',
        steps: [
          { attackType: AttackType.STAND_A, timingWindow: 10, cancelType: 'normal', description: 'A' },
        ],
        totalDamage: calculateTotalDamage([{ attackType: AttackType.STAND_A, timingWindow: 10, cancelType: 'normal', description: 'A' }]),
      };
      const errors = validateTrial(trial);
      expect(errors.length).toBe(0);
    });

    it('catches missing id', () => {
      const trial = { id: '', charId: 'ryo', name: 'test', difficulty: 'beginner' as const, steps: [{ attackType: AttackType.STAND_A, timingWindow: 10, cancelType: 'normal' as const, description: 'A' }], totalDamage: 0 };
      expect(validateTrial(trial).length).toBeGreaterThan(0);
    });
  });
});
