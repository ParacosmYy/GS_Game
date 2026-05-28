/**
 * Kung Fu Man (KFM) — 角色定义
 *
 * MUGEN 默认角色，使用真实 SFF sprite 替代程序化渲染。
 * 物理参数基于 kfm.cns 数据。
 */
import type { CharacterDefinition, Pose } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import type { Fighter } from '../entities/fighter.js';
import type { Projectile } from '../entities/projectile.js';

const idlePose = pose({
  head: bone(0, 0, 0), body: bone(0, 0, 0),
  armFront: bone(0, 0, 0), armBack: bone(0, 0, 0),
  legFront: bone(0, 0, 0), legBack: bone(0, 0, 0),
});

export const KfmDef: CharacterDefinition = {
  id: 'kfm',
  name: 'Kung Fu Man',
  nameCn: '功夫男',
  color: '#2255cc',
  accentColor: '#ff4444',
  specialColor: '#ffcc00',
  specialGlow: '#ff8800',
  portrait: '🥋',
  winQuotes: [
    'You must defeat my Kung Fu Palm to stand a chance.',
    'You need a lot of training. Come back in ten years.',
    'That was a good workout.',
  ],
  moveList: [
    { name: 'Kung Fu Palm', input: '↓↘→ + A / C', type: 'special' },
    { name: 'Kung Fu Upper', input: '→↓↘ + A / C', type: 'special' },
    { name: 'Smash Kick', input: '↓↙← + K', type: 'special' },
    { name: 'Triple Kung Fu Palm', input: '↓↘→↓↘→ + P', type: 'dm' },
    { name: 'Smash Kung Fu Upper', input: '↓↘→↓↘→ + P (close)', type: 'dm' },
  ],

  stats: {
    walkSpeed: 4.0,
    runSpeed: 7.0,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 1000,
    pushWidth: 60,
    jumpForwardSpeed: 5,
    closeRange: 88,
    throwRange: 108,
  },

  poses: {
    [FighterState.IDLE]: [idlePose],
    [FighterState.WALK]: [idlePose],
    [FighterState.CROUCH]: [idlePose],
    [FighterState.JUMP]: [idlePose],
    [FighterState.HOP]: [idlePose],
    [FighterState.RUN]: [idlePose],
  },

  proportions: {
    headW: 22, headH: 22,
    torsoW: 20, torsoH: 32,
    armW: 8, armH: 24,
    legW: 10, legH: 28,
    shoulderY: -60,
    hipY: -28,
    torsoCenterY: -44,
    headCenterY: -71,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // QCF+P → Kung Fu Palm
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.KFM_DOUBLE_SMASH_KICK : AttackType.KFM_KUNGFU_UPPER;
    }
    // DP+P → Kung Fu Upper
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.KFM_FAST_KUNGFU_UPPER : AttackType.KFM_KUNGFU_UPPER;
    }
    // QCB+K → Smash Kick
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonDPressed ? AttackType.KFM_HIGH_KICK : AttackType.KFM_SMASH_KICK;
    }
    return null;
  },

  routeNormal(_input, _state, _isCloseRange) {
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(_fighter, _attackType, _projectiles, _playerIndex) {
    return false;
  },

  getRekkaChain() {
    return null;
  },
};
