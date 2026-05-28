/**
 * Character special move attack frames (split from attackFramesSpecials.ts)
 */
import type { AttackFrame } from "../types.js";

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

