/**
 * Per-Frame Hitbox Data (逐帧判定框)
 *
 * Generic normals + export table. Character specials in attackFramesSpecials.ts.
 */
import type { AttackFrame, AttackFrameTable } from './types.js';
import { AttackType } from './types.js';
import {
  KYO_75KAI_FRAMES, KYO_75KAI_2_FRAMES, KYO_RED_KICK_FRAMES,
  KYO_ARAGAMI_FRAMES, KYO_ARAGAMI_KONOKIZU_FRAMES, KYO_ARAGAMI_YANOSABI_FRAMES,
  KYO_NANASE_FRAMES, KYO_KOTO_TSUKI_FRAMES, KYO_YAKISOGI_FRAMES,
  KYO_DOKUGAMI_FRAMES, KYO_TSUMIYOMI_FRAMES, KYO_BATSUYOMI_FRAMES,
  KYO_ONIYAKI_FRAMES, KYO_ONIYAKI_C_FRAMES, KYO_YAMIBARAI_FRAMES, KYO_YAMIBARAI_C_FRAMES,
  IORI_AOIHANA_FRAMES, IORI_AOIHANA_2_FRAMES, IORI_AOIHANA_3_FRAMES,
  IORI_YAMIBARAI_FRAMES, IORI_YAMIBARAI_C_FRAMES,
  IORI_ONIYAKI_FRAMES, IORI_ONIYAKI_C_FRAMES, IORI_KOTOTSUKI_FRAMES, IORI_KUZUKAZE_FRAMES,
  TERRY_BURN_KNUCKLE_FRAMES, TERRY_CRACK_SHOT_FRAMES, TERRY_POWER_WAVE_FRAMES,
  TERRY_POWER_DUNK_FRAMES, TERRY_RISING_TACKLE_FRAMES,
  KIM_HIENZAN_FRAMES, KIM_HANGETSU_FRAMES, KIM_HAKI_FRAMES, KIM_HISHOU_FRAMES, KIM_SANREN_FRAMES,
  RYO_KOOU_FRAMES, RYO_KOOU_C_FRAMES, RYO_KO_HOU_FRAMES, RYO_KO_HOU_C_FRAMES,
  RYO_HIEN_FRAMES, RYO_HAOU_FRAMES, DM_TEN_HA_OU_FRAMES,
  LEONA_MOON_SLASH_FRAMES, LEONA_MOON_SLASH_C_FRAMES,
  LEONA_EAR_RING_FRAMES, LEONA_EAR_RING_C_FRAMES,
  LEONA_GRAND_SABER_FRAMES, LEONA_BALTIC_FRAMES, DM_V_SLASHER_FRAMES,
  DM_OROCHINAGI_FRAMES, DM_YATAGARASU_FRAMES, DM_POWER_GEYSER_FRAMES, DM_PHOENIX_KICK_FRAMES,
  ATHENA_PSYCHO_BALL_FRAMES, ATHENA_PSYCHO_BALL_C_FRAMES,
  ATHENA_PSYCHO_SWORD_FRAMES, ATHENA_PSYCHO_SWORD_C_FRAMES,
  ATHENA_PHOENIX_ARROW_FRAMES,
  DM_SHINING_CRYSTAL_BIT_FRAMES,
  MAI_KA_CHO_SEN_FRAMES, MAI_KA_CHO_SEN_C_FRAMES,
  MAI_HISHO_RYU_EN_JIN_FRAMES, MAI_RYU_EN_BU_FRAMES,
  DM_HAKA_OTOSHI_FRAMES,
  CLARK_ARGENTINE_FRAMES, CLARK_ARGENTINE_C_FRAMES, CLARK_FLASH_ELBOW_FRAMES,
  CLARK_VULCAN_FRAMES, DM_ARGENTINE_DM_FRAMES, SDM_ARGENTINE_DM_FRAMES,
  RALF_VULCAN_FRAMES, RALF_VULCAN_C_FRAMES, RALF_BACKBREAKER_FRAMES,
  RALF_KICK_FRAMES, DM_GALACTICA_PHANTOM_FRAMES,
  JOE_HURRICANE_FRAMES, JOE_HURRICANE_C_FRAMES,
  JOE_TIGER_KICK_FRAMES, JOE_TIGER_KICK_D_FRAMES,
  JOE_BAKURETSUKEN_FRAMES, JOE_OUGON_KAKATO_FRAMES,
  DM_SCREW_UPPER_FRAMES,
  ANDY_HISHOU_KEN_FRAMES, ANDY_HISHOU_KEN_C_FRAMES,
  ANDY_SHOURYUU_DAN_FRAMES, ANDY_SHOURYUU_DAN_C_FRAMES,
  ANDY_ZANEI_RYUSEI_KEN_FRAMES, ANDY_ZANEI_RYUSEI_KEN_D_FRAMES,
  ANDY_GEKI_HISHOU_KEN_FRAMES,
  DM_CHO_REPPA_DAN_FRAMES, SDM_CHO_REPPA_DAN_FRAMES,
  BILLY_SANSETSU_KON_FRAMES, BILLY_SANSETSU_KON_C_FRAMES,
  BILLY_SENPU_KON_FRAMES, BILLY_SENPU_KON_C_FRAMES,
  BILLY_HIEN_ZAN_FRAMES, BILLY_HIEN_ZAN_D_FRAMES,
  DM_KAEN_SENPU_JIN_FRAMES, SDM_KAEN_SENPU_JIN_FRAMES,
} from './attackFramesSpecials.js';

const F: (
  attack: Array<{ ox: number; oy: number; w: number; h: number }>,
  body?: { ox: number; oy: number; w: number; h: number } | null,
  throwBoxes?: Array<{ ox: number; oy: number; w: number; h: number }>,
) => AttackFrame =
  (attack, body, throwBoxes) => {
    const frame: AttackFrame = { attack, bodyOverride: body ?? null };
    if (throwBoxes) frame.throwBoxes = throwBoxes;
    return frame;
  };

// ===== 站立远距离攻击 (Far Stand) =====
const FAR_STAND_A_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -75, w: 35, h: 22 }]),
  F([{ ox: 48, oy: -73, w: 40, h: 22 }]),
  F([{ ox: 48, oy: -73, w: 40, h: 22 }]),
];

const FAR_STAND_B_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -35, w: 40, h: 28 }]),
  F([{ ox: 45, oy: -33, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -33, w: 48, h: 30 }]),
];

const FAR_STAND_C_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -70, w: 30, h: 30 }], { ox: 5, oy: 0, w: -10, h: 0 }),
  F([{ ox: 55, oy: -68, w: 50, h: 35 }]),
  F([{ ox: 58, oy: -65, w: 55, h: 35 }]),
  F([{ ox: 50, oy: -70, w: 45, h: 30 }]),
];

const FAR_STAND_D_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -30, w: 40, h: 35 }]),
  F([{ ox: 45, oy: -28, w: 55, h: 40 }], { ox: 5, oy: -5, w: -15, h: -20 }),
  F([{ ox: 48, oy: -25, w: 60, h: 40 }]),
  F([{ ox: 45, oy: -28, w: 55, h: 38 }]),
  F([{ ox: 40, oy: -30, w: 45, h: 35 }]),
];

// ===== 站立近距离攻击 (Close Stand) =====
const CLOSE_A_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -68, w: 30, h: 22 }]),
  F([{ ox: 36, oy: -66, w: 34, h: 24 }]),
];

const CLOSE_B_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -35, w: 32, h: 26 }]),
  F([{ ox: 34, oy: -33, w: 36, h: 28 }]),
];

const CLOSE_C_FRAMES: AttackFrame[] = [
  F([{ ox: 34, oy: -65, w: 38, h: 28 }], { ox: 3, oy: 0, w: -8, h: 0 }),
  F([{ ox: 42, oy: -62, w: 45, h: 32 }]),
  F([{ ox: 42, oy: -62, w: 45, h: 32 }]),
  F([{ ox: 38, oy: -65, w: 40, h: 30 }]),
];

const CLOSE_D_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -30, w: 36, h: 30 }]),
  F([{ ox: 40, oy: -28, w: 45, h: 34 }]),
  F([{ ox: 40, oy: -28, w: 45, h: 34 }]),
  F([{ ox: 36, oy: -30, w: 40, h: 32 }]),
];

// ===== 命令通常技 =====
const CMD_GOFUYOU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -45, w: 42, h: 32 }]),
  F([{ ox: 45, oy: -42, w: 48, h: 35 }]),
  F([{ ox: 45, oy: -42, w: 48, h: 35 }]),
];

const CMD_88SHIKI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 45, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 52, h: 30 }]),
  F([{ ox: 42, oy: -20, w: 52, h: 30 }]),
];

const CMD_NARAKU_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -30, w: 38, h: 32 }]),
  F([{ ox: 38, oy: -28, w: 44, h: 35 }]),
];

// ===== 命令通常技 (Character-specific Command Normals) =====
const IORI_YUMEYUMI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
];

const IORI_KATANUGI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -25, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -22, w: 50, h: 30 }]),
  F([{ ox: 42, oy: -22, w: 50, h: 30 }]),
];

const IORI_YUKIWARUI_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -45, w: 40, h: 35 }]),
  F([{ ox: 38, oy: -42, w: 48, h: 38 }]),
];

const TERRY_BACK_KNCKLE_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -65, w: 36, h: 24 }]),
  F([{ ox: 46, oy: -63, w: 42, h: 26 }]),
  F([{ ox: 46, oy: -63, w: 42, h: 26 }]),
];

const TERRY_COMBO_BLOW_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
];

const KIM_HISHOU_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 44, h: 30 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
];

const KIM_HANSEN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -20, w: 48, h: 28 }]),
  F([{ ox: 42, oy: -18, w: 54, h: 30 }]),
  F([{ ox: 42, oy: -18, w: 54, h: 30 }]),
];

const RYO_TSURIZAO_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
];

const RYO_ORISHI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -25, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -22, w: 50, h: 30 }]),
  F([{ ox: 42, oy: -22, w: 50, h: 30 }]),
];

const KDASH_ONE_INCH_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -62, w: 40, h: 26 }]),
  F([{ ox: 48, oy: -60, w: 48, h: 28 }]),
  F([{ ox: 48, oy: -60, w: 48, h: 28 }]),
];

const KDASH_TRIGGER_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -20, w: 46, h: 28 }]),
  F([{ ox: 42, oy: -18, w: 52, h: 30 }]),
  F([{ ox: 42, oy: -18, w: 52, h: 30 }]),
];

const KULA_ONE_MORE_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 44, h: 30 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
];

const KULA_SLIDER_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -18, w: 50, h: 28 }]),
  F([{ ox: 42, oy: -16, w: 56, h: 30 }]),
  F([{ ox: 42, oy: -16, w: 56, h: 30 }]),
];

const LEONA_STRIKE_ARC_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 44, h: 30 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
];

const LEONA_STRIKE_DASH_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -45, w: 40, h: 35 }]),
  F([{ ox: 38, oy: -42, w: 48, h: 38 }]),
];

// Athena 命令通常技
const ATHENA_PHOENIX_REFLECT_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -42, w: 44, h: 30 }]),
  F([{ ox: 45, oy: -40, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -40, w: 50, h: 32 }]),
];

const ATHENA_LOW_B_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
];

const ATHENA_AIR_B_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -45, w: 40, h: 35 }]),
  F([{ ox: 38, oy: -42, w: 48, h: 38 }]),
];

// Mai 命令通常技
const MAI_HISSATSU_SHINOBIBACHI_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 44, h: 30 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -38, w: 50, h: 32 }]),
];

const MAI_YUSURA_UMA_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
];

// Clark 命令通常技
const CLARK_DEATH_LAKE_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -62, w: 42, h: 26 }]),
  F([{ ox: 48, oy: -60, w: 48, h: 28 }]),
  F([{ ox: 48, oy: -60, w: 48, h: 28 }]),
];

const CLARK_STOMP_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -18, w: 48, h: 28 }]),
  F([{ ox: 45, oy: -16, w: 55, h: 30 }]),
];

// Ralf 命令通常技
const RALF_SABRE_PUNCH_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -60, w: 45, h: 28 }]),
  F([{ ox: 50, oy: -58, w: 52, h: 30 }]),
  F([{ ox: 50, oy: -58, w: 52, h: 30 }]),
];

const RALF_SABRE_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -20, w: 50, h: 28 }]),
  F([{ ox: 45, oy: -18, w: 58, h: 30 }]),
  F([{ ox: 45, oy: -18, w: 58, h: 30 }]),
];

// Joe 命令通常技
const JOE_KNEE_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -55, w: 45, h: 30 }]),
  F([{ ox: 48, oy: -52, w: 52, h: 32 }]),
  F([{ ox: 48, oy: -52, w: 52, h: 32 }]),
];

const JOE_SLIDE_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -18, w: 50, h: 26 }]),
  F([{ ox: 42, oy: -15, w: 58, h: 28 }]),
  F([{ ox: 42, oy: -15, w: 58, h: 28 }]),
  F([{ ox: 45, oy: -14, w: 60, h: 28 }]),
];

// Andy 命令通常技
const ANDY_UWA_AGITO_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
  F([{ ox: 48, oy: -66, w: 44, h: 26 }]),
];

const ANDY_GEDAN_AGITO_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 42, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
  F([{ ox: 42, oy: -20, w: 50, h: 30 }]),
];

// Billy 命令通常技
const BILLY_SANDAN_GEAR_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -72, w: 42, h: 28 }]),
  F([{ ox: 50, oy: -70, w: 48, h: 30 }]),
  F([{ ox: 50, oy: -70, w: 48, h: 30 }]),
];

const BILLY_SENSHU_IKKYAKU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -18, w: 48, h: 28 }]),
  F([{ ox: 45, oy: -16, w: 55, h: 30 }]),
  F([{ ox: 45, oy: -16, w: 55, h: 30 }]),
];

// ===== 蹲下攻击 =====
const CROUCH_A_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -30, w: 32, h: 20 }]),
  F([{ ox: 40, oy: -28, w: 36, h: 22 }]),
];

const CROUCH_B_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -15, w: 38, h: 18 }]),
  F([{ ox: 42, oy: -14, w: 44, h: 20 }]),
];

const CROUCH_C_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -28, w: 45, h: 25 }]),
  F([{ ox: 48, oy: -25, w: 55, h: 28 }]),
  F([{ ox: 48, oy: -25, w: 55, h: 28 }]),
  F([{ ox: 45, oy: -28, w: 50, h: 26 }]),
];

const CROUCH_D_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -12, w: 45, h: 22 }]),
  F([{ ox: 45, oy: -10, w: 58, h: 24 }]),
  F([{ ox: 48, oy: -10, w: 62, h: 25 }]),
  F([{ ox: 45, oy: -12, w: 55, h: 22 }]),
  F([{ ox: 40, oy: -12, w: 50, h: 22 }]),
];

// ===== 跳跃攻击 =====
const JUMP_A_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -40, w: 30, h: 28 }]),
  F([{ ox: 35, oy: -38, w: 34, h: 30 }]),
];

const JUMP_B_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -20, w: 35, h: 26 }]),
  F([{ ox: 38, oy: -18, w: 40, h: 28 }]),
];

const JUMP_C_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -50, w: 38, h: 32 }]),
  F([{ ox: 40, oy: -48, w: 48, h: 35 }]),
  F([{ ox: 42, oy: -48, w: 50, h: 35 }]),
  F([{ ox: 40, oy: -50, w: 45, h: 32 }]),
];

const JUMP_D_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -25, w: 40, h: 30 }]),
  F([{ ox: 38, oy: -22, w: 50, h: 32 }]),
  F([{ ox: 40, oy: -22, w: 52, h: 34 }]),
  F([{ ox: 38, oy: -25, w: 48, h: 32 }]),
];

// ===== 投技 =====
const THROW_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 35, oy: -50, w: 35, h: 70 }]),
];

const THROW_FORWARD_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 38, oy: -52, w: 38, h: 72 }]),
];

const THROW_BACK_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 38, oy: -52, w: 38, h: 72 }]),
];

// ===== CD 击飞攻击 =====
const STAND_CD_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 45, h: 38 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 42 }]),
  F([{ ox: 48, oy: -50, w: 58, h: 45 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 42 }]),
];

const JUMP_CD_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -35, w: 42, h: 35 }]),
  F([{ ox: 42, oy: -32, w: 50, h: 38 }]),
  F([{ ox: 45, oy: -30, w: 52, h: 40 }]),
  F([{ ox: 42, oy: -32, w: 48, h: 38 }]),
];

// ===== 通用必杀技 =====
const SPECIAL_UPPER_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -80, w: 40, h: 45 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  F([{ ox: 30, oy: -85, w: 42, h: 48 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  F([{ ox: 28, oy: -75, w: 38, h: 40 }]),
  F([{ ox: 25, oy: -65, w: 35, h: 35 }]),
  F([{ ox: 22, oy: -55, w: 30, h: 30 }]),
  F([{ ox: 20, oy: -50, w: 28, h: 28 }]),
];

const SPECIAL_PROJECTILE_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -60, w: 35, h: 28 }]),
];

// ===== 导出完整的逐帧判定表 =====
export const ATTACK_FRAMES: AttackFrameTable = {
  [AttackType.STAND_A]: FAR_STAND_A_FRAMES,
  [AttackType.STAND_B]: FAR_STAND_B_FRAMES,
  [AttackType.STAND_C]: FAR_STAND_C_FRAMES,
  [AttackType.STAND_D]: FAR_STAND_D_FRAMES,
  [AttackType.CLOSE_A]: CLOSE_A_FRAMES,
  [AttackType.CLOSE_B]: CLOSE_B_FRAMES,
  [AttackType.CLOSE_C]: CLOSE_C_FRAMES,
  [AttackType.CLOSE_D]: CLOSE_D_FRAMES,
  [AttackType.CMD_GOFU_YOU]: CMD_GOFUYOU_FRAMES,
  [AttackType.CMD_88SHIKI]: CMD_88SHIKI_FRAMES,
  [AttackType.CMD_NARAKU]: CMD_NARAKU_FRAMES,
  [AttackType.IORI_YUMEYUMI]: IORI_YUMEYUMI_FRAMES,
  [AttackType.IORI_KATANUGI]: IORI_KATANUGI_FRAMES,
  [AttackType.IORI_YUKIWARUI]: IORI_YUKIWARUI_FRAMES,
  [AttackType.TERRY_BACK_KNCKLE]: TERRY_BACK_KNCKLE_FRAMES,
  [AttackType.TERRY_COMBO_BLOW]: TERRY_COMBO_BLOW_FRAMES,
  [AttackType.KIM_HISHOU_KICK]: KIM_HISHOU_KICK_FRAMES,
  [AttackType.KIM_HANSEN]: KIM_HANSEN_FRAMES,
  [AttackType.RYO_TSURIZAO]: RYO_TSURIZAO_FRAMES,
  [AttackType.RYO_ORISHI]: RYO_ORISHI_FRAMES,
  [AttackType.KDASH_ONE_INCH]: KDASH_ONE_INCH_FRAMES,
  [AttackType.KDASH_TRIGGER]: KDASH_TRIGGER_FRAMES,
  [AttackType.KULA_ONE_MORE]: KULA_ONE_MORE_FRAMES,
  [AttackType.KULA_SLIDER]: KULA_SLIDER_FRAMES,
  [AttackType.LEONA_STRIKE_ARC]: LEONA_STRIKE_ARC_FRAMES,
  [AttackType.LEONA_STRIKE_DASH]: LEONA_STRIKE_DASH_FRAMES,
  [AttackType.ATHENA_PHOENIX_REFLECT]: ATHENA_PHOENIX_REFLECT_FRAMES,
  [AttackType.ATHENA_LOW_B]: ATHENA_LOW_B_FRAMES,
  [AttackType.ATHENA_AIR_B]: ATHENA_AIR_B_FRAMES,
  [AttackType.MAI_HISSATSU_SHINOBIBACHI]: MAI_HISSATSU_SHINOBIBACHI_FRAMES,
  [AttackType.MAI_YUSURA_UMA]: MAI_YUSURA_UMA_FRAMES,
  [AttackType.CLARK_DEATH_LAKE]: CLARK_DEATH_LAKE_FRAMES,
  [AttackType.CLARK_STOMP]: CLARK_STOMP_FRAMES,
  [AttackType.CROUCH_A]: CROUCH_A_FRAMES,
  [AttackType.CROUCH_B]: CROUCH_B_FRAMES,
  [AttackType.CROUCH_C]: CROUCH_C_FRAMES,
  [AttackType.CROUCH_D]: CROUCH_D_FRAMES,
  [AttackType.JUMP_A]: JUMP_A_FRAMES,
  [AttackType.JUMP_B]: JUMP_B_FRAMES,
  [AttackType.JUMP_C]: JUMP_C_FRAMES,
  [AttackType.JUMP_D]: JUMP_D_FRAMES,
  [AttackType.THROW]: THROW_FRAMES,
  [AttackType.THROW_FORWARD]: THROW_FORWARD_FRAMES,
  [AttackType.THROW_BACK]: THROW_BACK_FRAMES,
  [AttackType.STAND_CD]: STAND_CD_FRAMES,
  [AttackType.JUMP_CD]: JUMP_CD_FRAMES,
  [AttackType.SPECIAL_UPPER]: SPECIAL_UPPER_FRAMES,
  [AttackType.SPECIAL_PROJECTILE]: SPECIAL_PROJECTILE_FRAMES,
  [AttackType.KYO_75KAI]: KYO_75KAI_FRAMES,
  [AttackType.KYO_75KAI_2]: KYO_75KAI_2_FRAMES,
  [AttackType.KYO_RED_KICK]: KYO_RED_KICK_FRAMES,
  [AttackType.KYO_ARAGAMI]: KYO_ARAGAMI_FRAMES,
  [AttackType.KYO_ARAGAMI_KONOKIZU]: KYO_ARAGAMI_KONOKIZU_FRAMES,
  [AttackType.KYO_ARAGAMI_YANOSABI]: KYO_ARAGAMI_YANOSABI_FRAMES,
  [AttackType.KYO_NANASE]: KYO_NANASE_FRAMES,
  [AttackType.KYO_KOTO_TSUKI]: KYO_KOTO_TSUKI_FRAMES,
  [AttackType.KYO_YAKISOGI]: KYO_YAKISOGI_FRAMES,
  [AttackType.KYO_DOKUGAMI]: KYO_DOKUGAMI_FRAMES,
  [AttackType.KYO_TSUMIYOMI]: KYO_TSUMIYOMI_FRAMES,
  [AttackType.KYO_BATSUYOMI]: KYO_BATSUYOMI_FRAMES,
  [AttackType.KYO_ONIYAKI]: KYO_ONIYAKI_FRAMES,
  [AttackType.KYO_ONIYAKI_C]: KYO_ONIYAKI_C_FRAMES,
  [AttackType.KYO_YAMIBARAI]: KYO_YAMIBARAI_FRAMES,
  [AttackType.KYO_YAMIBARAI_C]: KYO_YAMIBARAI_C_FRAMES,
  [AttackType.IORI_AOIHANA]: IORI_AOIHANA_FRAMES,
  [AttackType.IORI_AOIHANA_2]: IORI_AOIHANA_2_FRAMES,
  [AttackType.IORI_AOIHANA_3]: IORI_AOIHANA_3_FRAMES,
  [AttackType.IORI_YAMIBARAI]: IORI_YAMIBARAI_FRAMES,
  [AttackType.IORI_YAMIBARAI_C]: IORI_YAMIBARAI_C_FRAMES,
  [AttackType.IORI_ONIYAKI]: IORI_ONIYAKI_FRAMES,
  [AttackType.IORI_ONIYAKI_C]: IORI_ONIYAKI_C_FRAMES,
  [AttackType.IORI_KOTOTSUKI]: IORI_KOTOTSUKI_FRAMES,
  [AttackType.IORI_KUZUKAZE]: IORI_KUZUKAZE_FRAMES,
  [AttackType.TERRY_BURN_KNUCKLE]: TERRY_BURN_KNUCKLE_FRAMES,
  [AttackType.TERRY_CRACK_SHOT]: TERRY_CRACK_SHOT_FRAMES,
  [AttackType.TERRY_POWER_WAVE]: TERRY_POWER_WAVE_FRAMES,
  [AttackType.TERRY_POWER_DUNK]: TERRY_POWER_DUNK_FRAMES,
  [AttackType.TERRY_RISING_TACKLE]: TERRY_RISING_TACKLE_FRAMES,
  [AttackType.KIM_HIENZAN]: KIM_HIENZAN_FRAMES,
  [AttackType.KIM_HANGETSU]: KIM_HANGETSU_FRAMES,
  [AttackType.KIM_HAKI]: KIM_HAKI_FRAMES,
  [AttackType.KIM_HISHOU]: KIM_HISHOU_FRAMES,
  [AttackType.KIM_SANREN]: KIM_SANREN_FRAMES,
  [AttackType.DM_OROCHINAGI]: DM_OROCHINAGI_FRAMES,
  [AttackType.DM_YATAGARASU]: DM_YATAGARASU_FRAMES,
  [AttackType.DM_POWER_GEYSER]: DM_POWER_GEYSER_FRAMES,
  [AttackType.DM_PHOENIX_KICK]: DM_PHOENIX_KICK_FRAMES,
  [AttackType.RYO_KOOU]: RYO_KOOU_FRAMES,
  [AttackType.RYO_KOOU_C]: RYO_KOOU_C_FRAMES,
  [AttackType.RYO_KO_HOU]: RYO_KO_HOU_FRAMES,
  [AttackType.RYO_KO_HOU_C]: RYO_KO_HOU_C_FRAMES,
  [AttackType.RYO_HIEN]: RYO_HIEN_FRAMES,
  [AttackType.RYO_HAOU]: RYO_HAOU_FRAMES,
  [AttackType.DM_TEN_HA_OU]: DM_TEN_HA_OU_FRAMES,
  [AttackType.LEONA_MOON_SLASH]: LEONA_MOON_SLASH_FRAMES,
  [AttackType.LEONA_MOON_SLASH_C]: LEONA_MOON_SLASH_C_FRAMES,
  [AttackType.LEONA_EAR_RING]: LEONA_EAR_RING_FRAMES,
  [AttackType.LEONA_EAR_RING_C]: LEONA_EAR_RING_C_FRAMES,
  [AttackType.LEONA_GRAND_SABER]: LEONA_GRAND_SABER_FRAMES,
  [AttackType.LEONA_BALTIC]: LEONA_BALTIC_FRAMES,
  [AttackType.DM_V_SLASHER]: DM_V_SLASHER_FRAMES,
  [AttackType.ATHENA_PSYCHO_BALL]: ATHENA_PSYCHO_BALL_FRAMES,
  [AttackType.ATHENA_PSYCHO_BALL_C]: ATHENA_PSYCHO_BALL_C_FRAMES,
  [AttackType.ATHENA_PSYCHO_SWORD]: ATHENA_PSYCHO_SWORD_FRAMES,
  [AttackType.ATHENA_PSYCHO_SWORD_C]: ATHENA_PSYCHO_SWORD_C_FRAMES,
  [AttackType.ATHENA_PHOENIX_ARROW]: ATHENA_PHOENIX_ARROW_FRAMES,
  [AttackType.DM_SHINING_CRYSTAL_BIT]: DM_SHINING_CRYSTAL_BIT_FRAMES,
  [AttackType.MAI_KA_CHO_SEN]: MAI_KA_CHO_SEN_FRAMES,
  [AttackType.MAI_KA_CHO_SEN_C]: MAI_KA_CHO_SEN_C_FRAMES,
  [AttackType.MAI_HISHO_RYU_EN_JIN]: MAI_HISHO_RYU_EN_JIN_FRAMES,
  [AttackType.MAI_RYU_EN_BU]: MAI_RYU_EN_BU_FRAMES,
  [AttackType.DM_HAKA_OTOSHI]: DM_HAKA_OTOSHI_FRAMES,
  [AttackType.CLARK_ARGENTINE]: CLARK_ARGENTINE_FRAMES,
  [AttackType.CLARK_ARGENTINE_C]: CLARK_ARGENTINE_C_FRAMES,
  [AttackType.CLARK_FLASH_ELBOW]: CLARK_FLASH_ELBOW_FRAMES,
  [AttackType.CLARK_VULCAN]: CLARK_VULCAN_FRAMES,
  [AttackType.DM_ARGENTINE_DM]: DM_ARGENTINE_DM_FRAMES,
  [AttackType.SDM_ARGENTINE_DM]: SDM_ARGENTINE_DM_FRAMES,
  [AttackType.RALF_SABRE_PUNCH]: RALF_SABRE_PUNCH_FRAMES,
  [AttackType.RALF_SABRE_KICK]: RALF_SABRE_KICK_FRAMES,
  [AttackType.RALF_VULCAN]: RALF_VULCAN_FRAMES,
  [AttackType.RALF_VULCAN_C]: RALF_VULCAN_C_FRAMES,
  [AttackType.RALF_BACKBREAKER]: RALF_BACKBREAKER_FRAMES,
  [AttackType.RALF_KICK]: RALF_KICK_FRAMES,
  [AttackType.DM_GALACTICA_PHANTOM]: DM_GALACTICA_PHANTOM_FRAMES,
  [AttackType.JOE_KNEE_KICK]: JOE_KNEE_KICK_FRAMES,
  [AttackType.JOE_SLIDE]: JOE_SLIDE_FRAMES,
  [AttackType.JOE_HURRICANE]: JOE_HURRICANE_FRAMES,
  [AttackType.JOE_HURRICANE_C]: JOE_HURRICANE_C_FRAMES,
  [AttackType.JOE_TIGER_KICK]: JOE_TIGER_KICK_FRAMES,
  [AttackType.JOE_TIGER_KICK_D]: JOE_TIGER_KICK_D_FRAMES,
  [AttackType.JOE_BAKURETSUKEN]: JOE_BAKURETSUKEN_FRAMES,
  [AttackType.JOE_OUGON_KAKATO]: JOE_OUGON_KAKATO_FRAMES,
  [AttackType.DM_SCREW_UPPER]: DM_SCREW_UPPER_FRAMES,
  [AttackType.ANDY_UWA_AGITO]: ANDY_UWA_AGITO_FRAMES,
  [AttackType.ANDY_GEDAN_AGITO]: ANDY_GEDAN_AGITO_FRAMES,
  [AttackType.ANDY_HISHOU_KEN]: ANDY_HISHOU_KEN_FRAMES,
  [AttackType.ANDY_HISHOU_KEN_C]: ANDY_HISHOU_KEN_C_FRAMES,
  [AttackType.ANDY_SHOURYUU_DAN]: ANDY_SHOURYUU_DAN_FRAMES,
  [AttackType.ANDY_SHOURYUU_DAN_C]: ANDY_SHOURYUU_DAN_C_FRAMES,
  [AttackType.ANDY_ZANEI_RYUSEI_KEN]: ANDY_ZANEI_RYUSEI_KEN_FRAMES,
  [AttackType.ANDY_ZANEI_RYUSEI_KEN_D]: ANDY_ZANEI_RYUSEI_KEN_D_FRAMES,
  [AttackType.ANDY_GEKI_HISHOU_KEN]: ANDY_GEKI_HISHOU_KEN_FRAMES,
  [AttackType.DM_CHO_REPPA_DAN]: DM_CHO_REPPA_DAN_FRAMES,
  [AttackType.SDM_CHO_REPPA_DAN]: SDM_CHO_REPPA_DAN_FRAMES,
  [AttackType.BILLY_SANDAN_GEAR]: BILLY_SANDAN_GEAR_FRAMES,
  [AttackType.BILLY_SENSHU_IKKYAKU]: BILLY_SENSHU_IKKYAKU_FRAMES,
  [AttackType.BILLY_SANSETSU_KON]: BILLY_SANSETSU_KON_FRAMES,
  [AttackType.BILLY_SANSETSU_KON_C]: BILLY_SANSETSU_KON_C_FRAMES,
  [AttackType.BILLY_SENPU_KON]: BILLY_SENPU_KON_FRAMES,
  [AttackType.BILLY_SENPU_KON_C]: BILLY_SENPU_KON_C_FRAMES,
  [AttackType.BILLY_HIEN_ZAN]: BILLY_HIEN_ZAN_FRAMES,
  [AttackType.BILLY_HIEN_ZAN_D]: BILLY_HIEN_ZAN_D_FRAMES,
  [AttackType.DM_KAEN_SENPU_JIN]: DM_KAEN_SENPU_JIN_FRAMES,
  [AttackType.SDM_KAEN_SENPU_JIN]: SDM_KAEN_SENPU_JIN_FRAMES,
};
