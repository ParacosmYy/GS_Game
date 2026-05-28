/**
 * ryoHighResRender.ts
 *
 * Ryo-specific integration layer using the shared HighResFrameRegistry factory.
 * After calling initRyoRealSprites(), real MUGEN pixel art replaces procedural frames.
 */

import { FighterState, AttackType } from '../../../core/types.js';
import { createHighResRenderer, type SpriteImageFrame } from '../shared/baseHighResRenderer.js';
import { loadRealSprites, resolveRyoMugenAction } from '../shared/realSpriteLoader.js';
import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from './ryoWalkFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES, RYO_CLOSE_A_FRAMES, RYO_CLOSE_C_FRAMES } from './ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from './ryoKickFrames.js';
import { RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES } from './ryoCrouchKickFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from './ryoCloseKickFrames.js';
import { RYO_JUMP_FRAMES } from './ryoJumpFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from './ryoDamageFrames.js';
import { RYO_CROUCH_FRAMES, RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from './ryoCrouchFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_B_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES } from './ryoAirAttackFrames.js';
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
import { RYO_TSURIZAO_FRAMES, RYO_ORISHI_FRAMES } from './ryoCommandNormalFrames.js';

function ryoResolveKey(state: FighterState, currentAttack: AttackType | null, vx: number, facing: number): string | null {
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
      if (currentAttack === AttackType.RYO_TSURIZAO) return 'CMD_TSURIZAO';
      return 'STAND_A';
    case FighterState.CROUCH: return 'CROUCH';
    case FighterState.CROUCH_ATTACK:
      if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
      if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
      if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
      if (currentAttack === AttackType.RYO_ORISHI) return 'CMD_ORISHI';
      return 'CROUCH_A';
    case FighterState.AIR_ATTACK:
      if (currentAttack === AttackType.JUMP_C || currentAttack === AttackType.JUMP_CD) return 'AIR_C';
      if (currentAttack === AttackType.JUMP_D) return 'AIR_D';
      if (currentAttack === AttackType.JUMP_B) return 'AIR_B';
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
    case FighterState.WIN: return 'WIN';
    case FighterState.COUNTER_STANCE: return 'COUNTER_STANCE';
    default: return null;
  }
}

/** Register all procedural Ryo frames */
function registerRyoProceduralFrames(
  regV: (key: string, frames: any[], durations: number[]) => void,
): void {
  regV('IDLE', RYO_IDLE_FRAMES, [7, 8, 9, 12, 9, 8, 10, 7]);
  regV('WALK_FORWARD', RYO_WALK_FORWARD_FRAMES, [7, 5, 7, 7, 5, 7]);
  regV('WALK_BACKWARD', RYO_WALK_BACKWARD_FRAMES, [8, 6, 8, 8, 6, 8]);
  regV('STAND_A', RYO_STAND_A_FRAMES, [6, 3, 2, 5]);
  regV('STAND_C', RYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);
  regV('CLOSE_A', RYO_CLOSE_A_FRAMES, [4, 2, 5, 5]);
  regV('CLOSE_C', RYO_CLOSE_C_FRAMES, [2, 5, 6, 5]);
  regV('STAND_B', RYO_STAND_B_FRAMES, [7, 3, 2, 12]);
  regV('STAND_D', RYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);
  regV('CLOSE_B', RYO_CLOSE_B_FRAMES, [5, 2, 8]);
  regV('CLOSE_D', RYO_CLOSE_D_FRAMES, [6, 4, 6, 8]);
  regV('HURT', RYO_HURT_FRAMES, [3, 5, 6, 4]);
  regV('KNOCKDOWN', RYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);
  regV('JUMP', RYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);
  regV('CROUCH', RYO_CROUCH_FRAMES, [8, 10, 8, 10]);
  regV('CROUCH_A', RYO_CROUCH_A_FRAMES, [3, 2, 5]);
  regV('CROUCH_C', RYO_CROUCH_C_FRAMES, [5, 3, 5, 10]);
  regV('CROUCH_B', RYO_CROUCH_B_FRAMES, [4, 2, 7]);
  regV('CROUCH_D', RYO_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);
  regV('AIR_A', RYO_AIR_A_FRAMES, [3, 3, 5]);
  regV('AIR_B', RYO_AIR_B_FRAMES, [3, 2, 4]);
  regV('AIR_C', RYO_AIR_C_FRAMES, [5, 3, 3, 5]);
  regV('AIR_D', RYO_AIR_D_FRAMES, [4, 3, 3, 5]);
  regV('KO_HOU', RYO_KO_HOU_FRAMES, [4, 3, 5, 7, 10]);
  regV('KOOU', RYO_KOOU_FRAMES, [6, 3, 8, 12]);
  regV('HIEN', RYO_HIEN_FRAMES, [5, 3, 3, 6, 10]);
  regV('HAOU', RYO_HAOU_FRAMES, [8, 4, 14]);
  regV('KOOU_C', RYO_KOOU_C_FRAMES, [4, 3, 10]);
  regV('KO_HOU_C', RYO_KO_HOU_C_FRAMES, [3, 3, 8]);
  regV('DM_TEN_HA_OU', RYO_DM_TEN_HA_OU_FRAMES, [8, 4, 14, 18]);
  regV('DM_RYUKO_RANBU', RYO_DM_RYUKO_RANBU_FRAMES, [4, 3, 4, 6, 12]);
  regV('SDM_TEN_HA_OU', RYO_SDM_TEN_HA_OU_FRAMES, [10, 6, 20]);
  regV('HSDM_RYUKO_RANBU', RYO_HSDM_RYUKO_RANBU_FRAMES, [3, 4, 6, 14]);
  regV('RUN', RYO_RUN_FRAMES, [3, 3, 2, 2, 3, 2]);
  regV('BACKDASH', RYO_BACKDASH_FRAMES, [2, 2, 3, 4]);
  regV('ROLL', RYO_ROLL_FRAMES, [3, 3, 4, 5]);
  regV('BACK_ROLL', RYO_BACK_ROLL_FRAMES, [3, 3, 4, 5]);
  regV('BLOCK', RYO_BLOCK_FRAMES, [3, 8]);
  regV('DIZZY', RYO_DIZZY_FRAMES, [8, 10, 8, 12, 8, 10, 8, 14]);
  regV('THROW', RYO_THROW_FRAMES, [3, 4, 5, 6, 8, 10]);
  regV('CMD_TSURIZAO', RYO_TSURIZAO_FRAMES, [12, 3, 4, 18]);
  regV('CMD_ORISHI', RYO_ORISHI_FRAMES, [6, 3, 4, 20]);
  regV('GUARD_CRUSH', RYO_GUARD_CRUSH_FRAMES, [4, 10]);
  regV('MAX_MODE', RYO_MAX_MODE_FRAMES, [3, 4, 8]);
  regV('TAUNT', RYO_TAUNT_FRAMES, [10, 14, 12, 16]);
  regV('COUNTER_STANCE', RYO_COUNTER_STANCE_FRAMES, [4, 6, 10]);
  regV('RYUKO_RANBU', RYO_RYUKO_RANBU_FRAMES, [3, 3, 4, 5]);
  regV('WIN', RYO_WIN_FRAMES, [6, 8, 10, 30]);
}

const renderer = createHighResRenderer({
  targetDisplayHeight: 144,
  defaultTint: '#ff8844',
  setup(_, regV) { registerRyoProceduralFrames(regV); },
  resolveKey: ryoResolveKey,
});

// Mutable renderer for real sprite swap
let activeRenderer = renderer;
let realSpriteInitialized = false;

function currentRenderer() { return activeRenderer; }

// Backward-compatible exports — Ryo's API takes charId for generic pipeline dispatch

export function hasHighResFrame(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  if (charId !== 'ryo') return false;
  return currentRenderer().has(state, currentAttack, vx, facing);
}

export function getResolvedFrameKey(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): string | null {
  if (charId !== 'ryo') return null;
  return currentRenderer().resolveKey(state, currentAttack, vx, facing);
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
  return currentRenderer().draw(ctx, state, stateAge, x, y, facing, currentAttack, vx);
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
  return currentRenderer().drawAfterimage(ctx, state, stateAge, x, y, facing, currentAttack, vx, tint, alpha);
}

export function drawRyoWinPose(
  ctx: CanvasRenderingContext2D,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
): boolean {
  return currentRenderer().drawWinPose(ctx, stateAge, x, y, facing);
}

/**
 * Load real MUGEN sprites for Ryo and inject them into the renderer.
 * After this, drawHighResFrame() for charId='ryo' will draw real pixel art.
 * Falls back to procedural frames for any missing actions.
 */
export async function initRyoRealSprites(): Promise<void> {
  if (realSpriteInitialized) return;

  try {
    const imageFrames = await loadRealSprites(
      '/sprites/cvsryo/manifest.json',
      '/sprites/cvsryo',
    );

    const enhancedRenderer = createHighResRenderer({
      targetDisplayHeight: 107,
      defaultTint: '#ff8844',
      setup(_, regV) { registerRyoProceduralFrames(regV); },
      resolveKey: resolveRyoMugenAction,
      imageSetup(regImg) {
        for (const [actionId, frames] of imageFrames) {
          regImg(actionId, frames);
        }
        // Alias: drawWinPose looks up 'WIN', but MUGEN uses action '181'
        const winFrames = imageFrames.get('181');
        if (winFrames) regImg('WIN', winFrames);
      },
    });

    activeRenderer = enhancedRenderer;
    realSpriteInitialized = true;
    console.log('[Ryo] Real sprites loaded:', imageFrames.size, 'actions');
  } catch (e) {
    console.warn('[Ryo] Real sprite loading failed, using procedural fallback:', e);
  }
}
