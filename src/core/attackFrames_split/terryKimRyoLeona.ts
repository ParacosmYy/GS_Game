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

