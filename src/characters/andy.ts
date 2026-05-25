/**
 * 安迪·博加德 (Andy Bogard) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → 飛翔拳 (Hishou Ken, energy projectile, A fast/small, C slower/bigger)
 *   DP+P    → 昇龍弾 (Shouryuu Dan, rising uppercut, A 1-hit, C 2-hit more invincible)
 *   HCF+K   → 斬影流星拳 (Zan'ei Ryuusei Ken, dash punch, B short dash, D long dash)
 *   QCB+K   → 激飛翔拳 (Geki Hishou Ken, air dive attack)
 * DM: QCFx2+P → 超裂破弾 (Cho Reppa Dan, multi-hit rising uppercut)
 *
 * 命令通常技:
 *   →+A  → 上顎 (Uwa Agito, overhead)
 *   →+B  → 下顎 (Gedan Agito, low)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { andyPortrait } from '../rendering/portraits/andyPortrait.js';

export const AndyDef: CharacterDefinition = {
  id: 'andy',
  name: 'ANDY BOGARD',
  nameCn: '安迪',
  color: '#ffaa22',
  accentColor: '#ffcc44',
  specialColor: '#ffaa22',
  specialGlow: '#ff8800',
  portrait: '安',
  pixelPortrait: andyPortrait,
  winQuotes: ['这就是不知火流的实力。', '还得更加努力修行。', '哥哥，我追上你了！'],

  stats: {
    walkSpeed: 4.2,
    runSpeed: 7.0,
    jumpVelocity: -14.2,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 980,
    pushWidth: 58,
    jumpForwardSpeed: 5.0,
    closeRange: 78,
    throwRange: 98,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 忍者紧凑站姿 — 双手护于胸前，一脚微前
      pose({ head: bone(0, 0, -0.02), body: bone(0, 0, 0.05), armFront: bone(10, 12, 0.3), armBack: bone(-6, 10, -0.45), legFront: bone(6, 0, 0.08), legBack: bone(-5, 0, -0.06) }),
      // 帧1: 吸气 — 轻微上移
      pose({ head: bone(0, -1, -0.02), armFront: bone(9, 10, 0.28), armBack: bone(-6, 9, -0.43), legFront: bone(6, -1, 0.1), legBack: bone(-5, -1, -0.05), body: bone(0, -1) }),
      // 帧2: 巅峰 — 忍者气息凝聚
      pose({ head: bone(0, -2, -0.03), armFront: bone(8, 9, 0.25), armBack: bone(-7, 8, -0.48), legFront: bone(5, -1, 0.12), legBack: bone(-5, -1, -0.04), body: bone(0, -2) }),
      // 帧3: 过渡 — 放松
      pose({ head: bone(0, -1, -0.02), armFront: bone(10, 11, 0.28), armBack: bone(-6, 9, -0.44), legFront: bone(6, -1, 0.09), legBack: bone(-5, -1, -0.05), body: bone(0, -1) }),
      // 帧4: 呼气 — 微下沉
      pose({ head: bone(0, 1, 0.01), armFront: bone(11, 14, 0.32), armBack: bone(-5, 12, -0.42), legFront: bone(6, 1, 0.06), legBack: bone(-5, 1, -0.08), body: bone(0, 1) }),
      // 帧5: 呼气完成
      pose({ head: bone(0, 1, 0.02), armFront: bone(11, 15, 0.34), armBack: bone(-5, 13, -0.4), legFront: bone(6, 1, 0.05), legBack: bone(-5, 1, -0.09), body: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(9, -2, 0.2), legBack: bone(-4, 2, -0.16), armFront: bone(9, 14, 0.22), armBack: bone(-6, 12, -0.38) }),
      pose({ legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(10, 12, 0.3), armBack: bone(-6, 11, -0.45) }),
      pose({ legFront: bone(5, 2, -0.16), legBack: bone(-9, -2, 0.2), armFront: bone(10, 14, 0.32), armBack: bone(-5, 13, -0.4) }),
      pose({ legFront: bone(6, 0, -0.06), legBack: bone(-5, 0, 0.04), armFront: bone(10, 12, 0.28), armBack: bone(-6, 11, -0.44) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(6, 0, 0.2), armFront: bone(-4, 18, -0.75), armBack: bone(10, 20, 0.5), legFront: bone(12, -4, 0.42), legBack: bone(-7, 4, -0.32) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-2, 14, -0.4), armBack: bone(7, 22, 0.25), legFront: bone(8, 4, 0.16), legBack: bone(-11, -4, 0.4) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 16, 0.06),
      head: bone(0, 12),
      armFront: bone(8, 20, 0.08),
      armBack: bone(-6, 18, -0.22),
      legFront: bone(10, 0, 0.45),
      legBack: bone(-7, 0, -0.35),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.38), armBack: bone(0, 6, -0.58) }),
      pose({ armFront: bone(2, 10, -0.42), armBack: bone(-1, 8, -0.62), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.14), head: bone(-2, 2, -0.18), armFront: bone(-2, 22, 0.5), armBack: bone(-8, 18, 0.6) }),
      pose({ body: bone(-7, 2, -0.22), head: bone(-4, 3, -0.28), armFront: bone(0, 25, 0.6), armBack: bone(-10, 20, 0.75) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-1, 1, -0.1), armFront: bone(-4, 18, 0.4), armBack: bone(-6, 16, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      body: bone(0, -4, -0.04),
      armFront: bone(10, 8, 0.28),
      armBack: bone(-6, 6, -0.22),
      legFront: bone(4, -3, 0.22),
      legBack: bone(-5, 0, -0.32),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.04), body: bone(3, 0, 0.1), armFront: bone(16, 4, 0.12, 0.95), armBack: bone(-6, 10, -0.5, 0.85), legFront: bone(6, 0, 0.08), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.06), body: bone(5, 0, 0.16), armFront: bone(24, 6, -0.08, 1.15), armBack: bone(-6, 10, -0.5, 0.85), legFront: bone(8, 0, 0.14), legBack: bone(-7, 0, -0.16) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 7, 0.06), body: bone(2, 10, 0.1), armFront: bone(14, 8, 0.06, 0.95), armBack: bone(-5, 16, -0.45, 0.8), legFront: bone(14, 3, 0.3, 1.0), legBack: bone(-8, 8, -0.2) }),
      pose({ head: bone(3, 8, 0.1), body: bone(4, 12, 0.14), armFront: bone(22, 10, -0.08, 1.1), armBack: bone(-5, 16, -0.45, 0.8), legFront: bone(18, 4, 0.38, 1.08), legBack: bone(-8, 8, -0.24) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(14, -2, -0.1, 0.95), armBack: bone(-6, 2, -0.2, 0.8), legFront: bone(12, 4, 0.3, 1.0), legBack: bone(-5, -2, -0.2) }),
      pose({ head: bone(2, -2, -0.08), body: bone(4, 0, 0.14), armFront: bone(20, -4, -0.18, 1.12), armBack: bone(-6, 2, -0.2, 0.8), legFront: bone(16, 5, 0.38, 1.1), legBack: bone(-5, -2, -0.24) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(18, 3, 0.05, 1.08), armBack: bone(14, 5, -0.1, 0.95), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(3, 1, 0.05), body: bone(6, 0, 0.18), armFront: bone(26, 4, -0.06, 1.25), armBack: bone(18, 6, -0.12, 1.1), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
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
      armFront: bone(8, 5, 0.18),
      armBack: bone(-5, 4, -0.25),
      legFront: bone(5, 3, 0.12),
      legBack: bone(-6, 2, -0.18),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.08),
      armFront: bone(6, 4, 0.52),
      armBack: bone(-10, 2, -0.18),
      legFront: bone(-2, -8, 0.42),
      legBack: bone(8, -3, -0.52),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(4, 25, 0.55),
      armFront: bone(-4, 27, 0.35),
      armBack: bone(8, 22, -0.42),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(5, 24, 0.38),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(10, 10, 0.42),
      armBack: bone(-7, 8, -0.3),
      legFront: bone(6, -6, 0.32),
      legBack: bone(-6, -4, -0.42),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -4, -0.02),
      armFront: bone(9, 6, 0.25),
      armBack: bone(-6, 4, -0.2),
      legFront: bone(5, -3, 0.16),
      legBack: bone(-5, -1, -0.25),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.55),
      head: bone(-4, 22, -0.48),
      armFront: bone(5, 23, 0.28),
      armBack: bone(-7, 20, -0.38),
      legFront: bone(5, 18, -0.18),
      legBack: bone(-5, 21, 0.28),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.48),
      armBack: bone(-2, 6, -0.62),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
    [FighterState.MAX_MODE]: pose({
      head: bone(0, -3, -0.05),
      body: bone(0, -2, 0.05),
      armFront: bone(12, 8, 0.5, 1.1),
      armBack: bone(-8, 6, -0.6, 1.1),
    }),
  },

  proportions: {
    headW: 34, headH: 34,
    torsoW: 40, torsoH: 62,
    armW: 14, armH: 48,
    legW: 18, legH: 58,
    shoulderY: 16, hipY: 60,
    torsoCenterY: 32, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Cho Reppa Dan (超裂破弾)
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_CHO_REPPA_DAN;

    // DP+P → Shouryuu Dan (昇龍弾, 弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.ANDY_SHOURYUU_DAN_C : AttackType.ANDY_SHOURYUU_DAN;
    }

    // HCF+K → Zan'ei Ryuusei Ken (斬影流星拳, 弱K/强K区分)
    // HCF = ←↙↓↘→, detected via hasHCB (reversed direction from facing)
    if (input.kickPressed && cmdBuf.hasHCB(tick)) {
      return input.buttonDPressed ? AttackType.ANDY_ZANEI_RYUSEI_KEN_D : AttackType.ANDY_ZANEI_RYUSEI_KEN;
    }

    // QCB+K → Geki Hishou Ken (激飛翔拳, air dive)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.ANDY_GEKI_HISHOU_KEN;
    }

    // QCF+P → Hishou Ken (飛翔拳, energy projectile, 弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.ANDY_HISHOU_KEN_C : AttackType.ANDY_HISHOU_KEN;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;

    // →+A Uwa Agito (上顎, overhead)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.ANDY_UWA_AGITO;
    // →+B Gedan Agito (下顎, low)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.ANDY_GEDAN_AGITO;

    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Hishou Ken: spawn projectile
    if ((attackType === AttackType.ANDY_HISHOU_KEN || attackType === AttackType.ANDY_HISHOU_KEN_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 55, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Shouryuu Dan: rise (weak)
    if (attackType === AttackType.ANDY_SHOURYUU_DAN) {
      fighter.vy = -7;
      return true;
    }
    // Shouryuu Dan: rise (strong, higher)
    if (attackType === AttackType.ANDY_SHOURYUU_DAN_C) {
      fighter.vy = -9;
      return true;
    }
    // Zan'ei Ryuusei Ken: dash forward
    if (attackType === AttackType.ANDY_ZANEI_RYUSEI_KEN) {
      fighter.vx = 5 * fighter.facing;
      return true;
    }
    // Zan'ei Ryuusei Ken D: long dash
    if (attackType === AttackType.ANDY_ZANEI_RYUSEI_KEN_D) {
      fighter.vx = 7 * fighter.facing;
      return true;
    }
    // Geki Hishou Ken: aerial dive
    if (attackType === AttackType.ANDY_GEKI_HISHOU_KEN) {
      fighter.vy = -2;
      fighter.vx = 4 * fighter.facing;
      return true;
    }
    // DM Cho Reppa Dan: multi-hit rising uppercut
    if (attackType === AttackType.DM_CHO_REPPA_DAN) {
      fighter.vy = -10;
      fighter.vx = 3 * fighter.facing;
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
