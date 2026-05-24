/**
 * K' (K Dash) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Eins Trigger (projectile, weak/strong)
 *   DP+A/C  → Crow Bites (upper, weak/strong)
 *   QCB+K   → Minute Spike (overhead kick)
 *   QCF+K   → Narrow Spike (low)
 * DM: QCF×2+P → Chain Shot
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
// placeholder portrait — will be replaced by actual pixel portrait data
const kdashPortrait = {
  width: 48, height: 48,
  palette: { 1: '#444466', 2: '#6666aa', 3: '#ff4400', 4: '#ff6600', 5: '#222', 6: '#fff' } as Record<number, string>,
  pixels: Array.from({ length: 48 }, () => Array(48).fill(0)),
};

export const KdashDef: CharacterDefinition = {
  id: 'kdash',
  name: "K'",
  nameCn: "K'",
  color: '#444466',
  accentColor: '#6666aa',
  specialColor: '#ff4400',
  specialGlow: '#ff6600',
  portrait: '🔥',
  pixelPortrait: kdashPortrait,
  winQuotes: ['...チッ', '俺の邪魔をするな', 'secondから逃げられない'],

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
    // 待机 — K' 特有的懒散/挑衅站姿：手臂下垂，重心后倾，hands-in-pockets attitude
    [FighterState.IDLE]: [
      // Frame 0: 中性 — 微微驼背，一手略微抬起，无聊的神态
      pose({ armFront: bone(12, 20, 0.08), armBack: bone(-10, 18, -0.35), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, 0, -0.04), head: bone(1, 0, -0.02) }),
      // Frame 1: 微吸气 — 几乎不动，太酷了不在乎
      pose({ armFront: bone(12, 19, 0.07), armBack: bone(-10, 17, -0.34), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, -1, -0.04), head: bone(1, -1, -0.02) }),
      // Frame 2: 吸气顶部 — 肩膀微微抬起
      pose({ armFront: bone(12, 18, 0.06), armBack: bone(-10, 16, -0.33), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, -1, -0.03), head: bone(1, -1, -0.01) }),
      // Frame 3: 呼气开始 — 肩膀滚动，手部调整
      pose({ armFront: bone(13, 19, 0.09), armBack: bone(-10, 17, -0.36), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, 0, -0.04), head: bone(1, 0, -0.02) }),
      // Frame 4: 呼气中 — 肩膀滚动继续
      pose({ armFront: bone(13, 20, 0.08), armBack: bone(-9, 18, -0.34), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, 0, -0.05), head: bone(0, 0, -0.03) }),
      // Frame 5: 呼气结束 — 安顿，手放回口袋
      pose({ armFront: bone(12, 20, 0.08), armBack: bone(-10, 18, -0.35), legFront: bone(8, 0, 0.1), legBack: bone(-6, 0, -0.14), body: bone(-2, 0, -0.04), head: bone(1, 0, -0.02) }),
    ],
    // 步行 — 手臂自然摆动，步伐放松
    [FighterState.WALK]: [
      pose({ legFront: bone(12, -2, 0.2), legBack: bone(-6, 2, -0.16), armFront: bone(10, 22, 0.05), armBack: bone(-8, 20, -0.3), body: bone(-1, 0, -0.02) }),
      pose({ legFront: bone(8, 0, 0.1), legBack: bone(-7, 0, -0.06), armFront: bone(11, 20, 0.08), armBack: bone(-9, 19, -0.34), body: bone(-2, 0, -0.04) }),
      pose({ legFront: bone(5, 2, -0.16), legBack: bone(-12, -2, 0.2), armFront: bone(12, 21, 0.1), armBack: bone(-7, 21, -0.28), body: bone(-1, 0, -0.02) }),
      pose({ legFront: bone(7, 0, -0.06), legBack: bone(-8, 0, 0.04), armFront: bone(11, 19, 0.06), armBack: bone(-8, 18, -0.32), body: bone(-2, 0, -0.04) }),
    ],
    // 跑步 — 前倾幅度大，手臂后甩
    [FighterState.RUN]: [
      pose({ body: bone(10, 0, 0.2), armFront: bone(-6, 24, -0.8), armBack: bone(16, 26, 0.5), legFront: bone(16, -5, 0.45), legBack: bone(-10, 5, -0.35) }),
      pose({ body: bone(6, 0, 0.08), armFront: bone(-4, 20, -0.45), armBack: bone(12, 28, 0.2), legFront: bone(10, 5, 0.18), legBack: bone(-16, -5, 0.45) }),
    ],
    // 蹲下 — 重心低，前臂蓄力
    [FighterState.CROUCH]: pose({
      body: bone(-2, 18, 0.06),
      head: bone(0, 14),
      armFront: bone(12, 24, -0.05),
      armBack: bone(-8, 22, -0.18),
      legFront: bone(12, 0, 0.45),
      legBack: bone(-10, 0, -0.35),
    }),
    // 防御 — 双臂交叉护身，略后倾
    [FighterState.BLOCK]: [
      pose({ armFront: bone(4, 8, -0.45), armBack: bone(1, 6, -0.65), legFront: bone(4, 0, 0.04), body: bone(-3, 0, -0.06) }),
      pose({ armFront: bone(3, 10, -0.5), armBack: bone(0, 8, -0.7), legFront: bone(3, 0, 0.04), body: bone(-4, 0, -0.08) }),
    ],
    // 受击硬直 — 身体后仰，手臂被动甩起
    [FighterState.HITSTUN]: [
      pose({ body: bone(-5, 0, -0.16), head: bone(-3, 2, -0.22), armFront: bone(-2, 24, 0.5), armBack: bone(-10, 20, 0.65) }),
      pose({ body: bone(-8, 2, -0.26), head: bone(-5, 3, -0.32), armFront: bone(0, 27, 0.65), armBack: bone(-12, 22, 0.8) }),
      pose({ body: bone(-4, -1, -0.1), head: bone(-2, 1, -0.14), armFront: bone(-5, 20, 0.4), armBack: bone(-8, 18, 0.5) }),
    ],
    // 倒地
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    // 跳跃 — 四肢收缩
    [FighterState.JUMP]: pose({
      armFront: bone(12, 10, 0.2),
      armBack: bone(-8, 8, -0.18),
      legFront: bone(4, -5, 0.12),
      legBack: bone(-6, -2, -0.28),
    }),
    // 站立攻击 — 出拳时前倾发力
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.02), body: bone(4, 0, 0.1), armFront: bone(18, 4, 0.08, 1.0), armBack: bone(-10, 12, -0.6, 0.85), legFront: bone(7, 0, 0.06), legBack: bone(-7, 0, -0.12) }),
      pose({ head: bone(3, 1, 0.04), body: bone(5, 0, 0.14), armFront: bone(24, 5, -0.06, 1.2), armBack: bone(-10, 12, -0.6, 0.85), legFront: bone(8, 0, 0.1), legBack: bone(-8, 0, -0.14) }),
    ],
    // 蹲下攻击 — 前腿扫出
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 8, 0.04), body: bone(2, 10, 0.06), armFront: bone(16, 10, 0.02, 1.0), armBack: bone(-8, 15, -0.45, 0.85), legFront: bone(16, 2, 0.3, 1.0), legBack: bone(-10, 8, -0.16) }),
      pose({ head: bone(3, 9, 0.06), body: bone(3, 12, 0.1), armFront: bone(20, 12, -0.08, 1.15), armBack: bone(-8, 15, -0.45, 0.85), legFront: bone(20, 3, 0.38, 1.1), legBack: bone(-10, 8, -0.2) }),
    ],
    // 空中攻击 — 踢腿下压
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.06), body: bone(2, 0, 0.1), armFront: bone(16, -2, -0.1, 1.0), armBack: bone(-10, 0, -0.3, 0.85), legFront: bone(12, 3, 0.28, 1.0), legBack: bone(-8, -1, -0.16) }),
      pose({ head: bone(0, -2, -0.1), body: bone(3, 0, 0.14), armFront: bone(20, -3, -0.18, 1.15), armBack: bone(-10, 0, -0.3, 0.85), legFront: bone(15, 4, 0.35, 1.15), legBack: bone(-8, -1, -0.2) }),
    ],
    // 投技 — 伸手抓住
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.02), body: bone(5, 0, 0.14), armFront: bone(22, 3, -0.02, 1.15), armBack: bone(16, 5, -0.08, 1.0), legFront: bone(6, 0, 0.06), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.04), body: bone(7, 0, 0.2), armFront: bone(28, 4, -0.1, 1.3), armBack: bone(20, 6, -0.12, 1.1), legFront: bone(7, 0, 0.08), legBack: bone(-7, 0, -0.12) }),
    ],
    // 防御崩坏
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-4, 3, -0.2),
      body: bone(-3, 2, -0.1),
      armFront: bone(-5, 12, 0.3),
      armBack: bone(-8, 10, 0.2),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-6, 0, -0.04),
    }),
    // 小跳
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.06),
      body: bone(0, -1, -0.02),
      armFront: bone(10, 5, 0.12),
      armBack: bone(-7, 4, -0.18),
      legFront: bone(5, 3, 0.08),
      legBack: bone(-6, 2, -0.12),
    }),
    // 后撤步
    [FighterState.BACKDASH]: pose({
      body: bone(-6, -8, -0.12),
      armFront: bone(6, 4, 0.5),
      armBack: bone(-14, 3, -0.18),
      legFront: bone(-3, -8, 0.4),
      legBack: bone(10, -3, -0.5),
    }),
    // 前滚
    [FighterState.ROLL]: pose({
      body: bone(0, 24, 0.8),
      head: bone(4, 27, 0.6),
      armFront: bone(-3, 29, 0.4),
      armBack: bone(8, 24, -0.5),
      legFront: bone(-8, 27, -0.3),
      legBack: bone(5, 25, 0.45),
    }),
    // 大跳
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.08),
      armFront: bone(12, 10, 0.4),
      armBack: bone(-10, 8, -0.28),
      legFront: bone(8, -6, 0.32),
      legBack: bone(-8, -4, -0.42),
    }),
    // 跑跳
    [FighterState.RUN_JUMP]: pose({
      body: bone(4, -5, -0.04),
      armFront: bone(10, 7, 0.25),
      armBack: bone(-8, 5, -0.2),
      legFront: bone(6, -3, 0.16),
      legBack: bone(-6, -1, -0.25),
    }),
    // 后滚
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.6),
      head: bone(-5, 23, -0.5),
      armFront: bone(5, 24, 0.3),
      armBack: bone(-8, 20, -0.4),
      legFront: bone(5, 18, -0.2),
      legBack: bone(-5, 21, 0.3),
    }),
    // 空中防御
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(3, 8, -0.48),
      armBack: bone(-2, 6, -0.62),
      legFront: bone(4, -2, 0.08),
      legBack: bone(-5, 0, -0.12),
    }),
  },

  // K' 体型：183cm 高瘦，年轻体态，肩宽但四肢细
  proportions: {
    headW: 42, headH: 43,
    torsoW: 54, torsoH: 70,
    armW: 18, armH: 50,
    legW: 22, legH: 62,
    shoulderY: 17, hipY: 62,
    torsoCenterY: 35, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → Chain Shot
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_CHAIN_SHOT;

    // DP+P → Crow Bites (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.KDASH_CROW_C : AttackType.KDASH_CROW;
    }

    // QCB+K → Minute Spike (overhead kick)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KDASH_MINUTE;
    }

    // QCF+K → Narrow Spike (low)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.KDASH_NARROW;
    }

    // QCF+P → Eins Trigger (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.KDASH_EINS_C : AttackType.KDASH_EINS;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A One Inch (launcher on standalone hit)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.KDASH_ONE_INCH;
    // ↘+D Trigger Shot (low)
    if (input.buttonDPressed && input.forward && input.down) return AttackType.KDASH_TRIGGER;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Eins Trigger: spawn projectile (weak/strong)
    if ((attackType === AttackType.KDASH_EINS || attackType === AttackType.KDASH_EINS_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Crow Bites: rise
    if (attackType === AttackType.KDASH_CROW) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.KDASH_CROW_C) {
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
