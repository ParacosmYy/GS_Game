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
import { terryPortrait } from '../rendering/portraits/terryPortrait.js';

export const TerryDef: CharacterDefinition = {
  id: 'terry',
  name: 'Terry Bogard',
  nameCn: '特瑞',
  color: '#cc8800',
  accentColor: '#ddaa22',
  specialColor: '#ffcc00',
  specialGlow: '#ffaa00',
  portrait: '🎩',
  pixelPortrait: terryPortrait,

  stats: {
    walkSpeed: 3.5,
    runSpeed: 6.5,
    jumpVelocity: -14.5,
    hopVelocity: -9.5,
    hyperJumpVelocity: -17.5,
    maxHealth: 1050,
    pushWidth: 64,
    jumpForwardSpeed: 4.5,
  },

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
    // — Attack poses (boxing stance, compact arms, wider legs) —
    [FighterState.STAND_ATTACK]: pose({
      head: bone(3, 1, 0.05),
      body: bone(4, 0, 0.12),
      armFront: bone(22, 8, -0.08, 1.2),    // compact punch forward
      armBack: bone(-8, 10, -0.7, 0.9),      // guard position
      legFront: bone(8, 0, 0.15),             // wider stance
      legBack: bone(-8, 0, -0.15),
    }),
    [FighterState.CROUCH_ATTACK]: pose({
      head: bone(3, 9, 0.08),
      body: bone(3, 12, 0.12),
      armFront: bone(20, 12, -0.15, 1.15),   // compact low punch
      armBack: bone(-6, 15, -0.5, 0.85),
      legFront: bone(16, 4, 0.3, 1.05),
      legBack: bone(-10, 8, -0.2),
    }),
    [FighterState.AIR_ATTACK]: pose({
      head: bone(0, -2, -0.08),
      body: bone(2, 0, 0.12),
      armFront: bone(18, -4, -0.25, 1.15),
      armBack: bone(-10, 0, -0.4, 0.85),
      legFront: bone(14, 4, 0.35, 1.15),
      legBack: bone(-8, -2, -0.25),
    }),
    [FighterState.THROW]: pose({
      head: bone(3, 1, 0.05),
      body: bone(6, 0, 0.18),
      armFront: bone(26, 4, -0.08, 1.35),    // reaching grab
      armBack: bone(18, 6, -0.15, 1.15),
      legFront: bone(6, 0, 0.12),
      legBack: bone(-6, 0, -0.12),
    }),
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.08),
      armFront: bone(-4, 12, 0.35),           // arms drooping
      armBack: bone(-6, 10, 0.25),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-5, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(10, 5, 0.18),
      armBack: bone(-5, 4, -0.22),
      legFront: bone(5, 3, 0.12),
      legBack: bone(-6, 2, -0.18),
    }),
  },

  routeSpecial(input, cmdBuf, tick) {
    // DM: QCF×2+P → Power Geyser
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_POWER_GEYSER;

    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
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
        FRAME_DATA.SPECIAL_PROJECTILE.active, playerIndex, fighter.charId,
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
