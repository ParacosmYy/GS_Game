// ===== Fighter States =====
export enum FighterState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  RUN = 'RUN',
  BACKDASH = 'BACKDASH',
  JUMP = 'JUMP',
  RUN_JUMP = 'RUN_JUMP',
  HOP = 'HOP',
  HYPER_JUMP = 'HYPER_JUMP',
  CROUCH = 'CROUCH',
  ROLL = 'ROLL',
  BACK_ROLL = 'BACK_ROLL',
  STAND_ATTACK = 'STAND_ATTACK',
  CROUCH_ATTACK = 'CROUCH_ATTACK',
  AIR_ATTACK = 'AIR_ATTACK',
  COUNTER_STANCE = 'COUNTER_STANCE',
  THROW = 'THROW',
  BLOCK = 'BLOCK',
  AIR_BLOCK = 'AIR_BLOCK',
  GUARD_CRUSH = 'GUARD_CRUSH',
  HITSTUN = 'HITSTUN',
  KNOCKDOWN = 'KNOCKDOWN',
  MAX_MODE = 'MAX_MODE',  // MAX模式激活动画 (短暂)
}

// ===== Attack Types (KOF 4-button: A=轻拳 B=轻脚 C=重拳 D=重脚) =====
export enum AttackType {
  // 站立 远距离 (Far Stand)
  STAND_A = 'STAND_A',
  STAND_B = 'STAND_B',
  STAND_C = 'STAND_C',
  STAND_D = 'STAND_D',
  // 站立 近距离 (Close Stand) — 对手在80px内
  CLOSE_A = 'CLOSE_A',
  CLOSE_B = 'CLOSE_B',
  CLOSE_C = 'CLOSE_C',
  CLOSE_D = 'CLOSE_D',
  // 命令通常技 (Command Normals)
  CMD_GOFU_YOU = 'CMD_GOFU_YOU',   // →+B 外式·轟斧陽 (overhead)
  CMD_88SHIKI = 'CMD_88SHIKI',     // ↘+D 八拾八式 (下段2Hit)
  CMD_NARAKU = 'CMD_NARAKU',       // 空中↓+C 外式·奈落落とし
  // 蹲下 (Crouch)
  CROUCH_A = 'CROUCH_A',
  CROUCH_B = 'CROUCH_B',
  CROUCH_C = 'CROUCH_C',
  CROUCH_D = 'CROUCH_D',
  // 跳跃 (Jump)
  JUMP_A = 'JUMP_A',
  JUMP_B = 'JUMP_B',
  JUMP_C = 'JUMP_C',
  JUMP_D = 'JUMP_D',
  // Blowback Attack (CD攻击)
  STAND_CD = 'STAND_CD',
  JUMP_CD = 'JUMP_CD',
  // 投技 & 通用必杀技
  THROW = 'THROW',
  THROW_FORWARD = 'THROW_FORWARD',
  THROW_BACK = 'THROW_BACK',
  SPECIAL_PROJECTILE = 'SPECIAL_PROJECTILE',
  SPECIAL_UPPER = 'SPECIAL_UPPER',
  // 京专属必杀技 (Kyo Specials)
  KYO_75KAI = 'KYO_75KAI',         // 75式·改 ↓↘→+K,K
  KYO_75KAI_2 = 'KYO_75KAI_2',     // 75式·改 第二段
  KYO_RED_KICK = 'KYO_RED_KICK',   // R.E.D. Kick ←↓↙+K
  KYO_ONIYAKI = 'KYO_ONIYAKI',     // 鬼焼き →↓↘+A (weak upper)
  KYO_ONIYAKI_C = 'KYO_ONIYAKI_C', // 鬼焼き →↓↘+C (strong upper, invincible)
  KYO_YAMIBARAI = 'KYO_YAMIBARAI', // 闇払い ↓↘→+A (weak projectile)
  KYO_YAMIBARAI_C = 'KYO_YAMIBARAI_C', // 闇払い ↓↘→+C (strong projectile, faster)
  // 荒咬み连段系 (Aragami Chain)
  KYO_ARAGAMI = 'KYO_ARAGAMI',             // 114式·荒咬み ↓↘→+A
  KYO_ARAGAMI_KONOKIZU = 'KYO_ARAGAMI_KONOKIZU',   // 128式·九傷
  KYO_ARAGAMI_YANOSABI = 'KYO_ARAGAMI_YANOSABI',   // 127式·八錆
  KYO_NANASE = 'KYO_NANASE',                       // 七瀬
  KYO_KOTO_TSUKI = 'KYO_KOTO_TSUKI',               // 琴月陽
  KYO_YAKISOGI = 'KYO_YAKISOGI',                   // 破砕
  // 毒咬み连段系 (Dokugami Chain)
  KYO_DOKUGAMI = 'KYO_DOKUGAMI',         // 115式·毒咬み ↓↘→+C
  KYO_TSUMIYOMI = 'KYO_TSUMIYOMI',       // 401式·罪詠み
  KYO_BATSUYOMI = 'KYO_BATSUYOMI',       // 402式·罰詠み
  // 八神庵必杀技 (Iori Specials)
  IORI_AOIHANA = 'IORI_AOIHANA',       // 葵花 QCB+P (rekka)
  IORI_AOIHANA_2 = 'IORI_AOIHANA_2',   // 葵花 第二段
  IORI_AOIHANA_3 = 'IORI_AOIHANA_3',   // 葵花 第三段
  IORI_YAMIBARAI = 'IORI_YAMIBARAI',   // 闇払い ↓↘→+A (weak projectile)
  IORI_YAMIBARAI_C = 'IORI_YAMIBARAI_C', // 闇払い ↓↘→+C (strong projectile, faster)
  IORI_ONIYAKI = 'IORI_ONIYAKI',       // 鬼焼き →↓↘+A (weak upper)
  IORI_ONIYAKI_C = 'IORI_ONIYAKI_C',   // 鬼焼き →↓↘+C (strong upper, invincible)
  IORI_KOTOTSUKI = 'IORI_KOTOTSUKI',   // 琴月陰 ←↙↓↘→+K (dash)
  IORI_KUZUKAZE = 'IORI_KUZUKAZE',     // 屑風 ←↙↓↘→↗↓↙←+P (command throw)
  // 特瑞必杀技 (Terry Specials)
  TERRY_POWER_WAVE = 'TERRY_POWER_WAVE',       // Power Wave ↓↘→+P (projectile)
  TERRY_BURN_KNUCKLE = 'TERRY_BURN_KNUCKLE',   // Burn Knuckle ←↙↓+P
  TERRY_CRACK_SHOT = 'TERRY_CRACK_SHOT',       // Crack Shot ←↙↓+K
  TERRY_POWER_DUNK = 'TERRY_POWER_DUNK',       // Power Dunk →↓↘+K (升龙)
  TERRY_RISING_TACKLE = 'TERRY_RISING_TACKLE', // Rising Tackle ↓蓄↑+P (charge)
  // 金必杀技 (Kim Specials)
  KIM_HIENZAN = 'KIM_HIENZAN',         // 飛燕斬 ↓蓄↑+K (升龙)
  KIM_HANGETSU = 'KIM_HANGETSU',       // 半月斬 ←↙↓+K
  KIM_HAKI = 'KIM_HAKI',               // 覇気脚 ↓↓+K (low)
  KIM_HISHOU = 'KIM_HISHOU',           // 飛翔脚 空中↓↘→+K (air dive)
  KIM_SANREN = 'KIM_SANREN',           // 三連撃 ←↙↓+P chain
  // 坂崎亮必杀技 (Ryo Specials)
  RYO_KOOU = 'RYO_KOOU',             // 虎煌 ↓↘→+A (weak projectile)
  RYO_KOOU_C = 'RYO_KOOU_C',         // 虎煌 ↓↘→+C (strong projectile)
  RYO_KO_HOU = 'RYO_KO_HOU',         // 虎咆 →↓↘+A (weak upper)
  RYO_KO_HOU_C = 'RYO_KO_HOU_C',     // 虎咆 →↓↘+C (strong upper, invincible)
  RYO_HIEN = 'RYO_HIEN',             // 飛燕疾風脚 ←↙↓+K (overhead kick)
  RYO_HAOU = 'RYO_HAOU',             // 霸王翔吼拳 ↓↘→+K (counter)
  // 超必杀技 (DM)
  DM_OROCHINAGI = 'DM_OROCHINAGI',           // 大蛇薙 (Kyo)
  DM_YATAGARASU = 'DM_YATAGARASU',           // 八稚女 (Iori)
  DM_POWER_GEYSER = 'DM_POWER_GEYSER',       // Power Geyser (Terry)
  DM_HIGH_ANGLE_GEYSER = 'DM_HIGH_ANGLE_GEYSER', // High Angle Geyser (Terry)
  DM_PHOENIX_KICK = 'DM_PHOENIX_KICK',       // 鳳凰脚 (Kim)
  DM_PHOENIX_HITEN = 'DM_PHOENIX_HITEN',     // 鳳凰天舞脚 (Kim)
  DM_TEN_HA_OU = 'DM_TEN_HA_OU',             // 天地霸煌拳 (Ryo)
}

// ===== Hit Level (防御判定) =====
export type HitLevel = 'MID' | 'LOW' | 'HIGH';
// MID: 站防蹲防都能挡
// LOW: 只能蹲防 (下段攻击)
// HIGH: 只能站防 (打逆/空中攻击)

// ===== Player Input =====
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  buttonA: boolean;  // 轻拳
  buttonB: boolean;  // 轻脚
  buttonC: boolean;  // 重拳
  buttonD: boolean;  // 重脚
  throwAttack: boolean;
}

// ===== Direction =====
export type Direction = 1 | -1;

// ===== Direction Input for Command Buffer =====
export type DirectionInput =
  | 'neutral'
  | 'up'
  | 'down'
  | 'forward'
  | 'back'
  | 'upforward'
  | 'upback'
  | 'downforward'
  | 'downback';

// ===== Block Type =====
export type BlockType = 'HIGH' | 'LOW';

// ===== Power Gauge (能量槽) =====
export interface PowerGauge {
  meter: number;         // 当前能量值 (0~maxMeter)
  stocks: number;        // 已攒满的能量条数 (0~MAX_STOCKS)
  maxMeter: number;      // 一条能量的满值
}

// ===== MAX Mode State =====
export interface MaxModeState {
  active: boolean;
  timer: number;
  maxDuration: number;
}

// ===== Rekka Chain State (荒咬み/毒咬み连段) =====
export type RekkaChain = 'aragami' | 'dokugami' | 'aoihana' | null;

// ===== Juggle State (浮空状态) =====
export enum JuggleState {
  NONE = 'NONE',       // 不可追打 (普通通常技命中后)
  HALF = 'HALF',       // 半追打 (落下前期可打)
  FULL = 'FULL',       // 全追打 (落地前都可打 — 大多数必杀技/升龙)
}

// ===== Close Range Distance =====
export const CLOSE_RANGE = 80;

// ===== Attack Phase =====
export type AttackPhase = 'startup' | 'active' | 'recovery' | 'none';

// ===== Per-Frame Hitbox System (逐帧判定框) =====
export interface FrameBox {
  /** X offset from fighter position (positive = forward) */
  ox: number;
  /** Y offset from fighter Y (negative = upward) */
  oy: number;
  /** Box width */
  w: number;
  /** Box height */
  h: number;
}

/** Single frame of hitbox data during active phase */
export interface AttackFrame {
  /** Attack boxes for this frame (can have multiple) */
  attack: FrameBox[];
  /** Body box override relative to default (null = use default hurtbox) */
  bodyOverride: FrameBox | null;
}

/** Map of attack type to per-active-frame hitbox data */
export type AttackFrameTable = Partial<Record<AttackType, AttackFrame[]>>;

// ===== Command Throw Marking =====
// 指令投：不可被普通拆投，在投技判定时走特殊路径
export const COMMAND_THROWS: ReadonlySet<string> = new Set([
  // 角色专属指令投将在角色定义中通过 CharacterDefinition.isCommandThrow() 标记
]);

// ===== Counter (当身技) Configuration =====
export interface CounterConfig {
  /** 当身架招持续帧数 */
  activeFrames: number;
  /** 成功当身后触发的攻击 */
  counterAttack: AttackType;
  /** 当身成功时的伤害 */
  counterDamage: number;
  /** 当身失败（超时/被下段打中）的硬直帧 */
  failureStun: number;
}

// ===== Game Phase =====
export enum GamePhase {
  TITLE = 'TITLE',     // Title screen (KOF2002 logo + PRESS START)
  SELECT = 'SELECT',   // Character select
  INTRO = 'INTRO',     // "ROUND 1... FIGHT!" text
  FIGHTING = 'FIGHTING', // Active gameplay
  KO = 'KO',           // KO state
  MATCH_END = 'MATCH_END', // Match complete (best of 3)
  CONTINUE = 'CONTINUE', // Continue? countdown
}

// ===== Game State (for window.__gameState) =====
export interface PlayerState {
  x: number;
  y: number;
  health: number;
  state: string;
  facing: Direction;
  currentAttack: string | null;
  attackPhase: AttackPhase;
  attackFrame: number;
}

export interface GameState {
  players: PlayerState[];
  tick: number;
  fps: number;
  ko: boolean;
  winner: number | null; // 0=P1, 1=P2, null=none
}
