/**
 * 克拉克·斯蒂尔 (Clark Still) — 角色定义
 *
 * 必杀技:
 *   QCB+P  → Super Argentine Backbreaker (command grab, A faster, C more damage)
 *   DP+P   → Flash Elbow (follow-up after grab)
 *   QCF+K  → Vulcan Punch (multi-hit)
 * DM: QCF×2+P → Super Argentine Backbreaker DM
 * SDM: same motion, more damage (MAX mode)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { AttackType, FighterState } from '../core/types.js';
import { clarkPortrait } from '../rendering/portraits/clarkPortrait.js';

export const ClarkDef: CharacterDefinition = {
  id: 'clark',
  name: 'CLARK STILL',
  nameCn: '克拉克',
  color: '#556b2f',
  accentColor: '#6b8e23',
  specialColor: '#88aa44',
  specialGlow: '#aacc66',
  portrait: '💪',
  pixelPortrait: clarkPortrait,
  winQuotes: ['任务完成。', '你太轻了。', '这就是军队的格斗术。'],

  stats: {
    walkSpeed: 3.2,
    runSpeed: 6.0,
    jumpVelocity: -14.0,
    hopVelocity: -9.0,
    hyperJumpVelocity: -17.0,
    maxHealth: 1050,
    pushWidth: 66,
    jumpForwardSpeed: 4.0,
    closeRange: 85,
    throwRange: 115,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: Grappler stance — wide base, fists up, ready to grab
      pose({ head: bone(0, 0, 0.03), body: bone(0, 0, 0.06), armFront: bone(16, 14, 0.22), armBack: bone(-8, 12, -0.42), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // Frame 1: Breathe — body rises, fists tighten
      pose({ head: bone(0, -1, 0.02), body: bone(0, -2, 0.04), armFront: bone(15, 12, 0.24), armBack: bone(-8, 10, -0.44), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // Frame 2: Peak — maximum rise, shoulders tense
      pose({ head: bone(0, -2, 0.01), body: bone(-1, -3, 0.02), armFront: bone(14, 10, 0.26), armBack: bone(-9, 8, -0.46), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // Frame 3: Transition — starts to sink
      pose({ head: bone(0, -1, 0.02), body: bone(0, -1, 0.04), armFront: bone(15, 12, 0.23), armBack: bone(-8, 10, -0.43), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // Frame 4: Exhale — sinks, shoulders roll forward
      pose({ head: bone(1, 1, 0.05), body: bone(1, 1, 0.08), armFront: bone(17, 16, 0.18), armBack: bone(-7, 14, -0.38), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // Frame 5: Exhale trough — lowest point
      pose({ head: bone(1, 2, 0.06), body: bone(1, 2, 0.09), armFront: bone(17, 17, 0.17), armBack: bone(-7, 15, -0.37), legFront: bone(9, 0, 0.13), legBack: bone(-9, 0, -0.13) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.18), legBack: bone(-4, 2, -0.12), armFront: bone(12, 20, 0.12), armBack: bone(-6, 18, -0.3) }),
      pose({ legFront: bone(8, 0, 0.1), legBack: bone(-5, 0, -0.06), armFront: bone(14, 17, 0.15), armBack: bone(-7, 15, -0.34) }),
      pose({ legFront: bone(5, 2, -0.15), legBack: bone(-10, -2, 0.18), armFront: bone(12, 16, 0.18), armBack: bone(-6, 19, -0.28) }),
      pose({ legFront: bone(7, 0, -0.06), legBack: bone(-6, 0, 0.04), armFront: bone(13, 18, 0.14), armBack: bone(-6, 16, -0.32) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(8, 0, 0.2), armFront: bone(-5, 22, -0.9), armBack: bone(14, 24, 0.6), legFront: bone(12, -4, 0.45), legBack: bone(-8, 4, -0.35) }),
      pose({ body: bone(5, 0, 0.1), armFront: bone(-3, 16, -0.5), armBack: bone(10, 28, 0.28), legFront: bone(9, 4, 0.2), legBack: bone(-12, -4, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.06),
      head: bone(0, 14),
      armFront: bone(12, 20, 0.08),
      armBack: bone(-8, 18, -0.18),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-8, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(5, 10, -0.32), armBack: bone(2, 8, -0.52) }),
      pose({ armFront: bone(4, 12, -0.38), armBack: bone(1, 10, -0.58), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.1), head: bone(-2, 2, -0.16), armFront: bone(-2, 18, 0.48), armBack: bone(-7, 16, 0.55) }),
      pose({ body: bone(-6, 2, -0.18), head: bone(-4, 3, -0.26), armFront: bone(0, 21, 0.58), armBack: bone(-9, 18, 0.7) }),
      pose({ body: bone(-3, -1, -0.05), head: bone(-1, 1, -0.08), armFront: bone(-4, 16, 0.38), armBack: bone(-5, 14, 0.45) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.75), head: bone(8, 20, 0.85), armFront: bone(-5, 20, 0.55), armBack: bone(12, 18, -0.35), legFront: bone(-8, 15, -0.18), legBack: bone(6, 18, 0.28) }),
      pose({ body: bone(0, 30, 1.35), head: bone(10, 35, 1.15), legFront: bone(-10, 30, -0.28), legBack: bone(8, 32, 0.38) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(14, 8, 0.28),
      armBack: bone(-8, 6, -0.22),
      legFront: bone(5, -3, 0.18),
      legBack: bone(-6, 0, -0.32),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, -1, 0.04), body: bone(2, 0, 0.1), armFront: bone(16, 3, 0.12, 1.1), armBack: bone(-10, 11, -0.82, 0.88), legFront: bone(8, 0, 0.1), legBack: bone(-9, 0, -0.12) }),
      pose({ head: bone(4, 0, 0.06), body: bone(5, 0, 0.15), armFront: bone(32, 8, 0.08, 1.22), armBack: bone(-10, 11, -0.82, 0.88), legFront: bone(10, 0, 0.16), legBack: bone(-10, 0, -0.16) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(3, 7, 0.06), body: bone(2, 10, 0.1), armFront: bone(15, 7, 0.05, 1.02), armBack: bone(-8, 15, -0.55, 0.82), legFront: bone(15, 3, 0.26, 1.02), legBack: bone(-10, 8, -0.2) }),
      pose({ head: bone(4, 8, 0.1), body: bone(4, 12, 0.15), armFront: bone(24, 9, -0.08, 1.18), armBack: bone(-8, 15, -0.55, 0.82), legFront: bone(18, 4, 0.32, 1.08), legBack: bone(-10, 8, -0.22) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.04), body: bone(2, 0, 0.1), armFront: bone(18, -2, -0.1, 1.08), armBack: bone(-12, 0, -0.48, 0.82), legFront: bone(13, 3, 0.3, 1.08), legBack: bone(-10, -2, -0.2) }),
      pose({ head: bone(2, -2, -0.08), body: bone(4, 0, 0.15), armFront: bone(24, -4, -0.18, 1.22), armBack: bone(-12, 0, -0.48, 0.82), legFront: bone(17, 5, 0.38, 1.18), legBack: bone(-10, -2, -0.25) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.04), body: bone(5, 0, 0.14), armFront: bone(22, 2, 0.02, 1.22), armBack: bone(15, 4, -0.08, 1.02), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(4, 1, 0.06), body: bone(7, 0, 0.2), armFront: bone(28, 3, -0.06, 1.35), armBack: bone(20, 5, -0.12, 1.15), legFront: bone(7, 0, 0.12), legBack: bone(-7, 0, -0.12) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.16),
      body: bone(-2, 2, -0.06),
      armFront: bone(-4, 12, 0.32),
      armBack: bone(-6, 10, 0.22),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-5, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.03),
      body: bone(0, -1, 0),
      armFront: bone(12, 4, 0.16),
      armBack: bone(-6, 3, -0.2),
      legFront: bone(5, 3, 0.1),
      legBack: bone(-6, 2, -0.16),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.06),
      armFront: bone(8, 4, 0.5),
      armBack: bone(-10, 2, -0.16),
      legFront: bone(-2, -8, 0.42),
      legBack: bone(8, -3, -0.52),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.72),
      head: bone(4, 25, 0.52),
      armFront: bone(-4, 28, 0.32),
      armBack: bone(8, 22, -0.42),
      legFront: bone(-7, 25, -0.22),
      legBack: bone(5, 24, 0.38),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.05),
      armFront: bone(14, 8, 0.42),
      armBack: bone(-8, 6, -0.28),
      legFront: bone(7, -6, 0.32),
      legBack: bone(-7, -4, -0.42),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(4, -4, -0.02),
      armFront: bone(12, 6, 0.25),
      armBack: bone(-7, 4, -0.2),
      legFront: bone(5, -3, 0.16),
      legBack: bone(-5, -1, -0.25),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.52),
      head: bone(-4, 22, -0.48),
      armFront: bone(5, 24, 0.28),
      armBack: bone(-7, 20, -0.38),
      legFront: bone(5, 18, -0.18),
      legBack: bone(-5, 21, 0.28),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.48),
      armBack: bone(-2, 6, -0.62),
      legFront: bone(3, -2, 0.08),
      legBack: bone(-4, 0, -0.12),
    }),
  },

  proportions: {
    headW: 38, headH: 38,
    torsoW: 50, torsoH: 70,
    armW: 18, armH: 50,
    legW: 20, legH: 62,
    shoulderY: 16, hipY: 60,
    torsoCenterY: 34, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → Super Argentine Backbreaker DM
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_ARGENTINE_DM;

    // DP+P → Flash Elbow (follow-up)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.CLARK_FLASH_ELBOW;

    // QCB+P → Super Argentine Backbreaker (command grab)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonCPressed ? AttackType.CLARK_ARGENTINE_C : AttackType.CLARK_ARGENTINE;
    }

    // QCF+K → Vulcan Punch (multi-hit)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.CLARK_VULCAN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A Death Lake Drive (overhead)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.CLARK_DEATH_LAKE;
    // →+B Stomp (low)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CLARK_STOMP;
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

  isCommandThrow(attackType) {
    return attackType === AttackType.CLARK_ARGENTINE
      || attackType === AttackType.CLARK_ARGENTINE_C
      || attackType === AttackType.DM_ARGENTINE_DM
      || attackType === AttackType.SDM_ARGENTINE_DM;
  },

  getCounterConfig() { return null; },
};
