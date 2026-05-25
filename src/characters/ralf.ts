/**
 * 拉尔夫·琼斯 (Ralf Jones) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Vulcan Punch (多段突进拳, A快/C多段)
 *   HCB+P   → Backbreaker (指令投)
 *   QCB+K   → Ralf Kick (飞身踢)
 * DM: QCFx2+P → Galactica Phantom (大突进拳)
 *
 * 命令通常技:
 *   →+A  → Sabre Punch (中段)
 *   →+B  → Sabre Kick (下段)
 *
 * 所有帧数据 APPROX 基于KOF2002UM
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { ralfPortrait } from '../rendering/portraits/ralfPortrait.js';

export const RalfDef: CharacterDefinition = {
  id: 'ralf',
  name: 'Ralf Jones',
  nameCn: '拉尔夫',
  color: '#cc6633',
  accentColor: '#dd8844',
  specialColor: '#cc6633',
  specialGlow: '#ff8844',
  portrait: '💥',
  pixelPortrait: ralfPortrait,
  winQuotes: ['哼，太弱了！', '这就是我的力量！', '再来一场！'],

  stats: {
    walkSpeed: 3.2,
    runSpeed: 6.8,
    jumpVelocity: -13.5,
    hopVelocity: -9,
    hyperJumpVelocity: -16.5,
    maxHealth: 1100,
    pushWidth: 68,
    jumpForwardSpeed: 4.2,
    closeRange: 85,
    throwRange: 105,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 中立站姿 — 宽脚架拳，重装格斗家
      pose({ head: bone(0, 0, 0.02), body: bone(0, 0, 0.06), armFront: bone(16, 18, 0.2), armBack: bone(-10, 16, -0.4), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // 帧1: 吸气 — 身体微升
      pose({ head: bone(0, -1, 0.03), body: bone(0, -2, 0.05), armFront: bone(15, 16, 0.22), armBack: bone(-10, 14, -0.42), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // 帧2: 吸气巅峰
      pose({ head: bone(0, -2, 0.02), body: bone(-1, -3, 0.04), armFront: bone(14, 14, 0.24), armBack: bone(-11, 12, -0.44), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // 帧3: 过渡
      pose({ head: bone(0, -1, 0.03), body: bone(0, -1, 0.05), armFront: bone(15, 16, 0.21), armBack: bone(-10, 14, -0.42), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // 帧4: 呼气 — 下沉
      pose({ head: bone(1, 1, 0.05), body: bone(1, 2, 0.08), armFront: bone(17, 20, 0.18), armBack: bone(-9, 18, -0.36), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // 帧5: 呼气完成
      pose({ head: bone(1, 2, 0.06), body: bone(1, 3, 0.09), armFront: bone(17, 21, 0.16), armBack: bone(-9, 19, -0.35), legFront: bone(9, 0, 0.13), legBack: bone(-9, 0, -0.13) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(12, -2, 0.22), legBack: bone(-4, 2, -0.16), armFront: bone(12, 24, 0.1), armBack: bone(-8, 22, -0.32) }),
      pose({ legFront: bone(9, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(13, 20, 0.14), armBack: bone(-9, 19, -0.36) }),
      pose({ legFront: bone(6, 2, -0.2), legBack: bone(-12, -2, 0.22), armFront: bone(12, 20, 0.16), armBack: bone(-7, 23, -0.3) }),
      pose({ legFront: bone(8, 0, -0.08), legBack: bone(-6, 0, 0.06), armFront: bone(12, 22, 0.12), armBack: bone(-8, 20, -0.34) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(8, 0, 0.2), armFront: bone(-8, 26, -0.9), armBack: bone(18, 28, 0.6), legFront: bone(16, -5, 0.5), legBack: bone(-10, 5, -0.4) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-4, 20, -0.5), armBack: bone(12, 32, 0.3), legFront: bone(12, 5, 0.2), legBack: bone(-16, -5, 0.5) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.06),
      head: bone(0, 16),
      armFront: bone(12, 24, 0.06),
      armBack: bone(-8, 22, -0.16),
      legFront: bone(12, 0, 0.5),
      legBack: bone(-10, 0, -0.42),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(5, 12, -0.35), armBack: bone(2, 10, -0.55) }),
      pose({ armFront: bone(4, 14, -0.4), armBack: bone(1, 12, -0.6), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-5, 0, -0.14), head: bone(-3, 2, -0.2), armFront: bone(-2, 22, 0.5), armBack: bone(-10, 20, 0.6) }),
      pose({ body: bone(-8, 2, -0.22), head: bone(-5, 3, -0.3), armFront: bone(0, 25, 0.6), armBack: bone(-12, 22, 0.75) }),
      pose({ body: bone(-4, -1, -0.08), head: bone(-2, 1, -0.12), armFront: bone(-6, 20, 0.4), armBack: bone(-8, 18, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 18, 0.8), head: bone(8, 22, 0.9), armFront: bone(-5, 22, 0.6), armBack: bone(12, 20, -0.4), legFront: bone(-8, 18, -0.2), legBack: bone(6, 20, 0.3) }),
      pose({ body: bone(0, 32, 1.4), head: bone(10, 38, 1.2), armFront: bone(-5, 38, 0.8), armBack: bone(15, 32, -0.6), legFront: bone(-10, 32, -0.3), legBack: bone(8, 34, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(14, 12, 0.3),
      armBack: bone(-8, 10, -0.25),
      legFront: bone(5, -3, 0.2),
      legBack: bone(-6, 0, -0.35),
    }),
    // — Attack poses (重装格斗家: 大幅挥拳，身体前压) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, -1, 0.04), body: bone(3, 0, 0.12), armFront: bone(18, 4, 0.15, 1.1), armBack: bone(-12, 14, -0.85, 0.9), legFront: bone(8, 0, 0.14), legBack: bone(-9, 0, -0.16) }),
      pose({ head: bone(5, 0, 0.08), body: bone(7, 0, 0.18), armFront: bone(34, 12, 0.1, 1.3), armBack: bone(-12, 14, -0.85, 0.9), legFront: bone(10, 0, 0.2), legBack: bone(-10, 0, -0.2) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(3, 8, 0.06), body: bone(3, 12, 0.1), armFront: bone(16, 8, 0.05, 1.05), armBack: bone(-10, 18, -0.6, 0.85), legFront: bone(16, 3, 0.3, 1.05), legBack: bone(-12, 8, -0.24) }),
      pose({ head: bone(5, 10, 0.12), body: bone(5, 14, 0.16), armFront: bone(24, 12, -0.1, 1.2), armBack: bone(-10, 18, -0.6, 0.85), legFront: bone(20, 4, 0.38, 1.1), legBack: bone(-12, 8, -0.28) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.05), body: bone(3, 0, 0.1), armFront: bone(18, -2, -0.12, 1.1), armBack: bone(-14, 0, -0.5, 0.85), legFront: bone(14, 3, 0.32, 1.1), legBack: bone(-10, -2, -0.22) }),
      pose({ head: bone(2, -2, -0.1), body: bone(5, 0, 0.16), armFront: bone(26, -4, -0.2, 1.25), armBack: bone(-14, 0, -0.5, 0.85), legFront: bone(18, 5, 0.4, 1.2), legBack: bone(-10, -2, -0.28) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(3, 0, 0.04), body: bone(5, 0, 0.14), armFront: bone(22, 3, 0.0, 1.2), armBack: bone(16, 5, -0.1, 1.05), legFront: bone(6, 0, 0.12), legBack: bone(-6, 0, -0.12) }),
      pose({ head: bone(4, 1, 0.06), body: bone(8, 0, 0.2), armFront: bone(28, 5, -0.08, 1.35), armBack: bone(20, 6, -0.15, 1.15), legFront: bone(7, 0, 0.14), legBack: bone(-7, 0, -0.14) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-4, 3, -0.2),
      body: bone(-3, 2, -0.1),
      armFront: bone(-5, 14, 0.35),
      armBack: bone(-8, 12, 0.25),
      legFront: bone(3, 0, 0.06),
      legBack: bone(-6, 0, -0.06),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(12, 6, 0.2),
      armBack: bone(-6, 4, -0.24),
      legFront: bone(6, 3, 0.14),
      legBack: bone(-7, 2, -0.2),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.08),
      armFront: bone(8, 4, 0.55),
      armBack: bone(-12, 2, -0.2),
      legFront: bone(-2, -8, 0.45),
      legBack: bone(8, -3, -0.55),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 24, 0.75),
      head: bone(4, 27, 0.55),
      armFront: bone(-5, 30, 0.35),
      armBack: bone(10, 24, -0.45),
      legFront: bone(-8, 27, -0.25),
      legBack: bone(6, 26, 0.4),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(14, 10, 0.45),
      armBack: bone(-10, 8, -0.32),
      legFront: bone(8, -6, 0.35),
      legBack: bone(-8, -4, -0.45),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(4, -4, -0.02),
      armFront: bone(12, 7, 0.28),
      armBack: bone(-8, 5, -0.22),
      legFront: bone(6, -3, 0.18),
      legBack: bone(-6, -1, -0.28),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 22, -0.55),
      head: bone(-4, 24, -0.5),
      armFront: bone(6, 26, 0.3),
      armBack: bone(-8, 22, -0.4),
      legFront: bone(6, 20, -0.2),
      legBack: bone(-6, 23, 0.3),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(3, 8, -0.5),
      armBack: bone(-3, 6, -0.65),
      legFront: bone(4, -2, 0.1),
      legBack: bone(-5, 0, -0.15),
    }),
    [FighterState.MAX_MODE]: pose({
      head: bone(0, -3, -0.05),
      body: bone(0, -2, 0.05),
      armFront: bone(14, 10, 0.5, 1.1),
      armBack: bone(-10, 8, -0.6, 1.1),
    }),
  },

  proportions: {
    headW: 40, headH: 40,
    torsoW: 54, torsoH: 70,
    armW: 20, armH: 50,
    legW: 22, legH: 62,
    shoulderY: 14, hipY: 62,
    torsoCenterY: 34, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Galactica Phantom
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_GALACTICA_PHANTOM;

    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);

    // HCB+P → Backbreaker (指令投)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonCPressed ? AttackType.RALF_BACKBREAKER : AttackType.RALF_BACKBREAKER;
    }

    // QCB+K → Ralf Kick (飞身踢)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.RALF_KICK;
    }

    // QCF+P → Vulcan Punch (弱/强区分)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.RALF_VULCAN_C : AttackType.RALF_VULCAN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;

    // →+A Sabre Punch (中段)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.RALF_SABRE_PUNCH;
    // →+B Sabre Kick (下段)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.RALF_SABRE_KICK;

    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // Vulcan Punch: 前冲
    if (attackType === AttackType.RALF_VULCAN || attackType === AttackType.RALF_VULCAN_C) {
      fighter.vx = 4 * fighter.facing;
      return true;
    }
    // Ralf Kick: 飞身前跃
    if (attackType === AttackType.RALF_KICK) {
      fighter.vy = -6;
      fighter.vx = 5 * fighter.facing;
      return true;
    }
    // Galactica Phantom: 大突进
    if (attackType === AttackType.DM_GALACTICA_PHANTOM) {
      fighter.vx = 8 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(attackType) {
    return attackType === AttackType.RALF_BACKBREAKER;
  },
  getCounterConfig() { return null; },
};
