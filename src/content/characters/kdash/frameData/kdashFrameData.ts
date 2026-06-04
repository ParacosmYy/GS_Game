/**
 * K' frame data — KOF2002UM calibrated data
 */
export const KDASH_FRAME_DATA = {
  // ── K'命令通常技 (K' Command Normals) ──
  // One Inch ->+A (overhead punch)
  KDASH_ONE_INCH: {
    startup: 10,
    active: 4,
    recovery: 20,
    damage: 40,
    hitstun: 17,
    blockstun: 14,
    pushback: 3,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Trigger Shot ->+D (low kick)
  KDASH_TRIGGER: {
    startup: 9,
    active: 4,
    recovery: 22,
    damage: 36,
    hitstun: 15,
    blockstun: 13,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // ── K'必杀技 (K' Specials) ── KOF2002UM 校准数据
  // Eins Trigger qcf+A (weak fire projectile)
  KDASH_EINS: {
    startup: 12,
    active: 28,
    recovery: 18,
    damage: 60,
    hitstun: 20,
    blockstun: 17,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 6,
    isProjectile: true,
  },
  // Eins Trigger qcf+C (strong fire projectile, faster)
  KDASH_EINS_C: {
    startup: 10,
    active: 36,
    recovery: 20,
    damage: 80,
    hitstun: 24,
    blockstun: 20,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
    isProjectile: true,
  },
  // Crow Bites dp+A (weak upper)
  KDASH_CROW: {
    startup: 5,
    active: 6,
    recovery: 24,
    damage: 70,
    hitstun: 20,
    blockstun: 16,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Crow Bites dp+C (strong upper, invincible startup)
  KDASH_CROW_C: {
    startup: 4,
    active: 10,
    recovery: 28,
    damage: 90,
    hitstun: 26,
    blockstun: 22,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 12,
    invincibleStartup: 4,
  },
  // Minute Spike qcb+K (overhead kick)
  KDASH_MINUTE: {
    startup: 8,
    active: 5,
    recovery: 22,
    damage: 65,
    hitstun: 18,
    blockstun: 15,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 6,
  },
  // Narrow Spike qcf+K (low kick)
  KDASH_NARROW: {
    startup: 10,
    active: 5,
    recovery: 20,
    damage: 60,
    hitstun: 16,
    blockstun: 14,
    pushback: 3,
    hitLevel: "LOW" as const,
    knockdown: false,
    chipDamage: 5,
  },
  // ── K' DM/SDM ── KOF2002UM 校准数据
  // Chain Shot DM qcf,qcf+P
  DM_CHAIN_SHOT: {
    startup: 6,
    active: 18,
    recovery: 36,
    damage: 200,
    hitstun: 0,
    blockstun: 22,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 20,
    invincibleStartup: 6,
  },
  // Chain Shot SDM MAX qcf,qcf+AC
  SDM_CHAIN_SHOT: {
    startup: 5,
    active: 24,
    recovery: 38,
    damage: 300,
    hitstun: 0,
    blockstun: 22,
    pushback: 14,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 28,
    invincibleStartup: 8,
  },
} as const;
