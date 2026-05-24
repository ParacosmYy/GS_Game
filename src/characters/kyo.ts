/**
 * 草薙京 (Kyo Kusanagi) — 角色定义
 *
 * 必杀技:
 *   QCF+A  → 114式·荒咬み (rekka starter)
 *   QCF+C  → 115式·毒咬み (rekka starter)
 *   QCF+K  → 75式·改 (两段踢)
 *   QCB+K  → R.E.D. Kick (高段踢)
 *   DP+P   → 鬼焼き (升龙, 通用)
 *
 * 连段:
 *   荒咬み → QCF+P(九傷) / HCB+P(八錆)
 *   毒咬み → HCB+P(罪詠み) → f+P(罰詠み)
 *
 * 命令通常技:
 *   →+B  → 轟斧陽 (overhead)
 *   ↘+D  → 八拾八式 (low)
 *   air↓+C → 奈落落とし (KD)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import type { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { kyoPortrait } from '../rendering/portraits/kyoPortrait.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { FRAME_DATA } from '../core/constants.js';

const REKKA_WINDOW = 20;

export const KyoDef: CharacterDefinition = {
  id: 'kyo',
  name: 'Kyo Kusanagi',
  nameCn: '草薙京',
  color: '#ff6600',
  accentColor: '#ffaa00',
  specialColor: '#ff4400',
  specialGlow: '#ff6600',
  portrait: '🔥',
  pixelPortrait: kyoPortrait,
  winQuotes: ['まだまだだな', '俺の炎に焼かれる覚悟はできたか?', '草薙の拳、見せてやるよ'],

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
    // 6帧呼吸待机 — 包含重心微移、手臂微动、头部摆动
    // 帧序：中立 → 吸气(重心略升) → 呼气过渡 → 呼气(重心略降/微后倾) → 回升过渡 → 微前倾 → 回中
    [FighterState.IDLE]: [
      // 帧0: 中立站姿 — 基准帧，双手自然下垂
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(10, 20, 0.3), armBack: bone(-8, 15, -0.5), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
      // 帧1: 吸气 — 身体微升，头微抬，前臂略收，后臂略开，重心微前
      pose({ head: bone(0.5, -2, -0.03), body: bone(0, -2), armFront: bone(9, 18, 0.25), armBack: bone(-9, 14, -0.55), legFront: bone(6, -1, 0.12), legBack: bone(-6, 1, -0.08) }),
      // 帧2: 吸气顶点 — 最大升高，头最高，前臂进一步收紧，重心最前
      pose({ head: bone(0.3, -3, -0.04), body: bone(0.5, -3), armFront: bone(8, 16, 0.22), armBack: bone(-10, 13, -0.58), legFront: bone(7, -1, 0.14), legBack: bone(-5, 1, -0.06) }),
      // 帧3: 呼气过渡 — 开始下沉，头前倾微点，手臂开始放松
      pose({ head: bone(0.8, -1, 0.02), body: bone(0, -1), armFront: bone(10, 19, 0.28), armBack: bone(-8, 15, -0.5), legFront: bone(6, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
      // 帧4: 呼气 — 身体微沉，头微低，重心微后移，前臂微外展，后臂放松
      pose({ head: bone(-0.5, 2, 0.05), body: bone(-0.5, 2), armFront: bone(11, 22, 0.35), armBack: bone(-7, 17, -0.45), legFront: bone(5, 1, 0.08), legBack: bone(-7, -1, -0.12) }),
      // 帧5: 呼气底点 — 最大下沉，后倾最明显，手臂最放松
      pose({ head: bone(-0.8, 3, 0.06), body: bone(-0.8, 3), armFront: bone(12, 24, 0.38), armBack: bone(-6, 18, -0.42), legFront: bone(5, 2, 0.06), legBack: bone(-7, -1, -0.14) }),
    ],
    [FighterState.WALK]: [
      // 4帧走步循环 — 腿交替前后摆动
      pose({ legFront: bone(8, -3, 0.25), legBack: bone(-5, 3, -0.2), armFront: bone(8, 22, 0.2), armBack: bone(-6, 18, -0.4) }),
      pose({ legFront: bone(7, 0, 0.15), legBack: bone(-4, 0, -0.1), armFront: bone(9, 20, 0.25), armBack: bone(-7, 19, -0.45) }),
      pose({ legFront: bone(5, 3, -0.2), legBack: bone(-8, -3, 0.25), armFront: bone(10, 18, 0.3), armBack: bone(-5, 20, -0.35) }),
      pose({ legFront: bone(6, 0, -0.1), legBack: bone(-6, 0, 0.1), armFront: bone(9, 21, 0.22), armBack: bone(-6, 17, -0.42) }),
    ],
    [FighterState.RUN]: [
      // 2帧跑步循环 — 更大幅度
      pose({ body: bone(8, 0, 0.2), armFront: bone(-5, 22, -1.0), armBack: bone(15, 20, 0.6), legFront: bone(14, -5, 0.5), legBack: bone(-10, 5, -0.4) }),
      pose({ body: bone(5, 0, 0.1), armFront: bone(-3, 18, -0.6), armBack: bone(10, 28, 0.3), legFront: bone(10, 5, 0.2), legBack: bone(-14, -5, 0.5) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.1),
      head: bone(0, 15),
      armFront: bone(8, 25, 0.1),
      armBack: bone(-6, 22, -0.2),
      legFront: bone(10, 0, 0.5),
      legBack: bone(-8, 0, -0.4),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 10, -0.4), armBack: bone(0, 8, -0.6), legFront: bone(3, 0, 0.05), legBack: bone(-3, 0, -0.05) }),
      pose({ armFront: bone(2, 12, -0.45), armBack: bone(-1, 10, -0.65), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-5, 0, -0.15), head: bone(-3, 2, -0.2), armFront: bone(0, 25, 0.6), armBack: bone(-10, 20, 0.8) }),
      pose({ body: bone(-8, 2, -0.25), head: bone(-5, 3, -0.3), armFront: bone(2, 28, 0.7), armBack: bone(-12, 22, 0.9) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-2, 1, -0.12), armFront: bone(-2, 23, 0.5), armBack: bone(-8, 18, 0.7) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), armFront: bone(-5, 35, 0.8), armBack: bone(15, 30, -0.6), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      body: bone(0, -5, -0.05),
      armFront: bone(10, 10, 0.4),
      armBack: bone(-8, 8, -0.3),
      legFront: bone(5, -5, 0.3),
      legBack: bone(-5, 0, -0.4),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-5, -8, -0.1),
      armFront: bone(5, 5, 0.6),
      armBack: bone(-12, 3, -0.2),
      legFront: bone(-2, -8, 0.5),
      legBack: bone(8, -3, -0.6),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 25, 0.8),
      head: bone(5, 28, 0.6),
      armFront: bone(-3, 30, 0.4),
      armBack: bone(8, 25, -0.5),
      legFront: bone(-8, 28, -0.3),
      legBack: bone(5, 27, 0.5),
    }),
    // — Attack poses (aggressive forward lean, wider arm swings) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, 1, 0.05), body: bone(4, 0, 0.12), armFront: bone(18, 6, 0.2, 1.0), armBack: bone(-12, 10, -0.9, 0.85), legFront: bone(6, 0, 0.08), legBack: bone(-6, 0, -0.12) }),
      pose({ head: bone(4, 2, 0.08), body: bone(6, 0, 0.18), armFront: bone(28, 8, -0.15, 1.3), armBack: bone(-12, 10, -0.9, 0.85), legFront: bone(8, 0, 0.12), legBack: bone(-8, 0, -0.15) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(3, 9, 0.08), body: bone(3, 12, 0.15), armFront: bone(18, 10, 0.1, 1.0), armBack: bone(-10, 18, -0.7, 0.85), legFront: bone(14, 3, 0.3, 1.0), legBack: bone(-10, 10, -0.25) }),
      pose({ head: bone(4, 10, 0.12), body: bone(4, 14, 0.2), armFront: bone(24, 12, -0.25, 1.2), armBack: bone(-10, 18, -0.7, 0.85), legFront: bone(18, 5, 0.35, 1.1), legBack: bone(-10, 10, -0.25) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -2, -0.05), body: bone(2, 0, 0.1), armFront: bone(16, -4, -0.2, 1.1), armBack: bone(-14, 2, -0.6, 0.85), legFront: bone(14, 4, 0.35, 1.1), legBack: bone(-10, -3, -0.35) }),
      pose({ head: bone(2, -3, -0.1), body: bone(4, 0, 0.2), armFront: bone(22, -6, -0.35, 1.25), armBack: bone(-14, 2, -0.6, 0.85), legFront: bone(18, 6, 0.45, 1.2), legBack: bone(-10, -3, -0.35) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(3, 1, 0.04), body: bone(5, 0, 0.14), armFront: bone(22, 4, 0.1, 1.2), armBack: bone(18, 6, -0.2, 1.1), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.14) }),
      pose({ head: bone(4, 2, 0.06), body: bone(8, 0, 0.2), armFront: bone(30, 5, -0.1, 1.4), armBack: bone(22, 8, -0.25, 1.2), legFront: bone(6, 0, 0.12), legBack: bone(-6, 0, -0.18) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-4, 4, -0.22),
      body: bone(-3, 3, -0.12),
      armFront: bone(-6, 14, 0.45),
      armBack: bone(-10, 12, 0.35),
      legFront: bone(3, 0, 0.06),
      legBack: bone(-5, 0, -0.06),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.05),
      body: bone(0, -1, 0),
      armFront: bone(10, 6, 0.25),
      armBack: bone(-6, 5, -0.35),
      legFront: bone(6, 4, 0.18),
      legBack: bone(-6, 3, -0.22),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.08),
      armFront: bone(12, 12, 0.5),
      armBack: bone(-10, 10, -0.4),
      legFront: bone(8, -8, 0.4),
      legBack: bone(-8, -5, -0.5),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -5, -0.04),
      armFront: bone(12, 8, 0.35),
      armBack: bone(-10, 6, -0.3),
      legFront: bone(6, -4, 0.25),
      legBack: bone(-6, -2, -0.35),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.6),
      head: bone(-5, 23, -0.5),
      armFront: bone(5, 28, 0.3),
      armBack: bone(-8, 25, -0.4),
      legFront: bone(6, 22, -0.2),
      legBack: bone(-5, 24, 0.3),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  proportions: {
    headW: 44, headH: 44,
    torsoW: 56, torsoH: 68,
    armW: 22, armH: 48,
    legW: 26, legH: 60,
    shoulderY: 16, hipY: 60,
    torsoCenterY: 34, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → 大蛇薙
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_OROCHINAGI;

    // Dragon Punch →↓↘+P → 鬼焼き (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.KYO_ONIYAKI_C : AttackType.KYO_ONIYAKI;
    }

    // 荒咬み: QCF+A
    if (cmdBuf.hasQCF(tick) && input.buttonAPressed) return AttackType.KYO_ARAGAMI;
    // 毒咬み: QCF+C
    if (cmdBuf.hasQCF(tick) && input.buttonCPressed) return AttackType.KYO_DOKUGAMI;

    // 75式改 / R.E.D. Kick: QCF+K / QCB+K
    if (input.kickPressed) {
      return cmdBuf.checkKickSpecial(tick, input.kickPressed);
    }

    // Fireball fallback: QCF+P → 闇払い (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.KYO_YAMIBARAI_C : AttackType.KYO_YAMIBARAI;
    }

    return null;
  },

  routeNormal(input, state, isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    if (isAir) {
      // 奈落落とし: 空中↓+C
      if (input.buttonCPressed && input.down) return AttackType.CMD_NARAKU;
      return null; // default air routing
    }

    if (state === FighterState.CROUCH) {
      // 八拾八式: ↘+D (from crouch)
      if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;
      return null;
    }

    // 轟斧陽: →+B
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CMD_GOFU_YOU;
    // 八拾八式: ↘+D
    if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;

    return null; // default stand routing (close/far handled by controller)
  },

  routeRekkaFollowup(input, cmdBuf, tick, currentAttack) {
    // 75式改 第二段: K during recovery
    if (currentAttack === AttackType.KYO_75KAI && input.kickPressed) {
      return AttackType.KYO_75KAI_2;
    }

    // 荒咬み连段
    if (currentAttack === AttackType.KYO_ARAGAMI) {
      const qcf = cmdBuf.checkRekkaFollowQCF(tick, true);
      if (qcf) return qcf;
      const hcb = cmdBuf.checkRekkaFollowHCB(tick, true);
      if (hcb) return hcb;
    }

    // 九傢 followups
    if (currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU) {
      if (cmdBuf.hasQCF(tick) && input.kickPressed) return AttackType.KYO_NANASE;
      if (input.punchPressed) return AttackType.KYO_KOTO_TSUKI;
    }

    // 八锊 followups — QCF+P takes priority over plain P
    if (currentAttack === AttackType.KYO_ARAGAMI_YANOSABI) {
      if (cmdBuf.hasQCF(tick) && input.punchPressed) return AttackType.KYO_KOTO_TSUKI;
      if (input.punchPressed) return AttackType.KYO_YAKISOGI;
    }

    // 毒咬み连段
    if (currentAttack === AttackType.KYO_DOKUGAMI) {
      return cmdBuf.checkDokugamiFollow(tick, true);
    }

    // 罪詠み → 罰詠み
    if (currentAttack === AttackType.KYO_TSUMIYOMI) {
      if (cmdBuf.checkBatsuyomiInput(input.forward, input.punchPressed)) {
        return AttackType.KYO_BATSUYOMI;
      }
    }

    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 闇払い: spawn projectile (weak/strong share same logic)
    if ((attackType === AttackType.KYO_YAMIBARAI || attackType === AttackType.KYO_YAMIBARAI_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 鬼焼き: rise (invincible startup)
    if (attackType === AttackType.KYO_ONIYAKI) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.KYO_ONIYAKI_C) {
      fighter.vy = -8;
      return true;
    }
    // R.E.D. Kick: rise + forward
    if (attackType === AttackType.KYO_RED_KICK) {
      fighter.vy = -4;
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain(attackType) {
    if (attackType === AttackType.KYO_ARAGAMI) return 'aragami';
    if (attackType === AttackType.KYO_DOKUGAMI) return 'dokugami';
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
