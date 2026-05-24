// ===== Stage Constants =====
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// ===== Round Timer =====
export const ROUND_TIME = 99;
export const STAGE_WIDTH = 1400;
export const STAGE_GROUND_Y = 480;

// ===== Physics Constants =====
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -14;

// ===== Fighter Constants =====
export const FIGHTER_WIDTH = 60;
export const FIGHTER_HEIGHT = 100;
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
// hitLevel: MID=站蹲都能挡, LOW=只能蹲防, HIGH=只能站防
// knockdown: true = 击倒 (进入KNOCKDOWN状态)
export const FRAME_DATA = {
  // ── 站立攻击 (Stand) ──
  STAND_A: {
    startup: 3, active: 3, recovery: 5,
    damage: 30, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_B: {
    startup: 4, active: 3, recovery: 7,
    damage: 35, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_C: {
    startup: 7, active: 4, recovery: 12,
    damage: 80, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_D: {
    startup: 8, active: 5, recovery: 14,
    damage: 75, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 近距离站立 (Close Stand) — 更快但更短 ──
  CLOSE_A: {
    startup: 3, active: 3, recovery: 4,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_B: {
    startup: 4, active: 3, recovery: 6,
    damage: 30, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CLOSE_C: {
    startup: 2, active: 3, recovery: 9,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_D: {
    startup: 4, active: 4, recovery: 12,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 命令通常技 (Command Normals) ──
  CMD_GOFU_YOU: {
    startup: 10, active: 4, recovery: 14,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,  // overhead
  },
  CMD_88SHIKI: {
    startup: 7, active: 3, recovery: 16,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CMD_NARAKU: {
    startup: 5, active: 5, recovery: 4,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,  // 空中KD
  },
  // ── 蹲下攻击 (Crouch) ──
  CROUCH_A: {
    startup: 3, active: 3, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_B: {
    startup: 4, active: 3, recovery: 7,
    damage: 35, hitstun: 11, blockstun: 9, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CROUCH_C: {
    startup: 5, active: 4, recovery: 15,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_D: {
    startup: 7, active: 4, recovery: 18,
    damage: 60, hitstun: 0, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: true, // 扫堂腿 = 击倒
  },
  // ── 跳跃攻击 (Jump) — jumping heavy hitstun=11 (LESS than ground), blockstun=17 (SAME) ──
  JUMP_A: {
    startup: 4, active: 5, recovery: 4,
    damage: 40, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_B: {
    startup: 4, active: 5, recovery: 4,
    damage: 45, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_C: {
    startup: 5, active: 6, recovery: 5,
    damage: 70, hitstun: 11, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_D: {
    startup: 6, active: 6, recovery: 5,
    damage: 65, hitstun: 11, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 投技 ──
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
  // ── 必杀技 ──
  SPECIAL_PROJECTILE: {
    startup: 10, active: 20, recovery: 15,
    damage: 90, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 9,
  },
  SPECIAL_UPPER: {
    startup: 3, active: 6, recovery: 18,
    damage: 120, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 12,
  },
  // ── CD击飞攻击 ──
  STAND_CD: {
    startup: 14, active: 4, recovery: 18,
    damage: 70, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, counterWire: true as const,
  },
  JUMP_CD: {
    startup: 12, active: 5, recovery: 8,
    damage: 60, hitstun: 0, blockstun: 21, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true, counterWire: true as const,
  },
  // ── 超必杀技 (DM) ──
  DM_OROCHINAGI: {
    startup: 8, active: 30, recovery: 20,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
  // ── 京专属必杀技 (Kyo Kusanagi) ──
  KYO_75KAI: {
    startup: 5, active: 4, recovery: 8,
    damage: 40, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_75KAI_2: {
    startup: 3, active: 4, recovery: 10,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_RED_KICK: {
    startup: 10, active: 5, recovery: 16,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // 荒咬み系
  KYO_ARAGAMI: {
    startup: 6, active: 4, recovery: 10,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_ARAGAMI_KONOKIZU: {
    startup: 4, active: 4, recovery: 8,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_ARAGAMI_YANOSABI: {
    startup: 8, active: 5, recovery: 14,
    damage: 70, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,  // overhead uppercut
  },
  // 毒咬み系
  KYO_DOKUGAMI: {
    startup: 7, active: 4, recovery: 12,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_TSUMIYOMI: {
    startup: 5, active: 4, recovery: 10,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  KYO_BATSUYOMI: {
    startup: 4, active: 5, recovery: 14,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // 荒咬み终结技 (Aragami finishers)
  KYO_NANASE: {
    startup: 5, active: 5, recovery: 14,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_KOTO_TSUKI: {
    startup: 6, active: 6, recovery: 16,
    damage: 75, hitstun: 19, blockstun: 17, pushback: 6,
    hitLevel: 'MID' as const, knockdown: true,
  },
  KYO_YAKISOGI: {
    startup: 4, active: 4, recovery: 12,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // ── 八神庵必杀技 (Iori Yagami) ──
  IORI_AOIHANA: {
    startup: 6, active: 4, recovery: 10,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  IORI_AOIHANA_2: {
    startup: 4, active: 4, recovery: 8,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  IORI_AOIHANA_3: {
    startup: 5, active: 5, recovery: 14,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 5,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── 特瑞必杀技 (Terry Bogard) ──
  TERRY_BURN_KNUCKLE: {
    startup: 8, active: 6, recovery: 14,
    damage: 60, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  TERRY_CRACK_SHOT: {
    startup: 10, active: 5, recovery: 14,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // ── 金必杀技 (Kim Kaphwan) ──
  KIM_HIENSEN: {
    startup: 5, active: 5, recovery: 14,
    damage: 65, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── DM超必杀技 ──
  DM_YATAGARASU: {
    startup: 6, active: 20, recovery: 18,
    damage: 190, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 18,
  },
  DM_POWER_GEYSER: {
    startup: 10, active: 15, recovery: 20,
    damage: 180, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 16,
  },
  DM_PHOENIX_KICK: {
    startup: 7, active: 18, recovery: 16,
    damage: 185, hitstun: 0, blockstun: 21, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 17,
  },
} as const;

// ===== Hitbox Offsets (relative to fighter position, facing right) =====
export const HITBOX_OFFSETS = {
  // 站立 — 拳(A/C)偏高, 脚(B/D)偏低
  STAND_A: { offsetX: 50, offsetY: -75, width: 45, height: 25 },
  STAND_B: { offsetX: 45, offsetY: -35, width: 50, height: 30 },
  STAND_C: { offsetX: 50, offsetY: -70, width: 55, height: 35 },
  STAND_D: { offsetX: 45, offsetY: -30, width: 60, height: 40 },
  // 近距离 — 更近更窄
  CLOSE_A: { offsetX: 40, offsetY: -70, width: 35, height: 25 },
  CLOSE_B: { offsetX: 38, offsetY: -25, width: 40, height: 25 },
  CLOSE_C: { offsetX: 42, offsetY: -65, width: 45, height: 35 },
  CLOSE_D: { offsetX: 40, offsetY: -25, width: 50, height: 35 },
  // 命令通常技
  CMD_GOFU_YOU: { offsetX: 45, offsetY: -55, width: 50, height: 35 },  // overhead kick high
  CMD_88SHIKI: { offsetX: 50, offsetY: -8, width: 55, height: 18 },    // low sweep
  CMD_NARAKU: { offsetX: 30, offsetY: -35, width: 45, height: 40 },    // air down
  // 蹲下 — 低位置
  CROUCH_A: { offsetX: 50, offsetY: -35, width: 40, height: 20 },
  CROUCH_B: { offsetX: 50, offsetY: -15, width: 50, height: 20 },
  CROUCH_C: { offsetX: 40, offsetY: -60, width: 50, height: 40 },
  CROUCH_D: { offsetX: 50, offsetY: -10, width: 55, height: 20 },
  // 跳跃 — 空中位置
  JUMP_A: { offsetX: 35, offsetY: -45, width: 40, height: 30 },
  JUMP_B: { offsetX: 35, offsetY: -30, width: 45, height: 35 },
  JUMP_C: { offsetX: 30, offsetY: -50, width: 50, height: 40 },
  JUMP_D: { offsetX: 30, offsetY: -35, width: 50, height: 40 },
  // 投技 & 必杀技
  THROW: { offsetX: 10, offsetY: -60, width: 70, height: 60 },
  THROW_FORWARD: { offsetX: 10, offsetY: -60, width: 70, height: 60 },
  THROW_BACK: { offsetX: 10, offsetY: -60, width: 70, height: 60 },
  SPECIAL_PROJECTILE: { offsetX: 50, offsetY: -60, width: 40, height: 30 },
  SPECIAL_UPPER: { offsetX: 30, offsetY: -80, width: 45, height: 50 },
  // CD击飞攻击
  STAND_CD: { offsetX: 45, offsetY: -50, width: 60, height: 45 },
  JUMP_CD: { offsetX: 40, offsetY: -35, width: 55, height: 40 },
  // 超必杀技
  DM_OROCHINAGI: { offsetX: 40, offsetY: -65, width: 80, height: 60 },
  // 京专属
  KYO_75KAI: { offsetX: 42, offsetY: -30, width: 50, height: 30 },
  KYO_75KAI_2: { offsetX: 45, offsetY: -35, width: 55, height: 35 },
  KYO_RED_KICK: { offsetX: 40, offsetY: -50, width: 55, height: 40 },
  KYO_ARAGAMI: { offsetX: 45, offsetY: -65, width: 50, height: 35 },
  KYO_ARAGAMI_KONOKIZU: { offsetX: 45, offsetY: -55, width: 48, height: 30 },
  KYO_ARAGAMI_YANOSABI: { offsetX: 40, offsetY: -75, width: 45, height: 45 },
  KYO_DOKUGAMI: { offsetX: 45, offsetY: -60, width: 50, height: 35 },
  KYO_TSUMIYOMI: { offsetX: 42, offsetY: -55, width: 48, height: 30 },
  KYO_BATSUYOMI: { offsetX: 45, offsetY: -70, width: 50, height: 40 },
  KYO_NANASE: { offsetX: 45, offsetY: -35, width: 55, height: 40 },
  KYO_KOTO_TSUKI: { offsetX: 55, offsetY: -55, width: 60, height: 40 },
  KYO_YAKISOGI: { offsetX: 40, offsetY: -70, width: 45, height: 45 },
  // 八神庵
  IORI_AOIHANA: { offsetX: 45, offsetY: -55, width: 48, height: 35 },
  IORI_AOIHANA_2: { offsetX: 45, offsetY: -20, width: 50, height: 25 },
  IORI_AOIHANA_3: { offsetX: 42, offsetY: -65, width: 50, height: 45 },
  // 特瑞
  TERRY_BURN_KNUCKLE: { offsetX: 50, offsetY: -55, width: 55, height: 35 },
  TERRY_CRACK_SHOT: { offsetX: 45, offsetY: -45, width: 55, height: 40 },
  // 金
  KIM_HIENSEN: { offsetX: 38, offsetY: -75, width: 45, height: 50 },
  // DM超必杀技
  DM_YATAGARASU: { offsetX: 35, offsetY: -60, width: 70, height: 55 },
  DM_POWER_GEYSER: { offsetX: 40, offsetY: -55, width: 75, height: 50 },
  DM_PHOENIX_KICK: { offsetX: 40, offsetY: -50, width: 70, height: 55 },
} as const;

// ===== Throw Constants =====
export const THROW_RANGE = 80;
export const THROW_DISTANCE = 100;

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
