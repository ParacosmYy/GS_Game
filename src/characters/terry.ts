/**
 * 特瑞·博加德 (Terry Bogard) — 角色定义
 *
 * 必杀技:
 *   QCF+P   → Power Wave (fireball)
 *   QCB+P   → Burn Knuckle
 *   QCB+K   → Crack Shot (overhead)
 *   DP+P    → Rising Tackle (upper)
 * DM: QCF×2+P → Power Geyser
 */
import type { CharacterDefinition } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';

export const TerryDef: CharacterDefinition = {
  id: 'terry',
  name: 'Terry Bogard',
  nameCn: '特瑞',
  color: '#cc8800',
  accentColor: '#ddaa22',
  specialColor: '#ffcc00',
  specialGlow: '#ffaa00',
  portrait: '🎩',

  routeSpecial(input, cmdBuf, tick) {
    const special = cmdBuf.checkSpecial(tick, true);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.SPECIAL_UPPER;

    // QCB+P → Burn Knuckle (before fireball)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.TERRY_BURN_KNUCKLE;
    }
    // QCB+K → Crack Shot
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.TERRY_CRACK_SHOT;
    }

    // QCF+P → Power Wave (fireball)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.SPECIAL_PROJECTILE;
    return null;
  },

  routeNormal(_input, _state, _isCloseRange) {
    return null; // uses default routing
  },

  routeRekkaFollowup() {
    return null; // no rekka chains
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
      fighter.vy = -8;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },
};
