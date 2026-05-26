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
export const COMMAND_WINDOW = 12;          // 单个搓招窗口（正版KOF标准 ≈ 10-14帧, 12为经典值）
export const HCF_WINDOW = 24;              // 半圆指令窗口（↓↙←↙↓↘→）
export const DOUBLE_QCF_WINDOW = 28;       // 双QCF指令窗口（正版KOF UM DM窗口 ≈ 28-32帧）
export const CHARGE_FRAMES_REQUIRED = 40;  // 蓄力帧数要求（正版KOF ≈ 40-55帧, 40为最低值）

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
export const CH_DAMAGE_BONUS = 1.0;    // KOF2002正版: CH无伤害加成, 奖励是额外hitstun

// ===== Juggle Points (KOF2002 authentic: juggle budget per launch) =====
export const JUGGLE_POINTS_MAX = 5;           // total juggle points per launch
export const JUGGLE_COST_LIGHT = 1;           // A/B normals cost 1
export const JUGGLE_COST_HEAVY = 2;           // C/D normals cost 2
export const JUGGLE_COST_SPECIAL = 2;         // specials cost 2
export const JUGGLE_COST_DM = 3;              // DMs cost 3
export const JUGGLE_COST_CD = 2;              // CD blowback cost 2

// ===== Juggle Gravity Decay (progressive juggle difficulty) =====
export const JUGGLE_GRAVITY_BASE = 0.3;       // base gravity addition per juggle hit
export const JUGGLE_GRAVITY_SCALE_PER_HIT = 0.15; // +15% gravity per successive air hit

// ===== Ground Bounce =====
export const GROUND_BOUNCE_VY = -5;            // upward velocity on ground bounce
export const GROUND_BOUNCE_COST = 2;           // extra juggle points consumed by ground bounce follow-up
export const GROUND_BOUNCE_HITSTUN = 18;       // hitstun frames during ground bounce state

// ===== Wall Bounce =====
export const WALL_BOUNCE_MAX_PER_COMBO = 1;    // only one wall bounce per combo
export const WALL_BOUNCE_SLIDE_FRICTION = 0.85; // friction during post-bounce slide

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

// ===== Combo Tier Scaling (KOF2002风云再起分段缩放) =====
// comboCount 1-3: 100%, 4-6: 85%, 7-9: 70%, 10+: 60% (下限)
// 投技不参与缩放, DM在连段中缩放率额外-10%
export const COMBO_DAMAGE_SCALE: Record<number, number> = {
  3: 1.0,
  6: 0.85,
  9: 0.70,
};
export const COMBO_MIN_SCALE = 0.60;
export const DM_COMBO_PENALTY = 0.10;

// ===== Cancel Window Constants =====
export const CANCEL_WINDOW_NORMAL = 3;   // 普通取消在命中后3帧内
export const CANCEL_WINDOW_RAPID = 2;    // Rapid取消更紧
export const CANCEL_WINDOW_SUPER = 5;    // 超必杀取消更宽
export const CANCEL_WINDOW_FREE = 4;     // Free Cancel中等

// ===== Power Gauge (能量槽) =====
export const MAX_STOCKS = 5;
export const METER_PER_STOCK = 100;
export const METER_GAIN_HIT = 100;
export const METER_GAIN_BLOCK = 20;
export const METER_GAIN_WHIFF = 10;
export const METER_GAIN_HITSTUN = 50;
export const DM_STOCK_COST = 1;

// ===== MAX Mode (KOF2002 Advanced Mode) =====
export const MAX_MODE_DURATION = 720;          // 12秒 @60fps (风云再起: 基于消耗的stock数)
export const MAX_MODE_STOCK_COST = 3;          // KOF2002正版: MAX激活需要3个stock
export const MAX_MODE_DAMAGE_BONUS = 1.20;     // MAX mode: 伤害 +20% (KOF2002正版)
export const MAX_MODE_DEFENSE_BONUS = 0.75;    // MAX mode: 受伤 -25% (防御加成)

// ===== Desperation Mode (health < 25%) =====
export const DESPERATION_HEALTH_THRESHOLD = 0.25;  // 血量 < 25% 触发绝体绝命
export const DESPERATION_DM_DAMAGE_BONUS = 1.30;    // 绝体绝命: DM伤害 +30%
export const DESPERATION_METER_GAIN_BONUS = 1.50;   // 绝体绝命: 气槽获取 +50%

// ===== Guard Cancel Costs =====
export const GC_ROLL_STOCK_COST = 1;       // Guard Cancel Roll 消耗1个stock
export const GC_CD_STOCK_COST = 1;         // Guard Cancel CD 消耗1个stock

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

/** Command normal attack types (→+A/B, ↘+B, air↓+C, etc.) */
export const COMMAND_NORMALS: ReadonlySet<string> = new Set([
  // Kyo
  'CMD_GOFU_YOU',
  'CMD_88SHIKI',
  'CMD_NARAKU',
  // Iori
  'IORI_YUMEYUMI',
  'IORI_KATANUGI',
  'IORI_YUKIWARUI',
  // Terry
  'TERRY_BACK_KNCKLE',
  'TERRY_COMBO_BLOW',
  // Kim
  'KIM_HISHOU_KICK',
  'KIM_HANSEN',
  // Ryo
  'RYO_TSURIZAO',
  'RYO_ORISHI',
  // K'
  'KDASH_ONE_INCH',
  'KDASH_TRIGGER',
  // Kula
  'KULA_ONE_MORE',
  'KULA_SLIDER',
  // Leona
  'LEONA_STRIKE_ARC',
  'LEONA_STRIKE_DASH',
  // Robert
  'ROBERT_GENEI_KYAKU_CMD',
  'ROBERT_KOU_SHUTAI',
  // Mature
  'MATURE_DESPAIR',
  'MATURE_JAB',
  // Yashiro
  'YASHIRO_SHUU_WANI',
  'YASHIRO_JUU_ZUTSU',
  // Chris
  'CHRIS_MAKASHIPPO',
  'CHRIS_KAZAGURUMA',
  // Shermie
  'SHERMIE_STAND',
  'SHERMIE_CLASH',
  // Mai
  'MAI_HISSATSU_SHINOBIBACHI',
  'MAI_YUSURA_UMA',
  // Athena
  'ATHENA_PHOENIX_REFLECT',
  'ATHENA_LOW_B',
  'ATHENA_AIR_B',
  // Joe
  'JOE_KNEE_KICK',
  'JOE_SLIDE',
  // Ralf
  'RALF_SABRE_PUNCH',
  'RALF_SABRE_KICK',
  // Andy
  'ANDY_UWA_AGITO',
  'ANDY_GEDAN_AGITO',
  // Billy
  'BILLY_SANDAN_GEAR',
  'BILLY_SENSHU_IKKYAKU',
  // Chang
  'CHANG_HIKI_NAGE',
  'CHANG_KYUUSHUU',
  // Choi
  'CHOI_SOUTEN_MEKKYAKU',
  'CHOI_SAN_REN_GEKI',
  // Vice
  'VICE_MONSTROSITY',
  'VICE_OVERKILL',
  // Xiangfei
  'XIANGFEI_KYU_HO',
  'XIANGFEI_KAKU_DA',
  // Yamazaki
  'YAMAZAKI_SASHI',
  'YAMAZAKI_BOKKAI',
  // Kasumi
  'KASUMI_KOU_U',
  'KASUMI_GESHIKI',
  // Mary
  'MARY_HAMMER_PUNCH',
  'MARY_DOUBLE_ROLLING',
  // Clark
  'CLARK_DEATH_LAKE',
  'CLARK_STOMP',
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

// ===== Stun / Dizzy System (KOF2002 authentic) =====
// Stun gauge fills when hit; when full the character enters dizzy state.
export const STUN_GAUGE_MAX = 100;                // Stun gauge max value
export const STUN_DECAY_DELAY = 60;               // Frames without being hit before gauge starts decaying
export const STUN_DECAY_RATE = 0.5;               // Gauge decay per frame during delay window
export const STUN_FILL_LIGHT = 6;                 // Light normal (A/B) stun fill
export const STUN_FILL_HEAVY = 12;                // Heavy normal (C/D) stun fill
export const STUN_FILL_COMMAND_NORMAL = 10;        // Command normal stun fill
export const STUN_FILL_SPECIAL = 18;               // Special move stun fill
export const STUN_FILL_DM = 25;                    // DM/SDM stun fill
export const STUN_FILL_CD = 14;                    // CD blowback stun fill
export const STUN_FILL_THROW = 15;                 // Throw stun fill
export const DIZZY_BASE_DURATION_MIN = 60;         // Minimum dizzy frames (~1 sec)
export const DIZZY_BASE_DURATION_MAX = 180;        // Maximum dizzy frames (~3 sec)
export const DIZZY_MASH_RECOVERY = 3;              // Frames recovered per button press (mashing)

// ===== Defense System (KOF2002 authentic) =====
export const GUARD_CRUSH_DURATION = 90;              // Guard Crush stun frames (KOF2002: ~1.5 sec)
export const GUARD_GAUGE_MAX = 100;                  // Guard gauge maximum value
export const GUARD_GAUGE_RECOVERY_IDLE = 0.25;       // Guard gauge recovery per frame (idle/walk)
export const GUARD_GAUGE_RECOVERY_RUN = 0.15;        // Guard gauge recovery per frame (running)
export const GUARD_GAUGE_DRAIN_LIGHT = 5;            // Light normal guard gauge drain
export const GUARD_GAUGE_DRAIN_HEAVY = 10;           // Heavy normal guard gauge drain
export const GUARD_GAUGE_DRAIN_COMMAND_NORMAL = 12;  // Command normal guard gauge drain
export const GUARD_GAUGE_DRAIN_SPECIAL = 15;         // Special move guard gauge drain
export const GUARD_GAUGE_DRAIN_DM = 25;              // DM guard gauge drain
export const GUARD_GAUGE_DRAIN_SDM = 35;             // SDM guard gauge drain
export const GUARD_GAUGE_DRAIN_CD = 12;              // CD blowback guard gauge drain
export const GUARD_GAUGE_METER_BONUS_ON_BLOCK = 2;   // Guard gauge meter bonus per block
export const PUSHBLOCK_THRESHOLD = 3;                // Consecutive blocks before pushback increases
export const PUSHBLOCK_EXTRA_PUSHBACK = 1.5;         // Pushback multiplier when pushblock triggers
export const PUSHBLOCK_DECAY_FRAMES = 30;            // Frames without blocking before counter resets
export const WRONG_BLOCK_PUSHBACK_MULT = 1.3;        // Extra pushback multiplier for wrong block type
export const WRONG_BLOCK_STUN_MULT = 1.2;            // Extra blockstun multiplier for wrong block type

// ===== Hitstop (命中暂停) — KOF2002 分层系统 =====
export const HITSTOP_LIGHT = 4;      // 轻攻击 (A button normals)
export const HITSTOP_MEDIUM = 7;     // 重攻击 (C/D button normals)
export const HITSTOP_SPECIAL = 13;   // 必杀技
export const HITSTOP_DM = 19;        // DM超必杀
export const HITSTOP_SDM = 22;       // SDM超必杀
export const HITSTOP_COUNTER_BONUS = 3;  // Counter Hit额外暂停帧数

// ===== Blockstop (防御暂停) — KOF2002 分层系统 =====
export const BLOCKSTOP_LIGHT = 2;    // 轻攻击防御
export const BLOCKSTOP_HEAVY = 4;    // 重攻击防御
export const BLOCKSTOP_SPECIAL = 5;  // 必杀技防御
export const BLOCKSTOP_DM = 8;       // DM防御

// ===== Screen Shake (画面震动) — KOF2002 分层系统 =====
export const SHAKE_LIGHT = 3;               // 轻攻击
export const SHAKE_HEAVY = 6;               // 重攻击
export const SHAKE_COUNTER = 6;             // Counter Hit (非重攻击)
export const SHAKE_SPECIAL = 8;             // 必杀技
export const SHAKE_THROW = 8;               // 投技
export const SHAKE_DM = 14;                 // DM超必杀
export const SHAKE_KO = 22;                 // KO落地
export const SHAKE_DMG_THRESHOLD = 50;      // 伤害>50时用中等震动

export const SHAKE_DURATION_LIGHT = 4;      // 轻攻击震动持续
export const SHAKE_DURATION_HEAVY = 8;      // 重攻击震动持续
export const SHAKE_DURATION_SPECIAL = 10;   // 必杀技震动持续
export const SHAKE_DURATION_DM = 16;        // DM震动持续
export const SHAKE_DURATION_KO = 55;        // KO落地震动持续

export const SHAKE_BLOCK_LIGHT = 3;         // 轻攻击防御震动
export const SHAKE_BLOCK_HEAVY = 4;         // 重攻击防御震动
export const SHAKE_BLOCK_SPECIAL = 5;       // 必杀技防御震动
export const SHAKE_BLOCK_DM = 8;            // DM防御震动
export const SHAKE_BLOCK_DURATION_LIGHT = 5;
export const SHAKE_BLOCK_DURATION_HEAVY = 6;
export const SHAKE_BLOCK_DURATION_SPECIAL = 7;
export const SHAKE_BLOCK_DURATION_DM = 10;

// ===== Spark/VFX Type 分级 =====
export const SPARK_LIGHT = 'light';
export const SPARK_HEAVY = 'heavy';
export const SPARK_SPECIAL = 'special';
export const SPARK_DM = 'dm';
export const SPARK_SDM = 'sdm';
export const SPARK_COUNTER = 'counter';
export const SPARK_THROW = 'throw';

// ===== Spark Size Scale 分级 =====
export const SPARK_SIZE_LIGHT = 0.55;
export const SPARK_SIZE_HEAVY = 0.85;
export const SPARK_SIZE_SPECIAL = 1.1;
export const SPARK_SIZE_DM = 1.3;
export const SPARK_SIZE_SDM = 1.5;

// ===== Spark Count 分级 =====
export const SPARK_COUNT_LIGHT = 6;
export const SPARK_COUNT_HEAVY = 6;
export const SPARK_COUNT_SPECIAL = 10;
export const SPARK_COUNT_DM = 14;
export const SPARK_COUNT_SDM = 18;
export const SPARK_COUNT_COUNTER = 8;

/**
 * 根据攻击类型返回对应的hitstop帧数。
 * 使用分层常量而非硬编码值。
 * Counter Hit额外加 HITSTOP_COUNTER_BONUS 帧。
 */
export function getHitstopFrames(attackType: string): number {
  if (attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return HITSTOP_SDM;
  if (attackType.startsWith('DM_')) return HITSTOP_DM;
  if (['STAND_C', 'CROUCH_C', 'JUMP_C',
    'STAND_D', 'CROUCH_D', 'JUMP_D',
    'CLOSE_C', 'CLOSE_D'].includes(attackType)) return HITSTOP_MEDIUM;
  return HITSTOP_LIGHT;
}

/**
 * 根据攻击类型返回对应的spark类型标签。
 */
export function getSparkType(attackType: string): string {
  if (attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return SPARK_SDM;
  if (attackType.startsWith('DM_')) return SPARK_DM;
  if (attackType === 'THROW' || attackType === 'THROW_FORWARD' || attackType === 'THROW_BACK') return SPARK_THROW;
  if (isNonNormalAttack(attackType)) return SPARK_SPECIAL;
  if (['STAND_C', 'CROUCH_C', 'JUMP_C',
    'STAND_D', 'CROUCH_D', 'JUMP_D',
    'CLOSE_C', 'CLOSE_D',
    'STAND_CD', 'JUMP_CD'].includes(attackType)) return SPARK_HEAVY;
  return SPARK_LIGHT;
}

/**
 * 根据攻击类型返回对应的spark size scale。
 */
export function getSparkSizeScale(attackType: string): number {
  if (attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return SPARK_SIZE_SDM;
  if (attackType.startsWith('DM_')) return SPARK_SIZE_DM;
  if (isNonNormalAttack(attackType)) return SPARK_SIZE_SPECIAL;
  if (['STAND_C', 'CROUCH_C', 'JUMP_C',
    'STAND_D', 'CROUCH_D', 'JUMP_D',
    'CLOSE_C', 'CLOSE_D',
    'STAND_CD', 'JUMP_CD'].includes(attackType)) return SPARK_SIZE_HEAVY;
  return SPARK_SIZE_LIGHT;
}

/**
 * 根据攻击类型返回对应的spark粒子数量。
 */
export function getSparkCount(attackType: string): number {
  if (attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return SPARK_COUNT_SDM;
  if (attackType.startsWith('DM_')) return SPARK_COUNT_DM;
  if (isNonNormalAttack(attackType)) return SPARK_COUNT_SPECIAL;
  if (['STAND_C', 'CROUCH_C', 'JUMP_C',
    'STAND_D', 'CROUCH_D', 'JUMP_D',
    'CLOSE_C', 'CLOSE_D',
    'STAND_CD', 'JUMP_CD'].includes(attackType)) return SPARK_COUNT_HEAVY;
  return SPARK_COUNT_LIGHT;
}

/**
 * 根据攻击类型返回screen shake强度。
 */
export function getShakeIntensity(attackType: string, dmg: number, counterHit: boolean): number {
  if (attackType.startsWith('DM_') || attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return SHAKE_DM;
  if (isNonNormalAttack(attackType)) return SHAKE_SPECIAL;
  if (attackType === 'THROW' || attackType === 'THROW_FORWARD' || attackType === 'THROW_BACK') return SHAKE_THROW;
  if (counterHit) return SHAKE_COUNTER;
  if (['STAND_C', 'CROUCH_C', 'STAND_D', 'CROUCH_D', 'CLOSE_C', 'CLOSE_D'].includes(attackType)) return SHAKE_HEAVY;
  if (dmg > SHAKE_DMG_THRESHOLD) return 4;
  return SHAKE_LIGHT;
}

/**
 * 根据攻击类型返回screen shake持续帧数。
 */
export function getShakeDuration(attackType: string): number {
  if (attackType.startsWith('DM_') || attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return SHAKE_DURATION_DM;
  if (isNonNormalAttack(attackType)) return SHAKE_DURATION_SPECIAL;
  if (['STAND_C', 'CROUCH_C', 'JUMP_C',
    'STAND_D', 'CROUCH_D', 'JUMP_D',
    'CLOSE_C', 'CLOSE_D',
    'STAND_CD', 'JUMP_CD'].includes(attackType)) return SHAKE_DURATION_HEAVY;
  return SHAKE_DURATION_LIGHT;
}

/** Internal helper: checks if attackType is a non-normal, non-throw, non-DM attack (i.e. a special) */
function isNonNormalAttack(attackType: string): boolean {
  if (attackType.startsWith('DM_') || attackType.startsWith('SDM_') || attackType.startsWith('HSDM_')) return false;
  if (attackType === 'THROW' || attackType === 'THROW_FORWARD' || attackType === 'THROW_BACK') return false;
  // Normal attacks
  if (attackType.startsWith('CLOSE_') || attackType.startsWith('STAND_') || attackType.startsWith('CROUCH_') || attackType.startsWith('JUMP_')) return false;
  if (attackType.startsWith('CMD_')) return false;
  // Everything else is a special (character specials + SPECIAL_* generics)
  return true;
}

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
