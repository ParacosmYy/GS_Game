/**
 * 莉安娜·哈迪兰 (Leona Heidern) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → 月光 (projectile, weak/strong)
 *   DP+A/C  → 威光 (upper, weak/strong)
 *   QCB+P   → 手刀 (rush slash)
 *   QCF+K   → X标 (low)
 * DM: QCF×2+P → V字金锯
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { leonaPortrait } from '../rendering/portraits/leonaPortrait.js';

export const LeonaDef: CharacterDefinition = {
  id: 'leona',
  name: 'Leona Heidern',
  nameCn: '莉安娜',
  color: '#2266bb',
  accentColor: '#4488dd',
  specialColor: '#44aaff',
  specialGlow: '#88ccff',
  portrait: '⚔️',
  pixelPortrait: leonaPortrait,
  winQuotes: ['...任務完了', '弱すぎる', 'これが軍人の戦い方だ'],

  stats: {
    walkSpeed: 4.5,
    runSpeed: 7.5,
    jumpVelocity: -13.5,
    hopVelocity: -10,
    hyperJumpVelocity: -16.5,
    maxHealth: 950,
    pushWidth: 58,
    jumpForwardSpeed: 5.5,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 直立，双手垂于身侧，警觉姿态
      pose({ armFront: bone(8, 16, 0.2), armBack: bone(-7, 14, -0.4), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.1) }),
      // Frame 1: 吸气 — 微幅上升，军人体能纪律，极少移动
      pose({ armFront: bone(8, 15, 0.19), armBack: bone(-7, 13, -0.39), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.1), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰 — 极微上移，保持紧张
      pose({ armFront: bone(8, 14, 0.18), armBack: bone(-7, 12, -0.38), legFront: bone(6, -1, 0.09), legBack: bone(-5, -1, -0.09), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡 — 开始微松
      pose({ armFront: bone(8, 15, 0.19), armBack: bone(-7, 13, -0.39), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.1), body: bone(0, -1) }),
      // Frame 4: 呼气 — 轻微放松但仍保持紧张
      pose({ armFront: bone(8, 17, 0.21), armBack: bone(-7, 15, -0.41), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.1), body: bone(0, 1) }),
      // Frame 5: 呼气完成 — 恢复警觉但略沉
      pose({ armFront: bone(9, 17, 0.22), armBack: bone(-7, 15, -0.42), legFront: bone(6, 1, 0.11), legBack: bone(-5, 1, -0.11), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.2), legBack: bone(-4, 2, -0.16), armFront: bone(7, 18, 0.12), armBack: bone(-6, 16, -0.35) }),
      pose({ legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.08), armFront: bone(8, 16, 0.15), armBack: bone(-7, 15, -0.38) }),
      pose({ legFront: bone(5, 2, -0.16), legBack: bone(-10, -2, 0.2), armFront: bone(8, 17, 0.18), armBack: bone(-5, 17, -0.32) }),
      pose({ legFront: bone(6, 0, -0.08), legBack: bone(-6, 0, 0.06), armFront: bone(7, 15, 0.14), armBack: bone(-6, 14, -0.36) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(7, 0, 0.2), armFront: bone(-4, 20, -0.8), armBack: bone(12, 22, 0.5), legFront: bone(12, -5, 0.45), legBack: bone(-7, 5, -0.35) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-2, 16, -0.45), armBack: bone(8, 24, 0.22), legFront: bone(8, 5, 0.18), legBack: bone(-12, -5, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 16, 0.06),
      head: bone(0, 12),
      armFront: bone(8, 20, 0.02),
      armBack: bone(-6, 18, -0.18),
      legFront: bone(10, 0, 0.45),
      legBack: bone(-7, 0, -0.35),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.4), armBack: bone(0, 6, -0.6), legFront: bone(2, 0, 0.05) }),
      pose({ armFront: bone(2, 10, -0.45), armBack: bone(-1, 8, -0.65), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.14), head: bone(-2, 2, -0.2), armFront: bone(-1, 20, 0.5), armBack: bone(-7, 16, 0.6) }),
      pose({ body: bone(-7, 2, -0.22), head: bone(-4, 3, -0.28), armFront: bone(1, 23, 0.6), armBack: bone(-9, 18, 0.75) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-1, 1, -0.12), armFront: bone(-4, 17, 0.4), armBack: bone(-5, 15, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(8, 6, 0.2),
      armBack: bone(-5, 4, -0.18),
      legFront: bone(3, -3, 0.12),
      legBack: bone(-4, 0, -0.25),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.03), body: bone(3, 0, 0.08), armFront: bone(15, 5, 0.1, 1.0), armBack: bone(-7, 8, -0.6, 0.85), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.05), body: bone(4, 0, 0.12), armFront: bone(20, 6, -0.05, 1.15), armBack: bone(-7, 8, -0.6, 0.85), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 7, 0.04), body: bone(2, 9, 0.06), armFront: bone(13, 9, 0.02, 1.0), armBack: bone(-6, 13, -0.45, 0.85), legFront: bone(14, 2, 0.25, 1.0), legBack: bone(-7, 7, -0.15) }),
      pose({ head: bone(3, 8, 0.06), body: bone(3, 11, 0.1), armFront: bone(17, 11, -0.08, 1.1), armBack: bone(-6, 13, -0.45, 0.85), legFront: bone(17, 3, 0.32, 1.05), legBack: bone(-7, 7, -0.2) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.03), body: bone(1, 0, 0.06), armFront: bone(12, -2, -0.1, 1.0), armBack: bone(-7, 0, -0.3, 0.85), legFront: bone(9, 3, 0.2, 1.0), legBack: bone(-6, -1, -0.15) }),
      pose({ head: bone(0, -2, -0.06), body: bone(2, 0, 0.1), armFront: bone(16, -3, -0.18, 1.1), armBack: bone(-7, 0, -0.3, 0.85), legFront: bone(12, 4, 0.28, 1.1), legBack: bone(-6, -1, -0.2) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(18, 3, 0.0, 1.1), armBack: bone(12, 5, -0.1, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.06) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.15), armFront: bone(24, 4, -0.06, 1.25), armBack: bone(16, 6, -0.12, 1.05), legFront: bone(5, 0, 0.08), legBack: bone(-6, 0, -0.08) }),
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
      armFront: bone(7, 4, 0.12),
      armBack: bone(-5, 3, -0.18),
      legFront: bone(4, 3, 0.08),
      legBack: bone(-5, 2, -0.12),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -9, -0.08),
      armFront: bone(6, 3, 0.5),
      armBack: bone(-10, 2, -0.18),
      legFront: bone(-2, -9, 0.42),
      legBack: bone(8, -3, -0.52),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(4, 25, 0.55),
      armFront: bone(-4, 27, 0.35),
      armBack: bone(8, 22, -0.45),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(5, 23, 0.4),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(8, 10, 0.4),
      armBack: bone(-7, 8, -0.28),
      legFront: bone(6, -6, 0.32),
      legBack: bone(-7, -4, -0.42),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -4, -0.03),
      armFront: bone(8, 6, 0.25),
      armBack: bone(-6, 4, -0.2),
      legFront: bone(4, -3, 0.15),
      legBack: bone(-5, -1, -0.25),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.55),
      head: bone(-4, 22, -0.5),
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
  },

  proportions: {
    headW: 40, headH: 40,
    torsoW: 44, torsoH: 62,
    armW: 16, armH: 44,
    legW: 20, legH: 60,
    shoulderY: 16, hipY: 58,
    torsoCenterY: 33, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → V字金锯
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_V_SLASHER;

    // DP+P → 威光 (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.LEONA_EAR_RING_C : AttackType.LEONA_EAR_RING;
    }

    // QCB+P → 手刀 (rush slash)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.LEONA_GRAND_SABER;
    }

    // QCF+K → X标 (low)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.LEONA_BALTIC;
    }

    // QCF+P → 月光 (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.LEONA_MOON_SLASH_C : AttackType.LEONA_MOON_SLASH;
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
    // 月光: spawn projectile (weak/strong)
    if ((attackType === AttackType.LEONA_MOON_SLASH || attackType === AttackType.LEONA_MOON_SLASH_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 威光: rise
    if (attackType === AttackType.LEONA_EAR_RING) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.LEONA_EAR_RING_C) {
      fighter.vy = -8;
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
      activeFrames: 18,
      counterAttack: AttackType.LEONA_EAR_RING,
      counterDamage: 45,
      failureStun: 22,
    };
  },
};
