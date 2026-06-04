/**
 * Andy frame data — KOF2002 校准数据
 *
 * Andy Bogard: 不知火流忍者格斗术
 * 必杀技:
 *   飛翔拳 (Hishou Ken, QCF+P, projectile)
 *   昇龍弾 (Shouryuu Dan, DP+P, uppercut)
 *   斬影流星拳 (Zan'ei Ryuusei Ken, HCF+K, dash punch)
 *   激飛翔拳 (Geki Hishou Ken, QCB+K, air dive)
 * DM:
 *   超裂破弾 (Cho Reppa Dan, QCFx2+P, multi-hit rising uppercut)
 */
export const ANDY_FRAME_DATA = {
  // ── 安迪命令通常技 (Andy Command Normals) ──
  // Uwa Agito ->+A (overhead)
  ANDY_UWA_AGITO: {
    startup: 12,
    active: 4,
    recovery: 18,
    damage: 40,
    hitstun: 16,
    blockstun: 14,
    pushback: 3,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Gedan Agito ->+B (low)
  ANDY_GEDAN_AGITO: {
    startup: 8,
    active: 4,
    recovery: 20,
    damage: 36,
    hitstun: 14,
    blockstun: 12,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // ── 安迪必杀技 (Andy) ── KOF2002 校准数据
  // Hishou Ken qcf+A (weak projectile)
  ANDY_HISHOU_KEN: {
    startup: 14,
    active: 24,
    recovery: 18,
    damage: 60,
    hitstun: 18,
    blockstun: 16,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 6,
  },
  // Hishou Ken qcf+C (strong projectile)
  ANDY_HISHOU_KEN_C: {
    startup: 18,
    active: 32,
    recovery: 22,
    damage: 80,
    hitstun: 22,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // Shouryuu Dan dp+A (weak uppercut, 1-hit)
  ANDY_SHOURYUU_DAN: {
    startup: 5,
    active: 6,
    recovery: 24,
    damage: 70,
    hitstun: 20,
    blockstun: 18,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 8,
  },
  // Shouryuu Dan dp+C (strong uppercut, 2-hit)
  ANDY_SHOURYUU_DAN_C: {
    startup: 6,
    active: 10,
    recovery: 28,
    damage: 95,
    hitstun: 24,
    blockstun: 20,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 12,
  },
  // Zan'ei Ryuusei Ken hcf+B (short dash punch)
  ANDY_ZANEI_RYUSEI_KEN: {
    startup: 8,
    active: 6,
    recovery: 22,
    damage: 72,
    hitstun: 18,
    blockstun: 16,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Zan'ei Ryuusei Ken hcf+D (long dash punch)
  ANDY_ZANEI_RYUSEI_KEN_D: {
    startup: 10,
    active: 8,
    recovery: 26,
    damage: 88,
    hitstun: 22,
    blockstun: 18,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // Geki Hishou Ken qcb+K (air dive)
  ANDY_GEKI_HISHOU_KEN: {
    startup: 8,
    active: 6,
    recovery: 20,
    damage: 65,
    hitstun: 18,
    blockstun: 14,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 6,
  },
  // ── 安迪DM (Andy) ── KOF2002 校准数据
  // Cho Reppa Dan qcf,qcf+P (multi-hit rising uppercut)
  DM_CHO_REPPA_DAN: {
    startup: 6,
    active: 20,
    recovery: 36,
    damage: 200,
    hitstun: 0,
    blockstun: 22,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 18,
  },
} as const;
