import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { InputManager } from '../input/inputManager.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack, RawInput } from '../input/inputResolver.js';
import { createPrevAttack, updatePrevAttack } from '../input/inputResolver.js';
import {
  FRAME_DATA, THROW_RANGE, THROW_DISTANCE,
  CHIP_DAMAGE_RATIO,
  CH_HITSTUN_BONUS, CH_DAMAGE_BONUS,
  DAMAGE_SCALE_STEP, DAMAGE_SCALE_MIN,
} from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';
import type { HitLevel } from '../core/types.js';

export type HitCallback = (
  attacker: Fighter, defender: Fighter,
  attackType: AttackType, blocked: boolean,
  counterHit: boolean,
) => void;

export class CombatSystem {
  private inputManager: InputManager;
  private prev: [PrevAttack, PrevAttack] = [createPrevAttack(), createPrevAttack()];
  private fighters: [Fighter, Fighter] | null = null;
  // Damage scaling combo tracking (per defender: [comboCount, scaledDamageTotal])
  private comboHits = [0, 0];

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

  /** Reset combo for a player (called on block or timeout) */
  resetCombo(playerIndex: number): void {
    this.comboHits[playerIndex] = 0;
  }

  /** Get current combo count for a player */
  getComboCount(playerIndex: number): number {
    return this.comboHits[playerIndex];
  }

  reset(): void {
    this.prev = [createPrevAttack(), createPrevAttack()];
    this.comboHits = [0, 0];
  }

  private canBlock(hitLevel: HitLevel, crouching: boolean): boolean {
    if (hitLevel === 'MID') return true;
    if (hitLevel === 'LOW') return crouching;
    if (hitLevel === 'HIGH') return !crouching;
    return false;
  }

  /** Calculate damage with scaling based on combo count */
  private scaledDamage(baseDamage: number, defIdx: number): number {
    const hits = this.comboHits[defIdx];
    if (hits === 0) return baseDamage; // First hit: full damage
    const scale = Math.max(DAMAGE_SCALE_MIN, 1 - hits * DAMAGE_SCALE_STEP);
    return Math.round(baseDamage * scale);
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
      // Throws beat roll (not invincible to throws)
      const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
      const damage = this.scaledDamage(data.damage, defIdx);
      defender.health = Math.max(0, defender.health - damage);
      defender.applyKnockdown(30);
      defender.x = attacker.x + THROW_DISTANCE * attacker.facing;
      this.comboHits[defIdx]++;
      onHit?.(attacker, defender, attackType, false, false);
      return;
    }

    // Roll invincibility check (attacks pass through, throws don't)
    if (defender.isRolling()) return;

    const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
    const raw = defIdx === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
    const defInput = resolveInput(raw, defender.facing, this.prev[defIdx]);

    const crouching = defender.state === FighterState.CROUCH;
    const hitLevel = data.hitLevel as HitLevel;

    if (defender.canBlock() && defInput.back && this.canBlock(hitLevel, crouching)) {
      // Blocked
      defender.applyBlockstun(data.blockstun, data.pushback);
      const chip = (data as { chipDamage?: number }).chipDamage;
      if (chip) {
        defender.health = Math.max(0, defender.health - chip);
      }
      this.comboHits[defIdx] = 0; // Block resets combo
      onHit?.(attacker, defender, attackType, true, false);
      return;
    }

    // Counter Hit: defender is in an attack state
    const isDefenderAttacking = defender.state === FighterState.STAND_ATTACK
      || defender.state === FighterState.CROUCH_ATTACK
      || defender.state === FighterState.AIR_ATTACK;
    const counterHit = isDefenderAttacking;

    // Damage
    let damage = this.scaledDamage(data.damage, defIdx);
    let hitstunFrames: number = data.hitstun;

    if (counterHit) {
      damage = Math.round(damage * CH_DAMAGE_BONUS);
      hitstunFrames = Math.round(hitstunFrames * CH_HITSTUN_BONUS);
    }

    this.comboHits[defIdx]++;

    defender.health = Math.max(0, defender.health - damage);
    if (data.knockdown) {
      defender.applyKnockdown(25);
    } else {
      defender.applyHitstun(hitstunFrames, data.pushback);
    }
    onHit?.(attacker, defender, attackType, false, counterHit);
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

        // Roll invincibility
        if (defender.isRolling()) { proj.active = false; break; }

        const data = FRAME_DATA.SPECIAL_PROJECTILE;
        const raw = i === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
        const defInput = resolveInput(raw, defender.facing, this.prev[i]);
        const crouching = defender.state === FighterState.CROUCH;

        if (defender.canBlock() && defInput.back && this.canBlock(data.hitLevel as HitLevel, crouching)) {
          defender.applyBlockstun(data.blockstun, data.pushback);
          const chip = data.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
          defender.health = Math.max(0, defender.health - chip);
          this.comboHits[i] = 0;
          onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, true, false);
        } else {
          const damage = this.scaledDamage(data.damage, i);
          this.comboHits[i]++;
          defender.health = Math.max(0, defender.health - damage);
          defender.applyHitstun(data.hitstun, data.pushback);
          onHit?.(attacker, defender, AttackType.SPECIAL_PROJECTILE, false, false);
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
