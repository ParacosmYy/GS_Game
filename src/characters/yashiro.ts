/**
 * 大门五郎 (Yashiro Nanakase) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Upper Du Bag (多段突进拳, A快/C多段)
 *   QCB+P   → Niraai Kaname (中段砸击)
 *   HCF+K   → Musatsu Niraai (滑铲)
 * DM: QCFx2+P → Armageddon Busters (大突进连拳)
 *
 * 命令通常技:
 *   →+A  → Shuu Wani (上段)
 *   →+B  → Juu Zutsu (中段overhead)
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
import { yashiroPortrait } from '../rendering/portraits/yashiroPortrait.js';

export const YashiroDef: CharacterDefinition = {
  id: 'yashiro',
  name: 'Yashiro Nanakase',
  nameCn: '大门五郎',
  color: '#664488',
  accentColor: '#8866aa',
  specialColor: '#9966cc',
  specialGlow: '#bb88ee',
  portrait: '🎸',
  pixelPortrait: yashiroPortrait,
  winQuotes: ['我的拳头就是正义！', '太弱了，回去练练吧。', '这就是力量的差距。'],

  stats: {
    walkSpeed: 3.3,
    runSpeed: 6.6,
    jumpVelocity: -13.8,
    hopVelocity: -9.2,
    hyperJumpVelocity: -16.8,
    maxHealth: 1050,
    pushWidth: 66,
    jumpForwardSpeed: 4.3,
    closeRange: 84,
    throwRange: 104,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 力量站姿 — 微弯腰，双拳蓄力
      pose({ head: bone(0, 0, 0.03), body: bone(0, 2, 0.08), armFront: bone(15, 20, 0.22), armBack: bone(-9, 18, -0.42), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // 帧1: 吸气 — 身体微升
      pose({ head: bone(0, -1, 0.04), body: bone(0, 0, 0.06), armFront: bone(14, 18, 0.24), armBack: bone(-9, 16, -0.44), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // 帧2: 吸气巅峰
      pose({ head: bone(0, -2, 0.03), body: bone(-1, -1, 0.05), armFront: bone(13, 16, 0.26), armBack: bone(-10, 14, -0.46), legFront: bone(6, 0, 0.08), legBack: bone(-6, 0, -0.08) }),
      // 帧3: 过渡
      pose({ head: bone(0, -1, 0.04), body: bone(0, 1, 0.07), armFront: bone(14, 18, 0.23), armBack: bone(-9, 16, -0.43), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // 帧4: 呼气 — 下沉
      pose({ head: bone(1, 1, 0.06), body: bone(1, 4, 0.1), armFront: bone(16, 22, 0.2), armBack: bone(-8, 20, -0.38), legFront: bone(7, 0, 0.1), legBack: bone(-7, 0, -0.1) }),
      // 帧5: 呼气完成
      pose({ head: bone(1, 2, 0.07), body: bone(1, 5, 0.11), armFront: bone(16, 23, 0.18), armBack: bone(-8, 21, -0.37), legFront: bone(8, 0, 0.11), legBack: bone(-8, 0, -0.11) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(11, -2, 0.2), legBack: bone(-4, 2, -0.14), armFront: bone(11, 22, 0.1), armBack: bone(-7, 20, -0.3) }),
      pose({ legFront: bone(9, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(12, 20, 0.14), armBack: bone(-8, 18, -0.34) }),
      pose({ legFront: bone(6, 2, -0.18), legBack: bone(-11, -2, 0.2), armFront: bone(11, 20, 0.16), armBack: bone(-6, 22, -0.28) }),
      pose({ legFront: bone(8, 0, -0.08), legBack: bone(-6, 0, 0.06), armFront: bone(11, 22, 0.12), armBack: bone(-7, 20, -0.32) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(9, 0, 0.22), armFront: bone(-7, 26, -0.9), armBack: bone(17, 28, 0.6), legFront: bone(15, -5, 0.5), legBack: bone(-10, 5, -0.4) }),
      pose({ body: bone(5, 0, 0.1), armFront: bone(-4, 20, -0.5), armBack: bone(11, 32, 0.3), legFront: bone(11, 5, 0.2), legBack: bone(-15, -5, 0.5) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.06),
      head: bone(0, 16),
      armFront: bone(11, 24, 0.06),
      armBack: bone(-8, 22, -0.16),
      legFront: bone(11, 0, 0.5),
      legBack: bone(-9, 0, -0.42),
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
    // — Attack poses (力量格斗家: 大幅挥拳，身体前压) —
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
    headW: 38, headH: 38,
    torsoW: 48, torsoH: 68,
    armW: 18, armH: 48,
    legW: 21, legH: 60,
    shoulderY: 13, hipY: 60,
    torsoCenterY: 32, headCenterY: 6,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Armageddon Busters
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_ARMAGEDDON_BUSTERS;

    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);

    // QCB+P → Niraai Kaname (中段砸击)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.YASHIRO_NIRAAI;
    }

    // HCF+K → Musatsu Niraai (滑铲)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.YASHIRO_MUSATSU;
    }

    // QCF+P → Upper Du Bag (弱/强区分)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.YASHIRO_UPPER_DU_C : AttackType.YASHIRO_UPPER_DU;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;

    // →+A Shuu Wani (上段upper)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.YASHIRO_SHUU_WANI;
    // →+B Juu Zutsu (中段overhead)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.YASHIRO_JUU_ZUTSU;

    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // Upper Du Bag: 前冲连拳
    if (attackType === AttackType.YASHIRO_UPPER_DU || attackType === AttackType.YASHIRO_UPPER_DU_C) {
      fighter.vx = 4 * fighter.facing;
      return true;
    }
    // Musatsu Niraai: 滑铲前进
    if (attackType === AttackType.YASHIRO_MUSATSU) {
      fighter.vx = 5 * fighter.facing;
      return true;
    }
    // Armageddon Busters: 大突进
    if (attackType === AttackType.DM_ARMAGEDDON_BUSTERS) {
      fighter.vx = 7 * fighter.facing;
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
