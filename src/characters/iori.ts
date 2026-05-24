/**
 * 八神庵 (Iori Yagami) — 角色定义
 *
 * 必杀技:
 *   QCF+P  → 百八式·暗拂 (fireball)
 *   QCB+P  → 葵花 (rekka 3-hit)
 *   DP+P   → 百式·鬼焼き (升龙)
 * DM: HCB×2+P → 八稚女
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { ioriPortrait } from '../rendering/portraits/ioriPortrait.js';

export const IoriDef: CharacterDefinition = {
  id: 'iori',
  name: 'Iori Yagami',
  nameCn: '八神庵',
  color: '#aa1133',
  accentColor: '#cc3355',
  specialColor: '#8800cc',
  specialGlow: '#aa22ff',
  portrait: '🌙',
  pixelPortrait: ioriPortrait,

  stats: {
    walkSpeed: 4.5,
    runSpeed: 7.5,
    jumpVelocity: -13.5,
    hopVelocity: -10.5,
    hyperJumpVelocity: -16.5,
    maxHealth: 950,
    pushWidth: 58,
    jumpForwardSpeed: 5.5,
  },

  poses: {
    [FighterState.IDLE]: pose({
      armFront: bone(6, 18, 0.5),
      armBack: bone(-10, 12, -0.7),
      legFront: bone(5, 0, 0.05),
      legBack: bone(-5, 0, -0.15),
    }),
    [FighterState.WALK]: [
      pose({ legFront: bone(9, -3, 0.25), legBack: bone(-4, 3, -0.2), armFront: bone(5, 22, 0.3), armBack: bone(-6, 18, -0.5) }),
      pose({ legFront: bone(7, 0, 0.15), legBack: bone(-5, 0, -0.1), armFront: bone(6, 20, 0.35), armBack: bone(-8, 17, -0.55) }),
      pose({ legFront: bone(4, 3, -0.2), legBack: bone(-9, -3, 0.25), armFront: bone(5, 18, 0.4), armBack: bone(-7, 19, -0.5) }),
      pose({ legFront: bone(6, 0, -0.1), legBack: bone(-6, 0, 0.1), armFront: bone(5, 21, 0.32), armBack: bone(-8, 16, -0.58) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(7, 0, 0.2), armFront: bone(-4, 20, -0.8), armBack: bone(12, 22, 0.5), legFront: bone(12, -5, 0.5), legBack: bone(-8, 5, -0.35) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-2, 16, -0.5), armBack: bone(8, 26, 0.25), legFront: bone(8, 5, 0.2), legBack: bone(-12, -5, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.08),
      head: bone(0, 15),
      armFront: bone(6, 24, 0.3),
      armBack: bone(-5, 20, -0.5),
      legFront: bone(9, 0, 0.45),
      legBack: bone(-7, 0, -0.35),
    }),
    [FighterState.BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-1, 6, -0.7),
    }),
    [FighterState.HITSTUN]: pose({
      body: bone(-6, 0, -0.2),
      head: bone(-4, 3, -0.25),
    }),
    [FighterState.KNOCKDOWN]: pose({
      body: bone(0, 30, 1.4),
      head: bone(10, 35, 1.2),
      legFront: bone(-10, 30, -0.3),
      legBack: bone(8, 32, 0.4),
    }),
    [FighterState.JUMP]: pose({
      armFront: bone(8, 8, 0.5),
      armBack: bone(-10, 6, -0.4),
      legFront: bone(3, -5, 0.25),
      legBack: bone(-6, 0, -0.5),
    }),
    // — Attack poses (claw-like hands, hunched, extreme arm rotations) —
    [FighterState.STAND_ATTACK]: pose({
      head: bone(4, -2, 0.1),
      body: bone(5, 0, 0.15),
      armFront: bone(28, 0, -0.3, 1.4),    // claw swipe - wider rotation
      armBack: bone(-12, 5, -1.0, 0.9),     // extreme back rotation
      legFront: bone(5, 0, 0.1),
      legBack: bone(-6, 0, -0.15),
    }),
    [FighterState.CROUCH_ATTACK]: pose({
      head: bone(5, 10, 0.15),
      body: bone(5, 14, 0.2),               // hunched forward
      armFront: bone(26, 14, -0.35, 1.35),  // claw extended low
      armBack: bone(-10, 18, -0.8, 0.9),
      legFront: bone(16, 6, 0.35, 1.1),
      legBack: bone(-10, 10, -0.25),
    }),
    [FighterState.AIR_ATTACK]: pose({
      head: bone(2, -3, -0.12),
      body: bone(3, -1, 0.18),
      armFront: bone(24, -5, -0.4, 1.35),   // claw swipe aerial
      armBack: bone(-15, 2, -0.7, 0.9),
      legFront: bone(16, 5, 0.4, 1.15),
      legBack: bone(-10, -4, -0.4),
    }),
    [FighterState.THROW]: pose({
      head: bone(5, -1, 0.08),
      body: bone(7, 0, 0.2),
      armFront: bone(30, 4, -0.2, 1.4),     // both claws reaching
      armBack: bone(22, 6, -0.35, 1.2),
      legFront: bone(5, 0, 0.1),
      legBack: bone(-5, 0, -0.12),
    }),
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-4, 4, -0.25),
      body: bone(-3, 3, -0.12),
      armFront: bone(-8, 14, 0.5),           // arms drooping, claw-like
      armBack: bone(-12, 12, 0.4),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-4, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.05),
      body: bone(0, -1, 0),
      armFront: bone(8, 5, 0.2),
      armBack: bone(-8, 4, -0.35),
      legFront: bone(4, 3, 0.15),
      legBack: bone(-6, 2, -0.25),
    }),
  },

  routeSpecial(input, cmdBuf, tick) {
    // DM: QCF×2+P → 八稚女
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_YATAGARASU;

    // DP+P → 鬼焼き (Iori-specific)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.IORI_ONIYAKI;

    // HCB+K → 琴月陰 (dash attack)
    if (input.kickPressed && cmdBuf.hasHCB(tick)) {
      return AttackType.IORI_KOTOTSUKI;
    }

    // QCB+P → 葵花 (before fireball)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.IORI_AOIHANA;
    }

    // QCF+P → 闇払い (Iori-specific fireball)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.IORI_YAMIBARAI;

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    if (isAir && input.buttonCPressed && input.down) return AttackType.CMD_NARAKU;
    if (state === FighterState.CROUCH && input.buttonBPressed && input.forward && input.down) {
      return AttackType.CMD_88SHIKI;
    }
    return null;
  },

  routeRekkaFollowup(input, _cmdBuf, _tick, currentAttack) {
    if (currentAttack === AttackType.IORI_AOIHANA && input.punchPressed) {
      return AttackType.IORI_AOIHANA_2;
    }
    if (currentAttack === AttackType.IORI_AOIHANA_2 && input.punchPressed) {
      return AttackType.IORI_AOIHANA_3;
    }
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 闇払い: spawn projectile
    if (attackType === AttackType.IORI_YAMIBARAI && fighter.attackFrame === 0) {
      const data = FRAME_DATA.IORI_YAMIBARAI;
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // 鬼焼き: rise
    if (attackType === AttackType.IORI_ONIYAKI) {
      fighter.vy = -7;
      return true;
    }
    // 琴月陰: dash forward
    if (attackType === AttackType.IORI_KOTOTSUKI) {
      fighter.vx = 8 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain(attackType) {
    if (attackType === AttackType.IORI_AOIHANA) return 'aoihana';
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
