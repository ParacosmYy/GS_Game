/**
 * 陈可汗 (Chang Koehan) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Tekkyuu Dai Kaiten (铁球大回转, A快/C多段)
 *   QCB+P   → Tekkyuu Fasshu (铁球挥击, overhead)
 *   QCF+K   → Tekkyuu Hien Zan (铁球飞燕斩)
 * DM: QCFx2+P → Tekkyuu Dai Bousou (铁球大暴走)
 *
 * 命令通常技:
 *   →+A  → Hiki Nage (引投, throw-like)
 *   →+B  → Kyuushuu Geri (吸收蹴, low)
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
import { changPortrait } from '../rendering/portraits/changPortrait.js';

export const ChangDef: CharacterDefinition = {
  id: 'chang',
  name: 'CHANG KOEHAN',
  nameCn: '陈可汗',
  color: '#885522',
  accentColor: '#aa7733',
  specialColor: '#cc8833',
  specialGlow: '#ee9944',
  portrait: '⛓',
  pixelPortrait: changPortrait,
  winQuotes: ['哼哼哼，太弱了！', '这个铁球够重吗？', '谁也挡不住我的铁球！'],

  stats: {
    walkSpeed: 2.5,
    runSpeed: 5.0,
    jumpVelocity: -12.5,
    hopVelocity: -8.5,
    hyperJumpVelocity: -15.5,
    maxHealth: 1200,
    pushWidth: 72,
    jumpForwardSpeed: 3.5,
    closeRange: 90,
    throwRange: 110,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 宽站姿 — 双手握铁球，重心下沉
      pose({ head: bone(0, 2, 0.03), body: bone(0, 4, 0.08), armFront: bone(14, 22, 0.15), armBack: bone(-10, 20, -0.3), legFront: bone(10, 0, 0.15), legBack: bone(-10, 0, -0.15) }),
      // 帧1: 吸气
      pose({ head: bone(0, 1, 0.04), body: bone(0, 2, 0.06), armFront: bone(13, 20, 0.18), armBack: bone(-10, 18, -0.32), legFront: bone(10, 0, 0.15), legBack: bone(-10, 0, -0.15) }),
      // 帧2: 吸气巅峰
      pose({ head: bone(0, 0, 0.03), body: bone(-1, 0, 0.05), armFront: bone(12, 18, 0.2), armBack: bone(-11, 16, -0.34), legFront: bone(9, 0, 0.13), legBack: bone(-9, 0, -0.13) }),
      // 帧3: 过渡
      pose({ head: bone(0, 1, 0.04), body: bone(0, 2, 0.07), armFront: bone(13, 20, 0.17), armBack: bone(-10, 18, -0.31), legFront: bone(10, 0, 0.15), legBack: bone(-10, 0, -0.15) }),
      // 帧4: 呼气
      pose({ head: bone(1, 3, 0.06), body: bone(1, 5, 0.1), armFront: bone(15, 24, 0.12), armBack: bone(-9, 22, -0.28), legFront: bone(10, 0, 0.15), legBack: bone(-10, 0, -0.15) }),
      // 帧5: 呼气完成
      pose({ head: bone(1, 4, 0.07), body: bone(1, 6, 0.11), armFront: bone(15, 25, 0.1), armBack: bone(-9, 23, -0.26), legFront: bone(11, 0, 0.16), legBack: bone(-11, 0, -0.16) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(14, -2, 0.24), legBack: bone(-6, 2, -0.18), armFront: bone(12, 26, 0.08), armBack: bone(-8, 24, -0.28) }),
      pose({ legFront: bone(10, 0, 0.14), legBack: bone(-7, 0, -0.1), armFront: bone(13, 22, 0.12), armBack: bone(-9, 21, -0.32) }),
      pose({ legFront: bone(7, 2, -0.22), legBack: bone(-14, -2, 0.24), armFront: bone(12, 22, 0.14), armBack: bone(-7, 25, -0.26) }),
      pose({ legFront: bone(9, 0, -0.1), legBack: bone(-8, 0, 0.08), armFront: bone(12, 24, 0.1), armBack: bone(-8, 22, -0.3) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(8, 2, 0.22), armFront: bone(-6, 28, -0.8), armBack: bone(18, 30, 0.5), legFront: bone(18, -4, 0.5), legBack: bone(-12, 4, -0.4) }),
      pose({ body: bone(5, 2, 0.12), armFront: bone(-2, 22, -0.4), armBack: bone(14, 34, 0.25), legFront: bone(14, 4, 0.2), legBack: bone(-18, -4, 0.5) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 24, 0.08),
      head: bone(0, 20),
      armFront: bone(14, 28, 0.08),
      armBack: bone(-10, 26, -0.18),
      legFront: bone(14, 0, 0.55),
      legBack: bone(-12, 0, -0.48),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(6, 14, -0.35), armBack: bone(3, 12, -0.55) }),
      pose({ armFront: bone(5, 16, -0.4), armBack: bone(2, 14, -0.6), body: bone(-3, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-6, 2, -0.16), head: bone(-4, 4, -0.22), armFront: bone(-2, 26, 0.5), armBack: bone(-12, 24, 0.6) }),
      pose({ body: bone(-10, 4, -0.24), head: bone(-6, 5, -0.32), armFront: bone(0, 28, 0.6), armBack: bone(-14, 26, 0.75) }),
      pose({ body: bone(-5, 0, -0.1), head: bone(-3, 2, -0.14), armFront: bone(-8, 24, 0.4), armBack: bone(-10, 22, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 22, 0.85), head: bone(10, 26, 0.95), armFront: bone(-5, 26, 0.65), armBack: bone(14, 24, -0.45), legFront: bone(-10, 22, -0.22), legBack: bone(8, 24, 0.32) }),
      pose({ body: bone(0, 36, 1.45), head: bone(12, 42, 1.25), armFront: bone(-5, 42, 0.85), armBack: bone(18, 36, -0.65), legFront: bone(-12, 36, -0.32), legBack: bone(10, 38, 0.42) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(16, 14, 0.32),
      armBack: bone(-10, 12, -0.28),
      legFront: bone(6, -4, 0.22),
      legBack: bone(-8, 2, -0.38),
    }),
    // — Attack poses (巨汉: 大幅挥铁球，身体前压) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(4, 0, 0.05), body: bone(4, 2, 0.14), armFront: bone(20, 6, 0.18, 1.15), armBack: bone(-14, 16, -0.85, 0.9), legFront: bone(10, 0, 0.16), legBack: bone(-11, 0, -0.18) }),
      pose({ head: bone(6, 2, 0.1), body: bone(9, 2, 0.22), armFront: bone(38, 14, 0.12, 1.35), armBack: bone(-14, 16, -0.85, 0.9), legFront: bone(12, 0, 0.22), legBack: bone(-12, 0, -0.22) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(4, 10, 0.08), body: bone(4, 14, 0.12), armFront: bone(18, 10, 0.06, 1.1), armBack: bone(-12, 20, -0.6, 0.85), legFront: bone(18, 4, 0.35, 1.1), legBack: bone(-14, 10, -0.28) }),
      pose({ head: bone(6, 12, 0.14), body: bone(6, 16, 0.18), armFront: bone(28, 14, -0.08, 1.25), armBack: bone(-12, 20, -0.6, 0.85), legFront: bone(22, 5, 0.42, 1.15), legBack: bone(-14, 10, -0.32) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(2, -2, -0.06), body: bone(4, 0, 0.12), armFront: bone(20, -4, -0.14, 1.15), armBack: bone(-16, 2, -0.52, 0.85), legFront: bone(16, 4, 0.35, 1.15), legBack: bone(-12, -2, -0.25) }),
      pose({ head: bone(3, -3, -0.12), body: bone(6, 0, 0.18), armFront: bone(30, -6, -0.22, 1.3), armBack: bone(-16, 2, -0.52, 0.85), legFront: bone(20, 6, 0.44, 1.25), legBack: bone(-12, -2, -0.32) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(4, 2, 0.05), body: bone(6, 2, 0.16), armFront: bone(24, 4, 0.0, 1.25), armBack: bone(18, 6, -0.1, 1.1), legFront: bone(8, 0, 0.14), legBack: bone(-8, 0, -0.14) }),
      pose({ head: bone(5, 3, 0.08), body: bone(10, 2, 0.24), armFront: bone(32, 6, -0.1, 1.4), armBack: bone(22, 8, -0.18, 1.2), legFront: bone(9, 0, 0.16), legBack: bone(-9, 0, -0.16) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-5, 4, -0.22),
      body: bone(-4, 4, -0.12),
      armFront: bone(-6, 16, 0.38),
      armBack: bone(-10, 14, 0.28),
      legFront: bone(4, 0, 0.08),
      legBack: bone(-8, 0, -0.08),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -1, -0.05),
      body: bone(0, 0, 0),
      armFront: bone(14, 8, 0.22),
      armBack: bone(-8, 6, -0.26),
      legFront: bone(8, 4, 0.16),
      legBack: bone(-9, 3, -0.22),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-5, -10, -0.1),
      armFront: bone(10, 5, 0.58),
      armBack: bone(-14, 3, -0.22),
      legFront: bone(-3, -10, 0.48),
      legBack: bone(10, -4, -0.58),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 28, 0.8),
      head: bone(5, 31, 0.6),
      armFront: bone(-6, 34, 0.38),
      armBack: bone(12, 28, -0.48),
      legFront: bone(-10, 31, -0.28),
      legBack: bone(8, 30, 0.42),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.08),
      armFront: bone(16, 12, 0.48),
      armBack: bone(-12, 10, -0.35),
      legFront: bone(10, -8, 0.38),
      legBack: bone(-10, -5, -0.48),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(5, -5, -0.03),
      armFront: bone(14, 9, 0.3),
      armBack: bone(-10, 7, -0.25),
      legFront: bone(8, -4, 0.2),
      legBack: bone(-8, -2, -0.3),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 26, -0.6),
      head: bone(-5, 28, -0.55),
      armFront: bone(8, 30, 0.32),
      armBack: bone(-10, 26, -0.42),
      legFront: bone(8, 24, -0.22),
      legBack: bone(-8, 27, 0.32),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(4, 10, -0.52),
      armBack: bone(-4, 8, -0.68),
      legFront: bone(5, -3, 0.12),
      legBack: bone(-6, 0, -0.18),
    }),
    [FighterState.MAX_MODE]: pose({
      head: bone(0, -4, -0.06),
      body: bone(0, -2, 0.06),
      armFront: bone(16, 12, 0.52, 1.12),
      armBack: bone(-12, 10, -0.62, 1.12),
    }),
  },

  proportions: {
    headW: 44, headH: 44,
    torsoW: 58, torsoH: 74,
    armW: 22, armH: 52,
    legW: 24, legH: 64,
    shoulderY: 16, hipY: 66,
    torsoCenterY: 36, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Tekkyuu Dai Bousou
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_TEKKYUU_DAI_BOUSOU;

    // QCF+K → Tekkyuu Hien Zan (铁球飞燕斩)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.CHANG_TEKKYUU_HIEN_ZAN;
    }

    // QCB+P → Tekkyuu Fasshu (铁球挥击)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.CHANG_TEKKYUU_FASSHU;
    }

    // QCF+P → Tekkyuu Dai Kaiten (铁球大回转, 弱/强区分)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.CHANG_TEKKYUU_KAITEN_C : AttackType.CHANG_TEKKYUU_KAITEN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;

    // →+A Hiki Nage (引投, throw-like)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.CHANG_HIKI_NAGE;
    // →+B Kyuushuu Geri (吸收蹴, low)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CHANG_KYUUSHUU;

    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // Tekkyuu Dai Kaiten: 前冲旋转
    if (attackType === AttackType.CHANG_TEKKYUU_KAITEN || attackType === AttackType.CHANG_TEKKYUU_KAITEN_C) {
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    // Tekkyuu Hien Zan: 跳起攻击
    if (attackType === AttackType.CHANG_TEKKYUU_HIEN_ZAN) {
      fighter.vy = -8;
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    // Tekkyuu Dai Bousou: 大突进
    if (attackType === AttackType.DM_TEKKYUU_DAI_BOUSOU) {
      fighter.vx = 7 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  getCounterConfig() { return null; },
};
