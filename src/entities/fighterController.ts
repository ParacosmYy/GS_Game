import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CharacterDefinition, CharacterStats } from '../characters/types.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  STAGE_LEFT, STAGE_RIGHT,
  GRAVITY,
  BACKDASH_VX, BACKDASH_VY,
  DOUBLE_TAP_WINDOW, HYPER_CHARGE_WINDOW,
  HOP_THRESHOLD,
  ROLL_SPEED, ROLL_DURATION, ROLL_RECOVERY,
  LANDING_RECOVERY,
  DM_STOCK_COST,
  PROXIMITY_GUARD_RANGE,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  THROW_INVINCIBILITY_JUMP_STARTUP,
  THROW_INVINCIBILITY_LANDING,
} from '../core/constants.js';
import { FighterState, AttackType, CLOSE_RANGE, JuggleState } from '../core/types.js';
import type { PowerGauge, MaxModeState, CounterConfig } from '../core/types.js';
import { spendStocks } from '../combat/meter.js';
import type { VFXSystem } from '../rendering/vfx.js';

/**
 * 通用状态机控制器 — 不包含任何角色特定逻辑。
 * 所有招式路由通过 CharacterDefinition 委托。
 */
export class FighterController {
  private fighter: Fighter;
  private playerIndex: number;
  private cmdBuf: CommandBuffer;
  private vfx: VFXSystem;
  private projectiles: Projectile[];
  private tickRef: { value: number };
  private opponent: Fighter | null = null;
  private character: CharacterDefinition;
  private stats: CharacterStats;
  private gauge: PowerGauge | null = null;
  private maxMode: MaxModeState | null = null;

  private lastForwardTick = -999;
  private lastBackTick = -999;
  private prevForward = false;
  private prevBack = false;
  private prevDown = false;
  private upHoldFrames = 0;
  private upWasPressed = false;
  private lastDownTick = -999;
  private rekkaWindow = 0;
  private counterStanceTimer = 0;

  constructor(
    fighter: Fighter,
    playerIndex: number,
    cmdBuf: CommandBuffer,
    vfx: VFXSystem,
    projectiles: Projectile[],
    tickRef: { value: number },
    character: CharacterDefinition,
  ) {
    this.fighter = fighter;
    this.playerIndex = playerIndex;
    this.cmdBuf = cmdBuf;
    this.vfx = vfx;
    this.projectiles = projectiles;
    this.tickRef = tickRef;
    this.character = character;
    this.stats = character.stats;
  }

  get fighterRef(): Fighter { return this.fighter; }
  get charDef(): CharacterDefinition { return this.character; }

  setOpponent(opp: Fighter): void { this.opponent = opp; }

  setGauge(gauge: PowerGauge): void { this.gauge = gauge; }

  setMaxMode(maxMode: MaxModeState): void { this.maxMode = maxMode; }

  setCharacter(char: CharacterDefinition): void {
    this.character = char;
    this.stats = char.stats;
    this.fighter.color = char.color;
    this.fighter.charId = char.id;
  }

  update(input: ResolvedInput): void {
    // ── Proximity Guard (P9-E) ──
    if (this.checkProximityGuard(input)) return;

    this.tickStateMachine(input);
    this.prevForward = input.forward;
    this.prevBack = input.back;
    this.prevDown = input.down;
    if (input.up) {
      if (!this.upWasPressed) this.upHoldFrames = 0;
      this.upHoldFrames++;
    }
    this.upWasPressed = input.up;
  }

  applyPhysics(): void {
    const f = this.fighter;

    // Counter Wire wall bounce detection
    if (f.isCounterWire) {
      f.x += f.vx;
      f.y += f.vy;
      const leftBound = STAGE_LEFT;
      const rightBound = STAGE_RIGHT;
      if (f.x <= leftBound || f.x >= rightBound) {
        // Bounce back toward center with reduced speed
        f.vx = -f.vx * 0.6;
        f.vy = -3; // slight upward on bounce
        f.isCounterWire = false; // one bounce only
        // Spawn wall impact sparks at bounce point
        const wallX = f.x <= leftBound ? leftBound : rightBound;
        this.vfx.spawnCounterWireSparks(wallX, f.y - f.displayHeight / 2);
      }
    } else if (f.state === FighterState.HITSTUN || f.state === FighterState.BLOCK
        || f.state === FighterState.KNOCKDOWN || f.state === FighterState.GUARD_CRUSH) {
      // Pushback/stun: apply vx as one-time displacement, then zero it immediately
      // This prevents persistent drift especially at walls
      f.x += f.vx;
      f.vx = 0;
      f.y += f.vy;
    } else {
      // Normal movement: apply velocity normally
      f.x += f.vx;
      f.y += f.vy;
    }

    // Universal gravity: anything airborne falls
    if (f.y < STAGE_GROUND_Y) {
      f.vy += GRAVITY;
    }

    if (f.y >= STAGE_GROUND_Y) {
      const wasAirborne = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP
        || f.state === FighterState.BACKDASH || f.state === FighterState.AIR_ATTACK
        || f.state === FighterState.STAND_ATTACK || f.state === FighterState.AIR_BLOCK;
      if (wasAirborne) {
        if (f.currentAttack) f.endAttack();
        f.y = STAGE_GROUND_Y; f.vy = 0; f.vx = 0;
        f.state = FighterState.IDLE;
        f.landingRecovery = LANDING_RECOVERY;
        f.throwInvincibilityTimer = THROW_INVINCIBILITY_LANDING;
        f.juggleState = JuggleState.NONE;
        f.airHitCount = 0;
        f.hasAttackedInAir = false;
        this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
      } else if (f.vy > 0) { f.y = STAGE_GROUND_Y; f.vy = 0; }
    }
    f.x = Math.max(STAGE_LEFT, Math.min(f.x, STAGE_RIGHT));
  }

  // ─── Helpers ───

  private fwdJP(i: ResolvedInput): boolean { return i.forward && !this.prevForward; }
  private backJP(i: ResolvedInput): boolean { return i.back && !this.prevBack; }
  private dblFwd(i: ResolvedInput): boolean {
    if (this.fwdJP(i)) { const g = this.tickRef.value - this.lastForwardTick; this.lastForwardTick = this.tickRef.value; return g > 0 && g <= DOUBLE_TAP_WINDOW; }
    return false;
  }
  private dblBack(i: ResolvedInput): boolean {
    if (this.backJP(i)) { const g = this.tickRef.value - this.lastBackTick; this.lastBackTick = this.tickRef.value; return g > 0 && g <= DOUBLE_TAP_WINDOW; }
    return false;
  }
  private upReleased(i: ResolvedInput): boolean { return !i.up && this.upWasPressed; }
  private hyperJump(): boolean { const g = this.tickRef.value - this.lastDownTick; return g > 0 && g <= HYPER_CHARGE_WINDOW; }
  private closeRange(): boolean { return this.opponent ? Math.abs(this.fighter.x - this.opponent.x) < CLOSE_RANGE : false; }

  /** Default attack routing (shared by all characters) */
  private defaultAttack(input: ResolvedInput): AttackType | null {
    const f = this.fighter;
    const air = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
      || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP;
    if (air) {
      if (input.buttonAPressed) return AttackType.JUMP_A;
      if (input.buttonBPressed) return AttackType.JUMP_B;
      if (input.buttonCPressed) return AttackType.JUMP_C;
      if (input.buttonDPressed) return AttackType.JUMP_D;
      return null;
    }
    if (f.state === FighterState.CROUCH) {
      if (input.buttonAPressed) return AttackType.CROUCH_A;
      if (input.buttonBPressed) return AttackType.CROUCH_B;
      if (input.buttonCPressed) return AttackType.CROUCH_C;
      if (input.buttonDPressed) return AttackType.CROUCH_D;
      return null;
    }
    const cl = this.closeRange();
    if (input.buttonAPressed) return cl ? AttackType.CLOSE_A : AttackType.STAND_A;
    if (input.buttonBPressed) return cl ? AttackType.CLOSE_B : AttackType.STAND_B;
    if (input.buttonCPressed) return cl ? AttackType.CLOSE_C : AttackType.STAND_C;
    if (input.buttonDPressed) return cl ? AttackType.CLOSE_D : AttackType.STAND_D;
    return null;
  }

  /** Try attack routing: char special (includes DM) > char normal > default normal */
  private tryAttack(input: ResolvedInput): AttackType | null {
    const tick = this.tickRef.value;
    // Character specials (includes DM routing via checkDMMotion)
    const special = this.character.routeSpecial(input, this.cmdBuf, tick);
    if (special) return special;
    // Character command normals
    const charN = this.character.routeNormal(input, this.fighter.state, this.closeRange());
    if (charN) return charN;
    // Default normal
    if (input.punchPressed || input.kickPressed) return this.defaultAttack(input);
    return null;
  }

  /** Route light-normal-only attacks for rapid cancel (A/B button → light normal) */
  private routeRapidCancelLight(input: ResolvedInput): AttackType | null {
    const f = this.fighter;
    // Only grounded attacks can rapid cancel
    if (f.state === FighterState.AIR_ATTACK) return null;

    const isCrouching = f.state === FighterState.CROUCH_ATTACK;

    if (isCrouching) {
      if (input.buttonAPressed) return AttackType.CROUCH_A;
      if (input.buttonBPressed) return AttackType.CROUCH_B;
    } else {
      const cl = this.closeRange();
      if (input.buttonAPressed) return cl ? AttackType.CLOSE_A : AttackType.STAND_A;
      if (input.buttonBPressed) return cl ? AttackType.CLOSE_B : AttackType.STAND_B;
    }
    return null;
  }

  /**
   * Try to route a command normal for Normal → Command Normal cancel.
   * Uses character's routeNormal, but only returns command normals (CMD_* types).
   * Returns null if no command normal detected or if the result is not a command normal.
   */
  private tryCommandNormalCancel(input: ResolvedInput): AttackType | null {
    // Character routeNormal handles direction+button detection for command normals
    const result = this.character.routeNormal(input, this.fighter.state, this.closeRange());
    // Only accept command normals (not default normals)
    if (result && COMMAND_NORMALS.has(result as string)) {
      return result;
    }
    return null;
  }

  // ─── Attack Classification Helpers ───

  /** Check if an attack type is a special move (not DM, not normal) */
  private static isSpecialMove(name: string): boolean {
    return name.startsWith('KYO_') || name.startsWith('IORI_')
      || name.startsWith('TERRY_') || name.startsWith('KIM_')
      || name.startsWith('SPECIAL_');
  }

  /** Check if an attack type is a DM (super) move */
  private static isDM(name: string): boolean {
    return name.startsWith('DM_');
  }

  /** Check if an attack type is a normal move (not special, not DM) */
  private static isNormal(name: string): boolean {
    return !FighterController.isSpecialMove(name) && !FighterController.isDM(name);
  }

  // ─── Proximity Guard (P9-E) ───

  /** Check and apply proximity guard. Returns true if guard was triggered (skip normal update). */
  private checkProximityGuard(input: ResolvedInput): boolean {
    if (!this.opponent) return false;
    const f = this.fighter;
    const opp = this.opponent;

    // Opponent must be in active phase (not just startup — 正版KOF只在攻击判定生效时触发)
    if (!opp.currentAttack || opp.attackPhase !== 'active') return false;

    // Player must be in a blockable state
    if (!f.canBlock()) return false;

    // 如果玩家在按攻击键，不触发proximity guard — 允许玩家选择攻击而非防御
    if (input.punchPressed || input.kickPressed || input.blowbackPressed) return false;

    const dist = Math.abs(f.x - opp.x);
    const oppAtkName = opp.currentAttack as string;
    const isNormal = FighterController.isNormal(oppAtkName);
    const range = isNormal ? PROXIMITY_GUARD_RANGE : STAGE_WIDTH;

    if (dist < range) {
      const holdingBack = (f.facing === 1 && input.back) || (f.facing === -1 && input.forward);
      const holdingDown = input.down;
      const holdingDownBack = holdingDown && holdingBack;

      if (holdingBack || holdingDownBack) {
        f.state = FighterState.BLOCK;
        f.blockType = holdingDownBack ? 'LOW' : 'HIGH';
        f.displayHeight = holdingDown ? 50 : 100;
        return true;
      }
    }
    return false;
  }

  // ─── State Machine ───

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    f.tickTimers();
    if (this.rekkaWindow > 0) this.rekkaWindow--;

    // If being thrown, skip normal state machine — frozen until throw resolves
    if (f.isBeingThrown) return;

    // If throwing, tick the throw attack animation but skip normal transitions
    if (f.isThrowing) {
      f.tickAttack();
      return;
    }

    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK: {
        f.displayHeight = 100; f.vx = 0;

        if (input.rollPressed && f.canAct() && f.isGrounded()) {
          f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
          f.rollTimer = ROLL_DURATION;
          f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
          f.displayHeight = 60;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
        }
        if (input.blowbackPressed && f.canAct()) { f.startAttack(AttackType.STAND_CD); return; }
        if (this.dblBack(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.BACKDASH; f.vx = -BACKDASH_VX * f.facing; f.vy = BACKDASH_VY;
          f.displayHeight = 80; this.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
        }
        if (this.dblFwd(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.RUN; f.vx = this.stats.runSpeed * f.facing; return;
        }
        if (this.upReleased(input) && f.isGrounded() && this.upHoldFrames > 0) {
          f.throwInvincibilityTimer = THROW_INVINCIBILITY_JUMP_STARTUP;
          if (this.upHoldFrames <= HOP_THRESHOLD) {
            f.vy = this.stats.hopVelocity;
            f.vx = this.stats.jumpForwardSpeed * 0.7 * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.HOP;
          }
          else if (this.hyperJump()) {
            f.vy = this.stats.hyperJumpVelocity; f.vx = this.stats.jumpForwardSpeed * 1.4 * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.HYPER_JUMP; this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          } else {
            f.vy = this.stats.jumpVelocity;
            f.vx = this.stats.jumpForwardSpeed * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.JUMP;
          }
          return;
        }
        if (input.down && !this.prevDown) this.lastDownTick = this.tickRef.value;
        if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; return; }
        if (input.throwAttackPressed && f.canAct()) {
          // 前投/后投区分（正版KOF：方向+投决定投掷方向）
          if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
          else if (input.back) f.startAttack(AttackType.THROW_BACK);
          else f.startAttack(AttackType.THROW);
          return;
        }
        if (f.canAct()) { const atk = this.tryAttack(input); if (atk) { f.startAttack(atk); return; } }

        if (input.forward) { f.vx = this.stats.walkSpeed * f.facing; f.state = FighterState.WALK; }
        else if (input.back) { f.vx = -this.stats.walkSpeed * f.facing; f.state = FighterState.WALK; }
        else { f.state = FighterState.IDLE; }
        break;
      }

      case FighterState.RUN: {
        f.displayHeight = 100; f.vx = this.stats.runSpeed * f.facing;
        if (input.up && f.isGrounded()) {
          f.state = FighterState.RUN_JUMP; f.vy = this.stats.jumpVelocity; f.vx = this.stats.jumpForwardSpeed * 1.5 * f.facing;
          f.throwInvincibilityTimer = THROW_INVINCIBILITY_JUMP_STARTUP;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
        }
        if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; f.vx = 0; return; }
        if (input.throwAttackPressed && f.canAct()) {
          if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
          else if (input.back) f.startAttack(AttackType.THROW_BACK);
          else f.startAttack(AttackType.THROW);
          return;
        }
        if (f.canAct()) { const atk = this.tryAttack(input); if (atk) { f.startAttack(atk); return; } }
        if (!input.forward) { f.vx = 0; f.state = FighterState.IDLE; f.runStopTimer = 3; }
        break;
      }

      case FighterState.BACKDASH: {
        if (f.isGrounded() && f.vy >= 0) {
          f.state = FighterState.IDLE; f.vx = 0; f.vy = 0; f.displayHeight = 100;
          f.landingRecovery = LANDING_RECOVERY; this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        }
        break;
      }

      case FighterState.ROLL:
      case FighterState.BACK_ROLL: {
        f.rollTimer--; f.displayHeight = 60;
        if (f.rollTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; f.displayHeight = 100; f.landingRecovery = ROLL_RECOVERY; }
        break;
      }

      case FighterState.HOP:
      case FighterState.HYPER_JUMP: {
        if ((input.punchPressed || input.kickPressed) && !f.currentAttack && !f.hasAttackedInAir) {
          const cn = this.character.routeNormal(input, f.state, false);
          const atk = cn || this.defaultAttack(input);
          if (atk) f.startAttack(atk);
        }
        break;
      }

      case FighterState.JUMP:
      case FighterState.RUN_JUMP: {
        if (input.blowbackPressed && !f.currentAttack && !f.hasAttackedInAir) { f.startAttack(AttackType.JUMP_CD); }
        else if ((input.punchPressed || input.kickPressed) && !f.currentAttack && !f.hasAttackedInAir) {
          const cn = this.character.routeNormal(input, f.state, false);
          const atk = cn || this.defaultAttack(input);
          if (atk) f.startAttack(atk);
        }
        break;
      }

      case FighterState.CROUCH: {
        f.displayHeight = 50; f.vx = 0;
        if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }
        if (input.throwAttackPressed && f.canAct()) {
          if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
          else if (input.back) f.startAttack(AttackType.THROW_BACK);
          else f.startAttack(AttackType.THROW);
          return;
        }
        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const cn = this.character.routeNormal(input, f.state, this.closeRange());
          if (cn) { f.startAttack(cn); return; }
          const atk = this.defaultAttack(input);
          if (atk) { f.startAttack(atk); return; }
        }
        break;
      }

      case FighterState.STAND_ATTACK:
      case FighterState.CROUCH_ATTACK:
      case FighterState.AIR_ATTACK:
      case FighterState.THROW: {
        // Character-specific onAttackActive (fireballs, uppercuts etc.)
        if (f.attackPhase === 'active' && f.currentAttack) {
          this.character.onAttackActive(f, f.currentAttack, this.projectiles, this.playerIndex);
        }

        // ── Super Cancel (P9-F) ──
        if (f.superCancelReady && this.gauge && f.currentAttack) {
          const tick = this.tickRef.value;
          const dmAttack = this.character.routeSpecial(input, this.cmdBuf, tick);
          if (dmAttack && FighterController.isDM(dmAttack as string)
              && this.gauge.stocks >= DM_STOCK_COST + SUPER_CANCEL_STOCK_COST) {
            spendStocks(this.gauge, DM_STOCK_COST + SUPER_CANCEL_STOCK_COST);
            f.startAttack(dmAttack);
            return;
          }
        }

        // ── Free Cancel (P9-G, MAX mode only) ──
        if (this.maxMode && this.maxMode.active && f.currentAttack) {
          const atkName = f.currentAttack as string;
          const isNormalAttack = FighterController.isNormal(atkName);

          // Normals: can cancel even on whiff; Specials: only on contact (hasHit)
          const canFreeCancel = isNormalAttack || f.hasHit;

          if (canFreeCancel) {
            const tick = this.tickRef.value;
            // Try special move input (not DM)
            const specialAttack = this.character.routeSpecial(input, this.cmdBuf, tick);
            if (specialAttack && !FighterController.isDM(specialAttack as string)) {
              // Deduct MAX mode timer
              this.maxMode.timer -= Math.round(this.maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
              if (this.maxMode.timer <= 0) this.maxMode.timer = 0;
              f.startAttack(specialAttack);
              return;
            }
          }
        }

        // ── Rapid Cancel (轻攻击链): light normal → light normal on hit ──
        if (f.rapidCancelReady && f.attackPhase === 'recovery' && f.currentAttack
            && LIGHT_NORMALS.has(f.currentAttack as string)) {
          const nextAtk = this.routeRapidCancelLight(input);
          if (nextAtk) {
            f.startAttack(nextAtk);
            return;
          }
        }

        // ── Normal → Command Normal Cancel (on hit only) ──
        // After a grounded normal hits, can cancel into a command normal during recovery
        if (f.normalCancelReady && f.hasHit && f.attackPhase === 'recovery' && f.currentAttack
            && NORMAL_ATTACKS.has(f.currentAttack as string)) {
          const cmdNormal = this.tryCommandNormalCancel(input);
          if (cmdNormal) {
            f.startAttack(cmdNormal);
            f.cancelledIntoNormal = true;
            f.normalCancelReady = false;
            return;
          }
        }

        // ── Command Normal → Special Cancel (cancelled-into command normals only, on hit only) ──
        if (f.cancelledIntoNormal && f.hasHit && f.attackPhase === 'recovery' && f.currentAttack
            && COMMAND_NORMALS.has(f.currentAttack as string)) {
          const tick = this.tickRef.value;
          const special = this.character.routeSpecial(input, this.cmdBuf, tick);
          if (special && !FighterController.isDM(special as string)) {
            f.startAttack(special);
            f.cancelledIntoNormal = false;
            f.normalCancelReady = false;
            return;
          }
        }

        // Rekka followup
        if (f.currentAttack && this.rekkaWindow > 0 && (f.attackPhase === 'recovery' || f.attackPhase === 'active')) {
          const followup = this.character.routeRekkaFollowup(input, this.cmdBuf, this.tickRef.value, f.currentAttack);
          if (followup) {
            f.endAttack(); f.startAttack(followup); this.rekkaWindow = 20; return;
          }
        }

        // Set rekka chain on starter hit
        if (f.currentAttack && f.attackPhase === 'active' && f.attackFrame === 0) {
          const chain = this.character.getRekkaChain(f.currentAttack);
          if (chain) { f.rekkaChain = chain; this.rekkaWindow = 20; }
        }

        f.tickAttack();
        if (!f.currentAttack && !f.isGrounded()) { f.state = FighterState.JUMP; }
        break;
      }

      case FighterState.BLOCK: {
        f.blockstunTimer--;
        // Guard Cancel Roll (A+B during blockstun, costs 1 stock)
        if (f.blockstunTimer > 0 && input.rollPressed && this.gauge && spendStocks(this.gauge, DM_STOCK_COST)) {
          f.state = FighterState.ROLL;
          f.rollTimer = ROLL_DURATION;
          f.vx = ROLL_SPEED * f.facing;
          f.displayHeight = 60;
          f.blockstunTimer = 0;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          break;
        }
        // Guard Cancel CD (C+D during blockstun, costs 1 stock)
        if (f.blockstunTimer > 0 && input.blowbackPressed && this.gauge && spendStocks(this.gauge, DM_STOCK_COST)) {
          f.blockstunTimer = 0;
          f.startAttack(AttackType.STAND_CD);
          break;
        }
        if (f.blockstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; f.throwInvincibilityTimer = THROW_INVINCIBILITY_POST_STUN; }
        break;
      }

      case FighterState.AIR_BLOCK: {
        f.blockstunTimer--;
        // 空中防御中继续受重力，blockstun 到期后在空中变为 JUMP 状态
        if (f.blockstunTimer <= 0) { f.state = FighterState.JUMP; }
        break;
      }

      case FighterState.GUARD_CRUSH: {
        f.guardCrushTimer--;
        if (f.guardCrushTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;
      }

      case FighterState.COUNTER_STANCE: {
        // 当身技：等待被攻击，超时则失败
        this.counterStanceTimer--;
        if (this.counterStanceTimer <= 0) {
          // 当身失败 — 进入硬直
          f.applyHitstun(20, 3);
        }
        break;
      }

      case FighterState.HITSTUN:
        f.hitstunTimer--;
        if (f.hitstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; f.throwInvincibilityTimer = THROW_INVINCIBILITY_POST_STUN; }
        break;

      case FighterState.KNOCKDOWN:
        f.knockdownTimer--;
        // Quick stand: A+B during soft knockdown reduces timer to 3 frames
        if (!f.isHardKnockdown && input.rollPressed && f.knockdownTimer > 3) {
          f.knockdownTimer = 3;
          f.usedQuickStand = true;
        }
        if (f.knockdownTimer <= 0) {
          f.state = FighterState.IDLE; f.isKnockedDown = false; f.isHardKnockdown = false; f.displayHeight = 100; f.vx = 0;
          // Quick Stand loses wakeup throw invincibility in KOF
          if (!f.usedQuickStand) f.throwInvincibilityTimer = THROW_INVINCIBILITY_WAKEUP;
          f.usedQuickStand = false;
        }
        break;
    }
  }
}

export function resolvePushbox(a: Fighter, b: Fighter): void {
  // Roll states: no pushbox collision (characters phase through each other)
  if (a.isRolling() || b.isRolling()) return;

  const aBox = a.getPushbox();
  const bBox = b.getPushbox();

  // X-axis overlap check
  const xOverlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (xOverlap <= 0) return;

  // Y-axis overlap check — jumping fighters above grounded fighters don't collide
  const yOverlap = Math.min(aBox.y + aBox.height, bBox.y + bBox.height) - Math.max(aBox.y, bBox.y);
  if (yOverlap <= 0) return;

  // Both checks passed: push apart
  const push = xOverlap / 2 + 0.5;
  if (a.x < b.x) { a.x -= push; b.x += push; } else { a.x += push; b.x -= push; }
  a.x = Math.max(STAGE_LEFT, Math.min(a.x, STAGE_RIGHT));
  b.x = Math.max(STAGE_LEFT, Math.min(b.x, STAGE_RIGHT));
}
