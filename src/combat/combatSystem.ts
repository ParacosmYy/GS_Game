import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { InputManager } from '../input/inputManager.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack } from '../input/inputResolver.js';
import { FRAME_DATA, THROW_RANGE, THROW_DISTANCE } from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';

export class CombatSystem {
  private inputManager: InputManager;
  private prevP1Attack: PrevAttack = { light: false, heavy: false, throwAtk: false };
  private prevP2Attack: PrevAttack = { light: false, heavy: false, throwAtk: false };

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;
  }

  private p1: Fighter | null = null;
  private p2: Fighter | null = null;

  resolveAttacks(p1: Fighter, p2: Fighter, projectiles: Projectile[]): void {
    this.p1 = p1;
    this.p2 = p2;
    this.resolveHit(p1, p2);
    this.resolveHit(p2, p1);
    this.resolveProjectileHits(p1, p2, projectiles);
  }

  updateEdgeTracking(rawP1: { lightAttack: boolean; heavyAttack: boolean; throwAttack: boolean },
                     rawP2: { lightAttack: boolean; heavyAttack: boolean; throwAttack: boolean }): void {
    this.prevP1Attack = { light: rawP1.lightAttack, heavy: rawP1.heavyAttack, throwAtk: rawP1.throwAttack };
    this.prevP2Attack = { light: rawP2.lightAttack, heavy: rawP2.heavyAttack, throwAtk: rawP2.throwAttack };
  }

  getPrevAttack(playerIndex: number): PrevAttack {
    return playerIndex === 0 ? this.prevP1Attack : this.prevP2Attack;
  }

  reset(): void {
    this.prevP1Attack = { light: false, heavy: false, throwAtk: false };
    this.prevP2Attack = { light: false, heavy: false, throwAtk: false };
  }

  private resolveHit(attacker: Fighter, defender: Fighter): void {
    const hitbox = attacker.getActiveHitbox();
    if (!hitbox || attacker.hasHit) return;

    const hurtbox = defender.getHurtbox();
    if (!aabbCheck(hitbox, hurtbox)) return;

    const attackType = attacker.currentAttack;
    if (!attackType) return;
    const data = FRAME_DATA[attackType];

    attacker.hasHit = true;

    if (attackType === AttackType.THROW) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist > THROW_RANGE || !defender.isGrounded()) return;
      defender.health = Math.max(0, defender.health - data.damage);
      defender.applyKnockdown(30);
      defender.x = attacker.x + THROW_DISTANCE * attacker.facing;
      return;
    }

    const defIdx = defender === this.p1 ? 0 : 1;
    const defRaw = defIdx === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
    const defInput = resolveInput(defRaw, defender.facing, this.getPrevAttack(defIdx));

    if (defender.canBlock() && defInput.back) {
      const isLow = attackType === AttackType.CROUCH_ATTACK;
      const isOverhead = attackType === AttackType.AIR_ATTACK;
      const crouching = defender.state === FighterState.CROUCH;
      if (!(isLow && !crouching) && !(isOverhead && crouching)) {
        defender.applyBlockstun(data.blockstun, data.pushback);
        return;
      }
    }

    defender.health = Math.max(0, defender.health - data.damage);
    defender.applyHitstun(data.hitstun, data.pushback);
  }

  private resolveProjectileHits(p1: Fighter, p2: Fighter, projectiles: Projectile[]): void {
    const fighters = [p1, p2];
    for (const proj of projectiles) {
      const hitbox = proj.getHitbox();
      if (!hitbox) continue;
      for (let i = 0; i < fighters.length; i++) {
        if (i === proj.ownerId) continue;
        const defender = fighters[i];
        if (!aabbCheck(hitbox, defender.getHurtbox())) continue;
        const data = FRAME_DATA.SPECIAL_PROJECTILE;
        const defRaw = i === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
        const defInput = resolveInput(defRaw, defender.facing, this.getPrevAttack(i));
        if (defender.canBlock() && defInput.back) {
          defender.applyBlockstun(data.blockstun, data.pushback);
        } else {
          defender.health = Math.max(0, defender.health - data.damage);
          defender.applyHitstun(data.hitstun, data.pushback);
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
