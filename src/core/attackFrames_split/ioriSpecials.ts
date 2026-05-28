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

