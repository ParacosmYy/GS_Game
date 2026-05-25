/**
 * 李香绯 (Li Xiangfei) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Nanpa (突进拳, weak/strong)
 *   QCB+P   → Tenpatsu (上段打, knockdown)
 *   HCF+K   → Maho Hisha (低段扫, knockdown)
 * DM: QCBx2+P → Chou Ka Ringa DM
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { xiangfeiPortrait } from '../rendering/portraits/xiangfeiPortrait.js';

export const XiangfeiDef: CharacterDefinition = {
  id: 'xiangfei',
  name: 'Li Xiangfei',
  nameCn: '李香绯',
  color: '#ee6688',
  accentColor: '#ff88aa',
  specialColor: '#ff4466',
  specialGlow: '#ffcc44',
  portrait: 'X',
  pixelPortrait: xiangfeiPortrait,
  winQuotes: ['这就是中国拳法的力量!', '还想再打一场吗?', '下次会更强的!'],

  stats: {
    walkSpeed: 4.6,
    runSpeed: 7.8,
    jumpVelocity: -13.5,
    hopVelocity: -9.5,
    hyperJumpVelocity: -16.5,
    maxHealth: 880,
    pushWidth: 54,
    jumpForwardSpeed: 5.2,
    closeRange: 68,
    throwRange: 90,
  },

  poses: {
    // 元气站立 — 小体型功夫少女，弹跳节奏
    [FighterState.IDLE]: [
      pose({ armFront: bone(5, 12, 0.2), armBack: bone(-4, 10, -0.35), legFront: bone(3, 0, 0.05), legBack: bone(-2, 0, -0.06), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
      pose({ armFront: bone(5, 10, 0.22), armBack: bone(-4, 8, -0.33), legFront: bone(3, -1, 0.05), legBack: bone(-2, -1, -0.06), body: bone(0, -2, 0.02), head: bone(0, -1, 0.01) }),
      pose({ armFront: bone(4, 8, 0.24), armBack: bone(-3, 6, -0.31), legFront: bone(3, -1, 0.04), legBack: bone(-2, -1, -0.05), body: bone(0, -3, 0.01), head: bone(0, -2, 0.0) }),
      pose({ armFront: bone(4, 7, 0.26), armBack: bone(-3, 5, -0.29), legFront: bone(3, -1, 0.04), legBack: bone(-2, -1, -0.05), body: bone(0, -3, 0.0), head: bone(0, -2, -0.01) }),
      pose({ armFront: bone(5, 9, 0.22), armBack: bone(-4, 7, -0.32), legFront: bone(3, 0, 0.05), legBack: bone(-2, 0, -0.06), body: bone(0, -1, 0.01), head: bone(0, -1, 0.01) }),
      pose({ armFront: bone(5, 12, 0.2), armBack: bone(-4, 10, -0.35), legFront: bone(3, 0, 0.05), legBack: bone(-2, 0, -0.06), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
    ],
    // 步行 — 轻快小步
    [FighterState.WALK]: [
      pose({ legFront: bone(6, -2, 0.18), legBack: bone(-2, 2, -0.14), armFront: bone(4, 14, 0.12), armBack: bone(-3, 12, -0.32) }),
      pose({ legFront: bone(3, 0, 0.08), legBack: bone(-2, 0, -0.06), armFront: bone(5, 12, 0.16), armBack: bone(-4, 11, -0.35) }),
      pose({ legFront: bone(2, 2, -0.14), legBack: bone(-6, -2, 0.18), armFront: bone(6, 13, 0.18), armBack: bone(-3, 13, -0.28) }),
      pose({ legFront: bone(2, 0, -0.06), legBack: bone(-3, 0, 0.04), armFront: bone(5, 11, 0.14), armBack: bone(-4, 10, -0.34) }),
    ],
    // 奔跑 — 身体前倾，功夫步伐
    [FighterState.RUN]: [
      pose({ body: bone(5, 0, 0.18), armFront: bone(-2, 16, -0.68), armBack: bone(8, 18, 0.44), legFront: bone(8, -4, 0.42), legBack: bone(-4, 4, -0.32) }),
      pose({ body: bone(3, 0, 0.08), armFront: bone(0, 12, -0.38), armBack: bone(5, 20, 0.2), legFront: bone(5, 4, 0.16), legBack: bone(-8, -4, 0.42) }),
    ],
    // 蹲下 — 紧凑低姿态
    [FighterState.CROUCH]: pose({
      body: bone(0, 16, 0.05),
      head: bone(0, 12),
      armFront: bone(5, 20, 0.02),
      armBack: bone(-3, 18, -0.16),
      legFront: bone(6, 0, 0.42),
      legBack: bone(-4, 0, -0.32),
    }),
    // 防御 — 功夫架式防御
    [FighterState.BLOCK]: [
      pose({ armFront: bone(1, 5, -0.35), armBack: bone(-1, 3, -0.55), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(0, 7, -0.38), armBack: bone(-2, 5, -0.58), body: bone(-2, 0, -0.04) }),
    ],
    // 受创 — 身体后仰
    [FighterState.HITSTUN]: [
      pose({ body: bone(-3, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(-1, 16, 0.42), armBack: bone(-5, 12, 0.55) }),
      pose({ body: bone(-4, 2, -0.22), head: bone(-3, 3, -0.28), armFront: bone(1, 19, 0.55), armBack: bone(-7, 14, 0.68) }),
      pose({ body: bone(-2, -1, -0.06), head: bone(-1, 1, -0.1), armFront: bone(-2, 12, 0.35), armBack: bone(-4, 10, 0.42) }),
    ],
    // 倒地
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 12, 0.72), head: bone(5, 16, 0.82), armFront: bone(-2, 16, 0.52), armBack: bone(6, 14, -0.35), legFront: bone(-5, 12, -0.18), legBack: bone(3, 14, 0.26) }),
      pose({ body: bone(0, 25, 1.25), head: bone(7, 28, 1.05), legFront: bone(-7, 25, -0.26), legBack: bone(5, 27, 0.35) }),
    ],
    // 跳跃 — 身体紧凑
    [FighterState.JUMP]: pose({
      armFront: bone(5, 3, 0.2),
      armBack: bone(-3, 1, -0.16),
      legFront: bone(2, -2, 0.12),
      legBack: bone(-2, 0, -0.26),
    }),
    // 站立攻击 — 快速功夫拳
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.03), body: bone(2, 0, 0.08), armFront: bone(8, 3, 0.08, 0.9), armBack: bone(-2, 5, -0.44, 0.8), legFront: bone(2, 0, 0.05), legBack: bone(-2, 0, -0.06) }),
      pose({ head: bone(2, 0, 0.04), body: bone(3, 0, 0.14), armFront: bone(18, 4, 0.18, 1.0), armBack: bone(-2, 5, -0.44, 0.8), legFront: bone(3, 0, 0.08), legBack: bone(-3, 0, -0.08) }),
    ],
    // 蹲下攻击 — 快速低段踢
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 4, 0.02), body: bone(2, 6, 0.05), armFront: bone(7, 5, 0.03, 0.9), armBack: bone(-2, 8, -0.35, 0.8), legFront: bone(10, 0, 0.26, 1.0), legBack: bone(-3, 4, -0.12) }),
      pose({ head: bone(2, 5, 0.04), body: bone(3, 8, 0.1), armFront: bone(10, 7, -0.03, 1.0), armBack: bone(-2, 8, -0.35, 0.8), legFront: bone(14, 1, 0.32, 1.05), legBack: bone(-3, 4, -0.16) }),
    ],
    // 空中攻击 — 轻快
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.06), armFront: bone(7, -1, -0.06, 0.9), armBack: bone(-2, 1, -0.22, 0.8), legFront: bone(6, 2, 0.26, 1.0), legBack: bone(-2, 0, -0.1) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.12), armFront: bone(10, -2, -0.1, 1.05), armBack: bone(-2, 1, -0.22, 0.8), legFront: bone(10, 3, 0.32, 1.1), legBack: bone(-2, 0, -0.14) }),
    ],
    // 投技
    [FighterState.THROW]: [
      pose({ head: bone(1, 0, 0.02), body: bone(3, 0, 0.1), armFront: bone(14, 1, -0.04, 1.08), armBack: bone(8, 2, -0.08, 0.92), legFront: bone(2, 0, 0.06), legBack: bone(-2, 0, -0.06) }),
      pose({ head: bone(2, 1, 0.04), body: bone(4, 0, 0.16), armFront: bone(20, 2, -0.06, 1.22), armBack: bone(12, 3, -0.12, 1.02), legFront: bone(3, 0, 0.08), legBack: bone(-3, 0, -0.08) }),
    ],
    // 防御崩坏
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-2, 3, -0.16),
      body: bone(-2, 2, -0.06),
      armFront: bone(-2, 7, 0.3),
      armBack: bone(-4, 5, 0.2),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-2, 0, -0.04),
    }),
    // 小跳
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.02),
      body: bone(0, -1, 0),
      armFront: bone(4, 2, 0.12),
      armBack: bone(-2, 1, -0.16),
      legFront: bone(2, 2, 0.08),
      legBack: bone(-2, 1, -0.12),
    }),
    // 后撤步
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -5, -0.08),
      armFront: bone(4, 1, 0.48),
      armBack: bone(-7, 0, -0.16),
      legFront: bone(0, -5, 0.38),
      legBack: bone(6, -2, -0.48),
    }),
    // 前滚
    [FighterState.ROLL]: pose({
      body: bone(0, 18, 0.72),
      head: bone(2, 21, 0.52),
      armFront: bone(-1, 23, 0.35),
      armBack: bone(5, 18, -0.44),
      legFront: bone(-5, 21, -0.26),
      legBack: bone(3, 19, 0.38),
    }),
    // 大跳
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -5, -0.05),
      armFront: bone(6, 6, 0.38),
      armBack: bone(-5, 4, -0.26),
      legFront: bone(4, -3, 0.3),
      legBack: bone(-4, -1, -0.38),
    }),
    // 跑跳
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -2, -0.02),
      armFront: bone(5, 4, 0.24),
      armBack: bone(-4, 2, -0.18),
      legFront: bone(3, -1, 0.16),
      legBack: bone(-2, 0, -0.24),
    }),
    // 后滚
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 14, -0.52),
      head: bone(-3, 17, -0.44),
      armFront: bone(2, 18, 0.26),
      armBack: bone(-4, 14, -0.35),
      legFront: bone(2, 12, -0.18),
      legBack: bone(-2, 15, 0.26),
    }),
    // 空中防御
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(0, 5, -0.44),
      armBack: bone(-2, 3, -0.55),
      legFront: bone(2, -2, 0.08),
      legBack: bone(-2, 0, -0.12),
    }),
  },

  // 李香绯体型: 155cm 小体型功夫少女
  proportions: {
    headW: 30, headH: 30,
    torsoW: 32, torsoH: 48,
    armW: 11, armH: 34,
    legW: 13, legH: 46,
    shoulderY: 12, hipY: 44,
    torsoCenterY: 26, headCenterY: 6,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCBx2+P → Chou Ka Ringa
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCBx2_P') return AttackType.DM_CHO_KA_RINGA;

    // HCF+K → Maho Hisha (low sweep, knockdown)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.XIANGFEI_MAHO_HISHA;
    }

    // QCB+P → Tenpatsu (upper strike, knockdown)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.XIANGFEI_TENPATSU;
    }

    // QCF+P → Nanpa (weak/strong rushing punch)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.XIANGFEI_NANPA_C : AttackType.XIANGFEI_NANPA;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A Kyu Ho (upper strike)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.XIANGFEI_KYU_HO;
    // →+B Kaku Da (low kick)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.XIANGFEI_KAKU_DA;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(_fighter, _attackType, _projectiles, _playerIndex) {
    // Xiangfei specials are all melee — no projectile spawning needed
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
