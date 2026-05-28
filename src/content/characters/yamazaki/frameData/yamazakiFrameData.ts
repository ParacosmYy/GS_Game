/**
 * Yamazaki frame data — KOF2002UM 校准数据
 *
 * Ryuji Yamazaki (山崎竜二) — Orochi bloodline, one-handed snake-arm fighter.
 * Specialties: long-range snake arm pokes, counter-based neutral, explosive DMs.
 *
 * 数据源: Dream Cancel Wiki KOF2002UM 校准数据
 */
export const YAMAZAKI_FRAME_DATA = {
  // ── 山崎竜二 专属必杀技 (Yamazaki) ── Dream Cancel Wiki KOF2002UM 校准数据

  // 命令通常技 Sashi ->+A (上段)
  YAMAZAKI_SASHI: {
    startup: 7,
    active: 4,
    recovery: 14,
    damage: 42,
    hitstun: 14,
    blockstun: 12,
    pushback: 3,
    hitLevel: "HIGH" as const,
    knockdown: false,
  },
  // 命令通常技 Bokkai ->+B (下段)
  YAMAZAKI_BOKKAI: {
    startup: 8,
    active: 4,
    recovery: 16,
    damage: 38,
    hitstun: 14,
    blockstun: 12,
    pushback: 3,
    hitLevel: "LOW" as const,
    knockdown: false,
  },

  // Snake Arm (蛇使い・弐) qcf+A — 弱版, 远距离蛇臂刺击
  YAMAZAKI_SNAKE_ARM: {
    startup: 10,
    active: 6,
    recovery: 20,
    damage: 65,
    hitstun: 18,
    blockstun: 16,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 7,
  },
  // Snake Arm (蛇使い・弐) qcf+C — 強版, 更远距离, 更高伤害
  YAMAZAKI_SNAKE_ARM_C: {
    startup: 14,
    active: 8,
    recovery: 24,
    damage: 90,
    hitstun: 20,
    blockstun: 18,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // Sandstorm / Hebi Tsukai (爆弾拳/蛇使い) qcb+P — 中段爆发
  YAMAZAKI_SANDSTORM: {
    startup: 12,
    active: 8,
    recovery: 26,
    damage: 80,
    hitstun: 20,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // Bai Gaeshi (倍返し) hcf+K — 下段扫腿
  YAMAZAKI_BAI_GA_SE: {
    startup: 10,
    active: 6,
    recovery: 22,
    damage: 70,
    hitstun: 18,
    blockstun: 16,
    pushback: 5,
    hitLevel: "LOW" as const,
    knockdown: true,
    chipDamage: 8,
  },
  // Snake Arm follow-up variant (qcf after snake arm)
  YAMAZAKI_SNAKE_ARM_QCF: {
    startup: 8,
    active: 6,
    recovery: 18,
    damage: 60,
    hitstun: 16,
    blockstun: 14,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 6,
  },
  // Drill (ドリル) — multi-hit rush special
  YAMAZAKI_DRILL: {
    startup: 6,
    active: 14,
    recovery: 30,
    damage: 120,
    hitstun: 22,
    blockstun: 20,
    pushback: 8,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 14,
  },

  // ── 山崎DM (Yamazaki) ── Dream Cancel Wiki KOF2002UM 校准数据

  // Guillotine (ギロチン) DM
  DM_GUILLOTINE: {
    startup: 10,
    active: 12,
    recovery: 42,
    damage: 210,
    hitstun: 0,
    blockstun: 21,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 22,
  },
  // Guillotine SDM (ギロチンSDM)
  SDM_GUILLOTINE: {
    startup: 8,
    active: 18,
    recovery: 40,
    damage: 320,
    hitstun: 0,
    blockstun: 21,
    pushback: 14,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 32,
  },
  // Drill HSDM (ドリル HSDM) — 隠し超必殺技
  HSDM_DRILL: {
    startup: 5,
    active: 22,
    recovery: 38,
    damage: 350,
    hitstun: 0,
    blockstun: 24,
    pushback: 16,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 38,
  },
} as const;
