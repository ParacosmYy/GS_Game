import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CharacterDefinition } from '../characters/types.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  WALK_SPEED, RUN_SPEED, GRAVITY, JUMP_VELOCITY,
  BACKDASH_VX, BACKDASH_VY,
  DOUBLE_TAP_WINDOW, RUN_JUMP_VX, RUN_JUMP_VY,
  HOP_THRESHOLD, HOP_VELOCITY, HYPER_JUMP_VY, HYPER_JUMP_VX, HYPER_CHARGE_WINDOW,
  ROLL_SPEED, ROLL_DURATION, ROLL_RECOVERY,
  LANDING_RECOVERY,
  DM_STOCK_COST,
} from '../core/constants.js';
import { FighterState, AttackType, CLOSE_RANGE, JuggleState } from '../core/types.js';
import type { PowerGauge } from '../core/types.js';
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
  private gauge: PowerGauge | null = null;

  private lastForwardTick = -999;
  private lastBackTick = -999;
  private prevForward = false;
  private prevBack = false;
  private prevDown = false;
  private upHoldFrames = 0;
  private upWasPressed = false;
  private lastDownTick = -999;
  private rekkaWindow = 0;

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
  }

  get fighterRef(): Fighter { return this.fighter; }
  get charDef(): CharacterDefinition { return this.character; }

  setOpponent(opp: Fighter): void { this.opponent = opp; }

  setGauge(gauge: PowerGauge): void { this.gauge = gauge; }

  setCharacter(char: CharacterDefinition): void {
    this.character = char;
    this.fighter.color = char.color;
    this.fighter.charId = char.id;
  }

  update(input: ResolvedInput): void {
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
    f.x += f.vx;
    f.y += f.vy;
    if (f.y >= STAGE_GROUND_Y) {
      const wasAirborne = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP
        || f.state === FighterState.BACKDASH || f.state === FighterState.AIR_ATTACK;
      if (wasAirborne) {
        if (f.currentAttack) f.endAttack();
        f.y = STAGE_GROUND_Y; f.vy = 0; f.vx = 0;
        f.state = FighterState.IDLE;
        f.landingRecovery = LANDING_RECOVERY;
        f.juggleState = JuggleState.NONE;
        f.airHitCount = 0;
        this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
      } else if (f.vy > 0) { f.y = STAGE_GROUND_Y; f.vy = 0; }
    }
    f.x = Math.max(FIGHTER_WIDTH / 2, Math.min(f.x, STAGE_WIDTH - FIGHTER_WIDTH / 2));
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

  /** Try attack routing: DM > char special > char normal > default normal */
  private tryAttack(input: ResolvedInput): AttackType | null {
    const tick = this.tickRef.value;
    // DM
    const dm = this.cmdBuf.checkDM(tick, input.punchPressed);
    if (dm) return dm;
    // Character specials
    const special = this.character.routeSpecial(input, this.cmdBuf, tick);
    if (special) return special;
    // Character command normals
    const charN = this.character.routeNormal(input, this.fighter.state, this.closeRange());
    if (charN) return charN;
    // Default normal
    if (input.punchPressed || input.kickPressed) return this.defaultAttack(input);
    return null;
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
          f.state = FighterState.RUN; f.vx = RUN_SPEED * f.facing; return;
        }
        if (this.upReleased(input) && f.isGrounded() && this.upHoldFrames > 0) {
          if (this.upHoldFrames <= HOP_THRESHOLD) { f.vy = HOP_VELOCITY; f.state = FighterState.HOP; }
          else if (this.hyperJump()) {
            f.vy = HYPER_JUMP_VY; f.vx = HYPER_JUMP_VX * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.HYPER_JUMP; this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          } else { f.vy = JUMP_VELOCITY; f.state = FighterState.JUMP; }
          return;
        }
        if (input.down && !this.prevDown) this.lastDownTick = this.tickRef.value;
        if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; return; }
        if (input.throwAttackPressed && f.canAct()) { f.startAttack(AttackType.THROW); return; }
        if (f.canAct()) { const atk = this.tryAttack(input); if (atk) { f.startAttack(atk); return; } }

        if (input.forward) { f.vx = WALK_SPEED * f.facing; f.state = FighterState.WALK; }
        else if (input.back) { f.vx = -WALK_SPEED * f.facing; f.state = FighterState.WALK; }
        else { f.state = FighterState.IDLE; }
        break;
      }

      case FighterState.RUN: {
        f.displayHeight = 100; f.vx = RUN_SPEED * f.facing;
        if (input.up && f.isGrounded()) {
          f.state = FighterState.RUN_JUMP; f.vy = RUN_JUMP_VY; f.vx = RUN_JUMP_VX * f.facing;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
        }
        if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; f.vx = 0; return; }
        if (input.throwAttackPressed && f.canAct()) { f.startAttack(AttackType.THROW); return; }
        if (f.canAct()) { const atk = this.tryAttack(input); if (atk) { f.startAttack(atk); return; } }
        if (!input.forward) { f.vx = 0; f.state = FighterState.IDLE; f.runStopTimer = 3; }
        break;
      }

      case FighterState.BACKDASH: {
        f.vy += GRAVITY;
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
        if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const cn = this.character.routeNormal(input, f.state, false);
          const atk = cn || this.defaultAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY; break;
      }

      case FighterState.JUMP:
      case FighterState.RUN_JUMP: {
        if (input.blowbackPressed && !f.currentAttack) { f.startAttack(AttackType.JUMP_CD); }
        else if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const cn = this.character.routeNormal(input, f.state, false);
          const atk = cn || this.defaultAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY; break;
      }

      case FighterState.CROUCH: {
        f.displayHeight = 50; f.vx = 0;
        if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }
        if (input.throwAttackPressed && f.canAct()) { f.startAttack(AttackType.THROW); return; }
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
        f.blockstunTimer--; f.vx *= 0.8;
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
        if (f.blockstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;
      }

      case FighterState.GUARD_CRUSH: {
        f.guardCrushTimer--; f.vx *= 0.85;
        // Visual: flicker like hitstun
        if (f.guardCrushTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;
      }

      case FighterState.HITSTUN:
        f.hitstunTimer--; f.vx *= 0.85;
        if (f.hitstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;

      case FighterState.KNOCKDOWN:
        f.knockdownTimer--; f.vx *= 0.9;
        // Quick stand: A+B during soft knockdown reduces timer to 3 frames
        if (!f.isHardKnockdown && input.rollPressed && f.knockdownTimer > 3) {
          f.knockdownTimer = 3;
        }
        if (f.knockdownTimer <= 0) { f.state = FighterState.IDLE; f.isKnockedDown = false; f.isHardKnockdown = false; f.displayHeight = 100; f.vx = 0; }
        break;
    }
  }
}

export function resolvePushbox(a: Fighter, b: Fighter): void {
  const aBox = a.getPushbox(); const bBox = b.getPushbox();
  const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (overlap > 0) {
    const push = overlap / 2 + 0.5;
    if (a.x < b.x) { a.x -= push; b.x += push; } else { a.x += push; b.x -= push; }
  }
}
