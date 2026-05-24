/**
 * 金家藩 (Kim Kaphwan) — 角色定义
 *
 * 必杀技:
 *   QCB+K(速) → 飛燕斬 (upper)
 *   QCF+K     → 覇気脚
 *   DP+P      → 半月斬 (upper, shared)
 * DM: QCB×2+K → 鳳凰脚
 */
import type { CharacterDefinition } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';

export const KimDef: CharacterDefinition = {
  id: 'kim',
  name: 'Kim Kaphwan',
  nameCn: '金',
  color: '#2288cc',
  accentColor: '#44aadd',
  portrait: '🦵',

  routeSpecial(input, cmdBuf, tick) {
    // DP+P → shared upper
    const special = cmdBuf.checkSpecial(tick, true);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.SPECIAL_UPPER;

    // QCB+K → 飛燕斬
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KIM_HIENSEN;
    }

    // QCF+P → fireball (shared, Kim doesn't really have one but reuse for POC)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.SPECIAL_PROJECTILE;
    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    // →+B mid command kick
    if (state !== FighterState.JUMP && state !== FighterState.RUN_JUMP
      && state !== FighterState.HOP && state !== FighterState.HYPER_JUMP) {
      if (input.buttonBPressed && input.forward && !input.down) {
        return AttackType.CMD_GOFU_YOU; // reuse as generic overhead
      }
    }
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    if (attackType === AttackType.KIM_HIENSEN) {
      fighter.vy = -8;
      fighter.vx = 2 * fighter.facing;
      return true;
    }
    if (attackType === AttackType.SPECIAL_UPPER) {
      fighter.vy = -7;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },
};
