/**
 * kyoHighResRender.ts
 *
 * Kyo-specific integration layer using the shared HighResFrameRegistry.
 *
 * This module only provides:
 * 1. Frame data imports and registration (initKyoFrames)
 * 2. State → registry key resolution (resolveKyoFrameKey)
 *
 * All conversion, caching, prerendering, and drawing is handled by baseHighResRenderer.
 *
 * Covers: IDLE, WALK (fwd/back), STAND_ATTACK (A/B/C/D + close variants),
 *   CROUCH, CROUCH_ATTACK (A/B/C/D), AIR_ATTACK (A/C/D), BLOCK,
 *   JUMP (all jump types), HITSTUN, KNOCKDOWN
 */

import { FighterState, AttackType } from '../../../core/types.js';
import {
  registerFrames as reg,
  registerVariableFrames as regV,
  drawFromRegistry,
  drawAfterimageFromRegistry,
  type FrameEntry,
} from '../shared/baseHighResRenderer.js';
import { KYO_IDLE_FRAMES } from './kyoIdleFrames.js';
import { KYO_WALK_FORWARD_FRAMES, KYO_WALK_BACKWARD_FRAMES } from './kyoWalkFrames.js';
import { KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES } from './kyoAttackFrames.js';
import { KYO_CROUCH_FRAMES } from './kyoCrouchFrames.js';
import { KYO_JUMP_FRAMES } from './kyoJumpFrames.js';
import { KYO_HURT_FRAMES, KYO_KNOCKDOWN_FRAMES, KYO_BLOCK_FRAMES } from './kyoDamageFrames.js';
import { KYO_STAND_B_FRAMES, KYO_STAND_D_FRAMES } from './kyoKickFrames.js';
import { KYO_CROUCH_A_FRAMES, KYO_CROUCH_C_FRAMES, KYO_CROUCH_B_FRAMES, KYO_CROUCH_D_FRAMES } from './kyoCrouchAttackFrames.js';
import { KYO_AIR_A_FRAMES, KYO_AIR_C_FRAMES, KYO_AIR_D_FRAMES } from './kyoAirAttackFrames.js';
import { KYO_CLOSE_A_FRAMES, KYO_CLOSE_C_FRAMES, KYO_CLOSE_B_FRAMES, KYO_CLOSE_D_FRAMES } from './kyoCloseAttackFrames.js';
import { KYO_ONIYAKI_FRAMES, KYO_ONIYAKI_C_FRAMES, KYO_YAMIBARAI_FRAMES, KYO_RED_KICK_FRAMES, KYO_75KAI_FRAMES, KYO_ARAGAMI_FRAMES, KYO_DOKUGAMI_FRAMES, KYO_OROCHINAGI_DM_FRAMES, KYO_OROCHINAGI_SDM_FRAMES } from './kyoSpecialFrames.js';

// ===== Registry & Cache =====

const KYO_FRAMES = new Map<string, FrameEntry>();
const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

// ===== Registration =====

let initialized = false;

/** Shorthand helpers bound to Kyo's registry */
const registerFrames = (key: string, frames: Parameters<typeof reg>[2], tpf: number) =>
  reg(KYO_FRAMES, key, frames, tpf);
const registerVariableFrames = (key: string, frames: Parameters<typeof regV>[2], durations: number[]) =>
  regV(KYO_FRAMES, key, frames, durations);

function initKyoFrames(): void {
  if (initialized) return;
  initialized = true;

  registerVariableFrames('IDLE', KYO_IDLE_FRAMES, [8, 9, 12, 9, 10, 8]);
  registerFrames('WALK_FORWARD', KYO_WALK_FORWARD_FRAMES, 6);
  registerFrames('WALK_BACKWARD', KYO_WALK_BACKWARD_FRAMES, 7);

  // Stand punches
  registerVariableFrames('STAND_A', KYO_STAND_A_FRAMES, [6, 3, 2, 5]);
  registerVariableFrames('STAND_C', KYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);

  // Stand kicks
  registerVariableFrames('STAND_B', KYO_STAND_B_FRAMES, [7, 3, 2, 12]);
  registerVariableFrames('STAND_D', KYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);

  // Close attacks
  registerVariableFrames('CLOSE_A', KYO_CLOSE_A_FRAMES, [4, 2, 5, 5]);
  registerVariableFrames('CLOSE_C', KYO_CLOSE_C_FRAMES, [2, 5, 6, 5]);
  registerVariableFrames('CLOSE_B', KYO_CLOSE_B_FRAMES, [5, 2, 8]);
  registerVariableFrames('CLOSE_D', KYO_CLOSE_D_FRAMES, [6, 4, 6, 8]);

  // Crouch
  registerVariableFrames('CROUCH', KYO_CROUCH_FRAMES, [8, 10, 8, 10]);

  // Crouch attacks
  registerVariableFrames('CROUCH_A', KYO_CROUCH_A_FRAMES, [3, 2, 5]);
  registerVariableFrames('CROUCH_C', KYO_CROUCH_C_FRAMES, [5, 3, 5, 10]);
  registerVariableFrames('CROUCH_B', KYO_CROUCH_B_FRAMES, [4, 2, 7]);
  registerVariableFrames('CROUCH_D', KYO_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);

  // Air attacks
  registerVariableFrames('AIR_A', KYO_AIR_A_FRAMES, [3, 3, 5]);
  registerVariableFrames('AIR_C', KYO_AIR_C_FRAMES, [5, 3, 3, 5]);
  registerVariableFrames('AIR_D', KYO_AIR_D_FRAMES, [4, 3, 3, 5]);

  // Block
  registerVariableFrames('BLOCK', KYO_BLOCK_FRAMES, [3, 8]);

  // Jump
  registerVariableFrames('JUMP', KYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);

  // Special moves
  registerVariableFrames('ONIYAKI', KYO_ONIYAKI_FRAMES, [4, 3, 5, 7, 10]);
  registerVariableFrames('ONIYAKI_C', KYO_ONIYAKI_C_FRAMES, [4, 3, 5, 6, 7, 10]);
  registerVariableFrames('YAMIBARAI', KYO_YAMIBARAI_FRAMES, [6, 3, 8, 12]);
  registerVariableFrames('RED_KICK', KYO_RED_KICK_FRAMES, [5, 3, 3, 6, 10]);
  registerVariableFrames('75KAI', KYO_75KAI_FRAMES, [5, 3, 3, 8]);
  registerVariableFrames('ARAGAMI', KYO_ARAGAMI_FRAMES, [6, 4, 8, 12]);
  registerVariableFrames('DOKUGAMI', KYO_DOKUGAMI_FRAMES, [7, 5, 10, 12]);
  registerVariableFrames('OROCHINAGI_DM', KYO_OROCHINAGI_DM_FRAMES, [8, 4, 14, 8, 12]);
  registerVariableFrames('OROCHINAGI_SDM', KYO_OROCHINAGI_SDM_FRAMES, [10, 6, 20, 12, 8, 10]);

  // Damage
  registerVariableFrames('HURT', KYO_HURT_FRAMES, [3, 5, 6, 4]);
  registerVariableFrames('KNOCKDOWN', KYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);
}

// ===== State Resolution =====

function resolveKyoFrameKey(
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
    case FighterState.STAND_ATTACK:
      if (currentAttack === AttackType.KYO_ONIYAKI) return 'ONIYAKI';
      if (currentAttack === AttackType.KYO_ONIYAKI_C) return 'ONIYAKI_C';
      if (currentAttack === AttackType.KYO_YAMIBARAI) return 'YAMIBARAI';
      if (currentAttack === AttackType.KYO_YAMIBARAI_C) return 'YAMIBARAI';
      if (currentAttack === AttackType.KYO_RED_KICK) return 'RED_KICK';
      if (currentAttack === AttackType.KYO_75KAI || currentAttack === AttackType.KYO_75KAI_2) return '75KAI';
      if (currentAttack === AttackType.KYO_ARAGAMI || currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU ||
          currentAttack === AttackType.KYO_ARAGAMI_YANOSABI || currentAttack === AttackType.KYO_NANASE ||
          currentAttack === AttackType.KYO_KOTO_TSUKI || currentAttack === AttackType.KYO_YAKISOGI) return 'ARAGAMI';
      if (currentAttack === AttackType.KYO_DOKUGAMI || currentAttack === AttackType.KYO_TSUMIYOMI ||
          currentAttack === AttackType.KYO_BATSUYOMI) return 'DOKUGAMI';
      if (currentAttack === AttackType.DM_OROCHINAGI) return 'OROCHINAGI_DM';
      if (currentAttack === AttackType.SDM_OROCHINAGI) return 'OROCHINAGI_SDM';
      if (currentAttack === AttackType.STAND_C) return 'STAND_C';
      if (currentAttack === AttackType.CLOSE_C) return 'CLOSE_C';
      if (currentAttack === AttackType.STAND_D) return 'STAND_D';
      if (currentAttack === AttackType.CLOSE_D) return 'CLOSE_D';
      if (currentAttack === AttackType.STAND_B) return 'STAND_B';
      if (currentAttack === AttackType.CLOSE_B) return 'CLOSE_B';
      if (currentAttack === AttackType.CLOSE_A) return 'CLOSE_A';
      return 'STAND_A';
    case FighterState.CROUCH:
      return 'CROUCH';
    case FighterState.CROUCH_ATTACK:
      if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
      if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
      if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
      return 'CROUCH_A';
    case FighterState.BLOCK:
      return 'BLOCK';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
      return 'JUMP';
    case FighterState.AIR_ATTACK:
      if (currentAttack === AttackType.JUMP_C) return 'AIR_C';
      if (currentAttack === AttackType.JUMP_D) return 'AIR_D';
      return 'AIR_A';
    case FighterState.HITSTUN:
      return 'HURT';
    case FighterState.KNOCKDOWN:
      return 'KNOCKDOWN';
    default:
      return null;
  }
}

// ===== Public API =====

const KYO_TARGET_DISPLAY_HEIGHT = 144;

export function hasKyoHighResFrame(
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  initKyoFrames();
  const key = resolveKyoFrameKey(state, currentAttack, vx, facing);
  return key !== null && KYO_FRAMES.has(key);
}

export function drawKyoHighResFrame(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
): boolean {
  initKyoFrames();
  const key = resolveKyoFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawFromRegistry(ctx, KYO_FRAMES, FRAME_CACHE, key, stateAge, x, y, facing, KYO_TARGET_DISPLAY_HEIGHT);
}

export function drawKyoHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#ff6600',
  alpha: number = 0.25,
): boolean {
  initKyoFrames();
  const key = resolveKyoFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return drawAfterimageFromRegistry(ctx, KYO_FRAMES, key, stateAge, x, y, facing, KYO_TARGET_DISPLAY_HEIGHT, tint, alpha);
}
