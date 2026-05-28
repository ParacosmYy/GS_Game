/**
 * Athena Asamiya frame data — extracted from frameDataKdashKulaAthenaClarkRalfJoe.ts
 * KOF2002UM 校准数据
 */
export const ATHENA_FRAME_DATA = {
  // ── 雅典娜命令通常技 (Athena Asamiya) ──
  // Phoenix Reflect →+B (overhead)
  ATHENA_PHOENIX_REFLECT: {
    startup: 16,
    active: 4,
    recovery: 20,
    damage: 45,
    hitstun: 19,
    blockstun: 17,
    pushback: 3,
    hitLevel: "HIGH" as const,
    knockdown: false,
  },
  // Low B ↘+B (low)
  ATHENA_LOW_B: {
    startup: 8,
    active: 4,
    recovery: 20,
    damage: 40,
    hitstun: 18,
    blockstun: 15,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // Air B 空中↓+B (air crossup)
  ATHENA_AIR_B: {
    startup: 7,
    active: 6,
    recovery: 3,
    damage: 42,
    hitstun: 19,
    blockstun: 17,
    pushback: 4,
    hitLevel: "HIGH" as const,
    knockdown: false,
  },
  // ── 雅典娜必杀技 (Athena Asamiya) ── KOF2002UM 校准数据
  // Psycho Ball qcb+A (弱飛行道具)
  ATHENA_PSYCHO_BALL: {
    startup: 12,
    active: 22,
    recovery: 32,
    damage: 70,
    hitstun: 28,
    blockstun: 26,
    pushback: 4,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 8,
  },
  // Psycho Ball qcb+C (強飛行道具)
  ATHENA_PSYCHO_BALL_C: {
    startup: 14,
    active: 26,
    recovery: 30,
    damage: 100,
    hitstun: 30,
    blockstun: 28,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // Psycho Sword dp+A (弱対空)
  ATHENA_PSYCHO_SWORD: {
    startup: 5,
    active: 5,
    recovery: 26,
    damage: 80,
    hitstun: 22,
    blockstun: 18,
    pushback: 6,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 10,
  },
  // Psycho Sword dp+C (強対空)
  ATHENA_PSYCHO_SWORD_C: {
    startup: 5,
    active: 10,
    recovery: 28,
    damage: 90,
    hitstun: 22,
    blockstun: 20,
    pushback: 8,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 12,
  },
  // Phoenix Arrow air qcf+K (空中突進)
  ATHENA_PHOENIX_ARROW: {
    startup: 6,
    active: 10,
    recovery: 18,
    damage: 75,
    hitstun: 22,
    blockstun: 18,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Psycho Teleport qcb+B (瞬移)
  ATHENA_PSYCHO_TELEPORT: {
    startup: 5,
    active: 1,
    recovery: 15,
    damage: 1,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Psycho Teleport qcb+D (長距離瞬移)
  ATHENA_PSYCHO_TELEPORT_C: {
    startup: 8,
    active: 1,
    recovery: 15,
    damage: 1,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // ── 雅典娜DM (Athena) ──
  // Shining Crystal Bit DM qcf,qcf+P
  DM_SHINING_CRYSTAL_BIT: {
    startup: 8,
    active: 12,
    recovery: 40,
    damage: 200,
    hitstun: 0,
    blockstun: 21,
    pushback: 10,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 18,
  },
  // Phoenix Fang Arrow DM (空中DM) air qcf,qcf+P
  DM_PHOENIX_FANG_ARROW: {
    startup: 7,
    active: 12,
    recovery: 38,
    damage: 180,
    hitstun: 0,
    blockstun: 21,
    pushback: 8,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 18,
  },
  // ── 雅典娜SDM (Athena) ──
  // Shining Crystal Bit SDM MAX qcf,qcf+AC
  SDM_SHINING_CRYSTAL_BIT: {
    startup: 8,
    active: 18,
    recovery: 38,
    damage: 300,
    hitstun: 0,
    blockstun: 21,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 30,
  },
  // Phoenix Fang Arrow SDM (空中SDM)
  SDM_PHOENIX_FANG_ARROW: {
    startup: 6,
    active: 15,
    recovery: 36,
    damage: 240,
    hitstun: 0,
    blockstun: 21,
    pushback: 10,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 28,
  },
} as const;
