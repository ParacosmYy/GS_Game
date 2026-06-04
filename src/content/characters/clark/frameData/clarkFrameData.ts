/**
 * Clark frame data — KOF2002 calibrated grappler data
 * Dream Cancel Wiki KOF2002UM 校准数据
 */
export const CLARK_FRAME_DATA = {
  // ── 克拉克命令通常技 (Clark Command Normals) ──
  // Death Lake Drive ->+A (overhead)
  CLARK_DEATH_LAKE: {
    startup: 16,
    active: 4,
    recovery: 22,
    damage: 45,
    hitstun: 18,
    blockstun: 15,
    pushback: 3,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Stomp ->+B (low stomp)
  CLARK_STOMP: {
    startup: 10,
    active: 4,
    recovery: 20,
    damage: 40,
    hitstun: 16,
    blockstun: 14,
    pushback: 2,
    hitLevel: "LOW" as const,
    knockdown: false,
  },
  // ── 克拉克必杀技 (Clark) ── KOF2002UM 校准数据
  // Super Argentine Backbreaker qcb+A (command grab, weak)
  CLARK_ARGENTINE: {
    startup: 5,
    active: 3,
    recovery: 30,
    damage: 85,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Super Argentine Backbreaker qcb+C (command grab, strong)
  CLARK_ARGENTINE_C: {
    startup: 6,
    active: 3,
    recovery: 32,
    damage: 100,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Napalm Stretch qcf+P (anti-air grab)
  CLARK_NAPALM: {
    startup: 8,
    active: 6,
    recovery: 28,
    damage: 78,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Flash Elbow qcf+P (follow-up after throw)
  CLARK_FLASH_ELBOW: {
    startup: 6,
    active: 4,
    recovery: 24,
    damage: 55,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Mount Tackle hcb+P (near, command throw)
  CLARK_MOUNT_TACKLE: {
    startup: 4,
    active: 3,
    recovery: 28,
    damage: 80,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Vulcan Punch qcf+K (multi-hit)
  CLARK_VULCAN: {
    startup: 10,
    active: 8,
    recovery: 26,
    damage: 72,
    hitstun: 20,
    blockstun: 17,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 10,
  },
  // ── 克拉克DM/SDM (Clark) ── KOF2002UM 校准数据
  // Super Argentine Backbreaker DM qcf,qcf+P
  DM_ARGENTINE_DM: {
    startup: 5,
    active: 4,
    recovery: 40,
    damage: 200,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Rolling Cradle DM qcb,qcb+K (near, command throw DM)
  DM_ROLLING_CRADLE: {
    startup: 6,
    active: 5,
    recovery: 42,
    damage: 190,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Super Argentine Backbreaker SDM MAX qcf,qcf+AC
  SDM_ARGENTINE_DM: {
    startup: 4,
    active: 6,
    recovery: 38,
    damage: 280,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
  // Rolling Cradle SDM MAX qcb,qcb+BD (near, command throw SDM)
  SDM_ROLLING_CRADLE: {
    startup: 4,
    active: 6,
    recovery: 40,
    damage: 260,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "MID" as const,
    knockdown: true,
  },
} as const;
