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

/** 获取配置值 */
export function getGameConfig(training: boolean = false): GameConfig {
  if (training) {
    return { ...KOF2002_CONFIG, ...TRAINING_CONFIG_OVERRIDES, round: { ...KOF2002_CONFIG.round, ...TRAINING_CONFIG_OVERRIDES.round } };
  }
  return KOF2002_CONFIG;
}
