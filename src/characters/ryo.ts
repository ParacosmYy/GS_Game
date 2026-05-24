/**
 * 坂崎亮 (Ryo Sakazaki) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → 虎煌 (projectile, weak/strong)
 *   DP+A/C  → 虎咆 (upper, weak/strong)
 *   QCB+K   → 飛燕疾風脚 (overhead kick)
 *   QCF+K   → 霸王翔吼拳 (counter)
 * DM: QCF×2+P → 天地霸煌拳
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';

const ryoPortrait = {
  width: 32, height: 32,
  palette: { 1: '#e8b870', 2: '#884422', 3: '#ffa500', 4: '#333' } as Record<number, string>,
  pixels: [] as number[][],
};

export const RyoDef: CharacterDefinition = {
  id: 'ryo',
  name: 'Ryo Sakazaki',
  nameCn: '坂崎亮',
  color: '#dd6600',
  accentColor: '#ff8822',
  specialColor: '#ffcc00',
  specialGlow: '#ffaa00',
  portrait: '👊',
  pixelPortrait: ryoPortrait,

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
    [FighterState.IDLE]: [
      pose({ armFront: bone(10, 18, 0.25), armBack: bone(-8, 16, -0.45), legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.12) }),
      pose({ armFront: bone(10, 16, 0.23), armBack: bone(-8, 14, -0.43), legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.12), body: bone(0, -1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.22), legBack: bone(-4, 2, -0.18), armFront: bone(8, 20, 0.15), armBack: bone(-6, 18, -0.38) }),
      pose({ legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(9, 18, 0.18), armBack: bone(-7, 17, -0.42) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-10, -2, 0.22), armFront: bone(10, 19, 0.2), armBack: bone(-5, 19, -0.35) }),
      pose({ legFront: bone(6, 0, -0.08), legBack: bone(-6, 0, 0.06), armFront: bone(9, 17, 0.16), armBack: bone(-6, 16, -0.4) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(8, 0, 0.22), armFront: bone(-5, 22, -0.85), armBack: bone(14, 24, 0.55), legFront: bone(14, -5, 0.48), legBack: bone(-8, 5, -0.38) }),
      pose({ body: bone(5, 0, 0.1), armFront: bone(-3, 18, -0.5), armBack: bone(10, 26, 0.25), legFront: bone(9, 5, 0.2), legBack: bone(-14, -5, 0.48) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.08),
      head: bone(0, 14),
      armFront: bone(10, 22, 0.05),
      armBack: bone(-6, 20, -0.2),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-8, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 10, -0.4), armBack: bone(0, 8, -0.6), legFront: bone(3, 0, 0.05) }),
      pose({ armFront: bone(2, 12, -0.45), armBack: bone(-1, 10, -0.65), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.14), head: bone(-2, 2, -0.2), armFront: bone(-1, 22, 0.5), armBack: bone(-8, 18, 0.65) }),
      pose({ body: bone(-7, 2, -0.24), head: bone(-4, 3, -0.3), armFront: bone(1, 25, 0.65), armBack: bone(-10, 20, 0.8) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-1, 1, -0.12), armFront: bone(-4, 18, 0.4), armBack: bone(-6, 16, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(10, 8, 0.25),
      armBack: bone(-6, 6, -0.2),
      legFront: bone(3, -4, 0.15),
      legBack: bone(-5, -1, -0.3),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.03), body: bone(3, 0, 0.08), armFront: bone(16, 5, 0.12, 1.0), armBack: bone(-8, 10, -0.65, 0.85), legFront: bone(6, 0, 0.08), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.05), body: bone(4, 0, 0.12), armFront: bone(22, 6, -0.05, 1.2), armBack: bone(-8, 10, -0.65, 0.85), legFront: bone(7, 0, 0.12), legBack: bone(-7, 0, -0.12) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 8, 0.05), body: bone(2, 10, 0.08), armFront: bone(14, 10, 0.05, 1.0), armBack: bone(-6, 14, -0.5, 0.85), legFront: bone(15, 2, 0.28, 1.0), legBack: bone(-8, 8, -0.18) }),
      pose({ head: bone(3, 9, 0.08), body: bone(3, 12, 0.12), armFront: bone(18, 12, -0.1, 1.15), armBack: bone(-6, 14, -0.5, 0.85), legFront: bone(18, 3, 0.35, 1.1), legBack: bone(-8, 8, -0.22) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.04), body: bone(1, 0, 0.08), armFront: bone(14, -2, -0.12, 1.0), armBack: bone(-8, 0, -0.35, 0.85), legFront: bone(10, 3, 0.25, 1.0), legBack: bone(-7, -1, -0.18) }),
      pose({ head: bone(0, -2, -0.08), body: bone(2, 0, 0.12), armFront: bone(18, -3, -0.2, 1.15), armBack: bone(-8, 0, -0.35, 0.85), legFront: bone(13, 4, 0.32, 1.15), legBack: bone(-7, -1, -0.22) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(20, 3, 0.0, 1.15), armBack: bone(14, 5, -0.1, 1.0), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.05), body: bone(6, 0, 0.18), armFront: bone(26, 4, -0.08, 1.3), armBack: bone(18, 6, -0.15, 1.1), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.08),
      armFront: bone(-4, 12, 0.35),
      armBack: bone(-6, 10, 0.25),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-5, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(8, 5, 0.15),
      armBack: bone(-5, 4, -0.2),
      legFront: bone(4, 3, 0.1),
      legBack: bone(-5, 2, -0.15),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-5, -8, -0.1),
      armFront: bone(8, 4, 0.55),
      armBack: bone(-12, 3, -0.2),
      legFront: bone(-2, -8, 0.45),
      legBack: bone(9, -3, -0.55),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 24, 0.8),
      head: bone(4, 27, 0.6),
      armFront: bone(-3, 29, 0.4),
      armBack: bone(8, 24, -0.5),
      legFront: bone(-8, 27, -0.3),
      legBack: bone(5, 25, 0.45),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.06),
      armFront: bone(10, 10, 0.42),
      armBack: bone(-8, 8, -0.3),
      legFront: bone(7, -6, 0.35),
      legBack: bone(-7, -4, -0.45),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -5, -0.03),
      armFront: bone(9, 7, 0.28),
      armBack: bone(-7, 5, -0.22),
      legFront: bone(5, -3, 0.18),
      legBack: bone(-5, -1, -0.28),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.6),
      head: bone(-5, 23, -0.5),
      armFront: bone(5, 24, 0.3),
      armBack: bone(-7, 20, -0.4),
      legFront: bone(5, 18, -0.2),
      legBack: bone(-5, 21, 0.3),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → 天地霸煌拳
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_TEN_HA_OU;

    // DP+P → 虎咆 (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.RYO_KO_HOU_C : AttackType.RYO_KO_HOU;
    }

    // QCB+K → 飛燕疾風脚 (overhead)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.RYO_HIEN;
    }

    // QCF+K → 霸王翔吼拳 (counter)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.RYO_HAOU;
    }

    // QCF+P → 虎煌 (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.RYO_KOOU_C : AttackType.RYO_KOOU;
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
    // 虎煌: spawn projectile (weak/strong)
    if ((attackType === AttackType.RYO_KOOU || attackType === AttackType.RYO_KOOU_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 虎咆: rise
    if (attackType === AttackType.RYO_KO_HOU) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.RYO_KO_HOU_C) {
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
