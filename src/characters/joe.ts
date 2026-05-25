/**
 * 乔·东 (Joe Higashi) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Hurricane Upper (飞行道具, A快/C强)
 *   DP+K    → Tiger Kick (升龙对空, B快/D强无敌)
 *   QCB+P   → Bakuretsuken (爆裂拳, 连打追加)
 *   QCB+K   → Ougon no Kakato (黄金之踵, 跳跃下蹴)
 * DM: QCFx2+P → Screw Upper (超大型龙卷风飞行道具)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { AttackType, FighterState } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { joePortrait } from '../rendering/portraits/joePortrait.js';

export const JoeDef: CharacterDefinition = {
  id: 'joe',
  name: 'Joe Higashi',
  nameCn: '乔·东',
  color: '#ff8800',
  accentColor: '#ffaa22',
  specialColor: '#ff8800',
  specialGlow: '#ff6600',
  portrait: '🥊',
  pixelPortrait: joePortrait,
  winQuotes: ['我是无敌的！', '安雅！这就是泰拳的力量！', '还差得远呢！'],

  stats: {
    walkSpeed: 4.0,
    runSpeed: 7.0,
    jumpVelocity: -14,
    hopVelocity: -9.5,
    hyperJumpVelocity: -17,
    maxHealth: 1000,
    pushWidth: 62,
    jumpForwardSpeed: 5.0,
    closeRange: 80,
    throwRange: 100,
  },

  poses: {
    [FighterState.IDLE]: [
      // 帧0: 泰拳站姿 — 双拳高抬，一腿微前，重心略偏后
      pose({ head: bone(0, 0, 0.03), body: bone(0, 0, 0.06), armFront: bone(12, 10, 0.35), armBack: bone(-8, 12, -0.45), legFront: bone(8, 0, 0.15), legBack: bone(-6, 0, -0.08) }),
      // 帧1: 吸气 — 微微上抬
      pose({ head: bone(0, -1, 0.02), body: bone(0, -1, 0.04), armFront: bone(11, 8, 0.33), armBack: bone(-8, 10, -0.43), legFront: bone(8, 0, 0.14), legBack: bone(-6, 0, -0.07) }),
      // 帧2: 吸气巅峰 — 泰拳架势更加明显
      pose({ head: bone(0, -2, 0.01), body: bone(0, -2, 0.03), armFront: bone(10, 7, 0.38), armBack: bone(-9, 9, -0.48), legFront: bone(7, -1, 0.16), legBack: bone(-6, 1, -0.06) }),
      // 帧3: 过渡
      pose({ head: bone(0, -1, 0.02), body: bone(0, -1, 0.05), armFront: bone(11, 9, 0.34), armBack: bone(-8, 11, -0.44), legFront: bone(8, 0, 0.15), legBack: bone(-6, 0, -0.07) }),
      // 帧4: 呼气 — 下沉
      pose({ head: bone(0.5, 1, 0.04), body: bone(0.5, 1, 0.07), armFront: bone(13, 12, 0.3), armBack: bone(-7, 14, -0.4), legFront: bone(8, 0, 0.13), legBack: bone(-7, 0, -0.09) }),
      // 帧5: 呼气谷底
      pose({ head: bone(0.5, 2, 0.05), body: bone(0.5, 2, 0.08), armFront: bone(14, 13, 0.28), armBack: bone(-7, 15, -0.38), legFront: bone(9, 0, 0.14), legBack: bone(-7, 0, -0.1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.22), legBack: bone(-4, 2, -0.16), armFront: bone(10, 16, 0.2), armBack: bone(-6, 14, -0.35) }),
      pose({ legFront: bone(7, 0, 0.12), legBack: bone(-5, 0, -0.08), armFront: bone(11, 13, 0.25), armBack: bone(-7, 12, -0.4) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-10, -2, 0.22), armFront: bone(10, 14, 0.22), armBack: bone(-5, 15, -0.32) }),
      pose({ legFront: bone(7, 0, -0.06), legBack: bone(-6, 0, 0.04), armFront: bone(11, 12, 0.24), armBack: bone(-6, 13, -0.38) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(7, 0, 0.2), armFront: bone(-5, 22, -0.85), armBack: bone(12, 24, 0.6), legFront: bone(12, -5, 0.45), legBack: bone(-8, 5, -0.35) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-3, 16, -0.5), armBack: bone(8, 26, 0.3), legFront: bone(8, 5, 0.18), legBack: bone(-12, -5, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.06),
      head: bone(0, 14),
      armFront: bone(10, 20, 0.08),
      armBack: bone(-7, 18, -0.2),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-8, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.4), armBack: bone(0, 6, -0.6) }),
      pose({ armFront: bone(2, 10, -0.45), armBack: bone(-1, 8, -0.65), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.14), head: bone(-2, 2, -0.2), armFront: bone(-2, 22, 0.55), armBack: bone(-8, 18, 0.65) }),
      pose({ body: bone(-7, 2, -0.22), head: bone(-4, 3, -0.3), armFront: bone(0, 25, 0.65), armBack: bone(-10, 20, 0.8) }),
      pose({ body: bone(-3, -1, -0.08), head: bone(-1, 1, -0.12), armFront: bone(-4, 20, 0.45), armBack: bone(-6, 16, 0.55) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), armFront: bone(-5, 35, 0.8), armBack: bone(15, 30, -0.6), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(12, 8, 0.3),
      armBack: bone(-7, 6, -0.25),
      legFront: bone(5, -4, 0.22),
      legBack: bone(-5, 0, -0.32),
    }),
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(3, -1, 0.05), body: bone(3, 0, 0.12), armFront: bone(15, 4, 0.2, 1.1), armBack: bone(-8, 10, -0.5, 0.85), legFront: bone(7, 0, 0.12), legBack: bone(-8, 0, -0.14) }),
      pose({ head: bone(4, 0, 0.08), body: bone(5, 0, 0.16), armFront: bone(28, 8, 0.05, 1.3), armBack: bone(-8, 10, -0.5, 0.85), legFront: bone(9, 0, 0.18), legBack: bone(-9, 0, -0.18) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(3, 7, 0.06), body: bone(2, 10, 0.1), armFront: bone(14, 8, 0.08, 1.0), armBack: bone(-6, 16, -0.45, 0.85), legFront: bone(14, 3, 0.3, 1.05), legBack: bone(-8, 8, -0.2) }),
      pose({ head: bone(4, 8, 0.1), body: bone(4, 12, 0.15), armFront: bone(22, 10, -0.08, 1.2), armBack: bone(-6, 16, -0.45, 0.85), legFront: bone(18, 4, 0.38, 1.1), legBack: bone(-8, 8, -0.25) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(1, -1, -0.05), body: bone(2, 0, 0.1), armFront: bone(14, -2, -0.1, 1.1), armBack: bone(-10, 0, -0.5, 0.85), legFront: bone(12, 3, 0.35, 1.1), legBack: bone(-8, -2, -0.2) }),
      pose({ head: bone(2, -2, -0.1), body: bone(4, 0, 0.16), armFront: bone(20, -4, -0.2, 1.3), armBack: bone(-10, 0, -0.5, 0.85), legFront: bone(16, 5, 0.42, 1.2), legBack: bone(-8, -2, -0.28) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(20, 3, 0.05, 1.2), armBack: bone(14, 5, -0.1, 1.05), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.05), body: bone(6, 0, 0.18), armFront: bone(26, 4, -0.06, 1.35), armBack: bone(18, 6, -0.12, 1.15), legFront: bone(6, 0, 0.12), legBack: bone(-6, 0, -0.12) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.1),
      armFront: bone(-5, 12, 0.35),
      armBack: bone(-7, 10, 0.25),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-5, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(8, 5, 0.18),
      armBack: bone(-5, 4, -0.22),
      legFront: bone(5, 3, 0.12),
      legBack: bone(-6, 2, -0.18),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-4, -8, -0.08),
      armFront: bone(6, 4, 0.5),
      armBack: bone(-10, 2, -0.18),
      legFront: bone(-2, -8, 0.45),
      legBack: bone(8, -3, -0.55),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 22, 0.75),
      head: bone(4, 25, 0.55),
      armFront: bone(-4, 28, 0.35),
      armBack: bone(8, 22, -0.45),
      legFront: bone(-7, 25, -0.25),
      legBack: bone(5, 24, 0.4),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -7, -0.06),
      armFront: bone(10, 10, 0.4),
      armBack: bone(-7, 8, -0.28),
      legFront: bone(7, -6, 0.32),
      legBack: bone(-7, -4, -0.42),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -4, -0.02),
      armFront: bone(10, 6, 0.25),
      armBack: bone(-6, 4, -0.2),
      legFront: bone(5, -3, 0.16),
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
    headW: 36, headH: 36,
    torsoW: 44, torsoH: 60,
    armW: 16, armH: 48,
    legW: 20, legH: 60,
    shoulderY: 14, hipY: 56,
    torsoCenterY: 30, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Screw Upper
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_SCREW_UPPER;

    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);

    // DP+K → Tiger Kick (B/D区分)
    if (special === AttackType.SPECIAL_UPPER && input.kickPressed) {
      return input.buttonDPressed ? AttackType.JOE_TIGER_KICK_D : AttackType.JOE_TIGER_KICK;
    }

    // QCF+P → Hurricane Upper (A/C区分)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.JOE_HURRICANE_C : AttackType.JOE_HURRICANE;
    }

    // QCB+P → Bakuretsuken
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.JOE_BAKURETSUKEN;
    }

    // QCB+K → Ougon no Kakato
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.JOE_OUGON_KAKATO;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A Knee Kick (中段)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.JOE_KNEE_KICK;
    // →+B Slide (下段)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.JOE_SLIDE;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Hurricane Upper: spawn projectile (A/C)
    if ((attackType === AttackType.JOE_HURRICANE || attackType === AttackType.JOE_HURRICANE_C) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Tiger Kick: rise
    if (attackType === AttackType.JOE_TIGER_KICK) {
      fighter.vy = -8;
      return true;
    }
    if (attackType === AttackType.JOE_TIGER_KICK_D) {
      fighter.vy = -10;
      return true;
    }
    // Ougon no Kakato: forward dive
    if (attackType === AttackType.JOE_OUGON_KAKATO) {
      fighter.vy = 4;
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    // Screw Upper: spawn large projectile
    if ((attackType === AttackType.DM_SCREW_UPPER || attackType === AttackType.SDM_SCREW_UPPER) && fighter.attackFrame === 0) {
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 60, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
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
