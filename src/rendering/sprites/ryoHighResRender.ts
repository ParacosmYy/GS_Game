/**
 * ryoHighResRender.ts
 *
 * Ryo-specific integration layer using the shared HighResFrameRegistry.
 * This is the most complete character renderer, covering all states.
 *
 * Public API takes charId parameter for backward compatibility with
 * the generic rendering pipeline in rendererFighter.ts.
 */

import { FighterState, AttackType } from '../../core/types.js';
import {
  registerFrames as reg,
  registerVariableFrames as regV,
  drawFromRegistry,
  drawAfterimageFromRegistry,
  type FrameEntry,
} from './baseHighResRenderer.js';
import { drawPixelFrame } from './pixelFrameRenderer.js';
import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from './ryoWalkFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES, RYO_CLOSE_A_FRAMES, RYO_CLOSE_C_FRAMES } from './ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from './ryoKickFrames.js';
import { RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES } from './ryoCrouchKickFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from './ryoCloseKickFrames.js';
import { RYO_JUMP_FRAMES } from './ryoJumpFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from './ryoDamageFrames.js';
import { RYO_CROUCH_FRAMES, RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from './ryoCrouchFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES } from './ryoAirAttackFrames.js';
import {
  RYO_KO_HOU_FRAMES, RYO_KOOU_FRAMES, RYO_HIEN_FRAMES,
  RYO_HAOU_FRAMES, RYO_KOOU_C_FRAMES, RYO_KO_HOU_C_FRAMES,
} from './ryoSpecialFrames.js';
import {
  RYO_DM_TEN_HA_OU_FRAMES, RYO_DM_RYUKO_RANBU_FRAMES,
  RYO_SDM_TEN_HA_OU_FRAMES, RYO_HSDM_RYUKO_RANBU_FRAMES,
} from './ryoSuperFrames.js';
import {
  RYO_RUN_FRAMES, RYO_BACKDASH_FRAMES, RYO_ROLL_FRAMES, RYO_BACK_ROLL_FRAMES,
  RYO_GUARD_CRUSH_FRAMES, RYO_MAX_MODE_FRAMES, RYO_TAUNT_FRAMES,
  RYO_COUNTER_STANCE_FRAMES, RYO_RYUKO_RANBU_FRAMES,
} from './ryoMovementFrames.js';
import { RYO_BLOCK_FRAMES } from './ryoBlockFrames.js';
import { RYO_WIN_FRAMES } from './ryoWinFrames.js';
import { RYO_DIZZY_FRAMES } from './ryoDizzyFrames.js';
import { RYO_THROW_FRAMES } from './ryoThrowFrames.js';

const RYO_FRAMES = new Map<string, FrameEntry>();
const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

const registerFrames = (key: string, frames: Parameters<typeof reg>[2], tpf: number) =>
  reg(RYO_FRAMES, key, frames, tpf);
const registerVariableFrames = (key: string, frames: Parameters<typeof regV>[2], durations: number[]) =>
  regV(RYO_FRAMES, key, frames, durations);

let initialized = false;

function initRyoFrames(): void {
  if (initialized) return;
  initialized = true;

  registerVariableFrames('IDLE', RYO_IDLE_FRAMES, [7, 8, 9, 12, 9, 8, 10, 7]);
  registerVariableFrames('WALK_FORWARD', RYO_WALK_FORWARD_FRAMES, [7, 5, 7, 7, 5, 7]);
  registerVariableFrames('WALK_BACKWARD', RYO_WALK_BACKWARD_FRAMES, [8, 6, 8, 8, 6, 8]);

  registerVariableFrames('STAND_A', RYO_STAND_A_FRAMES, [6, 3, 2, 5]);
  registerVariableFrames('STAND_C', RYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);
  registerVariableFrames('CLOSE_A', RYO_CLOSE_A_FRAMES, [4, 2, 5, 5]);
  registerVariableFrames('CLOSE_C', RYO_CLOSE_C_FRAMES, [2, 5, 6, 5]);

  registerVariableFrames('STAND_B', RYO_STAND_B_FRAMES, [7, 3, 2, 12]);
  registerVariableFrames('STAND_D', RYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);
  registerVariableFrames('CLOSE_B', RYO_CLOSE_B_FRAMES, [5, 2, 8]);
  registerVariableFrames('CLOSE_D', RYO_CLOSE_D_FRAMES, [6, 4, 6, 8]);

  registerVariableFrames('HURT', RYO_HURT_FRAMES, [3, 5, 6, 4]);
  registerVariableFrames('KNOCKDOWN', RYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);
  registerVariableFrames('JUMP', RYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);
  registerVariableFrames('CROUCH', RYO_CROUCH_FRAMES, [8, 10, 8, 10]);

  registerVariableFrames('CROUCH_A', RYO_CROUCH_A_FRAMES, [3, 2, 5]);
  registerVariableFrames('CROUCH_C', RYO_CROUCH_C_FRAMES, [5, 3, 5, 10]);
  registerVariableFrames('CROUCH_B', RYO_CROUCH_B_FRAMES, [4, 2, 7]);
  registerVariableFrames('CROUCH_D', RYO_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);

  registerVariableFrames('AIR_A', RYO_AIR_A_FRAMES, [3, 3, 5]);
  registerVariableFrames('AIR_C', RYO_AIR_C_FRAMES, [5, 3, 3, 5]);
  registerVariableFrames('AIR_D', RYO_AIR_D_FRAMES, [4, 3, 3, 5]);

  registerVariableFrames('KO_HOU', RYO_KO_HOU_FRAMES, [4, 3, 5, 7, 10]);
  registerVariableFrames('KOOU', RYO_KOOU_FRAMES, [6, 3, 8, 12]);
  registerVariableFrames('HIEN', RYO_HIEN_FRAMES, [5, 3, 3, 6, 10]);
  registerVariableFrames('HAOU', RYO_HAOU_FRAMES, [8, 4, 14]);
  registerVariableFrames('KOOU_C', RYO_KOOU_C_FRAMES, [4, 3, 10]);
  registerVariableFrames('KO_HOU_C', RYO_KO_HOU_C_FRAMES, [3, 3, 8]);

  registerVariableFrames('DM_TEN_HA_OU', RYO_DM_TEN_HA_OU_FRAMES, [8, 4, 14, 18]);
  registerVariableFrames('DM_RYUKO_RANBU', RYO_DM_RYUKO_RANBU_FRAMES, [4, 3, 4, 6, 12]);
  registerVariableFrames('SDM_TEN_HA_OU', RYO_SDM_TEN_HA_OU_FRAMES, [10, 6, 20]);
  registerVariableFrames('HSDM_RYUKO_RANBU', RYO_HSDM_RYUKO_RANBU_FRAMES, [3, 4, 6, 14]);

  registerVariableFrames('RUN', RYO_RUN_FRAMES, [3, 3, 2, 2, 3, 2]);
  registerVariableFrames('BACKDASH', RYO_BACKDASH_FRAMES, [2, 2, 3, 4]);
  registerVariableFrames('ROLL', RYO_ROLL_FRAMES, [3, 3, 4, 5]);
  registerVariableFrames('BACK_ROLL', RYO_BACK_ROLL_FRAMES, [3, 3, 4, 5]);

  registerVariableFrames('BLOCK', RYO_BLOCK_FRAMES, [3, 8]);
  registerVariableFrames('DIZZY', RYO_DIZZY_FRAMES, [8, 10, 8, 12, 8, 10, 8, 14]);
  registerVariableFrames('THROW', RYO_THROW_FRAMES, [3, 4, 5, 6, 8, 10]);
  registerVariableFrames('GUARD_CRUSH', RYO_GUARD_CRUSH_FRAMES, [4, 10]);
  registerVariableFrames('MAX_MODE', RYO_MAX_MODE_FRAMES, [3, 4, 8]);
  registerVariableFrames('TAUNT', RYO_TAUNT_FRAMES, [10, 14, 12, 16]);
  registerVariableFrames('COUNTER_STANCE', RYO_COUNTER_STANCE_FRAMES, [4, 6, 10]);
  registerVariableFrames('RYUKO_RANBU', RYO_RYUKO_RANBU_FRAMES, [3, 3, 4, 5]);
  registerVariableFrames('WIN', RYO_WIN_FRAMES, [6, 30]);
}

function resolveRyoFrameKey(
  state: FighterState,
  currentAttack: AttackType | null,
  vx: number,
  facing: number,
): string | null {
  switch (state) {
    case FighterState.IDLE: return 'IDLE';
    case FighterState.RUN: return 'RUN';
    case FighterState.BACKDASH: return 'BACKDASH';
    case FighterState.ROLL: return 'ROLL';
    case FighterState.BACK_ROLL: return 'BACK_ROLL';
    case FighterState.WALK: return (vx * facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';
    case FighterState.STAND_ATTACK:
      if (currentAttack === AttackType.STAND_C) return 'STAND_C';
      if (currentAttack === AttackType.CLOSE_C) return 'CLOSE_C';
      if (currentAttack === AttackType.RYO_KO_HOU) return 'KO_HOU';
      if (currentAttack === AttackType.RYO_KO_HOU_C) return 'KO_HOU_C';
      if (currentAttack === AttackType.RYO_KOOU) return 'KOOU';
      if (currentAttack === AttackType.RYO_KOOU_C) return 'KOOU_C';
      if (currentAttack === AttackType.RYO_HIEN) return 'HIEN';
      if (currentAttack === AttackType.RYO_HAOU) return 'HAOU';
      if (currentAttack === AttackType.RYO_KOOUKEN_D) return 'KOOU';
      if (currentAttack === AttackType.RYO_HIO_HACKER) return 'STAND_C';
      if (currentAttack === AttackType.RYO_ZANRETSU_KEN) return 'STAND_A';
      if (currentAttack === AttackType.DM_TEN_HA_OU) return 'DM_TEN_HA_OU';
      if (currentAttack === AttackType.SDM_TEN_HA_OU) return 'SDM_TEN_HA_OU';
      if (currentAttack === AttackType.DM_RYUKO_RANBU || currentAttack === AttackType.SDM_RYUKO_RANBU) return 'RYUKO_RANBU';
      if (currentAttack === AttackType.HSDM_RYUKO_RANBU) return 'HSDM_RYUKO_RANBU';
      if (currentAttack === AttackType.STAND_A) return 'STAND_A';
      if (currentAttack === AttackType.CLOSE_A) return 'CLOSE_A';
      if (currentAttack === AttackType.STAND_B) return 'STAND_B';
      if (currentAttack === AttackType.STAND_D) return 'STAND_D';
      if (currentAttack === AttackType.CLOSE_B) return 'CLOSE_B';
      if (currentAttack === AttackType.CLOSE_D) return 'CLOSE_D';
      if (currentAttack === AttackType.RYO_TSURIZAO) return 'STAND_C';
      return 'STAND_A';
    case FighterState.CROUCH: return 'CROUCH';
    case FighterState.CROUCH_ATTACK:
      if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
      if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
      if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
      if (currentAttack === AttackType.RYO_ORISHI) return 'CROUCH_B';
      return 'CROUCH_A';
    case FighterState.AIR_ATTACK:
      if (currentAttack === AttackType.JUMP_C || currentAttack === AttackType.JUMP_CD) return 'AIR_C';
      if (currentAttack === AttackType.JUMP_D) return 'AIR_D';
      return 'AIR_A';
    case FighterState.HITSTUN: return 'HURT';
    case FighterState.KNOCKDOWN: return 'KNOCKDOWN';
    case FighterState.GETUP: return 'KNOCKDOWN';
    case FighterState.JUMP:
    case FighterState.HOP:
    case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP: return 'JUMP';
    case FighterState.THROW: return 'THROW';
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK: return 'BLOCK';
    case FighterState.DIZZY: return 'DIZZY';
    case FighterState.GUARD_CRUSH: return 'GUARD_CRUSH';
    case FighterState.MAX_MODE: return 'MAX_MODE';
    case FighterState.TAUNT: return 'TAUNT';
    case FighterState.COUNTER_STANCE: return 'COUNTER_STANCE';
    default: return null;
  }
}

const RYO_TARGET_DISPLAY_HEIGHT = 144;

export function hasHighResFrame(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  if (charId !== 'ryo') return false;
  initRyoFrames();
  const key = resolveRyoFrameKey(state, currentAttack, vx, facing);
  return key !== null && RYO_FRAMES.has(key);
}

export function getResolvedFrameKey(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): string | null {
  if (charId !== 'ryo') return null;
  initRyoFrames();
  return resolveRyoFrameKey(state, currentAttack, vx, facing);
}

export function drawHighResFrame(
  ctx: CanvasRenderingContext2D,
  charId: string,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
): boolean {
  if (charId !== 'ryo') return false;
  initRyoFrames();
  const key = resolveRyoFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawFromRegistry(ctx, RYO_FRAMES, FRAME_CACHE, key, stateAge, x, y, facing, RYO_TARGET_DISPLAY_HEIGHT);
}

export function drawHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  charId: string,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#ff8844',
  alpha: number = 0.25,
): boolean {
  if (charId !== 'ryo') return false;
  initRyoFrames();
  const key = resolveRyoFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawAfterimageFromRegistry(ctx, RYO_FRAMES, key, stateAge, x, y, facing, RYO_TARGET_DISPLAY_HEIGHT, tint, alpha);
}

export function drawRyoWinPose(
  ctx: CanvasRenderingContext2D,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
): boolean {
  initRyoFrames();
  const entry = RYO_FRAMES.get('WIN');
  if (!entry) return false;
  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;
  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = RYO_TARGET_DISPLAY_HEIGHT / frame.height;
  drawPixelFrame(ctx, frame, x, y, scale, facing, palette);
  return true;
}
