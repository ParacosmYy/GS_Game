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
import type { FrameBox } from '../core/types.js';
import {
  STAGE_GROUND_Y,
  FIGHTER_WIDTH,
  FIGHTER_HEIGHT,
  MAX_HEALTH,
  PUSH_BOX_WIDTH,
  FRAME_DATA,
  HITBOX_OFFSETS,
} from '../core/constants.js';
import { ATTACK_FRAMES } from '../core/attackFrames.js';
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
  hasAttackedInAir = false; // Per-jump air attack limit (1 per jump)

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

  // Throw invincibility frames remaining (set after blockstun/hitstun/wakeup/jump)
  throwInvincibilityTimer = 0;

  // Juggle state (B7: floating/juggle tracking)
  juggleState: JuggleState = JuggleState.NONE;
  airHitCount = 0; // how many air hits in current combo
  jugglePoints = 0; // remaining juggle budget (KOF2002: each air hit consumes points)

  // Visual height (for crouch)
  displayHeight = FIGHTER_HEIGHT;

  // Knockdown state
  isKnockedDown = false;
  isHardKnockdown = false;
  usedQuickStand = false;

  // Throw escape state (defender side)
  isBeingThrown = false;
  throwEscapeTimer = 0;
  throwDirection: Direction = 1;

  // Throw execution state (attacker side)
  isThrowing = false;
  throwVictim: Fighter | null = null;

  // Super cancel tracking (P9-F)
  superCancelReady = false;

  // Rapid cancel (轻攻击链): set true when a light normal hits, allows chaining into next light normal
  rapidCancelReady = false;

  // Normal → Command Normal cancel: set true when a normal attack hits, allows cancel into command normal
  normalCancelReady = false;

  // True when current attack was cancelled into from a previous normal (not raw).
  // Cancelled-into command normals LOSE special properties (overhead/low/KD) but CAN cancel into specials.
  cancelledIntoNormal = false;

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

    // 优先使用逐帧判定框
    const perFrame = ATTACK_FRAMES[this.currentAttack];
    if (perFrame && this.attackFrame < perFrame.length) {
      const frame = perFrame[this.attackFrame];
      if (frame.attack.length > 0) {
        const box = frame.attack[0];
        return {
          x: this.x + box.ox * this.facing,
          y: this.y + box.oy,
          width: box.w,
          height: box.h,
        };
      }
    }

    // 降级到旧的 HITBOX_OFFSETS
    const offset = HITBOX_OFFSETS[this.currentAttack];
    if (!offset) return null;

    return {
      x: this.x + offset.offsetX * this.facing,
      y: this.y + offset.offsetY,
      width: offset.width,
      height: offset.height,
    };
  }

  /** Get all active hitboxes for current frame (multi-box support) */
  getActiveHitboxes(): { x: number; y: number; width: number; height: number }[] {
    if (this.attackPhase !== 'active' || !this.currentAttack) return [];

    const perFrame = ATTACK_FRAMES[this.currentAttack];
    if (perFrame && this.attackFrame < perFrame.length) {
      const frame = perFrame[this.attackFrame];
      return frame.attack.map(box => ({
        x: this.x + box.ox * this.facing,
        y: this.y + box.oy,
        width: box.w,
        height: box.h,
      }));
    }

    // 降级到旧系统
    const single = this.getActiveHitbox();
    return single ? [single] : [];
  }

  /** Get the hurtbox override for current attack frame, or null for default */
  getBodyOverride(): { x: number; y: number; width: number; height: number } | null {
    if (this.attackPhase !== 'active' || !this.currentAttack) return null;

    const perFrame = ATTACK_FRAMES[this.currentAttack];
    if (perFrame && this.attackFrame < perFrame.length) {
      const frame = perFrame[this.attackFrame];
      if (frame.bodyOverride) {
        const bo = frame.bodyOverride;
        const base = this.getHurtbox();
        return {
          x: base.x + bo.ox,
          y: base.y + bo.oy,
          width: base.width + bo.w,
          height: base.height + bo.h,
        };
      }
    }
    return null;
  }

  /** Get the effective hurtbox (with body override if applicable) */
  getEffectiveHurtbox(): { x: number; y: number; width: number; height: number } {
    return this.getBodyOverride() ?? this.getHurtbox();
  }

  /** Reset cancel flags — called from multiple state transitions */
  resetCancelFlags(): void {
    this.superCancelReady = false;
    this.rapidCancelReady = false;
    this.normalCancelReady = false;
    this.cancelledIntoNormal = false;
  }

  /** Reset attack state — called from endAttack, applyHitstun, applyBlockstun, applyKnockdown */
  resetAttackState(): void {
    this.currentAttack = null;
    this.attackFrame = 0;
    this.attackPhase = 'none';
  }

  /** Start an attack */
  startAttack(attackType: AttackType): void {
    this.currentAttack = attackType;
    this.attackFrame = 0;
    this.attackPhase = 'startup';
    this.hasHit = false;
    this.resetCancelFlags();

    // Mark air attack used
    if (FighterState.JUMP === this.state || FighterState.HOP === this.state || FighterState.RUN_JUMP === this.state || FighterState.HYPER_JUMP === this.state) {
      this.hasAttackedInAir = true;
    }

    // Determine state from attack type
    const name = attackType as string;
    if (name.startsWith('CROUCH')) {
      this.state = FighterState.CROUCH_ATTACK;
    } else if (name.startsWith('JUMP')) {
      this.state = FighterState.AIR_ATTACK;
    } else if (attackType === AttackType.THROW || attackType === AttackType.THROW_FORWARD || attackType === AttackType.THROW_BACK) {
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
    this.resetAttackState();
    this.hasHit = false;
    this.resetCancelFlags();
    this.isCounterWire = false;
    this.state = FighterState.IDLE;
  }

  /** Apply hitstun */
  applyHitstun(frames: number, pushback: number): void {
    this.state = FighterState.HITSTUN;
    this.hitstunTimer = frames;
    this.vx = pushback * (this.facing === 1 ? -1 : 1);
    this.resetAttackState();
    this.resetCancelFlags();
  }

  /** Apply blockstun */
  applyBlockstun(frames: number, pushback: number): void {
    this.state = FighterState.BLOCK;
    this.blockstunTimer = frames;
    this.vx = pushback * (this.facing === 1 ? -1 : 1);
    this.resetAttackState();
  }

  /** Apply knockdown */
  applyKnockdown(frames: number, hard: boolean = false): void {
    this.state = FighterState.KNOCKDOWN;
    this.knockdownTimer = frames;
    this.isKnockedDown = true;
    this.isHardKnockdown = hard;
    this.resetAttackState();
    this.resetCancelFlags();
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
    if (this.throwInvincibilityTimer > 0) this.throwInvincibilityTimer--;
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
      this.state === FighterState.BLOCK ||
      this.state === FighterState.AIR_BLOCK
    );
  }

  /** Is the fighter in a state where air blocking is possible? */
  canAirBlock(): boolean {
    return !this.isGrounded() && (
      this.state === FighterState.JUMP ||
      this.state === FighterState.RUN_JUMP ||
      this.state === FighterState.HOP ||
      this.state === FighterState.HYPER_JUMP ||
      this.state === FighterState.AIR_ATTACK ||
      this.state === FighterState.AIR_BLOCK
    );
  }

  /** Apply air blockstun */
  applyAirBlockstun(frames: number, pushback: number): void {
    this.state = FighterState.AIR_BLOCK;
    this.blockstunTimer = frames;
    this.vx = pushback * (this.facing === 1 ? -1 : 1) * 0.5;
    this.resetAttackState();
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
    this.resetAttackState();
    this.hasHit = false;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.knockdownTimer = 0;
    this.landingRecovery = 0;
    this.displayHeight = FIGHTER_HEIGHT;
    this.isKnockedDown = false;
    this.isHardKnockdown = false;
    this.usedQuickStand = false;
    this.throwInvincibilityTimer = 0;
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
    this.jugglePoints = 0;
    this.airHitCount = 0;
    this.resetCancelFlags();
    this.isCounterWire = false;
    this.hasAttackedInAir = false;
    this.state = FighterState.IDLE;
  }
}
