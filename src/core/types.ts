// ===== Fighter States =====
export enum FighterState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  JUMP = 'JUMP',
  CROUCH = 'CROUCH',
  STAND_ATTACK = 'STAND_ATTACK',
  CROUCH_ATTACK = 'CROUCH_ATTACK',
  AIR_ATTACK = 'AIR_ATTACK',
  THROW = 'THROW',
  BLOCK = 'BLOCK',
  HITSTUN = 'HITSTUN',
  KNOCKDOWN = 'KNOCKDOWN',
}

// ===== Attack Types =====
export enum AttackType {
  STAND_LIGHT = 'STAND_LIGHT',
  STAND_HEAVY = 'STAND_HEAVY',
  CROUCH_ATTACK = 'CROUCH_ATTACK',
  AIR_ATTACK = 'AIR_ATTACK',
  THROW = 'THROW',
  SPECIAL_PROJECTILE = 'SPECIAL_PROJECTILE',
  SPECIAL_UPPER = 'SPECIAL_UPPER',
}

// ===== Frame Data =====
export interface FrameData {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
}

// ===== Hitbox =====
export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===== Player Input =====
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
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
