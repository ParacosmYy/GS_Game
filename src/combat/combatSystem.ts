import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import type { FighterController } from '../entities/fighterController.js';
import { InputManager } from '../input/inputManager.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack, RawInput } from '../input/inputResolver.js';
import { createPrevAttack, updatePrevAttack } from '../input/inputResolver.js';
import {
  FRAME_DATA, THROW_RANGE, THROW_DISTANCE,
  CHIP_DAMAGE_RATIO,
  CH_HITSTUN_BONUS, CH_DAMAGE_BONUS,
  DAMAGE_SCALE_STEP, DAMAGE_SCALE_MIN,
  COUNTER_WIRE_BOUNCE_VX, COUNTER_WIRE_BOUNCE_VY,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  STAGE_LEFT, STAGE_RIGHT,
  JUGGLE_POINTS_MAX, JUGGLE_COST_LIGHT, JUGGLE_COST_HEAVY, JUGGLE_COST_SPECIAL, JUGGLE_COST_DM,
} from '../core/constants.js';
import { CLOSE_RANGE } from '../core/types.js';
import { FighterState, AttackType, JuggleState } from '../core/types.js';
import type { HitLevel } from '../core/types.js';

/** Throw escape window in frames */
const THROW_ESCAPE_WINDOW = 8;
/** Push-apart distance on successful throw escape */
const THROW_ESCAPE_PUSH = 60;
export type HitCallback = (
  attacker: Fighter, defender: Fighter,
  attackType: AttackType, blocked: boolean,
  counterHit: boolean,
) => void;

export class CombatSystem {
  private inputManager: InputManager;
  private prev: [PrevAttack, PrevAttack] = [createPrevAttack(), createPrevAttack()];
  private fighters: [Fighter, Fighter] | null = null;
  defenderControllers: [FighterController, FighterController] | null = null;
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

  /**
   * Tick throw escape window for both fighters.
   * Called every frame from the main loop AFTER resolveAttacks.
   * Returns true if a throw escape occurred this frame.
   */
  tickThrowState(p1: Fighter, p2: Fighter, onHit?: HitCallback): boolean {
    let escaped = false;
    const fighters: [Fighter, Fighter] = [p1, p2];

    for (let i = 0; i < 2; i++) {
      const defender = fighters[i];
      if (!defender.isBeingThrown || defender.throwEscapeTimer <= 0) continue;

      // Get defender input to check for throw escape
      const raw = i === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
      const defInput = resolveInput(raw, defender.facing, this.prev[i]);

      defender.throwEscapeTimer--;

      // Check for throw escape: defender presses throw during escape window
      if (defInput.throwAttackPressed && defender.throwEscapeTimer >= 0) {
        // Successful throw escape!
        const attacker = fighters[1 - i];

        // Push both apart
        const pushDir = attacker.facing;
        attacker.x -= THROW_ESCAPE_PUSH * pushDir * 0.5;
        defender.x += THROW_ESCAPE_PUSH * pushDir * 0.5;
        // Clamp to stage bounds
        attacker.x = Math.max(STAGE_LEFT, Math.min(attacker.x, STAGE_RIGHT));
        defender.x = Math.max(STAGE_LEFT, Math.min(defender.x, STAGE_RIGHT));

        // Reset both fighters to IDLE
        attacker.isThrowing = false;
        attacker.throwVictim = null;
        attacker.endAttack();
        defender.isBeingThrown = false;
        defender.throwEscapeTimer = 0;
        defender.state = FighterState.IDLE;
        defender.isKnockedDown = false;

        escaped = true;
        break;
      }

      // Timer expired — resolve throw as damage + hard knockdown
      if (defender.throwEscapeTimer <= 0) {
        const attacker = fighters[1 - i];
        // 根据投技类型选择帧数据
        const throwType = attacker.currentAttack;
        const data = (throwType === AttackType.THROW_FORWARD || throwType === AttackType.THROW_BACK)
          ? FRAME_DATA[throwType as keyof typeof FRAME_DATA] ?? FRAME_DATA[AttackType.THROW]
          : FRAME_DATA[AttackType.THROW];
        const defIdx = i;
        const damage = this.scaledDamage(data.damage, defIdx);

        defender.health = Math.max(0, defender.health - damage);
        defender.applyKnockdown(30, true);
        // 使用投技方向（前投向前飞，后投向后飞）
        const throwDir = defender.throwDirection;
        defender.x = Math.max(STAGE_LEFT, Math.min(attacker.x + THROW_DISTANCE * throwDir, STAGE_RIGHT));
        defender.isBeingThrown = false;

        attacker.isThrowing = false;
        attacker.throwVictim = null;

        this.comboHits[defIdx]++;
        onHit?.(attacker, defender, AttackType.THROW, false, false);
      }
    }

    return escaped;
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
    // 使用多框判定：检查攻击者的所有攻击框
    const hitboxes = attacker.getActiveHitboxes();
    if (hitboxes.length === 0 || attacker.hasHit) return;

    // 使用受击框覆盖（出招时身体可能缩小）
    const hurtbox = defender.getEffectiveHurtbox();

    let hit = false;
    for (const hitbox of hitboxes) {
      if (aabbCheck(hitbox, hurtbox)) { hit = true; break; }
    }
    if (!hit) return;

    const attackType = attacker.currentAttack;
    if (!attackType) return;
    const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];

    attacker.hasHit = true;

    // Throw handling — Phase 1: setup throw with escape window
    if (attackType === AttackType.THROW || attackType === AttackType.THROW_FORWARD || attackType === AttackType.THROW_BACK) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist > THROW_RANGE || !defender.isGrounded()) return;
      // Throw invincibility check
      if (defender.throwInvincibilityTimer > 0) return;
      // Determine throw direction
      const throwDir: 1 | -1 = attackType === AttackType.THROW_BACK ? (-attacker.facing as 1 | -1) : attacker.facing;
      // Phase 1: freeze both, start escape window
      attacker.isThrowing = true;
      attacker.throwVictim = defender;
      attacker.hasHit = true;
      defender.isBeingThrown = true;
      defender.throwEscapeTimer = THROW_ESCAPE_WINDOW;
      defender.throwDirection = throwDir;
      // Position defender at throw point
      defender.x = Math.max(STAGE_LEFT, Math.min(attacker.x + THROW_DISTANCE * throwDir, STAGE_RIGHT));
      return;
    }

    // Command throw handling — character-specific throws that bypass escape window
    const attackerCtrl = this.defenderControllers?.[this.fighters?.[0] === attacker ? 0 : 1];
    if (attackerCtrl?.charDef?.isCommandThrow?.(attackType)) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist > THROW_RANGE * 1.2 || !defender.isGrounded()) return;
      if (defender.throwInvincibilityTimer > 0) return;
      // Command throw: no escape window, instant effect
      attacker.hasHit = true;
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
      const damage = this.scaledDamage(data.damage, defIdx);
      defender.health = Math.max(0, defender.health - damage);
      this.comboHits[defIdx]++;
      // Kuzukaze special: swap positions
      if (attackType === AttackType.IORI_KUZUKAZE) {
        const tempX = attacker.x;
        attacker.x = defender.x;
        defender.x = tempX;
        // Attacker faces the same direction, defender is now behind
        defender.state = FighterState.HITSTUN;
        defender.hitstunTimer = 16; // +16f advantage for attacker
        defender.vx = 0;
      } else {
        defender.applyKnockdown(25);
      }
      onHit?.(attacker, defender, attackType, false, false);
      return;
    }

    // Roll invincibility check (attacks pass through, throws don't)
    if (defender.isRolling()) return;

    // B7: Juggle check — if defender is airborne, check juggle budget
    if (!defender.isGrounded()) {
      if (defender.juggleState === JuggleState.NONE) return; // Can't hit airborne
      if (defender.juggleState === JuggleState.HALF && defender.vy > 0) return;
      // Juggle point check: each air hit consumes points from budget
      const juggleCost = getJuggleCost(attackType);
      if (defender.jugglePoints < juggleCost) return; // not enough juggle budget
      defender.jugglePoints -= juggleCost;
    }

    const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
    const raw = defIdx === 0 ? this.inputManager.getP1Input() : this.inputManager.getP2Input();
    const defInput = resolveInput(raw, defender.facing, this.prev[defIdx]);

    const crouching = defender.state === FighterState.CROUCH;
    const isAirborne = !defender.isGrounded();
    // Cancelled-into command normals lose special properties: MID instead of HIGH/LOW, no knockdown
    const isCancelledCmdNormal = attacker.cancelledIntoNormal && COMMAND_NORMALS.has(attackType as string);
    const hitLevel = (isCancelledCmdNormal ? 'MID' : data.hitLevel) as HitLevel;

    // 空中防御：空中按后可防 HIGH/MID 攻击，不能防 LOW
    if (isAirborne && defender.canAirBlock() && defInput.back && hitLevel !== 'LOW') {
      defender.applyAirBlockstun(data.blockstun, data.pushback);
      const chipData = data as { chipDamage?: number };
      const chip = chipData.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
      defender.health = Math.max(1, defender.health - chip);
      this.comboHits[defIdx] = 0;
      onHit?.(attacker, defender, attackType, true, false);
      return;
    }

    // 地面防御
    if (defender.canBlock() && !isAirborne && defInput.back && this.canBlock(hitLevel, crouching)) {
      // Guard gauge depletion
      defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(attackType));

      if (defender.guardGauge <= 0) {
        // Guard Crush — stunned instead of normal blockstun
        defender.state = FighterState.GUARD_CRUSH;
        defender.guardCrushTimer = GUARD_CRUSH_DURATION;
        defender.vx = data.pushback * (defender.facing === 1 ? -1 : 1) * 1.5;
        defender.resetAttackState();
      } else {
        defender.applyBlockstun(data.blockstun, data.pushback);
      }
      const chipData = data as { chipDamage?: number };
      const chip = chipData.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
      // A6: Chip damage cannot kill (leave at least 1 HP)
      defender.health = Math.max(1, defender.health - chip);
      this.comboHits[defIdx] = 0; // Block resets combo
      onHit?.(attacker, defender, attackType, true, false);
      return;
    }

    // Counter Hit: defender is in an attack state
    const isDefenderAttacking = defender.state === FighterState.STAND_ATTACK
      || defender.state === FighterState.CROUCH_ATTACK
      || defender.state === FighterState.AIR_ATTACK;
    const counterHit = isDefenderAttacking;

    // 当身技检测：如果防御方处于 COUNTER_STANCE 状态，触发反击
    if (defender.state === FighterState.COUNTER_STANCE) {
      const defCtrl = this.defenderControllers?.[defIdx];
      if (defCtrl) {
        const charDef = defCtrl.charDef;
        const counterConfig = charDef.getCounterConfig?.();
        if (counterConfig) {
          // 当身成功！攻击者受到反击伤害
          attacker.health = Math.max(0, attacker.health - counterConfig.counterDamage);
          attacker.applyHitstun(25, 8);
          // 防御方恢复
          defender.state = FighterState.IDLE;
          defender.vx = 0;
          onHit?.(defender, attacker, counterConfig.counterAttack, false, true);
          this.comboHits[defIdx]++;
          return;
        }
      }
    }

    // Damage
    let damage = this.scaledDamage(data.damage, defIdx);
    let hitstunFrames: number = data.hitstun;

    // Close range damage bonus: CLOSE_ attacks get +10% at point-blank range
    const attackName = attackType as string;
    if (attackName.startsWith('CLOSE_')) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist < CLOSE_RANGE * 0.5) {
        damage = Math.round(damage * 1.1);
      }
    }

    if (counterHit) {
      damage = Math.round(damage * CH_DAMAGE_BONUS);
      hitstunFrames = Math.round(hitstunFrames * CH_HITSTUN_BONUS);
    }

    this.comboHits[defIdx]++;

    defender.health = Math.max(0, defender.health - damage);

    // Counter Wire: counter hit + counterWire move → wall bounce instead of knockdown
    const frameData = data as { counterWire?: boolean };
    if (counterHit && frameData.counterWire) {
      defender.isCounterWire = true;
      const flyDir = defender.x < attacker.x ? -1 : 1;
      defender.vx = COUNTER_WIRE_BOUNCE_VX * flyDir * -1;
      defender.vy = COUNTER_WIRE_BOUNCE_VY;
      defender.juggleState = JuggleState.FULL;
      defender.jugglePoints = JUGGLE_POINTS_MAX; // full budget on wire launch
      defender.state = FighterState.HITSTUN;
      defender.hitstunTimer = 30;
      defender.isKnockedDown = false;
    } else if (data.knockdown && !isCancelledCmdNormal) {
      defender.applyKnockdown(25);
      // Launch into air: give juggle budget for follow-up
      if (!defender.isGrounded()) {
        defender.jugglePoints = JUGGLE_POINTS_MAX;
      }
    } else {
      defender.applyHitstun(hitstunFrames, data.pushback);
    }

    // Rapid Cancel: light normal on hit enables chaining into next light normal
    if (LIGHT_NORMALS.has(attackType as string)) {
      attacker.rapidCancelReady = true;
    }

    // Normal → Command Normal cancel: grounded normal on hit enables cancel into command normal
    if (NORMAL_ATTACKS.has(attackType as string)) {
      attacker.normalCancelReady = true;
    }

    // Super Cancel: special moves on hit enable cancel into DM (costs extra stock)
    const atkName = attackType as string;
    if (atkName.startsWith('KYO_') || atkName.startsWith('IORI_') || atkName.startsWith('TERRY_')
      || atkName.startsWith('KIM_') || atkName.startsWith('RYO_') || atkName.startsWith('LEONA_') || atkName.startsWith('KDASH_') || atkName.startsWith('KULA_') || atkName === AttackType.SPECIAL_UPPER
      || atkName === AttackType.SPECIAL_PROJECTILE) {
      attacker.superCancelReady = true;
    }

    onHit?.(attacker, defender, attackType, false, counterHit);
  }

  private resolveProjectileHits(p1: Fighter, p2: Fighter, projectiles: Projectile[], onHit?: HitCallback): void {    const fighters = [p1, p2];
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
          // Guard gauge depletion for projectile
          defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(AttackType.SPECIAL_PROJECTILE));

          if (defender.guardGauge <= 0) {
            defender.state = FighterState.GUARD_CRUSH;
            defender.guardCrushTimer = GUARD_CRUSH_DURATION;
            defender.vx = data.pushback * (defender.facing === 1 ? -1 : 1) * 1.5;
            defender.resetAttackState();
          } else {
            defender.applyBlockstun(data.blockstun, data.pushback);
          }
          const chip = data.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
          // A6: Chip damage cannot kill
          defender.health = Math.max(1, defender.health - chip);
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

/** Guard gauge depletion based on attack type */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  // DMs
  if (name.startsWith('DM_')) return 25;
  // Character specials (KYO_, IORI_, TERRY_, KIM_, SPECIAL_)
  if (name.startsWith('KYO_') || name.startsWith('IORI_') || name.startsWith('TERRY_')
    || name.startsWith('KIM_') || name.startsWith('RYO_') || name.startsWith('LEONA_') || name.startsWith('KDASH_') || name.startsWith('KULA_') || name.startsWith('SPECIAL_')) return 15;
  // Command normals
  if (name.startsWith('CMD_')) return 12;
  // CD blowback
  if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return 12;
  // Heavy normals (C/D, CLOSE_C/D)
  if (name.endsWith('_C') || name.endsWith('_D')) return 10;
  // Light normals (A/B)
  return 5;
}

/** Guard Crush constant — stun duration in frames */
const GUARD_CRUSH_DURATION = 60;

/** Get juggle point cost for an attack type */
function getJuggleCost(attackType: AttackType): number {
  const name = attackType as string;
  if (name.startsWith('DM_')) return JUGGLE_COST_DM;
  if (name.startsWith('KYO_') || name.startsWith('IORI_') || name.startsWith('TERRY_')
    || name.startsWith('KIM_') || name.startsWith('RYO_') || name.startsWith('LEONA_') || name.startsWith('KDASH_') || name.startsWith('KULA_') || name.startsWith('SPECIAL_')) return JUGGLE_COST_SPECIAL;
  if (name.endsWith('_C') || name.endsWith('_D') || name.startsWith('CMD_')
    || name.startsWith('CLOSE_C') || name.startsWith('CLOSE_D')) return JUGGLE_COST_HEAVY;
  return JUGGLE_COST_LIGHT;
}

function aabbCheck(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
