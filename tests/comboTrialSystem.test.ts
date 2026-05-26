/**
 * comboTrialSystem.test.ts -- 连击试练系统测试
 *
 * 覆盖范围:
 *  1. 试练数据结构验证 (5 tests)
 *  2. Timing窗口合理性 (3 tests)
 *  3. 伤害计算 (3 tests)
 *  4. 难度递进 (2 tests)
 *  5. 评估逻辑: 正确序列通过 (2 tests)
 *  6. 评估逻辑: 错误招式失败 (2 tests)
 *  7. 评估逻辑: 超时失败 (2 tests)
 *  8. 评估逻辑: 部分完成跟踪 (2 tests)
 *  9. 评分计算 (2 tests)
 *  总计: 23 tests
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import { FRAME_DATA } from '../src/core/constants.js';
import {
  type ComboTrial,
  type TrialRuntime,
  createTrialRuntime,
  resetTrialRuntime,
  onTrialHit,
  tickTrialTimeout,
  buildEvaluation,
  calculateTotalDamage,
  calculateScaledTotalDamage,
  calculateScore,
  validateTrial,
  getCancelWindowFrames,
  getDefaultTimingWindow,
} from '../src/state/comboTrial.js';
import {
  COMBO_TRIALS,
  getTrialsForCharacter,
  getTrialsByDifficulty,
  getTrialById,
  getTrialCharacterIds,
} from '../src/state/comboTrialData.js';

// ===== 1. 试练数据结构验证 =====

describe('Combo Trial data structure', () => {
  it('each trial has valid steps with required fields', () => {
    for (const trial of COMBO_TRIALS) {
      expect(trial.id).toBeTruthy();
      expect(trial.charId).toBeTruthy();
      expect(trial.name).toBeTruthy();
      expect(trial.steps.length).toBeGreaterThanOrEqual(1);
      for (const s of trial.steps) {
        expect(s.attackType).toBeTruthy();
        expect(s.timingWindow).toBeGreaterThanOrEqual(1);
        expect(s.timingWindow).toBeLessThanOrEqual(30);
        expect(['normal', 'rapid', 'special', 'super', 'free']).toContain(s.cancelType);
        expect(s.description).toBeTruthy();
      }
    }
  });

  it('all trial attack types exist in FRAME_DATA', () => {
    for (const trial of COMBO_TRIALS) {
      for (const s of trial.steps) {
        const data = FRAME_DATA[s.attackType as keyof typeof FRAME_DATA];
        expect(data, `Missing FRAME_DATA for ${s.attackType} in trial ${trial.id}`).toBeDefined();
      }
    }
  });

  it('totalDamage matches FRAME_DATA calculation', () => {
    for (const trial of COMBO_TRIALS) {
      const calculated = calculateTotalDamage(trial.steps);
      expect(trial.totalDamage).toBe(calculated);
    }
  });

  it('validateTrial passes for all built-in trials', () => {
    for (const trial of COMBO_TRIALS) {
      const errors = validateTrial(trial);
      expect(errors, `Trial ${trial.id} validation errors: ${errors.join(', ')}`).toEqual([]);
    }
  });

  it('validateTrial catches invalid trial data', () => {
    const badTrial: ComboTrial = {
      id: '',
      charId: '',
      name: '',
      difficulty: 'beginner',
      steps: [],
      totalDamage: 999,
    };
    const errors = validateTrial(badTrial);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Trial id is required');
    expect(errors).toContain('Trial charId is required');
    expect(errors).toContain('Trial name is required');
    expect(errors).toContain('Trial must have at least one step');
  });
});

// ===== 2. Timing窗口合理性 =====

describe('Timing window constraints', () => {
  it('all timing windows are within 3-12 frames', () => {
    for (const trial of COMBO_TRIALS) {
      for (const s of trial.steps) {
        expect(s.timingWindow).toBeGreaterThanOrEqual(3);
        expect(s.timingWindow).toBeLessThanOrEqual(12);
      }
    }
  });

  it('beginner trials have wider timing than expert', () => {
    const beginner = COMBO_TRIALS.filter(t => t.difficulty === 'beginner');
    const expert = COMBO_TRIALS.filter(t => t.difficulty === 'expert');
    for (const bt of beginner) {
      for (const et of expert) {
        const bAvg = bt.steps.reduce((s, st) => s + st.timingWindow, 0) / bt.steps.length;
        const eAvg = et.steps.reduce((s, st) => s + st.timingWindow, 0) / et.steps.length;
        expect(bAvg).toBeGreaterThanOrEqual(eAvg);
      }
    }
  });

  it('getDefaultTimingWindow respects difficulty progression', () => {
    for (const cancelType of ['normal', 'rapid', 'special', 'super', 'free'] as const) {
      const beg = getDefaultTimingWindow('beginner', cancelType);
      const inter = getDefaultTimingWindow('intermediate', cancelType);
      const adv = getDefaultTimingWindow('advanced', cancelType);
      const exp = getDefaultTimingWindow('expert', cancelType);
      expect(beg).toBeGreaterThanOrEqual(inter);
      expect(inter).toBeGreaterThanOrEqual(adv);
      expect(adv).toBeGreaterThanOrEqual(exp);
    }
  });
});

// ===== 3. 伤害计算 =====

describe('Damage calculation', () => {
  it('calculateTotalDamage sums raw FRAME_DATA damages', () => {
    const trial = getTrialById('kyo_01')!;
    // STAND_A=33 + STAND_B=42 + STAND_C=100 = 175
    expect(trial.totalDamage).toBe(33 + 42 + 100);
  });

  it('calculateScaledTotalDamage applies combo scaling', () => {
    const trial = getTrialById('kyo_01')!;
    const scaled = calculateScaledTotalDamage(trial.steps);
    // 3 hits, all in 1-3 range = 100% scale, so scaled = raw
    expect(scaled).toBe(trial.totalDamage);
  });

  it('scaled damage is less than raw for longer combos', () => {
    const trial = getTrialById('iori_02')!;
    const scaled = calculateScaledTotalDamage(trial.steps);
    // 4 hits: first 3 at 100%, 4th at 85%
    expect(scaled).toBeLessThan(trial.totalDamage);
  });
});

// ===== 4. 难度递进 =====

describe('Difficulty coverage', () => {
  it('each character has trials of each difficulty', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const trials = getTrialsForCharacter(charId);
      const difficulties = new Set(trials.map(t => t.difficulty));
      expect(difficulties.has('beginner')).toBe(true);
      expect(difficulties.has('intermediate')).toBe(true);
      expect(difficulties.has('advanced')).toBe(true);
      expect(difficulties.has('expert')).toBe(true);
    }
  });

  it('each character has exactly 5 trials', () => {
    expect(getTrialsForCharacter('kyo')).toHaveLength(5);
    expect(getTrialsForCharacter('iori')).toHaveLength(5);
    expect(getTrialsForCharacter('ryo')).toHaveLength(5);
  });
});

// ===== 5. 评估: 正确序列 → 通过 =====

describe('Trial evaluation: correct sequence passes', () => {
  it('Kyo beginner trial completes with correct moves', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);
    let frame = 0;

    const r1 = onTrialHit(runtime, trial, AttackType.STAND_A, frame, 33);
    expect(r1.currentStep).toBe(1);
    expect(r1.completed).toBe(false);
    expect(r1.failed).toBe(false);
    expect(r1.hitCount).toBe(1);

    frame += 5;
    const r2 = onTrialHit(runtime, trial, AttackType.STAND_B, frame, 42);
    expect(r2.currentStep).toBe(2);
    expect(r2.completed).toBe(false);
    expect(r2.hitCount).toBe(2);

    frame += 5;
    const r3 = onTrialHit(runtime, trial, AttackType.STAND_C, frame, 100);
    expect(r3.completed).toBe(true);
    expect(r3.failed).toBe(false);
    expect(r3.hitCount).toBe(3);
    expect(r3.damageDealt).toBe(33 + 42 + 100);
  });

  it('single-step trial completes on first hit', () => {
    const singleStepTrial: ComboTrial = {
      id: 'test_single',
      charId: 'kyo',
      name: 'Single',
      difficulty: 'beginner',
      steps: [{ attackType: AttackType.STAND_A, timingWindow: 10, cancelType: 'normal', description: 'A' }],
      totalDamage: 33,
    };
    const runtime = createTrialRuntime(singleStepTrial.id);
    const r = onTrialHit(runtime, singleStepTrial, AttackType.STAND_A, 0, 33);
    expect(r.completed).toBe(true);
    expect(r.hitCount).toBe(1);
  });
});

// ===== 6. 评估: 错误招式 → 失败 =====

describe('Trial evaluation: wrong move fails', () => {
  it('wrong attack type on first step fails immediately', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);
    const r = onTrialHit(runtime, trial, AttackType.STAND_D, 0, 75);
    expect(r.failed).toBe(true);
    expect(r.completed).toBe(false);
    expect(r.hitCount).toBe(0);
    expect(r.score).toBe(0);
  });

  it('wrong attack type on later step fails', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);

    // First step correct
    onTrialHit(runtime, trial, AttackType.STAND_A, 0, 33);
    // Second step wrong
    const r = onTrialHit(runtime, trial, AttackType.STAND_D, 5, 75);
    expect(r.failed).toBe(true);
    expect(r.hitCount).toBe(1);
  });
});

// ===== 7. 评估: 超时 → 失败 =====

describe('Trial evaluation: timeout fails', () => {
  it('tickTrialTimeout marks failure when window expires', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);

    // First hit at frame 0
    onTrialHit(runtime, trial, AttackType.STAND_A, 0, 33);
    // Current step (STAND_B) has timingWindow=12
    // Tick to frame 13 -> exceeds window
    const r = tickTrialTimeout(runtime, trial, 13);
    expect(r.failed).toBe(true);
  });

  it('tickTrialTimeout does not fail within window', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);

    onTrialHit(runtime, trial, AttackType.STAND_A, 0, 33);
    // Frame 5 is within 12-frame window
    const r = tickTrialTimeout(runtime, trial, 5);
    expect(r.failed).toBe(false);
  });
});

// ===== 8. 评估: 部分完成跟踪 =====

describe('Trial evaluation: partial completion tracking', () => {
  it('tracks currentStep correctly through partial progress', () => {
    const trial = getTrialById('iori_03')!;
    const runtime = createTrialRuntime(trial.id);
    let frame = 0;

    const r1 = onTrialHit(runtime, trial, AttackType.JUMP_C, frame, 58);
    expect(r1.currentStep).toBe(1);
    expect(r1.completed).toBe(false);

    frame += 4;
    const r2 = onTrialHit(runtime, trial, AttackType.STAND_C, frame, 100);
    expect(r2.currentStep).toBe(2);
    expect(r2.hitCount).toBe(2);
    expect(r2.damageDealt).toBe(58 + 100);
  });

  it('runtime accumulates damageDealt across steps', () => {
    const trial = getTrialById('ryo_02')!;
    const runtime = createTrialRuntime(trial.id);
    let frame = 0;

    onTrialHit(runtime, trial, AttackType.STAND_C, frame, 100);
    frame += 5;
    onTrialHit(runtime, trial, AttackType.RYO_KOOU, frame, 75);
    frame += 5;
    const r = onTrialHit(runtime, trial, AttackType.RYO_KOOU, frame, 75);
    expect(r.hitCount).toBe(3);
    expect(r.damageDealt).toBe(100 + 75 + 75);
  });
});

// ===== 9. 评分计算 =====

describe('Score calculation', () => {
  it('completed trial with perfect timing gets high score', () => {
    const trial = getTrialById('kyo_01')!;
    const runtime = createTrialRuntime(trial.id);
    let frame = 0;

    // Hit all steps with minimal frame gaps (perfect timing)
    onTrialHit(runtime, trial, AttackType.STAND_A, frame, 33);
    frame += 3; // very close to ideal
    onTrialHit(runtime, trial, AttackType.STAND_B, frame, 42);
    frame += 3;
    onTrialHit(runtime, trial, AttackType.STAND_C, frame, 100);

    const ev = buildEvaluation(runtime);
    expect(ev.completed).toBe(true);
    expect(ev.score).toBeGreaterThanOrEqual(90);
  });

  it('failed trial always has score 0', () => {
    const runtime: TrialRuntime = {
      trialId: 'test',
      currentStep: 0,
      completed: false,
      failed: true,
      hitCount: 2,
      damageDealt: 100,
      timingDeviations: [],
      lastHitFrame: 0,
      waitingForFirstInput: false,
    };
    expect(calculateScore(runtime)).toBe(0);
  });
});

// ===== 辅助查询 =====

describe('Trial query functions', () => {
  it('getTrialCharacterIds returns kyo, iori, ryo', () => {
    const ids = getTrialCharacterIds();
    expect(ids).toContain('kyo');
    expect(ids).toContain('iori');
    expect(ids).toContain('ryo');
    expect(ids).toHaveLength(3);
  });

  it('getTrialsByDifficulty returns correct trials', () => {
    const beg = getTrialsByDifficulty('beginner');
    expect(beg).toHaveLength(3); // one per character
    for (const t of beg) {
      expect(t.difficulty).toBe('beginner');
    }
  });
});
