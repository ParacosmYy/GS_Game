/**
 * 布鲁·玛丽 (Blue Mary) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Straight Slicer (突进踢, A弱/C强)
 *   QCB+P   → Backdrop Real (抓取背摔)
 *   DP+K    → Mary Spider (下段旋转踢)
 * DM: QCFx2+K → Mary Typhoon (多段旋转连踢)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { maryPortrait } from '../rendering/portraits/maryPortrait.js';

export const MaryDef: CharacterDefinition = {
  id: 'mary',
  name: 'MARY',
  nameCn: '布鲁·玛丽',
  color: '#5588cc',
  accentColor: '#77aaee',
  specialColor: '#88bbff',
  specialGlow: '#aaddff',
  portrait: 'M',
  pixelPortrait: maryPortrait,
  winQuotes: ['正义必胜！这是祖父教我的。', '你还不行呢，再练练吧。', '任务完成！下次再来挑战吧。'],

  stats: {
    walkSpeed: 4.4,
    runSpeed: 7.2,
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
      // Frame 0: 自信格斗站姿 — 双手微握，重心稳定
      pose({ armFront: bone(10, 12, 0.35), armBack: bone(-6, 18, -0.2), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.05) }),
      // Frame 1: 微呼吸 — 轻微上移
      pose({ armFront: bone(10, 11, 0.33), armBack: bone(-6, 17, -0.19), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.05), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰
      pose({ armFront: bone(10, 10, 0.31), armBack: bone(-6, 16, -0.18), legFront: bone(4, -1, 0.05), legBack: bone(-5, -1, -0.04), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡
      pose({ armFront: bone(10, 11, 0.33), armBack: bone(-6, 17, -0.19), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.05), body: bone(0, -1) }),
      // Frame 4: 呼气 — 微沉
      pose({ armFront: bone(11, 13, 0.37), armBack: bone(-6, 19, -0.21), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.05), body: bone(0, 1) }),
      // Frame 5: 呼气完成
      pose({ armFront: bone(11, 13, 0.38), armBack: bone(-6, 19, -0.22), legFront: bone(4, 1, 0.07), legBack: bone(-5, 1, -0.06), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(8, -2, 0.16), legBack: bone(-3, 2, -0.12), armFront: bone(8, 14, 0.4), armBack: bone(-6, 16, -0.25) }),
      pose({ legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.05), armFront: bone(10, 12, 0.35), armBack: bone(-6, 18, -0.2) }),
      pose({ legFront: bone(3, 2, -0.12), legBack: bone(-8, -2, 0.16), armFront: bone(10, 14, 0.38), armBack: bone(-5, 16, -0.17) }),
      pose({ legFront: bone(4, 0, -0.04), legBack: bone(-5, 0, 0.03), armFront: bone(9, 13, 0.36), armBack: bone(-6, 17, -0.21) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(5, 0, 0.16), armFront: bone(-2, 16, -0.65), armBack: bone(8, 18, 0.4), legFront: bone(9, -4, 0.36), legBack: bone(-5, 4, -0.26) }),
      pose({ body: bone(3, 0, 0.06), armFront: bone(0, 12, -0.35), armBack: bone(6, 20, 0.18), legFront: bone(6, 4, 0.12), legBack: bone(-9, -4, 0.36) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.04),
      head: bone(0, 10),
      armFront: bone(8, 16, 0.0),
      armBack: bone(-5, 14, -0.12),
      legFront: bone(8, 0, 0.36),
      legBack: bone(-5, 0, -0.26),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 6, -0.32), armBack: bone(-1, 4, -0.52), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 8, -0.38), armBack: bone(-2, 6, -0.56), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.1), head: bone(-2, 2, -0.16), armFront: bone(0, 16, 0.42), armBack: bone(-6, 12, 0.5) }),
      pose({ body: bone(-6, 2, -0.18), head: bone(-4, 3, -0.22), armFront: bone(2, 19, 0.5), armBack: bone(-8, 14, 0.65) }),
      pose({ body: bone(-3, -1, -0.06), head: bone(-1, 1, -0.08), armFront: bone(-2, 13, 0.32), armBack: bone(-5, 11, 0.4) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.72), head: bone(6, 18, 0.82), armFront: bone(-4, 18, 0.5), armBack: bone(10, 16, -0.32), legFront: bone(-7, 14, -0.16), legBack: bone(5, 16, 0.25) }),
      pose({ body: bone(0, 28, 1.28), head: bone(8, 32, 1.08), legFront: bone(-9, 28, -0.25), legBack: bone(7, 30, 0.32) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(8, 4, 0.36),
      armBack: bone(-5, 2, -0.12),
      legFront: bone(3, -2, 0.08),
      legBack: bone(-3, 0, -0.2),
    }),
    // 攻击姿态 — 格斗武术风格: 直拳/肘击/踢击
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(14, 4, 0.12, 0.88), armBack: bone(-5, 7, -0.45, 0.78), legFront: bone(4, 0, 0.04), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.06), armFront: bone(20, 6, -0.02, 1.02), armBack: bone(-5, 7, -0.45, 0.78), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 5, 0.02), body: bone(1, 7, 0.04), armFront: bone(12, 7, 0.04, 0.88), armBack: bone(-5, 10, -0.3, 0.78), legFront: bone(10, 2, 0.18, 0.98), legBack: bone(-5, 5, -0.08) }),
      pose({ head: bone(1, 6, 0.04), body: bone(2, 9, 0.06), armFront: bone(18, 9, -0.04, 0.98), armBack: bone(-5, 10, -0.3, 0.78), legFront: bone(14, 3, 0.24, 1.02), legBack: bone(-5, 5, -0.12) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.04), armFront: bone(10, -1, -0.06, 0.88), armBack: bone(-5, 1, -0.2, 0.78), legFront: bone(8, 3, 0.2, 0.98), legBack: bone(-4, 0, -0.08) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(16, -2, -0.1, 1.02), armBack: bone(-5, 1, -0.2, 0.78), legFront: bone(12, 4, 0.28, 1.08), legBack: bone(-4, 0, -0.12) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(18, 2, 0.0, 1.08), armBack: bone(10, 4, -0.06, 0.92), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(24, 3, -0.06, 1.22), armBack: bone(12, 5, -0.1, 1.02), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.14),
      body: bone(-2, 2, -0.06),
      armFront: bone(-3, 8, 0.28),
      armBack: bone(-5, 6, 0.2),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-4, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.02),
      body: bone(0, -1, 0),
      armFront: bone(6, 3, 0.32),
      armBack: bone(-5, 2, -0.12),
      legFront: bone(3, 2, 0.05),
      legBack: bone(-4, 1, -0.08),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -8, -0.06),
      armFront: bone(4, 2, 0.42),
      armBack: bone(-8, 1, -0.12),
      legFront: bone(-1, -8, 0.36),
      legBack: bone(7, -2, -0.46),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.68),
      head: bone(4, 23, 0.48),
      armFront: bone(-3, 25, 0.3),
      armBack: bone(7, 20, -0.38),
      legFront: bone(-6, 23, -0.2),
      legBack: bone(4, 21, 0.32),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.04),
      armFront: bone(8, 8, 0.5),
      armBack: bone(-5, 6, -0.22),
      legFront: bone(5, -5, 0.26),
      legBack: bone(-6, -3, -0.36),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.02),
      armFront: bone(8, 5, 0.32),
      armBack: bone(-5, 3, -0.16),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.2),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 18, -0.48),
      head: bone(-3, 20, -0.42),
      armFront: bone(4, 21, 0.22),
      armBack: bone(-6, 18, -0.32),
      legFront: bone(4, 16, -0.14),
      legBack: bone(-4, 19, 0.22),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 7, -0.42),
      armBack: bone(-2, 5, -0.56),
      legFront: bone(2, -1, 0.06),
      legBack: bone(-3, 0, -0.1),
    }),
  },

  proportions: {
    headW: 32, headH: 34,
    torsoW: 34, torsoH: 54,
    armW: 12, armH: 40,
    legW: 15, legH: 54,
    shoulderY: 14, hipY: 54,
    torsoCenterY: 28, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+K → Mary Typhoon
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_K') return AttackType.DM_MARY_TYPHOON;

    // DP+K → Mary Spider (low sweep)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.MARY_SPIDER;
    }

    // QCB+P → Backdrop Real (grab slam)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.MARY_BACKDROP_REAL;
    }

    // QCF+P → Straight Slicer (weak/strong rush kick)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.MARY_STRAIGHT_SLICER_C : AttackType.MARY_STRAIGHT_SLICER;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // ->+A Hammer Punch (upper)
    if (!isAir && input.buttonAPressed && input.forward && !input.down) return AttackType.MARY_HAMMER_PUNCH;
    // ->+B Double Rolling (low)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.MARY_DOUBLE_ROLLING;
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

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() {
    return null;
  },
};
