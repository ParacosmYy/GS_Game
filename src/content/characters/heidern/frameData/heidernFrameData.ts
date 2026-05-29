/**
 * Heidern frame data — KOF2002 calibration data
 *
 * Heidern is a charge character with strong command grabs and
 * anti-air tools. His specials use charge inputs (Cross Cutter, Moon Slasher)
 * and motion inputs (Neck Roller, Stormbringer, Killing Bringer, Leiden Reitter).
 */
export const HEIDERN_FRAME_DATA = {
  // ── Heidern命令通常技 ──
  // Sliding ↘+B (low)
  HEIDERN_SLIDING: {
    startup: 10,
    active: 5,
    recovery: 22,
    damage: 45,
    hitstun: 19,
    blockstun: 16,
    pushback: 3,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // Command A →+A (overhead/command normal)
  HEIDERN_COMMAND_A: {
    startup: 12,
    active: 3,
    recovery: 18,
    damage: 50,
    hitstun: 18,
    blockstun: 15,
    pushback: 3,
    hitLevel: "HIGH" as const,
    knockdown: false,
  },
  // ── Heidern必杀技 ── KOF2002 calibration data
  // Cross Cutter charge b,f+A (弱飛行道具)
  HEIDERN_CROSS_CUTTER: {
    startup: 14,
    active: 20,
    recovery: 30,
    damage: 70,
    hitstun: 26,
    blockstun: 24,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Cross Cutter charge b,f+C (強飛行道具)
  HEIDERN_CROSS_CUTTER_C: {
    startup: 16,
    active: 24,
    recovery: 28,
    damage: 100,
    hitstun: 28,
    blockstun: 26,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // Moon Slasher charge d,u+A (弱対空斬撃)
  HEIDERN_MOON_SLASHER: {
    startup: 6,
    active: 6,
    recovery: 24,
    damage: 80,
    hitstun: 22,
    blockstun: 18,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // Moon Slasher charge d,u+C (強対空斬撃)
  HEIDERN_MOON_SLASHER_C: {
    startup: 6,
    active: 12,
    recovery: 26,
    damage: 104,
    hitstun: 22,
    blockstun: 20,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 12,
  },
  // Neck Roller qcb+A (弱首绞り投げ)
  HEIDERN_NECK_ROLLER: {
    startup: 8,
    active: 4,
    recovery: 28,
    damage: 85,
    hitstun: 24,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Neck Roller qcb+C (強首绞り投げ)
  HEIDERN_NECK_ROLLER_C: {
    startup: 8,
    active: 4,
    recovery: 28,
    damage: 110,
    hitstun: 24,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Stormbringer hcf+A (弱コマンド投げ)
  HEIDERN_STORMBRINGER: {
    startup: 6,
    active: 3,
    recovery: 30,
    damage: 90,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Stormbringer hcf+C (強コマンド投げ)
  HEIDERN_STORMBRINGER_C: {
    startup: 6,
    active: 3,
    recovery: 30,
    damage: 135,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Killing Bringer hcf+B (当て身投げ)
  HEIDERN_KILLING_BRINGER: {
    startup: 4,
    active: 20,
    recovery: 18,
    damage: 80,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Killing Bringer hcf+D (強当て身投げ)
  HEIDERN_KILLING_BRINGER_D: {
    startup: 4,
    active: 24,
    recovery: 18,
    damage: 96,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Leiden Reitter qcb+B (弱回転踢り)
  HEIDERN_LEIDEN_REITTER: {
    startup: 8,
    active: 8,
    recovery: 22,
    damage: 75,
    hitstun: 22,
    blockstun: 18,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Leiden Reitter qcb+D (強回転踢り)
  HEIDERN_LEIDEN_REITTER_D: {
    startup: 8,
    active: 10,
    recovery: 24,
    damage: 98,
    hitstun: 24,
    blockstun: 20,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // ── Heidern DM ──
  // Critical Driver DM hcb,hcf+P (コマンド投げ)
  DM_HEIDERN_CRITICAL_DRIVER: {
    startup: 7,
    active: 6,
    recovery: 40,
    damage: 200,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Heidern End DM qcf,qcf+P (突進軍刀連斬)
  DM_HEIDERN_END: {
    startup: 8,
    active: 12,
    recovery: 38,
    damage: 180,
    hitstun: 0,
    blockstun: 21,
    pushback: 10,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 18,
  },
  // ── Heidern SDM ──
  // Critical Driver SDM MAX hcb,hcf+AC
  SDM_HEIDERN_CRITICAL_DRIVER: {
    startup: 7,
    active: 8,
    recovery: 38,
    damage: 300,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Heidern End SDM MAX qcf,qcf+AC
  SDM_HEIDERN_END: {
    startup: 7,
    active: 16,
    recovery: 36,
    damage: 240,
    hitstun: 0,
    blockstun: 21,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 28,
  },
  // ── Heidern HSDM ──
  // Heidern Execution MAX qcb,qcb+BD
  HSDM_HEIDERN_EXECUTION: {
    startup: 6,
    active: 10,
    recovery: 42,
    damage: 350,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
} as const;
