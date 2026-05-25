/**
 * 罗伯特·加西亚 (Robert Garcia) — 角色定义
 * 极限流空手道，Ryo的劲敌
 *
 * 必杀技:
 *   QCF+A/C  → 龍撃拳 (projectile)
 *   DP+A/C   → 龍斬 (upper)
 *   QCB+K    → 幻影脚 (overhead kick)
 *   QCF+K    → 飛燕疾風龍脚 (rush kick)
 *   air QCB+K→ 飛燕龍神脚 (air dive)
 *
 * 命令通常技:
 *   →+A  → 幻影脚 (overhead)
 *   ↘+B  → 龍舞脚 (low)
 *
 * 超必杀技:
 *   QCFx2+P → 龍虎乱舞
 *   QCFx2+K → 霸王翔吼拳
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';

export const RobertDef: CharacterDefinition = {
  id: 'robert',
  name: 'Robert Garcia',
  nameCn: 'ロバート・ガルシア',
  color: '#22aa44',
  accentColor: '#44cc66',
  specialColor: '#44ff88',
  specialGlow: '#22dd66',
  portrait: '🥋',
  pixelPortrait: undefined,
  winQuotes: ['極限流、見せてやるよ！', 'まだまだ修行が足りないな', '龍虎の拳、恐るべし！'],

  stats: {
    walkSpeed: 4.5,
    runSpeed: 7.5,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 960,
    pushWidth: 58,
    jumpForwardSpeed: 5.5,
    closeRange: 88,
    throwRange: 100,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 极限流前倾站姿，双拳向前，重心稍前
      pose({ armFront: bone(12, 16, 0.3), armBack: bone(-6, 14, -0.4), legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.12), body: bone(2, 0, 0.05) }),
      // Frame 1: 吸气 — 身体微升，拳位微收
      pose({ armFront: bone(11, 14, 0.28), armBack: bone(-5, 12, -0.38), legFront: bone(7, -1, 0.1), legBack: bone(-5, -1, -0.1), body: bone(2, -2, 0.04) }),
      // Frame 2: 吸气巅峰 — 最大化上升
      pose({ armFront: bone(10, 13, 0.25), armBack: bone(-5, 11, -0.35), legFront: bone(6, -1, 0.08), legBack: bone(-4, -1, -0.08), body: bone(1, -3, 0.03), head: bone(0, -1) }),
      // Frame 3: 过渡 — 开始下沉
      pose({ armFront: bone(11, 15, 0.29), armBack: bone(-6, 13, -0.39), legFront: bone(7, 0, 0.11), legBack: bone(-5, 0, -0.11), body: bone(2, -1, 0.05) }),
      // Frame 4: 呼气下沉 — 重心下沉
      pose({ armFront: bone(13, 18, 0.33), armBack: bone(-7, 16, -0.44), legFront: bone(8, 1, 0.14), legBack: bone(-6, 1, -0.14), body: bone(2, 2, 0.06) }),
      // Frame 5: 呼气完成 — 最大下沉，稳健
      pose({ armFront: bone(14, 19, 0.35), armBack: bone(-7, 17, -0.46), legFront: bone(8, 2, 0.15), legBack: bone(-6, 2, -0.15), body: bone(3, 3, 0.07), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.22), legBack: bone(-4, 2, -0.18), armFront: bone(10, 18, 0.2), armBack: bone(-5, 16, -0.35), body: bone(2, 0, 0.05) }),
      pose({ legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(11, 16, 0.22), armBack: bone(-6, 15, -0.38), body: bone(2, 0, 0.04) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-10, -2, 0.22), armFront: bone(12, 17, 0.24), armBack: bone(-4, 17, -0.32), body: bone(2, 0, 0.05) }),
      pose({ legFront: bone(6, 0, -0.08), legBack: bone(-6, 0, 0.06), armFront: bone(11, 15, 0.21), armBack: bone(-5, 14, -0.36), body: bone(2, 0, 0.04) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(10, 0, 0.25), armFront: bone(-4, 20, -0.8), armBack: bone(16, 22, 0.5), legFront: bone(14, -5, 0.48), legBack: bone(-8, 5, -0.38) }),
      pose({ body: bone(6, 0, 0.12), armFront: bone(-2, 16, -0.45), armBack: bone(12, 24, 0.22), legFront: bone(9, 5, 0.2), legBack: bone(-14, -5, 0.48) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(2, 18, 0.1),
      head: bone(0, 14),
      armFront: bone(12, 20, 0.08),
      armBack: bone(-5, 18, -0.18),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-8, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(4, 10, -0.4), armBack: bone(1, 8, -0.6), legFront: bone(3, 0, 0.05) }),
      pose({ armFront: bone(3, 12, -0.45), armBack: bone(0, 10, -0.65), body: bone(-2, 0, -0.05) }),
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
      armFront: bone(12, 6, 0.28),
      armBack: bone(-5, 5, -0.18),
      legFront: bone(4, -4, 0.15),
      legBack: bone(-5, -1, -0.28),
      body: bone(2, -2, 0.03),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(18, 4, 0.14, 1.0), armBack: bone(-6, 10, -0.6, 0.85), legFront: bone(6, 0, 0.08), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(24, 5, -0.04, 1.2), armBack: bone(-6, 10, -0.6, 0.85), legFront: bone(7, 0, 0.12), legBack: bone(-7, 0, -0.12) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 8, 0.05), body: bone(3, 10, 0.1), armFront: bone(16, 10, 0.06, 1.0), armBack: bone(-5, 14, -0.45, 0.85), legFront: bone(16, 2, 0.3, 1.0), legBack: bone(-8, 8, -0.18) }),
      pose({ head: bone(3, 9, 0.08), body: bone(4, 12, 0.14), armFront: bone(20, 12, -0.08, 1.15), armBack: bone(-5, 14, -0.45, 0.85), legFront: bone(19, 3, 0.36, 1.1), legBack: bone(-8, 8, -0.22) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.1), armFront: bone(16, -2, -0.1, 1.0), armBack: bone(-7, 0, -0.32, 0.85), legFront: bone(12, 3, 0.28, 1.0), legBack: bone(-6, -1, -0.16) }),
      pose({ head: bone(0, -2, -0.08), body: bone(3, 0, 0.14), armFront: bone(20, -3, -0.18, 1.15), armBack: bone(-7, 0, -0.32, 0.85), legFront: bone(15, 4, 0.34, 1.15), legBack: bone(-6, -1, -0.2) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(5, 0, 0.14), armFront: bone(22, 3, 0.02, 1.15), armBack: bone(15, 5, -0.08, 1.0), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.05), body: bone(7, 0, 0.2), armFront: bone(28, 4, -0.06, 1.3), armBack: bone(20, 6, -0.12, 1.1), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
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
      body: bone(1, -1, 0.02),
      armFront: bone(10, 4, 0.18),
      armBack: bone(-4, 3, -0.18),
      legFront: bone(5, 3, 0.12),
      legBack: bone(-5, 2, -0.14),
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
      body: bone(1, -8, -0.06),
      armFront: bone(12, 10, 0.44),
      armBack: bone(-7, 8, -0.28),
      legFront: bone(8, -6, 0.36),
      legBack: bone(-7, -4, -0.44),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(4, -5, -0.03),
      armFront: bone(11, 7, 0.3),
      armBack: bone(-6, 5, -0.2),
      legFront: bone(6, -3, 0.2),
      legBack: bone(-5, -1, -0.26),
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
      armFront: bone(3, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(4, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  proportions: {
    headW: 44, headH: 44,
    torsoW: 58, torsoH: 62,
    armW: 24, armH: 46,
    legW: 28, legH: 56,
    shoulderY: 14, hipY: 52,
    torsoCenterY: 30, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → 龍虎乱舞
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_RYU_KO_RYU;

    // DM: QCFx2+K → 霸王翔吼拳
    if (dmMotion === 'QCFx2_K') return AttackType.DM_HAOU_SHOKOU;

    // DP+P → 龍斬 (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.ROBERT_RYU_ZAN_C : AttackType.ROBERT_RYU_ZAN;
    }

    // QCB+K → 幻影脚 (overhead kick) / 飛燕龍神脚 (air)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.ROBERT_HIEN_RYU_JIN;
    }

    // QCF+K → 飛燕疾風龍脚 (rush kick)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.ROBERT_HIEN_RYU_KYAKU;
    }

    // QCF+P → 龍撃拳 (弱P/强P projectile)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.ROBERT_RYU_GEKI_C : AttackType.ROBERT_RYU_GEKI;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A 幻影脚 (overhead)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.ROBERT_GENEI_KYAKU_CMD;
    // ↘+B 龍舞脚 (low)
    if (input.buttonBPressed && input.forward && input.down) return AttackType.ROBERT_KOU_SHUTAI;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 龍撃拳: spawn projectile (weak/strong)
    if ((attackType === AttackType.ROBERT_RYU_GEKI || attackType === AttackType.ROBERT_RYU_GEKI_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 龍斬: rise (weak)
    if (attackType === AttackType.ROBERT_RYU_ZAN) {
      fighter.vy = -6;
      return true;
    }
    // 龍斬: rise (strong, higher)
    if (attackType === AttackType.ROBERT_RYU_ZAN_C) {
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
    return null;
  },
};
