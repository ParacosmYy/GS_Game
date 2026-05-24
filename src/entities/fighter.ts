import {
  AttackPhase,
  Direction,
  BlockType,
  RekkaChain,
  JuggleState,
} from '../core/types.js';
import { CLOSE_RANGE } from '../core/types.js';
import {
  FighterState,
  AttackType,
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
import type { CharacterStats } from '../characters/types.js';

export class Fighter {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  health: number;
  maxHealth: number;
  pushWidth: number;
  facing: Direction;
  state: FighterState = FighterState.IDLE;
  color: string;
  charId: string = 'kyo'; // character ID for visual lookup

  // Attack state
  currentAttack: AttackType | null = null;
  attackFrame = 0;
  attackPhase: AttackPhase = 'none';
  hasHit = false; // Prevent multi-hit in one active phase

  // Guard gauge (0–100, depleted by blocking attacks)
  guardGauge = 100;
  guardCrushTimer = 0;

  // State timers
  hitstunTimer = 0;
  blockstunTimer = 0;
  knockdownTimer = 0;
  landingRecovery = 0;
  rollTimer = 0;
  blockType: BlockType = 'HIGH';

  // Rekka chain state (荒咬み/毒咬み)
  rekkaChain: RekkaChain = null;
  rekkaWindow = 0;  // frames remaining to input followup

  // Run stop delay (A5: can't instantly block out of run)
  runStopTimer = 0;

  // Juggle state (B7: floating/juggle tracking)
  juggleState: JuggleState = JuggleState.NONE;
  airHitCount = 0; // how many air hits in current combo

  // Visual height (for crouch)
  displayHeight = FIGHTER_HEIGHT;

  // Knockdown state
  isKnockedDown = false;
  isHardKnockdown = false;

  // Throw escape state (defender side)
  isBeingThrown = false;
  throwEscapeTimer = 0;

  // Throw execution state (attacker side)
  isThrowing = false;
  throwVictim: Fighter | null = null;

  // Super cancel tracking (P9-F)
  superCancelReady = false;

  // Counter Wire: currently bouncing off wall from counter wire
  isCounterWire = false;

  // Previous frame state tracking (for combo reset detection)
  private _prevState: FighterState = FighterState.IDLE;
  get prevState(): FighterState { return this._prevState; }
  savePrevState(): void { this._prevState = this.state; }

  constructor(x: number, color: string, facing: Direction) {
    this.x = x;
    this.y = STAGE_GROUND_Y;
    this.color = color;
    this.facing = facing;
    this.health = MAX_HEALTH;
    this.maxHealth = MAX_HEALTH;
    this.pushWidth = PUSH_BOX_WIDTH;
  }

  /** Apply character-specific stats */
  setStats(stats: CharacterStats): void {
    this.maxHealth = stats.maxHealth;
    this.health = stats.maxHealth;
    this.pushWidth = stats.pushWidth;
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
      x: this.x - this.pushWidth / 2,
      y: this.y - this.displayHeight,
      width: this.pushWidth,
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
    this.superCancelReady = false;

    // Determine state from attack type
    const name = attackType as string;
    if (name.startsWith('CROUCH')) {
      this.state = FighterState.CROUCH_ATTACK;
    } else if (name.startsWith('JUMP')) {
      this.state = FighterState.AIR_ATTACK;
    } else if (attackType === AttackType.THROW) {
      this.state = FighterState.THROW;
    } else {
      // STAND_*, CLOSE_*, CMD_*, KYO_*, SPECIAL_*, DM_*, STAND_CD
      this.state = FighterState.STAND_ATTACK;
    }

    // Set rekka chain state for followup tracking
    if (attackType === AttackType.KYO_ARAGAMI) {
      this.rekkaChain = 'aragami';
    } else if (attackType === AttackType.KYO_DOKUGAMI) {
      this.rekkaChain = 'dokugami';
    } else {
      this.rekkaChain = null;
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
    this.superCancelReady = false;
    this.isCounterWire = false;
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
    this.superCancelReady = false;
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
  applyKnockdown(frames: number, hard: boolean = false): void {
    this.state = FighterState.KNOCKDOWN;
    this.knockdownTimer = frames;
    this.isKnockedDown = true;
    this.isHardKnockdown = hard;
    this.currentAttack = null;
    this.attackPhase = 'none';
    this.superCancelReady = false;
  }

  /** Can the fighter act (accept input) right now? */
  canAct(): boolean {
    if (this.landingRecovery > 0) return false;
    return (
      this.state === FighterState.IDLE ||
      this.state === FighterState.WALK ||
      this.state === FighterState.CROUCH ||
      this.state === FighterState.RUN
    );
  }

  /** Decrement per-frame timers (call once per logic frame) */
  tickTimers(): void {
    if (this.landingRecovery > 0) this.landingRecovery--;
    if (this.runStopTimer > 0) this.runStopTimer--;
    // Guard gauge recovery: +0.5/frame when NOT blocking
    if (this.state !== FighterState.BLOCK && this.guardGauge < 100) {
      this.guardGauge = Math.min(100, this.guardGauge + 0.5);
    }
  }

  /** Is the fighter in a state where blocking is possible? */
  canBlock(): boolean {
    if (this.runStopTimer > 0) return false; // A5: run stop delay
    return (
      this.state === FighterState.IDLE ||
      this.state === FighterState.WALK ||
      this.state === FighterState.CROUCH ||
      this.state === FighterState.BLOCK
      // RUN intentionally excluded — must wait for runStopTimer
    );
  }

  /** Is the fighter in a rolling state (invincible to attacks but not throws)? */
  isRolling(): boolean {
    return (this.state === FighterState.ROLL || this.state === FighterState.BACK_ROLL)
      && this.rollTimer > 0;
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
    this.health = this.maxHealth;
    this.state = FighterState.IDLE;
    this.currentAttack = null;
    this.attackFrame = 0;
    this.attackPhase = 'none';
    this.hasHit = false;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.knockdownTimer = 0;
    this.landingRecovery = 0;
    this.displayHeight = FIGHTER_HEIGHT;
    this.isKnockedDown = false;
    this.isHardKnockdown = false;
    this.isBeingThrown = false;
    this.throwEscapeTimer = 0;
    this.isThrowing = false;
    this.throwVictim = null;
    this.rollTimer = 0;
    this.rekkaChain = null;
    this.rekkaWindow = 0;
    this.runStopTimer = 0;
    this.guardGauge = 100;
    this.guardCrushTimer = 0;
    this.juggleState = JuggleState.NONE;
    this.airHitCount = 0;
    this.superCancelReady = false;
    this.isCounterWire = false;
  }
}
