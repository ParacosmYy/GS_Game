/**
 * 不知火舞 (Mai Shiranui) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → 花蝶扇 (fan projectile, weak/strong)
 *   DP+K    → 飛翔龍炎陣 (fan lift upper)
 *   QCB+K   → 龍炎舞 (flame kick)
 * DM: QCBx2+K → 蜂巢落とし (super fan dance)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { maiPortrait } from '../rendering/portraits/maiPortrait.js';

export const MaiDef: CharacterDefinition = {
  id: 'mai',
  name: 'MAI SHIRANUI',
  nameCn: '不知火舞',
  color: '#ff4488',
  accentColor: '#ff88aa',
  specialColor: '#ff6644',
  specialGlow: '#ffaa66',
  portrait: '舞',
  pixelPortrait: maiPortrait,
  winQuotes: ['よっ！日本一の美女は誰かだって？…決まってるじゃない！', '私の炎から逃げられると思って？', '安室先生にも褒められた忍びの腕前よ！'],

  stats: {
    walkSpeed: 4.8,
    runSpeed: 8.0,
    jumpVelocity: -13.8,
    hopVelocity: -10.2,
    hyperJumpVelocity: -16.8,
    maxHealth: 900,
    pushWidth: 54,
    jumpForwardSpeed: 5.8,
    closeRange: 76,
    throwRange: 98,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 优雅的忍者站姿，重心略后，单手叉腰
      pose({ head: bone(0, 0, -0.02), armFront: bone(10, 14, 0.3), armBack: bone(-8, 12, -0.5), legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.08) }),
      // Frame 1: 吸气 — 轻微上移，保持优雅
      pose({ head: bone(0, -1, -0.02), armFront: bone(10, 13, 0.28), armBack: bone(-8, 11, -0.48), legFront: bone(5, -1, 0.04), legBack: bone(-4, -1, -0.07), body: bone(0, -1) }),
      // Frame 2: 微侧身 — 不知火舞特有的风情姿态
      pose({ head: bone(1, -1, -0.03), armFront: bone(11, 12, 0.32), armBack: bone(-7, 10, -0.52), legFront: bone(5, -1, 0.06), legBack: bone(-4, -1, -0.09), body: bone(0, -2) }),
      // Frame 3: 过渡
      pose({ head: bone(0, -1, -0.02), armFront: bone(10, 13, 0.3), armBack: bone(-8, 11, -0.5), legFront: bone(5, -1, 0.05), legBack: bone(-4, -1, -0.08), body: bone(0, -1) }),
      // Frame 4: 呼气 — 轻微下沉
      pose({ head: bone(-1, 1, -0.01), armFront: bone(9, 15, 0.32), armBack: bone(-8, 13, -0.52), legFront: bone(5, 1, 0.06), legBack: bone(-4, 1, -0.09), body: bone(0, 1) }),
      // Frame 5: 呼气完成
      pose({ head: bone(-1, 1, -0.01), armFront: bone(10, 16, 0.34), armBack: bone(-8, 14, -0.54), legFront: bone(6, 1, 0.07), legBack: bone(-4, 1, -0.1), body: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.18), legBack: bone(-4, 2, -0.14), armFront: bone(9, 16, 0.2), armBack: bone(-7, 14, -0.4) }),
      pose({ legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.08), armFront: bone(10, 14, 0.28), armBack: bone(-8, 13, -0.48) }),
      pose({ legFront: bone(5, 2, -0.14), legBack: bone(-10, -2, 0.18), armFront: bone(10, 16, 0.32), armBack: bone(-7, 14, -0.45) }),
      pose({ legFront: bone(6, 0, -0.06), legBack: bone(-6, 0, 0.05), armFront: bone(10, 15, 0.3), armBack: bone(-8, 13, -0.5) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(6, 0, 0.18), armFront: bone(-3, 18, -0.7), armBack: bone(11, 20, 0.45), legFront: bone(11, -4, 0.4), legBack: bone(-6, 4, -0.3) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-1, 15, -0.4), armBack: bone(8, 22, 0.2), legFront: bone(8, 4, 0.15), legBack: bone(-11, -4, 0.4) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.08),
      head: bone(0, 10),
      armFront: bone(8, 18, 0.1),
      armBack: bone(-6, 16, -0.2),
      legFront: bone(10, 0, 0.42),
      legBack: bone(-6, 0, -0.32),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.35), armBack: bone(0, 6, -0.55), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(2, 10, -0.4), armBack: bone(-1, 8, -0.6), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(-1, 18, 0.45), armBack: bone(-7, 14, 0.55) }),
      pose({ body: bone(-6, 2, -0.2), head: bone(-4, 3, -0.25), armFront: bone(1, 22, 0.55), armBack: bone(-9, 16, 0.7) }),
      pose({ body: bone(-3, -1, -0.06), head: bone(-1, 1, -0.1), armFront: bone(-4, 16, 0.35), armBack: bone(-5, 14, 0.45) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.75), head: bone(8, 20, 0.85), armFront: bone(-5, 20, 0.55), armBack: bone(12, 18, -0.35), legFront: bone(-8, 15, -0.18), legBack: bone(6, 18, 0.28) }),
      pose({ body: bone(0, 28, 1.35), head: bone(10, 33, 1.15), legFront: bone(-10, 28, -0.28), legBack: bone(8, 30, 0.35) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(8, 5, 0.22),
      armBack: bone(-5, 3, -0.15),
      legFront: bone(4, -2, 0.15),
      legBack: bone(-4, 1, -0.22),
    }),
    // — Attack poses (Kunoichi style: graceful, acrobatic, fan motions) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.06), armFront: bone(14, 5, 0.15, 0.9), armBack: bone(-6, 10, -0.5, 0.8), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.08) }),
      pose({ head: bone(1, 0, 0.04), body: bone(3, 0, 0.1), armFront: bone(18, 7, -0.04, 1.05), armBack: bone(-6, 10, -0.5, 0.8), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.1) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 6, 0.02), body: bone(1, 8, 0.06), armFront: bone(12, 7, 0.08, 0.9), armBack: bone(-5, 13, -0.35, 0.8), legFront: bone(13, 2, 0.2, 1.0), legBack: bone(-6, 5, -0.1) }),
      pose({ head: bone(1, 7, 0.04), body: bone(2, 10, 0.08), armFront: bone(16, 9, -0.02, 1.0), armBack: bone(-5, 13, -0.35, 0.8), legFront: bone(16, 3, 0.26, 1.05), legBack: bone(-6, 5, -0.14) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.06), armFront: bone(10, -1, -0.06, 0.9), armBack: bone(-5, 2, -0.22, 0.8), legFront: bone(10, 4, 0.22, 1.0), legBack: bone(-5, 0, -0.1) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.1), armFront: bone(16, -2, -0.1, 1.05), armBack: bone(-5, 2, -0.22, 0.8), legFront: bone(14, 5, 0.3, 1.1), legBack: bone(-5, 0, -0.14) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.04), body: bone(4, 0, 0.12), armFront: bone(18, 3, 0.02, 1.1), armBack: bone(12, 5, -0.08, 0.95), legFront: bone(4, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.06), body: bone(5, 0, 0.18), armFront: bone(24, 4, -0.04, 1.25), armBack: bone(16, 6, -0.1, 1.05), legFront: bone(5, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.16),
      body: bone(-2, 2, -0.06),
      armFront: bone(-4, 12, 0.3),
      armBack: bone(-6, 10, 0.22),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-5, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.03),
      body: bone(0, -1, 0),
      armFront: bone(7, 3, 0.15),
      armBack: bone(-5, 2, -0.15),
      legFront: bone(4, 3, 0.08),
      legBack: bone(-5, 2, -0.1),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.06),
      armFront: bone(6, 3, 0.45),
      armBack: bone(-10, 2, -0.15),
      legFront: bone(-2, -8, 0.38),
      legBack: bone(8, -3, -0.48),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.7),
      head: bone(4, 23, 0.5),
      armFront: bone(-4, 25, 0.32),
      armBack: bone(8, 20, -0.42),
      legFront: bone(-7, 23, -0.22),
      legBack: bone(5, 21, 0.36),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.05),
      armFront: bone(8, 9, 0.38),
      armBack: bone(-7, 7, -0.25),
      legFront: bone(6, -5, 0.3),
      legBack: bone(-7, -3, -0.38),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -3, -0.02),
      armFront: bone(8, 5, 0.22),
      armBack: bone(-6, 3, -0.18),
      legFront: bone(4, -2, 0.14),
      legBack: bone(-5, 0, -0.22),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 18, -0.5),
      head: bone(-4, 20, -0.45),
      armFront: bone(5, 21, 0.25),
      armBack: bone(-7, 18, -0.35),
      legFront: bone(5, 16, -0.16),
      legBack: bone(-5, 19, 0.25),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 7, -0.45),
      armBack: bone(-2, 5, -0.6),
      legFront: bone(3, -2, 0.08),
      legBack: bone(-4, 0, -0.12),
    }),
  },

  proportions: {
    headW: 40, headH: 42,
    torsoW: 42, torsoH: 68,
    armW: 15, armH: 50,
    legW: 19, legH: 64,
    shoulderY: 14, hipY: 62,
    torsoCenterY: 34, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCBx2+K → 蜂巢落とし
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCBx2_K') return AttackType.DM_HAKA_OTOSHI;

    // DP+K → 飛翔龍炎陣 (fan lift upper)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return AttackType.MAI_HISHO_RYU_EN_JIN;
    }

    // QCB+K → 龍炎舞 (flame kick)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.MAI_RYU_EN_BU;
    }

    // QCF+P → 花蝶扇 (fan projectile, weak/strong)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.MAI_KA_CHO_SEN_C : AttackType.MAI_KA_CHO_SEN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // →+B 必殺忍蜂 (overhead)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.MAI_HISSATSU_SHINOBIBACHI;
    // ↘+B 夕櫻舞 (low)
    if (!isAir && input.buttonBPressed && input.down && input.forward) return AttackType.MAI_YUSURA_UMA;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 花蝶扇: spawn fan projectile (weak/strong)
    if ((attackType === AttackType.MAI_KA_CHO_SEN || attackType === AttackType.MAI_KA_CHO_SEN_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 55, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 飛翔龍炎陣: launch upward
    if (attackType === AttackType.MAI_HISHO_RYU_EN_JIN) {
      fighter.vy = -7;
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
