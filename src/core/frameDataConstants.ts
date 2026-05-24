/**
 * Frame Data — startup/active/recovery/damage/hitstun/blockstun
 */
// ===== Frame Data Constants =====
// 数据源: SuperCombo Wiki KOF2002 原版 (非UM)
// hitLevel: MID=站蹲都能挡, LOW=只能蹲防, HIGH=只能站防
// knockdown: true = 击倒 (进入KNOCKDOWN状态)
// 通常技基于KOF2002UM Kyo数据 (Dream Cancel Wiki), startup含首帧active
// KOF通用: light hitstun=11F blockstun=9F, heavy ground=19F/17F, heavy air=11F/17F
export const FRAME_DATA = {
  // ── 远距离站立 (Far Stand) ── SuperCombo Wiki KOF2002 average
  STAND_A: {
    startup: 6, active: 3, recovery: 5,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_B: {
    startup: 7, active: 3, recovery: 14,
    damage: 42, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_C: {
    startup: 7, active: 3, recovery: 20,
    damage: 100, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_D: {
    startup: 10, active: 8, recovery: 20,
    damage: 75, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 近距离站立 (Close Stand) ── SuperCombo Wiki KOF2002
  CLOSE_A: {
    startup: 4, active: 5, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_B: {
    startup: 5, active: 3, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CLOSE_C: {
    startup: 2, active: 5, recovery: 11,
    damage: 100, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_D: {
    startup: 5, active: 6, recovery: 13,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 命令通常技 (Command Normals) ──
  CMD_GOFU_YOU: {
    startup: 22, active: 3, recovery: 20,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  CMD_88SHIKI: {
    startup: 7, active: 4, recovery: 24,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CMD_NARAKU: {
    startup: 6, active: 5, recovery: 4,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // ── 蹲下攻击 (Crouch) ── SuperCombo Wiki KOF2002
  CROUCH_A: {
    startup: 5, active: 4, recovery: 7,
    damage: 17, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_B: {
    startup: 5, active: 5, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CROUCH_C: {
    startup: 7, active: 5, recovery: 16,
    damage: 90, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_D: {
    startup: 5, active: 6, recovery: 31,
    damage: 75, hitstun: 0, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: true,
  },
  // ── 跳跃攻击 (Jump) ── SuperCombo Wiki KOF2002: air hitstun=11F
  JUMP_A: {
    startup: 3, active: 9, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_B: {
    startup: 4, active: 7, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_C: {
    startup: 8, active: 3, recovery: 0,
    damage: 58, hitstun: 11, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_D: {
    startup: 5, active: 5, recovery: 0,
    damage: 25, hitstun: 11, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 投技 ── KOF2002: throw = 3f startup, 2f active, ~20f recovery
  THROW: {
    startup: 3, active: 2, recovery: 20,
    damage: 100, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  THROW_FORWARD: {
    startup: 3, active: 2, recovery: 22,
    damage: 110, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  THROW_BACK: {
    startup: 3, active: 2, recovery: 22,
    damage: 120, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── 必杀技通用 ── KOF2002: fireball hitstun=31, blockstun=29
  SPECIAL_PROJECTILE: {
    startup: 10, active: 20, recovery: 32,
    damage: 90, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 9,
  },
  SPECIAL_UPPER: {
    startup: 5, active: 6, recovery: 22,
    damage: 120, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // ── CD击飞攻击 ── SuperCombo Wiki KOF2002: Iori CD=11f/5f/24f
  STAND_CD: {
    startup: 11, active: 5, recovery: 24,
    damage: 83, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, counterWire: true as const,
  },
  JUMP_CD: {
    startup: 12, active: 4, recovery: 0,
    damage: 33, hitstun: 0, blockstun: 21, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true, counterWire: true as const,
  },
  // ── 超必杀技 (DM) ──
  DM_OROCHINAGI: {
    startup: 20, active: 17, recovery: 27,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  // ── 京专属必杀技 (Kyo Kusanagi) ── SuperCombo KOF2002/Kyo
  // 75式・改 qcf+B/D + followup
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
  // R.E.D. Kick rdp+B/D (正版: B=18f, D=29f startup)
  KYO_RED_KICK: {
    startup: 18, active: 6, recovery: 18,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // 鬼焼き dp+A (正版: 5f startup, single hit)
  KYO_ONIYAKI: {
    startup: 5, active: 4, recovery: 27,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 鬼焼き dp+C (正版: 7f startup, multi-hit, fully invincible)
  KYO_ONIYAKI_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // 闇払い qcf+A (正版: 10f startup, slow projectile)
  KYO_YAMIBARAI: {
    startup: 10, active: 20, recovery: 30,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  // 闇払い qcf+C (正版: 11f startup, fast projectile)
  KYO_YAMIBARAI_C: {
    startup: 11, active: 22, recovery: 28,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 荒咬み qcf+A (正版: 11f startup, guard point frame 10-11)
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
  // 毒咬み qcf+C (正版: 17f startup)
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
  // ── 八神庵必杀技 (Iori Yagami) ── SuperCombo KOF2002/Iori
  // 葵花 x3 qcb+A/C (正版: A1=8f, A2=7f, A3=17f startup)
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
  // 闇払い qcf+A/C (正版: A=10f, C=9f startup)
  IORI_YAMIBARAI: {
    startup: 10, active: 20, recovery: 39,
    damage: 70, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  // 闇払い qcf+C (fast projectile)
  IORI_YAMIBARAI_C: {
    startup: 11, active: 22, recovery: 37,
    damage: 100, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 鬼焼き dp+A (weak upper, single hit)
  IORI_ONIYAKI: {
    startup: 5, active: 5, recovery: 25,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 鬼焼き dp+C (strong upper, multi-hit, invincible)
  IORI_ONIYAKI_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // 琴月陰 hcb+B/D (正版: 6f startup, half/full screen dash)
  IORI_KOTOTSUKI: {
    startup: 6, active: 16, recovery: 14,
    damage: 95, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 屑風 hcb,f+P (正版: 11f startup, command throw)
  IORI_KUZUKAZE: {
    startup: 11, active: 1, recovery: 31,
    damage: 10, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 特瑞必杀技 (Terry Bogard) ── SuperCombo KOF2002/Terry
  // Power Wave qcf+A (正版: 14f startup, ground projectile)
  TERRY_POWER_WAVE: {
    startup: 14, active: 20, recovery: 32,
    damage: 85, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  // Burn Knuckle qcb+A/C (正版: A=13f, C=20f startup)
  TERRY_BURN_KNUCKLE: {
    startup: 13, active: 10, recovery: 18,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // Crack Shoot qcb+B/D (正版: B=10f startup, anti-air)
  TERRY_CRACK_SHOT: {
    startup: 10, active: 5, recovery: 21,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // Power Dunk dp+B/D (正版: B=6f startup, upper body invincible)
  TERRY_POWER_DUNK: {
    startup: 6, active: 6, recovery: 25,
    damage: 100, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // Rising Tackle d,u+A/C (正版: 5f startup, charge)
  TERRY_RISING_TACKLE: {
    startup: 5, active: 12, recovery: 35,
    damage: 105, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // ── 金必杀技 (Kim Kaphwan) ── SuperCombo KOF2002/Kim
  // 飛燕斬 d,u+B/D (正版: B=6f, D=5f startup, anti-air)
  KIM_HIENZAN: {
    startup: 5, active: 6, recovery: 25,
    damage: 100, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // 半月斬 qcb+B/D (正版: B=16f, D=7f startup)
  KIM_HANGETSU: {
    startup: 7, active: 12, recovery: 29,
    damage: 80, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 覇気脚 d,d+B/D (正版: B=9f, D=15f startup, low)
  KIM_HAKI: {
    startup: 9, active: 5, recovery: 20,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // 飛翔脚 j.qcf+B/D (正版: 2f startup, air dive)
  KIM_HISHOU: {
    startup: 2, active: 8, recovery: 14,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 三連撃 qcb+A/C chain (正版: 8f startup)
  KIM_SANREN: {
    startup: 8, active: 6, recovery: 24,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── DM超必杀技 ── 正版数据
  // 八神: 闇菖蒲 (正版: 1+5f startup, dash grab DM)
  DM_YATAGARASU: {
    startup: 6, active: 16, recovery: 42,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // 特瑞: Power Geyser (正版: 17f startup, invincible frame 1-14)
  DM_POWER_GEYSER: {
    startup: 17, active: 10, recovery: 43,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 16,
  },
  // 金: 鳳凰脚 (正版: 1+7f startup, dash DM)
  DM_PHOENIX_KICK: {
    startup: 8, active: 13, recovery: 43,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 17,
  },
  // 特瑞: High Angle Geyser (正版: 6f startup)
  DM_HIGH_ANGLE_GEYSER: {
    startup: 6, active: 12, recovery: 33,
    damage: 180, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 15,
  },
  // 金: 鳳凰天舞脚 (正版: 1+7f startup, anti-air)
  DM_PHOENIX_HITEN: {
    startup: 8, active: 5, recovery: 30,
    damage: 180, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // ── 坂崎亮必杀技 (Ryo Sakazaki) ── SuperCombo KOF2002/Ryo
  // 虎煌 qcf+A (weak projectile)
  RYO_KOOU: {
    startup: 12, active: 18, recovery: 34,
    damage: 75, hitstun: 28, blockstun: 26, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 8,
  },
  // 虎煌 qcf+C (strong projectile, faster)
  RYO_KOOU_C: {
    startup: 13, active: 20, recovery: 32,
    damage: 105, hitstun: 30, blockstun: 28, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 虎咆 dp+A (weak upper, single hit)
  RYO_KO_HOU: {
    startup: 5, active: 5, recovery: 25,
    damage: 80, hitstun: 22, blockstun: 18, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 10,
  },
  // 虎咆 dp+C (strong upper, multi-hit, invincible)
  RYO_KO_HOU_C: {
    startup: 7, active: 10, recovery: 30,
    damage: 140, hitstun: 28, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 14,
  },
  // 飛燕疾風脚 qcb+K (overhead kick)
  RYO_HIEN: {
    startup: 10, active: 8, recovery: 22,
    damage: 95, hitstun: 24, blockstun: 20, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // 霸王翔吼拳 qcf+K (counter stance)
  RYO_HAOU: {
    startup: 6, active: 12, recovery: 18,
    damage: 60, hitstun: 20, blockstun: 16, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // DM: 天地霸煌拳
  DM_TEN_HA_OU: {
    startup: 10, active: 6, recovery: 35,
    damage: 200, hitstun: 0, blockstun: 22, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  // ── 莉安娜必杀技 (Leona Heidern) ── SuperCombo KOF2002/Leona
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
  // 新DM
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
  // ── 超必杀技SDM (Super Desperation Moves — MAX mode only) ──
  // KOF2002: SDM does ~50% more damage than DM, costs extra stock
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
} as const;

