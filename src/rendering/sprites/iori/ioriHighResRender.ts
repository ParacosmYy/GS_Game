/**
 * ioriHighResRender.ts
 *
 * Iori-specific integration layer using the shared HighResFrameRegistry.
 *
 * Covers: IDLE, WALK (fwd/back), STAND_ATTACK (A/B/C/D + close variants),
 *   CROUCH, CROUCH_ATTACK, JUMP (all types), AIR_ATTACK, AIR_BLOCK,
 *   HITSTUN, KNOCKDOWN, GETUP, BLOCK
 */

import { FighterState, AttackType } from '../../../core/types.js';
import {
  registerFrames as reg,
  registerVariableFrames as regV,
  drawFromRegistry,
  drawAfterimageFromRegistry,
  type FrameEntry,
} from '../shared/baseHighResRenderer.js';
import { drawPixelFrame } from '../shared/pixelFrameRenderer.js';
import { IORI_IDLE_FRAMES } from './ioriIdleFrames.js';
import { IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES } from './ioriWalkFrames.js';
import { IORI_CROUCH_FRAMES } from './ioriCrouchFrames.js';
import { IORI_STAND_A_FRAMES, IORI_STAND_C_FRAMES } from './ioriAttackFrames.js';
import { IORI_JUMP_FRAMES } from './ioriJumpFrames.js';
import { IORI_HURT_FRAMES, IORI_KNOCKDOWN_FRAMES, IORI_BLOCK_FRAMES } from './ioriDamageFrames.js';
import { IORI_STAND_B_FRAMES, IORI_STAND_D_FRAMES } from './ioriKickFrames.js';
import { IORI_CROUCH_A_FRAMES, IORI_CROUCH_C_FRAMES, IORI_CROUCH_B_FRAMES, IORI_CROUCH_D_FRAMES } from './ioriCrouchAttackFrames.js';
import { IORI_AIR_A_FRAMES, IORI_AIR_C_FRAMES, IORI_AIR_D_FRAMES } from './ioriAirAttackFrames.js';
import { IORI_WIN_POSE, IORI_WIN_LAUGH } from './ioriWinFrames.js';
import {
  IORI_ONIYAKI_FRAMES, IORI_ONIYAKI_C_FRAMES,
  IORI_YAMIBARAI_FRAMES, IORI_YAMIBARAI_C_FRAMES,
  IORI_AOIHANA_FRAMES, IORI_AOIHANA_2_FRAMES, IORI_AOIHANA_3_FRAMES,
  IORI_KOTOTSUKI_FRAMES, IORI_KOTOTSUKI_D_FRAMES,
  IORI_KUZUKAZE_FRAMES,
  IORI_YATAGARASU_DM_FRAMES, IORI_YATAGARASU_SDM_FRAMES,
  IORI_YAOTOME_HSDM_FRAMES,
} from './ioriSpecialFrames.js';
import {
  IORI_RUN_FRAMES, IORI_BACKDASH_FRAMES,
  IORI_ROLL_FRAMES, IORI_BACK_ROLL_FRAMES,
  IORI_GUARD_CRUSH_FRAMES, IORI_MAX_MODE_FRAMES, IORI_TAUNT_FRAMES,
  IORI_COUNTER_STANCE_FRAMES,
} from './ioriMovementFrames.js';
import { IORI_DIZZY_FRAMES } from './ioriDizzyFrames.js';
import { IORI_THROW_FRAMES } from './ioriThrowFrames.js';
import { IORI_YUMEYUMI_FRAMES, IORI_KATANUGI_FRAMES, IORI_YUKIWARUI_FRAMES } from './ioriCommandNormalFrames.js';

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

  // CROUCH ATTACKS
  registerVariableFrames('CROUCH_A', IORI_CROUCH_A_FRAMES, [3, 2, 5]);
  registerVariableFrames('CROUCH_C', IORI_CROUCH_C_FRAMES, [5, 3, 5, 10]);
  registerVariableFrames('CROUCH_B', IORI_CROUCH_B_FRAMES, [4, 2, 7]);
  registerVariableFrames('CROUCH_D', IORI_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);

  // AIR ATTACKS
  registerVariableFrames('AIR_A', IORI_AIR_A_FRAMES, [3, 3, 5]);
  registerVariableFrames('AIR_C', IORI_AIR_C_FRAMES, [5, 3, 3, 5]);
  registerVariableFrames('AIR_D', IORI_AIR_D_FRAMES, [4, 3, 3, 5]);

  // WIN pose
  registerVariableFrames('WIN', [IORI_WIN_POSE, IORI_WIN_LAUGH], [6, 30]);

  // SPECIAL MOVES
  registerVariableFrames('ONIYAKI', IORI_ONIYAKI_FRAMES, [3, 4, 5, 8, 10]);
  registerVariableFrames('ONIYAKI_C', IORI_ONIYAKI_C_FRAMES, [4, 4, 6, 6, 8, 10]);
  registerVariableFrames('YAMIBARAI', IORI_YAMIBARAI_FRAMES, [5, 4, 6, 12]);
  registerVariableFrames('AOIHANA', IORI_AOIHANA_FRAMES, [4, 3, 5, 8]);
  registerVariableFrames('AOIHANA_2', IORI_AOIHANA_2_FRAMES, [4, 3, 5, 8]);
  registerVariableFrames('AOIHANA_3', IORI_AOIHANA_3_FRAMES, [4, 3, 5, 10]);
  registerVariableFrames('KOTOTSUKI', IORI_KOTOTSUKI_FRAMES, [5, 6, 4, 6, 8]);
  registerVariableFrames('KOTOTSUKI_D', IORI_KOTOTSUKI_D_FRAMES, [5, 8, 4, 6, 8]);
  registerVariableFrames('KUZUKAZE', IORI_KUZUKAZE_FRAMES, [4, 5, 4, 8]);

  // DM / SDM / HSDM
  registerVariableFrames('YATAGARASU_DM', IORI_YATAGARASU_DM_FRAMES, [8, 6, 12, 8, 12]);
  registerVariableFrames('YATAGARASU_SDM', IORI_YATAGARASU_SDM_FRAMES, [10, 6, 16, 12, 10, 12]);
  registerVariableFrames('YAOTOME_HSDM', IORI_YAOTOME_HSDM_FRAMES, [8, 4, 6, 16, 10, 12]);

  // MOVEMENT STATES
  registerVariableFrames('RUN', IORI_RUN_FRAMES, [3, 3, 2, 2, 3, 2]);
  registerVariableFrames('BACKDASH', IORI_BACKDASH_FRAMES, [2, 2, 3, 4]);
  registerVariableFrames('ROLL', IORI_ROLL_FRAMES, [3, 3, 4, 5]);
  registerVariableFrames('BACK_ROLL', IORI_BACK_ROLL_FRAMES, [3, 3, 4, 5]);

  // DIZZY + THROW + GUARD_CRUSH + MAX_MODE + TAUNT
  registerVariableFrames('DIZZY', IORI_DIZZY_FRAMES, [8, 10, 8, 12, 8, 10, 8, 14]);
  registerVariableFrames('THROW', IORI_THROW_FRAMES, [3, 4, 5, 6, 8, 10]);
  registerVariableFrames('GUARD_CRUSH', IORI_GUARD_CRUSH_FRAMES, [4, 10]);
  registerVariableFrames('MAX_MODE', IORI_MAX_MODE_FRAMES, [3, 4, 8]);
  registerVariableFrames('TAUNT', IORI_TAUNT_FRAMES, [10, 14, 12, 16]);
  registerVariableFrames('COUNTER_STANCE', IORI_COUNTER_STANCE_FRAMES, [4, 6, 10, 8]);

  // Command normals
  registerVariableFrames('CMD_YUMEYUMI', IORI_YUMEYUMI_FRAMES, [8, 3, 4, 20]);
  registerVariableFrames('CMD_KATANUGI', IORI_KATANUGI_FRAMES, [10, 3, 4, 22]);
  registerVariableFrames('CMD_YUKIWARUI', IORI_YUKIWARUI_FRAMES, [6, 4, 18]);
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
      return 'CROUCH';
    case FighterState.CROUCH_ATTACK:
      if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
      if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
      if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
      return 'CROUCH_A';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
    case FighterState.AIR_BLOCK:
      return 'JUMP';
    case FighterState.AIR_ATTACK:
      if (currentAttack === AttackType.JUMP_C) return 'AIR_C';
      if (currentAttack === AttackType.JUMP_D) return 'AIR_D';
      return 'AIR_A';
    case FighterState.STAND_ATTACK:
      // Special moves
      if (currentAttack === AttackType.IORI_ONIYAKI) return 'ONIYAKI';
      if (currentAttack === AttackType.IORI_ONIYAKI_C) return 'ONIYAKI_C';
      if (currentAttack === AttackType.IORI_YAMIBARAI) return 'YAMIBARAI';
      if (currentAttack === AttackType.IORI_YAMIBARAI_C) return 'YAMIBARAI';
      if (currentAttack === AttackType.IORI_AOIHANA) return 'AOIHANA';
      if (currentAttack === AttackType.IORI_AOIHANA_2) return 'AOIHANA_2';
      if (currentAttack === AttackType.IORI_AOIHANA_3) return 'AOIHANA_3';
      if (currentAttack === AttackType.IORI_AOIHANA_C) return 'AOIHANA';
      if (currentAttack === AttackType.IORI_AOIHANA_C_2) return 'AOIHANA_2';
      if (currentAttack === AttackType.IORI_AOIHANA_C_3) return 'AOIHANA_3';
      if (currentAttack === AttackType.IORI_KOTOTSUKI) return 'KOTOTSUKI';
      if (currentAttack === AttackType.IORI_KOTOTSUKI_D) return 'KOTOTSUKI_D';
      if (currentAttack === AttackType.IORI_KUZUKAZE) return 'KUZUKAZE';
      // DM / SDM / HSDM
      if (currentAttack === AttackType.DM_YATAGARASU) return 'YATAGARASU_DM';
      if (currentAttack === AttackType.SDM_YATAGARASU) return 'YATAGARASU_SDM';
      if (currentAttack === AttackType.HSDM_YAOTOME) return 'YAOTOME_HSDM';
      // Command normals
      if (currentAttack === AttackType.IORI_YUMEYUMI) return 'CMD_YUMEYUMI';
      if (currentAttack === AttackType.IORI_KATANUGI) return 'CMD_KATANUGI';
      if (currentAttack === AttackType.IORI_YUKIWARUI) return 'CMD_YUKIWARUI';
      // Normals
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
    case FighterState.RUN:
      return 'RUN';
    case FighterState.BACKDASH:
      return 'BACKDASH';
    case FighterState.ROLL:
      return 'ROLL';
    case FighterState.BACK_ROLL:
      return 'BACK_ROLL';
    case FighterState.THROW:
      return 'THROW';
    case FighterState.DIZZY:
      return 'DIZZY';
    case FighterState.GUARD_CRUSH:
      return 'GUARD_CRUSH';
    case FighterState.MAX_MODE:
      return 'MAX_MODE';
    case FighterState.TAUNT:
      return 'TAUNT';
    case FighterState.COUNTER_STANCE:
      return 'COUNTER_STANCE';
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

export function drawIoriWinPose(
  ctx: CanvasRenderingContext2D,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
): boolean {
  initIoriFrames();
  const entry = IORI_FRAMES.get('WIN');
  if (!entry) return false;
  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;
  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = IORI_TARGET_DISPLAY_HEIGHT / frame.height;
  drawPixelFrame(ctx, frame, x, y, scale, facing, palette);
  return true;
}
