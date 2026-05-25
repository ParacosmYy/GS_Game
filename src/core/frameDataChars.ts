/**
 * Character-specific frame data (specials + DM + SDM).
 * Merged into FRAME_DATA by frameDataConstants.ts.
 *
 * 数据源标注:
 * - 无标注: Dream Cancel Wiki KOF2002UM 精确数据
 * - // APPROX (OG): SuperCombo Wiki KOF2002原版, UM可能有±1-2帧差异
 * - // APPROX: 基于KOF2002UM估算, 无精确来源
 */
export const FRAME_DATA_CHARS = {
  // ── 京专属必杀技 (Kyo Kusanagi) ── Dream Cancel Wiki KOF2002UM 精确数据
  // 75式·改 qcf+B (第1段)
  KYO_75KAI: {
    startup: 14, active: 3, recovery: 14,
    damage: 40, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 75式·改 第2段 (qcf+K 追加)
  KYO_75KAI_2: {
    startup: 7, active: 7, recovery: 14,
    damage: 40, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // R.E.D. Kicks rdp+B/D
  KYO_RED_KICK: {
    startup: 19, active: 6, recovery: 33,
    damage: 108, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_RED_KICK_D: {
    startup: 30, active: 6, recovery: 32,
    damage: 150, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 鬼焼き dp+A (2段上升拳, SKD)
  KYO_ONIYAKI: {
    startup: 6, active: 8, recovery: 38,
    damage: 58, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  // 鬼焼き dp+C (长版, 多段)
  KYO_ONIYAKI_C: {
    startup: 6, active: 14, recovery: 48,
    damage: 108, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // 暗払い qcf+A (飞行道具)
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
  // 荒咬み qcf+A (rekka 1段目)
  KYO_ARAGAMI: {
    startup: 12, active: 6, recovery: 18,
    damage: 58, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 九傷 qcf+A→qcf+P (rekka 2段目, SKD)
  KYO_ARAGAMI_KONOKIZU: {
    startup: 8, active: 8, recovery: 31,
    damage: 42, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 八錆 qcf+A→qcf+P→P (rekka 3段P, HKD overhead)
  KYO_ARAGAMI_YANOSABI: {
    startup: 14, active: 3, recovery: 31,
    damage: 25, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // 七瀬 qcf+A→qcf+P→K (rekka 3段K, SKD)
  KYO_NANASE: {
    startup: 17, active: 3, recovery: 24,
    damage: 67, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 破砕 qcf+A→hcb+P (八錆派生中段)
  KYO_MIGIRI: {
    startup: 20, active: 14, recovery: 22,
    damage: 58, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true,
  },
  // 轢鉄 qcf+A→hcb+P→hcb+K (HKD)
  KYO_KOTO_TSUKI: {
    startup: 10, active: 5, recovery: 38,
    damage: 83, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 毒咬み qcf+C (rekka C系1段目)
  KYO_DOKUGAMI: {
    startup: 18, active: 6, recovery: 21,
    damage: 25, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 罪詠み qcf+C→hcb+P
  KYO_TSUMIYOMI: {
    startup: 11, active: 3, recovery: 34,
    damage: 33, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 罰詠み qcf+C→hcb+P→f+P (SKD)
  KYO_BATSUYOMI: {
    startup: 14, active: 4, recovery: 42,
    damage: 33, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 焼きそぎ (空中DOWN+P, KD)
  KYO_YAKISOGI: {
    startup: 11, active: 3, recovery: 30,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // 引き金 hcb+B (SKD, 下半身无敌) APPROX
  KYO_HIKIGANE_B: {
    startup: 20, active: 3, recovery: 31,
    damage: 58, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 引き金 hcb+D (多段, 上半身无敌) APPROX
  KYO_HIKIGANE_D: {
    startup: 15, active: 6, recovery: 25,
    damage: 108, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 京DM/SDM ── Dream Cancel Wiki KOF2002UM
  DM_OROCHINAGI_A: {
    startup: 21, active: 17, recovery: 27,
    damage: 233, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  DM_OROCHINAGI_C: {
    startup: 20, active: 17, recovery: 27,
    damage: 233, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  DM_182SHIKI_A: {
    startup: 11, active: 12, recovery: 30,
    damage: 225, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  DM_182SHIKI_C: {
    startup: 19, active: 12, recovery: 30,
    damage: 225, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  SDM_OROCHINAGI: {
    startup: 20, active: 25, recovery: 29,
    damage: 342, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 八神庵必杀技 (Iori Yagami) ── APPROX (OG): SuperCombo Wiki KOF2002原版
  // 葵花 qcb+A (rekka 1段)
  IORI_AOIHANA: {
    startup: 8, active: 3, recovery: 26,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 葵花 2段
  IORI_AOIHANA_2: {
    startup: 7, active: 3, recovery: 28,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 葵花 3段 (overhead HKD)
  IORI_AOIHANA_3: {
    startup: 17, active: 2, recovery: 29,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 葵花 C版 1段 APPROX (OG)
  IORI_AOIHANA_C: {
    startup: 11, active: 3, recovery: 28,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // 葵花 C版 2段 APPROX (OG)
  IORI_AOIHANA_C_2: {
    startup: 11, active: 3, recovery: 29,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 葵花 C版 3段 (overhead, 长active) APPROX (OG)
  IORI_AOIHANA_C_3: {
    startup: 17, active: 9, recovery: 31,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 暗払い qcf+A (飞行道具) APPROX (OG)
  IORI_YAMIBARAI: {
    startup: 10, active: 20, recovery: 39,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  IORI_YAMIBARAI_C: {
    startup: 9, active: 22, recovery: 40,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 鬼焼き dp+A (2段) APPROX (OG)
  IORI_ONIYAKI: {
    startup: 5, active: 8, recovery: 27,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  // 鬼焼き dp+C (3段, 全身无敌) APPROX (OG)
  IORI_ONIYAKI_C: {
    startup: 5, active: 14, recovery: 41,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // 琴月 陰 hcb+B (半屏冲刺HKD) APPROX (OG)
  IORI_KOTOTSUKI: {
    startup: 6, active: 16, recovery: 14,
    damage: 95, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 琴月 陰 hcb+D (全屏) APPROX (OG)
  IORI_KOTOTSUKI_D: {
    startup: 6, active: 24, recovery: 14,
    damage: 110, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 逆剥ぎ hcb,f+P (指令投, 换边) APPROX (OG)
  IORI_KUZUKAZE: {
    startup: 11, active: 1, recovery: 31,
    damage: 10, hitstun: 16, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 八神庵DM ── APPROX (OG)
  DM_MAIDEN_MASHER_A: {
    startup: 6, active: 16, recovery: 42,
    damage: 220, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  DM_MAIDEN_MASHER_C: {
    startup: 6, active: 24, recovery: 44,
    damage: 220, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  SDM_MAIDEN_MASHER: {
    startup: 12, active: 24, recovery: 44,
    damage: 350, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 特瑞必杀技 (Terry Bogard) ── APPROX (OG): SuperCombo Wiki KOF2002原版
  // Power Wave qcf+A (地面波)
  TERRY_POWER_WAVE: {
    startup: 14, active: 20, recovery: 32,
    damage: 85, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  // Round Wave qcf+C (原地波, 可取消) APPROX (OG)
  TERRY_ROUND_WAVE: {
    startup: 19, active: 10, recovery: 18,
    damage: 95, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  // Burn Knuckle qcb+A APPROX (OG)
  TERRY_BURN_KNUCKLE: {
    startup: 13, active: 10, recovery: 18,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // Burn Knuckle qcb+C (全屏) APPROX (OG)
  TERRY_BURN_KNUCKLE_C: {
    startup: 20, active: 19, recovery: 20,
    damage: 85, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // Crack Shoot qcb+B APPROX (OG)
  TERRY_CRACK_SHOT: {
    startup: 10, active: 6, recovery: 21,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // Crack Shoot qcb+D APPROX (OG)
  TERRY_CRACK_SHOT_D: {
    startup: 9, active: 8, recovery: 23,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // Power Dunk dp+B (2段KD) APPROX (OG)
  TERRY_POWER_DUNK: {
    startup: 6, active: 8, recovery: 40,
    damage: 100, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // Power Dunk dp+D APPROX (OG)
  TERRY_POWER_DUNK_D: {
    startup: 7, active: 8, recovery: 44,
    damage: 115, hitstun: 25, blockstun: 20, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // Rising Tackle d,u+A (多段上升) APPROX (OG)
  TERRY_RISING_TACKLE: {
    startup: 5, active: 12, recovery: 35,
    damage: 105, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // Rising Tackle d,u+C (多段, 更多hits) APPROX (OG)
  TERRY_RISING_TACKLE_C: {
    startup: 5, active: 16, recovery: 39,
    damage: 135, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // ── 特瑞DM ── APPROX (OG)
  DM_POWER_GEYSER_A: {
    startup: 17, active: 10, recovery: 43,
    damage: 220, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  DM_POWER_GEYSER_C: {
    startup: 18, active: 11, recovery: 47,
    damage: 220, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  DM_HIGH_ANGLE_GEYSER_B: {
    startup: 6, active: 12, recovery: 33,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  DM_HIGH_ANGLE_GEYSER_D: {
    startup: 11, active: 14, recovery: 37,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  SDM_TRIPLE_GEYSER: {
    startup: 18, active: 22, recovery: 36,
    damage: 320, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
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
  // ── 克拉克必杀技 (Clark Still) ── APPROX based on KOF2002UM
  CLARK_ARGENTINE: {
    startup: 5, active: 2, recovery: 30,
    damage: 120, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CLARK_ARGENTINE_C: {
    startup: 7, active: 2, recovery: 34,
    damage: 150, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CLARK_FLASH_ELBOW: {
    startup: 8, active: 5, recovery: 20,
    damage: 65, hitstun: 20, blockstun: 16, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CLARK_VULCAN: {
    startup: 10, active: 12, recovery: 24,
    damage: 80, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 克拉克DM/SDM (Clark) ──
  DM_ARGENTINE_DM: {
    startup: 6, active: 4, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  SDM_ARGENTINE_DM: {
    startup: 6, active: 8, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 拉尔夫必杀技 (Ralf Jones) ── APPROX based on KOF2002UM
  RALF_VULCAN: {
    startup: 8, active: 12, recovery: 24,
    damage: 55, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  RALF_VULCAN_C: {
    startup: 10, active: 18, recovery: 28,
    damage: 90, hitstun: 26, blockstun: 22, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  RALF_BACKBREAKER: {
    startup: 6, active: 2, recovery: 30,
    damage: 120, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  RALF_KICK: {
    startup: 12, active: 8, recovery: 22,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_GALACTICA_PHANTOM: {
    startup: 12, active: 8, recovery: 40,
    damage: 220, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  SDM_GALACTICA_PHANTOM: {
    startup: 10, active: 14, recovery: 38,
    damage: 320, hitstun: 0, blockstun: 22, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 乔·东必杀技 (Joe Higashi) ── APPROX based on KOF2002UM
  JOE_HURRICANE: {
    startup: 12, active: 22, recovery: 30,
    damage: 75, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  JOE_HURRICANE_C: {
    startup: 14, active: 28, recovery: 28,
    damage: 105, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  JOE_TIGER_KICK: {
    startup: 5, active: 6, recovery: 24,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  JOE_TIGER_KICK_D: {
    startup: 7, active: 10, recovery: 28,
    damage: 130, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  JOE_BAKURETSUKEN: {
    startup: 8, active: 12, recovery: 22,
    damage: 65, hitstun: 22, blockstun: 18, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  JOE_OUGON_KAKATO: {
    startup: 10, active: 8, recovery: 20,
    damage: 90, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_SCREW_UPPER: {
    startup: 10, active: 14, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  SDM_SCREW_UPPER: {
    startup: 8, active: 22, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 安迪必杀技 (Andy Bogard) ── APPROX based on KOF2002UM
  ANDY_HISHOU_KEN: {
    startup: 12, active: 20, recovery: 30,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  ANDY_HISHOU_KEN_C: {
    startup: 14, active: 24, recovery: 28,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  ANDY_SHOURYUU_DAN: {
    startup: 5, active: 5, recovery: 25,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  ANDY_SHOURYUU_DAN_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  ANDY_ZANEI_RYUSEI_KEN: {
    startup: 8, active: 8, recovery: 22,
    damage: 90, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  ANDY_ZANEI_RYUSEI_KEN_D: {
    startup: 10, active: 12, recovery: 26,
    damage: 110, hitstun: 26, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true,
  },
  ANDY_GEKI_HISHOU_KEN: {
    startup: 6, active: 8, recovery: 16,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_CHO_REPPA_DAN: {
    startup: 8, active: 14, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  SDM_CHO_REPPA_DAN: {
    startup: 8, active: 22, recovery: 36,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 比利必杀技 (Billy Kane) ── APPROX based on KOF2002UM
  BILLY_SANSETSU_KON: {
    startup: 10, active: 8, recovery: 22,
    damage: 65, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  BILLY_SANSETSU_KON_C: {
    startup: 12, active: 12, recovery: 26,
    damage: 90, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  BILLY_SENPU_KON: {
    startup: 5, active: 6, recovery: 24,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  BILLY_SENPU_KON_C: {
    startup: 7, active: 10, recovery: 28,
    damage: 130, hitstun: 26, blockstun: 22, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  BILLY_HIEN_ZAN: {
    startup: 10, active: 8, recovery: 20,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  BILLY_HIEN_ZAN_D: {
    startup: 12, active: 12, recovery: 24,
    damage: 100, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_KAEN_SENPU_JIN: {
    startup: 10, active: 12, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  SDM_KAEN_SENPU_JIN: {
    startup: 8, active: 20, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 陈可汗必杀技 (Chang Koehan) ── APPROX based on KOF2002UM
  CHANG_TEKKYUU_KAITEN: {
    startup: 10, active: 14, recovery: 26,
    damage: 65, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  CHANG_TEKKYUU_KAITEN_C: {
    startup: 12, active: 20, recovery: 30,
    damage: 100, hitstun: 26, blockstun: 22, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  CHANG_TEKKYUU_FASSHU: {
    startup: 14, active: 8, recovery: 28,
    damage: 90, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'HIGH' as const, knockdown: true, chipDamage: 10,
  },
  CHANG_TEKKYUU_HIEN_ZAN: {
    startup: 8, active: 10, recovery: 24,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  DM_TEKKYUU_DAI_BOUSOU: {
    startup: 10, active: 12, recovery: 42,
    damage: 220, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  SDM_TEKKYUU_DAI_BOUSOU: {
    startup: 8, active: 18, recovery: 40,
    damage: 320, hitstun: 0, blockstun: 22, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 蔡宝奇命令通常技 (Choi Bounge) ── APPROX based on KOF2002UM
  CHOI_SOUTEN_MEKKYAKU: {
    startup: 12, active: 5, recovery: 18,
    damage: 48, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  CHOI_SAN_REN_GEKI: {
    startup: 8, active: 5, recovery: 16,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 蔡宝奇必杀技 (Choi Bounge) ── APPROX based on KOF2002UM
  CHOI_HISHOU_KYAKU: {
    startup: 8, active: 8, recovery: 18,
    damage: 65, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CHOI_HISHOU_KYAKU_C: {
    startup: 10, active: 12, recovery: 22,
    damage: 95, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CHOI_KAITEN_HIEN_ZAN: {
    startup: 5, active: 6, recovery: 22,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  CHOI_KAITEN_HIEN_ZAN_C: {
    startup: 7, active: 10, recovery: 28,
    damage: 120, hitstun: 26, blockstun: 22, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  CHOI_HOUYOKU_TENSHIN: {
    startup: 6, active: 10, recovery: 24,
    damage: 90, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  // ── 蔡宝奇DM/SDM (Choi) ──
  DM_SHIN_CHOU_HOUYOKU: {
    startup: 8, active: 12, recovery: 40,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  SDM_SHIN_CHOU_HOUYOKU: {
    startup: 8, active: 18, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 玛卓命令通常技 (Mature) ── APPROX based on KOF2002UM
  MATURE_DESPAIR: {
    startup: 14, active: 4, recovery: 19,
    damage: 45, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  MATURE_JAB: {
    startup: 8, active: 4, recovery: 21,
    damage: 38, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 玛卓必杀技 (Mature) ── APPROX based on KOF2002UM
  MATURE_MASSACRE: {
    startup: 8, active: 8, recovery: 22,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 9,
  },
  MATURE_MASSACRE_C: {
    startup: 10, active: 12, recovery: 26,
    damage: 110, hitstun: 26, blockstun: 22, pushback: 7,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  MATURE_HEAVENS_GATE: {
    startup: 18, active: 6, recovery: 26,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true, chipDamage: 10,
  },
  MATURE_ECSTASY: {
    startup: 5, active: 6, recovery: 26,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 7,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // ── 玛卓DM (Mature) ──
  DM_NOCTURNAL_LIGHT: {
    startup: 8, active: 14, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 玛卓SDM (Mature) ──
  SDM_NOCTURNAL_LIGHT: {
    startup: 8, active: 20, recovery: 36,
    damage: 300, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 大门五郎必杀技 (Yashiro Nanakase) ── APPROX based on KOF2002UM
  YASHIRO_SHUU_WANI: {
    startup: 12, active: 4, recovery: 20,
    damage: 40, hitstun: 16, blockstun: 14, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  YASHIRO_JUU_ZUTSU: {
    startup: 18, active: 4, recovery: 22,
    damage: 45, hitstun: 18, blockstun: 15, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  YASHIRO_UPPER_DU: {
    startup: 8, active: 10, recovery: 24,
    damage: 60, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  YASHIRO_UPPER_DU_C: {
    startup: 10, active: 16, recovery: 28,
    damage: 95, hitstun: 26, blockstun: 22, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  YASHIRO_NIRAAI: {
    startup: 18, active: 6, recovery: 26,
    damage: 80, hitstun: 24, blockstun: 20, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true, chipDamage: 10,
  },
  YASHIRO_MUSATSU: {
    startup: 14, active: 6, recovery: 28,
    damage: 70, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 8,
  },
  // ── 大门五郎DM/SDM (Yashiro) ── APPROX based on KOF2002UM
  DM_ARMAGEDDON_BUSTERS: {
    startup: 10, active: 10, recovery: 42,
    damage: 230, hitstun: 0, blockstun: 22, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  SDM_ARMAGEDDON_BUSTERS: {
    startup: 8, active: 16, recovery: 40,
    damage: 330, hitstun: 0, blockstun: 22, pushback: 16,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 克里斯命令通常技 (Chris) ── APPROX based on KOF2002UM
  CHRIS_MAKASHIPPO: {
    startup: 10, active: 4, recovery: 18,
    damage: 38, hitstun: 16, blockstun: 14, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CHRIS_KAZAGURUMA: {
    startup: 8, active: 4, recovery: 20,
    damage: 35, hitstun: 14, blockstun: 12, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 克里斯必杀技 (Chris) ── APPROX based on KOF2002UM
  CHRIS_SHOT_WEAVE: {
    startup: 7, active: 4, recovery: 18,
    damage: 55, hitstun: 16, blockstun: 14, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CHRIS_SHOT_WEAVE_C: {
    startup: 10, active: 6, recovery: 22,
    damage: 72, hitstun: 20, blockstun: 16, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CHRIS_TWISTER_DRIVE: {
    startup: 12, active: 8, recovery: 28,
    damage: 78, hitstun: 22, blockstun: 18, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  CHRIS_SCRAMBLE_DASH: {
    startup: 8, active: 6, recovery: 24,
    damage: 60, hitstun: 18, blockstun: 15, pushback: 4,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 克里斯DM (Chris) ── APPROX based on KOF2002UM
  DM_CHAIN_SLIDE_TOUCH: {
    startup: 7, active: 14, recovery: 36,
    damage: 190, hitstun: 0, blockstun: 20, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 克里斯SDM (Chris) ── APPROX based on KOF2002UM
  SDM_CHAIN_SLIDE_TOUCH: {
    startup: 5, active: 20, recovery: 38,
    damage: 290, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 夏尔美命令通常技 (Shermie) ── APPROX based on KOF2002UM
  SHERMIE_STAND: {
    startup: 14, active: 4, recovery: 20,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  SHERMIE_CLASH: {
    startup: 8, active: 4, recovery: 22,
    damage: 38, hitstun: 16, blockstun: 14, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 夏尔美必杀技 (Shermie) ── APPROX based on KOF2002UM
  SHERMIE_SHOOT: {
    startup: 10, active: 6, recovery: 24,
    damage: 70, hitstun: 20, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  SHERMIE_SHOOT_C: {
    startup: 14, active: 10, recovery: 28,
    damage: 90, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  SHERMIE_CARNIVAL: {
    startup: 12, active: 5, recovery: 26,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  SHERMIE_AXLE_SPIN: {
    startup: 14, active: 6, recovery: 28,
    damage: 68, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 8,
  },
  // ── 夏尔美DM/SDM (Shermie) ── APPROX based on KOF2002UM
  DM_SHERMIE_CARNIVAL: {
    startup: 8, active: 16, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  SDM_SHERMIE_CARNIVAL: {
    startup: 6, active: 22, recovery: 40,
    damage: 310, hitstun: 0, blockstun: 24, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 薇丝命令通常技 (Vice) ── APPROX based on KOF2002UM
  VICE_MONSTROSITY: {
    startup: 12, active: 4, recovery: 20,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  VICE_OVERKILL: {
    startup: 8, active: 4, recovery: 22,
    damage: 38, hitstun: 16, blockstun: 14, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 薇丝必杀技 (Vice) ── APPROX based on KOF2002UM
  VICE_OUTRAGE: {
    startup: 9, active: 6, recovery: 22,
    damage: 68, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  VICE_OUTRAGE_C: {
    startup: 12, active: 8, recovery: 26,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 7,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  VICE_BLACK_END: {
    startup: 14, active: 6, recovery: 28,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 10,
  },
  VICE_MAYHEM: {
    startup: 12, active: 5, recovery: 26,
    damage: 72, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 8,
  },
  // ── 薇丝DM/SDM (Vice) ── APPROX based on KOF2002UM
  DM_NEGATIVE_GAIN: {
    startup: 8, active: 16, recovery: 38,
    damage: 210, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  SDM_NEGATIVE_GAIN: {
    startup: 6, active: 22, recovery: 40,
    damage: 320, hitstun: 0, blockstun: 24, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 布鲁·玛丽命令通常技 (Blue Mary) ── APPROX based on KOF2002UM
  MARY_HAMMER_PUNCH: {
    startup: 12, active: 4, recovery: 20,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  MARY_DOUBLE_ROLLING: {
    startup: 8, active: 4, recovery: 22,
    damage: 38, hitstun: 16, blockstun: 14, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 布鲁·玛丽必杀技 (Blue Mary) ── APPROX based on KOF2002UM
  MARY_STRAIGHT_SLICER: {
    startup: 9, active: 6, recovery: 22,
    damage: 68, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  MARY_STRAIGHT_SLICER_C: {
    startup: 12, active: 8, recovery: 26,
    damage: 85, hitstun: 22, blockstun: 18, pushback: 7,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  MARY_BACKDROP_REAL: {
    startup: 10, active: 5, recovery: 24,
    damage: 72, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 8,
  },
  MARY_SPIDER: {
    startup: 12, active: 6, recovery: 28,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 10,
  },
  // ── 布鲁·玛丽DM/SDM (Blue Mary) ── APPROX based on KOF2002UM
  DM_MARY_TYPHOON: {
    startup: 8, active: 16, recovery: 38,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  SDM_MARY_TYPHOON: {
    startup: 6, active: 22, recovery: 40,
    damage: 310, hitstun: 0, blockstun: 24, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
  // ── 李香绯命令通常技 (Li Xiangfei) ── APPROX based on KOF2002UM
  XIANGFEI_KYU_HO: {
    startup: 10, active: 4, recovery: 18,
    damage: 38, hitstun: 16, blockstun: 14, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  XIANGFEI_KAKU_DA: {
    startup: 8, active: 4, recovery: 20,
    damage: 35, hitstun: 14, blockstun: 12, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 李香绯必杀技 (Li Xiangfei) ── APPROX based on KOF2002UM
  XIANGFEI_NANPA: {
    startup: 7, active: 5, recovery: 18,
    damage: 58, hitstun: 18, blockstun: 14, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  XIANGFEI_NANPA_C: {
    startup: 10, active: 8, recovery: 24,
    damage: 78, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  XIANGFEI_TENPATSU: {
    startup: 12, active: 5, recovery: 26,
    damage: 70, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true, chipDamage: 8,
  },
  XIANGFEI_MAHO_HISHA: {
    startup: 10, active: 6, recovery: 24,
    damage: 68, hitstun: 18, blockstun: 14, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 8,
  },
  // ── 李香绯DM (Li Xiangfei) ── APPROX based on KOF2002UM
  DM_CHO_KA_RINGA: {
    startup: 7, active: 14, recovery: 36,
    damage: 190, hitstun: 0, blockstun: 20, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 李香绯SDM (Li Xiangfei) ── APPROX based on KOF2002UM
  SDM_CHO_KA_RINGA: {
    startup: 5, active: 20, recovery: 38,
    damage: 295, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 28,
  },
  // ── 山崎龙二命令通常技 (Yamazaki) ── APPROX based on KOF2002UM
  YAMAZAKI_SASHI: {
    startup: 14, active: 4, recovery: 22,
    damage: 45, hitstun: 18, blockstun: 16, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  YAMAZAKI_BOKKAI: {
    startup: 10, active: 4, recovery: 24,
    damage: 40, hitstun: 16, blockstun: 14, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 山崎龙二必杀技 (Yamazaki) ── APPROX based on KOF2002UM
  YAMAZAKI_SNAKE_ARM: {
    startup: 8, active: 6, recovery: 20,
    damage: 65, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  YAMAZAKI_SNAKE_ARM_C: {
    startup: 12, active: 10, recovery: 26,
    damage: 88, hitstun: 24, blockstun: 20, pushback: 7,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 12,
  },
  YAMAZAKI_SANDSTORM: {
    startup: 16, active: 5, recovery: 28,
    damage: 78, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true, chipDamage: 10,
  },
  YAMAZAKI_BAI_GA_SE: {
    startup: 10, active: 6, recovery: 24,
    damage: 72, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 8,
  },
  // ── 山崎龙二DM (Yamazaki) ── APPROX based on KOF2002UM
  DM_GUILLOTINE: {
    startup: 8, active: 14, recovery: 38,
    damage: 220, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 22,
  },
  // ── 山崎龙二SDM (Yamazaki) ── APPROX based on KOF2002UM
  SDM_GUILLOTINE: {
    startup: 6, active: 20, recovery: 40,
    damage: 340, hitstun: 0, blockstun: 24, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 32,
  },
  // ── 藤堂香澄命令通常技 (Kasumi Todoh) ── APPROX based on KOF2002UM
  KASUMI_KOU_U: {
    startup: 12, active: 4, recovery: 18,
    damage: 40, hitstun: 16, blockstun: 14, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KASUMI_GESHIKI: {
    startup: 8, active: 4, recovery: 20,
    damage: 36, hitstun: 14, blockstun: 12, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // ── 藤堂香澄必杀技 (Kasumi Todoh) ── APPROX based on KOF2002UM
  KASUMI_KOOU_KEN: {
    startup: 8, active: 6, recovery: 22,
    damage: 65, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  KASUMI_KOOU_KEN_C: {
    startup: 11, active: 8, recovery: 26,
    damage: 82, hitstun: 22, blockstun: 18, pushback: 7,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  KASUMI_KASANE_ATE: {
    startup: 10, active: 5, recovery: 24,
    damage: 70, hitstun: 20, blockstun: 16, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  KASUMI_MUKIGENZAN: {
    startup: 12, active: 6, recovery: 26,
    damage: 75, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'LOW' as const, knockdown: true, chipDamage: 10,
  },
  // ── 藤堂香澄DM (Kasumi Todoh) ── APPROX based on KOF2002UM
  DM_CHO_MUKIGENZAN: {
    startup: 7, active: 14, recovery: 36,
    damage: 195, hitstun: 0, blockstun: 22, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  // ── 藤堂香澄SDM (Kasumi Todoh) ── APPROX based on KOF2002UM
  SDM_CHO_MUKIGENZAN: {
    startup: 5, active: 20, recovery: 38,
    damage: 300, hitstun: 0, blockstun: 24, pushback: 14,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 30,
  },
} as const;
