/**
 * Character-specific frame data (specials + DM + SDM).
 * Merged into FRAME_DATA by frameDataConstants.ts.
 */
export const FRAME_DATA_CHARS = {
  // ── 京专属必杀技 (Kyo Kusanagi) ── SuperCombo KOF2002/Kyo
  KYO_75KAI: {
    startup: 13, active: 5, recovery: 27,
    damage: 40, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_75KAI_2: {
    startup: 7, active: 7, recovery: 14,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_RED_KICK: {
    startup: 18, active: 6, recovery: 18,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  KYO_ONIYAKI: {
    startup: 5, active: 4, recovery: 27,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  KYO_ONIYAKI_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  KYO_YAMIBARAI: {
    startup: 10, active: 20, recovery: 30,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  KYO_YAMIBARAI_C: {
    startup: 11, active: 22, recovery: 28,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  KYO_ARAGAMI: {
    startup: 11, active: 8, recovery: 24,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_ARAGAMI_KONOKIZU: {
    startup: 8, active: 8, recovery: 31,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_ARAGAMI_YANOSABI: {
    startup: 11, active: 4, recovery: 30,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  KYO_DOKUGAMI: {
    startup: 17, active: 6, recovery: 21,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_TSUMIYOMI: {
    startup: 11, active: 3, recovery: 34,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_BATSUYOMI: {
    startup: 13, active: 4, recovery: 21,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_NANASE: {
    startup: 14, active: 3, recovery: 24,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_KOTO_TSUKI: {
    startup: 9, active: 5, recovery: 38,
    damage: 75, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_YAKISOGI: {
    startup: 11, active: 3, recovery: 30,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // ── 八神庵必杀技 (Iori Yagami) ──
  IORI_AOIHANA: {
    startup: 8, active: 3, recovery: 26,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  IORI_AOIHANA_2: {
    startup: 7, active: 3, recovery: 28,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: true,
  },
  IORI_AOIHANA_3: {
    startup: 17, active: 4, recovery: 29,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  IORI_YAMIBARAI: {
    startup: 10, active: 20, recovery: 39,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  IORI_YAMIBARAI_C: {
    startup: 11, active: 22, recovery: 37,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  IORI_ONIYAKI: {
    startup: 5, active: 5, recovery: 25,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  IORI_ONIYAKI_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  IORI_KOTOTSUKI: {
    startup: 6, active: 16, recovery: 14,
    damage: 95, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  IORI_KUZUKAZE: {
    startup: 11, active: 1, recovery: 31,
    damage: 10, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 特瑞必杀技 (Terry Bogard) ──
  TERRY_POWER_WAVE: {
    startup: 14, active: 20, recovery: 32,
    damage: 85, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  TERRY_BURN_KNUCKLE: {
    startup: 13, active: 10, recovery: 18,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  TERRY_CRACK_SHOT: {
    startup: 10, active: 5, recovery: 21,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  TERRY_POWER_DUNK: {
    startup: 6, active: 6, recovery: 25,
    damage: 100, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  TERRY_RISING_TACKLE: {
    startup: 5, active: 12, recovery: 35,
    damage: 105, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // ── 金必杀技 (Kim Kaphwan) ──
  KIM_HIENZAN: {
    startup: 5, active: 6, recovery: 25,
    damage: 100, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  KIM_HANGETSU: {
    startup: 7, active: 12, recovery: 29,
    damage: 80, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KIM_HAKI: {
    startup: 9, active: 5, recovery: 20,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  KIM_HISHOU: {
    startup: 2, active: 8, recovery: 14,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KIM_SANREN: {
    startup: 8, active: 6, recovery: 24,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── DM超必杀技 ──
  DM_YATAGARASU: {
    startup: 6, active: 16, recovery: 42,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  DM_POWER_GEYSER: {
    startup: 17, active: 10, recovery: 43,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 16,
  },
  DM_PHOENIX_KICK: {
    startup: 8, active: 13, recovery: 43,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 17,
  },
  DM_HIGH_ANGLE_GEYSER: {
    startup: 6, active: 12, recovery: 33,
    damage: 180, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 15,
  },
  DM_PHOENIX_HITEN: {
    startup: 8, active: 5, recovery: 30,
    damage: 180, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // ── 坂崎亮必杀技 (Ryo Sakazaki) ──
  RYO_KOOU: {
    startup: 12, active: 18, recovery: 34,
    damage: 75, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  RYO_KOOU_C: {
    startup: 13, active: 20, recovery: 32,
    damage: 105, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  RYO_KO_HOU: {
    startup: 5, active: 5, recovery: 25,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  RYO_KO_HOU_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  RYO_HIEN: {
    startup: 10, active: 8, recovery: 22,
    damage: 95, hitstun: 24, blockstun: 20, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  RYO_HAOU: {
    startup: 6, active: 12, recovery: 18,
    damage: 60, hitstun: 20, blockstun: 16, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  DM_TEN_HA_OU: {
    startup: 10, active: 6, recovery: 35,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 莉安娜必杀技 (Leona Heidern) ──
  LEONA_MOON_SLASH: {
    startup: 13, active: 16, recovery: 30,
    damage: 70, hitstun: 26, blockstun: 24, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  LEONA_MOON_SLASH_C: {
    startup: 14, active: 18, recovery: 28,
    damage: 100, hitstun: 28, blockstun: 26, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  LEONA_EAR_RING: {
    startup: 5, active: 5, recovery: 25,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  LEONA_EAR_RING_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  LEONA_GRAND_SABER: {
    startup: 8, active: 8, recovery: 22,
    damage: 90, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  LEONA_BALTIC: {
    startup: 10, active: 6, recovery: 24,
    damage: 75, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  DM_V_SLASHER: {
    startup: 8, active: 6, recovery: 38,
    damage: 210, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 16,
  },
  // ── 罗伯特必杀技 (Robert Garcia) ──
  ROBERT_RYU_GEKI: {
    startup: 12, active: 20, recovery: 28,
    damage: 70, hitstun: 24, blockstun: 22, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  ROBERT_RYU_GEKI_C: {
    startup: 14, active: 24, recovery: 26,
    damage: 95, hitstun: 26, blockstun: 24, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  ROBERT_RYU_ZAN: {
    startup: 5, active: 6, recovery: 24,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  ROBERT_RYU_ZAN_C: {
    startup: 7, active: 10, recovery: 28,
    damage: 130, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true,
  },
  ROBERT_HIEN_RYU_JIN: {
    startup: 8, active: 8, recovery: 18,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  ROBERT_GENEI_KYAKU: {
    startup: 10, active: 6, recovery: 22,
    damage: 75, hitstun: 20, blockstun: 16, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  ROBERT_HIEN_RYU_KYAKU: {
    startup: 8, active: 10, recovery: 22,
    damage: 90, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  DM_RYU_KO_RYU: {
    startup: 8, active: 6, recovery: 36,
    damage: 220, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  DM_HAOU_SHOKOU: {
    startup: 10, active: 8, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  // ── 不知火舞必杀技 (Mai Shiranui) ──
  MAI_KA_CHO_SEN: {
    startup: 12, active: 18, recovery: 30,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  MAI_KA_CHO_SEN_C: {
    startup: 14, active: 22, recovery: 28,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  MAI_HISHO_RYU_EN_JIN: {
    startup: 5, active: 6, recovery: 24,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  MAI_RYU_EN_BU: {
    startup: 10, active: 8, recovery: 22,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_HAKA_OTOSHI: {
    startup: 8, active: 10, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // K' 必杀技
  KDASH_EINS: {
    startup: 12, active: 25, recovery: 18,
    damage: 60, hitstun: 14, blockstun: 12, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 5,
  },
  KDASH_EINS_C: {
    startup: 14, active: 30, recovery: 20,
    damage: 75, hitstun: 16, blockstun: 14, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 6,
  },
  KDASH_CROW: {
    startup: 5, active: 6, recovery: 22,
    damage: 70, hitstun: 18, blockstun: 14, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KDASH_CROW_C: {
    startup: 6, active: 8, recovery: 26,
    damage: 90, hitstun: 20, blockstun: 16, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KDASH_MINUTE: {
    startup: 10, active: 6, recovery: 18,
    damage: 65, hitstun: 16, blockstun: 14, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  KDASH_NARROW: {
    startup: 8, active: 8, recovery: 16,
    damage: 55, hitstun: 14, blockstun: 12, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // 库拉必杀技
  KULA_BREATH: {
    startup: 14, active: 22, recovery: 18,
    damage: 55, hitstun: 14, blockstun: 12, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 4,
  },
  KULA_BREATH_C: {
    startup: 16, active: 28, recovery: 20,
    damage: 70, hitstun: 16, blockstun: 14, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 5,
  },
  KULA_SHELL: {
    startup: 5, active: 6, recovery: 20,
    damage: 65, hitstun: 16, blockstun: 14, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KULA_SHELL_C: {
    startup: 6, active: 8, recovery: 24,
    damage: 85, hitstun: 18, blockstun: 16, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KULA_LAY: {
    startup: 8, active: 8, recovery: 18,
    damage: 60, hitstun: 16, blockstun: 14, pushback: 4,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  KULA_EDGE: {
    startup: 10, active: 6, recovery: 16,
    damage: 55, hitstun: 14, blockstun: 12, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  DM_CHAIN_SHOT: {
    startup: 8, active: 6, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 15,
  },
  DM_FREEZE: {
    startup: 8, active: 8, recovery: 36,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 15,
  },
  // ── SDM (Super Desperation Moves — MAX mode only) ──
  SDM_OROCHINAGI: {
    startup: 18, active: 25, recovery: 29,
    damage: 300, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  SDM_YATAGARASU: {
    startup: 6, active: 12, recovery: 38,
    damage: 310, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  SDM_POWER_GEYSER: {
    startup: 14, active: 20, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  SDM_PHOENIX_KICK: {
    startup: 6, active: 18, recovery: 32,
    damage: 290, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 25,
  },
  SDM_TEN_HA_OU: {
    startup: 10, active: 22, recovery: 35,
    damage: 280, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 25,
  },
  SDM_V_SLASHER: {
    startup: 8, active: 15, recovery: 38,
    damage: 290, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 25,
  },
  SDM_CHAIN_SHOT: {
    startup: 8, active: 15, recovery: 40,
    damage: 300, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 25,
  },
  SDM_FREEZE: {
    startup: 8, active: 12, recovery: 36,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 罗伯特SDM (Robert Garcia) ──
  SDM_RYU_KO_RYU: {
    startup: 8, active: 12, recovery: 36,
    damage: 320, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  SDM_HAOU_SHOKOU: {
    startup: 10, active: 14, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 不知火舞SDM (Mai Shiranui) ──
  SDM_HAKA_OTOSHI: {
    startup: 8, active: 15, recovery: 40,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 雅典娜命令通常技 (Athena Asamiya) ──
  ATHENA_PHOENIX_REFLECT: {
    startup: 16, active: 4, recovery: 20,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  ATHENA_LOW_B: {
    startup: 8, active: 4, recovery: 20,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  ATHENA_AIR_B: {
    startup: 7, active: 6, recovery: 3,
    damage: 42, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 雅典娜必杀技 (Athena Asamiya) ── APPROX based on KOF2002UM frame data
  ATHENA_PSYCHO_BALL: {
    startup: 12, active: 22, recovery: 32,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  ATHENA_PSYCHO_BALL_C: {
    startup: 14, active: 26, recovery: 30,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  ATHENA_PSYCHO_SWORD: {
    startup: 5, active: 5, recovery: 26,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  ATHENA_PSYCHO_SWORD_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  ATHENA_PHOENIX_ARROW: {
    startup: 6, active: 10, recovery: 18,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── 雅典娜DM (Athena) ──
  DM_SHINING_CRYSTAL_BIT: {
    startup: 8, active: 12, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 雅典娜SDM (Athena) ──
  SDM_SHINING_CRYSTAL_BIT: {
    startup: 8, active: 18, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
} as const;
