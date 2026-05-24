import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  WALK_SPEED, GRAVITY, JUMP_VELOCITY,
  FRAME_DATA, LANDING_RECOVERY,
} from '../core/constants.js';
import { FighterState, AttackType, Direction } from '../core/types.js';
import type { VFXSystem } from '../rendering/vfx.js';

/**
 * Per-frame fighter state controller.
 * Handles input → state transitions, attack spawning, physics, pushbox.
 */
export class FighterController {
  private fighter: Fighter;
  private playerIndex: number;
  private cmdBuf: CommandBuffer;
  private vfx: VFXSystem;
  private projectiles: Projectile[];
  private tickRef: { value: number };

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
  }

  /** Apply gravity and clamping */
  applyPhysics(): void {
    const f = this.fighter;
    f.x += f.vx;
    f.y += f.vy;

    if (f.y >= STAGE_GROUND_Y) {
      if (f.state === FighterState.JUMP || f.state === FighterState.AIR_ATTACK) {
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

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK: {
        f.displayHeight = 100;
        f.vx = 0;

        if (input.up && f.isGrounded()) {
          f.vy = JUMP_VELOCITY;
          f.state = FighterState.JUMP;
          return;
        }
        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          return;
        }
        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        const atkJustPressed = input.lightAttackPressed || input.heavyAttackPressed;
        if (atkJustPressed && f.canAct()) {
          const special = this.cmdBuf.checkSpecial(this.tickRef.value, true);
          if (special === AttackType.SPECIAL_PROJECTILE) { f.startAttack(special); return; }
          if (special === AttackType.SPECIAL_UPPER) { f.startAttack(special); return; }
          if (input.heavyAttackPressed) { f.startAttack(AttackType.STAND_HEAVY); return; }
          if (input.lightAttackPressed) { f.startAttack(AttackType.STAND_LIGHT); return; }
        }

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

      case FighterState.JUMP: {
        if ((input.lightAttackPressed || input.heavyAttackPressed) && !f.currentAttack) {
          f.startAttack(AttackType.AIR_ATTACK);
        }
        f.vy += GRAVITY;
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
