import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { InputManager } from '../input/inputManager.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack } from '../input/inputResolver.js';
import {
  FRAME_DATA,
  CHIP_DAMAGE_RATIO,
} from '../core/constants.js';
import { AttackType, FighterState } from '../core/types.js';
import type { HitLevel } from '../core/types.js';

export type HitCallback = (
  attacker: Fighter, defender: Fighter,
  attackType: AttackType, blocked: boolean,
  counterHit: boolean,
) => void;

export type GuardCrushCallback = (
  fighter: Fighter,
  hitX: number, hitY: number,
) => void;

/** Guard Crush constant — stun duration in frames (KOF2002: 90 frames / 1.5 seconds) */
const GUARD_CRUSH_DURATION = 90;

export interface ProjectileResolverContext {
  inputManager: InputManager;
  prev: [PrevAttack, PrevAttack];
  comboHits: number[];
  lastHitFrame: number[];
  currentFrame: number;
  maxModes: [boolean, boolean];
  onGuardCrush: ((fighter: Fighter, hitX: number, hitY: number) => void) | null;
  scaledDamage: (baseDamage: number, defIdx: number, attackType?: AttackType) => number;
}

function canBlock(hitLevel: HitLevel, crouching: boolean): boolean {
  if (hitLevel === 'MID') return true;
  if (hitLevel === 'LOW') return crouching;
  if (hitLevel === 'HIGH') return !crouching;
  return false;
}

/** Guard gauge depletion based on attack type */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  if (name.startsWith('DM_') || name.startsWith('SDM_')) return name.startsWith('SDM_') ? 35 : 25;
  if (name.startsWith('KYO_') || name.startsWith('IORI_') || name.startsWith('TERRY_')
    || name.startsWith('KIM_') || name.startsWith('RYO_') || name.startsWith('LEONA_') || name.startsWith('KDASH_') || name.startsWith('KULA_') || name.startsWith('SPECIAL_')) return 15;
  if (name.startsWith('CMD_')) return 12;
  if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return 12;
  if (name.endsWith('_C') || name.endsWith('_D')) return 10;
  return 5;
}

function aabbCheck(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function resolveProjectileHits(
  p1: Fighter, p2: Fighter,
  projectiles: Projectile[],
  onHit: HitCallback | undefined,
  ctx: ProjectileResolverContext,
): void {
  const fighters = [p1, p2];
  for (const proj of projectiles) {
    const hitbox = proj.getHitbox();
    if (!hitbox) continue;
    for (let i = 0; i < fighters.length; i++) {
      if (i === proj.ownerId) continue;
      const defender = fighters[i];
      const attacker = fighters[1 - i];
      if (!aabbCheck(hitbox, defender.getEffectiveHurtbox() ?? defender.getHurtbox())) continue;

      // Roll invincibility — only first portion
      if (defender.isRollInvincible()) { proj.active = false; break; }

      const data = FRAME_DATA.SPECIAL_PROJECTILE;
      const raw = i === 0 ? ctx.inputManager.getP1Input() : ctx.inputManager.getP2Input();
      const defInput = resolveInput(raw, defender.facing, ctx.prev[i]);
      const crouching = defender.state === FighterState.CROUCH;

      if (defender.canBlock() && defInput.back && canBlock(data.hitLevel as HitLevel, crouching)) {
        // Guard gauge depletion for projectile
        defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(AttackType.SPECIAL_PROJECTILE));

        if (defender.guardGauge <= 0) {
          defender.state = FighterState.GUARD_CRUSH;
          defender.guardCrushTimer = GUARD_CRUSH_DURATION;
          defender.vx = data.pushback * (defender.facing === 1 ? -1 : 1) * 1.5;
          defender.resetAttackState();
          const hitX = (attacker.x + defender.x) / 2;
          const hitY = defender.y - defender.displayHeight / 2;
          ctx.onGuardCrush?.(defender, hitX, hitY);
        } else {
          defender.applyBlockstun(data.blockstun, data.pushback);
        }
        const chip = data.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
        // A6: Chip damage cannot kill
        defender.health = Math.max(1, defender.health - chip);
        ctx.comboHits[i] = 0;
        onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, true, false);
      } else {
        const damage = ctx.scaledDamage(data.damage, i, AttackType.SPECIAL_PROJECTILE);
        const projAtkIdx = 1 - i;
        const projDamage = ctx.maxModes[projAtkIdx] ? Math.round(damage * 0.67) : damage;
        ctx.comboHits[i]++;
        ctx.lastHitFrame[i] = ctx.currentFrame;
        defender.health = Math.max(0, defender.health - projDamage);
        defender.applyHitstun(data.hitstun, data.pushback);
        onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, false, false);
      }
      proj.active = false;
      break;
    }
  }
}
