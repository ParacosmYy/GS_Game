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

