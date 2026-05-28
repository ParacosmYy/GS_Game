/**
 * kyoHighResRender.ts
 *
 * Kyo-specific integration layer using the shared HighResFrameRegistry factory.
 * Only provides frame data imports, registration setup, and state→key resolution.
 */

import { FighterState, AttackType } from '../../../core/types.js';
import { createHighResRenderer } from '../shared/baseHighResRenderer.js';
import { KYO_IDLE_FRAMES } from './kyoIdleFrames.js';
import { KYO_WALK_FORWARD_FRAMES, KYO_WALK_BACKWARD_FRAMES } from './kyoWalkFrames.js';
import { KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES } from './kyoAttackFrames.js';
import { KYO_CROUCH_FRAMES } from './kyoCrouchFrames.js';
import { KYO_JUMP_FRAMES } from './kyoJumpFrames.js';
import { KYO_HURT_FRAMES, KYO_KNOCKDOWN_FRAMES, KYO_BLOCK_FRAMES } from './kyoDamageFrames.js';
import { KYO_STAND_B_FRAMES, KYO_STAND_D_FRAMES } from './kyoKickFrames.js';
import { KYO_CROUCH_A_FRAMES, KYO_CROUCH_C_FRAMES, KYO_CROUCH_B_FRAMES, KYO_CROUCH_D_FRAMES } from './kyoCrouchAttackFrames.js';
import { KYO_AIR_A_FRAMES, KYO_AIR_B_FRAMES, KYO_AIR_C_FRAMES, KYO_AIR_D_FRAMES } from './kyoAirAttackFrames.js';
import { KYO_CLOSE_A_FRAMES, KYO_CLOSE_C_FRAMES, KYO_CLOSE_B_FRAMES, KYO_CLOSE_D_FRAMES } from './kyoCloseAttackFrames.js';
import { KYO_ONIYAKI_FRAMES, KYO_ONIYAKI_C_FRAMES, KYO_YAMIBARAI_FRAMES, KYO_RED_KICK_FRAMES, KYO_75KAI_FRAMES, KYO_ARAGAMI_FRAMES, KYO_DOKUGAMI_FRAMES, KYO_OROCHINAGI_DM_FRAMES, KYO_OROCHINAGI_SDM_FRAMES } from './kyoSpecialFrames.js';
import { KYO_CMD_GOFU_YOU_FRAMES, KYO_CMD_88SHIKI_FRAMES, KYO_CMD_NARAKU_FRAMES } from './kyoCommandNormalFrames.js';
import { KYO_RUN_FRAMES, KYO_BACKDASH_FRAMES, KYO_ROLL_FRAMES, KYO_BACK_ROLL_FRAMES, KYO_GUARD_CRUSH_FRAMES, KYO_MAX_MODE_FRAMES, KYO_TAUNT_FRAMES, KYO_COUNTER_STANCE_FRAMES } from './kyoMovementFrames.js';
import { KYO_DIZZY_FRAMES } from './kyoDizzyFrames.js';
import { KYO_THROW_FRAMES } from './kyoThrowFrames.js';
import { KYO_WIN_FRAMES } from './kyoWinFrames.js';

const renderer = createHighResRenderer({
  targetDisplayHeight: 72,
  defaultTint: '#ff6600',
  setup(reg, regV) {
    regV('IDLE', KYO_IDLE_FRAMES, [8, 9, 12, 9, 10, 8]);
    regV('WALK_FORWARD', KYO_WALK_FORWARD_FRAMES, [6, 5, 6, 6, 5, 6]);
    regV('WALK_BACKWARD', KYO_WALK_BACKWARD_FRAMES, [7, 6, 7, 7, 6, 7]);
    regV('STAND_A', KYO_STAND_A_FRAMES, [6, 3, 2, 5]);
    regV('STAND_C', KYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);
    regV('STAND_B', KYO_STAND_B_FRAMES, [7, 3, 2, 12]);
    regV('STAND_D', KYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);
    regV('CLOSE_A', KYO_CLOSE_A_FRAMES, [4, 2, 5, 5]);
    regV('CLOSE_C', KYO_CLOSE_C_FRAMES, [2, 5, 6, 5]);
    regV('CLOSE_B', KYO_CLOSE_B_FRAMES, [5, 2, 8]);
    regV('CLOSE_D', KYO_CLOSE_D_FRAMES, [6, 4, 6, 8]);
    regV('CROUCH', KYO_CROUCH_FRAMES, [8, 10, 8, 10]);
    regV('CROUCH_A', KYO_CROUCH_A_FRAMES, [3, 2, 5]);
    regV('CROUCH_C', KYO_CROUCH_C_FRAMES, [5, 3, 5, 10]);
    regV('CROUCH_B', KYO_CROUCH_B_FRAMES, [4, 2, 7]);
    regV('CROUCH_D', KYO_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);
    regV('AIR_A', KYO_AIR_A_FRAMES, [3, 3, 5]);
    regV('AIR_B', KYO_AIR_B_FRAMES, [3, 2, 4]);
    regV('AIR_C', KYO_AIR_C_FRAMES, [5, 3, 3, 5]);
    regV('AIR_D', KYO_AIR_D_FRAMES, [4, 3, 3, 5]);
    regV('BLOCK', KYO_BLOCK_FRAMES, [3, 8]);
    regV('JUMP', KYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);
    regV('ONIYAKI', KYO_ONIYAKI_FRAMES, [4, 3, 5, 7, 10]);
    regV('ONIYAKI_C', KYO_ONIYAKI_C_FRAMES, [4, 3, 5, 6, 7, 10]);
    regV('YAMIBARAI', KYO_YAMIBARAI_FRAMES, [6, 3, 8, 12]);
    regV('RED_KICK', KYO_RED_KICK_FRAMES, [5, 3, 3, 6, 10]);
    regV('75KAI', KYO_75KAI_FRAMES, [5, 3, 3, 8]);
    regV('ARAGAMI', KYO_ARAGAMI_FRAMES, [6, 4, 8, 12]);
    regV('DOKUGAMI', KYO_DOKUGAMI_FRAMES, [7, 5, 10, 12]);
    regV('OROCHINAGI_DM', KYO_OROCHINAGI_DM_FRAMES, [8, 4, 14, 8, 12]);
    regV('OROCHINAGI_SDM', KYO_OROCHINAGI_SDM_FRAMES, [10, 6, 20, 12, 8, 10]);
    regV('OROCHINAGI_HSDM', KYO_OROCHINAGI_SDM_FRAMES, [12, 8, 24, 16, 10, 12]);
    regV('CMD_GOFU_YOU', KYO_CMD_GOFU_YOU_FRAMES, [10, 3, 5, 18]);
    regV('CMD_88SHIKI', KYO_CMD_88SHIKI_FRAMES, [8, 3, 3, 3, 20]);
    regV('CMD_NARAKU', KYO_CMD_NARAKU_FRAMES, [6, 3, 5, 16]);
    regV('RUN', KYO_RUN_FRAMES, [3, 3, 2, 2, 3, 2]);
    regV('BACKDASH', KYO_BACKDASH_FRAMES, [2, 2, 3, 4]);
    regV('ROLL', KYO_ROLL_FRAMES, [3, 3, 4, 5]);
    regV('BACK_ROLL', KYO_BACK_ROLL_FRAMES, [3, 3, 4, 5]);
    regV('DIZZY', KYO_DIZZY_FRAMES, [8, 10, 8, 12, 8, 10, 8, 14]);
    regV('THROW', KYO_THROW_FRAMES, [3, 4, 5, 6, 8, 10]);
    regV('GUARD_CRUSH', KYO_GUARD_CRUSH_FRAMES, [4, 10]);
    regV('MAX_MODE', KYO_MAX_MODE_FRAMES, [3, 4, 8]);
    regV('TAUNT', KYO_TAUNT_FRAMES, [10, 14, 12, 16]);
    regV('COUNTER_STANCE', KYO_COUNTER_STANCE_FRAMES, [4, 6, 10]);
    regV('WIN', KYO_WIN_FRAMES, [6, 30]);
    regV('HURT', KYO_HURT_FRAMES, [3, 5, 6, 4]);
    regV('KNOCKDOWN', KYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);
  },
  resolveKey(state, currentAttack, vx, facing) {
    switch (state) {
      case FighterState.IDLE: return 'IDLE';
      case FighterState.WALK: return (vx * facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';
      case FighterState.RUN: return 'RUN';
      case FighterState.BACKDASH: return 'BACKDASH';
      case FighterState.ROLL: return 'ROLL';
      case FighterState.BACK_ROLL: return 'BACK_ROLL';
      case FighterState.STAND_ATTACK:
        if (currentAttack === AttackType.KYO_ONIYAKI) return 'ONIYAKI';
        if (currentAttack === AttackType.KYO_ONIYAKI_C) return 'ONIYAKI_C';
        if (currentAttack === AttackType.KYO_YAMIBARAI || currentAttack === AttackType.KYO_YAMIBARAI_C) return 'YAMIBARAI';
        if (currentAttack === AttackType.KYO_RED_KICK) return 'RED_KICK';
        if (currentAttack === AttackType.KYO_75KAI || currentAttack === AttackType.KYO_75KAI_2) return '75KAI';
        if (currentAttack === AttackType.KYO_ARAGAMI || currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU ||
            currentAttack === AttackType.KYO_ARAGAMI_YANOSABI || currentAttack === AttackType.KYO_NANASE ||
            currentAttack === AttackType.KYO_KOTO_TSUKI || currentAttack === AttackType.KYO_YAKISOGI) return 'ARAGAMI';
        if (currentAttack === AttackType.KYO_DOKUGAMI || currentAttack === AttackType.KYO_TSUMIYOMI ||
            currentAttack === AttackType.KYO_BATSUYOMI) return 'DOKUGAMI';
        if (currentAttack === AttackType.DM_OROCHINAGI) return 'OROCHINAGI_DM';
        if (currentAttack === AttackType.SDM_OROCHINAGI) return 'OROCHINAGI_SDM';
        if (currentAttack === AttackType.HSDM_OROCHINAGI) return 'OROCHINAGI_HSDM';
        if (currentAttack === AttackType.CMD_GOFU_YOU) return 'CMD_GOFU_YOU';
        if (currentAttack === AttackType.CMD_88SHIKI) return 'CMD_88SHIKI';
        if (currentAttack === AttackType.STAND_C) return 'STAND_C';
        if (currentAttack === AttackType.CLOSE_C) return 'CLOSE_C';
        if (currentAttack === AttackType.STAND_D) return 'STAND_D';
        if (currentAttack === AttackType.CLOSE_D) return 'CLOSE_D';
        if (currentAttack === AttackType.STAND_B) return 'STAND_B';
        if (currentAttack === AttackType.CLOSE_B) return 'CLOSE_B';
        if (currentAttack === AttackType.CLOSE_A) return 'CLOSE_A';
        return 'STAND_A';
      case FighterState.CROUCH: return 'CROUCH';
      case FighterState.CROUCH_ATTACK:
        if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
        if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
        if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
        return 'CROUCH_A';
      case FighterState.BLOCK:
      case FighterState.AIR_BLOCK: return 'BLOCK';
      case FighterState.JUMP:
      case FighterState.RUN_JUMP:
      case FighterState.HOP:
      case FighterState.HYPER_JUMP: return 'JUMP';
      case FighterState.AIR_ATTACK:
        if (currentAttack === AttackType.CMD_NARAKU) return 'CMD_NARAKU';
        if (currentAttack === AttackType.JUMP_C) return 'AIR_C';
        if (currentAttack === AttackType.JUMP_D) return 'AIR_D';
        if (currentAttack === AttackType.JUMP_B) return 'AIR_B';
        return 'AIR_A';
      case FighterState.HITSTUN: return 'HURT';
      case FighterState.KNOCKDOWN: return 'KNOCKDOWN';
      case FighterState.GETUP: return 'KNOCKDOWN';
      case FighterState.THROW: return 'THROW';
      case FighterState.DIZZY: return 'DIZZY';
      case FighterState.GUARD_CRUSH: return 'GUARD_CRUSH';
      case FighterState.MAX_MODE: return 'MAX_MODE';
      case FighterState.TAUNT: return 'TAUNT';
      case FighterState.WIN: return 'WIN';
      case FighterState.COUNTER_STANCE: return 'COUNTER_STANCE';
      default: return null;
    }
  },
});

// Backward-compatible named exports
export const hasKyoHighResFrame = renderer.has;
export const drawKyoHighResFrame = renderer.draw;
export const drawKyoHighResAfterimage = renderer.drawAfterimage;
export const drawKyoWinPose = renderer.drawWinPose;
