import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { InputManager } from '../input/inputManager.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack, RawInput } from '../input/inputResolver.js';
import { createPrevAttack, updatePrevAttack } from '../input/inputResolver.js';
import { FRAME_DATA, THROW_RANGE, THROW_DISTANCE, CHIP_DAMAGE_RATIO } from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';
import type { HitLevel } from '../core/types.js';

export type HitCallback = (attacker: Fighter, defender: Fighter, attackType: AttackType, blocked: boolean) => void;

export class CombatSystem {
  private inputManager: InputManager;
  private prev: [PrevAttack, PrevAttack] = [createPrevAttack(), createPrevAttack()];
  private fighters: [Fighter, Fighter] | null = null;

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;
  }

  resolveAttacks(p1: Fighter, p2: Fighter, projectiles: Projectile[], onHit?: HitCallback): void {
    this.fighters = [p1, p2];
    this.resolveHit(p1, p2, onHit);
    this.resolveHit(p2, p1, onHit);
    this.resolveProjectileHits(p1, p2, projectiles, onHit);
  }

  updateEdgeTracking(rawP1: RawInput, rawP2: RawInput): void {
    updatePrevAttack(this.prev[0], rawP1);
    updatePrevAttack(this.prev[1], rawP2);
  }

  getPrevAttack(playerIndex: number): PrevAttack {
    return this.prev[playerIndex];
  }

  reset(): void {
    this.prev = [createPrevAttack(), createPrevAttack()];
  }

  /** Check if defender's block can stop this hitLevel */
  private canBlock(hitLevel: HitLevel, crouching: boolean): boolean {
    if (hitLevel === 'MID') return true;       // 站蹲都能挡
    if (hitLevel === 'LOW') return crouching;   // 只能蹲防
    if (hitLevel === 'HIGH') return !crouching;  // 只能站防 (空中/打逆)
    return false;
  }

  private resolveHit(attacker: Fighter, defender: Fighter, onHit?: HitCallback): void {
    const hitbox = attacker.getActiveHitbox();
    if (!hitbox || attacker.hasHit) return;

    const hurtbox = defender.getHurtbox();
    if (!aabbCheck(hitbox, hurtbox)) return;

    const attackType = attacker.currentAttack;
    if (!attackType) return;
    const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];

    attacker.hasHit = true;

    // Throw handling
    if (attackType === AttackType.THROW) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist > THROW_RANGE || !defender.isGrounded()) return;
      defender.health = Math.max(0, defender.health - data.damage);
      defender.applyKnockdown(30);
      defender.x = attacker.x + THROW_DISTANCE * attacker.facing;
      onHit?.(attacker, defender, attackType, false);
      return;
    }

    // Block check — determine which player is the defender
    const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
    const raw = defIdx === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
    const defInput = resolveInput(raw, defender.facing, this.prev[defIdx]);

    const crouching = defender.state === FighterState.CROUCH;
    const hitLevel = data.hitLevel as HitLevel;

    if (defender.canBlock() && defInput.back && this.canBlock(hitLevel, crouching)) {
      // Blocked
      defender.applyBlockstun(data.blockstun, data.pushback);
      // Chip damage for specials
      const chip = (data as { chipDamage?: number }).chipDamage;
      if (chip) {
        defender.health = Math.max(0, defender.health - chip);
      }
      onHit?.(attacker, defender, attackType, true);
      return;
    }

    // Hit
    defender.health = Math.max(0, defender.health - data.damage);
    if (data.knockdown) {
      defender.applyKnockdown(25);
    } else {
      defender.applyHitstun(data.hitstun, data.pushback);
    }
    onHit?.(attacker, defender, attackType, false);
  }

  private resolveProjectileHits(p1: Fighter, p2: Fighter, projectiles: Projectile[], onHit?: HitCallback): void {
    const fighters = [p1, p2];
    for (const proj of projectiles) {
      const hitbox = proj.getHitbox();
      if (!hitbox) continue;
      for (let i = 0; i < fighters.length; i++) {
        if (i === proj.ownerId) continue;
        const defender = fighters[i];
        const attacker = fighters[1 - i];
        if (!aabbCheck(hitbox, defender.getHurtbox())) continue;
        const data = FRAME_DATA.SPECIAL_PROJECTILE;

        const raw = i === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
        const defInput = resolveInput(raw, defender.facing, this.prev[i]);
        const crouching = defender.state === FighterState.CROUCH;

        if (defender.canBlock() && defInput.back && this.canBlock(data.hitLevel as HitLevel, crouching)) {
          defender.applyBlockstun(data.blockstun, data.pushback);
          // Chip damage
          const chip = data.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
          defender.health = Math.max(0, defender.health - chip);
          onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, true);
        } else {
          defender.health = Math.max(0, defender.health - data.damage);
          defender.applyHitstun(data.hitstun, data.pushback);
          onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, false);
        }
        proj.active = false;
        break;
      }
    }
  }
}

function aabbCheck(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
