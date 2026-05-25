/**
 * 比利·凯恩 (Billy Kane) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Sansetsu Kon (三节棍, A fast, C more range)
 *   QCB+P   → Senpu Kon (旋风棍, anti-air, A 1-hit, C 2-hit)
 *   QCB+K   → Kyousoku Hien Zan (急速飛燕斬, B short, D long)
 * DM: QCFx2+P → Chou Kaen Senpu Jin (超火炎旋風陣)
 * SDM: same motion, more damage
 *
 * APPROX based on KOF2002UM
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { AttackType, FighterState } from '../core/types.js';
import { billyPortrait } from '../rendering/portraits/billyPortrait.js';

export const BillyDef: CharacterDefinition = {
  id: 'billy',
  name: 'BILLY KANE',
  nameCn: '比利',
  color: '#4488cc',
  accentColor: '#66aaee',
  specialColor: '#4488cc',
  specialGlow: '#2266aa',
  portrait: '棍',
  pixelPortrait: billyPortrait,
  winQuotes: ['Geese大人的敌人就是我的敌人。', '你连我的棍子都接不住。', '这就是三节棍的威力。'],

  stats: {
    walkSpeed: 3.5,
    runSpeed: 6.0,
    jumpVelocity: -14.0,
    hopVelocity: -9.0,
    hyperJumpVelocity: -17.0,
    maxHealth: 1050,
    pushWidth: 64,
    jumpForwardSpeed: 4.5,
    closeRange: 82,
    throwRange: 100,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: Wide staff stance — one hand up holding staff, one at chest
      pose({ head: bone(0, 0, 0.02), body: bone(0, 0, 0.05), armFront: bone(12, 4, -0.25), armBack: bone(-4, 10, 0.15), legFront: bone(8, 0, 0.15), legBack: bone(-8, 0, -0.15) }),
      // Frame 1: Slight breathe — body rises
      pose({ head: bone(0, -1, 0.02), body: bone(0, -2, 0.04), armFront: bone(11, 2, -0.27), armBack: bone(-5, 8, 0.13), legFront: bone(8, 0, 0.15), legBack: bone(-8, 0, -0.15) }),
      // Frame 2: Peak — arms shift
      pose({ head: bone(0, -2, 0.01), body: bone(-1, -3, 0.02), armFront: bone(10, 0, -0.3), armBack: bone(-5, 6, 0.1), legFront: bone(7, 0, 0.12), legBack: bone(-7, 0, -0.12) }),
      // Frame 3: Transition
      pose({ head: bone(0, -1, 0.02), body: bone(0, -1, 0.04), armFront: bone(11, 3, -0.26), armBack: bone(-4, 9, 0.14), legFront: bone(8, 0, 0.14), legBack: bone(-8, 0, -0.14) }),
      // Frame 4: Exhale — sinks
      pose({ head: bone(1, 1, 0.04), body: bone(1, 1, 0.07), armFront: bone(13, 6, -0.22), armBack: bone(-3, 12, 0.18), legFront: bone(8, 0, 0.16), legBack: bone(-8, 0, -0.16) }),
      // Frame 5: Exhale trough — lowest point
      pose({ head: bone(1, 2, 0.05), body: bone(1, 2, 0.08), armFront: bone(14, 7, -0.2), armBack: bone(-3, 13, 0.2), legFront: bone(9, 0, 0.17), legBack: bone(-9, 0, -0.17) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.2), legBack: bone(-3, 2, -0.15), armFront: bone(8, 8, -0.18), armBack: bone(-6, 14, 0.1) }),
      pose({ legFront: bone(8, 0, 0.12), legBack: bone(-4, 0, -0.08), armFront: bone(10, 6, -0.24), armBack: bone(-5, 12, 0.14) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-10, -2, 0.2), armFront: bone(12, 4, -0.28), armBack: bone(-4, 10, 0.16) }),
      pose({ legFront: bone(7, 0, -0.08), legBack: bone(-5, 0, 0.06), armFront: bone(10, 5, -0.22), armBack: bone(-5, 11, 0.12) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(8, 0, 0.2), armFront: bone(-4, 18, -0.85), armBack: bone(14, 22, 0.55), legFront: bone(12, -4, 0.45), legBack: bone(-8, 4, -0.35) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-2, 14, -0.5), armBack: bone(10, 26, 0.25), legFront: bone(8, 4, 0.2), legBack: bone(-12, -4, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.05),
      head: bone(0, 14),
      armFront: bone(10, 16, -0.1),
      armBack: bone(-6, 14, 0.05),
      legFront: bone(12, 0, 0.55),
      legBack: bone(-10, 0, -0.45),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 6, -0.4), armBack: bone(-1, 4, -0.6) }),
      pose({ armFront: bone(1, 8, -0.45), armBack: bone(-2, 6, -0.65), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(-3, 18, 0.5), armBack: bone(-8, 16, 0.6) }),
      pose({ body: bone(-7, 2, -0.2), head: bone(-4, 3, -0.28), armFront: bone(-1, 20, 0.6), armBack: bone(-10, 18, 0.75) }),
      pose({ body: bone(-3, -1, -0.06), head: bone(-1, 1, -0.1), armFront: bone(-5, 16, 0.4), armBack: bone(-6, 14, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(10, 6, -0.2),
      armBack: bone(-6, 4, 0.15),
      legFront: bone(5, -3, 0.18),
      legBack: bone(-6, 0, -0.3),
    }),
    // Staff fighter attack poses — extended reach
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, -1, 0.04), body: bone(2, 0, 0.1), armFront: bone(18, 2, -0.1, 1.15), armBack: bone(-8, 10, -0.7, 0.9), legFront: bone(7, 0, 0.12), legBack: bone(-8, 0, -0.14) }),
      pose({ head: bone(4, 0, 0.06), body: bone(5, 0, 0.15), armFront: bone(28, 6, -0.15, 1.3), armBack: bone(-8, 10, -0.7, 0.9), legFront: bone(9, 0, 0.18), legBack: bone(-9, 0, -0.18) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(3, 7, 0.06), body: bone(2, 10, 0.1), armFront: bone(16, 6, -0.05, 1.1), armBack: bone(-6, 12, -0.5, 0.85), legFront: bone(14, 3, 0.28, 1.05), legBack: bone(-10, 8, -0.22) }),
      pose({ head: bone(4, 8, 0.1), body: bone(4, 12, 0.15), armFront: bone(24, 8, -0.15, 1.25), armBack: bone(-6, 12, -0.5, 0.85), legFront: bone(17, 4, 0.35, 1.1), legBack: bone(-10, 8, -0.25) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.05), body: bone(2, 0, 0.1), armFront: bone(18, -4, -0.15, 1.15), armBack: bone(-10, 0, -0.4, 0.85), legFront: bone(10, 3, 0.28, 1.1), legBack: bone(-8, -2, -0.2) }),
      pose({ head: bone(2, -2, -0.1), body: bone(4, 0, 0.16), armFront: bone(26, -6, -0.25, 1.35), armBack: bone(-10, 0, -0.4, 0.85), legFront: bone(14, 5, 0.38, 1.2), legBack: bone(-8, -2, -0.28) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(22, 3, -0.05, 1.2), armBack: bone(12, 5, -0.1, 1.05), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.05), body: bone(6, 0, 0.18), armFront: bone(28, 4, -0.12, 1.4), armBack: bone(16, 6, -0.15, 1.15), legFront: bone(6, 0, 0.12), legBack: bone(-6, 0, -0.12) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.08),
      armFront: bone(-4, 10, 0.35),
      armBack: bone(-6, 8, 0.25),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-5, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(8, 2, -0.15),
      armBack: bone(-4, 0, 0.1),
      legFront: bone(4, 3, 0.1),
      legBack: bone(-5, 2, -0.15),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.08),
      armFront: bone(6, 2, 0.5),
      armBack: bone(-8, 0, -0.15),
      legFront: bone(-2, -8, 0.4),
      legBack: bone(6, -3, -0.5),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(4, 25, 0.55),
      armFront: bone(-4, 28, 0.35),
      armBack: bone(8, 22, -0.45),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(5, 24, 0.4),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(10, 8, 0.4),
      armBack: bone(-7, 6, -0.25),
      legFront: bone(6, -6, 0.3),
      legBack: bone(-6, -4, -0.4),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(4, -4, -0.02),
      armFront: bone(9, 5, 0.22),
      armBack: bone(-6, 3, -0.18),
      legFront: bone(4, -3, 0.15),
      legBack: bone(-4, -1, -0.22),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.55),
      head: bone(-4, 22, -0.5),
      armFront: bone(4, 24, 0.3),
      armBack: bone(-6, 20, -0.4),
      legFront: bone(4, 18, -0.2),
      legBack: bone(-4, 21, 0.3),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 6, -0.45),
      armBack: bone(-2, 4, -0.6),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  proportions: {
    headW: 36, headH: 36,
    torsoW: 42, torsoH: 68,
    armW: 15, armH: 52,
    legW: 19, legH: 62,
    shoulderY: 16, hipY: 60,
    torsoCenterY: 34, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Chou Kaen Senpu Jin
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_KAEN_SENPU_JIN;

    // QCB+P → Senpu Kon (anti-air)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonC ? AttackType.BILLY_SENPU_KON_C : AttackType.BILLY_SENPU_KON;
    }

    // QCB+K → Kyousoku Hien Zan (flying slash)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonD ? AttackType.BILLY_HIEN_ZAN_D : AttackType.BILLY_HIEN_ZAN;
    }

    // QCF+P → Sansetsu Kon (staff thrust)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonC ? AttackType.BILLY_SANSETSU_KON_C : AttackType.BILLY_SANSETSU_KON;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A Sandan Gear (overhead upper)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.BILLY_SANDAN_GEAR;
    // →+B Senshu Ikkyaku (low)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.BILLY_SENSHU_IKKYAKU;
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
  getCounterConfig() { return null; },
};
