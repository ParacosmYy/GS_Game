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
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';

export const IoriDef: CharacterDefinition = {
  id: 'iori',
  name: 'Iori Yagami',
  nameCn: '八神庵',
  color: '#aa1133',
  accentColor: '#cc3355',
  portrait: '🌙',

  routeSpecial(input, cmdBuf, tick) {
    // DP+P → upper
    const special = cmdBuf.checkSpecial(tick, true);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.SPECIAL_UPPER;

    // QCB+P → 葵花 (before fireball)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.IORI_AOIHANA;
    }

    // QCF+P → 暗拂 (fireball)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.SPECIAL_PROJECTILE;

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
    if (attackType === AttackType.SPECIAL_PROJECTILE && fighter.attackFrame === 0) {
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        FRAME_DATA.SPECIAL_PROJECTILE.active, playerIndex,
      ));
      return true;
    }
    if (attackType === AttackType.SPECIAL_UPPER) {
      fighter.vy = -7;
      return true;
    }
    return false;
  },

  getRekkaChain(attackType) {
    if (attackType === AttackType.IORI_AOIHANA) return 'aoihana';
    return null;
  },
};
