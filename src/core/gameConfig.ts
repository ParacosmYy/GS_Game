/**
 * Game Configuration — 可配置游戏参数 manifest
 *
 * 将硬编码的游戏参数集中为可配置的数据结构。
 * 未来可支持从外部 JSON 加载、训练模式覆盖、联机同步等。
 *
 * 归属: core/ — 纯类型、纯数据
 */

/** 单局配置 */
export interface RoundConfig {
  /** 回合时长 (秒) */
  roundTime: number;
  /** 最大回合数 */
  maxRounds: number;
  /** 需要赢得的回合数 */
  winsNeeded: number;
}

/** 伤害配置 */
export interface DamageConfig {
  /** 连击递减步长 */
  comboScaleStep: number;
  /** 通常技最低缩放 */
  comboScaleMinNormal: number;
  /** 必杀技最低缩放 */
  comboScaleMinSpecial: number;
  /** DM最低缩放 */
  comboScaleMinDM: number;
  /** 削血比例 (防御时受到的伤害比例) */
  chipDamageRatio: number;
  /** Counter Hit 伤害加成 */
  chDamageBonus: number;
  /** Counter Hit 硬直加成 */
  chHitstunBonus: number;
}

/** 能量槽配置 */
export interface MeterConfig {
  /** 每条能量所需积累值 */
  meterPerStock: number;
  /** 最大能量条数 */
  maxStocks: number;
  /** MAX模式持续时间 (ticks) */
  maxModeDuration: number;
  /** MAX模式伤害加成 */
  maxModeDamageBonus: number;
  /** MAX模式防御加成 */
  maxModeDefenseBonus: number;
  /** 绝境HP阈值比例 */
  desperationThreshold: number;
  /** 绝境DM伤害加成 */
  desperationDmBonus: number;
}

/** 晕眩配置 */
export interface StunConfig {
  /** 晕眩槽最大值 */
  stunGaugeMax: number;
  /** 晕眩持续时间最小值 (ticks) */
  dizzyDurationMin: number;
  /** 晕眩持续时间最大值 (ticks) */
  dizzyDurationMax: number;
  /** 晕眩槽衰减速率 (每tick) */
  stunDecayRate: number;
}

/** 防御配置 */
export interface GuardConfig {
  /** 防御槽最大值 */
  guardGaugeMax: number;
  /** 防御破碎持续时间 (ticks) */
  guardCrushDuration: number;
  /** 防御槽恢复速率 */
  guardGaugeRecoveryRate: number;
}

/** 全局游戏配置 */
export interface GameConfig {
  round: RoundConfig;
  damage: DamageConfig;
  meter: MeterConfig;
  stun: StunConfig;
  guard: GuardConfig;
}

/** KOF2002 标准配置 */
export const KOF2002_CONFIG: GameConfig = {
  round: {
    roundTime: 99,
    maxRounds: 3,
    winsNeeded: 2,
  },
  damage: {
    comboScaleStep: 0.05,
    comboScaleMinNormal: 0.10,
    comboScaleMinSpecial: 0.20,
    comboScaleMinDM: 0.30,
    chipDamageRatio: 0.25,
    chDamageBonus: 1.0,
    chHitstunBonus: 1.5,
  },
  meter: {
    meterPerStock: 100,
    maxStocks: 3,
    maxModeDuration: 900,
    maxModeDamageBonus: 1.2,
    maxModeDefenseBonus: 0.875,
    desperationThreshold: 0.25,
    desperationDmBonus: 1.25,
  },
  stun: {
    stunGaugeMax: 100,
    dizzyDurationMin: 120,
    dizzyDurationMax: 180,
    stunDecayRate: 0.25,
  },
  guard: {
    guardGaugeMax: 100,
    guardCrushDuration: 60,
    guardGaugeRecoveryRate: 0.15,
  },
};

/** 训练模式配置覆盖 */
export const TRAINING_CONFIG_OVERRIDES: Partial<GameConfig> = {
  round: {
    roundTime: Infinity,
    maxRounds: 1,
    winsNeeded: 1,
  },
};

// ============================================================================
// Runtime Config State
// ============================================================================

/** Current active config — mutable at runtime */
let activeConfig: GameConfig = structuredClone(KOF2002_CONFIG);

/** Get the current active config (fresh copy) */
export function getActiveConfig(): GameConfig {
  return activeConfig;
}

/** 获取配置值 */
export function getGameConfig(training: boolean = false): GameConfig {
  if (training) {
    return deepMerge(structuredClone(KOF2002_CONFIG), TRAINING_CONFIG_OVERRIDES);
  }
  return activeConfig;
}

// ============================================================================
// Config Hot-Reload
// ============================================================================

/** Deep-merge a partial config into the active config.
 *  Logs each changed key for traceability. */
export function updateGameConfig(partial: Partial<GameConfig>): void {
  const oldConfig = activeConfig;
  activeConfig = deepMerge(structuredClone(activeConfig), partial);
  logConfigChanges(oldConfig, activeConfig, partial);
}

/** Reset config back to KOF2002 defaults */
export function resetGameConfig(): void {
  activeConfig = structuredClone(KOF2002_CONFIG);
}

// ============================================================================
// Config Validation
// ============================================================================

export interface ConfigValidationError {
  path: string;
  message: string;
}

/** Validate a GameConfig (full or partial). Returns errors array (empty = valid). */
export function validateGameConfig(config: Partial<GameConfig>): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  if (config.round) {
    validatePositive(config.round.roundTime, 'round.roundTime', errors, 'must be > 0 or Infinity');
    if (config.round.roundTime !== Infinity && config.round.roundTime <= 0) {
      errors.push({ path: 'round.roundTime', message: 'must be > 0 or Infinity' });
    }
    validatePositive(config.round.maxRounds, 'round.maxRounds', errors);
    validatePositive(config.round.winsNeeded, 'round.winsNeeded', errors);
  }

  if (config.damage) {
    validatePositive(config.damage.comboScaleStep, 'damage.comboScaleStep', errors);
    validatePositive(config.damage.comboScaleMinNormal, 'damage.comboScaleMinNormal', errors);
    validatePositive(config.damage.comboScaleMinSpecial, 'damage.comboScaleMinSpecial', errors);
    validatePositive(config.damage.comboScaleMinDM, 'damage.comboScaleMinDM', errors);
    validatePercentage(config.damage.chipDamageRatio, 'damage.chipDamageRatio', errors);
    validatePositive(config.damage.chDamageBonus, 'damage.chDamageBonus', errors);
    validatePositive(config.damage.chHitstunBonus, 'damage.chHitstunBonus', errors);
  }

  if (config.meter) {
    validatePositive(config.meter.meterPerStock, 'meter.meterPerStock', errors);
    if (config.meter.maxStocks !== undefined) {
      if (!Number.isInteger(config.meter.maxStocks) || config.meter.maxStocks < 1 || config.meter.maxStocks > 5) {
        errors.push({ path: 'meter.maxStocks', message: 'must be integer 1-5' });
      }
    }
    validatePositive(config.meter.maxModeDuration, 'meter.maxModeDuration', errors);
    validatePositive(config.meter.maxModeDamageBonus, 'meter.maxModeDamageBonus', errors);
    validatePositive(config.meter.maxModeDefenseBonus, 'meter.maxModeDefenseBonus', errors);
    validatePercentage(config.meter.desperationThreshold, 'meter.desperationThreshold', errors);
    validatePositive(config.meter.desperationDmBonus, 'meter.desperationDmBonus', errors);
  }

  if (config.stun) {
    validatePositive(config.stun.stunGaugeMax, 'stun.stunGaugeMax', errors);
    validatePositive(config.stun.dizzyDurationMin, 'stun.dizzyDurationMin', errors);
    validatePositive(config.stun.dizzyDurationMax, 'stun.dizzyDurationMax', errors);
    validatePositive(config.stun.stunDecayRate, 'stun.stunDecayRate', errors);
    if (config.stun.dizzyDurationMin !== undefined && config.stun.dizzyDurationMax !== undefined
      && config.stun.dizzyDurationMin > config.stun.dizzyDurationMax) {
      errors.push({ path: 'stun.dizzyDurationMin', message: 'must be <= dizzyDurationMax' });
    }
  }

  if (config.guard) {
    validatePositive(config.guard.guardGaugeMax, 'guard.guardGaugeMax', errors);
    validatePositive(config.guard.guardCrushDuration, 'guard.guardCrushDuration', errors);
    validatePositive(config.guard.guardGaugeRecoveryRate, 'guard.guardGaugeRecoveryRate', errors);
  }

  return errors;
}

/** Validate and apply — only applies if validation passes */
export function safeUpdateGameConfig(partial: Partial<GameConfig>): ConfigValidationError[] {
  const errors = validateGameConfig(partial);
  if (errors.length === 0) {
    updateGameConfig(partial);
  }
  return errors;
}

// ============================================================================
// Internal helpers
// ============================================================================

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      (result as any)[key] = deepMerge({ ...tv }, sv as any);
    } else if (sv !== undefined) {
      (result as any)[key] = sv;
    }
  }
  return result;
}

function validatePositive(value: number | undefined, path: string, errors: ConfigValidationError[], extra?: string): void {
  if (value === undefined) return;
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    errors.push({ path, message: extra ?? 'must be a positive number' });
  }
}

function validatePercentage(value: number | undefined, path: string, errors: ConfigValidationError[]): void {
  if (value === undefined) return;
  if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 1) {
    errors.push({ path, message: 'must be between 0 and 1' });
  }
}

function logConfigChanges(old: GameConfig, _new: GameConfig, partial: Partial<GameConfig>): void {
  const sections = Object.keys(partial) as (keyof GameConfig)[];
  for (const section of sections) {
    if (!partial[section]) continue;
    const keys = Object.keys(partial[section]!) as string[];
    for (const key of keys) {
      const oldVal = (old[section] as any)?.[key];
      const newVal = (_new[section] as any)?.[key];
      if (oldVal !== newVal) {
        console.log(`[Config] ${String(section)}.${key}: ${oldVal} -> ${newVal}`);
      }
    }
  }
}
