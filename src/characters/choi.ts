/**
 * 蔡宝奇 (Choi Bounge) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → 飛翔脚 (Hishou Kyaku, diving claw)
 *   QCB+P   → 回転飛燕斬 (Kaiten Hien Zan, spinning anti-air)
 *   DP+K    → 鳳翼天心旋 (Houyoku Tenshin Sen, upward spinning)
 * DM: QCF×2+P → 真！超鳳翼天心旋 (Shin! Chou Houyoku Tenshin Sen)
 *
 * 命令通常技:
 *   →+A  → 蒼天明月脚 (Souten Mekkyaku, upper)
 *   →+B  → 三連撃 (San Ren Geki, low)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { choiPortrait } from '../rendering/portraits/choiPortrait.js';

export const ChoiDef: CharacterDefinition = {
  id: 'choi',
  name: 'Choi Bounge',
  nameCn: '蔡宝奇',
  color: '#66cc66',
  accentColor: '#88ee88',
  specialColor: '#66cc66',
  specialGlow: '#99ff99',
  portrait: '🤏',
  pixelPortrait: choiPortrait,
  winQuotes: ['嘿嘿嘿！你太慢了！', '这就是蔡宝奇的速度！', '切切切！你被我的爪子划到了！'],

  stats: {
    walkSpeed: 4.5,
    runSpeed: 8.5,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 850,
    pushWidth: 48,
    jumpForwardSpeed: 5.5,
    closeRange: 60,
    throwRange: 85,
  },

  poses: {
    // 4-frame idle: hunched small stance, claws at ready, fidgety
    [FighterState.IDLE]: [
      // Frame 0: Hunched neutral — small compact stance, claws forward
      pose({ head: bone(2, 4, 0.05), body: bone(0, 6, 0.15), armFront: bone(12, 10, 0.4), armBack: bone(-8, 12, -0.5), legFront: bone(6, 0, 0.1), legBack: bone(-4, 0, -0.15) }),
      // Frame 1: Slight shift — weight moves, claws twitch
      pose({ head: bone(3, 3, 0.08), body: bone(0, 5, 0.12), armFront: bone(13, 9, 0.42), armBack: bone(-8, 11, -0.48), legFront: bone(6, 0, 0.08), legBack: bone(-5, 0, -0.12) }),
      // Frame 2: Crouch lower — more compact, ready to pounce
      pose({ head: bone(2, 6, 0.06), body: bone(0, 8, 0.18), armFront: bone(11, 12, 0.38), armBack: bone(-7, 14, -0.52), legFront: bone(7, 0, 0.12), legBack: bone(-4, 0, -0.18) }),
      // Frame 3: Return — back to neutral hunch
      pose({ head: bone(2, 5, 0.04), body: bone(0, 7, 0.14), armFront: bone(12, 11, 0.4), armBack: bone(-8, 13, -0.5), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.15) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(8, -2, 0.2), legBack: bone(-3, 2, -0.15), armFront: bone(10, 12, 0.35), armBack: bone(-7, 14, -0.45), head: bone(2, 5, 0.05), body: bone(0, 5, 0.12) }),
      pose({ legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.08), armFront: bone(12, 10, 0.38), armBack: bone(-8, 12, -0.48), head: bone(2, 4, 0.04), body: bone(0, 6, 0.14) }),
      pose({ legFront: bone(4, 2, -0.15), legBack: bone(-8, -2, 0.2), armFront: bone(11, 12, 0.36), armBack: bone(-7, 13, -0.46), head: bone(2, 5, 0.06), body: bone(0, 5, 0.12) }),
      pose({ legFront: bone(5, 0, -0.06), legBack: bone(-5, 0, 0.04), armFront: bone(12, 11, 0.38), armBack: bone(-8, 13, -0.5), head: bone(2, 4, 0.04), body: bone(0, 6, 0.14) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(4, 5, 0.2), armFront: bone(-2, 18, -0.7), armBack: bone(10, 20, 0.4), legFront: bone(12, -4, 0.4), legBack: bone(-5, 4, -0.3), head: bone(3, 3, 0.1) }),
      pose({ body: bone(2, 5, 0.1), armFront: bone(0, 14, -0.4), armBack: bone(6, 22, 0.2), legFront: bone(6, 4, 0.15), legBack: bone(-12, -4, 0.4), head: bone(2, 3, 0.06) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.2),
      head: bone(2, 16, 0.08),
      armFront: bone(10, 18, 0.1),
      armBack: bone(-6, 16, -0.25),
      legFront: bone(8, 0, 0.45),
      legBack: bone(-6, 0, -0.35),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(4, 6, -0.4), armBack: bone(0, 4, -0.6), legFront: bone(4, 0, 0.0), head: bone(1, 4, 0.02), body: bone(0, 5, 0.1) }),
      pose({ armFront: bone(2, 8, -0.45), armBack: bone(-1, 6, -0.65), body: bone(-2, 5, -0.05), head: bone(0, 4, 0.0) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 4, -0.15), head: bone(-2, 6, -0.2), armFront: bone(0, 16, 0.4), armBack: bone(-6, 14, 0.55) }),
      pose({ body: bone(-6, 5, -0.25), head: bone(-4, 7, -0.3), armFront: bone(2, 18, 0.5), armBack: bone(-8, 16, 0.7) }),
      pose({ body: bone(-2, 3, -0.08), head: bone(-1, 5, -0.12), armFront: bone(-2, 14, 0.35), armBack: bone(-5, 12, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 12, 0.7), head: bone(6, 16, 0.8), armFront: bone(-4, 16, 0.5), armBack: bone(10, 14, -0.3), legFront: bone(-6, 12, -0.15), legBack: bone(5, 14, 0.25) }),
      pose({ body: bone(0, 25, 1.2), head: bone(8, 28, 1.0), legFront: bone(-8, 24, -0.25), legBack: bone(6, 26, 0.35) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(10, 4, 0.35),
      armBack: bone(-6, 2, -0.2),
      legFront: bone(4, -6, 0.35),
      legBack: bone(-3, -1, -0.45),
      head: bone(2, 2, 0.05),
      body: bone(0, 2, 0.05),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, 3, 0.04), body: bone(2, 4, 0.08), armFront: bone(16, 6, -0.1, 0.9), armBack: bone(-6, 8, -0.4, 0.8), legFront: bone(6, 0, 0.06), legBack: bone(-4, 0, -0.06) }),
      pose({ head: bone(4, 2, 0.06), body: bone(3, 3, 0.1), armFront: bone(20, 8, -0.2, 1.05), armBack: bone(-6, 8, -0.4, 0.8), legFront: bone(8, 0, 0.1), legBack: bone(-5, 0, -0.08) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 10, 0.04), body: bone(2, 14, 0.08), armFront: bone(12, 16, -0.05, 0.85), armBack: bone(-5, 14, -0.3, 0.75), legFront: bone(14, 2, 0.4, 1.2), legBack: bone(-5, 4, -0.15) }),
      pose({ head: bone(3, 11, 0.06), body: bone(3, 15, 0.1), armFront: bone(14, 16, -0.1, 0.95), armBack: bone(-5, 14, -0.3, 0.75), legFront: bone(18, 3, 0.5, 1.35), legBack: bone(-5, 4, -0.2) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(2, 1, -0.03), body: bone(1, 2, 0.05), armFront: bone(14, 3, -0.1, 0.9), armBack: bone(-5, 1, -0.25, 0.8), legFront: bone(12, 4, 0.4, 1.2), legBack: bone(-4, 0, -0.15) }),
      pose({ head: bone(3, 0, -0.05), body: bone(2, 2, 0.08), armFront: bone(18, 4, -0.15, 1.0), armBack: bone(-5, 1, -0.25, 0.8), legFront: bone(16, 5, 0.5, 1.3), legBack: bone(-4, 0, -0.2) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(3, 4, 0.05), body: bone(4, 4, 0.12), armFront: bone(22, 4, 0.0, 1.1), armBack: bone(10, 6, -0.1, 0.95), legFront: bone(6, 0, 0.08), legBack: bone(-4, 0, -0.06) }),
      pose({ head: bone(4, 3, 0.07), body: bone(5, 3, 0.14), armFront: bone(26, 5, -0.08, 1.25), armBack: bone(14, 6, -0.15, 1.05), legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.08) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-2, 6, -0.15),
      body: bone(-1, 5, -0.06),
      armFront: bone(-3, 10, 0.35),
      armBack: bone(-5, 8, 0.25),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-3, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(2, 0, -0.04),
      body: bone(0, 1, 0),
      armFront: bone(8, 6, 0.2),
      armBack: bone(-6, 5, -0.2),
      legFront: bone(4, 2, 0.15),
      legBack: bone(-4, 1, -0.2),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -6, -0.08),
      armFront: bone(6, 3, 0.5),
      armBack: bone(-10, 2, -0.15),
      legFront: bone(-2, -6, 0.4),
      legBack: bone(8, -3, -0.5),
      head: bone(-2, -2, -0.1),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.75),
      head: bone(4, 22, 0.55),
      armFront: bone(-2, 24, 0.35),
      armBack: bone(8, 20, -0.4),
      legFront: bone(-6, 22, -0.25),
      legBack: bone(4, 20, 0.4),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.06),
      armFront: bone(10, 8, 0.45),
      armBack: bone(-7, 6, -0.3),
      legFront: bone(6, -5, 0.35),
      legBack: bone(-6, -3, -0.4),
      head: bone(2, -4, -0.05),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -4, -0.03),
      armFront: bone(10, 6, 0.28),
      armBack: bone(-5, 4, -0.22),
      legFront: bone(5, -3, 0.2),
      legBack: bone(-5, -1, -0.28),
      head: bone(2, -2, -0.03),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 17, -0.55),
      head: bone(-4, 20, -0.45),
      armFront: bone(5, 20, 0.28),
      armBack: bone(-6, 17, -0.35),
      legFront: bone(5, 15, -0.18),
      legBack: bone(-5, 18, 0.28),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 6, -0.45),
      armBack: bone(-2, 4, -0.6),
      legFront: bone(3, -1, 0.08),
      legBack: bone(-3, 1, -0.12),
    }),
  },

  proportions: {
    headW: 32, headH: 32,
    torsoW: 34, torsoH: 50,
    armW: 12, armH: 38,
    legW: 14, legH: 48,
    shoulderY: 12,
    hipY: 46,
    torsoCenterY: 25,
    headCenterY: 6,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → 真！超鳳翼天心旋
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_SHIN_CHOU_HOUYOKU;

    // QCF+P → 飛翔脚 (Hishou Kyaku)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonC ? AttackType.CHOI_HISHOU_KYAKU_C : AttackType.CHOI_HISHOU_KYAKU;
    }

    // QCB+P → 回転飛燕斬 (Kaiten Hien Zan)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonC ? AttackType.CHOI_KAITEN_HIEN_ZAN_C : AttackType.CHOI_KAITEN_HIEN_ZAN;
    }

    // DP+K → 鳳翼天心旋 (Houyoku Tenshin Sen)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER && input.kickPressed) {
      return AttackType.CHOI_HOUYOKU_TENSHIN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    if (isAir) return null;

    // →+A 蒼天明月脚 (Souten Mekkyaku, upper)
    if (input.buttonAPressed && input.forward && !input.down) {
      return AttackType.CHOI_SOUTEN_MEKKYAKU;
    }
    // →+B 三連撃 (San Ren Geki, low)
    if (input.buttonBPressed && input.forward && !input.down) {
      return AttackType.CHOI_SAN_REN_GEKI;
    }
    return null;
  },

  routeRekkaFollowup(_input, _cmdBuf, _tick, _currentAttack) {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // 飛翔脚: air diving claw
    if (attackType === AttackType.CHOI_HISHOU_KYAKU || attackType === AttackType.CHOI_HISHOU_KYAKU_C) {
      fighter.vy = 4;
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    // 回転飛燕斬: spinning upward
    if (attackType === AttackType.CHOI_KAITEN_HIEN_ZAN || attackType === AttackType.CHOI_KAITEN_HIEN_ZAN_C) {
      fighter.vy = -6;
      return true;
    }
    // 鳳翼天心旋: upward spinning attack
    if (attackType === AttackType.CHOI_HOUYOKU_TENSHIN) {
      fighter.vy = -7;
      fighter.vx = 2 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
