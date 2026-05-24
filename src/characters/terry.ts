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
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { AttackType, FighterState } from '../core/types.js';
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

  poses: {
    [FighterState.IDLE]: pose({
      armFront: bone(12, 18, 0.15),
      armBack: bone(-6, 16, -0.35),
      legFront: bone(5, 0, 0.08),
      legBack: bone(-5, 0, -0.08),
    }),
    [FighterState.WALK]: pose({
      armFront: bone(10, 20, 0.1),
      armBack: bone(-5, 18, -0.3),
      legFront: bone(8, 0, 0.18),
      legBack: bone(-3, 0, -0.12),
    }),
    [FighterState.RUN]: pose({
      body: bone(7, 0, 0.18),
      armFront: bone(-6, 22, -0.9),
      armBack: bone(14, 26, 0.6),
      legFront: bone(13, 0, 0.45),
      legBack: bone(-9, 0, -0.35),
    }),
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.05),
      head: bone(0, 14),
      armFront: bone(10, 22, 0.05),
      armBack: bone(-7, 20, -0.15),
      legFront: bone(10, 0, 0.5),
      legBack: bone(-8, 0, -0.4),
    }),
    [FighterState.BLOCK]: pose({
      armFront: bone(4, 10, -0.35),
      armBack: bone(1, 8, -0.55),
    }),
    [FighterState.HITSTUN]: pose({
      body: bone(-4, 0, -0.12),
      head: bone(-2, 2, -0.18),
    }),
    [FighterState.KNOCKDOWN]: pose({
      body: bone(0, 30, 1.4),
      head: bone(10, 35, 1.2),
      legFront: bone(-10, 30, -0.3),
      legBack: bone(8, 32, 0.4),
    }),
    [FighterState.JUMP]: pose({
      armFront: bone(12, 10, 0.3),
      armBack: bone(-7, 8, -0.25),
      legFront: bone(4, -3, 0.2),
      legBack: bone(-5, 0, -0.35),
    }),
  },

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
