// ===== Stage Constants =====
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const STAGE_WIDTH = 1400;
export const STAGE_GROUND_Y = 480;

// ===== Physics Constants =====
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -14;

// ===== Fighter Constants =====
export const FIGHTER_WIDTH = 60;
export const FIGHTER_HEIGHT = 100;
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
export const COMMAND_WINDOW = 15;

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
    damage: 30, hitstun: 8, blockstun: 5, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_B: {
    startup: 4, active: 3, recovery: 7,
    damage: 35, hitstun: 9, blockstun: 6, pushback: 2,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_C: {
    startup: 7, active: 4, recovery: 12,
    damage: 80, hitstun: 16, blockstun: 10, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_D: {
    startup: 8, active: 5, recovery: 14,
    damage: 75, hitstun: 15, blockstun: 10, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 蹲下攻击 (Crouch) ──
  CROUCH_A: {
    startup: 3, active: 3, recovery: 5,
    damage: 25, hitstun: 8, blockstun: 5, pushback: 1,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_B: {
    startup: 4, active: 3, recovery: 7,
    damage: 35, hitstun: 10, blockstun: 6, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CROUCH_C: {
    startup: 5, active: 4, recovery: 15,
    damage: 70, hitstun: 14, blockstun: 9, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_D: {
    startup: 7, active: 4, recovery: 18,
    damage: 60, hitstun: 0, blockstun: 8, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: true, // 扫堂腿 = 击倒
  },
  // ── 跳跃攻击 (Jump) ──
  JUMP_A: {
    startup: 4, active: 5, recovery: 4,
    damage: 40, hitstun: 12, blockstun: 7, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_B: {
    startup: 4, active: 5, recovery: 4,
    damage: 45, hitstun: 12, blockstun: 7, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_C: {
    startup: 5, active: 6, recovery: 5,
    damage: 70, hitstun: 16, blockstun: 10, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_D: {
    startup: 6, active: 6, recovery: 5,
    damage: 65, hitstun: 14, blockstun: 9, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 投技 ──
  THROW: {
    startup: 3, active: 2, recovery: 20,
    damage: 100, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── 必杀技 ──
  SPECIAL_PROJECTILE: {
    startup: 10, active: 20, recovery: 15,
    damage: 90, hitstun: 18, blockstun: 12, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 9,
  },
  SPECIAL_UPPER: {
    startup: 3, active: 6, recovery: 18,
    damage: 120, hitstun: 20, blockstun: 14, pushback: 8,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 12,
  },
  // ── CD击飞攻击 ──
  STAND_CD: {
    startup: 14, active: 4, recovery: 18,
    damage: 70, hitstun: 0, blockstun: 12, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true,
  },
  JUMP_CD: {
    startup: 12, active: 5, recovery: 8,
    damage: 60, hitstun: 0, blockstun: 10, pushback: 6,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
} as const;

// ===== Hitbox Offsets (relative to fighter position, facing right) =====
export const HITBOX_OFFSETS = {
  // 站立 — 拳(A/C)偏高, 脚(B/D)偏低
  STAND_A: { offsetX: 50, offsetY: -75, width: 45, height: 25 },
  STAND_B: { offsetX: 45, offsetY: -35, width: 50, height: 30 },
  STAND_C: { offsetX: 50, offsetY: -70, width: 55, height: 35 },
  STAND_D: { offsetX: 45, offsetY: -30, width: 60, height: 40 },
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
  SPECIAL_PROJECTILE: { offsetX: 50, offsetY: -60, width: 40, height: 30 },
  SPECIAL_UPPER: { offsetX: 30, offsetY: -80, width: 45, height: 50 },
  // CD击飞攻击
  STAND_CD: { offsetX: 45, offsetY: -50, width: 60, height: 45 },
  JUMP_CD: { offsetX: 40, offsetY: -35, width: 55, height: 40 },
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

// ===== Damage Scaling =====
export const DAMAGE_SCALE_STEP = 0.10;  // 每连击递减10%
export const DAMAGE_SCALE_MIN = 0.50;   // 最低50%伤害
