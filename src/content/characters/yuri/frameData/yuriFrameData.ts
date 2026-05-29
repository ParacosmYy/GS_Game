/**
 * Yuri Content Package — Frame Data Constants
 *
 * Startup/active/recovery frame data for all Yuri attacks.
 */

export const YURI_FRAME_DATA = {
  // Normals — stand
  STAND_A: { startup: 4, active: 3, recovery: 6, damage: 30, hitstun: 10, blockstun: 5, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  STAND_B: { startup: 5, active: 3, recovery: 7, damage: 35, hitstun: 11, blockstun: 6, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  STAND_C: { startup: 7, active: 4, recovery: 10, damage: 60, hitstun: 14, blockstun: 8, pushback: 4, hitLevel: 'MID' as const, knockdown: false },
  STAND_D: { startup: 9, active: 4, recovery: 12, damage: 70, hitstun: 16, blockstun: 9, pushback: 5, hitLevel: 'MID' as const, knockdown: false },
  // Normals — close
  CLOSE_A: { startup: 3, active: 3, recovery: 6, damage: 30, hitstun: 10, blockstun: 5, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  CLOSE_B: { startup: 4, active: 3, recovery: 7, damage: 35, hitstun: 11, blockstun: 6, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  CLOSE_C: { startup: 5, active: 4, recovery: 10, damage: 70, hitstun: 15, blockstun: 9, pushback: 4, hitLevel: 'MID' as const, knockdown: false },
  CLOSE_D: { startup: 6, active: 5, recovery: 12, damage: 80, hitstun: 17, blockstun: 10, pushback: 5, hitLevel: 'MID' as const, knockdown: false },
  // Normals — crouch
  CROUCH_A: { startup: 4, active: 3, recovery: 6, damage: 25, hitstun: 10, blockstun: 5, pushback: 1, hitLevel: 'LOW' as const, knockdown: false },
  CROUCH_B: { startup: 5, active: 3, recovery: 7, damage: 30, hitstun: 11, blockstun: 6, pushback: 2, hitLevel: 'LOW' as const, knockdown: false },
  CROUCH_C: { startup: 7, active: 4, recovery: 11, damage: 65, hitstun: 14, blockstun: 8, pushback: 4, hitLevel: 'LOW' as const, knockdown: false },
  CROUCH_D: { startup: 8, active: 5, recovery: 13, damage: 75, hitstun: 16, blockstun: 9, pushback: 5, hitLevel: 'LOW' as const, knockdown: true },
  // Normals — jump
  JUMP_A: { startup: 4, active: 5, recovery: 4, damage: 35, hitstun: 10, blockstun: 5, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  JUMP_B: { startup: 5, active: 5, recovery: 5, damage: 40, hitstun: 11, blockstun: 6, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  JUMP_C: { startup: 6, active: 5, recovery: 6, damage: 65, hitstun: 14, blockstun: 8, pushback: 3, hitLevel: 'MID' as const, knockdown: false },
  JUMP_D: { startup: 7, active: 6, recovery: 7, damage: 75, hitstun: 16, blockstun: 9, pushback: 4, hitLevel: 'MID' as const, knockdown: false },
  // Command normals
  YURI_UPPER_BLOCK: { startup: 10, active: 4, recovery: 12, damage: 40, hitstun: 13, blockstun: 7, pushback: 3, hitLevel: 'HIGH' as const, knockdown: false },
  YURI_LOWER_BLOCK: { startup: 8, active: 3, recovery: 10, damage: 35, hitstun: 11, blockstun: 6, pushback: 2, hitLevel: 'LOW' as const, knockdown: false },
  YURI_ORI: { startup: 6, active: 5, recovery: 5, damage: 40, hitstun: 12, blockstun: 6, pushback: 2, hitLevel: 'MID' as const, knockdown: false },
  // Throws
  YURI_THROW_C: { startup: 2, active: 1, recovery: 20, damage: 80, hitstun: 0, blockstun: 0, pushback: 0, hitLevel: 'MID' as const, knockdown: true },
  YURI_THROW_D: { startup: 2, active: 1, recovery: 22, damage: 90, hitstun: 0, blockstun: 0, pushback: 0, hitLevel: 'MID' as const, knockdown: true },
  YURI_AIR_THROW: { startup: 2, active: 1, recovery: 20, damage: 70, hitstun: 0, blockstun: 0, pushback: 0, hitLevel: 'MID' as const, knockdown: true },
  // Blowback
  BLOWBACK: { startup: 10, active: 4, recovery: 14, damage: 75, hitstun: 18, blockstun: 10, pushback: 6, hitLevel: 'MID' as const, knockdown: true },
  JUMP_BLOWBACK: { startup: 8, active: 5, recovery: 10, damage: 70, hitstun: 16, blockstun: 9, pushback: 4, hitLevel: 'MID' as const, knockdown: true },
  // Specials
  YURI_KO_OU_KEN: { startup: 10, active: 6, recovery: 16, damage: 60, hitstun: 14, blockstun: 8, pushback: 4, hitLevel: 'MID' as const, knockdown: false, chipDamage: 5 },
  YURI_HAOH_SHO_KO_KEN: { startup: 16, active: 8, recovery: 20, damage: 90, hitstun: 18, blockstun: 12, pushback: 6, hitLevel: 'MID' as const, knockdown: true, chipDamage: 8 },
  YURI_CHOU_UPPER: { startup: 5, active: 6, recovery: 18, damage: 80, hitstun: 16, blockstun: 8, pushback: 3, hitLevel: 'MID' as const, knockdown: true },
  YURI_HYAKU_RETSU_BINTA: { startup: 6, active: 10, recovery: 16, damage: 70, hitstun: 14, blockstun: 8, pushback: 3, hitLevel: 'MID' as const, knockdown: false },
  YURI_HIEN_HOU_OU_KYAKU: { startup: 8, active: 12, recovery: 18, damage: 85, hitstun: 16, blockstun: 10, pushback: 5, hitLevel: 'MID' as const, knockdown: true },
  YURI_HISHOU_KUURETSU_ZAN: { startup: 7, active: 8, recovery: 16, damage: 75, hitstun: 15, blockstun: 9, pushback: 4, hitLevel: 'MID' as const, knockdown: true },
  YURI_RAI_KEN: { startup: 8, active: 6, recovery: 14, damage: 65, hitstun: 13, blockstun: 7, pushback: 3, hitLevel: 'MID' as const, knockdown: false },
  // DM
  DM_YURI_HAOH_SHO_KO_KEN: { startup: 8, active: 12, recovery: 24, damage: 200, hitstun: 22, blockstun: 14, pushback: 8, hitLevel: 'MID' as const, knockdown: true, chipDamage: 15 },
  DM_YURI_HIEN_HOU_OU_KYAKU: { startup: 6, active: 16, recovery: 22, damage: 190, hitstun: 20, blockstun: 12, pushback: 7, hitLevel: 'MID' as const, knockdown: true },
  // SDM
  SDM_YURI_HAOH_SHO_KO_KEN: { startup: 6, active: 14, recovery: 24, damage: 280, hitstun: 24, blockstun: 16, pushback: 10, hitLevel: 'MID' as const, knockdown: true, chipDamage: 20 },
  SDM_YURI_HIEN_HOU_OU_KYAKU: { startup: 5, active: 18, recovery: 22, damage: 270, hitstun: 22, blockstun: 14, pushback: 8, hitLevel: 'MID' as const, knockdown: true },
  // HSDM
  HSDM_YURI_HISHOU_KUURETSU_ZAN: { startup: 4, active: 20, recovery: 26, damage: 350, hitstun: 26, blockstun: 18, pushback: 12, hitLevel: 'MID' as const, knockdown: true },
} as const;
