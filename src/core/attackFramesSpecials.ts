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

// 葵花 C版 1段 — stronger claw swipe, wider hitbox
export const IORI_AOIHANA_C_FRAMES: AttackFrame[] = [
  F([{ ox: 44, oy: -56, w: 50, h: 36 }]),
  F([{ ox: 50, oy: -52, w: 56, h: 38 }]),
  F([{ ox: 50, oy: -52, w: 56, h: 38 }]),
  F([{ ox: 48, oy: -55, w: 52, h: 36 }]),
  F([{ ox: 46, oy: -56, w: 50, h: 34 }]),
  F([{ ox: 44, oy: -55, w: 48, h: 32 }]),
];

// 葵花 C版 2段 — mid-body dark energy swipe
export const IORI_AOIHANA_C_2_FRAMES: AttackFrame[] = [
  F([{ ox: 44, oy: -20, w: 52, h: 26 }]),
  F([{ ox: 50, oy: -16, w: 58, h: 28 }]),
  F([{ ox: 50, oy: -16, w: 58, h: 28 }]),
  F([{ ox: 48, oy: -18, w: 54, h: 26 }]),
  F([{ ox: 46, oy: -20, w: 50, h: 24 }]),
  F([{ ox: 44, oy: -18, w: 48, h: 22 }]),
];

// 葵花 C版 3段 — overhead knockdown slam, bigger arc
export const IORI_AOIHANA_C_3_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -68, w: 50, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 44, oy: -74, w: 54, h: 46 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 48, oy: -78, w: 56, h: 48 }]),
  F([{ ox: 46, oy: -74, w: 54, h: 46 }]),
  F([{ ox: 44, oy: -70, w: 50, h: 42 }]),
  F([{ ox: 42, oy: -66, w: 48, h: 40 }]),
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

// 琴月陰 D版 — full-screen rush grab, wider + longer hitbox
export const IORI_KOTOTSUKI_D_FRAMES: AttackFrame[] = [
  F([{ ox: 52, oy: -56, w: 48, h: 42 }]),
  F([{ ox: 58, oy: -52, w: 55, h: 46 }]),
  F([{ ox: 62, oy: -50, w: 60, h: 48 }]),
  F([{ ox: 60, oy: -48, w: 58, h: 50 }]),
  F([{ ox: 56, oy: -50, w: 54, h: 48 }]),
  F([{ ox: 52, oy: -52, w: 50, h: 44 }]),
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
  // startup kick rising
  F([{ ox: 35, oy: -60, w: 45, h: 35 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  // peak extension
  F([{ ox: 45, oy: -52, w: 55, h: 40 }]),
  // sustained peak
  F([{ ox: 45, oy: -52, w: 55, h: 40 }]),
  // descending arc
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -58, w: 48, h: 35 }]),
  // late kick follow-through
  F([{ ox: 34, oy: -62, w: 44, h: 32 }]),
  F([{ ox: 30, oy: -65, w: 40, h: 30 }]),
];

export const RYO_HAOU_FRAMES: AttackFrame[] = [
  // punch 1: straight right
  F([{ ox: 38, oy: -60, w: 44, h: 35 }]),
  F([{ ox: 45, oy: -55, w: 50, h: 40 }]),
  // punch 2: left hook
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
  F([{ ox: 45, oy: -55, w: 50, h: 40 }]),
  // punch 3: right straight
  F([{ ox: 40, oy: -57, w: 46, h: 36 }]),
  F([{ ox: 45, oy: -55, w: 50, h: 40 }]),
  // punch 4: left upper
  F([{ ox: 38, oy: -62, w: 44, h: 38 }]),
  F([{ ox: 42, oy: -60, w: 48, h: 42 }]),
  // punch 5: right hook
  F([{ ox: 40, oy: -58, w: 46, h: 36 }]),
  F([{ ox: 44, oy: -56, w: 50, h: 40 }]),
  // finish: final thrust
  F([{ ox: 46, oy: -54, w: 52, h: 42 }]),
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
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

export const SDM_OROCHINAGI_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -72, w: 68, h: 55 }]),
  F([{ ox: 40, oy: -68, w: 78, h: 60 }]),
  F([{ ox: 46, oy: -65, w: 88, h: 64 }]),
  F([{ ox: 46, oy: -64, w: 92, h: 66 }]),
  F([{ ox: 46, oy: -64, w: 92, h: 66 }]),
  F([{ ox: 46, oy: -64, w: 92, h: 66 }]),
  F([{ ox: 44, oy: -66, w: 86, h: 62 }]),
  F([{ ox: 42, oy: -68, w: 78, h: 58 }]),
  F([{ ox: 40, oy: -70, w: 72, h: 55 }]),
  F([{ ox: 38, oy: -72, w: 68, h: 52 }]),
  ...Array.from({ length: 28 }, (_, i) =>
    F([{ ox: 34 - i * 0.3, oy: -72 + i * 0.5, w: 64 - i * 1.5, h: 50 - i }])
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

export const SDM_YATAGARASU_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 62, h: 52 }]),
  F([{ ox: 36, oy: -62, w: 72, h: 58 }]),
  F([{ ox: 42, oy: -58, w: 82, h: 62 }]),
  F([{ ox: 42, oy: -56, w: 86, h: 65 }]),
  F([{ ox: 42, oy: -56, w: 86, h: 65 }]),
  F([{ ox: 40, oy: -58, w: 82, h: 62 }]),
  F([{ ox: 38, oy: -60, w: 76, h: 58 }]),
  F([{ ox: 36, oy: -62, w: 70, h: 55 }]),
  ...Array.from({ length: 20 }, (_, i) =>
    F([{ ox: 34 - i * 0.2, oy: -64 + i * 0.3, w: 66 - i, h: 52 - i * 0.5 }])
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
  // energy blast expanding over 10 active frames
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 40, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 42, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 44, oy: -58, w: 82, h: 60 }]),
  // peak power
  F([{ ox: 44, oy: -58, w: 82, h: 60 }]),
  F([{ ox: 42, oy: -60, w: 78, h: 56 }]),
  F([{ ox: 38, oy: -64, w: 70, h: 50 }]),
  F([{ ox: 34, oy: -66, w: 62, h: 46 }]),
  F([{ ox: 30, oy: -68, w: 55, h: 42 }]),
];

// SDM 天地霸煌拳 — extended energy blast (active=22)
export const SDM_TEN_HA_OU_FRAMES: AttackFrame[] = [
  // Phase 1: rapid expansion (frames 0-5)
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 42, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 48, oy: -58, w: 88, h: 64 }]),
  F([{ ox: 52, oy: -55, w: 95, h: 68 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  // Phase 2: sustained peak power (frames 6-13)
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 52, oy: -54, w: 96, h: 68 }]),
  F([{ ox: 52, oy: -54, w: 96, h: 68 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 52, oy: -54, w: 96, h: 68 }]),
  F([{ ox: 52, oy: -54, w: 96, h: 68 }]),
  // Phase 3: second power surge (frames 14-18)
  F([{ ox: 58, oy: -50, w: 105, h: 75 }]),
  F([{ ox: 60, oy: -48, w: 110, h: 78 }]),
  F([{ ox: 60, oy: -48, w: 110, h: 78 }]),
  F([{ ox: 58, oy: -50, w: 105, h: 75 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 72 }]),
  // Phase 4: final dissipation (frames 19-21)
  F([{ ox: 48, oy: -56, w: 88, h: 64 }]),
  F([{ ox: 40, oy: -60, w: 75, h: 55 }]),
  F([{ ox: 32, oy: -66, w: 60, h: 45 }]),
];

// DM 龍虎乱舞 — rushing multi-hit DM (active=10)
export const DM_RYUKO_RANBU_FRAMES: AttackFrame[] = [
  // Rush start — close punch
  F([{ ox: 40, oy: -65, w: 45, h: 30 }]),
  // Elbow strike
  F([{ ox: 48, oy: -60, w: 50, h: 32 }]),
  // Uppercut
  F([{ ox: 42, oy: -70, w: 48, h: 35 }]),
  // Body blow
  F([{ ox: 45, oy: -40, w: 52, h: 30 }]),
  // High kick
  F([{ ox: 40, oy: -55, w: 55, h: 35 }]),
  // Ko'ou Ken finisher start
  F([{ ox: 38, oy: -62, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -60, w: 58, h: 42 }]),
  F([{ ox: 45, oy: -58, w: 65, h: 48 }]),
  F([{ ox: 48, oy: -55, w: 72, h: 52 }]),
  // Final burst
  F([{ ox: 50, oy: -52, w: 80, h: 58 }]),
];

// SDM 龍虎乱舞 — enhanced rushing DM (active=13)
export const SDM_RYUKO_RANBU_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -65, w: 45, h: 30 }]),
  F([{ ox: 48, oy: -60, w: 50, h: 32 }]),
  F([{ ox: 42, oy: -70, w: 48, h: 35 }]),
  F([{ ox: 45, oy: -40, w: 52, h: 30 }]),
  F([{ ox: 40, oy: -55, w: 55, h: 35 }]),
  F([{ ox: 38, oy: -62, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -60, w: 58, h: 42 }]),
  F([{ ox: 45, oy: -58, w: 65, h: 48 }]),
  F([{ ox: 48, oy: -55, w: 72, h: 52 }]),
  F([{ ox: 50, oy: -52, w: 80, h: 58 }]),
  F([{ ox: 52, oy: -50, w: 85, h: 62 }]),
  F([{ ox: 54, oy: -48, w: 90, h: 65 }]),
  F([{ ox: 55, oy: -45, w: 95, h: 68 }]),
];

// HSDM 龍虎乱舞 — hidden super (active=22)
export const HSDM_RYUKO_RANBU_FRAMES: AttackFrame[] = [
  // Phase 1: DM rush (10 frames)
  ...DM_RYUKO_RANBU_FRAMES,
  // Phase 2: SDM finisher continuation (12 frames)
  F([{ ox: 52, oy: -50, w: 85, h: 62 }]),
  F([{ ox: 54, oy: -48, w: 90, h: 65 }]),
  F([{ ox: 56, oy: -46, w: 95, h: 68 }]),
  F([{ ox: 58, oy: -44, w: 98, h: 70 }]),
  F([{ ox: 60, oy: -42, w: 100, h: 72 }]),
  F([{ ox: 62, oy: -40, w: 105, h: 75 }]),
  F([{ ox: 64, oy: -38, w: 108, h: 78 }]),
  F([{ ox: 66, oy: -36, w: 112, h: 80 }]),
  F([{ ox: 68, oy: -34, w: 115, h: 82 }]),
  F([{ ox: 70, oy: -32, w: 118, h: 85 }]),
  F([{ ox: 72, oy: -30, w: 120, h: 88 }]),
  // Final burst
  F([{ ox: 75, oy: -28, w: 130, h: 95 }]),
];

// Ryo: Ko'ou Ken D version (heavy projectile) — 22 active frames
export const RYO_KOOUKEN_D_FRAMES: AttackFrame[] = [
  // Projectile launch: large, powerful energy ball
  F([{ ox: 52, oy: -56, w: 42, h: 32 }]),
  F([{ ox: 58, oy: -54, w: 48, h: 36 }]),
  F([{ ox: 64, oy: -52, w: 54, h: 40 }]),
  F([{ ox: 70, oy: -50, w: 58, h: 42 }]),
  // Sustained travel
  F([{ ox: 76, oy: -48, w: 62, h: 44 }]),
  F([{ ox: 82, oy: -46, w: 66, h: 46 }]),
  F([{ ox: 88, oy: -44, w: 68, h: 48 }]),
  F([{ ox: 94, oy: -42, w: 70, h: 48 }]),
  // Full power sustained
  ...Array.from({ length: 10 }, (_, i) =>
    F([{ ox: 100 + i * 6, oy: -40, w: 72, h: 50 }])
  ),
  // Dissipation
  F([{ ox: 160, oy: -38, w: 60, h: 44 }]),
  F([{ ox: 170, oy: -36, w: 48, h: 38 }]),
  F([{ ox: 178, oy: -34, w: 36, h: 30 }]),
  F([{ ox: 184, oy: -32, w: 24, h: 22 }]),
];

// Ryo: Hio Hacker (dash strike) — 6 active frames
export const RYO_HIO_HACKER_FRAMES: AttackFrame[] = [
  // Forward dash strike: elbow/shoulder tackle
  F([{ ox: 40, oy: -62, w: 40, h: 32 }]),
  // Impact extension
  F([{ ox: 48, oy: -58, w: 48, h: 38 }]),
  // Full extension
  F([{ ox: 54, oy: -55, w: 52, h: 42 }]),
  // Sustained hit
  F([{ ox: 52, oy: -56, w: 50, h: 40 }]),
  // Pullback
  F([{ ox: 46, oy: -60, w: 44, h: 36 }]),
  // Recovery
  F([{ ox: 40, oy: -64, w: 38, h: 30 }]),
];

// Ryo: Zanretsu Ken (multi-punch) — 4 active frames per cycle, repeated
export const RYO_ZANRETSU_KEN_FRAMES: AttackFrame[] = [
  // Punch cycle 1: alternating left/right
  F([{ ox: 42, oy: -60, w: 40, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 44, h: 34 }]),
  F([{ ox: 42, oy: -60, w: 40, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 44, h: 34 }]),
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

// ===== 雅典娜 (Athena Asamiya) =====
export const ATHENA_PSYCHO_BALL_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

export const ATHENA_PSYCHO_BALL_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 40, h: 32 }]),
];

export const ATHENA_PSYCHO_SWORD_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

export const ATHENA_PSYCHO_SWORD_C_FRAMES: AttackFrame[] = [
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

export const ATHENA_PHOENIX_ARROW_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -45, w: 45, h: 38 }]),
  F([{ ox: 42, oy: -42, w: 52, h: 42 }]),
  F([{ ox: 48, oy: -38, w: 58, h: 45 }]),
  F([{ ox: 48, oy: -38, w: 58, h: 45 }]),
  F([{ ox: 45, oy: -42, w: 52, h: 42 }]),
  F([{ ox: 42, oy: -45, w: 48, h: 38 }]),
  F([{ ox: 38, oy: -48, w: 45, h: 36 }]),
  F([{ ox: 35, oy: -50, w: 42, h: 34 }]),
];

export const DM_SHINING_CRYSTAL_BIT_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 55, h: 45 }]),
  F([{ ox: 36, oy: -62, w: 65, h: 50 }]),
  F([{ ox: 40, oy: -60, w: 72, h: 52 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 38, oy: -62, w: 75, h: 55 }]),
  ...Array.from({ length: 18 }, (_, i) =>
    F([{ ox: 30 - i * 0.3, oy: -65 + i * 0.5, w: 55 - i * 1.5, h: 44 - i }])
  ),
];

// ===== 不知火舞 (Mai Shiranui) =====
export const MAI_KA_CHO_SEN_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -58, w: 35, h: 28 }]),
  F([{ ox: 55, oy: -56, w: 38, h: 30 }]),
  ...Array.from({ length: 16 }, (_, i) =>
    F([{ ox: 55 + i * 2, oy: -56, w: 35, h: 28 }])
  ),
];

export const MAI_KA_CHO_SEN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -58, w: 38, h: 30 }]),
  F([{ ox: 55, oy: -56, w: 42, h: 32 }]),
  ...Array.from({ length: 20 }, (_, i) =>
    F([{ ox: 55 + i * 2, oy: -56, w: 38, h: 30 }])
  ),
];

export const MAI_HISHO_RYU_EN_JIN_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -80, w: 40, h: 45 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  F([{ ox: 30, oy: -85, w: 42, h: 48 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  F([{ ox: 28, oy: -75, w: 38, h: 40 }]),
  F([{ ox: 25, oy: -65, w: 35, h: 35 }]),
  F([{ ox: 22, oy: -55, w: 30, h: 30 }]),
  F([{ ox: 20, oy: -50, w: 28, h: 28 }]),
];

export const MAI_RYU_EN_BU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -50, w: 45, h: 35 }]),
  F([{ ox: 42, oy: -48, w: 52, h: 38 }]),
  F([{ ox: 48, oy: -45, w: 58, h: 40 }]),
  F([{ ox: 48, oy: -45, w: 58, h: 40 }]),
  F([{ ox: 45, oy: -48, w: 52, h: 38 }]),
  F([{ ox: 40, oy: -50, w: 48, h: 35 }]),
  F([{ ox: 35, oy: -52, w: 42, h: 32 }]),
  F([{ ox: 30, oy: -55, w: 38, h: 30 }]),
];

export const DM_HAKA_OTOSHI_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 55, h: 45 }]),
  F([{ ox: 36, oy: -62, w: 65, h: 50 }]),
  F([{ ox: 40, oy: -60, w: 72, h: 52 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 38, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 35, oy: -65, w: 68, h: 50 }]),
  F([{ ox: 32, oy: -68, w: 60, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 55, h: 42 }]),
];

// ===== 克拉克 (Clark Still) =====
// Super Argentine Backbreaker (A version) — command grab
export const CLARK_ARGENTINE_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 35, oy: -55, w: 42, h: 80 }]),
  F([], null, [{ ox: 38, oy: -52, w: 45, h: 82 }]),
];

// Super Argentine Backbreaker (C version) — command grab, wider
export const CLARK_ARGENTINE_C_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 35, oy: -55, w: 48, h: 85 }]),
  F([], null, [{ ox: 38, oy: -52, w: 50, h: 88 }]),
];

// Flash Elbow — follow-up strike after grab
export const CLARK_FLASH_ELBOW_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -55, w: 48, h: 32 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 36 }]),
  F([{ ox: 48, oy: -50, w: 58, h: 38 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 36 }]),
  F([{ ox: 40, oy: -55, w: 48, h: 32 }]),
];

// Vulcan Punch — multi-hit rush
export const CLARK_VULCAN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -60, w: 42, h: 30 }]),
  F([{ ox: 45, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 45, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 42, oy: -60, w: 48, h: 32 }]),
  F([{ ox: 38, oy: -62, w: 45, h: 30 }]),
  F([{ ox: 35, oy: -65, w: 42, h: 28 }]),
  F([{ ox: 32, oy: -68, w: 38, h: 26 }]),
  F([{ ox: 30, oy: -70, w: 35, h: 24 }]),
  F([{ ox: 28, oy: -72, w: 32, h: 22 }]),
  F([{ ox: 25, oy: -74, w: 30, h: 20 }]),
];

// DM: Super Argentine Backbreaker DM — command grab
export const DM_ARGENTINE_DM_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 35, oy: -55, w: 55, h: 90 }]),
  F([], null, [{ ox: 38, oy: -52, w: 58, h: 92 }]),
  F([], null, [{ ox: 40, oy: -50, w: 60, h: 95 }]),
  F([], null, [{ ox: 38, oy: -52, w: 58, h: 92 }]),
];

// SDM: Super Argentine Backbreaker SDM — command grab, wider
export const SDM_ARGENTINE_DM_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 35, oy: -55, w: 60, h: 95 }]),
  F([], null, [{ ox: 38, oy: -52, w: 65, h: 98 }]),
  F([], null, [{ ox: 40, oy: -50, w: 68, h: 100 }]),
  F([], null, [{ ox: 40, oy: -50, w: 68, h: 100 }]),
  F([], null, [{ ox: 38, oy: -52, w: 65, h: 98 }]),
  F([], null, [{ ox: 35, oy: -55, w: 60, h: 95 }]),
  F([], null, [{ ox: 32, oy: -58, w: 55, h: 90 }]),
  F([], null, [{ ox: 30, oy: -60, w: 50, h: 85 }]),
];

// ===== 拉尔夫 (Ralf Jones) =====
// APPROX based on KOF2002UM
export const RALF_VULCAN_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -60, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 55, h: 34 }]),
  F([{ ox: 52, oy: -55, w: 58, h: 36 }]),
  F([{ ox: 52, oy: -55, w: 58, h: 36 }]),
  F([{ ox: 48, oy: -58, w: 55, h: 34 }]),
  F([{ ox: 45, oy: -60, w: 50, h: 32 }]),
  F([{ ox: 42, oy: -62, w: 48, h: 30 }]),
  F([{ ox: 40, oy: -64, w: 45, h: 28 }]),
  F([{ ox: 38, oy: -66, w: 42, h: 26 }]),
  F([{ ox: 36, oy: -68, w: 40, h: 24 }]),
  F([{ ox: 34, oy: -70, w: 38, h: 22 }]),
  F([{ ox: 32, oy: -72, w: 36, h: 20 }]),
];

export const RALF_VULCAN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -60, w: 52, h: 34 }]),
  F([{ ox: 48, oy: -58, w: 58, h: 36 }]),
  F([{ ox: 54, oy: -55, w: 62, h: 38 }]),
  F([{ ox: 54, oy: -55, w: 62, h: 38 }]),
  F([{ ox: 54, oy: -55, w: 62, h: 38 }]),
  F([{ ox: 52, oy: -58, w: 58, h: 36 }]),
  F([{ ox: 48, oy: -60, w: 55, h: 34 }]),
  F([{ ox: 45, oy: -62, w: 52, h: 32 }]),
  F([{ ox: 42, oy: -64, w: 48, h: 30 }]),
  F([{ ox: 40, oy: -66, w: 45, h: 28 }]),
  F([{ ox: 38, oy: -68, w: 42, h: 26 }]),
  F([{ ox: 36, oy: -70, w: 40, h: 24 }]),
  F([{ ox: 34, oy: -72, w: 38, h: 22 }]),
  F([{ ox: 32, oy: -74, w: 36, h: 20 }]),
  F([{ ox: 30, oy: -76, w: 34, h: 18 }]),
  F([{ ox: 28, oy: -78, w: 32, h: 16 }]),
  F([{ ox: 26, oy: -80, w: 30, h: 14 }]),
  F([{ ox: 24, oy: -82, w: 28, h: 12 }]),
];

export const RALF_BACKBREAKER_FRAMES: AttackFrame[] = [
  F([], null, [{ ox: 40, oy: -55, w: 50, h: 85 }]),
  F([], null, [{ ox: 42, oy: -52, w: 52, h: 88 }]),
];

export const RALF_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 45, h: 38 }]),
  F([{ ox: 42, oy: -50, w: 52, h: 42 }]),
  F([{ ox: 48, oy: -45, w: 58, h: 45 }]),
  F([{ ox: 48, oy: -45, w: 58, h: 45 }]),
  F([{ ox: 45, oy: -48, w: 55, h: 42 }]),
  F([{ ox: 42, oy: -52, w: 50, h: 38 }]),
  F([{ ox: 38, oy: -55, w: 45, h: 35 }]),
  F([{ ox: 35, oy: -58, w: 42, h: 32 }]),
];

export const DM_GALACTICA_PHANTOM_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 60, h: 48 }]),
  F([{ ox: 38, oy: -62, w: 70, h: 52 }]),
  F([{ ox: 45, oy: -58, w: 80, h: 58 }]),
  F([{ ox: 50, oy: -55, w: 90, h: 62 }]),
  F([{ ox: 50, oy: -55, w: 95, h: 65 }]),
  F([{ ox: 50, oy: -55, w: 95, h: 65 }]),
  F([{ ox: 48, oy: -58, w: 88, h: 60 }]),
  F([{ ox: 45, oy: -60, w: 80, h: 55 }]),
];

// ===== 乔·东 (Joe Higashi) ===== APPROX based on KOF2002UM
// Hurricane Upper (A) — projectile spawn frame
export const JOE_HURRICANE_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// Hurricane Upper (C) — projectile spawn frame, wider
export const JOE_HURRICANE_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 42, h: 32 }]),
];

// Tiger Kick (B) — uppercut
export const JOE_TIGER_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

// Tiger Kick (D) — stronger uppercut, more invincible
export const JOE_TIGER_KICK_D_FRAMES: AttackFrame[] = [
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

// Bakuretsuken (rush punches)
export const JOE_BAKURETSUKEN_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -62, w: 45, h: 30 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 52, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 52, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 45, oy: -60, w: 48, h: 32 }]),
  F([{ ox: 42, oy: -62, w: 45, h: 30 }]),
  F([{ ox: 40, oy: -65, w: 42, h: 28 }]),
  F([{ ox: 38, oy: -68, w: 40, h: 26 }]),
  F([{ ox: 36, oy: -70, w: 38, h: 24 }]),
  F([{ ox: 34, oy: -72, w: 36, h: 22 }]),
  F([{ ox: 32, oy: -74, w: 34, h: 20 }]),
];

// Ougon no Kakato (diving heel kick)
export const JOE_OUGON_KAKATO_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -50, w: 48, h: 38 }]),
  F([{ ox: 45, oy: -45, w: 55, h: 42 }]),
  F([{ ox: 50, oy: -40, w: 58, h: 45 }]),
  F([{ ox: 50, oy: -40, w: 58, h: 45 }]),
  F([{ ox: 48, oy: -42, w: 55, h: 42 }]),
  F([{ ox: 45, oy: -45, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -48, w: 48, h: 36 }]),
  F([{ ox: 38, oy: -52, w: 45, h: 34 }]),
];

// DM: Screw Upper (massive multi-hit hurricane projectile)
export const DM_SCREW_UPPER_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -60, w: 40, h: 30 }]),
];

// ===== 安迪 (Andy Bogard) =====
// APPROX based on KOF2002UM
export const ANDY_HISHOU_KEN_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -58, w: 35, h: 28 }]),
  F([{ ox: 55, oy: -56, w: 38, h: 30 }]),
  ...Array.from({ length: 16 }, (_, i) =>
    F([{ ox: 55 + i * 2, oy: -56, w: 35, h: 28 }])
  ),
];

export const ANDY_HISHOU_KEN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -58, w: 38, h: 30 }]),
  F([{ ox: 55, oy: -56, w: 42, h: 32 }]),
  ...Array.from({ length: 20 }, (_, i) =>
    F([{ ox: 55 + i * 2, oy: -56, w: 38, h: 30 }])
  ),
];

export const ANDY_SHOURYUU_DAN_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

export const ANDY_SHOURYUU_DAN_C_FRAMES: AttackFrame[] = [
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

export const ANDY_ZANEI_RYUSEI_KEN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 48, h: 35 }]),
  F([{ ox: 42, oy: -52, w: 55, h: 38 }]),
  F([{ ox: 48, oy: -48, w: 62, h: 42 }]),
  F([{ ox: 50, oy: -46, w: 65, h: 44 }]),
  F([{ ox: 48, oy: -48, w: 62, h: 42 }]),
  F([{ ox: 45, oy: -50, w: 58, h: 40 }]),
  F([{ ox: 42, oy: -52, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -55, w: 48, h: 35 }]),
];

export const ANDY_ZANEI_RYUSEI_KEN_D_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 50, h: 36 }]),
  F([{ ox: 42, oy: -52, w: 58, h: 40 }]),
  F([{ ox: 48, oy: -48, w: 65, h: 44 }]),
  F([{ ox: 52, oy: -46, w: 70, h: 48 }]),
  F([{ ox: 52, oy: -46, w: 72, h: 50 }]),
  F([{ ox: 50, oy: -48, w: 68, h: 48 }]),
  F([{ ox: 48, oy: -50, w: 62, h: 44 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 40 }]),
  F([{ ox: 42, oy: -54, w: 50, h: 38 }]),
  F([{ ox: 38, oy: -56, w: 45, h: 35 }]),
  F([{ ox: 35, oy: -58, w: 42, h: 32 }]),
  F([{ ox: 32, oy: -60, w: 38, h: 30 }]),
];

export const ANDY_GEKI_HISHOU_KEN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -45, w: 45, h: 38 }]),
  F([{ ox: 42, oy: -42, w: 52, h: 42 }]),
  F([{ ox: 48, oy: -38, w: 58, h: 45 }]),
  F([{ ox: 48, oy: -38, w: 58, h: 45 }]),
  F([{ ox: 45, oy: -42, w: 52, h: 42 }]),
  F([{ ox: 42, oy: -45, w: 48, h: 38 }]),
  F([{ ox: 38, oy: -48, w: 45, h: 36 }]),
  F([{ ox: 35, oy: -50, w: 42, h: 34 }]),
];

export const DM_CHO_REPPA_DAN_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 55, h: 45 }]),
  F([{ ox: 36, oy: -62, w: 65, h: 50 }]),
  F([{ ox: 40, oy: -60, w: 72, h: 52 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 38, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 35, oy: -65, w: 68, h: 50 }]),
  F([{ ox: 32, oy: -68, w: 60, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 55, h: 42 }]),
  F([{ ox: 28, oy: -72, w: 50, h: 38 }]),
  F([{ ox: 26, oy: -75, w: 45, h: 35 }]),
  F([{ ox: 24, oy: -78, w: 42, h: 32 }]),
  F([{ ox: 22, oy: -80, w: 38, h: 30 }]),
];

export const SDM_CHO_REPPA_DAN_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 60, h: 48 }]),
  F([{ ox: 36, oy: -62, w: 70, h: 52 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 42, oy: -58, w: 85, h: 58 }]),
  F([{ ox: 42, oy: -58, w: 90, h: 60 }]),
  F([{ ox: 42, oy: -58, w: 90, h: 60 }]),
  F([{ ox: 40, oy: -60, w: 85, h: 58 }]),
  F([{ ox: 38, oy: -62, w: 78, h: 55 }]),
  F([{ ox: 36, oy: -65, w: 72, h: 52 }]),
  F([{ ox: 34, oy: -68, w: 65, h: 48 }]),
  F([{ ox: 32, oy: -70, w: 58, h: 44 }]),
  F([{ ox: 30, oy: -72, w: 52, h: 40 }]),
  F([{ ox: 28, oy: -75, w: 48, h: 38 }]),
  F([{ ox: 26, oy: -78, w: 42, h: 34 }]),
  F([{ ox: 24, oy: -80, w: 38, h: 32 }]),
  F([{ ox: 22, oy: -82, w: 35, h: 30 }]),
  F([{ ox: 20, oy: -85, w: 32, h: 28 }]),
  F([{ ox: 18, oy: -88, w: 30, h: 25 }]),
  ...Array.from({ length: 4 }, (_, i) =>
    F([{ ox: 18 - i, oy: -88 + i * 3, w: 28 - i * 2, h: 25 - i }])
  ),
];

// ===== 比利·凯恩 (Billy Kane) ===== APPROX based on KOF2002UM
// Sansetsu Kon (A) — fast staff thrust
export const BILLY_SANSETSU_KON_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 52, h: 28 }]),
  F([{ ox: 50, oy: -52, w: 60, h: 32 }]),
  F([{ ox: 55, oy: -50, w: 65, h: 34 }]),
  F([{ ox: 55, oy: -50, w: 65, h: 34 }]),
  F([{ ox: 52, oy: -52, w: 60, h: 32 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 30 }]),
  F([{ ox: 45, oy: -58, w: 50, h: 28 }]),
  F([{ ox: 42, oy: -60, w: 45, h: 26 }]),
];

// Sansetsu Kon (C) — strong staff thrust, more range
export const BILLY_SANSETSU_KON_C_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 55, h: 30 }]),
  F([{ ox: 52, oy: -52, w: 65, h: 34 }]),
  F([{ ox: 58, oy: -48, w: 72, h: 38 }]),
  F([{ ox: 62, oy: -46, w: 78, h: 40 }]),
  F([{ ox: 62, oy: -46, w: 78, h: 40 }]),
  F([{ ox: 58, oy: -48, w: 72, h: 38 }]),
  F([{ ox: 55, oy: -50, w: 68, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 62, h: 34 }]),
  F([{ ox: 48, oy: -55, w: 58, h: 32 }]),
  F([{ ox: 45, oy: -58, w: 52, h: 30 }]),
  F([{ ox: 42, oy: -60, w: 48, h: 28 }]),
  F([{ ox: 40, oy: -62, w: 44, h: 26 }]),
];

// Senpu Kon (A) — anti-air spinning staff, 1-hit
export const BILLY_SENPU_KON_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

// Senpu Kon (C) — anti-air spinning staff, 2-hit
export const BILLY_SENPU_KON_C_FRAMES: AttackFrame[] = [
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

// Kyousoku Hien Zan (B) — short flying swallow slash
export const BILLY_HIEN_ZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -50, w: 48, h: 38 }]),
  F([{ ox: 45, oy: -45, w: 55, h: 42 }]),
  F([{ ox: 50, oy: -40, w: 60, h: 45 }]),
  F([{ ox: 50, oy: -40, w: 60, h: 45 }]),
  F([{ ox: 48, oy: -42, w: 55, h: 42 }]),
  F([{ ox: 45, oy: -45, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -48, w: 48, h: 36 }]),
  F([{ ox: 38, oy: -52, w: 45, h: 34 }]),
];

// Kyousoku Hien Zan (D) — long flying swallow slash
export const BILLY_HIEN_ZAN_D_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -50, w: 52, h: 40 }]),
  F([{ ox: 48, oy: -45, w: 60, h: 44 }]),
  F([{ ox: 55, oy: -38, w: 68, h: 48 }]),
  F([{ ox: 58, oy: -35, w: 72, h: 50 }]),
  F([{ ox: 58, oy: -35, w: 72, h: 50 }]),
  F([{ ox: 55, oy: -38, w: 68, h: 48 }]),
  F([{ ox: 52, oy: -40, w: 62, h: 44 }]),
  F([{ ox: 48, oy: -42, w: 58, h: 42 }]),
  F([{ ox: 45, oy: -45, w: 52, h: 38 }]),
  F([{ ox: 42, oy: -48, w: 48, h: 36 }]),
  F([{ ox: 38, oy: -52, w: 45, h: 34 }]),
  F([{ ox: 35, oy: -55, w: 42, h: 32 }]),
];

// DM: Chou Kaen Senpu Jin (super spinning staff fire)
export const DM_KAEN_SENPU_JIN_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 55, h: 45 }]),
  F([{ ox: 36, oy: -62, w: 65, h: 50 }]),
  F([{ ox: 40, oy: -60, w: 72, h: 52 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 40, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 38, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 35, oy: -65, w: 68, h: 50 }]),
  F([{ ox: 32, oy: -68, w: 60, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 55, h: 42 }]),
  F([{ ox: 28, oy: -72, w: 50, h: 38 }]),
];

// SDM: Chou Kaen Senpu Jin SDM
export const SDM_KAEN_SENPU_JIN_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 60, h: 48 }]),
  F([{ ox: 36, oy: -62, w: 70, h: 52 }]),
  F([{ ox: 42, oy: -58, w: 80, h: 56 }]),
  F([{ ox: 45, oy: -55, w: 88, h: 60 }]),
  F([{ ox: 45, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 45, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 45, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 42, oy: -58, w: 85, h: 58 }]),
  F([{ ox: 40, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 38, oy: -62, w: 72, h: 52 }]),
  F([{ ox: 35, oy: -65, w: 65, h: 48 }]),
  F([{ ox: 32, oy: -68, w: 58, h: 44 }]),
  F([{ ox: 30, oy: -72, w: 52, h: 40 }]),
  F([{ ox: 28, oy: -75, w: 48, h: 36 }]),
  F([{ ox: 26, oy: -78, w: 42, h: 32 }]),
  F([{ ox: 24, oy: -80, w: 38, h: 28 }]),
  F([{ ox: 22, oy: -82, w: 35, h: 26 }]),
  F([{ ox: 20, oy: -85, w: 32, h: 24 }]),
  F([{ ox: 18, oy: -88, w: 30, h: 22 }]),
  F([{ ox: 16, oy: -90, w: 28, h: 20 }]),
];

// ===== 陈可汗 (Chang Koehan) ===== APPROX based on KOF2002UM
// Tekkyuu Dai Kaiten (A) — iron ball spin, fast
export const CHANG_TEKKYUU_KAITEN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -55, w: 52, h: 35 }]),
  F([{ ox: 45, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 52, oy: -48, w: 62, h: 42 }]),
  F([{ ox: 52, oy: -48, w: 62, h: 42 }]),
  F([{ ox: 48, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 35 }]),
  F([{ ox: 38, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 35, oy: -60, w: 45, h: 30 }]),
  F([{ ox: 32, oy: -62, w: 42, h: 28 }]),
  F([{ ox: 30, oy: -65, w: 40, h: 26 }]),
  F([{ ox: 28, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 26, oy: -70, w: 35, h: 22 }]),
  F([{ ox: 24, oy: -72, w: 32, h: 20 }]),
  F([{ ox: 22, oy: -74, w: 30, h: 18 }]),
];

// Tekkyuu Dai Kaiten (C) — iron ball spin, strong multi-hit
export const CHANG_TEKKYUU_KAITEN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -55, w: 55, h: 38 }]),
  F([{ ox: 48, oy: -52, w: 62, h: 42 }]),
  F([{ ox: 55, oy: -48, w: 68, h: 45 }]),
  F([{ ox: 58, oy: -45, w: 72, h: 48 }]),
  F([{ ox: 58, oy: -45, w: 72, h: 48 }]),
  F([{ ox: 55, oy: -48, w: 68, h: 45 }]),
  F([{ ox: 52, oy: -50, w: 62, h: 42 }]),
  F([{ ox: 48, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 45, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 42, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 40, oy: -60, w: 48, h: 32 }]),
  F([{ ox: 38, oy: -62, w: 45, h: 30 }]),
  F([{ ox: 36, oy: -64, w: 42, h: 28 }]),
  F([{ ox: 34, oy: -66, w: 40, h: 26 }]),
  F([{ ox: 32, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 30, oy: -70, w: 35, h: 22 }]),
  F([{ ox: 28, oy: -72, w: 32, h: 20 }]),
  F([{ ox: 26, oy: -74, w: 30, h: 18 }]),
  F([{ ox: 24, oy: -76, w: 28, h: 16 }]),
  F([{ ox: 22, oy: -78, w: 26, h: 14 }]),
];

// Tekkyuu Fasshu — iron ball swing, overhead
export const CHANG_TEKKYUU_FASSHU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -60, w: 48, h: 35 }]),
  F([{ ox: 42, oy: -55, w: 55, h: 38 }]),
  F([{ ox: 50, oy: -50, w: 62, h: 42 }]),
  F([{ ox: 55, oy: -48, w: 68, h: 45 }]),
  F([{ ox: 55, oy: -48, w: 68, h: 45 }]),
  F([{ ox: 52, oy: -50, w: 62, h: 42 }]),
  F([{ ox: 48, oy: -52, w: 58, h: 40 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
];

// Tekkyuu Hien Zan — flying iron ball attack
export const CHANG_TEKKYUU_HIEN_ZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 48, h: 38 }]),
  F([{ ox: 42, oy: -50, w: 55, h: 42 }]),
  F([{ ox: 48, oy: -45, w: 62, h: 45 }]),
  F([{ ox: 52, oy: -42, w: 65, h: 48 }]),
  F([{ ox: 52, oy: -42, w: 65, h: 48 }]),
  F([{ ox: 48, oy: -45, w: 60, h: 45 }]),
  F([{ ox: 45, oy: -48, w: 55, h: 42 }]),
  F([{ ox: 42, oy: -52, w: 50, h: 38 }]),
  F([{ ox: 38, oy: -55, w: 45, h: 35 }]),
  F([{ ox: 35, oy: -58, w: 42, h: 32 }]),
];

// DM: Tekkyuu Dai Bousou — massive iron ball rush
export const DM_TEKKYUU_DAI_BOUSOU_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 58, h: 48 }]),
  F([{ ox: 38, oy: -62, w: 68, h: 52 }]),
  F([{ ox: 45, oy: -58, w: 78, h: 56 }]),
  F([{ ox: 50, oy: -55, w: 88, h: 60 }]),
  F([{ ox: 52, oy: -52, w: 95, h: 62 }]),
  F([{ ox: 52, oy: -52, w: 95, h: 62 }]),
  F([{ ox: 52, oy: -52, w: 95, h: 62 }]),
  F([{ ox: 50, oy: -55, w: 88, h: 58 }]),
  F([{ ox: 48, oy: -58, w: 82, h: 55 }]),
  F([{ ox: 45, oy: -60, w: 75, h: 52 }]),
  F([{ ox: 42, oy: -62, w: 68, h: 48 }]),
  F([{ ox: 38, oy: -65, w: 60, h: 44 }]),
];

// SDM: Tekkyuu Dai Bousou SDM — bigger, more devastating
export const SDM_TEKKYUU_DAI_BOUSOU_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 62, h: 50 }]),
  F([{ ox: 38, oy: -62, w: 72, h: 55 }]),
  F([{ ox: 45, oy: -58, w: 82, h: 58 }]),
  F([{ ox: 52, oy: -54, w: 92, h: 62 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 65 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 65 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 65 }]),
  F([{ ox: 55, oy: -52, w: 100, h: 65 }]),
  F([{ ox: 52, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 50, oy: -58, w: 85, h: 58 }]),
  F([{ ox: 48, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 45, oy: -62, w: 72, h: 52 }]),
  F([{ ox: 42, oy: -65, w: 65, h: 48 }]),
  F([{ ox: 38, oy: -68, w: 58, h: 44 }]),
  F([{ ox: 35, oy: -70, w: 52, h: 40 }]),
  F([{ ox: 32, oy: -72, w: 48, h: 36 }]),
  F([{ ox: 30, oy: -75, w: 42, h: 32 }]),
  F([{ ox: 28, oy: -78, w: 38, h: 28 }]),
];

// ===== 蔡宝奇 (Choi Bounge) ===== APPROX based on KOF2002UM

// Souten Mekkyaku (→+A) — upper claw slash
export const CHOI_SOUTEN_MEKKYAKU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -68, w: 40, h: 28 }]),
  F([{ ox: 46, oy: -65, w: 48, h: 30 }]),
  F([{ ox: 46, oy: -65, w: 48, h: 30 }]),
];

// San Ren Geki (→+B) — low claw sweep
export const CHOI_SAN_REN_GEKI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -22, w: 45, h: 25 }]),
  F([{ ox: 42, oy: -20, w: 52, h: 28 }]),
  F([{ ox: 42, oy: -20, w: 52, h: 28 }]),
];

// Hishou Kyaku (QCF+A) — diving claw attack, fast
export const CHOI_HISHOU_KYAKU_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -55, w: 45, h: 35 }]),
  F([{ ox: 40, oy: -50, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -48, w: 58, h: 42 }]),
  F([{ ox: 45, oy: -48, w: 58, h: 42 }]),
  F([{ ox: 42, oy: -50, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -52, w: 48, h: 35 }]),
];

// Hishou Kyaku C (QCF+C) — diving claw attack, strong
export const CHOI_HISHOU_KYAKU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -52, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -48, w: 58, h: 42 }]),
  F([{ ox: 48, oy: -45, w: 65, h: 45 }]),
  F([{ ox: 48, oy: -45, w: 65, h: 45 }]),
  F([{ ox: 48, oy: -45, w: 65, h: 45 }]),
  F([{ ox: 45, oy: -48, w: 58, h: 42 }]),
  F([{ ox: 40, oy: -50, w: 52, h: 38 }]),
  F([{ ox: 36, oy: -52, w: 48, h: 35 }]),
];

// Kaiten Hien Zan (QCB+A) — spinning claw, 1-hit anti-air
export const CHOI_KAITEN_HIEN_ZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -70, w: 42, h: 40 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 30, oy: -78, w: 48, h: 45 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 32, oy: -82, w: 50, h: 48 }]),
  F([{ ox: 30, oy: -78, w: 48, h: 45 }]),
  F([{ ox: 28, oy: -72, w: 45, h: 42 }]),
  F([{ ox: 25, oy: -65, w: 40, h: 38 }]),
];

// Kaiten Hien Zan C (QCB+C) — spinning claw, 2-hit anti-air
export const CHOI_KAITEN_HIEN_ZAN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -72, w: 48, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 35, oy: -80, w: 55, h: 48 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 38, oy: -85, w: 58, h: 52 }]),
  F([{ ox: 38, oy: -85, w: 58, h: 52 }]),
  F([{ ox: 35, oy: -82, w: 55, h: 48 }]),
  F([{ ox: 32, oy: -78, w: 52, h: 45 }]),
  F([{ ox: 30, oy: -72, w: 48, h: 42 }]),
  F([{ ox: 28, oy: -65, w: 42, h: 38 }]),
];

// Houyoku Tenshin Sen (DP+K) — upward spinning attack
export const CHOI_HOUYOKU_TENSHIN_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -75, w: 48, h: 45 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 38, oy: -82, w: 55, h: 50 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 42, oy: -88, w: 60, h: 55 }]),
  F([{ ox: 42, oy: -88, w: 60, h: 55 }]),
  F([{ ox: 40, oy: -85, w: 58, h: 52 }]),
  F([{ ox: 38, oy: -80, w: 55, h: 48 }]),
  F([{ ox: 35, oy: -75, w: 50, h: 45 }]),
  F([{ ox: 32, oy: -68, w: 45, h: 40 }]),
];

// DM: Shin! Chou Houyoku Tenshin Sen
export const DM_SHIN_CHOU_HOUYOKU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 55, h: 48 }]),
  F([{ ox: 36, oy: -85, w: 65, h: 55 }]),
  F([{ ox: 42, oy: -90, w: 72, h: 58 }]),
  F([{ ox: 42, oy: -90, w: 75, h: 60 }]),
  F([{ ox: 42, oy: -90, w: 75, h: 60 }]),
  F([{ ox: 42, oy: -90, w: 75, h: 60 }]),
  F([{ ox: 40, oy: -88, w: 70, h: 58 }]),
  F([{ ox: 38, oy: -85, w: 65, h: 55 }]),
  F([{ ox: 35, oy: -80, w: 58, h: 50 }]),
  F([{ ox: 32, oy: -75, w: 52, h: 45 }]),
];

// SDM: Shin! Chou Houyoku Tenshin Sen SDM
export const SDM_SHIN_CHOU_HOUYOKU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -80, w: 60, h: 50 }]),
  F([{ ox: 38, oy: -88, w: 72, h: 58 }]),
  F([{ ox: 45, oy: -92, w: 80, h: 62 }]),
  F([{ ox: 48, oy: -92, w: 85, h: 65 }]),
  F([{ ox: 48, oy: -92, w: 88, h: 68 }]),
  F([{ ox: 48, oy: -92, w: 88, h: 68 }]),
  F([{ ox: 48, oy: -92, w: 88, h: 68 }]),
  F([{ ox: 45, oy: -90, w: 82, h: 62 }]),
  F([{ ox: 42, oy: -88, w: 75, h: 58 }]),
  F([{ ox: 38, oy: -85, w: 68, h: 55 }]),
  F([{ ox: 35, oy: -80, w: 60, h: 50 }]),
  F([{ ox: 32, oy: -78, w: 55, h: 45 }]),
  F([{ ox: 30, oy: -75, w: 50, h: 42 }]),
];

// ===== 大门五郎 (Yashiro Nanakase) ===== APPROX based on KOF2002UM
// Upper Du Bag (A) — multi-hit rush
export const YASHIRO_UPPER_DU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -58, w: 45, h: 30 }]),
  F([{ ox: 45, oy: -55, w: 52, h: 34 }]),
  F([{ ox: 50, oy: -52, w: 58, h: 36 }]),
  F([{ ox: 50, oy: -52, w: 58, h: 36 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 34 }]),
  F([{ ox: 45, oy: -58, w: 50, h: 32 }]),
  F([{ ox: 42, oy: -60, w: 48, h: 30 }]),
  F([{ ox: 40, oy: -62, w: 45, h: 28 }]),
  F([{ ox: 38, oy: -64, w: 42, h: 26 }]),
  F([{ ox: 36, oy: -66, w: 40, h: 24 }]),
];

// Upper Du Bag (C) — more hits, bigger reach
export const YASHIRO_UPPER_DU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 45, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 62, h: 40 }]),
  F([{ ox: 55, oy: -50, w: 65, h: 42 }]),
  F([{ ox: 55, oy: -50, w: 65, h: 42 }]),
  F([{ ox: 52, oy: -52, w: 62, h: 40 }]),
  F([{ ox: 50, oy: -54, w: 58, h: 38 }]),
  F([{ ox: 48, oy: -56, w: 55, h: 36 }]),
  F([{ ox: 48, oy: -56, w: 55, h: 36 }]),
  F([{ ox: 45, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 42, oy: -60, w: 48, h: 32 }]),
  F([{ ox: 40, oy: -62, w: 45, h: 30 }]),
  F([{ ox: 38, oy: -64, w: 42, h: 28 }]),
  F([{ ox: 36, oy: -66, w: 40, h: 26 }]),
  F([{ ox: 34, oy: -68, w: 38, h: 24 }]),
  F([{ ox: 32, oy: -70, w: 36, h: 22 }]),
];

// Niraai Kaname — overhead smash
export const YASHIRO_NIRAAI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -65, w: 50, h: 38 }]),
  F([{ ox: 48, oy: -60, w: 58, h: 42 }]),
  F([{ ox: 52, oy: -55, w: 65, h: 48 }]),
  F([{ ox: 55, oy: -52, w: 70, h: 52 }]),
  F([{ ox: 55, oy: -52, w: 70, h: 52 }]),
  F([{ ox: 52, oy: -55, w: 65, h: 48 }]),
];

// Musatsu Niraai — sliding kick
export const YASHIRO_MUSATSU_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -20, w: 55, h: 25 }]),
  F([{ ox: 55, oy: -18, w: 65, h: 28 }]),
  F([{ ox: 60, oy: -16, w: 72, h: 30 }]),
  F([{ ox: 60, oy: -16, w: 72, h: 30 }]),
  F([{ ox: 55, oy: -18, w: 65, h: 28 }]),
  F([{ ox: 50, oy: -20, w: 60, h: 25 }]),
];

// DM: Armageddon Busters
export const DM_ARMAGEDDON_BUSTERS_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -65, w: 55, h: 42 }]),
  F([{ ox: 38, oy: -62, w: 65, h: 48 }]),
  F([{ ox: 45, oy: -58, w: 78, h: 55 }]),
  F([{ ox: 50, oy: -55, w: 88, h: 60 }]),
  F([{ ox: 52, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 52, oy: -55, w: 92, h: 62 }]),
  F([{ ox: 50, oy: -58, w: 85, h: 58 }]),
  F([{ ox: 48, oy: -60, w: 78, h: 55 }]),
  F([{ ox: 45, oy: -62, w: 72, h: 50 }]),
  F([{ ox: 42, oy: -65, w: 65, h: 45 }]),
];

// SDM: Armageddon Busters
export const SDM_ARMAGEDDON_BUSTERS_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -68, w: 58, h: 45 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 50 }]),
  F([{ ox: 42, oy: -60, w: 80, h: 58 }]),
  F([{ ox: 48, oy: -55, w: 90, h: 65 }]),
  F([{ ox: 52, oy: -52, w: 98, h: 70 }]),
  F([{ ox: 52, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 52, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 52, oy: -52, w: 100, h: 72 }]),
  F([{ ox: 50, oy: -55, w: 92, h: 68 }]),
  F([{ ox: 48, oy: -58, w: 85, h: 62 }]),
  F([{ ox: 45, oy: -60, w: 78, h: 58 }]),
  F([{ ox: 42, oy: -62, w: 72, h: 52 }]),
  F([{ ox: 38, oy: -65, w: 65, h: 48 }]),
  F([{ ox: 35, oy: -68, w: 58, h: 45 }]),
  F([{ ox: 32, oy: -70, w: 52, h: 42 }]),
  F([{ ox: 30, oy: -72, w: 48, h: 40 }]),
];

// ── 玛卓必杀技 (Mature) ──
export const MATURE_MASSACRE_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -95, w: 62, h: 40 }]),
  F([{ ox: 55, oy: -100, w: 68, h: 42 }]),
  F([{ ox: 60, oy: -105, w: 75, h: 45 }]),
];
export const MATURE_MASSACRE_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -92, w: 65, h: 42 }]),
  F([{ ox: 52, oy: -98, w: 72, h: 45 }]),
  F([{ ox: 58, oy: -105, w: 80, h: 50 }]),
  F([{ ox: 62, oy: -105, w: 80, h: 50 }]),
];
export const MATURE_HEAVENS_GATE_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -120, w: 65, h: 55 }]),
  F([{ ox: 45, oy: -118, w: 70, h: 58 }]),
  F([{ ox: 50, oy: -115, w: 70, h: 60 }]),
  F([{ ox: 50, oy: -120, w: 70, h: 60 }]),
];
export const MATURE_ECSTASY_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -155, w: 55, h: 65 }]),
  F([{ ox: 38, oy: -150, w: 58, h: 68 }]),
  F([{ ox: 40, oy: -148, w: 60, h: 70 }]),
  F([{ ox: 40, oy: -155, w: 60, h: 70 }]),
  F([{ ox: 40, oy: -160, w: 60, h: 68 }]),
];
export const DM_NOCTURNAL_LIGHT_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -130, w: 70, h: 60 }]),
  F([{ ox: 42, oy: -128, w: 78, h: 65 }]),
  F([{ ox: 45, oy: -125, w: 85, h: 68 }]),
  F([{ ox: 45, oy: -130, w: 90, h: 70 }]),
  F([{ ox: 45, oy: -132, w: 90, h: 70 }]),
  F([{ ox: 42, oy: -135, w: 85, h: 68 }]),
  F([{ ox: 40, oy: -138, w: 80, h: 65 }]),
  F([{ ox: 38, oy: -140, w: 75, h: 60 }]),
];
export const SDM_NOCTURNAL_LIGHT_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -138, w: 72, h: 62 }]),
  F([{ ox: 40, oy: -135, w: 82, h: 68 }]),
  F([{ ox: 42, oy: -130, w: 92, h: 75 }]),
  F([{ ox: 45, oy: -125, w: 100, h: 80 }]),
  F([{ ox: 45, oy: -128, w: 100, h: 80 }]),
  F([{ ox: 45, oy: -132, w: 100, h: 80 }]),
  F([{ ox: 45, oy: -135, w: 100, h: 80 }]),
  F([{ ox: 42, oy: -138, w: 92, h: 75 }]),
  F([{ ox: 40, oy: -140, w: 85, h: 70 }]),
  F([{ ox: 38, oy: -142, w: 78, h: 65 }]),
  F([{ ox: 36, oy: -145, w: 72, h: 62 }]),
  F([{ ox: 35, oy: -148, w: 68, h: 58 }]),
];

// ── 薇丝必杀技 (Vice) ──
export const VICE_OUTRAGE_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -90, w: 58, h: 38 }]),
  F([{ ox: 52, oy: -95, w: 65, h: 42 }]),
  F([{ ox: 58, oy: -100, w: 75, h: 45 }]),
  F([{ ox: 58, oy: -100, w: 75, h: 45 }]),
  F([{ ox: 55, oy: -98, w: 72, h: 42 }]),
];
export const VICE_OUTRAGE_C_FRAMES: AttackFrame[] = [
  F([{ ox: 46, oy: -88, w: 62, h: 40 }]),
  F([{ ox: 50, oy: -92, w: 70, h: 45 }]),
  F([{ ox: 56, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 60, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 60, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 58, oy: -98, w: 78, h: 48 }]),
  F([{ ox: 55, oy: -95, w: 72, h: 45 }]),
];
export const VICE_BLACK_END_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -110, w: 60, h: 50 }]),
  F([{ ox: 42, oy: -112, w: 68, h: 55 }]),
  F([{ ox: 48, oy: -115, w: 72, h: 58 }]),
  F([{ ox: 48, oy: -115, w: 72, h: 58 }]),
  F([{ ox: 45, oy: -118, w: 68, h: 55 }]),
  F([{ ox: 42, oy: -120, w: 62, h: 50 }]),
];
export const VICE_MAYHEM_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -18, w: 65, h: 24 }]),
  F([{ ox: 50, oy: -20, w: 72, h: 26 }]),
  F([{ ox: 55, oy: -22, w: 78, h: 28 }]),
  F([{ ox: 55, oy: -22, w: 78, h: 28 }]),
  F([{ ox: 52, oy: -20, w: 72, h: 26 }]),
];
export const DM_NEGATIVE_GAIN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -125, w: 68, h: 55 }]),
  F([{ ox: 40, oy: -122, w: 78, h: 60 }]),
  F([{ ox: 42, oy: -118, w: 88, h: 65 }]),
  F([{ ox: 42, oy: -125, w: 92, h: 70 }]),
  F([{ ox: 42, oy: -128, w: 92, h: 70 }]),
  F([{ ox: 42, oy: -130, w: 92, h: 70 }]),
  F([{ ox: 42, oy: -130, w: 92, h: 70 }]),
  F([{ ox: 42, oy: -132, w: 88, h: 68 }]),
  F([{ ox: 40, oy: -135, w: 82, h: 65 }]),
  F([{ ox: 38, oy: -138, w: 75, h: 60 }]),
  F([{ ox: 36, oy: -140, w: 68, h: 55 }]),
  F([{ ox: 35, oy: -142, w: 62, h: 50 }]),
];
export const SDM_NEGATIVE_GAIN_FRAMES: AttackFrame[] = [
  F([{ ox: 36, oy: -135, w: 65, h: 55 }]),
  F([{ ox: 38, oy: -132, w: 75, h: 60 }]),
  F([{ ox: 40, oy: -128, w: 88, h: 68 }]),
  F([{ ox: 42, oy: -122, w: 98, h: 75 }]),
  F([{ ox: 42, oy: -125, w: 100, h: 78 }]),
  F([{ ox: 42, oy: -128, w: 100, h: 78 }]),
  F([{ ox: 42, oy: -130, w: 100, h: 78 }]),
  F([{ ox: 42, oy: -132, w: 100, h: 78 }]),
  F([{ ox: 42, oy: -135, w: 100, h: 78 }]),
  F([{ ox: 40, oy: -138, w: 92, h: 72 }]),
  F([{ ox: 38, oy: -140, w: 82, h: 68 }]),
  F([{ ox: 36, oy: -142, w: 72, h: 62 }]),
  F([{ ox: 35, oy: -145, w: 65, h: 58 }]),
  F([{ ox: 34, oy: -148, w: 60, h: 55 }]),
  F([{ ox: 33, oy: -150, w: 55, h: 52 }]),
];

// ===== 克里斯 (Chris) ===== APPROX based on KOF2002UM
// Shot Weave (A) — rushing punch, fast
export const CHRIS_SHOT_WEAVE_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -58, w: 45, h: 30 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 34 }]),
  F([{ ox: 55, oy: -52, w: 62, h: 38 }]),
  F([{ ox: 55, oy: -52, w: 62, h: 38 }]),
  F([{ ox: 52, oy: -55, w: 58, h: 34 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 30 }]),
  F([{ ox: 42, oy: -60, w: 45, h: 28 }]),
];

// Shot Weave (C) — rushing punch, strong
export const CHRIS_SHOT_WEAVE_C_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 50, oy: -55, w: 58, h: 36 }]),
  F([{ ox: 58, oy: -50, w: 68, h: 42 }]),
  F([{ ox: 62, oy: -48, w: 75, h: 45 }]),
  F([{ ox: 62, oy: -48, w: 75, h: 45 }]),
  F([{ ox: 58, oy: -50, w: 68, h: 42 }]),
  F([{ ox: 52, oy: -54, w: 58, h: 38 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 42, oy: -60, w: 45, h: 30 }]),
  F([{ ox: 38, oy: -62, w: 40, h: 28 }]),
];

// Twister Drive (QCB+K) — spinning kick, knockdown
export const CHRIS_TWISTER_DRIVE_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -50, w: 58, h: 42 }]),
  F([{ ox: 48, oy: -45, w: 65, h: 48 }]),
  F([{ ox: 52, oy: -42, w: 70, h: 52 }]),
  F([{ ox: 52, oy: -42, w: 70, h: 52 }]),
  F([{ ox: 52, oy: -42, w: 70, h: 52 }]),
  F([{ ox: 48, oy: -45, w: 65, h: 48 }]),
  F([{ ox: 45, oy: -48, w: 58, h: 42 }]),
];

// Scramble Dash (DP+K) — low rushing attack
export const CHRIS_SCRAMBLE_DASH_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -28, w: 50, h: 30 }]),
  F([{ ox: 50, oy: -25, w: 58, h: 32 }]),
  F([{ ox: 58, oy: -22, w: 65, h: 35 }]),
  F([{ ox: 62, oy: -20, w: 70, h: 38 }]),
  F([{ ox: 62, oy: -20, w: 70, h: 38 }]),
  F([{ ox: 58, oy: -22, w: 65, h: 35 }]),
  F([{ ox: 52, oy: -25, w: 58, h: 32 }]),
  F([{ ox: 45, oy: -28, w: 50, h: 30 }]),
];

// DM: Chain Slide Touch — multi-hit sliding attack
export const DM_CHAIN_SLIDE_TOUCH_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 55, h: 40 }]),
  F([{ ox: 42, oy: -50, w: 65, h: 48 }]),
  F([{ ox: 50, oy: -45, w: 75, h: 55 }]),
  F([{ ox: 55, oy: -42, w: 82, h: 58 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 55, oy: -42, w: 85, h: 60 }]),
  F([{ ox: 52, oy: -45, w: 78, h: 55 }]),
  F([{ ox: 48, oy: -48, w: 70, h: 50 }]),
];

// SDM: Chain Slide Touch SDM — bigger, more devastating
export const SDM_CHAIN_SLIDE_TOUCH_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 60, h: 42 }]),
  F([{ ox: 45, oy: -50, w: 72, h: 50 }]),
  F([{ ox: 52, oy: -45, w: 82, h: 58 }]),
  F([{ ox: 58, oy: -40, w: 92, h: 65 }]),
  F([{ ox: 62, oy: -38, w: 98, h: 68 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -38, w: 100, h: 70 }]),
  F([{ ox: 58, oy: -42, w: 92, h: 62 }]),
  F([{ ox: 55, oy: -45, w: 82, h: 58 }]),
  F([{ ox: 52, oy: -48, w: 75, h: 52 }]),
  F([{ ox: 48, oy: -52, w: 68, h: 48 }]),
];

// ===== 夏尔美 (Shermie) ===== APPROX based on KOF2002UM
// Shermie Shoot (A) — spinning kick, fast
export const SHERMIE_SHOOT_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -90, w: 55, h: 38 }]),
  F([{ ox: 52, oy: -95, w: 62, h: 42 }]),
  F([{ ox: 55, oy: -100, w: 68, h: 45 }]),
  F([{ ox: 55, oy: -100, w: 68, h: 45 }]),
  F([{ ox: 52, oy: -95, w: 62, h: 42 }]),
  F([{ ox: 48, oy: -90, w: 55, h: 38 }]),
];

// Shermie Shoot (C) — spinning kick, strong knockdown
export const SHERMIE_SHOOT_C_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -88, w: 60, h: 42 }]),
  F([{ ox: 50, oy: -92, w: 68, h: 48 }]),
  F([{ ox: 55, oy: -96, w: 75, h: 52 }]),
  F([{ ox: 58, oy: -98, w: 80, h: 52 }]),
  F([{ ox: 58, oy: -98, w: 80, h: 52 }]),
  F([{ ox: 58, oy: -98, w: 80, h: 52 }]),
  F([{ ox: 55, oy: -96, w: 75, h: 50 }]),
  F([{ ox: 52, oy: -92, w: 68, h: 48 }]),
  F([{ ox: 48, oy: -90, w: 62, h: 42 }]),
  F([{ ox: 45, oy: -92, w: 55, h: 38 }]),
];

// Shermie Carnival (QCB+P) — multi-hit spinning attack
export const SHERMIE_CARNIVAL_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -95, w: 58, h: 40 }]),
  F([{ ox: 48, oy: -100, w: 65, h: 45 }]),
  F([{ ox: 52, oy: -105, w: 72, h: 48 }]),
  F([{ ox: 52, oy: -105, w: 75, h: 48 }]),
  F([{ ox: 48, oy: -100, w: 70, h: 45 }]),
  F([{ ox: 45, oy: -95, w: 62, h: 42 }]),
];

// Axle Spin Kick (HCF+K) — low spinning sweep
export const SHERMIE_AXLE_SPIN_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -18, w: 55, h: 22 }]),
  F([{ ox: 52, oy: -16, w: 62, h: 24 }]),
  F([{ ox: 55, oy: -14, w: 70, h: 26 }]),
  F([{ ox: 58, oy: -12, w: 75, h: 28 }]),
  F([{ ox: 58, oy: -12, w: 78, h: 28 }]),
  F([{ ox: 55, oy: -14, w: 72, h: 26 }]),
  F([{ ox: 52, oy: -16, w: 65, h: 24 }]),
  F([{ ox: 48, oy: -18, w: 58, h: 22 }]),
];

// DM: Shermie Carnival DM (QCFx2+K) — multi-hit spinning super
export const DM_SHERMIE_CARNIVAL_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -110, w: 62, h: 52 }]),
  F([{ ox: 42, oy: -115, w: 72, h: 58 }]),
  F([{ ox: 45, oy: -120, w: 82, h: 62 }]),
  F([{ ox: 48, oy: -122, w: 88, h: 65 }]),
  F([{ ox: 48, oy: -125, w: 92, h: 68 }]),
  F([{ ox: 48, oy: -125, w: 95, h: 68 }]),
  F([{ ox: 48, oy: -125, w: 95, h: 68 }]),
  F([{ ox: 48, oy: -125, w: 95, h: 68 }]),
  F([{ ox: 45, oy: -122, w: 88, h: 65 }]),
  F([{ ox: 42, oy: -118, w: 80, h: 60 }]),
  F([{ ox: 40, oy: -115, w: 72, h: 55 }]),
  F([{ ox: 38, oy: -112, w: 65, h: 50 }]),
  F([{ ox: 36, oy: -110, w: 58, h: 45 }]),
  F([{ ox: 35, oy: -108, w: 52, h: 42 }]),
];

// SDM: Shermie Carnival SDM — bigger, more devastating
export const SDM_SHERMIE_CARNIVAL_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -115, w: 68, h: 55 }]),
  F([{ ox: 42, oy: -120, w: 78, h: 62 }]),
  F([{ ox: 45, oy: -125, w: 88, h: 68 }]),
  F([{ ox: 48, oy: -128, w: 95, h: 72 }]),
  F([{ ox: 50, oy: -130, w: 100, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 50, oy: -132, w: 105, h: 75 }]),
  F([{ ox: 48, oy: -130, w: 98, h: 72 }]),
  F([{ ox: 45, oy: -128, w: 88, h: 68 }]),
  F([{ ox: 42, oy: -125, w: 78, h: 62 }]),
  F([{ ox: 40, oy: -122, w: 72, h: 58 }]),
  F([{ ox: 38, oy: -120, w: 65, h: 52 }]),
  F([{ ox: 36, oy: -118, w: 58, h: 48 }]),
  F([{ ox: 35, oy: -115, w: 52, h: 42 }]),
  F([{ ox: 34, oy: -112, w: 48, h: 38 }]),
];

// ===== 李香绯 (Li Xiangfei) =====

// Kyu Ho (→+A) — upper strike command normal
export const XIANGFEI_KYU_HO_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -95, w: 55, h: 35 }]),
  F([{ ox: 48, oy: -92, w: 62, h: 38 }]),
  F([{ ox: 48, oy: -92, w: 62, h: 38 }]),
  F([{ ox: 45, oy: -95, w: 55, h: 35 }]),
];

// Kaku Da (→+B) — low kick command normal
export const XIANGFEI_KAKU_DA_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -18, w: 60, h: 25 }]),
  F([{ ox: 52, oy: -15, w: 68, h: 28 }]),
  F([{ ox: 52, oy: -15, w: 68, h: 28 }]),
  F([{ ox: 48, oy: -18, w: 62, h: 25 }]),
];

// Nanpa (QCF+A) — weak rushing punch
export const XIANGFEI_NANPA_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -88, w: 40, h: 35 }]),
  F([{ ox: 42, oy: -85, w: 55, h: 40 }]),
  F([{ ox: 52, oy: -82, w: 65, h: 42 }]),
  F([{ ox: 55, oy: -80, w: 68, h: 45 }]),
  F([{ ox: 52, oy: -82, w: 62, h: 42 }]),
];

// Nanpa C (QCF+C) — strong rushing punch
export const XIANGFEI_NANPA_C_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -88, w: 42, h: 38 }]),
  F([{ ox: 42, oy: -85, w: 58, h: 42 }]),
  F([{ ox: 52, oy: -82, w: 68, h: 48 }]),
  F([{ ox: 58, oy: -80, w: 75, h: 50 }]),
  F([{ ox: 60, oy: -78, w: 78, h: 52 }]),
  F([{ ox: 60, oy: -78, w: 78, h: 52 }]),
  F([{ ox: 58, oy: -80, w: 72, h: 48 }]),
  F([{ ox: 52, oy: -82, w: 65, h: 45 }]),
];

// Tenpatsu (QCB+P) — upper strike, knockdown
export const XIANGFEI_TENPATSU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -90, w: 45, h: 40 }]),
  F([{ ox: 42, oy: -100, w: 55, h: 45 }]),
  F([{ ox: 48, oy: -110, w: 60, h: 50 }]),
  F([{ ox: 45, oy: -120, w: 58, h: 48 }]),
  F([{ ox: 42, oy: -115, w: 52, h: 45 }]),
];

// Maho Hisha (HCF+K) — low sweeping kick
export const XIANGFEI_MAHO_HISHA_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -22, w: 50, h: 28 }]),
  F([{ ox: 50, oy: -18, w: 62, h: 32 }]),
  F([{ ox: 58, oy: -15, w: 72, h: 35 }]),
  F([{ ox: 62, oy: -14, w: 75, h: 36 }]),
  F([{ ox: 60, oy: -15, w: 70, h: 34 }]),
  F([{ ox: 55, oy: -18, w: 62, h: 30 }]),
];

// DM: Chou Ka Ringa (QCBx2+P) — powerful rushing multi-hit DM
export const DM_CHO_KA_RINGA_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -90, w: 50, h: 42 }]),
  F([{ ox: 45, oy: -88, w: 62, h: 48 }]),
  F([{ ox: 55, oy: -85, w: 75, h: 52 }]),
  F([{ ox: 62, oy: -82, w: 82, h: 55 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 65, oy: -80, w: 88, h: 58 }]),
  F([{ ox: 60, oy: -85, w: 80, h: 52 }]),
  F([{ ox: 52, oy: -90, w: 68, h: 45 }]),
  F([{ ox: 45, oy: -95, w: 55, h: 38 }]),
];

// SDM: Chou Ka Ringa SDM — bigger, more devastating
export const SDM_CHO_KA_RINGA_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -92, w: 55, h: 45 }]),
  F([{ ox: 45, oy: -90, w: 68, h: 52 }]),
  F([{ ox: 55, oy: -88, w: 82, h: 58 }]),
  F([{ ox: 62, oy: -85, w: 92, h: 62 }]),
  F([{ ox: 68, oy: -82, w: 100, h: 68 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 70, oy: -80, w: 105, h: 72 }]),
  F([{ ox: 68, oy: -82, w: 98, h: 68 }]),
  F([{ ox: 62, oy: -85, w: 88, h: 62 }]),
  F([{ ox: 55, oy: -88, w: 78, h: 55 }]),
  F([{ ox: 48, oy: -92, w: 65, h: 48 }]),
  F([{ ox: 42, oy: -95, w: 55, h: 42 }]),
];

// ===== 山崎龙二 (Yamazaki) ===== APPROX based on KOF2002UM
// Snake Arm (A) — extending arm strike, fast
export const YAMAZAKI_SNAKE_ARM_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 52, oy: -55, w: 58, h: 36 }]),
  F([{ ox: 62, oy: -52, w: 68, h: 40 }]),
  F([{ ox: 68, oy: -50, w: 72, h: 42 }]),
  F([{ ox: 68, oy: -50, w: 72, h: 42 }]),
  F([{ ox: 68, oy: -50, w: 72, h: 42 }]),
  F([{ ox: 62, oy: -52, w: 65, h: 38 }]),
  F([{ ox: 52, oy: -55, w: 55, h: 34 }]),
];

// Snake Arm (C) — extending arm strike, strong
export const YAMAZAKI_SNAKE_ARM_C_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -58, w: 52, h: 34 }]),
  F([{ ox: 55, oy: -55, w: 65, h: 38 }]),
  F([{ ox: 68, oy: -50, w: 78, h: 44 }]),
  F([{ ox: 78, oy: -48, w: 88, h: 48 }]),
  F([{ ox: 82, oy: -46, w: 92, h: 50 }]),
  F([{ ox: 82, oy: -46, w: 92, h: 50 }]),
  F([{ ox: 82, oy: -46, w: 92, h: 50 }]),
  F([{ ox: 82, oy: -46, w: 92, h: 50 }]),
  F([{ ox: 78, oy: -48, w: 85, h: 48 }]),
  F([{ ox: 68, oy: -52, w: 72, h: 42 }]),
  F([{ ox: 55, oy: -55, w: 58, h: 36 }]),
];

// Sandstorm (QCB+P) — overhead slam, knockdown
export const YAMAZAKI_SANDSTORM_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -110, w: 55, h: 42 }]),
  F([{ ox: 48, oy: -105, w: 62, h: 48 }]),
  F([{ ox: 55, oy: -100, w: 70, h: 52 }]),
  F([{ ox: 58, oy: -98, w: 75, h: 55 }]),
  F([{ ox: 58, oy: -98, w: 75, h: 55 }]),
  F([{ ox: 55, oy: -100, w: 70, h: 52 }]),
  F([{ ox: 48, oy: -105, w: 62, h: 48 }]),
];

// Bai Ga Se (HCF+K) — low sweep kick
export const YAMAZAKI_BAI_GA_SE_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -18, w: 55, h: 24 }]),
  F([{ ox: 55, oy: -15, w: 62, h: 26 }]),
  F([{ ox: 62, oy: -12, w: 70, h: 28 }]),
  F([{ ox: 68, oy: -10, w: 78, h: 30 }]),
  F([{ ox: 68, oy: -10, w: 78, h: 30 }]),
  F([{ ox: 68, oy: -10, w: 78, h: 30 }]),
  F([{ ox: 62, oy: -12, w: 72, h: 28 }]),
  F([{ ox: 55, oy: -15, w: 65, h: 26 }]),
];

// DM: Guillotine — multi-hit rushing super
export const DM_GUILLOTINE_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -58, w: 55, h: 40 }]),
  F([{ ox: 45, oy: -55, w: 65, h: 45 }]),
  F([{ ox: 52, oy: -50, w: 75, h: 50 }]),
  F([{ ox: 58, oy: -48, w: 82, h: 55 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 58, oy: -48, w: 85, h: 58 }]),
  F([{ ox: 55, oy: -50, w: 80, h: 55 }]),
  F([{ ox: 50, oy: -52, w: 72, h: 50 }]),
];

// SDM: Guillotine SDM — bigger, more devastating
export const SDM_GUILLOTINE_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -62, w: 60, h: 42 }]),
  F([{ ox: 48, oy: -58, w: 72, h: 48 }]),
  F([{ ox: 55, oy: -52, w: 82, h: 55 }]),
  F([{ ox: 62, oy: -48, w: 92, h: 62 }]),
  F([{ ox: 65, oy: -45, w: 98, h: 68 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 65, oy: -45, w: 100, h: 70 }]),
  F([{ ox: 62, oy: -48, w: 95, h: 65 }]),
  F([{ ox: 55, oy: -52, w: 82, h: 58 }]),
  F([{ ox: 48, oy: -55, w: 72, h: 50 }]),
  F([{ ox: 42, oy: -58, w: 62, h: 45 }]),
];

// ===== 藤堂香澄 (Kasumi Todoh) ===== APPROX based on KOF2002UM
// Koou Ken (A) — weak projectile
export const KASUMI_KOOU_KEN_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -88, w: 55, h: 35 }]),
  F([{ ox: 52, oy: -92, w: 62, h: 40 }]),
  F([{ ox: 58, oy: -98, w: 70, h: 42 }]),
  F([{ ox: 58, oy: -100, w: 70, h: 42 }]),
  F([{ ox: 55, oy: -98, w: 65, h: 40 }]),
  F([{ ox: 52, oy: -95, w: 58, h: 38 }]),
];

// Koou Ken (C) — strong projectile
export const KASUMI_KOOU_KEN_C_FRAMES: AttackFrame[] = [
  F([{ ox: 46, oy: -85, w: 58, h: 38 }]),
  F([{ ox: 50, oy: -90, w: 68, h: 42 }]),
  F([{ ox: 55, oy: -95, w: 78, h: 48 }]),
  F([{ ox: 60, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 60, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 60, oy: -100, w: 82, h: 50 }]),
  F([{ ox: 58, oy: -98, w: 78, h: 48 }]),
  F([{ ox: 55, oy: -95, w: 72, h: 45 }]),
];

// Kasane Ate (QCB+P) — palm strike
export const KASUMI_KASANE_ATE_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -100, w: 60, h: 42 }]),
  F([{ ox: 48, oy: -105, w: 68, h: 48 }]),
  F([{ ox: 55, oy: -108, w: 75, h: 52 }]),
  F([{ ox: 55, oy: -110, w: 78, h: 52 }]),
  F([{ ox: 52, oy: -108, w: 72, h: 48 }]),
];

// Mukigenzan (DP+P) — low sweep
export const KASUMI_MUKIGENZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -18, w: 60, h: 22 }]),
  F([{ ox: 52, oy: -20, w: 68, h: 26 }]),
  F([{ ox: 58, oy: -22, w: 75, h: 28 }]),
  F([{ ox: 58, oy: -22, w: 78, h: 28 }]),
  F([{ ox: 55, oy: -20, w: 72, h: 26 }]),
  F([{ ox: 50, oy: -18, w: 65, h: 24 }]),
];

// DM: Chou Mukigenzan (QCBx2+P) — powerful multi-hit low DM
export const DM_CHO_MUKIGENZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -105, w: 62, h: 50 }]),
  F([{ ox: 42, oy: -110, w: 72, h: 55 }]),
  F([{ ox: 48, oy: -112, w: 82, h: 60 }]),
  F([{ ox: 52, oy: -115, w: 88, h: 62 }]),
  F([{ ox: 52, oy: -118, w: 92, h: 65 }]),
  F([{ ox: 52, oy: -118, w: 92, h: 65 }]),
  F([{ ox: 52, oy: -120, w: 92, h: 65 }]),
  F([{ ox: 52, oy: -120, w: 92, h: 65 }]),
  F([{ ox: 50, oy: -118, w: 88, h: 62 }]),
  F([{ ox: 48, oy: -115, w: 82, h: 58 }]),
  F([{ ox: 45, oy: -112, w: 75, h: 52 }]),
  F([{ ox: 42, oy: -110, w: 68, h: 48 }]),
  F([{ ox: 40, oy: -108, w: 62, h: 45 }]),
  F([{ ox: 38, oy: -106, w: 55, h: 42 }]),
];

// SDM: Chou Mukigenzan SDM — bigger, more devastating
export const SDM_CHO_MUKIGENZAN_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -110, w: 65, h: 52 }]),
  F([{ ox: 42, oy: -115, w: 78, h: 58 }]),
  F([{ ox: 48, oy: -120, w: 88, h: 65 }]),
  F([{ ox: 52, oy: -125, w: 98, h: 72 }]),
  F([{ ox: 55, oy: -128, w: 105, h: 75 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -130, w: 108, h: 78 }]),
  F([{ ox: 52, oy: -128, w: 100, h: 72 }]),
  F([{ ox: 48, oy: -125, w: 88, h: 65 }]),
  F([{ ox: 45, oy: -120, w: 78, h: 58 }]),
];

// ===== 布鲁·玛丽 (Blue Mary) ===== APPROX based on KOF2002UM
// Straight Slicer (A) — rushing kick, fast
export const MARY_STRAIGHT_SLICER_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -55, w: 52, h: 35 }]),
  F([{ ox: 50, oy: -52, w: 60, h: 38 }]),
  F([{ ox: 58, oy: -48, w: 68, h: 42 }]),
  F([{ ox: 58, oy: -48, w: 68, h: 42 }]),
  F([{ ox: 55, oy: -50, w: 62, h: 38 }]),
  F([{ ox: 50, oy: -52, w: 55, h: 35 }]),
];

// Straight Slicer (C) — rushing kick, strong
export const MARY_STRAIGHT_SLICER_C_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -55, w: 55, h: 38 }]),
  F([{ ox: 52, oy: -50, w: 65, h: 42 }]),
  F([{ ox: 60, oy: -45, w: 75, h: 48 }]),
  F([{ ox: 65, oy: -42, w: 80, h: 50 }]),
  F([{ ox: 65, oy: -42, w: 80, h: 50 }]),
  F([{ ox: 65, oy: -42, w: 80, h: 50 }]),
  F([{ ox: 62, oy: -45, w: 75, h: 48 }]),
  F([{ ox: 55, oy: -50, w: 65, h: 42 }]),
];

// Backdrop Real (QCB+P) — grab slam
export const MARY_BACKDROP_REAL_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -110, w: 55, h: 50 }]),
  F([{ ox: 42, oy: -105, w: 62, h: 55 }]),
  F([{ ox: 48, oy: -100, w: 68, h: 58 }]),
  F([{ ox: 48, oy: -100, w: 68, h: 58 }]),
  F([{ ox: 45, oy: -105, w: 62, h: 55 }]),
  F([{ ox: 42, oy: -110, w: 55, h: 50 }]),
];

// Mary Spider (DP+K) — low spinning sweep
export const MARY_SPIDER_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -22, w: 55, h: 25 }]),
  F([{ ox: 48, oy: -18, w: 62, h: 28 }]),
  F([{ ox: 55, oy: -15, w: 70, h: 30 }]),
  F([{ ox: 58, oy: -12, w: 75, h: 32 }]),
  F([{ ox: 58, oy: -12, w: 75, h: 32 }]),
  F([{ ox: 55, oy: -15, w: 70, h: 30 }]),
  F([{ ox: 48, oy: -18, w: 62, h: 28 }]),
];

// DM: Mary Typhoon (QCFx2+K) — multi-hit spinning kick super
export const DM_MARY_TYPHOON_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -80, w: 62, h: 50 }]),
  F([{ ox: 42, oy: -78, w: 72, h: 55 }]),
  F([{ ox: 48, oy: -75, w: 82, h: 60 }]),
  F([{ ox: 52, oy: -72, w: 88, h: 65 }]),
  F([{ ox: 52, oy: -75, w: 92, h: 68 }]),
  F([{ ox: 52, oy: -78, w: 92, h: 68 }]),
  F([{ ox: 52, oy: -80, w: 92, h: 68 }]),
  F([{ ox: 52, oy: -82, w: 88, h: 65 }]),
  F([{ ox: 50, oy: -85, w: 82, h: 62 }]),
  F([{ ox: 48, oy: -88, w: 75, h: 58 }]),
  F([{ ox: 45, oy: -90, w: 68, h: 55 }]),
  F([{ ox: 42, oy: -92, w: 62, h: 52 }]),
  F([{ ox: 40, oy: -95, w: 55, h: 48 }]),
  F([{ ox: 38, oy: -98, w: 50, h: 45 }]),
];

// SDM: Mary Typhoon SDM — bigger, more devastating
export const SDM_MARY_TYPHOON_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -85, w: 68, h: 55 }]),
  F([{ ox: 42, oy: -82, w: 78, h: 60 }]),
  F([{ ox: 48, oy: -78, w: 88, h: 68 }]),
  F([{ ox: 52, oy: -75, w: 98, h: 72 }]),
  F([{ ox: 55, oy: -72, w: 105, h: 75 }]),
  F([{ ox: 55, oy: -75, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -78, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -80, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -82, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -85, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -88, w: 108, h: 78 }]),
  F([{ ox: 55, oy: -90, w: 105, h: 75 }]),
  F([{ ox: 52, oy: -92, w: 98, h: 72 }]),
  F([{ ox: 48, oy: -95, w: 88, h: 68 }]),
  F([{ ox: 45, oy: -98, w: 78, h: 62 }]),
  F([{ ox: 42, oy: -100, w: 68, h: 58 }]),
  F([{ ox: 40, oy: -102, w: 60, h: 52 }]),
  F([{ ox: 38, oy: -105, w: 55, h: 48 }]),
  F([{ ox: 36, oy: -108, w: 50, h: 45 }]),
  F([{ ox: 35, oy: -110, w: 45, h: 42 }]),
];
