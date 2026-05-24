import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  WALK_SPEED, RUN_SPEED, GRAVITY, JUMP_VELOCITY,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION,
  DOUBLE_TAP_WINDOW, RUN_JUMP_VX, RUN_JUMP_VY,
  HOP_THRESHOLD, HOP_VELOCITY, HYPER_JUMP_VY, HYPER_JUMP_VX, HYPER_CHARGE_WINDOW,
  ROLL_SPEED, ROLL_DURATION, ROLL_INVINCIBLE_END, ROLL_RECOVERY,
  FRAME_DATA, LANDING_RECOVERY,
} from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';
import type { VFXSystem } from '../rendering/vfx.js';

/**
 * Per-frame fighter state controller.
 * Routes A/B/C/D buttons to correct AttackType per stance,
 * handles double-tap dash, special moves, physics, pushbox.
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
  private prevDown = false;

  // Hop detection: track how long UP has been held
  private upHoldFrames = 0;
  private upWasPressed = false;
  private lastDownTick = -999; // for hyper jump detection

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

  update(input: ResolvedInput): void {
    this.tickStateMachine(input);
    this.prevForward = input.forward;
    this.prevBack = input.back;
    this.prevDown = input.down;
    // Track UP hold for hop detection
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
      const wasAirborne = f.state === FighterState.JUMP
        || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.HOP
        || f.state === FighterState.HYPER_JUMP
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

  private forwardJustPressed(input: ResolvedInput): boolean {
    return input.forward && !this.prevForward;
  }

  private backJustPressed(input: ResolvedInput): boolean {
    return input.back && !this.prevBack;
  }

  private checkDoubleForward(input: ResolvedInput): boolean {
    if (this.forwardJustPressed(input)) {
      const gap = this.tickRef.value - this.lastForwardTick;
      this.lastForwardTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }

  private checkDoubleBack(input: ResolvedInput): boolean {
    if (this.backJustPressed(input)) {
      const gap = this.tickRef.value - this.lastBackTick;
      this.lastBackTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }

  /** Check if UP was just released this frame (for hop) */
  private upJustReleased(input: ResolvedInput): boolean {
    return !input.up && this.upWasPressed;
  }

  /** Check hyper jump: ↓ was pressed within HYPER_CHARGE_WINDOW frames before ↑ */
  private checkHyperJump(): boolean {
    const gap = this.tickRef.value - this.lastDownTick;
    return gap > 0 && gap <= HYPER_CHARGE_WINDOW;
  }

  /** Determine AttackType based on stance + button */
  private routeAttack(input: ResolvedInput): AttackType | null {
    const f = this.fighter;

    if (f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP) {
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

    // Stand / Walk / Run
    if (input.buttonAPressed) return AttackType.STAND_A;
    if (input.buttonBPressed) return AttackType.STAND_B;
    if (input.buttonCPressed) return AttackType.STAND_C;
    if (input.buttonDPressed) return AttackType.STAND_D;
    return null;
  }

  /** Try special move (punch buttons only: A or C) */
  private trySpecialMove(input: ResolvedInput): AttackType | null {
    if (!input.punchPressed) return null;
    const special = this.cmdBuf.checkSpecial(this.tickRef.value, true);
    if (special === AttackType.SPECIAL_PROJECTILE) return special;
    if (special === AttackType.SPECIAL_UPPER) return special;
    return null;
  }

  /** Try DM super move (punch buttons) */
  private tryDM(input: ResolvedInput): AttackType | null {
    if (!input.punchPressed) return null;
    return this.cmdBuf.checkDM(this.tickRef.value, true);
  }

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    f.tickTimers();

    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK: {
        f.displayHeight = 100;
        f.vx = 0;

        // Priority 0: Roll紧急回避 (A+B)
        if (input.rollPressed && f.canAct() && f.isGrounded()) {
          if (input.back) {
            f.state = FighterState.BACK_ROLL;
          } else {
            f.state = FighterState.ROLL;
          }
          f.rollTimer = ROLL_DURATION;
          f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
          f.displayHeight = 60;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        // Priority 0.5: CD Blowback (C+D)
        if (input.blowbackPressed && f.canAct()) {
          f.startAttack(AttackType.STAND_CD);
          return;
        }

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

        // Priority 3: Jump / Hop / Hyper Jump
        if (this.upJustReleased(input) && f.isGrounded() && this.upHoldFrames > 0) {
          if (this.upHoldFrames <= HOP_THRESHOLD) {
            // 小跳 (短按↑)
            f.vy = HOP_VELOCITY;
            f.state = FighterState.HOP;
          } else if (this.checkHyperJump()) {
            // 大跳 (↓→↑)
            f.vy = HYPER_JUMP_VY;
            f.vx = HYPER_JUMP_VX * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.HYPER_JUMP;
            this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          } else {
            // 普通跳 (长按↑松开)
            f.vy = JUMP_VELOCITY;
            f.state = FighterState.JUMP;
          }
          return;
        }

        // Track ↓ press for hyper jump
        if (input.down && !this.prevDown) {
          this.lastDownTick = this.tickRef.value;
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

        // Priority 5.5: DM super move (check before normal special)
        if (input.punchPressed && f.canAct()) {
          const dm = this.tryDM(input);
          if (dm) { f.startAttack(dm); return; }
        }

        // Priority 6: Special move (punch buttons + motion)
        if (input.punchPressed && f.canAct()) {
          const special = this.trySpecialMove(input);
          if (special) { f.startAttack(special); return; }
        }

        // Priority 7: Normal attack (route by stance + button)
        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
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

        if (input.up && f.isGrounded()) {
          f.state = FighterState.RUN_JUMP;
          f.vy = RUN_JUMP_VY;
          f.vx = RUN_JUMP_VX * f.facing;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          f.vx = 0;
          return;
        }

        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        if (input.punchPressed && f.canAct()) {
          const special = this.trySpecialMove(input);
          if (special) { f.startAttack(special); return; }
        }

        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
        }

        if (!input.forward) {
          f.vx = 0;
          f.state = FighterState.IDLE;
        }
        break;
      }

      case FighterState.BACKDASH: {
        f.vy += GRAVITY;
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

      case FighterState.ROLL:
      case FighterState.BACK_ROLL: {
        f.rollTimer--;
        f.displayHeight = 60;
        if (f.rollTimer <= 0) {
          f.state = FighterState.IDLE;
          f.vx = 0;
          f.displayHeight = 100;
          f.landingRecovery = ROLL_RECOVERY;
        }
        break;
      }

      case FighterState.HOP: {
        // 小跳: 短弧线, 可以空中攻击
        if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const atk = this.routeAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.HYPER_JUMP: {
        if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const atk = this.routeAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.JUMP:
      case FighterState.RUN_JUMP: {
        // Air CD blowback
        if (input.blowbackPressed && !f.currentAttack) {
          f.startAttack(AttackType.JUMP_CD);
        } else if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const atk = this.routeAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.CROUCH: {
        f.displayHeight = 50;
        f.vx = 0;
        if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }

        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
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
