/**
 * 雅典娜·麻宫 (Athena Asamiya) — 角色定义
 *
 * 必杀技:
 *   QCB+P   → サイコボール (Psycho Ball, projectile)
 *   DP+P    → サイコソード (Psycho Sword, upper)
 *   QCF+K   → フェニックスアロー (Phoenix Arrow, air special)
 * DM: QCF×2+P → シャイニングクリスタルビット (Shining Crystal Bit)
 *
 * 命令通常技:
 *   →+B  → サイコリフレクト (overhead)
 *   ↘+B  → 空中↓+B (low)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import type { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { athenaPortrait } from '../rendering/portraits/athenaPortrait.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { FRAME_DATA } from '../core/constants.js';

export const AthenaDef: CharacterDefinition = {
  id: 'athena',
  name: 'Athena Asamiya',
  nameCn: '雅典娜',
  color: '#ff66aa',
  accentColor: '#ff99cc',
  specialColor: '#ff44cc',
  specialGlow: '#ff88dd',
  portrait: '🔮',
  pixelPortrait: athenaPortrait,
  winQuotes: ['まだまだこれからです！', '私の勝ちですね', 'サイコパワー、見せてあげます！'],

  stats: {
    walkSpeed: 4.2,
    runSpeed: 7.2,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 950,
    pushWidth: 56,
    jumpForwardSpeed: 5.2,
    closeRange: 76,
    throwRange: 95,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 中立站姿 — 双手轻握拳于腰前，活泼少女姿态
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(8, 16, 0.25), armBack: bone(-6, 14, -0.4), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      // 帧1: 吸气 — 微微上扬，充满精神
      pose({ head: bone(0.5, -1.5, -0.02), body: bone(0, -1), armFront: bone(7, 14, 0.22), armBack: bone(-6, 13, -0.38), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.06) }),
      // 帧2: 吸气巅峰 — 上身微抬
      pose({ head: bone(0.3, -2.5, -0.03), body: bone(0.3, -2), armFront: bone(6, 13, 0.2), armBack: bone(-7, 12, -0.42), legFront: bone(5, -1, 0.12), legBack: bone(-5, 1, -0.05) }),
      // 帧3: 过渡 — 开始放松
      pose({ head: bone(0.2, -1, -0.01), body: bone(0, -1), armFront: bone(8, 15, 0.24), armBack: bone(-6, 13, -0.4), legFront: bone(5, 0, 0.09), legBack: bone(-5, 0, -0.07) }),
      // 帧4: 呼气 — 微微下沉
      pose({ head: bone(-0.3, 1.5, 0.03), body: bone(-0.3, 1), armFront: bone(9, 18, 0.28), armBack: bone(-5, 15, -0.36), legFront: bone(5, 1, 0.06), legBack: bone(-5, -1, -0.1) }),
      // 帧5: 呼气完成 — 最大下沉
      pose({ head: bone(-0.5, 2, 0.04), body: bone(-0.5, 2), armFront: bone(10, 20, 0.3), armBack: bone(-5, 16, -0.34), legFront: bone(5, 1, 0.05), legBack: bone(-5, -1, -0.12) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(9, -2, 0.22), legBack: bone(-4, 2, -0.18), armFront: bone(7, 18, 0.15), armBack: bone(-5, 16, -0.35) }),
      pose({ legFront: bone(6, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(8, 16, 0.2), armBack: bone(-6, 15, -0.38) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-9, -2, 0.22), armFront: bone(9, 16, 0.22), armBack: bone(-4, 17, -0.32) }),
      pose({ legFront: bone(6, 0, -0.08), legBack: bone(-5, 0, 0.06), armFront: bone(7, 14, 0.18), armBack: bone(-5, 13, -0.36) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(6, 0, 0.18), armFront: bone(-4, 20, -0.8), armBack: bone(10, 22, 0.45), legFront: bone(11, -5, 0.4), legBack: bone(-6, 5, -0.3) }),
      pose({ body: bone(3, 0, 0.08), armFront: bone(-2, 16, -0.4), armBack: bone(6, 24, 0.2), legFront: bone(7, 5, 0.16), legBack: bone(-11, -5, 0.4) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.08),
      head: bone(0, 14),
      armFront: bone(7, 22, 0.06),
      armBack: bone(-5, 20, -0.2),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-7, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.4), armBack: bone(0, 6, -0.6), legFront: bone(2, 0, 0.04), legBack: bone(-3, 0, -0.04) }),
      pose({ armFront: bone(2, 10, -0.45), armBack: bone(-1, 8, -0.65), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.14), head: bone(-2, 2, -0.18), armFront: bone(0, 22, 0.5), armBack: bone(-7, 16, 0.6) }),
      pose({ body: bone(-7, 2, -0.22), head: bone(-4, 3, -0.28), armFront: bone(2, 25, 0.6), armBack: bone(-9, 18, 0.75) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-1, 1, -0.1), armFront: bone(-2, 20, 0.4), armBack: bone(-5, 14, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), armFront: bone(-5, 35, 0.8), armBack: bone(15, 30, -0.6), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      body: bone(0, -4, -0.04),
      armFront: bone(8, 8, 0.3),
      armBack: bone(-5, 6, -0.2),
      legFront: bone(4, -4, 0.25),
      legBack: bone(-4, 0, -0.35),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.08),
      armFront: bone(5, 4, 0.5),
      armBack: bone(-10, 2, -0.18),
      legFront: bone(-2, -8, 0.45),
      legBack: bone(8, -3, -0.55),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(4, 25, 0.55),
      armFront: bone(-3, 27, 0.35),
      armBack: bone(8, 22, -0.45),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(5, 23, 0.4),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 1, 0.04), body: bone(3, 0, 0.1), armFront: bone(16, 5, 0.15, 0.9), armBack: bone(-5, 10, -0.5, 0.8), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.1) }),
      pose({ head: bone(3, 2, 0.08), body: bone(5, 0, 0.16), armFront: bone(22, 7, -0.06, 1.1), armBack: bone(-5, 10, -0.5, 0.8), legFront: bone(7, 0, 0.1), legBack: bone(-6, 0, -0.14) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 8, 0.06), body: bone(2, 10, 0.1), armFront: bone(14, 8, 0.08, 0.9), armBack: bone(-5, 16, -0.4, 0.8), legFront: bone(14, 3, 0.32, 1.0), legBack: bone(-7, 8, -0.2) }),
      pose({ head: bone(3, 9, 0.1), body: bone(3, 12, 0.14), armFront: bone(20, 10, -0.06, 1.05), armBack: bone(-5, 16, -0.4, 0.8), legFront: bone(18, 4, 0.38, 1.08), legBack: bone(-7, 8, -0.24) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(12, -2, -0.1, 0.9), armBack: bone(-5, 2, -0.2, 0.8), legFront: bone(10, 4, 0.3, 1.0), legBack: bone(-5, -2, -0.2) }),
      pose({ head: bone(2, -2, -0.08), body: bone(4, 0, 0.14), armFront: bone(18, -3, -0.18, 1.08), armBack: bone(-5, 2, -0.2, 0.8), legFront: bone(14, 5, 0.38, 1.1), legBack: bone(-5, -2, -0.24) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(18, 3, 0.06, 1.08), armBack: bone(14, 5, -0.1, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.04), body: bone(6, 0, 0.18), armFront: bone(26, 4, -0.04, 1.2), armBack: bone(18, 6, -0.12, 1.05), legFront: bone(5, 0, 0.08), legBack: bone(-6, 0, -0.1) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.1),
      armFront: bone(-5, 12, 0.35),
      armBack: bone(-8, 10, 0.25),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-4, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(7, 5, 0.15),
      armBack: bone(-5, 4, -0.2),
      legFront: bone(5, 3, 0.1),
      legBack: bone(-5, 2, -0.14),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(8, 10, 0.4),
      armBack: bone(-6, 8, -0.28),
      legFront: bone(6, -6, 0.32),
      legBack: bone(-6, -4, -0.42),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -4, -0.03),
      armFront: bone(8, 6, 0.25),
      armBack: bone(-5, 4, -0.18),
      legFront: bone(4, -3, 0.15),
      legBack: bone(-5, -1, -0.25),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.55),
      head: bone(-4, 22, -0.45),
      armFront: bone(5, 23, 0.28),
      armBack: bone(-7, 20, -0.38),
      legFront: bone(5, 18, -0.18),
      legBack: bone(-5, 21, 0.28),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
    [FighterState.MAX_MODE]: pose({
      head: bone(0, -3, -0.05),
      body: bone(0, -2, 0.05),
      armFront: bone(10, 8, 0.5, 1.1),
      armBack: bone(-8, 6, -0.6, 1.1),
    }),
  },

  proportions: {
    headW: 40, headH: 40,
    torsoW: 42, torsoH: 58,
    armW: 16, armH: 44,
    legW: 20, legH: 56,
    shoulderY: 15, hipY: 56,
    torsoCenterY: 30, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Shining Crystal Bit
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_SHINING_CRYSTAL_BIT;

    // DP+P → Psycho Sword (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.ATHENA_PSYCHO_SWORD_C : AttackType.ATHENA_PSYCHO_SWORD;
    }

    // QCB+P → Psycho Ball (projectile)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonCPressed ? AttackType.ATHENA_PSYCHO_BALL_C : AttackType.ATHENA_PSYCHO_BALL;
    }

    // QCF+K → Phoenix Arrow (air diving kick)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.ATHENA_PHOENIX_ARROW;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    if (isAir) {
      // 空中↓+B (air crossup)
      if (input.buttonBPressed && input.down) return AttackType.ATHENA_AIR_B;
      return null;
    }

    if (state === FighterState.CROUCH) {
      // ↘+B (low)
      if (input.buttonBPressed && input.forward && input.down) return AttackType.ATHENA_LOW_B;
      return null;
    }

    // →+B Psycho Reflect (overhead)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.ATHENA_PHOENIX_REFLECT;

    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Psycho Ball: spawn projectile (weak/strong)
    if ((attackType === AttackType.ATHENA_PSYCHO_BALL || attackType === AttackType.ATHENA_PSYCHO_BALL_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Psycho Sword: rise
    if (attackType === AttackType.ATHENA_PSYCHO_SWORD) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.ATHENA_PSYCHO_SWORD_C) {
      fighter.vy = -8;
      return true;
    }
    // Phoenix Arrow: aerial dive
    if (attackType === AttackType.ATHENA_PHOENIX_ARROW) {
      fighter.vy = -3;
      fighter.vx = 4 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() {
    return {
      activeFrames: 16,
      counterAttack: AttackType.ATHENA_PSYCHO_SWORD,
      counterDamage: 42,
      failureStun: 20,
    };
  },
};
