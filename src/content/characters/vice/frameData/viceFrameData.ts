/**
 * Vice frame data — KOF2002 calibrated data
 *
 * Vice (薇丝) — Orochi team, grappling/counter fighting style.
 * Specialties: command grabs, rush punches, counter-based gameplay.
 * Frame data calibrated from KOF2002/KOF2002UM reference.
 */
export const VICE_FRAME_DATA = {
  // ── 薇丝命令通常技 (Vice Command Normals) ──
  // Monstrosity f+A (upper body strike)
  VICE_MONSTROSITY: {
    startup: 7,
    active: 5,
    recovery: 14,
    damage: 40,
    hitstun: 12,
    blockstun: 10,
    pushback: 3,
    hitLevel: "MID" as const,
    knockdown: false,
  },
  // Overkill f+B (low strike)
  VICE_OVERKILL: {
    startup: 8,
    active: 6,
    recovery: 16,
    damage: 45,
    hitstun: 14,
    blockstun: 11,
    pushback: 3,
    hitLevel: "LOW" as const,
    knockdown: false,
  },

  // ── 薇丝必杀技 (Vice Specials) ──
  // Outrage qcf+A (weak rush punch)
  VICE_OUTRAGE: {
    startup: 10,
    active: 8,
    recovery: 20,
    damage: 60,
    hitstun: 18,
    blockstun: 16,
    pushback: 5,
    hitLevel: "MID" as const,
    knockdown: false,
    chipDamage: 6,
  },
  // Outrage qcf+C (strong rush punch)
  VICE_OUTRAGE_C: {
    startup: 14,
    active: 10,
    recovery: 24,
    damage: 85,
    hitstun: 20,
    blockstun: 18,
    pushback: 7,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 8,
  },
  // Black End qcb+P (grab slam — unblockable)
  VICE_BLACK_END: {
    startup: 6,
    active: 4,
    recovery: 30,
    damage: 100,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "GRAB" as const,
    knockdown: true,
    chipDamage: 0,
  },
  // Mayhem hcf+K (low rush)
  VICE_MAYHEM: {
    startup: 9,
    active: 6,
    recovery: 22,
    damage: 75,
    hitstun: 18,
    blockstun: 16,
    pushback: 6,
    hitLevel: "LOW" as const,
    knockdown: false,
    chipDamage: 7,
  },
  // Gore Fest hcb,f+P (command grab — unblockable)
  VICE_GORE_FEST: {
    startup: 5,
    active: 3,
    recovery: 35,
    damage: 120,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "GRAB" as const,
    knockdown: true,
    chipDamage: 0,
  },

  // ── 薇丝DM ── KOF2002 calibrated
  // Withering Surface qcf,qcf+P (multi-hit rush DM)
  DM_WITHERING_SURFACE: {
    startup: 8,
    active: 18,
    recovery: 40,
    damage: 180,
    hitstun: 0,
    blockstun: 21,
    pushback: 10,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 18,
  },
  // Negative Gain hcb,f,hcb,f+K (command grab DM — unblockable)
  DM_NEGATIVE_GAIN: {
    startup: 6,
    active: 5,
    recovery: 45,
    damage: 200,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "GRAB" as const,
    knockdown: true,
    chipDamage: 0,
  },

  // ── 薇丝SDM ── MAX版强化
  // Withering Surface SDM
  SDM_WITHERING_SURFACE: {
    startup: 7,
    active: 22,
    recovery: 38,
    damage: 280,
    hitstun: 0,
    blockstun: 24,
    pushback: 12,
    hitLevel: "MID" as const,
    knockdown: true,
    chipDamage: 24,
  },
  // Negative Gain SDM (command grab SDM — unblockable)
  SDM_NEGATIVE_GAIN: {
    startup: 5,
    active: 5,
    recovery: 48,
    damage: 320,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
    hitLevel: "GRAB" as const,
    knockdown: true,
    chipDamage: 0,
  },
} as const;
