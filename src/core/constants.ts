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
export const BACKDASH_INVINCIBLE_FRAMES = 5; // KOF2002: 后撤步前5帧有打击无敌
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

// Frame data + hitbox offsets — extracted to separate files
export { FRAME_DATA } from './frameDataConstants.js';
export { HITBOX_OFFSETS } from './hitboxConstants.js';

// ===== Throw Constants =====
export const THROW_RANGE = 100;
export const THROW_DISTANCE = 130;

// ===== Projectile Constants =====
export const PROJECTILE_SPEED = 8;

// ===== Landing Recovery (KOF2002 authentic: hop < jump < air attack) =====
export const LANDING_RECOVERY = 2;           // 通用默认(后撤步等)
export const HOP_LANDING_RECOVERY = 1;       // 小跳着陆1F (正版≈0-1F)
export const JUMP_LANDING_RECOVERY = 4;      // 普通跳/跑跳/大跳着陆4F
export const AIR_ATTACK_LANDING_RECOVERY = 5; // 空中攻击后着陆5F (正版≈5-6F)

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

// ===== Damage Scaling (KOF2002正版公式) =====
// 公式: baseDamage * max(minScale, 1 - 0.05 * comboHits)
// 通常技最低10%, 必杀技最低20%, DM最低30%
export const DAMAGE_SCALE_STEP = 0.05;         // 每连击递减5% (KOF2002正版)
export const DAMAGE_SCALE_MIN_NORMAL = 0.10;   // 通常技最低10%
export const DAMAGE_SCALE_MIN_SPECIAL = 0.20;  // 必杀技最低20%
export const DAMAGE_SCALE_MIN_DM = 0.30;       // DM最低30%
export const COMBO_TIMEOUT = 60;               // 60帧(1秒)无后续命中则重置连击计数

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
  'IORI_YUMEYUMI',
  'IORI_KATANUGI',
  'IORI_YUKIWARUI',
  'TERRY_BACK_KNCKLE',
  'TERRY_COMBO_BLOW',
  'KIM_HISHOU_KICK',
  'KIM_HANSEN',
  'RYO_TSURIZAO',
  'RYO_ORISHI',
  'KDASH_ONE_INCH',
  'KDASH_TRIGGER',
  'KULA_ONE_MORE',
  'KULA_SLIDER',
  'LEONA_STRIKE_ARC',
  'LEONA_STRIKE_DASH',
]);

// ===== Throw Invincibility (KOF 2002 authentic) =====
export const THROW_INVINCIBILITY_POST_STUN = 7;    // Frames after blockstun/hitstun (KOF2002: 7F)
export const THROW_INVINCIBILITY_WAKEUP = 9;        // Frames on wakeup from knockdown (KOF2002: 9F)
export const THROW_INVINCIBILITY_JUMP_STARTUP = 4;  // Frames during jump startup
export const THROW_INVINCIBILITY_LANDING = 2;       // Frames on landing
export const THROW_INVINCIBILITY_POST_ESCAPE = 6;  // Frames after throw escape (both fighters)

// ===== Wake-up Reversal Window =====
export const WAKEUP_REVERSAL_WINDOW = 5;  // KOF2002: ~5帧起身反转窗口
export const WAKEUP_BUFFER_WINDOW = 5;    // 起身前5帧可缓冲输入
export const WAKEUP_FULL_INVINCIBILITY = 5; // KOF2002: 正常起身(非Quick Stand)前5帧完全无敌

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
