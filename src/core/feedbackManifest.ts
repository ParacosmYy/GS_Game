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
export type FeedbackTier = 'light' | 'heavy' | 'special' | 'dm' | 'sdm' | 'hsdm';

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
  sparkType: 'small' | 'medium' | 'large' | 'burst' | 'mega' | 'hyper';
  /** 火花速度缩放 */
  sparkSpeed: number;
  /** 命中推退力度乘数 */
  hitPushbackScale: number;
  /** 防御推退力度乘数 */
  blockPushbackScale: number;
  /** 冲击环数量: light=1, heavy=1, special=2, DM=3, SDM=4 */
  impactRingCount: number;
  /** 冲击环基础尺寸缩放 */
  impactRingScale: number;
  /** 受击方身体晃动幅度 (hitstun body shake, px) */
  hitstunBodyShake: number;
  /** 受击方身体晃动衰减速度 (higher = faster decay) */
  hitstunBodyShakeDecay: number;
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
    impactRingCount: 1,
    impactRingScale: 0.6,
    hitstunBodyShake: 1.5,
    hitstunBodyShakeDecay: 0.3,
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
    impactRingCount: 1,
    impactRingScale: 1.0,
    hitstunBodyShake: 3.0,
    hitstunBodyShakeDecay: 0.2,
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
    impactRingCount: 2,
    impactRingScale: 1.2,
    hitstunBodyShake: 4.5,
    hitstunBodyShakeDecay: 0.15,
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
    impactRingCount: 3,
    impactRingScale: 1.6,
    hitstunBodyShake: 5.0,
    hitstunBodyShakeDecay: 0.12,
  },
  sdm: {
    tier: 'sdm',
    hitstop: 22,
    blockstop: 8,
    shakeIntensity: 18,
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
    impactRingCount: 4,
    impactRingScale: 2.0,
    hitstunBodyShake: 6.5,
    hitstunBodyShakeDecay: 0.1,
  },
  hsdm: {
    tier: 'hsdm',
    hitstop: 26,
    blockstop: 10,
    shakeIntensity: 22,
    shakeDuration: 22,
    blockShakeIntensity: 10,
    blockShakeDuration: 14,
    sparkCount: 22,
    sparkSize: 1.7,
    sparkStarRatio: 0.45,
    hitFlashFrames: 5,
    bgmDuckVolume: 0.45,
    bgmDuckDuration: 300,
    sparkPalette: ['#ffffff', '#ff44ff', '#ff0088', '#ffcc00'],
    sparkType: 'hyper',
    sparkSpeed: 3.0,
    hitPushbackScale: 4.0,
    blockPushbackScale: 3.0,
    impactRingCount: 5,
    impactRingScale: 2.4,
    hitstunBodyShake: 8.0,
    hitstunBodyShakeDecay: 0.08,
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
    || at.startsWith('ROBERT_') || at.startsWith('KDASH_')
    || at.startsWith('KFM_')
    || at.startsWith('SPECIAL_') || at.startsWith('CMD_');
}
function isHeavy(at: string): boolean {
  return at.endsWith('_C') || at.endsWith('_D') || at === 'STAND_CD'
    || at === 'JUMP_CD' || at === 'CROUCH_C' || at === 'CROUCH_D'
    || at === 'JUMP_C' || at === 'JUMP_D';
}

function isThrow(at: string): boolean {
  return at === 'THROW' || at === 'THROW_FORWARD' || at === 'THROW_BACK';
}

/**
 * 根据攻击类型推断反馈档位
 */
export function inferTier(attackType: AttackType): FeedbackTier {
  const at = attackType as string;
  if (at.startsWith('HSDM_')) return 'hsdm';
  if (at.startsWith('SDM_')) return 'sdm';
  if (at.startsWith('DM_')) return 'dm';
  if (isSpecial(at) && !isDm(at)) return 'special';
  if (isThrow(at)) return 'special';
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
    RYO_KOOUKEN_D: 'special',
    RYO_HIO_HACKER: 'special',
    RYO_ZANRETSU_KEN: 'special',

    // ===== Ryo DM / SDM / HSDM =====
    DM_TEN_HA_OU: 'dm',
    SDM_TEN_HA_OU: 'sdm',
    DM_RYUKO_RANBU: 'dm',
    SDM_RYUKO_RANBU: 'sdm',
    HSDM_RYUKO_RANBU: 'hsdm',

    // ===== Kyo 必杀技 (special) =====
    KYO_YAMIBARAI: 'special',
    KYO_YAMIBARAI_C: 'special',
    KYO_ONIYAKI: 'special',
    KYO_ONIYAKI_C: 'special',
    KYO_75KAI: 'special',
    KYO_75KAI_2: 'special',
    KYO_RED_KICK: 'special',
    KYO_ARAGAMI: 'special',
    KYO_ARAGAMI_KONOKIZU: 'special',
    KYO_ARAGAMI_YANOSABI: 'special',
    KYO_NANASE: 'special',
    KYO_KOTO_TSUKI: 'special',
    KYO_YAKISOGI: 'special',
    KYO_DOKUGAMI: 'special',
    KYO_TSUMIYOMI: 'special',
    KYO_BATSUYOMI: 'special',
    CMD_GOFU_YOU: 'special',
    CMD_88SHIKI: 'special',
    CMD_NARAKU: 'special',

    // ===== Kyo DM / SDM =====
    DM_OROCHINAGI: 'dm',
    SDM_OROCHINAGI: 'sdm',
    HSDM_OROCHINAGI: 'hsdm',

    // ===== Iori 必杀技 (special) =====
    IORI_YAMIBARAI: 'special',
    IORI_YAMIBARAI_C: 'special',
    IORI_ONIYAKI: 'special',
    IORI_ONIYAKI_C: 'special',
    IORI_KOTOTSUKI: 'special',
    IORI_KUZUKAZE: 'special',
    IORI_AOIHANA: 'special',
    IORI_AOIHANA_2: 'special',
    IORI_AOIHANA_3: 'special',
    IORI_AOIHANA_C: 'special',
    IORI_AOIHANA_C_2: 'special',
    IORI_AOIHANA_C_3: 'special',
    IORI_KOTOTSUKI_D: 'special',
    IORI_YUMEYUMI: 'special',
    IORI_KATANUGI: 'special',
    IORI_YUKIWARUI: 'special',

    // ===== Iori DM / SDM / HSDM =====
    DM_YATAGARASU: 'dm',
    SDM_YATAGARASU: 'sdm',
    HSDM_YAOTOME: 'hsdm',

    // ===== Terry 必杀技 (special) =====
    TERRY_POWER_WAVE: 'special',
    TERRY_ROUND_WAVE: 'special',
    TERRY_BURN_KNUCKLE: 'special',
    TERRY_BURN_KNUCKLE_C: 'special',
    TERRY_BURN_KNUCKLE_D: 'special',
    TERRY_CRACK_SHOT: 'special',
    TERRY_CRACK_SHOT_D: 'special',
    TERRY_POWER_DUNK: 'special',
    TERRY_POWER_DUNK_D: 'special',
    TERRY_RISING_TACKLE: 'special',
    TERRY_RISING_TACKLE_C: 'special',
    TERRY_BACK_KNCKLE: 'special',
    TERRY_COMBO_BLOW: 'special',

    // ===== Terry DM / SDM / HSDM =====
    DM_POWER_GEYSER: 'dm',
    DM_POWER_GEYSER_A: 'dm',
    DM_POWER_GEYSER_C: 'dm',
    DM_HIGH_ANGLE_GEYSER: 'dm',
    DM_HIGH_ANGLE_GEYSER_B: 'dm',
    DM_HIGH_ANGLE_GEYSER_D: 'dm',
    SDM_TRIPLE_GEYSER: 'sdm',
    SDM_POWER_GEYSER_EX: 'sdm',
    HSDM_POWER_GEYSER: 'hsdm',

    // ===== Kim 必杀技 (special) =====
    KIM_HIENZAN: 'special',
    KIM_HIENZAN_D: 'special',
    KIM_HANGETSU: 'special',
    KIM_HANGETSU_D: 'special',
    KIM_SANREN: 'special',
    KIM_SANREN_2: 'special',
    KIM_HAKI: 'special',
    KIM_HISHOU: 'special',
    KIM_HISHOU_KICK: 'special',
    KIM_HANSEN: 'special',

    // ===== Kim DM / SDM / HSDM =====
    DM_PHOENIX_KICK: 'dm',
    DM_PHOENIX_HITEN: 'dm',
    SDM_PHOENIX_HITEN: 'sdm',
    SDM_PHOENIX_HITEN_EX: 'sdm',
    HSDM_PHOENIX_HITEN: 'hsdm',

    // ===== Athena 必杀技 (special) =====
    ATHENA_PSYCHO_BALL: 'special',
    ATHENA_PSYCHO_SWORD: 'special',
    ATHENA_PSYCHO_REFLECT: 'special',
    ATHENA_PHOENIX_ARROW: 'special',
    ATHENA_TELEPORT: 'special',
    ATHENA_SUPER_PSYCHO_THROUGH: 'special',
    // ===== Athena DM / SDM =====
    DM_ATHENA_SHINING_CRYSTAL_BIT: 'dm',
    SDM_ATHENA_SHINING_CRYSTAL_BIT: 'sdm',
    DM_ATHENA_PHOENIX_FANG_ARROW: 'dm',

    // ===== Vice 必杀技 (special) =====
    VICE_MAYHEM: 'special',
    VICE_MAYHEM_D: 'special',
    VICE_BLACKEND: 'special',
    VICE_OUTRAGE: 'special',
    VICE_DECIDE: 'special',
    VICE_GORE_FEST: 'special',
    VICE_NEGATIVE_STALK: 'special',
    // ===== Vice DM / SDM =====
    DM_VICE_NEGATIVE_OWNER: 'dm',
    SDM_VICE_NEGATIVE_OWNER: 'sdm',
    DM_VICE_WITHERING_SURFACE: 'dm',

    // ===== Yamazaki 必杀技 (special) =====
    YAMAZAKI_BAIKAI: 'special',
    YAMAZAKI_HEBI_TSUKAI: 'special',
    YAMAZAKI_HEBI_TSUKAI_C: 'special',
    YAMAZAKI_HEBI_TSUKAI_D: 'special',
    YAMAZAKI_SANDAN: 'special',
    YAMAZAKI_SADO: 'special',
    YAMAZAKI_GUILLOTINE: 'special',
    YAMAZAKI_DRILL: 'special',
    YAMAZAKI_YAKIUCHI: 'special',
    // ===== Yamazaki DM / SDM =====
    DM_YAMAZAKI_GUILLOTINE: 'dm',
    SDM_YAMAZAKI_GUILLOTINE: 'sdm',
    DM_YAMAZAKI_DRILL: 'dm',

    // ===== Shermie 必杀技 (special) =====
    SHERMIE_SHOOT: 'special',
    SHERMIE_SHOOT_C: 'special',
    SHERMIE_CARNIVAL: 'special',
    SHERMIE_AXLE_SPIN: 'special',
    SHERMIE_SPIRAL: 'special',
    SHERMIE_SPIRAL_C: 'special',
    SHERMIE_SUPLEX: 'special',
    SHERMIE_WHIP: 'special',
    SHERMIE_WHIP_C: 'special',
    // ===== Shermie DM / SDM =====
    DM_SHERMIE_CARNIVAL: 'dm',
    SDM_SHERMIE_CARNIVAL: 'sdm',
    DM_SHERMIE_FLASH: 'dm',
    SDM_SHERMIE_FLASH: 'sdm',

    // ===== Benimaru 必杀技 (special) =====
    BENIMARU_RAIJINKEN: 'special',
    BENIMARU_RAIJINKEN_C: 'special',
    BENIMARU_SUPER_INAZUMA: 'special',
    BENIMARU_BENIMARU_COLLIDER: 'special',
    BENIMARU_BENIMARU_COLLIDER_D: 'special',
    BENIMARU_SHINKICK: 'special',
    BENIMARU_FLYING_DRILL: 'special',
    BENIMARU_IAI_GERI: 'special',
    BENIMARU_HANDOU_SANDAN: 'special',
    // ===== Benimaru DM / SDM =====
    DM_BENIMARU_RAIJINKEN: 'dm',
    SDM_BENIMARU_RAIJINKEN: 'sdm',
    DM_BENIMARU_GENEI_HURRICANE: 'dm',

    // ===== Heidern 必杀技 (special) =====
    HEIDERN_STORM_BRINGER: 'special',
    HEIDERN_MOON_SLASHER: 'special',
    HEIDERN_NECK_ROLLER: 'special',
    HEIDERN_CROSS_CUTTER: 'special',
    HEIDERN_KILLING_BRING: 'special',
    HEIDERN_ASSASSIN_STRIKE: 'special',
    // ===== Heidern DM / SDM =====
    DM_HEIDERN_END: 'dm',
    SDM_HEIDERN_END: 'sdm',
    DM_HEIDERN_EXECUTE: 'dm',

    // ===== Yuri 必杀技 (special) =====
    YURI_KO_OU_KEN: 'special',
    YURI_HAOH_SHO_KO_KEN: 'special',
    YURI_CHOU_UPPER: 'special',
    YURI_HYAKU_RETSU_BINTA: 'special',
    YURI_HIEN_HOU_OU_KYAKU: 'special',
    YURI_HISHOU_KUURETSU_ZAN: 'special',
    YURI_RAI_KEN: 'special',
    YURI_UPPER_BLOCK: 'heavy',
    YURI_LOWER_BLOCK: 'heavy',
    // ===== Yuri DM / SDM / HSDM =====
    DM_YURI_HAOH_SHO_KO_KEN: 'dm',
    DM_YURI_HIEN_HOU_OU_KYAKU: 'dm',
    SDM_YURI_HAOH_SHO_KO_KEN: 'sdm',
    SDM_YURI_HIEN_HOU_OU_KYAKU: 'sdm',
    HSDM_YURI_HISHOU_KUURETSU_ZAN: 'hsdm',
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
 * Resolve the feedback tier name for an attack type.
 * Used to store tier info on Fighter for renderer consumption.
 */
export function getFeedbackTier(attackType: AttackType): FeedbackTier {
  const explicitTier = FEEDBACK_MANIFEST.attackTierMap[attackType];
  return explicitTier ?? inferTier(attackType);
}

/**
 * 直接获取某个档位的反馈参数
 */
export function getFeedbackByTier(tier: FeedbackTier): FeedbackParams {
  return FEEDBACK_MANIFEST.tiers[tier];
}

// ===== 角色专属 DM/SDM/HSDM 火花色板 =====
// KOF2002 每个角色超必杀有独特元素色调

const CHARACTER_DM_PALETTES: Record<string, { dm: string[]; sdm: string[]; hsdm: string[] }> = {
  kyo: {
    dm: ['#ff4400', '#ff8800', '#ffcc00', '#ffffff'],
    sdm: ['#ff2200', '#ff6600', '#ffaa00', '#ffffff', '#ffff66'],
    hsdm: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffffff'],
  },
  iori: {
    dm: ['#8800ff', '#cc44ff', '#ff00aa', '#ffffff'],
    sdm: ['#6600cc', '#aa22ff', '#ff0088', '#ffffff', '#ff44cc'],
    hsdm: ['#440088', '#8800ff', '#cc00ff', '#ff0066', '#ffffff'],
  },
  ryo: {
    dm: ['#0088ff', '#44ccff', '#ffffff', '#ffcc00'],
    sdm: ['#0066cc', '#2299ff', '#66ddff', '#ffffff', '#ffee88'],
    hsdm: ['#0044aa', '#0088ff', '#44ccff', '#ffffff', '#ffff00'],
  },
};

/** Get character-specific spark palette for DM/SDM/HSDM tier. Falls back to tier default. */
export function getCharacterDMPalette(charId: string, tier: FeedbackTier): string[] | null {
  const char = CHARACTER_DM_PALETTES[charId];
  if (!char) return null;
  if (tier === 'hsdm') return char.hsdm;
  if (tier === 'sdm') return char.sdm;
  if (tier === 'dm') return char.dm;
  return null;
}
