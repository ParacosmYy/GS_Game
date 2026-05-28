/**
 * Shermie frame data — extracted from frameDataAndyBillyChangChoiMatureYamazaki.ts
 * Dream Cancel Wiki KOF2002UM 校准数据
 */
export const SHERMIE_FRAME_DATA = {
  // ── 夏尔美命令通常技 (Shermie Command Normals) ──
  // Shermie Stand ->+A (upper strike)
  SHERMIE_STAND: {
    startup: 14,
    active: 4,
    recovery: 20,
    damage: 42,
    hitstun: 18,
    blockstun: 15,
    pushback: 3,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Shermie Clash ->+B (low kick)
  SHERMIE_CLASH: {
    startup: 8,
    active: 4,
    recovery: 22,
    damage: 38,
    hitstun: 16,
    blockstun: 14,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // ── 夏尔美必杀技 (Shermie) ── KOF2002UM 校准数据
  // Shermie Shoot qcf+A (weak spinning kick)
  SHERMIE_SHOOT: {
    startup: 10,
    active: 6,
    recovery: 24,
    damage: 70,
    hitstun: 20,
    blockstun: 17,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Shermie Shoot qcf+C (strong spinning kick, KD)
  SHERMIE_SHOOT_C: {
    startup: 14,
    active: 10,
    recovery: 28,
    damage: 90,
    hitstun: 24,
    blockstun: 20,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 12,
  },
  // Shermie Carnival qcb+A/C (multi-hit spinning attack)
  SHERMIE_CARNIVAL: {
    startup: 12,
    active: 5,
    recovery: 26,
    damage: 75,
    hitstun: 22,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // Axle Spin Kick qcb+B/D (low sweeping spin)
  SHERMIE_AXLE_SPIN: {
    startup: 12,
    active: 6,
    recovery: 28,
    damage: 68,
    hitstun: 20,
    blockstun: 16,
    pushback: 5,
    hitLevel: "LOW" as const,
    knockdown: true,
    chipDamage: 8,
  },
  // Shermie Spiral hcb,f+A (near, command grab)
  SHERMIE_SPIRAL: {
    startup: 5,
    active: 3,
    recovery: 30,
    damage: 80,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Shermie Spiral hcb,f+C (near, strong command grab)
  SHERMIE_SPIRAL_C: {
    startup: 6,
    active: 3,
    recovery: 32,
    damage: 95,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Shermie Whip qcf+B (whip kick)
  SHERMIE_WHIP: {
    startup: 8,
    active: 6,
    recovery: 24,
    damage: 70,
    hitstun: 16,
    blockstun: 14,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Shermie Whip qcf+D (strong whip kick, KD)
  SHERMIE_WHIP_C: {
    startup: 10,
    active: 8,
    recovery: 28,
    damage: 85,
    hitstun: 20,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Shermie Suplex hcb+B/D (near, command grab)
  SHERMIE_SUPLEX: {
    startup: 4,
    active: 3,
    recovery: 28,
    damage: 75,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // ── 夏尔美DM/SDM (Shermie) ── KOF2002UM 校准数据
  // Shermie Carnival DM qcf,qcf+K
  DM_SHERMIE_CARNIVAL: {
    startup: 8,
    active: 16,
    recovery: 38,
    damage: 200,
    hitstun: 0,
    blockstun: 21,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 20,
  },
  // Shermie Carnival SDM MAX qcf,qcf+BD
  SDM_SHERMIE_CARNIVAL: {
    startup: 6,
    active: 22,
    recovery: 40,
    damage: 310,
    hitstun: 0,
    blockstun: 21,
    pushback: 14,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 30,
  },
  // Shermie Flash DM hcb,f+P (near, command grab DM)
  DM_SHERMIE_FLASH: {
    startup: 5,
    active: 4,
    recovery: 40,
    damage: 190,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Shermie Flash SDM MAX hcb,f+AC (near, command grab SDM)
  SDM_SHERMIE_FLASH: {
    startup: 4,
    active: 6,
    recovery: 38,
    damage: 260,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
} as const;
