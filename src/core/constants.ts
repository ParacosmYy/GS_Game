// ===== Stage Constants =====
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// ===== Round Timer =====
export const ROUND_TIME = 99;
export const STAGE_WIDTH = 1400;
export const STAGE_GROUND_Y = 510;

// ===== Physics Constants =====
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -14;

// ===== Fighter Constants =====
export const FIGHTER_WIDTH = 80;
export const FIGHTER_HEIGHT = 200;
export const STAGE_LEFT = FIGHTER_WIDTH / 2;
export const STAGE_RIGHT = STAGE_WIDTH - FIGHTER_WIDTH / 2;
export const WALK_SPEED = 4;
export const RUN_SPEED = 7;
export const BACKDASH_VX = 8;
export const BACKDASH_VY = -8;
export const BACKDASH_DURATION = 18;
export const DOUBLE_TAP_WINDOW = 12;
export const RUN_JUMP_VX = 8;
export const RUN_JUMP_VY = -13;
export const HOP_THRESHOLD = 6;       // 短按↑ <=6帧 = 小跳
export const HOP_VELOCITY = -10;      // 小跳垂直速度 (低于普通跳)
export const HYPER_JUMP_VY = -17;     // 大跳垂直速度 (高于普通跳)
export const HYPER_JUMP_VX = 7;       // 大跳水平速度
export const HYPER_CHARGE_WINDOW = 10; // ↓→↑ 窗口帧数
export const ROLL_SPEED = 6;
export const ROLL_DURATION = 20;      // 滚动持续帧
export const ROLL_INVINCIBLE_END = 15; // 无敌结束帧 (0~15帧无敌)
export const ROLL_RECOVERY = 3;       // 滚动结束恢复帧
export const PUSH_BOX_WIDTH = 60;
export const MAX_HEALTH = 1000;

// ===== Input Constants =====
export const COMMAND_WINDOW = 18;          // 单个搓招窗口（正版KOF ≈ 16-20帧）
export const HCF_WINDOW = 28;              // 半圆指令窗口（↓↙←↙↓↘→）
export const DOUBLE_QCF_WINDOW = 30;       // 双QCF指令窗口（正版KOF UM DM窗口 ≈ 28-32帧）

// ===== Game Loop Constants =====
export const TICK_RATE = 1000 / 60;
export const MAX_FRAME_DELTA = 250;

// ===== Frame Data Constants =====
// 数据源: SuperCombo Wiki KOF2002 原版 (非UM)
// hitLevel: MID=站蹲都能挡, LOW=只能蹲防, HIGH=只能站防
// knockdown: true = 击倒 (进入KNOCKDOWN状态)
// 通常技基于KOF2002UM Kyo数据 (Dream Cancel Wiki), startup含首帧active
// KOF通用: light hitstun=11F blockstun=9F, heavy ground=19F/17F, heavy air=11F/17F
export const FRAME_DATA = {
  // ── 远距离站立 (Far Stand) ── KOF2002UM Kyo (Dream Cancel Wiki)
  STAND_A: {
    startup: 5, active: 4, recovery: 5,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_B: {
    startup: 6, active: 3, recovery: 14,
    damage: 42, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_C: {
    startup: 8, active: 5, recovery: 17,
    damage: 100, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_D: {
    startup: 13, active: 2, recovery: 17,
    damage: 75, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 近距离站立 (Close Stand) ── KOF2002UM Kyo
  CLOSE_A: {
    startup: 5, active: 4, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_B: {
    startup: 7, active: 4, recovery: 8,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CLOSE_C: {
    startup: 5, active: 3, recovery: 22,
    damage: 100, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_D: {
    startup: 5, active: 4, recovery: 5,
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
  // ── 蹲下攻击 (Crouch) ── KOF2002UM Kyo
  CROUCH_A: {
    startup: 5, active: 4, recovery: 5,
    damage: 17, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_B: {
    startup: 7, active: 4, recovery: 8,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CROUCH_C: {
    startup: 6, active: 5, recovery: 17,
    damage: 90, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_D: {
    startup: 11, active: 3, recovery: 19,
    damage: 75, hitstun: 0, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: true,
  },
  // ── 跳跃攻击 (Jump) ── KOF2002: air hitstun=11F, air heavy blockstun=17F
  JUMP_A: {
    startup: 5, active: 7, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_B: {
    startup: 5, active: 7, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_C: {
    startup: 12, active: 6, recovery: 0,
    damage: 58, hitstun: 11, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_D: {
    startup: 18, active: 6, recovery: 0,
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
  // ── CD击飞攻击 ── KOF2002UM Kyo: CD=20f startup/2f active/27f recovery
  STAND_CD: {
    startup: 20, active: 2, recovery: 27,
    damage: 83, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, counterWire: true as const,
  },
  JUMP_CD: {
    startup: 11, active: 3, recovery: 0,
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
} as const;

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
} as const;

// ===== Throw Constants =====
export const THROW_RANGE = 100;
export const THROW_DISTANCE = 130;

// ===== Projectile Constants =====
export const PROJECTILE_SPEED = 8;

// ===== Landing Recovery =====
export const LANDING_RECOVERY = 2;

// ===== KO Constants =====
export const KO_DISPLAY_TIME = 120;

// ===== Chip Damage Multiplier (blocked specials deal X% of damage) =====
export const CHIP_DAMAGE_RATIO = 0.1;

// ===== Counter Hit =====
export const CH_HITSTUN_BONUS = 1.5;   // Counter Hit 硬直x1.5
export const CH_DAMAGE_BONUS = 1.25;   // Counter Hit 伤害x1.25

// ===== Juggle Points (KOF2002 authentic: juggle budget per launch) =====
export const JUGGLE_POINTS_MAX = 5;           // total juggle points per launch
export const JUGGLE_COST_LIGHT = 1;           // A/B normals cost 1
export const JUGGLE_COST_HEAVY = 2;           // C/D normals cost 2
export const JUGGLE_COST_SPECIAL = 2;         // specials cost 2
export const JUGGLE_COST_DM = 3;              // DMs cost 3

// ===== Counter Wire (墙弹) =====
export const COUNTER_WIRE_BOUNCE_VX = 8;   // Wall bounce horizontal speed
export const COUNTER_WIRE_BOUNCE_VY = -6;  // Wall bounce vertical speed (upward)

// ===== Damage Scaling =====
export const DAMAGE_SCALE_STEP = 0.10;  // 每连击递减10%
export const DAMAGE_SCALE_MIN = 0.10;   // 最低10%伤害 (KOF 2002标准)

// ===== Power Gauge (能量槽) =====
export const MAX_STOCKS = 5;
export const METER_PER_STOCK = 100;
export const METER_GAIN_HIT = 100;
export const METER_GAIN_BLOCK = 20;
export const METER_GAIN_WHIFF = 10;
export const METER_GAIN_HITSTUN = 50;
export const DM_STOCK_COST = 1;

// ===== MAX Mode =====
export const MAX_MODE_DURATION = 720;     // 12秒 @60fps
export const MAX_MODE_STOCK_COST = 1;
export const MAX_MODE_DMG_REDUCTION = 0.75;

// ===== Advanced Cancel Mechanics =====
export const PROXIMITY_GUARD_RANGE = 120;        // 仅近距离触发proximity guard (正版KOF ≈ close range)
export const SUPER_CANCEL_STOCK_COST = 1;         // Extra stock for super cancel
export const FREE_CANCEL_TIMER_COST = 0.20;       // 20% of MAX mode timer per free cancel

// ===== Rapid Cancel (轻攻击链) =====
// KOF 2002 authentic: light normals (A/B) on HIT can chain into other light normals

/** Light normal attack types (A/B button normals) */
export const LIGHT_NORMALS: ReadonlySet<string> = new Set([
  'STAND_A', 'STAND_B',
  'CLOSE_A', 'CLOSE_B',
  'CROUCH_A', 'CROUCH_B',
  'JUMP_A', 'JUMP_B',
]);

/** Grounded normal attack types (stand/close/crouch, NOT command normals or specials or DMs) */
export const NORMAL_ATTACKS: ReadonlySet<string> = new Set([
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
]);

/** Command normal attack types (→+B, ↘+D, air↓+C, etc.) */
export const COMMAND_NORMALS: ReadonlySet<string> = new Set([
  'CMD_GOFU_YOU',
  'CMD_88SHIKI',
  'CMD_NARAKU',
]);

// ===== Throw Invincibility (KOF 2002 authentic) =====
export const THROW_INVINCIBILITY_POST_STUN = 9;    // Frames after blockstun/hitstun
export const THROW_INVINCIBILITY_WAKEUP = 8;        // Frames on wakeup from knockdown
export const THROW_INVINCIBILITY_JUMP_STARTUP = 4;  // Frames during jump startup
export const THROW_INVINCIBILITY_LANDING = 2;       // Frames on landing

// ===== HUD Layout =====
export const HUD_BAR_WIDTH = 300;
export const HUD_BAR_HEIGHT = 20;
export const HUD_BAR_Y = 30;
export const HUD_MARGIN = 50;
export const HUD_TIMER_SIZE = 32;
export const HUD_GAUGE_Y = 570;
export const HUD_GAUGE_WIDTH = 200;
export const HUD_GAUGE_HEIGHT = 8;
export const HUD_GAUGE_SEGMENT_GAP = 2;
export const HUD_WIN_MARKER_SIZE = 5;
