/**
 * 夏尔美 (Shermie) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Shermie Shoot (A fast punch rush, C stronger)
 *   QCB+P   → Shermie Carnival (multi-hit spinning attack)
 *   HCF+K   → Axle Spin Kick (B short, D long low sweep)
 * DM: QCFx2+K → Shermie Carnival DM (multi-hit super)
 * SDM: same motion, more damage
 *
 * APPROX based on KOF2002UM
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { shermiePortrait } from '../rendering/portraits/shermiePortrait.js';

export const ShermieDef: CharacterDefinition = {
  id: 'shermie',
  name: 'SHERMIE',
  nameCn: '夏尔美',
  color: '#cc44aa',
  accentColor: '#ee66cc',
  specialColor: '#cc44aa',
  specialGlow: '#aa2288',
  portrait: '♀',
  pixelPortrait: shermiePortrait,
  winQuotes: ['哎呀，你太弱了。', '还没玩够呢，再来吧。', '这就是大蛇一族的力量哦。'],

  stats: {
    walkSpeed: 4.2,
    runSpeed: 7.0,
    jumpVelocity: -13.5,
    hopVelocity: -10,
    hyperJumpVelocity: -16.5,
    maxHealth: 920,
    pushWidth: 56,
    jumpForwardSpeed: 5.0,
    closeRange: 75,
    throwRange: 110,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 妩媚站姿 — 一手叉腰，一手抬起，模特般优雅
      pose({ armFront: bone(10, 6, 0.45), armBack: bone(-4, 20, -0.12), legFront: bone(5, 0, 0.06), legBack: bone(-4, 0, -0.05) }),
      // Frame 1: 微呼吸 — 轻微上移
      pose({ armFront: bone(10, 5, 0.43), armBack: bone(-4, 19, -0.11), legFront: bone(5, 0, 0.06), legBack: bone(-4, 0, -0.05), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰 — 身体微升
      pose({ armFront: bone(10, 4, 0.41), armBack: bone(-4, 18, -0.1), legFront: bone(5, -1, 0.05), legBack: bone(-4, -1, -0.04), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡
      pose({ armFront: bone(10, 5, 0.43), armBack: bone(-4, 19, -0.11), legFront: bone(5, 0, 0.06), legBack: bone(-4, 0, -0.05), body: bone(0, -1) }),
      // Frame 4: 呼气 — 微沉
      pose({ armFront: bone(10, 7, 0.47), armBack: bone(-4, 21, -0.13), legFront: bone(5, 0, 0.06), legBack: bone(-4, 0, -0.05), body: bone(0, 1) }),
      // Frame 5: 呼气完成 — 恢复
      pose({ armFront: bone(11, 8, 0.48), armBack: bone(-4, 22, -0.14), legFront: bone(5, 1, 0.07), legBack: bone(-4, 1, -0.06), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(8, -2, 0.16), legBack: bone(-3, 2, -0.12), armFront: bone(8, 8, 0.42), armBack: bone(-5, 18, -0.18) }),
      pose({ legFront: bone(5, 0, 0.06), legBack: bone(-4, 0, -0.04), armFront: bone(10, 6, 0.45), armBack: bone(-4, 20, -0.12) }),
      pose({ legFront: bone(3, 2, -0.12), legBack: bone(-8, -2, 0.16), armFront: bone(10, 8, 0.47), armBack: bone(-3, 18, -0.1) }),
      pose({ legFront: bone(4, 0, -0.04), legBack: bone(-5, 0, 0.02), armFront: bone(9, 7, 0.44), armBack: bone(-4, 19, -0.14) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(5, 0, 0.16), armFront: bone(-2, 16, -0.65), armBack: bone(8, 18, 0.42), legFront: bone(9, -4, 0.38), legBack: bone(-5, 4, -0.28) }),
      pose({ body: bone(3, 0, 0.08), armFront: bone(0, 12, -0.38), armBack: bone(6, 20, 0.18), legFront: bone(6, 4, 0.14), legBack: bone(-9, -4, 0.38) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.04),
      head: bone(0, 10),
      armFront: bone(8, 16, 0.0),
      armBack: bone(-5, 14, -0.14),
      legFront: bone(8, 0, 0.38),
      legBack: bone(-6, 0, -0.28),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 6, -0.35), armBack: bone(-1, 4, -0.55), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 8, -0.4), armBack: bone(-2, 6, -0.6), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(0, 16, 0.42), armBack: bone(-6, 12, 0.52) }),
      pose({ body: bone(-6, 2, -0.2), head: bone(-4, 3, -0.25), armFront: bone(2, 18, 0.52), armBack: bone(-8, 14, 0.68) }),
      pose({ body: bone(-3, -1, -0.07), head: bone(-1, 1, -0.1), armFront: bone(-2, 14, 0.32), armBack: bone(-5, 11, 0.42) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.75), head: bone(7, 18, 0.85), armFront: bone(-4, 18, 0.55), armBack: bone(10, 16, -0.35), legFront: bone(-7, 14, -0.18), legBack: bone(5, 16, 0.28) }),
      pose({ body: bone(0, 28, 1.3), head: bone(9, 32, 1.1), legFront: bone(-9, 28, -0.28), legBack: bone(7, 30, 0.35) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(8, 4, 0.38),
      armBack: bone(-4, 2, -0.14),
      legFront: bone(3, -2, 0.08),
      legBack: bone(-3, 0, -0.2),
    }),
    // — Attack poses (Athletic striking style: graceful but powerful) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(15, 4, 0.12, 0.9), armBack: bone(-4, 8, -0.5, 0.8), legFront: bone(4, 0, 0.04), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.06), armFront: bone(20, 6, -0.04, 1.05), armBack: bone(-4, 8, -0.5, 0.8), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 5, 0.02), body: bone(1, 7, 0.04), armFront: bone(12, 7, 0.04, 0.9), armBack: bone(-4, 12, -0.32, 0.8), legFront: bone(10, 2, 0.18, 1.0), legBack: bone(-5, 5, -0.1) }),
      pose({ head: bone(1, 6, 0.04), body: bone(2, 9, 0.06), armFront: bone(18, 9, -0.06, 1.0), armBack: bone(-4, 12, -0.32, 0.8), legFront: bone(14, 3, 0.24, 1.05), legBack: bone(-5, 5, -0.12) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.04), armFront: bone(10, -1, -0.06, 0.9), armBack: bone(-4, 1, -0.2, 0.8), legFront: bone(8, 3, 0.2, 1.0), legBack: bone(-4, 0, -0.08) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(16, -2, -0.1, 1.05), armBack: bone(-4, 1, -0.2, 0.8), legFront: bone(12, 4, 0.28, 1.1), legBack: bone(-4, 0, -0.12) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(18, 2, 0.0, 1.1), armBack: bone(10, 4, -0.08, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(24, 3, -0.06, 1.25), armBack: bone(12, 5, -0.1, 1.05), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.07) }),
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
      armFront: bone(7, 3, 0.32),
      armBack: bone(-4, 2, -0.14),
      legFront: bone(3, 2, 0.06),
      legBack: bone(-4, 1, -0.08),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -8, -0.07),
      armFront: bone(5, 2, 0.42),
      armBack: bone(-8, 1, -0.14),
      legFront: bone(-1, -8, 0.36),
      legBack: bone(7, -2, -0.46),
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
      armFront: bone(8, 8, 0.52),
      armBack: bone(-6, 6, -0.24),
      legFront: bone(5, -5, 0.26),
      legBack: bone(-6, -3, -0.36),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.02),
      armFront: bone(8, 5, 0.32),
      armBack: bone(-5, 3, -0.16),
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
    headW: 32, headH: 34,
    torsoW: 36, torsoH: 56,
    armW: 12, armH: 42,
    legW: 16, legH: 54,
    shoulderY: 14, hipY: 52,
    torsoCenterY: 28, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+K → Shermie Carnival DM
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_K') return AttackType.DM_SHERMIE_CARNIVAL;

    // QCF+K → Axle Spin Kick (low sweep)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.SHERMIE_AXLE_SPIN;
    }

    // QCB+P → Shermie Carnival (spinning attack)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.SHERMIE_CARNIVAL;
    }

    // QCF+P → Shermie Shoot (weak/strong)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonC ? AttackType.SHERMIE_SHOOT_C : AttackType.SHERMIE_SHOOT;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // →+A Shermie Stand (upper)
    if (!isAir && input.buttonAPressed && input.forward && !input.down) return AttackType.SHERMIE_STAND;
    // →+B Shermie Clash (low)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.SHERMIE_CLASH;
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
