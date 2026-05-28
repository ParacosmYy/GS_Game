/**
 * kfmSpriteRender.ts
 *
 * KFM (Kung Fu Man) sprite renderer using real PNG sprites
 * extracted from MUGEN SFF files. Uses the image rendering path
 * in baseHighResRenderer for real pixel art display.
 */

import { FighterState, AttackType } from '../../../core/types.js';
import {
  createHighResRenderer,
  type ImageRendererConfig,
  type SpriteImageFrame,
} from '../shared/baseHighResRenderer.js';
import { loadSpriteManifest } from '../shared/spriteLoader.js';

// MUGEN Action → registry key mapping
// Maps our FighterState + AttackType to MUGEN action numbers
function resolveKfmKey(state: FighterState, attack: AttackType | null, vx: number, facing: number): string | null {
  switch (state) {
    case FighterState.IDLE: return '0';
    case FighterState.WALK: return (vx * facing > 0) ? '20' : '21';
    case FighterState.CROUCH: return '11';
    case FighterState.CROUCH_ATTACK:
      if (attack === AttackType.CROUCH_C) return '410';
      if (attack === AttackType.CROUCH_D) return '440';
      if (attack === AttackType.CROUCH_B) return '430';
      return '400';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
    case FighterState.AIR_BLOCK:
      return '41';
    case FighterState.AIR_ATTACK:
      if (attack === AttackType.JUMP_C) return '610';
      if (attack === AttackType.JUMP_D) return '640';
      if (attack === AttackType.JUMP_B) return '630';
      return '600';
    case FighterState.STAND_ATTACK:
      // KFM specials
      if (attack === AttackType.KFM_KUNGFU_UPPER) return '1000';
      if (attack === AttackType.KFM_FAST_KUNGFU_UPPER) return '1010';
      if (attack === AttackType.KFM_SMASH_KICK) return '1020';
      if (attack === AttackType.KFM_DOUBLE_SMASH_KICK) return '1025';
      if (attack === AttackType.KFM_HIGH_KICK) return '1050';
      if (attack === AttackType.KFM_TRIPLE_KUNGFU_UPPER) return '1060';
      if (attack === AttackType.KFM_LIGHT_HIGH_KICK) return '1051';
      if (attack === AttackType.KFM_HIGH_KICK_2) return '1052';
      if (attack === AttackType.KFM_SMASH_KICK_2) return '1055';
      if (attack === AttackType.KFM_SMASH_KICK_3) return '1056';
      // Normals
      if (attack === AttackType.CLOSE_C) return '210';
      if (attack === AttackType.CLOSE_D) return '240';
      if (attack === AttackType.CLOSE_B) return '230';
      if (attack === AttackType.CLOSE_A) return '200';
      if (attack === AttackType.STAND_C) return '210';
      if (attack === AttackType.STAND_D) return '240';
      if (attack === AttackType.STAND_B) return '230';
      return '200';
    case FighterState.HITSTUN: return '5000';
    case FighterState.KNOCKDOWN: return '5070';
    case FighterState.GETUP: return '5120';
    case FighterState.BLOCK: return '120';
    case FighterState.RUN: return '100';
    case FighterState.BACKDASH: return '105';
    case FighterState.THROW: return '800';
    case FighterState.DIZZY: return '5300';
    case FighterState.WIN: return '181';
    case FighterState.TAUNT: return '195';
    default: return null;
  }
}

let kfmRenderer: ReturnType<typeof createHighResRenderer> | null = null;
let loading = false;

/**
 * Initialize KFM sprite renderer by loading manifest and PNGs.
 * Call this during loading screen / before match starts.
 */
export async function initKfmSprites(): Promise<void> {
  if (kfmRenderer || loading) return;
  loading = true;

  try {
    const animFrames = await loadSpriteManifest(
      'sprites/kfm/kfm.manifest.json',
      'sprites/kfm/sprites',
    );

    const config: ImageRendererConfig = {
      targetDisplayHeight: 106, // KFM native sprite height
      defaultTint: '#4488ff',
      setup() { /* no procedural frames needed */ },
      resolveKey: resolveKfmKey,
      imageSetup(regImg) {
        for (const [actionId, frames] of animFrames) {
          regImg(actionId, frames);
        }
      },
    };

    kfmRenderer = createHighResRenderer(config);
  } finally {
    loading = false;
  }
}

export const hasKfmSprite = (state: FighterState, attack: AttackType | null, vx: number, facing: number): boolean =>
  kfmRenderer?.has(state, attack, vx, facing) ?? false;

export const drawKfmSprite = (ctx: CanvasRenderingContext2D, state: FighterState, stateAge: number, x: number, y: number, facing: number, attack: AttackType | null, vx: number): boolean =>
  kfmRenderer?.draw(ctx, state, stateAge, x, y, facing, attack, vx) ?? false;

export const drawKfmAfterimage = (ctx: CanvasRenderingContext2D, state: FighterState, stateAge: number, x: number, y: number, facing: number, attack: AttackType | null, vx: number, tint?: string, alpha?: number): boolean =>
  kfmRenderer?.drawAfterimage(ctx, state, stateAge, x, y, facing, attack, vx, tint, alpha) ?? false;

export const drawKfmWinPose = (ctx: CanvasRenderingContext2D, stateAge: number, x: number, y: number, facing: number): boolean =>
  kfmRenderer?.drawWinPose(ctx, stateAge, x, y, facing) ?? false;
