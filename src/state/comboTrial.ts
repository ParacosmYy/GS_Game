/**
 * comboTrial.ts -- 连击试练系统 (Trial Mode / Mission Mode)
 *
 * 定义连击试练的数据结构和评估逻辑。
 * 纯数据 + 评估，不包含渲染逻辑。
 */
import { AttackType } from '../core/types.js';
import {
  FRAME_DATA,
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
} from '../core/constants.js';

// ===== 数据结构 =====

/** 取消类型：从前一招过渡到这一招的方式 */
export type CancelType = 'normal' | 'rapid' | 'special' | 'super' | 'free';

/** 试练难度 */
export type TrialDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** 连击试练中的一个步骤 */
export interface ComboTrialStep {
  /** 需要执行的招式 */
  attackType: AttackType;
  /** 输入缓冲窗口（帧数） */
  timingWindow: number;
  /** 如何从前一招取消到这一招 */
  cancelType: CancelType;
  /** 人类可读的操作说明 */
  description: string;
}

/** 一条完整的连击试练 */
export interface ComboTrial {
  /** 唯一标识 */
  id: string;
  /** 角色ID (与CharacterDefinition.id一致) */
  charId: string;
  /** 试练名称 */
  name: string;
  /** 难度等级 */
  difficulty: TrialDifficulty;
  /** 连击步骤 */
  steps: ComboTrialStep[];
  /** 预期总伤害（基于FRAME_DATA计算） */
  totalDamage: number;
}

/** 试练评估结果 */
export interface TrialEvaluation {
  /** 当前执行到第几步（0-indexed） */
  currentStep: number;
  /** 是否全部完成 */
  completed: boolean;
  /** 是否失败 */
  failed: boolean;
  /** 实际命中数 */
  hitCount: number;
  /** 实际造成伤害 */
  damageDealt: number;
  /** 评分 (0-100)，基于时机精确度 */
  score: number;
}

/** 试练运行时状态（跟踪玩家在试练中的进度） */
export interface TrialRuntime {
  trialId: string;
  currentStep: number;
  completed: boolean;
  failed: boolean;
  hitCount: number;
  damageDealt: number;
  /** 每步实际输入时机与理想时机的偏差帧数 */
  timingDeviations: number[];
  /** 上一步命中时的帧号 */
  lastHitFrame: number;
  /** 是否正在等待第一步输入 */
  waitingForFirstInput: boolean;
}

// ===== 辅助函数 =====

/** 根据取消类型获取对应的缓冲窗口帧数 */
export function getCancelWindowFrames(cancelType: CancelType): number {
  switch (cancelType) {
    case 'normal': return CANCEL_WINDOW_NORMAL;
    case 'rapid': return CANCEL_WINDOW_RAPID;
    case 'super': return CANCEL_WINDOW_SUPER;
    case 'free': return CANCEL_WINDOW_FREE;
  }
  return CANCEL_WINDOW_NORMAL; // fallback
}

/** 根据难度获取默认的timing窗口 */
export function getDefaultTimingWindow(difficulty: TrialDifficulty, cancelType: CancelType): number {
  const base = getCancelWindowFrames(cancelType);
  switch (difficulty) {
    case 'beginner': return Math.min(base * 3, 12);  // 宽松3倍，上限12帧
    case 'intermediate': return Math.min(base * 2, 10); // 宽松2倍，上限10帧
    case 'advanced': return Math.min(base * 1.5, 8);  // 宽松1.5倍，上限8帧
    case 'expert': return base;                        // 原始严格窗口
  }
}

/** 计算试练的预期总伤害（基于FRAME_DATA，不考虑缩放） */
export function calculateTotalDamage(steps: ComboTrialStep[]): number {
  let total = 0;
  for (const step of steps) {
    const data = FRAME_DATA[step.attackType as keyof typeof FRAME_DATA];
    if (data) {
      total += data.damage;
    }
  }
  return total;
}

/** 计算带连击缩放的预期总伤害 */
export function calculateScaledTotalDamage(steps: ComboTrialStep[]): number {
  let total = 0;
  let comboCount = 0;
  for (const step of steps) {
    const data = FRAME_DATA[step.attackType as keyof typeof FRAME_DATA];
    if (data) {
      comboCount++;
      // 分段缩放: 1-3=100%, 4-6=85%, 7-9=70%, 10+=60%
      let scale = 0.60;
      if (comboCount <= 3) scale = 1.0;
      else if (comboCount <= 6) scale = 0.85;
      else if (comboCount <= 9) scale = 0.70;
      total += Math.round(data.damage * scale);
    }
  }
  return total;
}

// ===== 评估逻辑 =====

/** 创建新的试练运行时状态 */
export function createTrialRuntime(trialId: string): TrialRuntime {
  return {
    trialId,
    currentStep: 0,
    completed: false,
    failed: false,
    hitCount: 0,
    damageDealt: 0,
    timingDeviations: [],
    lastHitFrame: 0,
    waitingForFirstInput: true,
  };
}

/** 重置试练运行时状态 */
export function resetTrialRuntime(runtime: TrialRuntime): void {
  runtime.currentStep = 0;
  runtime.completed = false;
  runtime.failed = false;
  runtime.hitCount = 0;
  runtime.damageDealt = 0;
  runtime.timingDeviations = [];
  runtime.lastHitFrame = 0;
  runtime.waitingForFirstInput = true;
}

/**
 * 当玩家命中一招时调用。
 * 判断是否匹配当前试练步骤，以及时机是否在窗口内。
 *
 * @param runtime - 试练运行时状态
 * @param trial - 当前试练定义
 * @param attackType - 玩家实际使用的招式
 * @param currentFrame - 当前游戏帧号
 * @param damage - 本次命中造成的实际伤害
 * @returns 更新后的评估结果
 */
export function onTrialHit(
  runtime: TrialRuntime,
  trial: ComboTrial,
  attackType: AttackType,
  currentFrame: number,
  damage: number,
): TrialEvaluation {
  if (runtime.completed || runtime.failed) {
    return buildEvaluation(runtime);
  }

  const step = trial.steps[runtime.currentStep];

  // 检查招式是否匹配
  if (attackType !== step.attackType) {
    // 错误招式 -> 失败
    runtime.failed = true;
    return buildEvaluation(runtime);
  }

  // 检查时机窗口
  if (!runtime.waitingForFirstInput) {
    const elapsed = currentFrame - runtime.lastHitFrame;
    if (elapsed > step.timingWindow) {
      // 超时 -> 失败
      runtime.failed = true;
      return buildEvaluation(runtime);
    }
    // 记录时机偏差
    const deviation = Math.abs(elapsed - getIdealTiming(runtime, trial));
    runtime.timingDeviations.push(deviation);
  }

  // 命中成功
  runtime.hitCount++;
  runtime.damageDealt += damage;
  runtime.lastHitFrame = currentFrame;
  runtime.waitingForFirstInput = false;

  // 检查是否完成
  if (runtime.currentStep >= trial.steps.length - 1) {
    runtime.completed = true;
  } else {
    runtime.currentStep++;
  }

  return buildEvaluation(runtime);
}

/**
 * 每帧调用：检查时机窗口是否过期。
 * 当距离上一步命中已超过当前步骤的timingWindow时，标记为失败。
 *
 * @param runtime - 试练运行时状态
 * @param trial - 当前试练定义
 * @param currentFrame - 当前游戏帧号
 * @returns 更新后的评估结果
 */
export function tickTrialTimeout(
  runtime: TrialRuntime,
  trial: ComboTrial,
  currentFrame: number,
): TrialEvaluation {
  if (runtime.completed || runtime.failed || runtime.waitingForFirstInput) {
    return buildEvaluation(runtime);
  }

  const step = trial.steps[runtime.currentStep];
  const elapsed = currentFrame - runtime.lastHitFrame;
  if (elapsed > step.timingWindow) {
    runtime.failed = true;
  }

  return buildEvaluation(runtime);
}

/** 根据运行时状态构建评估结果 */
export function buildEvaluation(runtime: TrialRuntime): TrialEvaluation {
  return {
    currentStep: runtime.currentStep,
    completed: runtime.completed,
    failed: runtime.failed,
    hitCount: runtime.hitCount,
    damageDealt: runtime.damageDealt,
    score: calculateScore(runtime),
  };
}

/** 计算评分 (0-100)，基于时机精确度 */
export function calculateScore(runtime: TrialRuntime): number {
  if (runtime.failed) return 0;
  if (!runtime.completed) return 0;

  if (runtime.timingDeviations.length === 0) {
    // 单步试练，完成即满分
    return 100;
  }

  // 平均偏差越小，分数越高
  // 偏差0帧=100分，偏差达到窗口上限=50分
  const avgDeviation = runtime.timingDeviations.reduce((a, b) => a + b, 0)
    / runtime.timingDeviations.length;

  // 每帧偏差扣2分，最低0分
  const penalty = Math.min(avgDeviation * 2, 50);
  return Math.round(Math.max(0, 100 - penalty));
}

/** 获取理想时机（简化：返回步骤timingWindow的一半作为理想时机） */
function getIdealTiming(runtime: TrialRuntime, trial: ComboTrial): number {
  if (runtime.currentStep <= 0) return 0;
  const prevStep = trial.steps[runtime.currentStep - 1];
  return prevStep ? Math.floor(prevStep.timingWindow / 2) : 0;
}

/** 验证试练数据完整性 */
export function validateTrial(trial: ComboTrial): string[] {
  const errors: string[] = [];

  if (!trial.id) errors.push('Trial id is required');
  if (!trial.charId) errors.push('Trial charId is required');
  if (!trial.name) errors.push('Trial name is required');
  if (trial.steps.length === 0) errors.push('Trial must have at least one step');

  for (let i = 0; i < trial.steps.length; i++) {
    const step = trial.steps[i];
    if (!step.attackType) {
      errors.push(`Step ${i}: attackType is required`);
    }
    if (step.timingWindow < 1 || step.timingWindow > 30) {
      errors.push(`Step ${i}: timingWindow ${step.timingWindow} out of range [1, 30]`);
    }
    if (!['normal', 'rapid', 'special', 'super', 'free'].includes(step.cancelType)) {
      errors.push(`Step ${i}: invalid cancelType "${step.cancelType}"`);
    }
    // 验证attackType在FRAME_DATA中存在
    const data = FRAME_DATA[step.attackType as keyof typeof FRAME_DATA];
    if (!data) {
      errors.push(`Step ${i}: attackType "${step.attackType}" not found in FRAME_DATA`);
    }
  }

  // 验证总伤害
  const calculated = calculateTotalDamage(trial.steps);
  if (calculated !== trial.totalDamage) {
    errors.push(
      `totalDamage mismatch: declared ${trial.totalDamage}, calculated ${calculated}`
    );
  }

  return errors;
}
