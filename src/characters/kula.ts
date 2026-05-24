/**
 * 库拉·戴雅蒙度 (Kula Diamond) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Diamond Breath (ice projectile, weak/strong)
 *   DP+A/C  → Counter Shell (upper, weak/strong)
 *   QCB+K   → Lay On (sliding)
 *   QCF+K   → Diamond Edge (low)
 * DM: QCFx2+P → Freeze Execution
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { kulaPortrait } from '../rendering/portraits/kulaPortrait.js';

export const KulaDef: CharacterDefinition = {
  id: 'kula',
  name: 'Kula Diamond',
  nameCn: '库拉',
  color: '#4488cc',
  accentColor: '#66aaee',
  specialColor: '#44ccff',
  specialGlow: '#88eeff',
  portrait: '❄️',
  pixelPortrait: kulaPortrait,

  stats: {
    walkSpeed: 4,
    runSpeed: 7,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 1000,
    pushWidth: 60,
    jumpForwardSpeed: 5,
  },

  poses: {
    // 优雅站立 — 活泼弹跳，双手合拢，元气少女
    [FighterState.IDLE]: [
      // Frame 0: 中性 — 微微弹跳，双手合拢
      pose({ armFront: bone(8, 16, 0.18), armBack: bone(-6, 14, -0.35), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.1), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
      // Frame 1: 弹起开始 — 充满活力地上升，手臂微抬
      pose({ armFront: bone(8, 14, 0.2), armBack: bone(-6, 12, -0.33), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.1), body: bone(0, -2, 0.02), head: bone(0, -1, 0.01) }),
      // Frame 2: 继续上升 — 充满活力，手臂伸展
      pose({ armFront: bone(7, 12, 0.22), armBack: bone(-5, 10, -0.3), legFront: bone(5, -1, 0.08), legBack: bone(-4, -1, -0.1), body: bone(0, -3, 0.01), head: bone(0, -2, 0.0) }),
      // Frame 3: 弹跳顶点 — 最高点，开心
      pose({ armFront: bone(7, 10, 0.24), armBack: bone(-5, 8, -0.28), legFront: bone(5, -1, 0.06), legBack: bone(-4, -1, -0.08), body: bone(0, -3, 0.0), head: bone(0, -2, -0.01) }),
      // Frame 4: 弹下 — 安顿，微微倾斜
      pose({ armFront: bone(8, 13, 0.2), armBack: bone(-6, 11, -0.32), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.1), body: bone(0, -1, 0.01), head: bone(0, -1, 0.01) }),
      // Frame 5: 弹下结束 — 安顿，微微倾斜
      pose({ armFront: bone(8, 15, 0.18), armBack: bone(-6, 13, -0.34), legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.1), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
    ],
    // 步行 — 轻盈步伐，身体微倾
    [FighterState.WALK]: [
      pose({ legFront: bone(8, -2, 0.18), legBack: bone(-3, 2, -0.14), armFront: bone(6, 18, 0.12), armBack: bone(-5, 16, -0.32) }),
      pose({ legFront: bone(5, 0, 0.08), legBack: bone(-4, 0, -0.06), armFront: bone(7, 16, 0.15), armBack: bone(-5, 15, -0.35) }),
      pose({ legFront: bone(3, 2, -0.14), legBack: bone(-8, -2, 0.18), armFront: bone(8, 17, 0.16), armBack: bone(-4, 17, -0.3) }),
      pose({ legFront: bone(4, 0, -0.06), legBack: bone(-5, 0, 0.04), armFront: bone(7, 15, 0.14), armBack: bone(-5, 14, -0.34) }),
    ],
    // 奔跑 — 身体前倾，手臂大幅摆动
    [FighterState.RUN]: [
      pose({ body: bone(7, 0, 0.18), armFront: bone(-4, 20, -0.75), armBack: bone(12, 22, 0.45), legFront: bone(12, -4, 0.42), legBack: bone(-6, 4, -0.32) }),
      pose({ body: bone(4, 0, 0.08), armFront: bone(-2, 16, -0.42), armBack: bone(8, 24, 0.2), legFront: bone(7, 4, 0.16), legBack: bone(-12, -4, 0.42) }),
    ],
    // 蹲下 — 紧凑姿态
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.06),
      head: bone(0, 15),
      armFront: bone(8, 24, 0.02),
      armBack: bone(-5, 22, -0.15),
      legFront: bone(8, 0, 0.42),
      legBack: bone(-6, 0, -0.32),
    }),
    // 防御 — 双臂交叉护身
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 8, -0.35), armBack: bone(-1, 6, -0.55), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 10, -0.4), armBack: bone(-2, 8, -0.6), body: bone(-2, 0, -0.04) }),
    ],
    // 受创 — 身体后仰
    [FighterState.HITSTUN]: [
      pose({ body: bone(-3, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(0, 20, 0.42), armBack: bone(-7, 16, 0.55) }),
      pose({ body: bone(-6, 2, -0.22), head: bone(-3, 3, -0.28), armFront: bone(2, 23, 0.55), armBack: bone(-9, 18, 0.7) }),
      pose({ body: bone(-2, -1, -0.06), head: bone(-1, 1, -0.1), armFront: bone(-3, 16, 0.35), armBack: bone(-5, 14, 0.42) }),
    ],
    // 倒地
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.75), head: bone(7, 18, 0.85), armFront: bone(-4, 18, 0.55), armBack: bone(10, 16, -0.35), legFront: bone(-7, 14, -0.18), legBack: bone(5, 16, 0.25) }),
      pose({ body: bone(0, 28, 1.3), head: bone(9, 32, 1.1), legFront: bone(-9, 28, -0.25), legBack: bone(7, 30, 0.35) }),
    ],
    // 跳跃 — 身体紧凑，四肢收拢
    [FighterState.JUMP]: pose({
      armFront: bone(8, 6, 0.2),
      armBack: bone(-5, 4, -0.15),
      legFront: bone(2, -3, 0.12),
      legBack: bone(-4, 0, -0.25),
    }),
    // 站立攻击 — 手臂前伸
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.06), armFront: bone(14, 4, 0.1, 1.0), armBack: bone(-7, 8, -0.55, 0.85), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(2, 1, 0.04), body: bone(3, 0, 0.1), armFront: bone(20, 5, -0.04, 1.15), armBack: bone(-7, 8, -0.55, 0.85), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
    ],
    // 蹲下攻击
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 8, 0.04), body: bone(2, 10, 0.06), armFront: bone(12, 10, 0.02, 1.0), armBack: bone(-5, 12, -0.42, 0.85), legFront: bone(13, 2, 0.24, 1.0), legBack: bone(-6, 8, -0.15) }),
      pose({ head: bone(2, 9, 0.06), body: bone(3, 12, 0.1), armFront: bone(16, 12, -0.08, 1.1), armBack: bone(-5, 12, -0.42, 0.85), legFront: bone(16, 3, 0.3, 1.05), legBack: bone(-6, 8, -0.18) }),
    ],
    // 空中攻击
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.03), body: bone(1, 0, 0.06), armFront: bone(12, -2, -0.1, 1.0), armBack: bone(-7, 0, -0.3, 0.85), legFront: bone(8, 2, 0.2, 1.0), legBack: bone(-6, -1, -0.15) }),
      pose({ head: bone(0, -2, -0.06), body: bone(2, 0, 0.1), armFront: bone(16, -3, -0.16, 1.1), armBack: bone(-7, 0, -0.3, 0.85), legFront: bone(11, 3, 0.28, 1.1), legBack: bone(-6, -1, -0.18) }),
    ],
    // 投技
    [FighterState.THROW]: [
      pose({ head: bone(1, 0, 0.02), body: bone(3, 0, 0.1), armFront: bone(18, 2, -0.02, 1.1), armBack: bone(12, 4, -0.08, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.06) }),
      pose({ head: bone(2, 1, 0.04), body: bone(5, 0, 0.15), armFront: bone(24, 3, -0.06, 1.25), armBack: bone(16, 5, -0.12, 1.05), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
    ],
    // 防御崩坏
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-2, 3, -0.15),
      body: bone(-2, 2, -0.06),
      armFront: bone(-3, 10, 0.3),
      armBack: bone(-5, 8, 0.2),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-4, 0, -0.04),
    }),
    // 小跳
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.03),
      body: bone(0, -1, 0),
      armFront: bone(6, 4, 0.12),
      armBack: bone(-4, 3, -0.15),
      legFront: bone(3, 2, 0.08),
      legBack: bone(-4, 1, -0.12),
    }),
    // 后撤步
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -7, -0.08),
      armFront: bone(6, 3, 0.48),
      armBack: bone(-10, 2, -0.15),
      legFront: bone(-1, -7, 0.4),
      legBack: bone(8, -2, -0.48),
    }),
    // 前滚
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(3, 25, 0.55),
      armFront: bone(-2, 27, 0.35),
      armBack: bone(7, 22, -0.45),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(4, 23, 0.4),
    }),
    // 大跳
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.05),
      armFront: bone(8, 8, 0.38),
      armBack: bone(-7, 6, -0.25),
      legFront: bone(6, -5, 0.3),
      legBack: bone(-6, -3, -0.4),
    }),
    // 跑跳
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -4, -0.02),
      armFront: bone(7, 6, 0.24),
      armBack: bone(-6, 4, -0.18),
      legFront: bone(4, -2, 0.15),
      legBack: bone(-4, 0, -0.24),
    }),
    // 后滚
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 18, -0.55),
      head: bone(-4, 21, -0.45),
      armFront: bone(4, 22, 0.25),
      armBack: bone(-6, 18, -0.35),
      legFront: bone(4, 16, -0.18),
      legBack: bone(-4, 19, 0.25),
    }),
    // 空中防御
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(1, 7, -0.45),
      armBack: bone(-2, 5, -0.58),
      legFront: bone(2, -2, 0.08),
      legBack: bone(-3, 0, -0.12),
    }),
  },

  // Kula 体型：169cm 女性娇小体型，最小骨架，最短四肢，少女体态
  proportions: {
    headW: 38, headH: 38,
    torsoW: 40, torsoH: 56,
    armW: 14, armH: 40,
    legW: 18, legH: 54,
    shoulderY: 17, hipY: 54,
    torsoCenterY: 31, headCenterY: 9,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Freeze Execution
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_FREEZE;

    // DP+P → Counter Shell (weak/strong)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.KULA_SHELL_C : AttackType.KULA_SHELL;
    }

    // QCB+K → Lay On (sliding)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KULA_LAY;
    }

    // QCF+K → Diamond Edge (low)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.KULA_EDGE;
    }

    // QCF+P → Diamond Breath (weak/strong projectile)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.KULA_BREATH_C : AttackType.KULA_BREATH;
    }

    return null;
  },

  routeNormal(_input, _state, _isCloseRange) {
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Diamond Breath: spawn ice projectile (weak/strong)
    if ((attackType === AttackType.KULA_BREATH || attackType === AttackType.KULA_BREATH_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Counter Shell: rise (weak)
    if (attackType === AttackType.KULA_SHELL) {
      fighter.vy = -6;
      return true;
    }
    // Counter Shell: rise (strong)
    if (attackType === AttackType.KULA_SHELL_C) {
      fighter.vy = -8;
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
