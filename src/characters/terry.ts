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
    [FighterState.WALK]: [
      pose({ legFront: bone(10, -2, 0.2), legBack: bone(-3, 2, -0.15), armFront: bone(10, 22, 0.08), armBack: bone(-5, 20, -0.28) }),
      pose({ legFront: bone(8, 0, 0.12), legBack: bone(-4, 0, -0.08), armFront: bone(11, 19, 0.12), armBack: bone(-6, 17, -0.32) }),
      pose({ legFront: bone(5, 2, -0.18), legBack: bone(-10, -2, 0.2), armFront: bone(10, 18, 0.15), armBack: bone(-5, 21, -0.25) }),
      pose({ legFront: bone(7, 0, -0.08), legBack: bone(-5, 0, 0.06), armFront: bone(10, 20, 0.1), armBack: bone(-5, 18, -0.3) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(9, 0, 0.22), armFront: bone(-6, 24, -0.95), armBack: bone(16, 26, 0.65), legFront: bone(14, -5, 0.5), legBack: bone(-9, 5, -0.4) }),
      pose({ body: bone(5, 0, 0.1), armFront: bone(-4, 18, -0.55), armBack: bone(10, 30, 0.3), legFront: bone(10, 5, 0.22), legBack: bone(-14, -5, 0.5) }),
    ],
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
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.12), head: bone(-2, 2, -0.18), armFront: bone(-3, 20, 0.5), armBack: bone(-8, 18, 0.6) }),
      pose({ body: bone(-7, 2, -0.2), head: bone(-4, 3, -0.28), armFront: bone(-1, 23, 0.6), armBack: bone(-10, 20, 0.75) }),
      pose({ body: bone(-3, -1, -0.06), head: bone(-1, 1, -0.1), armFront: bone(-5, 18, 0.4), armBack: bone(-6, 16, 0.5) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(12, 10, 0.3),
      armBack: bone(-7, 8, -0.25),
      legFront: bone(4, -3, 0.2),
      legBack: bone(-5, 0, -0.35),
    }),
    // — Attack poses (boxing stance, compact arms, wider legs) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(2, 0, 0.03), body: bone(3, 0, 0.08), armFront: bone(16, 6, 0.1, 1.0), armBack: bone(-8, 10, -0.7, 0.9), legFront: bone(6, 0, 0.1), legBack: bone(-7, 0, -0.12) }),
      pose({ head: bone(3, 1, 0.05), body: bone(4, 0, 0.12), armFront: bone(22, 8, -0.08, 1.2), armBack: bone(-8, 10, -0.7, 0.9), legFront: bone(8, 0, 0.15), legBack: bone(-8, 0, -0.15) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(2, 8, 0.05), body: bone(2, 10, 0.08), armFront: bone(15, 10, 0.0, 1.0), armBack: bone(-6, 15, -0.5, 0.85), legFront: bone(13, 3, 0.25, 1.0), legBack: bone(-10, 8, -0.2) }),
      pose({ head: bone(3, 9, 0.08), body: bone(3, 12, 0.12), armFront: bone(20, 12, -0.15, 1.15), armBack: bone(-6, 15, -0.5, 0.85), legFront: bone(16, 4, 0.3, 1.05), legBack: bone(-10, 8, -0.2) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.04), body: bone(1, 0, 0.08), armFront: bone(14, -3, -0.15, 1.0), armBack: bone(-10, 0, -0.4, 0.85), legFront: bone(11, 3, 0.3, 1.1), legBack: bone(-8, -2, -0.2) }),
      pose({ head: bone(0, -2, -0.08), body: bone(2, 0, 0.12), armFront: bone(18, -4, -0.25, 1.15), armBack: bone(-10, 0, -0.4, 0.85), legFront: bone(14, 4, 0.35, 1.15), legBack: bone(-8, -2, -0.25) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.12), armFront: bone(20, 3, 0.0, 1.2), armBack: bone(14, 5, -0.1, 1.05), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.1) }),
      pose({ head: bone(3, 1, 0.05), body: bone(6, 0, 0.18), armFront: bone(26, 4, -0.08, 1.35), armBack: bone(18, 6, -0.15, 1.15), legFront: bone(6, 0, 0.12), legBack: bone(-6, 0, -0.12) }),
    ],
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

  routeSpecial(input, cmdBuf, tick, hasChargeRelease = false) {
    // DM: QCF×2+P → Power Geyser
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_POWER_GEYSER;
    // DM: QCF×2+K → High Angle Geyser
    if (dmMotion === 'QCFx2_K') return AttackType.DM_HIGH_ANGLE_GEYSER;

    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    // DP+K → Power Dunk (Terry-specific upper)
    if (special === AttackType.SPECIAL_UPPER && input.kickPressed) return AttackType.TERRY_POWER_DUNK;
    // ↓蓄↑+P → Rising Tackle (charge move)
    if (hasChargeRelease && input.up && input.punchPressed) return AttackType.TERRY_RISING_TACKLE;
    // DP+P → Rising Tackle (shortcut)
    if (special === AttackType.SPECIAL_UPPER) return AttackType.TERRY_RISING_TACKLE;

    // QCB+P → Burn Knuckle (before fireball)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.TERRY_BURN_KNUCKLE;
    }
    // QCB+K → Crack Shot
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.TERRY_CRACK_SHOT;
    }

    // QCF+P → Power Wave (Terry-specific fireball)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.TERRY_POWER_WAVE;
    return null;
  },

  routeNormal(_input, _state, _isCloseRange) {
    return null; // uses default routing
  },

  routeRekkaFollowup() {
    return null; // no rekka chains
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Power Wave: spawn projectile
    if (attackType === AttackType.TERRY_POWER_WAVE && fighter.attackFrame === 0) {
      const data = FRAME_DATA.TERRY_POWER_WAVE;
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        data.active, playerIndex, fighter.charId,
      ));
      return true;
    }
    // Rising Tackle: rise (multi-hit)
    if (attackType === AttackType.TERRY_RISING_TACKLE) {
      fighter.vy = -8;
      return true;
    }
    // Power Dunk: rise + forward
    if (attackType === AttackType.TERRY_POWER_DUNK) {
      fighter.vy = -7;
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
