/**
 * Feedback Manifest — 命中反馈数据驱动 manifest
 *
 * 将 hitstop、shake、spark、pushback 等反馈参数从硬编码常量抽成数据结构。
 * 每个攻击类型映射到一个反馈档位（light/heavy/special/dm/sdm），
 * 反馈参数由 manifest 驱动，hitCallback 从 manifest 读取。
 *
 * 归属: core/ — 纯类型、纯数据、纯函数，不持有运行时状态
 */

import { AttackType } from './types.js';

// ===== 类型定义 =====

/** 反馈档位 */
export type FeedbackTier = 'light' | 'heavy' | 'special' | 'dm' | 'sdm';

/** 单个反馈档位的参数 */
export interface FeedbackParams {
  /** 档位名称 */
  tier: FeedbackTier;
  /** 命中顿帧 (hitstop) */
  hitstop: number;
  /** 防御顿帧 (blockstop) */
  blockstop: number;
  /** 震动强度 */
  shakeIntensity: number;
  /** 震动持续帧 */
  shakeDuration: number;
  /** 防御震动强度 */
  blockShakeIntensity: number;
  /** 防御震动持续帧 */
  blockShakeDuration: number;
  /** 命中火花数量 */
  sparkCount: number;
  /** 命中火花尺寸缩放 */
  sparkSize: number;
  /** 火花星形比例 */
  sparkStarRatio: number;
  /** 命中闪白帧数 */
  hitFlashFrames: number;
  /** BGM侧链音量 */
  bgmDuckVolume: number;
  /** BGM侧链持续时间(ms) */
  bgmDuckDuration: number;
  /** 火花颜色方案 */
  sparkPalette: string[];
  /** 火花类型 */
  sparkType: 'small' | 'medium' | 'large' | 'burst' | 'mega';
  /** 火花速度缩放 */
  sparkSpeed: number;
  /** 命中推退力度乘数 */
  hitPushbackScale: number;
  /** 防御推退力度乘数 */
  blockPushbackScale: number;
}

/** 反馈 manifest */
export interface FeedbackManifest {
  version: number;
  tiers: Record<FeedbackTier, FeedbackParams>;
  attackTierMap: Partial<Record<AttackType, FeedbackTier>>;
}

// ===== 档位数据 — KOF2002 校准 =====

export const FEEDBACK_TIERS: Record<FeedbackTier, FeedbackParams> = {
  light: {
    tier: 'light',
    hitstop: 4,
    blockstop: 2,
    shakeIntensity: 2,
    shakeDuration: 4,
    blockShakeIntensity: 3,
    blockShakeDuration: 5,
    sparkCount: 6,
    sparkSize: 0.55,
    sparkStarRatio: 0.12,
    hitFlashFrames: 1,
    bgmDuckVolume: 0.78,
    bgmDuckDuration: 100,
    sparkPalette: ['#fff', '#ffcc00'],
    sparkType: 'small',
    sparkSpeed: 1.0,
    hitPushbackScale: 1.0,
    blockPushbackScale: 0.8,
  },
  heavy: {
    tier: 'heavy',
    hitstop: 8,
    blockstop: 4,
    shakeIntensity: 7,
    shakeDuration: 6,
    blockShakeIntensity: 4,
    blockShakeDuration: 6,
    sparkCount: 8,
    sparkSize: 0.85,
    sparkStarRatio: 0.25,
    hitFlashFrames: 2,
    bgmDuckVolume: 0.72,
    bgmDuckDuration: 120,
    sparkPalette: ['#ffcc00', '#ff6600'],
    sparkType: 'medium',
    sparkSpeed: 1.3,
    hitPushbackScale: 1.5,
    blockPushbackScale: 1.2,
  },
  special: {
    tier: 'special',
    hitstop: 13,
    blockstop: 5,
    shakeIntensity: 8,
    shakeDuration: 10,
    blockShakeIntensity: 5,
    blockShakeDuration: 7,
    sparkCount: 10,
    sparkSize: 1.1,
    sparkStarRatio: 0.3,
    hitFlashFrames: 3,
    bgmDuckVolume: 0.68,
    bgmDuckDuration: 150,
    sparkPalette: ['#88ccff', '#ffffff', '#4488ff'],
    sparkType: 'large',
    sparkSpeed: 1.6,
    hitPushbackScale: 2.0,
    blockPushbackScale: 1.5,
  },
  dm: {
    tier: 'dm',
    hitstop: 19,
    blockstop: 8,
    shakeIntensity: 14,
    shakeDuration: 16,
    blockShakeIntensity: 8,
    blockShakeDuration: 10,
    sparkCount: 14,
    sparkSize: 1.3,
    sparkStarRatio: 0.35,
    hitFlashFrames: 4,
    bgmDuckVolume: 0.6,
    bgmDuckDuration: 200,
    sparkPalette: ['#ffffff', '#ffff00', '#ff8800'],
    sparkType: 'burst',
    sparkSpeed: 2.0,
    hitPushbackScale: 3.0,
    blockPushbackScale: 2.0,
  },
  sdm: {
    tier: 'sdm',
    hitstop: 22,
    blockstop: 8,
    shakeIntensity: 14,
    shakeDuration: 18,
    blockShakeIntensity: 8,
    blockShakeDuration: 12,
    sparkCount: 18,
    sparkSize: 1.5,
    sparkStarRatio: 0.4,
    hitFlashFrames: 4,
    bgmDuckVolume: 0.55,
    bgmDuckDuration: 250,
    sparkPalette: ['#ffffff', '#ffcc00', '#ff4400'],
    sparkType: 'mega',
    sparkSpeed: 2.5,
    hitPushbackScale: 3.5,
    blockPushbackScale: 2.5,
  },
};

// ===== 攻击类型 → 档位映射 =====

function isDm(at: string): boolean {
  return at.startsWith('DM_') || at.startsWith('SDM_');
}
function isSpecial(at: string): boolean {
  return at.includes('RYO_') || at.includes('KYO_') || at.includes('IORI_')
    || at.includes('TERRY_') || at.includes('KIM_') || at.includes('LEONA_')
    || at.includes('ATHENA_') || at.includes('MAI_') || at.includes('RALF_')
    || at.includes('CLARK_') || at.includes('JOE_') || at.includes('ANDY_')
    || at.includes('BILLY_') || at.includes('CHOI_') || at.includes('CHANG_')
    || at.includes('MATURE_') || at.includes('VICE_') || at.includes('SHERMIE_')
    || at.includes('CHRIS_') || at.includes('YASHIRO_') || at.includes('MARY_')
    || at.includes('YAMAZAKI_') || at.includes('KASUMI_') || at.includes('XIANGFEI_')
    || at.includes('KULA_') || at === 'SPECIAL_PROJECTILE'
    || at.startsWith('ROBERT_') || at.startsWith('KDASH_');
}
function isHeavy(at: string): boolean {
  return at.endsWith('_C') || at.endsWith('_D') || at === 'STAND_CD'
    || at === 'JUMP_CD' || at === 'CROUCH_C' || at === 'CROUCH_D'
    || at === 'JUMP_C' || at === 'JUMP_D';
}

/**
 * 根据攻击类型推断反馈档位
 */
export function inferTier(attackType: AttackType): FeedbackTier {
  const at = attackType as string;
  if (at.startsWith('HSDM_')) return 'sdm';
  if (at.startsWith('SDM_')) return 'sdm';
  if (at.startsWith('DM_')) return 'dm';
  if (isSpecial(at) && !isDm(at)) return 'special';
  if (isHeavy(at)) return 'heavy';
  return 'light';
}

// ===== 全局 manifest 实例 =====

export const FEEDBACK_MANIFEST: FeedbackManifest = {
  version: 1,
  tiers: FEEDBACK_TIERS,
  attackTierMap: {
    // ===== Ryo 通常技 (light) =====
    STAND_A: 'light',
    STAND_B: 'light',
    CLOSE_A: 'light',
    CROUCH_A: 'light',
    CROUCH_B: 'light',
    JUMP_A: 'light',
    JUMP_B: 'light',
    CLOSE_B: 'light',

    // ===== Ryo 重攻击 (heavy) =====
    STAND_C: 'heavy',
    STAND_D: 'heavy',
    CLOSE_C: 'heavy',
    CLOSE_D: 'heavy',
    CROUCH_C: 'heavy',
    CROUCH_D: 'heavy',
    STAND_CD: 'heavy',
    JUMP_C: 'heavy',
    JUMP_D: 'heavy',
    JUMP_CD: 'heavy',

    // ===== Ryo 必杀技 (special) =====
    RYO_KOOU: 'special',
    RYO_KOOU_C: 'special',
    RYO_KO_HOU: 'special',
    RYO_KO_HOU_C: 'special',
    RYO_HIEN: 'special',
    RYO_HAOU: 'special',
    RYO_TSURIZAO: 'special',
    RYO_ORISHI: 'special',

    // ===== Ryo DM / SDM / HSDM =====
    DM_TEN_HA_OU: 'dm',
    SDM_TEN_HA_OU: 'sdm',
    DM_RYUKO_RANBU: 'dm',
    SDM_RYUKO_RANBU: 'sdm',
    HSDM_RYUKO_RANBU: 'sdm',
  } as Partial<Record<AttackType, FeedbackTier>>,
};

// ===== 查询函数 =====

/**
 * 根据攻击类型获取反馈参数
 */
export function getFeedback(attackType: AttackType): FeedbackParams {
  const manifest = FEEDBACK_MANIFEST;
  const explicitTier = manifest.attackTierMap[attackType];
  const tier = explicitTier ?? inferTier(attackType);
  return manifest.tiers[tier];
}

/**
 * 直接获取某个档位的反馈参数
 */
export function getFeedbackByTier(tier: FeedbackTier): FeedbackParams {
  return FEEDBACK_MANIFEST.tiers[tier];
}
