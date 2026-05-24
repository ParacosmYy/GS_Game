/**
 * Hitbox Offsets — attack box positions relative to fighter
 */
// ===== Hitbox Offsets (relative to fighter position, facing right) =====
// Scaled for larger character proportions (displayHeight=200)
export const HITBOX_OFFSETS = {
  // 远距离站立 — 拳(A/C)偏高, 脚(B/D)偏低
  STAND_A: { offsetX: 65, offsetY: -150, width: 60, height: 35 },
  STAND_B: { offsetX: 65, offsetY: -70, width: 75, height: 40 },
  STAND_C: { offsetX: 65, offsetY: -140, width: 80, height: 45 },
  STAND_D: { offsetX: 65, offsetY: -60, width: 85, height: 50 },
  // 近距离 — 更近更窄
  CLOSE_A: { offsetX: 55, offsetY: -140, width: 50, height: 35 },
  CLOSE_B: { offsetX: 50, offsetY: -50, width: 55, height: 35 },
  CLOSE_C: { offsetX: 55, offsetY: -130, width: 60, height: 45 },
  CLOSE_D: { offsetX: 55, offsetY: -50, width: 65, height: 45 },
  // 命令通常技
  CMD_GOFU_YOU: { offsetX: 60, offsetY: -110, width: 75, height: 45 },
  CMD_88SHIKI: { offsetX: 70, offsetY: -15, width: 80, height: 25 },
  CMD_NARAKU: { offsetX: 40, offsetY: -70, width: 60, height: 55 },
  // Iori 命令通常技
  IORI_YUMEYUMI: { offsetX: 55, offsetY: -105, width: 70, height: 40 },
  IORI_KATANUGI: { offsetX: 65, offsetY: -25, width: 75, height: 25 },
  IORI_YUKIWARUI: { offsetX: 35, offsetY: -75, width: 65, height: 50 },
  // Terry 命令通常技
  TERRY_BACK_KNCKLE: { offsetX: 60, offsetY: -100, width: 75, height: 40 },
  TERRY_COMBO_BLOW: { offsetX: 65, offsetY: -20, width: 75, height: 25 },
  // Kim 命令通常技
  KIM_HISHOU_KICK: { offsetX: 60, offsetY: -115, width: 80, height: 40 },
  KIM_HANSEN: { offsetX: 70, offsetY: -30, width: 85, height: 35 },
  // Ryo 命令通常技
  RYO_TSURIZAO: { offsetX: 55, offsetY: -105, width: 70, height: 40 },
  RYO_ORISHI: { offsetX: 65, offsetY: -20, width: 75, height: 25 },
  // K' 命令通常技
  KDASH_ONE_INCH: { offsetX: 50, offsetY: -100, width: 65, height: 40 },
  KDASH_TRIGGER: { offsetX: 65, offsetY: -25, width: 75, height: 30 },
  // Kula 命令通常技
  KULA_ONE_MORE: { offsetX: 55, offsetY: -105, width: 70, height: 40 },
  KULA_SLIDER: { offsetX: 70, offsetY: -15, width: 85, height: 25 },
  // Leona 命令通常技
  LEONA_STRIKE_ARC: { offsetX: 55, offsetY: -110, width: 75, height: 40 },
  LEONA_STRIKE_DASH: { offsetX: 40, offsetY: -80, width: 60, height: 55 },
  // 蹲下 — 低位置
  CROUCH_A: { offsetX: 65, offsetY: -70, width: 55, height: 30 },
  CROUCH_B: { offsetX: 65, offsetY: -30, width: 75, height: 30 },
  CROUCH_C: { offsetX: 60, offsetY: -110, width: 75, height: 50 },
  CROUCH_D: { offsetX: 70, offsetY: -20, width: 80, height: 30 },
  // 跳跃 — 空中位置
  JUMP_A: { offsetX: 50, offsetY: -90, width: 55, height: 40 },
  JUMP_B: { offsetX: 50, offsetY: -60, width: 60, height: 45 },
  JUMP_C: { offsetX: 45, offsetY: -100, width: 65, height: 50 },
  JUMP_D: { offsetX: 45, offsetY: -70, width: 70, height: 50 },
  // 投技 & 必杀技
  THROW: { offsetX: 15, offsetY: -120, width: 90, height: 75 },
  THROW_FORWARD: { offsetX: 15, offsetY: -120, width: 90, height: 75 },
  THROW_BACK: { offsetX: 15, offsetY: -120, width: 90, height: 75 },
  SPECIAL_PROJECTILE: { offsetX: 65, offsetY: -120, width: 55, height: 40 },
  SPECIAL_UPPER: { offsetX: 40, offsetY: -160, width: 60, height: 65 },
  // CD击飞攻击
  STAND_CD: { offsetX: 60, offsetY: -100, width: 80, height: 55 },
  JUMP_CD: { offsetX: 55, offsetY: -70, width: 70, height: 50 },
  // 超必杀技
  DM_OROCHINAGI: { offsetX: 55, offsetY: -130, width: 110, height: 80 },
  // 京专属 (Kyo)
  KYO_75KAI: { offsetX: 55, offsetY: -60, width: 75, height: 40 },
  KYO_75KAI_2: { offsetX: 60, offsetY: -90, width: 75, height: 45 },
  KYO_RED_KICK: { offsetX: 55, offsetY: -100, width: 75, height: 50 },
  KYO_ONIYAKI: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  KYO_ONIYAKI_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  KYO_YAMIBARAI: { offsetX: 70, offsetY: -110, width: 55, height: 40 },
  KYO_YAMIBARAI_C: { offsetX: 70, offsetY: -110, width: 58, height: 42 },
  KYO_ARAGAMI: { offsetX: 62, offsetY: -130, width: 65, height: 45 },
  KYO_ARAGAMI_KONOKIZU: { offsetX: 60, offsetY: -110, width: 65, height: 40 },
  KYO_ARAGAMI_YANOSABI: { offsetX: 55, offsetY: -150, width: 60, height: 65 },
  KYO_DOKUGAMI: { offsetX: 65, offsetY: -120, width: 75, height: 45 },
  KYO_TSUMIYOMI: { offsetX: 60, offsetY: -110, width: 63, height: 40 },
  KYO_BATSUYOMI: { offsetX: 60, offsetY: -140, width: 65, height: 50 },
  KYO_NANASE: { offsetX: 62, offsetY: -70, width: 75, height: 50 },
  KYO_KOTO_TSUKI: { offsetX: 70, offsetY: -110, width: 80, height: 50 },
  KYO_YAKISOGI: { offsetX: 55, offsetY: -140, width: 60, height: 55 },
  // 八神庵 (Iori)
  IORI_AOIHANA: { offsetX: 60, offsetY: -110, width: 65, height: 45 },
  IORI_AOIHANA_2: { offsetX: 60, offsetY: -40, width: 65, height: 35 },
  IORI_AOIHANA_3: { offsetX: 55, offsetY: -130, width: 65, height: 65 },
  IORI_YAMIBARAI: { offsetX: 70, offsetY: -110, width: 55, height: 40 },
  IORI_YAMIBARAI_C: { offsetX: 70, offsetY: -110, width: 58, height: 42 },
  IORI_ONIYAKI: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  IORI_ONIYAKI_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  IORI_KOTOTSUKI: { offsetX: 65, offsetY: -100, width: 75, height: 50 },
  IORI_KUZUKAZE: { offsetX: 15, offsetY: -120, width: 90, height: 75 },
  // 特瑞 (Terry)
  TERRY_POWER_WAVE: { offsetX: 70, offsetY: -100, width: 60, height: 40 },
  TERRY_BURN_KNUCKLE: { offsetX: 65, offsetY: -110, width: 80, height: 45 },
  TERRY_CRACK_SHOT: { offsetX: 60, offsetY: -90, width: 75, height: 50 },
  TERRY_POWER_DUNK: { offsetX: 45, offsetY: -150, width: 60, height: 65 },
  TERRY_RISING_TACKLE: { offsetX: 45, offsetY: -160, width: 60, height: 70 },
  // 金 (Kim)
  KIM_HIENZAN: { offsetX: 45, offsetY: -160, width: 60, height: 70 },
  KIM_HANGETSU: { offsetX: 60, offsetY: -100, width: 75, height: 55 },
  KIM_HAKI: { offsetX: 65, offsetY: -20, width: 75, height: 30 },
  KIM_HISHOU: { offsetX: 45, offsetY: -80, width: 65, height: 50 },
  KIM_SANREN: { offsetX: 60, offsetY: -110, width: 65, height: 45 },
  // DM超必杀技
  DM_YATAGARASU: { offsetX: 45, offsetY: -120, width: 90, height: 70 },
  DM_POWER_GEYSER: { offsetX: 55, offsetY: -110, width: 105, height: 65 },
  DM_PHOENIX_KICK: { offsetX: 55, offsetY: -100, width: 90, height: 70 },
  DM_HIGH_ANGLE_GEYSER: { offsetX: 45, offsetY: -130, width: 90, height: 65 },
  DM_PHOENIX_HITEN: { offsetX: 55, offsetY: -130, width: 85, height: 65 },
  // 坂崎亮 (Ryo)
  RYO_KOOU: { offsetX: 70, offsetY: -110, width: 55, height: 40 },
  RYO_KOOU_C: { offsetX: 70, offsetY: -110, width: 58, height: 42 },
  RYO_KO_HOU: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  RYO_KO_HOU_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  RYO_HIEN: { offsetX: 55, offsetY: -110, width: 65, height: 50 },
  RYO_HAOU: { offsetX: 60, offsetY: -120, width: 63, height: 50 },
  DM_TEN_HA_OU: { offsetX: 45, offsetY: -130, width: 90, height: 70 },
  // 莉安娜 (Leona)
  LEONA_MOON_SLASH: { offsetX: 70, offsetY: -110, width: 55, height: 40 },
  LEONA_MOON_SLASH_C: { offsetX: 70, offsetY: -110, width: 58, height: 42 },
  LEONA_EAR_RING: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  LEONA_EAR_RING_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  LEONA_GRAND_SABER: { offsetX: 62, offsetY: -110, width: 70, height: 45 },
  LEONA_BALTIC: { offsetX: 60, offsetY: -50, width: 65, height: 40 },
  DM_V_SLASHER: { offsetX: 45, offsetY: -130, width: 88, height: 70 },
  // K' (K Dash)
  KDASH_EINS: { offsetX: 70, offsetY: -110, width: 58, height: 40 },
  KDASH_EINS_C: { offsetX: 70, offsetY: -110, width: 60, height: 42 },
  KDASH_CROW: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  KDASH_CROW_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  KDASH_MINUTE: { offsetX: 55, offsetY: -100, width: 65, height: 50 },
  KDASH_NARROW: { offsetX: 60, offsetY: -50, width: 65, height: 40 },
  DM_CHAIN_SHOT: { offsetX: 45, offsetY: -130, width: 90, height: 70 },
  // 库拉 (Kula)
  KULA_BREATH: { offsetX: 70, offsetY: -110, width: 58, height: 40 },
  KULA_BREATH_C: { offsetX: 70, offsetY: -110, width: 60, height: 42 },
  KULA_SHELL: { offsetX: 40, offsetY: -160, width: 60, height: 70 },
  KULA_SHELL_C: { offsetX: 40, offsetY: -160, width: 65, height: 80 },
  KULA_LAY: { offsetX: 60, offsetY: -50, width: 75, height: 40 },
  KULA_EDGE: { offsetX: 62, offsetY: -50, width: 65, height: 38 },
  DM_FREEZE: { offsetX: 45, offsetY: -130, width: 90, height: 70 },
  // ── SDM hitboxes (larger than DM) ──
  SDM_OROCHINAGI: { offsetX: 50, offsetY: -120, width: 100, height: 80 },
  SDM_YATAGARASU: { offsetX: 45, offsetY: -140, width: 95, height: 85 },
  SDM_POWER_GEYSER: { offsetX: 50, offsetY: -120, width: 100, height: 80 },
  SDM_PHOENIX_KICK: { offsetX: 50, offsetY: -130, width: 95, height: 80 },
  SDM_TEN_HA_OU: { offsetX: 50, offsetY: -120, width: 100, height: 80 },
  SDM_V_SLASHER: { offsetX: 45, offsetY: -140, width: 95, height: 85 },
  SDM_CHAIN_SHOT: { offsetX: 50, offsetY: -130, width: 95, height: 80 },
  SDM_FREEZE: { offsetX: 50, offsetY: -130, width: 100, height: 80 },
} as const;
