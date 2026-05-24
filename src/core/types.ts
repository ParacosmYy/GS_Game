// ===== Fighter States =====
export enum FighterState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  RUN = 'RUN',
  BACKDASH = 'BACKDASH',
  JUMP = 'JUMP',
  RUN_JUMP = 'RUN_JUMP',
  HOP = 'HOP',             // 小跳 (短按↑)
  HYPER_JUMP = 'HYPER_JUMP', // 大跳 (↓→↑)
  CROUCH = 'CROUCH',
  ROLL = 'ROLL',           // 前滚紧急回避
  BACK_ROLL = 'BACK_ROLL', // 后滚紧急回避
  STAND_ATTACK = 'STAND_ATTACK',
  CROUCH_ATTACK = 'CROUCH_ATTACK',
  AIR_ATTACK = 'AIR_ATTACK',
  THROW = 'THROW',
  BLOCK = 'BLOCK',
  HITSTUN = 'HITSTUN',
  KNOCKDOWN = 'KNOCKDOWN',
}

// ===== Attack Types (KOF 4-button: A=轻拳 B=轻脚 C=重拳 D=重脚) =====
export enum AttackType {
  // 站立 (Stand)
  STAND_A = 'STAND_A',   // 轻拳
  STAND_B = 'STAND_B',   // 轻脚
  STAND_C = 'STAND_C',   // 重拳
  STAND_D = 'STAND_D',   // 重脚
  // 蹲下 (Crouch)
  CROUCH_A = 'CROUCH_A', // 蹲轻拳
  CROUCH_B = 'CROUCH_B', // 蹲轻脚 (下段)
  CROUCH_C = 'CROUCH_C', // 蹲重拳 (对空)
  CROUCH_D = 'CROUCH_D', // 蹲重脚 (扫堂腿 KD)
  // 跳跃 (Jump)
  JUMP_A = 'JUMP_A',
  JUMP_B = 'JUMP_B',
  JUMP_C = 'JUMP_C',
  JUMP_D = 'JUMP_D',
  // Blowback Attack (CD攻击)
  STAND_CD = 'STAND_CD',   // 地面CD击飞
  JUMP_CD = 'JUMP_CD',     // 空中CD击飞
  // 投技 & 必杀技
  THROW = 'THROW',
  SPECIAL_PROJECTILE = 'SPECIAL_PROJECTILE',
  SPECIAL_UPPER = 'SPECIAL_UPPER',
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

// ===== Attack Phase =====
export type AttackPhase = 'startup' | 'active' | 'recovery' | 'none';

// ===== Game Phase =====
export enum GamePhase {
  INTRO = 'INTRO',     // "ROUND 1... FIGHT!" text
  FIGHTING = 'FIGHTING', // Active gameplay
  KO = 'KO',           // KO state
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
