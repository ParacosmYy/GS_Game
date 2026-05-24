import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  WALK_SPEED, RUN_SPEED, GRAVITY, JUMP_VELOCITY,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION,
  DOUBLE_TAP_WINDOW, RUN_JUMP_VX, RUN_JUMP_VY,
  FRAME_DATA, LANDING_RECOVERY,
} from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';
import type { VFXSystem } from '../rendering/vfx.js';

/**
 * Per-frame fighter state controller.
 * Handles input → state transitions, double-tap dash detection,
 * attack spawning, physics, pushbox.
 */
export class FighterController {
  private fighter: Fighter;
  private playerIndex: number;
  private cmdBuf: CommandBuffer;
  private vfx: VFXSystem;
  private projectiles: Projectile[];
  private tickRef: { value: number };

  // Double-tap detection
  private lastForwardTick = -999;
  private lastBackTick = -999;
  private prevForward = false;
  private prevBack = false;

  constructor(
    fighter: Fighter,
    playerIndex: number,
    cmdBuf: CommandBuffer,
    vfx: VFXSystem,
    projectiles: Projectile[],
    tickRef: { value: number },
  ) {
    this.fighter = fighter;
    this.playerIndex = playerIndex;
    this.cmdBuf = cmdBuf;
    this.vfx = vfx;
    this.projectiles = projectiles;
    this.tickRef = tickRef;
  }

  get fighterRef(): Fighter { return this.fighter; }

  /** Process input and update fighter state */
  update(input: ResolvedInput): void {
    this.tickStateMachine(input);
    // Update edge tracking AFTER state machine consumes it
    this.prevForward = input.forward;
    this.prevBack = input.back;
  }

  /** Apply gravity and clamping */
  applyPhysics(): void {
    const f = this.fighter;
    f.x += f.vx;
    f.y += f.vy;

    if (f.y >= STAGE_GROUND_Y) {
      const wasAirborne = f.state === FighterState.JUMP
        || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.BACKDASH
        || f.state === FighterState.AIR_ATTACK;
      if (wasAirborne) {
        if (f.currentAttack) f.endAttack();
        f.y = STAGE_GROUND_Y;
        f.vy = 0;
        f.vx = 0;
        f.state = FighterState.IDLE;
        f.landingRecovery = LANDING_RECOVERY;
        this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
      } else if (f.vy > 0) {
        f.y = STAGE_GROUND_Y;
        f.vy = 0;
      }
    }

    f.x = Math.max(FIGHTER_WIDTH / 2, Math.min(f.x, STAGE_WIDTH - FIGHTER_WIDTH / 2));
  }

  /** Detect forward edge press (just pressed this frame) */
  private forwardJustPressed(input: ResolvedInput): boolean {
    return input.forward && !this.prevForward;
  }

  /** Detect back edge press (just pressed this frame) */
  private backJustPressed(input: ResolvedInput): boolean {
    return input.back && !this.prevBack;
  }

  /** Check if double-tap forward detected */
  private checkDoubleForward(input: ResolvedInput): boolean {
    if (this.forwardJustPressed(input)) {
      const gap = this.tickRef.value - this.lastForwardTick;
      this.lastForwardTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }

  /** Check if double-tap back detected */
  private checkDoubleBack(input: ResolvedInput): boolean {
    if (this.backJustPressed(input)) {
      const gap = this.tickRef.value - this.lastBackTick;
      this.lastBackTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    f.tickTimers();

    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK: {
        f.displayHeight = 100;
        f.vx = 0;

        // Priority 1: Double-tap back → backdash
        if (this.checkDoubleBack(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.BACKDASH;
          f.vx = -BACKDASH_VX * f.facing;
          f.vy = BACKDASH_VY;
          f.displayHeight = 80;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        // Priority 2: Double-tap forward → run
        if (this.checkDoubleForward(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.RUN;
          f.vx = RUN_SPEED * f.facing;
          return;
        }

        // Priority 3: Jump
        if (input.up && f.isGrounded()) {
          f.vy = JUMP_VELOCITY;
          f.state = FighterState.JUMP;
          return;
        }

        // Priority 4: Crouch
        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          return;
        }

        // Priority 5: Throw
        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        // Priority 6: Attack (with special move check)
        const atkJustPressed = input.lightAttackPressed || input.heavyAttackPressed;
        if (atkJustPressed && f.canAct()) {
          const special = this.cmdBuf.checkSpecial(this.tickRef.value, true);
          if (special === AttackType.SPECIAL_PROJECTILE) { f.startAttack(special); return; }
          if (special === AttackType.SPECIAL_UPPER) { f.startAttack(special); return; }
          if (input.heavyAttackPressed) { f.startAttack(AttackType.STAND_HEAVY); return; }
          if (input.lightAttackPressed) { f.startAttack(AttackType.STAND_LIGHT); return; }
        }

        // Walk / idle
        if (input.forward) {
          f.vx = WALK_SPEED * f.facing;
          f.state = FighterState.WALK;
        } else if (input.back) {
          f.vx = -WALK_SPEED * f.facing;
          f.state = FighterState.WALK;
        } else {
          f.state = FighterState.IDLE;
        }
        break;
      }

      case FighterState.RUN: {
        f.displayHeight = 100;
        f.vx = RUN_SPEED * f.facing;

        // Run → Run Jump (longer, faster jump)
        if (input.up && f.isGrounded()) {
          f.state = FighterState.RUN_JUMP;
          f.vy = RUN_JUMP_VY;
          f.vx = RUN_JUMP_VX * f.facing;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        // Run → Crouch slide
        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          f.vx = 0;
          return;
        }

        // Run → Attack
        const atkJustPressed = input.lightAttackPressed || input.heavyAttackPressed;
        if (atkJustPressed && f.canAct()) {
          const special = this.cmdBuf.checkSpecial(this.tickRef.value, true);
          if (special === AttackType.SPECIAL_PROJECTILE) { f.startAttack(special); return; }
          if (special === AttackType.SPECIAL_UPPER) { f.startAttack(special); return; }
          if (input.heavyAttackPressed) { f.startAttack(AttackType.STAND_HEAVY); return; }
          if (input.lightAttackPressed) { f.startAttack(AttackType.STAND_LIGHT); return; }
        }

        // Run → Throw
        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        // Release forward → stop running
        if (!input.forward) {
          f.vx = 0;
          f.state = FighterState.IDLE;
        }
        break;
      }

      case FighterState.BACKDASH: {
        // Fixed trajectory hop — no input control
        f.vy += GRAVITY;
        // Timer-based end (in case physics doesn't land cleanly)
        if (f.isGrounded() && f.vy >= 0) {
          f.state = FighterState.IDLE;
          f.vx = 0;
          f.vy = 0;
          f.displayHeight = 100;
          f.landingRecovery = LANDING_RECOVERY;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        }
        break;
      }

      case FighterState.JUMP: {
        if ((input.lightAttackPressed || input.heavyAttackPressed) && !f.currentAttack) {
          f.startAttack(AttackType.AIR_ATTACK);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.RUN_JUMP: {
        // Running jump — faster horizontal, can air attack
        if ((input.lightAttackPressed || input.heavyAttackPressed) && !f.currentAttack) {
          f.startAttack(AttackType.AIR_ATTACK);
        }
        f.vy += GRAVITY;
        // Maintain horizontal speed (no air control for run jump)
        break;
      }

      case FighterState.CROUCH: {
        f.displayHeight = 50;
        f.vx = 0;
        if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }
        if ((input.lightAttackPressed || input.heavyAttackPressed) && f.canAct()) {
          f.startAttack(AttackType.CROUCH_ATTACK);
          return;
        }
        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }
        break;
      }

      case FighterState.STAND_ATTACK:
      case FighterState.CROUCH_ATTACK:
      case FighterState.AIR_ATTACK:
      case FighterState.THROW: {
        if (f.currentAttack === AttackType.SPECIAL_PROJECTILE && f.attackPhase === 'active' && f.attackFrame === 0) {
          this.projectiles.push(new Projectile(
            f.x + 50 * f.facing, f.y - 50, f.facing,
            FRAME_DATA.SPECIAL_PROJECTILE.active, this.playerIndex,
          ));
        }
        if (f.currentAttack === AttackType.SPECIAL_UPPER && f.attackPhase === 'active') {
          f.vy = -6;
        }
        f.tickAttack();
        if (!f.currentAttack && !f.isGrounded()) {
          f.state = FighterState.JUMP;
        }
        break;
      }

      case FighterState.BLOCK:
        f.blockstunTimer--;
        f.vx *= 0.8;
        if (f.blockstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;

      case FighterState.HITSTUN:
        f.hitstunTimer--;
        f.vx *= 0.85;
        if (f.hitstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;

      case FighterState.KNOCKDOWN:
        f.knockdownTimer--;
        f.vx *= 0.9;
        if (f.knockdownTimer <= 0) {
          f.state = FighterState.IDLE;
          f.isKnockedDown = false;
          f.displayHeight = 100;
          f.vx = 0;
        }
        break;
    }
  }
}

/** Resolve pushbox overlap between two fighters */
export function resolvePushbox(a: Fighter, b: Fighter): void {
  const aBox = a.getPushbox();
  const bBox = b.getPushbox();
  const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (overlap > 0) {
    const push = overlap / 2 + 0.5;
    if (a.x < b.x) { a.x -= push; b.x += push; }
    else { a.x += push; b.x -= push; }
  }
}
