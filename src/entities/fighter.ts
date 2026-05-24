import {
  FighterState,
  AttackType,
  AttackPhase,
  PlayerInput,
  Direction,
  BlockType,
} from '../core/types.js';
import {
  STAGE_GROUND_Y,
  FIGHTER_WIDTH,
  FIGHTER_HEIGHT,
  MAX_HEALTH,
  PUSH_BOX_WIDTH,
  FRAME_DATA,
  HITBOX_OFFSETS,
} from '../core/constants.js';

export class Fighter {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  health: number;
  maxHealth: number;
  facing: Direction;
  state: FighterState = FighterState.IDLE;
  color: string;

  // Attack state
  currentAttack: AttackType | null = null;
  attackFrame = 0;
  attackPhase: AttackPhase = 'none';
  hasHit = false; // Prevent multi-hit in one active phase

  // State timers
  hitstunTimer = 0;
  blockstunTimer = 0;
  knockdownTimer = 0;
  landingRecovery = 0;
  blockType: BlockType = 'HIGH';

  // Buffered input
  bufferedInput: PlayerInput | null = null;

  // Visual height (for crouch)
  displayHeight = FIGHTER_HEIGHT;

  // Knockdown state
  isKnockedDown = false;

  constructor(x: number, color: string, facing: Direction) {
    this.x = x;
    this.y = STAGE_GROUND_Y;
    this.color = color;
    this.facing = facing;
    this.health = MAX_HEALTH;
    this.maxHealth = MAX_HEALTH;
  }

  /** Update auto-facing toward opponent */
  updateFacing(opponent: Fighter): void {
    if (this.state === FighterState.HITSTUN || this.state === FighterState.KNOCKDOWN) return;
    this.facing = opponent.x > this.x ? 1 : -1;
  }

  /** Get the world-space hurtbox (the fighter's body) */
  getHurtbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - FIGHTER_WIDTH / 2,
      y: this.y - this.displayHeight,
      width: FIGHTER_WIDTH,
      height: this.displayHeight,
    };
  }

  /** Get the pushbox (for preventing overlap) */
  getPushbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - PUSH_BOX_WIDTH / 2,
      y: this.y - this.displayHeight,
      width: PUSH_BOX_WIDTH,
      height: this.displayHeight,
    };
  }

  /** Get the active hitbox in world coordinates, or null if not attacking */
  getActiveHitbox(): { x: number; y: number; width: number; height: number } | null {
    if (this.attackPhase !== 'active' || !this.currentAttack) return null;

    const offset = HITBOX_OFFSETS[this.currentAttack];
    if (!offset) return null;

    return {
      x: this.x + offset.offsetX * this.facing,
      y: this.y + offset.offsetY,
      width: offset.width,
      height: offset.height,
    };
  }

  /** Start an attack */
  startAttack(attackType: AttackType): void {
    this.currentAttack = attackType;
    this.attackFrame = 0;
    this.attackPhase = 'startup';
    this.hasHit = false;

    if (attackType === AttackType.CROUCH_ATTACK) {
      this.state = FighterState.CROUCH_ATTACK;
    } else if (attackType === AttackType.AIR_ATTACK) {
      this.state = FighterState.AIR_ATTACK;
    } else if (attackType === AttackType.THROW) {
      this.state = FighterState.THROW;
    } else {
      this.state = FighterState.STAND_ATTACK;
    }
  }

  /** Progress attack frames */
  tickAttack(): void {
    if (!this.currentAttack) return;

    const data = FRAME_DATA[this.currentAttack];
    this.attackFrame++;

    if (this.attackPhase === 'startup' && this.attackFrame >= data.startup) {
      this.attackPhase = 'active';
      this.attackFrame = 0;
    } else if (this.attackPhase === 'active' && this.attackFrame >= data.active) {
      this.attackPhase = 'recovery';
      this.attackFrame = 0;
    } else if (this.attackPhase === 'recovery' && this.attackFrame >= data.recovery) {
      this.endAttack();
    }
  }

  endAttack(): void {
    this.currentAttack = null;
    this.attackFrame = 0;
    this.attackPhase = 'none';
    this.hasHit = false;
    this.state = FighterState.IDLE;
  }

  /** Apply hitstun */
  applyHitstun(frames: number, pushback: number): void {
    this.state = FighterState.HITSTUN;
    this.hitstunTimer = frames;
    this.vx = pushback * (this.facing === 1 ? -1 : 1);
    this.currentAttack = null;
    this.attackPhase = 'none';
    this.attackFrame = 0;
  }

  /** Apply blockstun */
  applyBlockstun(frames: number, pushback: number): void {
    this.state = FighterState.BLOCK;
    this.blockstunTimer = frames;
    this.vx = pushback * (this.facing === 1 ? -1 : 1);
    this.currentAttack = null;
    this.attackPhase = 'none';
  }

  /** Apply knockdown */
  applyKnockdown(frames: number): void {
    this.state = FighterState.KNOCKDOWN;
    this.knockdownTimer = frames;
    this.isKnockedDown = true;
    this.currentAttack = null;
    this.attackPhase = 'none';
  }

  /** Can the fighter act (accept input) right now? */
  canAct(): boolean {
    return (
      this.state === FighterState.IDLE ||
      this.state === FighterState.WALK ||
      this.state === FighterState.CROUCH
    );
  }

  /** Is the fighter in a state where blocking is possible? */
  canBlock(): boolean {
    return (
      this.state === FighterState.IDLE ||
      this.state === FighterState.WALK ||
      this.state === FighterState.CROUCH
    );
  }

  /** Is the fighter on the ground? */
  isGrounded(): boolean {
    return this.y >= STAGE_GROUND_Y;
  }

  /** Reset fighter to initial state */
  reset(x: number): void {
    this.x = x;
    this.y = STAGE_GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.health = MAX_HEALTH;
    this.state = FighterState.IDLE;
    this.currentAttack = null;
    this.attackFrame = 0;
    this.attackPhase = 'none';
    this.hasHit = false;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.knockdownTimer = 0;
    this.landingRecovery = 0;
    this.bufferedInput = null;
    this.displayHeight = FIGHTER_HEIGHT;
    this.isKnockedDown = false;
  }
}
