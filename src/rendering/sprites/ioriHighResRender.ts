/**
 * ioriHighResRender.ts
 *
 * Iori-specific integration layer using the shared HighResFrameRegistry.
 *
 * Covers: IDLE, WALK (fwd/back), STAND_ATTACK (A/B/C/D + close variants),
 *   CROUCH, CROUCH_ATTACK, JUMP (all types), AIR_ATTACK, AIR_BLOCK,
 *   HITSTUN, KNOCKDOWN, GETUP, BLOCK
 */

import { FighterState, AttackType } from '../../core/types.js';
import {
  registerFrames as reg,
  registerVariableFrames as regV,
  drawFromRegistry,
  drawAfterimageFromRegistry,
  type FrameEntry,
} from './baseHighResRenderer.js';
import { IORI_IDLE_FRAMES } from './ioriIdleFrames.js';
import { IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES } from './ioriWalkFrames.js';
import { IORI_CROUCH_FRAMES } from './ioriCrouchFrames.js';
import { IORI_STAND_A_FRAMES, IORI_STAND_C_FRAMES } from './ioriAttackFrames.js';
import { IORI_JUMP_FRAMES } from './ioriJumpFrames.js';
import { IORI_HURT_FRAMES, IORI_KNOCKDOWN_FRAMES, IORI_BLOCK_FRAMES } from './ioriDamageFrames.js';
import { IORI_STAND_B_FRAMES, IORI_STAND_D_FRAMES } from './ioriKickFrames.js';

const IORI_FRAMES = new Map<string, FrameEntry>();
const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

const registerFrames = (key: string, frames: Parameters<typeof reg>[2], tpf: number) =>
  reg(IORI_FRAMES, key, frames, tpf);
const registerVariableFrames = (key: string, frames: Parameters<typeof regV>[2], durations: number[]) =>
  regV(IORI_FRAMES, key, frames, durations);

let initialized = false;

function initIoriFrames(): void {
  if (initialized) return;
  initialized = true;

  registerVariableFrames('IDLE', IORI_IDLE_FRAMES, [8, 9, 12, 9, 10, 8]);
  registerFrames('WALK_FORWARD', IORI_WALK_FORWARD_FRAMES, 6);
  registerFrames('WALK_BACKWARD', IORI_WALK_BACKWARD_FRAMES, 7);
  registerFrames('CROUCH', IORI_CROUCH_FRAMES, 8);

  registerVariableFrames('STAND_A', IORI_STAND_A_FRAMES, [4, 3, 4, 8]);
  registerVariableFrames('STAND_C', IORI_STAND_C_FRAMES, [6, 4, 5, 5, 10]);
  registerVariableFrames('STAND_B', IORI_STAND_B_FRAMES, [5, 3, 3, 9]);
  registerVariableFrames('STAND_D', IORI_STAND_D_FRAMES, [8, 4, 4, 6, 10]);

  registerVariableFrames('JUMP', IORI_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);
  registerVariableFrames('HURT', IORI_HURT_FRAMES, [3, 5, 6, 4]);
  registerVariableFrames('KNOCKDOWN', IORI_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);
  registerVariableFrames('BLOCK', IORI_BLOCK_FRAMES, [3, 8, 5, 4]);
}

function resolveIoriFrameKey(
  state: FighterState,
  currentAttack: AttackType | null,
  vx: number,
  facing: number,
): string | null {
  switch (state) {
    case FighterState.IDLE:
      return 'IDLE';
    case FighterState.WALK:
      return (vx * facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';
    case FighterState.CROUCH:
    case FighterState.CROUCH_ATTACK:
      return 'CROUCH';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
    case FighterState.AIR_ATTACK:
    case FighterState.AIR_BLOCK:
      return 'JUMP';
    case FighterState.STAND_ATTACK:
      if (currentAttack === AttackType.STAND_C || currentAttack === AttackType.CLOSE_C) return 'STAND_C';
      if (currentAttack === AttackType.STAND_D || currentAttack === AttackType.CLOSE_D) return 'STAND_D';
      if (currentAttack === AttackType.STAND_B || currentAttack === AttackType.CLOSE_B) return 'STAND_B';
      return 'STAND_A';
    case FighterState.HITSTUN:
      return 'HURT';
    case FighterState.KNOCKDOWN:
    case FighterState.GETUP:
      return 'KNOCKDOWN';
    case FighterState.BLOCK:
      return 'BLOCK';
    default:
      return null;
  }
}

const IORI_TARGET_DISPLAY_HEIGHT = 144;

export function hasIoriHighResFrame(
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  initIoriFrames();
  const key = resolveIoriFrameKey(state, currentAttack, vx, facing);
  return key !== null && IORI_FRAMES.has(key);
}

export function drawIoriHighResFrame(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
): boolean {
  initIoriFrames();
  const key = resolveIoriFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawFromRegistry(ctx, IORI_FRAMES, FRAME_CACHE, key, stateAge, x, y, facing, IORI_TARGET_DISPLAY_HEIGHT);
}

export function drawIoriHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#aa00ff',
  alpha: number = 0.25,
): boolean {
  initIoriFrames();
  const key = resolveIoriFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawAfterimageFromRegistry(ctx, IORI_FRAMES, key, stateAge, x, y, facing, IORI_TARGET_DISPLAY_HEIGHT, tint, alpha);
}
