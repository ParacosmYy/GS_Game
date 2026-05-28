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

export const HSDM_OROCHINAGI_FRAMES: AttackFrame[] = [
  F([{ ox: 34, oy: -74, w: 72, h: 58 }]),
  F([{ ox: 42, oy: -70, w: 82, h: 64 }]),
  F([{ ox: 48, oy: -66, w: 95, h: 70 }]),
  F([{ ox: 50, oy: -64, w: 100, h: 72 }]),
  F([{ ox: 50, oy: -63, w: 100, h: 72 }]),
  F([{ ox: 50, oy: -63, w: 100, h: 72 }]),
  F([{ ox: 48, oy: -65, w: 94, h: 68 }]),
  F([{ ox: 46, oy: -67, w: 88, h: 64 }]),
  F([{ ox: 44, oy: -69, w: 82, h: 60 }]),
  F([{ ox: 42, oy: -71, w: 76, h: 56 }]),
  ...Array.from({ length: 20 }, (_, i) =>
    F([{ ox: 38 - i * 0.4, oy: -73 + i * 0.6, w: 70 - i * 2, h: 54 - i * 1.2 }])
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

export const HSDM_YAOTOME_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -68, w: 66, h: 56 }]),
  F([{ ox: 38, oy: -64, w: 78, h: 62 }]),
  F([{ ox: 44, oy: -60, w: 90, h: 68 }]),
  F([{ ox: 46, oy: -58, w: 95, h: 70 }]),
  F([{ ox: 46, oy: -56, w: 95, h: 70 }]),
  F([{ ox: 44, oy: -58, w: 90, h: 66 }]),
  F([{ ox: 42, oy: -60, w: 84, h: 62 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 38, oy: -64, w: 72, h: 55 }]),
  F([{ ox: 36, oy: -66, w: 66, h: 52 }]),
  ...Array.from({ length: 12 }, (_, i) =>
    F([{ ox: 34 - i * 0.3, oy: -66 + i * 0.4, w: 62 - i * 1.5, h: 50 - i }])
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

