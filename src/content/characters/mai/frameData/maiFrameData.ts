/**
 * Mai frame data — KOF2002UM calibrated data for Mai Shiranui
 * Dream Cancel Wiki KOF2002UM 校准数据
 */
export const MAI_FRAME_DATA = {
  // ── 不知火舞命令通常技 (Mai Command Normals) ──
  // Hissatsu Shinobibachi ->+B (overhead strike)
  MAI_HISSATSU_SHINOBIBACHI: {
    startup: 16,
    active: 4,
    recovery: 20,
    damage: 46,
    hitstun: 19,
    blockstun: 16,
    pushback: 3,
    hitLevel: "HIGH" as const,
    knockdown: false,
  },
  // Yusura Uma ↘+B (low kick)
  MAI_YUSURA_UMA: {
    startup: 9,
    active: 4,
    recovery: 21,
    damage: 40,
    hitstun: 18,
    blockstun: 15,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // ── 不知火舞必杀技 (Mai) ── KOF2002UM 校准数据
  // Kachousen qcf+A (weak fan projectile)
  MAI_KA_CHO_SEN: {
    startup: 12,
    active: 8,
    recovery: 26,
    damage: 70,
    hitstun: 20,
    blockstun: 17,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Kachousen qcf+C (strong fan projectile)
  MAI_KA_CHO_SEN_C: {
    startup: 16,
    active: 12,
    recovery: 30,
    damage: 90,
    hitstun: 24,
    blockstun: 20,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 12,
  },
  // Ryuuenbu qcb+K (flame fan swipe)
  MAI_RYU_EN_BU: {
    startup: 10,
    active: 8,
    recovery: 24,
    damage: 80,
    hitstun: 22,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // Hishou Ryuenjin dp+K (flame uppercut)
  MAI_HISHO_RYU_EN_JIN: {
    startup: 6,
    active: 8,
    recovery: 28,
    damage: 85,
    hitstun: 24,
    blockstun: 20,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // ── 不知火舞DM/SDM (Mai) ── KOF2002UM 校准数据
  // Haka Otoshi / Housenka DM qcf,qcf+K
  DM_HAKA_OTOSHI: {
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
  // Haka Otoshi / Housenka SDM MAX qcf,qcf+BD
  SDM_HAKA_OTOSHI: {
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
} as const;
