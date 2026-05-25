/**
 * 玛卓 (Mature) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Metal Massacre (slashing rush, weak/strong)
 *   QCB+P   → Heaven's Gate (overhead slash)
 *   DP+K    → Ecstasy 816 (upper/anti-air)
 * DM: QCFx2+P → Nocturnal Light (multi-slash combo)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { maturePortrait } from '../rendering/portraits/maturePortrait.js';

export const MatureDef: CharacterDefinition = {
  id: 'mature',
  name: 'MATURE',
  nameCn: '玛卓',
  color: '#882255',
  accentColor: '#aa3377',
  specialColor: '#cc4488',
  specialGlow: '#ee66aa',
  portrait: '♀',
  pixelPortrait: maturePortrait,
  winQuotes: ['你可真可爱。', '太弱了，不够我玩的。', '这就是大蛇之力的力量。'],

  stats: {
    walkSpeed: 4.2,
    runSpeed: 7.5,
    jumpVelocity: -13.5,
    hopVelocity: -10,
    hyperJumpVelocity: -16.5,
    maxHealth: 920,
    pushWidth: 56,
    jumpForwardSpeed: 5.2,
    closeRange: 75,
    throwRange: 110,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 一手叉腰，一手抬起露出利爪，妩媚站姿
      pose({ armFront: bone(12, 8, 0.5), armBack: bone(-4, 22, -0.15), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.06) }),
      // Frame 1: 微呼吸 — 轻微上移，保持诱惑姿态
      pose({ armFront: bone(12, 7, 0.48), armBack: bone(-4, 21, -0.14), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.06), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰 — 身体微升
      pose({ armFront: bone(12, 6, 0.46), armBack: bone(-4, 20, -0.13), legFront: bone(5, -1, 0.07), legBack: bone(-4, -1, -0.05), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡
      pose({ armFront: bone(12, 7, 0.48), armBack: bone(-4, 21, -0.14), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.06), body: bone(0, -1) }),
      // Frame 4: 呼气 — 微沉
      pose({ armFront: bone(12, 9, 0.52), armBack: bone(-4, 23, -0.16), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.06), body: bone(0, 1) }),
      // Frame 5: 呼气完成 — 恢复
      pose({ armFront: bone(13, 9, 0.53), armBack: bone(-4, 23, -0.17), legFront: bone(5, 1, 0.09), legBack: bone(-4, 1, -0.07), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(9, -2, 0.18), legBack: bone(-3, 2, -0.14), armFront: bone(10, 10, 0.45), armBack: bone(-5, 20, -0.2) }),
      pose({ legFront: bone(6, 0, 0.08), legBack: bone(-4, 0, -0.06), armFront: bone(12, 8, 0.5), armBack: bone(-4, 22, -0.15) }),
      pose({ legFront: bone(4, 2, -0.14), legBack: bone(-9, -2, 0.18), armFront: bone(12, 10, 0.52), armBack: bone(-3, 20, -0.12) }),
      pose({ legFront: bone(5, 0, -0.06), legBack: bone(-5, 0, 0.04), armFront: bone(11, 9, 0.48), armBack: bone(-4, 21, -0.16) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(6, 0, 0.18), armFront: bone(-2, 18, -0.7), armBack: bone(10, 20, 0.45), legFront: bone(10, -4, 0.4), legBack: bone(-6, 4, -0.3) }),
      pose({ body: bone(3, 0, 0.08), armFront: bone(0, 14, -0.4), armBack: bone(7, 22, 0.2), legFront: bone(7, 4, 0.15), legBack: bone(-10, -4, 0.4) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.05),
      head: bone(0, 10),
      armFront: bone(10, 18, 0.02),
      armBack: bone(-5, 16, -0.15),
      legFront: bone(9, 0, 0.4),
      legBack: bone(-6, 0, -0.3),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 6, -0.35), armBack: bone(-1, 4, -0.55), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 8, -0.4), armBack: bone(-2, 6, -0.6), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(0, 18, 0.45), armBack: bone(-6, 14, 0.55) }),
      pose({ body: bone(-6, 2, -0.2), head: bone(-4, 3, -0.25), armFront: bone(2, 21, 0.55), armBack: bone(-8, 16, 0.7) }),
      pose({ body: bone(-3, -1, -0.07), head: bone(-1, 1, -0.1), armFront: bone(-2, 15, 0.35), armBack: bone(-5, 13, 0.45) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.75), head: bone(7, 18, 0.85), armFront: bone(-4, 18, 0.55), armBack: bone(10, 16, -0.35), legFront: bone(-7, 14, -0.18), legBack: bone(5, 16, 0.28) }),
      pose({ body: bone(0, 28, 1.3), head: bone(9, 32, 1.1), legFront: bone(-9, 28, -0.28), legBack: bone(7, 30, 0.35) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(10, 4, 0.4),
      armBack: bone(-4, 2, -0.15),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-3, 0, -0.22),
    }),
    // — Attack poses (Slashing style: claw strikes, wide arm swings) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(16, 4, 0.15, 0.9), armBack: bone(-4, 8, -0.5, 0.8), legFront: bone(4, 0, 0.04), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.06), armFront: bone(22, 6, -0.02, 1.05), armBack: bone(-4, 8, -0.5, 0.8), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 5, 0.02), body: bone(1, 7, 0.04), armFront: bone(14, 7, 0.06, 0.9), armBack: bone(-4, 12, -0.35, 0.8), legFront: bone(12, 2, 0.2, 1.0), legBack: bone(-5, 5, -0.1) }),
      pose({ head: bone(1, 6, 0.04), body: bone(2, 9, 0.06), armFront: bone(20, 9, -0.04, 1.0), armBack: bone(-4, 12, -0.35, 0.8), legFront: bone(15, 3, 0.26, 1.05), legBack: bone(-5, 5, -0.14) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.04), armFront: bone(12, -1, -0.06, 0.9), armBack: bone(-4, 1, -0.22, 0.8), legFront: bone(9, 3, 0.22, 1.0), legBack: bone(-4, 0, -0.1) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(18, -2, -0.1, 1.05), armBack: bone(-4, 1, -0.22, 0.8), legFront: bone(13, 4, 0.3, 1.1), legBack: bone(-4, 0, -0.14) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(20, 2, 0.0, 1.1), armBack: bone(10, 4, -0.08, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(26, 3, -0.06, 1.25), armBack: bone(14, 5, -0.1, 1.05), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.16),
      body: bone(-2, 2, -0.07),
      armFront: bone(-3, 10, 0.3),
      armBack: bone(-5, 8, 0.22),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-4, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.03),
      body: bone(0, -1, 0),
      armFront: bone(8, 3, 0.35),
      armBack: bone(-4, 2, -0.15),
      legFront: bone(3, 2, 0.06),
      legBack: bone(-4, 1, -0.1),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -8, -0.07),
      armFront: bone(5, 2, 0.45),
      armBack: bone(-8, 1, -0.15),
      legFront: bone(-1, -8, 0.38),
      legBack: bone(7, -2, -0.48),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.7),
      head: bone(4, 23, 0.5),
      armFront: bone(-3, 25, 0.32),
      armBack: bone(7, 20, -0.4),
      legFront: bone(-6, 23, -0.22),
      legBack: bone(4, 21, 0.35),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.05),
      armFront: bone(10, 8, 0.55),
      armBack: bone(-6, 6, -0.25),
      legFront: bone(5, -5, 0.28),
      legBack: bone(-6, -3, -0.38),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.02),
      armFront: bone(10, 5, 0.35),
      armBack: bone(-5, 3, -0.18),
      legFront: bone(3, -2, 0.12),
      legBack: bone(-4, 0, -0.22),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 18, -0.5),
      head: bone(-3, 20, -0.45),
      armFront: bone(4, 21, 0.25),
      armBack: bone(-6, 18, -0.35),
      legFront: bone(4, 16, -0.15),
      legBack: bone(-4, 19, 0.25),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 7, -0.45),
      armBack: bone(-2, 5, -0.6),
      legFront: bone(2, -1, 0.08),
      legBack: bone(-3, 0, -0.12),
    }),
  },

  proportions: {
    headW: 34, headH: 36,
    torsoW: 38, torsoH: 58,
    armW: 13, armH: 42,
    legW: 17, legH: 56,
    shoulderY: 15, hipY: 55,
    torsoCenterY: 30, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Nocturnal Light
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_NOCTURNAL_LIGHT;

    // DP+K → Ecstasy 816 (anti-air upper)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return AttackType.MATURE_ECSTASY;
    }

    // QCB+P → Heaven's Gate (overhead slash)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.MATURE_HEAVENS_GATE;
    }

    // QCF+P → Metal Massacre (weak/strong)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.MATURE_MASSACRE_C : AttackType.MATURE_MASSACRE;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // →+A Despair (upper)
    if (!isAir && input.buttonAPressed && input.forward && !input.down) return AttackType.MATURE_DESPAIR;
    // →+B Jab (low)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.MATURE_JAB;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // Ecstasy 816: rise upward
    if (attackType === AttackType.MATURE_ECSTASY) {
      fighter.vy = -7;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() {
    return {
      activeFrames: 16,
      counterAttack: AttackType.MATURE_MASSACRE,
      counterDamage: 50,
      failureStun: 20,
    };
  },
};
