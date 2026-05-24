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
export const RUN_SPEED = 7;             // 前冲跑步速度 (双击→)
export const BACKDASH_VX = 8;          // 后撤跳水平速度
export const BACKDASH_VY = -8;         // 后撤跳垂直速度
export const BACKDASH_DURATION = 18;   // 后撤跳持续帧数
export const DOUBLE_TAP_WINDOW = 12;   // 双击输入窗口 (帧数)
export const RUN_JUMP_VX = 8;          // 跑跳水平速度 (比普通跳远)
export const RUN_JUMP_VY = -13;        // 跑跳垂直速度 (比普通跳略低=更平)
export const PUSH_BOX_WIDTH = 60;
export const MAX_HEALTH = 1000;

// ===== Input Constants =====
export const COMMAND_WINDOW = 15;

// ===== Game Loop Constants =====
export const TICK_RATE = 1000 / 60; // ~16.667ms per logic frame
export const MAX_FRAME_DELTA = 250; // Cap accumulator to prevent spiral

// ===== Frame Data Constants =====
export const FRAME_DATA = {
  STAND_LIGHT: {
    startup: 4,
    active: 3,
    recovery: 6,
    damage: 40,
    hitstun: 10,
    blockstun: 6,
    pushback: 3,
  },
  STAND_HEAVY: {
    startup: 7,
    active: 4,
    recovery: 12,
    damage: 80,
    hitstun: 16,
    blockstun: 10,
    pushback: 6,
  },
  CROUCH_ATTACK: {
    startup: 5,
    active: 4,
    recovery: 8,
    damage: 50,
    hitstun: 12,
    blockstun: 7,
    pushback: 2,
  },
  AIR_ATTACK: {
    startup: 5,
    active: 5,
    recovery: 4,
    damage: 60,
    hitstun: 14,
    blockstun: 8,
    pushback: 4,
  },
  THROW: {
    startup: 3,
    active: 2,
    recovery: 20,
    damage: 100,
    hitstun: 0,
    blockstun: 0,
    pushback: 0,
  },
  SPECIAL_PROJECTILE: {
    startup: 10,
    active: 20,
    recovery: 15,
    damage: 90,
    hitstun: 18,
    blockstun: 12,
    pushback: 5,
  },
  SPECIAL_UPPER: {
    startup: 3,
    active: 6,
    recovery: 18,
    damage: 120,
    hitstun: 20,
    blockstun: 14,
    pushback: 8,
  },
} as const;

// ===== Hitbox Offsets (relative to fighter position, facing right) =====
export const HITBOX_OFFSETS = {
  STAND_LIGHT: { offsetX: 50, offsetY: -70, width: 50, height: 30 },
  STAND_HEAVY: { offsetX: 50, offsetY: -70, width: 55, height: 35 },
  CROUCH_ATTACK: { offsetX: 50, offsetY: -20, width: 50, height: 25 },
  AIR_ATTACK: { offsetX: 30, offsetY: -40, width: 45, height: 35 },
  THROW: { offsetX: 10, offsetY: -60, width: 70, height: 60 },
  SPECIAL_PROJECTILE: { offsetX: 50, offsetY: -60, width: 40, height: 30 },
  SPECIAL_UPPER: { offsetX: 30, offsetY: -80, width: 45, height: 50 },
} as const;

// ===== Throw Constants =====
export const THROW_RANGE = 80;
export const THROW_DISTANCE = 100;

// ===== Projectile Constants =====
export const PROJECTILE_SPEED = 8;

// ===== Landing Recovery =====
export const LANDING_RECOVERY = 2;

// ===== KO Constants =====
export const KO_DISPLAY_TIME = 120; // 2 seconds at 60fps
