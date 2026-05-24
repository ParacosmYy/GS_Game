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
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';

export const KimDef: CharacterDefinition = {
  id: 'kim',
  name: 'Kim Kaphwan',
  nameCn: '金',
  color: '#2288cc',
  accentColor: '#44aadd',
  specialColor: '#44ddff',
  specialGlow: '#88ccff',
  portrait: '🦵',

  poses: {
    [FighterState.IDLE]: pose({
      armFront: bone(8, 15, 0.1),
      armBack: bone(-5, 18, -0.4),
      legFront: bone(8, 0, 0.15),
      legBack: bone(-6, 0, -0.2),
    }),
    [FighterState.WALK]: pose({
      armFront: bone(6, 17, 0.05),
      armBack: bone(-4, 20, -0.35),
      legFront: bone(10, 0, 0.25),
      legBack: bone(-4, 0, -0.18),
    }),
    [FighterState.RUN]: pose({
      body: bone(8, 0, 0.2),
      armFront: bone(-4, 20, -0.85),
      armBack: bone(12, 24, 0.5),
      legFront: bone(14, 0, 0.5),
      legBack: bone(-8, 0, -0.4),
    }),
    [FighterState.CROUCH]: pose({
      body: bone(0, 22, 0.12),
      head: bone(0, 16),
      armFront: bone(7, 24, 0.0),
      armBack: bone(-5, 22, -0.3),
      legFront: bone(11, 0, 0.55),
      legBack: bone(-9, 0, -0.45),
    }),
    [FighterState.BLOCK]: pose({
      armFront: bone(3, 8, -0.45),
      armBack: bone(0, 6, -0.65),
      legFront: bone(2, 0, 0.0),
    }),
    [FighterState.HITSTUN]: pose({
      body: bone(-5, 0, -0.18),
      head: bone(-3, 3, -0.22),
    }),
    [FighterState.KNOCKDOWN]: pose({
      body: bone(0, 30, 1.4),
      head: bone(10, 35, 1.2),
      legFront: bone(-10, 30, -0.3),
      legBack: bone(8, 32, 0.4),
    }),
    [FighterState.JUMP]: pose({
      armFront: bone(6, 5, 0.35),
      armBack: bone(-6, 3, -0.2),
      legFront: bone(2, -8, 0.4),
      legBack: bone(-4, -2, -0.55),
    }),
  },

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
