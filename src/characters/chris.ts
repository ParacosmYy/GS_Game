/**
 * 克里斯 (Chris) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Shot Weave (突进攻击, weak/strong)
 *   QCB+K   → Twister Drive (回旋踢, knockdown)
 *   DP+K    → Scramble Dash (低段突进)
 * DM: QCBx2+K → Chain Slide Touch DM
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { chrisPortrait } from '../rendering/portraits/chrisPortrait.js';

export const ChrisDef: CharacterDefinition = {
  id: 'chris',
  name: 'Chris',
  nameCn: '克里斯',
  color: '#ff8844',
  accentColor: '#ffaa66',
  specialColor: '#ff6622',
  specialGlow: '#ffcc44',
  portrait: '🔥',
  pixelPortrait: chrisPortrait,
  winQuotes: ['まだまだだね!', 'オレの炎、すごいだろ?', '次はもっと楽しくやろうよ!'],

  stats: {
    walkSpeed: 4.8,
    runSpeed: 8.0,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 880,
    pushWidth: 56,
    jumpForwardSpeed: 5.5,
    closeRange: 72,
    throwRange: 95,
  },

  poses: {
    // 元气站立 — 小体型活泼少年，弹跳节奏
    [FighterState.IDLE]: [
      pose({ armFront: bone(6, 14, 0.22), armBack: bone(-5, 12, -0.38), legFront: bone(4, 0, 0.06), legBack: bone(-3, 0, -0.08), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
      pose({ armFront: bone(6, 12, 0.24), armBack: bone(-5, 10, -0.36), legFront: bone(4, -1, 0.06), legBack: bone(-3, -1, -0.08), body: bone(0, -2, 0.02), head: bone(0, -1, 0.01) }),
      pose({ armFront: bone(5, 10, 0.26), armBack: bone(-4, 8, -0.34), legFront: bone(4, -1, 0.04), legBack: bone(-3, -1, -0.06), body: bone(0, -3, 0.01), head: bone(0, -2, 0.0) }),
      pose({ armFront: bone(5, 9, 0.28), armBack: bone(-4, 7, -0.32), legFront: bone(4, -1, 0.04), legBack: bone(-3, -1, -0.06), body: bone(0, -3, 0.0), head: bone(0, -2, -0.01) }),
      pose({ armFront: bone(6, 11, 0.24), armBack: bone(-5, 9, -0.35), legFront: bone(4, 0, 0.06), legBack: bone(-3, 0, -0.08), body: bone(0, -1, 0.01), head: bone(0, -1, 0.01) }),
      pose({ armFront: bone(6, 14, 0.22), armBack: bone(-5, 12, -0.38), legFront: bone(4, 0, 0.06), legBack: bone(-3, 0, -0.08), body: bone(0, 0, 0.02), head: bone(0, 0, 0.02) }),
    ],
    // 步行 — 轻快步伐
    [FighterState.WALK]: [
      pose({ legFront: bone(7, -2, 0.2), legBack: bone(-2, 2, -0.16), armFront: bone(5, 16, 0.14), armBack: bone(-4, 14, -0.35) }),
      pose({ legFront: bone(4, 0, 0.1), legBack: bone(-3, 0, -0.08), armFront: bone(6, 14, 0.18), armBack: bone(-4, 13, -0.38) }),
      pose({ legFront: bone(2, 2, -0.16), legBack: bone(-7, -2, 0.2), armFront: bone(7, 15, 0.2), armBack: bone(-3, 15, -0.32) }),
      pose({ legFront: bone(3, 0, -0.08), legBack: bone(-4, 0, 0.06), armFront: bone(6, 13, 0.16), armBack: bone(-4, 12, -0.36) }),
    ],
    // 奔跑 — 身体前倾，手臂大幅摆动
    [FighterState.RUN]: [
      pose({ body: bone(6, 0, 0.2), armFront: bone(-3, 18, -0.72), armBack: bone(10, 20, 0.48), legFront: bone(10, -4, 0.45), legBack: bone(-5, 4, -0.35) }),
      pose({ body: bone(3, 0, 0.1), armFront: bone(-1, 14, -0.4), armBack: bone(6, 22, 0.22), legFront: bone(6, 4, 0.18), legBack: bone(-10, -4, 0.45) }),
    ],
    // 蹲下 — 紧凑姿态
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.06),
      head: bone(0, 14),
      armFront: bone(6, 22, 0.02),
      armBack: bone(-4, 20, -0.18),
      legFront: bone(7, 0, 0.45),
      legBack: bone(-5, 0, -0.35),
    }),
    // 防御 — 双臂交叉护身
    [FighterState.BLOCK]: [
      pose({ armFront: bone(1, 6, -0.38), armBack: bone(-1, 4, -0.58), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(0, 8, -0.42), armBack: bone(-2, 6, -0.62), body: bone(-2, 0, -0.04) }),
    ],
    // 受创 — 身体后仰
    [FighterState.HITSTUN]: [
      pose({ body: bone(-3, 0, -0.14), head: bone(-2, 2, -0.2), armFront: bone(-1, 18, 0.45), armBack: bone(-6, 14, 0.58) }),
      pose({ body: bone(-5, 2, -0.24), head: bone(-3, 3, -0.3), armFront: bone(1, 21, 0.58), armBack: bone(-8, 16, 0.72) }),
      pose({ body: bone(-2, -1, -0.08), head: bone(-1, 1, -0.12), armFront: bone(-2, 14, 0.38), armBack: bone(-4, 12, 0.45) }),
    ],
    // 倒地
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.78), head: bone(6, 18, 0.88), armFront: bone(-3, 18, 0.58), armBack: bone(8, 16, -0.38), legFront: bone(-6, 14, -0.2), legBack: bone(4, 16, 0.28) }),
      pose({ body: bone(0, 28, 1.32), head: bone(8, 32, 1.12), legFront: bone(-8, 28, -0.28), legBack: bone(6, 30, 0.38) }),
    ],
    // 跳跃 — 身体紧凑
    [FighterState.JUMP]: pose({
      armFront: bone(6, 4, 0.22),
      armBack: bone(-4, 2, -0.18),
      legFront: bone(2, -2, 0.14),
      legBack: bone(-3, 0, -0.28),
    }),
    // 站立攻击 — 快速灵巧的拳击
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.03), body: bone(2, 0, 0.1), armFront: bone(10, 4, 0.1, 0.9), armBack: bone(-3, 6, -0.48, 0.8), legFront: bone(3, 0, 0.06), legBack: bone(-3, 0, -0.08) }),
      pose({ head: bone(2, 0, 0.05), body: bone(4, 0, 0.16), armFront: bone(20, 5, 0.2, 1.0), armBack: bone(-3, 6, -0.48, 0.8), legFront: bone(4, 0, 0.1), legBack: bone(-4, 0, -0.1) }),
    ],
    // 蹲下攻击 — 快速扫腿
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 5, 0.03), body: bone(2, 7, 0.06), armFront: bone(8, 6, 0.04, 0.9), armBack: bone(-3, 10, -0.38, 0.8), legFront: bone(12, 1, 0.28, 1.0), legBack: bone(-4, 5, -0.14) }),
      pose({ head: bone(2, 6, 0.05), body: bone(3, 9, 0.12), armFront: bone(12, 8, -0.04, 1.0), armBack: bone(-3, 10, -0.38, 0.8), legFront: bone(16, 2, 0.34, 1.05), legBack: bone(-4, 5, -0.18) }),
    ],
    // 空中攻击 — 轻快
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.08), armFront: bone(8, -1, -0.08, 0.9), armBack: bone(-3, 1, -0.24, 0.8), legFront: bone(8, 2, 0.28, 1.0), legBack: bone(-3, 0, -0.12) }),
      pose({ head: bone(0, -1, -0.04), body: bone(3, 0, 0.14), armFront: bone(12, -2, -0.12, 1.05), armBack: bone(-3, 1, -0.24, 0.8), legFront: bone(12, 3, 0.35, 1.1), legBack: bone(-3, 0, -0.16) }),
    ],
    // 投技
    [FighterState.THROW]: [
      pose({ head: bone(1, 0, 0.02), body: bone(3, 0, 0.12), armFront: bone(16, 1, -0.04, 1.1), armBack: bone(10, 3, -0.1, 0.95), legFront: bone(3, 0, 0.08), legBack: bone(-3, 0, -0.08) }),
      pose({ head: bone(2, 1, 0.04), body: bone(5, 0, 0.18), armFront: bone(22, 2, -0.08, 1.25), armBack: bone(14, 4, -0.14, 1.05), legFront: bone(4, 0, 0.1), legBack: bone(-4, 0, -0.1) }),
    ],
    // 防御崩坏
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-2, 3, -0.18),
      body: bone(-2, 2, -0.08),
      armFront: bone(-2, 8, 0.32),
      armBack: bone(-4, 6, 0.22),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-3, 0, -0.04),
    }),
    // 小跳
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.03),
      body: bone(0, -1, 0),
      armFront: bone(5, 3, 0.14),
      armBack: bone(-3, 2, -0.18),
      legFront: bone(2, 2, 0.1),
      legBack: bone(-3, 1, -0.14),
    }),
    // 后撤步
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -6, -0.1),
      armFront: bone(5, 2, 0.5),
      armBack: bone(-8, 1, -0.18),
      legFront: bone(0, -6, 0.42),
      legBack: bone(7, -2, -0.5),
    }),
    // 前滚
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.78),
      head: bone(2, 23, 0.58),
      armFront: bone(-1, 25, 0.38),
      armBack: bone(6, 20, -0.48),
      legFront: bone(-6, 23, -0.28),
      legBack: bone(3, 21, 0.42),
    }),
    // 大跳
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.06),
      armFront: bone(7, 7, 0.4),
      armBack: bone(-6, 5, -0.28),
      legFront: bone(5, -4, 0.32),
      legBack: bone(-5, -2, -0.42),
    }),
    // 跑跳
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.03),
      armFront: bone(6, 5, 0.26),
      armBack: bone(-5, 3, -0.2),
      legFront: bone(3, -1, 0.18),
      legBack: bone(-3, 0, -0.26),
    }),
    // 后滚
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 16, -0.58),
      head: bone(-3, 19, -0.48),
      armFront: bone(3, 20, 0.28),
      armBack: bone(-5, 16, -0.38),
      legFront: bone(3, 14, -0.2),
      legBack: bone(-3, 17, 0.28),
    }),
    // 空中防御
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(0, 6, -0.48),
      armBack: bone(-2, 4, -0.6),
      legFront: bone(2, -2, 0.1),
      legBack: bone(-2, 0, -0.14),
    }),
  },

  // Chris 体型: 160cm 小体型少年，最小编号
  proportions: {
    headW: 30, headH: 30,
    torsoW: 32, torsoH: 50,
    armW: 11, armH: 36,
    legW: 13, legH: 48,
    shoulderY: 14, hipY: 48,
    torsoCenterY: 28, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCBx2+K → Chain Slide Touch
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCBx2_K') return AttackType.DM_CHAIN_SLIDE_TOUCH;

    // DP+K → Scramble Dash (low rushing attack)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER && input.kickPressed) {
      return AttackType.CHRIS_SCRAMBLE_DASH;
    }

    // QCB+K → Twister Drive (spinning kick, knockdown)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.CHRIS_TWISTER_DRIVE;
    }

    // QCF+P → Shot Weave (weak/strong rushing punch)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.CHRIS_SHOT_WEAVE_C : AttackType.CHRIS_SHOT_WEAVE;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A Makashippo (upper strike)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.CHRIS_MAKASHIPPO;
    // →+B Kazaguruma (low spinning kick)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CHRIS_KAZAGURUMA;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(_fighter, _attackType, _projectiles, _playerIndex) {
    // Chris specials are all melee — no projectile spawning needed
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
