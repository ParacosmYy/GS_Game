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
