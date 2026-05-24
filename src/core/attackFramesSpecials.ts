/**
 * Character-specific special move + DM per-frame hitbox data.
 * Extracted from attackFrames.ts to keep under 600-line limit.
 */
import type { AttackFrame } from './types.js';

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

// ===== 角色专属必杀技 =====

// 京：75式·改（两段踢）
export const KYO_75KAI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -30, w: 45, h: 28 }]),
  F([{ ox: 45, oy: -28, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -28, w: 48, h: 30 }]),
  F([{ ox: 42, oy: -30, w: 45, h: 28 }]),
];

export const KYO_75KAI_2_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -35, w: 48, h: 30 }]),
  F([{ ox: 48, oy: -32, w: 52, h: 32 }]),
  F([{ ox: 48, oy: -32, w: 52, h: 32 }]),
  F([{ ox: 45, oy: -35, w: 48, h: 30 }]),
];

export const KYO_RED_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -50, w: 45, h: 35 }]),
  F([{ ox: 40, oy: -45, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -42, w: 55, h: 40 }]),
  F([{ ox: 40, oy: -45, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -50, w: 48, h: 35 }]),
];

export const KYO_ARAGAMI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -65, w: 42, h: 30 }]),
  F([{ ox: 48, oy: -62, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -62, w: 48, h: 32 }]),
  F([{ ox: 45, oy: -65, w: 45, h: 30 }]),
];

export const KYO_ARAGAMI_KONOKIZU_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 44, h: 28 }]),
  F([{ ox: 48, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 48, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -55, w: 44, h: 28 }]),
];

export const KYO_ARAGAMI_YANOSABI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -75, w: 42, h: 40 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 40, oy: -78, w: 45, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 42, oy: -80, w: 45, h: 45 }]),
  F([{ ox: 40, oy: -75, w: 42, h: 42 }]),
  F([{ ox: 38, oy: -70, w: 40, h: 40 }]),
];

export const KYO_NANASE_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -32, w: 48, h: 35 }]),
  F([{ ox: 48, oy: -30, w: 52, h: 38 }]),
  F([{ ox: 50, oy: -28, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -32, w: 50, h: 36 }]),
  F([{ ox: 45, oy: -35, w: 48, h: 35 }]),
];

export const KYO_KOTO_TSUKI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -55, w: 52, h: 35 }]),
  F([{ ox: 55, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 58, oy: -50, w: 62, h: 40 }]),
  F([{ ox: 55, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 52, oy: -55, w: 55, h: 35 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 35 }]),
];

export const KYO_YAKISOGI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -70, w: 42, h: 38 }]),
  F([{ ox: 40, oy: -68, w: 45, h: 42 }]),
  F([{ ox: 42, oy: -65, w: 48, h: 45 }]),
  F([{ ox: 40, oy: -68, w: 45, h: 42 }]),
];

export const KYO_DOKUGAMI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -60, w: 45, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 48, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 45, oy: -60, w: 48, h: 32 }]),
];

export const KYO_TSUMIYOMI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -55, w: 44, h: 28 }]),
  F([{ ox: 45, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 42, oy: -55, w: 45, h: 28 }]),
];

export const KYO_BATSUYOMI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -70, w: 48, h: 35 }]),
  F([{ ox: 48, oy: -68, w: 52, h: 38 }]),
  F([{ ox: 50, oy: -65, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -68, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -70, w: 48, h: 35 }]),
];

export const KYO_ONIYAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

export const KYO_ONIYAKI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

export const KYO_YAMIBARAI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const KYO_YAMIBARAI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// ===== 八神庵 =====
export const IORI_AOIHANA_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 45, h: 32 }]),
  F([{ ox: 48, oy: -52, w: 50, h: 34 }]),
  F([{ ox: 48, oy: -52, w: 50, h: 34 }]),
  F([{ ox: 45, oy: -55, w: 48, h: 32 }]),
];

export const IORI_AOIHANA_2_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -18, w: 48, h: 22 }]),
  F([{ ox: 48, oy: -16, w: 52, h: 24 }]),
  F([{ ox: 48, oy: -16, w: 52, h: 24 }]),
  F([{ ox: 45, oy: -18, w: 48, h: 22 }]),
];

export const IORI_AOIHANA_3_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -65, w: 45, h: 38 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 42, oy: -70, w: 48, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 45, oy: -72, w: 50, h: 45 }]),
  F([{ ox: 42, oy: -68, w: 48, h: 42 }]),
  F([{ ox: 40, oy: -65, w: 45, h: 40 }]),
];

export const IORI_YAMIBARAI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const IORI_YAMIBARAI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const IORI_ONIYAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 26, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 32, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 28, oy: -70, w: 40, h: 40 }]),
];

export const IORI_ONIYAKI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 26, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 32, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 28, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 24, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 22, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 20, oy: -40, w: 28, h: 28 }]),
];

export const IORI_KOTOTSUKI_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -55, w: 42, h: 38 }]),
  F([{ ox: 55, oy: -52, w: 48, h: 42 }]),
  F([{ ox: 58, oy: -50, w: 52, h: 44 }]),
  F([{ ox: 55, oy: -52, w: 48, h: 42 }]),
];

export const IORI_KUZUKAZE_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 45, oy: -55, w: 45, h: 85 }]),
  F([], null, [{ ox: 50, oy: -52, w: 48, h: 88 }]),
  F([], null, [{ ox: 50, oy: -52, w: 48, h: 88 }]),
  F([], null, [{ ox: 48, oy: -55, w: 45, h: 85 }]),
];

// ===== 特瑞 =====
export const TERRY_BURN_KNUCKLE_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -55, w: 48, h: 30 }]),
  F([{ ox: 52, oy: -52, w: 55, h: 34 }]),
  F([{ ox: 55, oy: -50, w: 58, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 55, h: 34 }]),
  F([{ ox: 48, oy: -55, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -55, w: 48, h: 30 }]),
];

export const TERRY_CRACK_SHOT_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -45, w: 45, h: 35 }]),
  F([{ ox: 48, oy: -42, w: 52, h: 38 }]),
  F([{ ox: 52, oy: -40, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -42, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -45, w: 48, h: 35 }]),
];

export const TERRY_POWER_WAVE_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -40, w: 38, h: 28 }]),
];

export const TERRY_POWER_DUNK_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -70, w: 40, h: 40 }], { ox: 5, oy: -8, w: -12, h: -25 }),
  F([{ ox: 35, oy: -78, w: 45, h: 44 }], { ox: 5, oy: -8, w: -12, h: -25 }),
  F([{ ox: 38, oy: -82, w: 48, h: 46 }]),
  F([{ ox: 35, oy: -75, w: 44, h: 42 }]),
  F([{ ox: 30, oy: -65, w: 40, h: 38 }]),
];

export const TERRY_RISING_TACKLE_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -72, w: 38, h: 42 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 30, oy: -80, w: 42, h: 45 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 32, oy: -85, w: 44, h: 48 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 30, oy: -80, w: 42, h: 45 }]),
  F([{ ox: 28, oy: -72, w: 40, h: 42 }]),
  F([{ ox: 25, oy: -62, w: 36, h: 38 }]),
];

// ===== 金 =====
export const KIM_HIENZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -75, w: 40, h: 42 }], { ox: 3, oy: -5, w: -10, h: -25 }),
  F([{ ox: 38, oy: -80, w: 45, h: 45 }], { ox: 3, oy: -5, w: -10, h: -25 }),
  F([{ ox: 40, oy: -82, w: 48, h: 48 }]),
  F([{ ox: 38, oy: -78, w: 45, h: 45 }]),
  F([{ ox: 35, oy: -72, w: 42, h: 42 }]),
];

export const KIM_HANGETSU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 45, h: 38 }]),
  F([{ ox: 42, oy: -50, w: 50, h: 42 }]),
  F([{ ox: 45, oy: -48, w: 52, h: 44 }]),
  F([{ ox: 42, oy: -50, w: 50, h: 42 }]),
  F([{ ox: 38, oy: -55, w: 45, h: 38 }]),
];

export const KIM_HAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -20, w: 50, h: 28 }]),
  F([{ ox: 48, oy: -18, w: 55, h: 30 }]),
  F([{ ox: 50, oy: -18, w: 55, h: 30 }]),
  F([{ ox: 48, oy: -20, w: 50, h: 28 }]),
];

export const KIM_HISHOU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 48, h: 42 }]),
  F([{ ox: 45, oy: -35, w: 55, h: 45 }]),
  F([{ ox: 48, oy: -32, w: 58, h: 48 }]),
  F([{ ox: 45, oy: -35, w: 55, h: 45 }]),
];

export const KIM_SANREN_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -60, w: 42, h: 30 }]),
  F([{ ox: 48, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 44, oy: -60, w: 44, h: 30 }]),
];

// ===== 坂崎亮 =====
export const RYO_KOOU_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const RYO_KOOU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 38, h: 30 }]),
];

export const RYO_KO_HOU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

export const RYO_KO_HOU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

export const RYO_HIEN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -60, w: 45, h: 35 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 40 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -58, w: 48, h: 35 }]),
];

export const RYO_HAOU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -60, w: 42, h: 35 }]),
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
  F([{ ox: 45, oy: -55, w: 50, h: 40 }]),
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
  F([{ ox: 38, oy: -60, w: 44, h: 35 }]),
];

// ===== 莉安娜 =====
export const LEONA_MOON_SLASH_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const LEONA_MOON_SLASH_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 38, h: 30 }]),
];

export const LEONA_EAR_RING_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

export const LEONA_EAR_RING_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

export const LEONA_GRAND_SABER_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 44, oy: -58, w: 50, h: 34 }]),
];

export const LEONA_BALTIC_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -22, w: 48, h: 28 }]),
  F([{ ox: 45, oy: -20, w: 54, h: 30 }]),
  F([{ ox: 48, oy: -18, w: 56, h: 32 }]),
  F([{ ox: 45, oy: -20, w: 54, h: 30 }]),
];

// ===== DM 超必杀技 =====
export const DM_OROCHINAGI_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -70, w: 60, h: 50 }]),
  F([{ ox: 38, oy: -68, w: 70, h: 55 }]),
  F([{ ox: 42, oy: -65, w: 78, h: 58 }]),
  F([{ ox: 42, oy: -65, w: 80, h: 60 }]),
  F([{ ox: 42, oy: -65, w: 80, h: 60 }]),
  F([{ ox: 40, oy: -67, w: 75, h: 55 }]),
  F([{ ox: 38, oy: -68, w: 70, h: 52 }]),
  F([{ ox: 35, oy: -70, w: 65, h: 50 }]),
  ...Array.from({ length: 22 }, (_, i) =>
    F([{ ox: 30 - i * 0.3, oy: -70 + i * 0.5, w: 60 - i * 1.5, h: 48 - i }])
  ),
];

export const DM_YATAGARASU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -62, w: 55, h: 48 }]),
  F([{ ox: 34, oy: -60, w: 65, h: 52 }]),
  F([{ ox: 38, oy: -58, w: 72, h: 55 }]),
  F([{ ox: 38, oy: -58, w: 72, h: 55 }]),
  F([{ ox: 36, oy: -60, w: 68, h: 52 }]),
  ...Array.from({ length: 15 }, (_, i) =>
    F([{ ox: 32 - i * 0.2, oy: -62 + i * 0.3, w: 60 - i, h: 48 - i * 0.5 }])
  ),
];

export const DM_POWER_GEYSER_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 60, h: 45 }]),
  F([{ ox: 40, oy: -52, w: 72, h: 50 }]),
  F([{ ox: 42, oy: -50, w: 78, h: 52 }]),
  ...Array.from({ length: 12 }, (_, i) =>
    F([{ ox: 38 + i * 0.5, oy: -52 + i * 0.3, w: 68 - i * 1.5, h: 48 - i * 0.5 }])
  ),
];

export const DM_PHOENIX_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -52, w: 58, h: 45 }]),
  F([{ ox: 42, oy: -48, w: 68, h: 52 }]),
  F([{ ox: 45, oy: -45, w: 72, h: 55 }]),
  ...Array.from({ length: 15 }, (_, i) =>
    F([{ ox: 40 + i * 0.3, oy: -48 + i * 0.3, w: 65 - i, h: 50 - i * 0.5 }])
  ),
];

export const DM_TEN_HA_OU_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 40, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 38, oy: -64, w: 72, h: 52 }]),
  ...Array.from({ length: 18 }, (_, i) =>
    F([{ ox: 28 - i * 0.3, oy: -68 + i * 0.5, w: 58 - i * 1.5, h: 46 - i }])
  ),
];

export const DM_V_SLASHER_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 40, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 38, oy: -64, w: 72, h: 52 }]),
  ...Array.from({ length: 16 }, (_, i) =>
    F([{ ox: 28 - i * 0.3, oy: -68 + i * 0.5, w: 58 - i * 1.5, h: 46 - i }])
  ),
];
