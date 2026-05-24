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
  ROLL_DURATION,
  ROLL_INVINCIBLE_END,
  BACKDASH_DURATION,
  BACKDASH_INVINCIBLE_FRAMES,
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

  // Backdash timer (for invincibility window tracking)
  backdashTimer = 0;

  // Guard Cancel Roll flag — fully invincible unlike normal roll
  isGCRoll = false;

  // Throw invincibility frames remaining (set after blockstun/hitstun/wakeup/jump)
  throwInvincibilityTimer = 0;

  // Throw input buffer — pressing throw during blockstun stores it for 3F after recovery
  throwBufferTimer = 0;
  throwBufferDirection: 'forward' | 'back' | 'neutral' = 'neutral';

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

  // Throw invincibility
  throwInvulnFrames: number = 0;  // 投技无敌帧计数器
  // Hurtbox invincibility
  invincible: boolean = false;    // 完全无敌(受击框消失)
  wakeupInvulnFrames = 0;          // 起身完全无敌帧(正常起身, 非Quick Stand)

  // Throw escape state (defender side)
  isBeingThrown = false;
  throwEscapeTimer = 0;
  throwDirection: Direction = 1;

  // Throw execution state (attacker side)
  isThrowing = false;
  throwVictim: Fighter | null = null;

  // Super cancel tracking (P9-F)
  superCancelReady = false;

  // Cancel event — set when a cancel occurs, cleared by main.ts after VFX trigger
  cancelEvent: 'super_cancel' | 'free_cancel' | 'rapid_cancel' | 'command_cancel' | null = null;

  // Rapid cancel (轻攻击链): set true when a light normal hits, allows chaining into next light normal
  rapidCancelReady = false;

  // Normal → Command Normal cancel: set true when a normal attack hits, allows cancel into command normal
  normalCancelReady = false;

  // True when current attack was cancelled into from a previous normal (not raw).
  // Cancelled-into command normals LOSE special properties (overhead/low/KD) but CAN cancel into specials.
  cancelledIntoNormal = false;

  // Counter Wire: currently bouncing off wall from counter wire
  isCounterWire = false;

  // Hit flash: bright white overlay on hit for visual feedback (counts down from 4)
  hitFlashFrames = 0;

  // Previous frame state tracking (for combo reset detection)
  private _prevState: FighterState = FighterState.IDLE;
  get prevState(): FighterState { return this._prevState; }
  savePrevState(): void { this._prevState = this.state; }

  // Character stats reference (for per-character throw range etc.)
  private charStats: CharacterStats | null = null;

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
    this.charStats = stats;
  }

  /** Update auto-facing toward opponent */
  updateFacing(opponent: Fighter): void {
    // KOF2002: facing locked during hitstun, knockdown, and attack active phase
    if (this.state === FighterState.HITSTUN || this.state === FighterState.KNOCKDOWN) return;
    if (this.attackPhase === 'active' || this.attackPhase === 'startup') return;
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

  /** Get the throw box for throw-type attacks (world space) */
  getThrowbox(): { x: number; y: number; width: number; height: number } | null {
    if (this.attackPhase !== 'active' || !this.currentAttack) return null;
    if (this.throwInvulnFrames > 0) return null;

    const perFrame = ATTACK_FRAMES[this.currentAttack];
    if (perFrame && this.attackFrame < perFrame.length) {
      const frame = perFrame[this.attackFrame];
      if (frame.throwBoxes && frame.throwBoxes.length > 0) {
        const box = frame.throwBoxes[0];
        return {
          x: this.x + box.ox * this.facing,
          y: this.y + box.oy,
          width: box.w,
          height: box.h,
        };
      }
    }

    // 普通投: 使用角色专属投技距离
    const isThrowAttack = this.currentAttack === AttackType.THROW
      || this.currentAttack === AttackType.THROW_FORWARD
      || this.currentAttack === AttackType.THROW_BACK;
    if (isThrowAttack) {
      const range = this.charStats?.throwRange ?? 100;
      return {
        x: this.facing > 0 ? this.x : this.x - range,
        y: this.y - this.displayHeight,
        width: range,
        height: this.displayHeight,
      };
    }
    return null;
  }

  /** 是否可被投(防御中/被击中/倒地时/空中不可被投) */
  isThrowVulnerable(): boolean {
    if (this.throwInvulnFrames > 0) return false;
    if (!this.isGrounded()) return false; // KOF2002: 空中不可被地面投技
    if (this.state === FighterState.HITSTUN) return false;
    if (this.state === FighterState.KNOCKDOWN) return false;
    if (this.state === FighterState.BLOCK) return false;
    if (this.state === FighterState.AIR_BLOCK) return false;
    if (this.state === FighterState.THROW) return false;
    if (this.state === FighterState.GUARD_CRUSH) return false;
    // Guard Cancel Roll is unthrowable (KOF2002)
    if (this.isRolling() && this.isGCRoll) return false;
    // Normal roll: throwable at any point (KOF2002)
    return true;
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

  /** Get the effective hurtbox (with body override if applicable, null if invincible) */
  getEffectiveHurtbox(): { x: number; y: number; width: number; height: number } | null {
    if (this.invincible) return null;
    return this.getBodyOverride() ?? this.getHurtbox();
  }

  /** Reset cancel flags — called from multiple state transitions */
  resetCancelFlags(): void {
    this.superCancelReady = false;
    this.rapidCancelReady = false;
    this.normalCancelReady = false;
    this.cancelledIntoNormal = false;
    this.cancelEvent = null;
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
    this.throwBufferTimer = 0;
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
    if (this.throwInvulnFrames > 0) this.throwInvulnFrames--;
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
    this.hitFlashFrames = 4;
    // KOF2002: pushback as gradual velocity over hitstun duration
    this.vx = pushback * (this.facing === 1 ? -1 : 1) * 0.6;
    this.resetAttackState();
    this.resetCancelFlags();
  }

  /** Apply blockstun */
  applyBlockstun(frames: number, pushback: number): void {
    this.state = FighterState.BLOCK;
    this.blockstunTimer = frames;
    // KOF2002: block pushback is stronger than hit pushback
    this.vx = pushback * (this.facing === 1 ? -1 : 1) * 0.8;
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
    if (this.hitFlashFrames > 0) this.hitFlashFrames--;
    if (this.throwBufferTimer > 0) this.throwBufferTimer--;
    // MAX activation invincibility countdown
    if (this.throwInvulnFrames > 0) {
      this.throwInvulnFrames--;
      if (this.throwInvulnFrames <= 0 && this.invincible) this.invincible = false;
    }
    // 起身完全无敌倒计时
    if (this.wakeupInvulnFrames > 0) {
      this.wakeupInvulnFrames--;
      if (this.wakeupInvulnFrames <= 0) this.invincible = false;
    }
    // Guard gauge recovery: varies by state (KOF2002正版)
    // IDLE/WALK: 0.25/F, RUN: 0.15/F (跑步恢复慢), HITSTUN: 不恢复, BLOCK: 不恢复
    if (this.guardGauge < 100) {
      if (this.state === FighterState.BLOCK || this.state === FighterState.HITSTUN
        || this.state === FighterState.KNOCKDOWN || this.state === FighterState.GUARD_CRUSH) {
        // 被打/防御中不恢复
      } else if (this.state === FighterState.RUN) {
        this.guardGauge = Math.min(100, this.guardGauge + 0.15);
      } else {
        this.guardGauge = Math.min(100, this.guardGauge + 0.25);
      }
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

  /** Is the fighter in the invincible portion of a roll? (first ROLL_INVINCIBLE_END frames, or entire GC Roll) */
  isRollInvincible(): boolean {
    if (this.state !== FighterState.ROLL && this.state !== FighterState.BACK_ROLL) return false;
    if (this.rollTimer <= 0) return false;
    // Guard Cancel Roll is fully invincible
    if (this.isGCRoll) return true;
    // Normal roll: only first portion is invincible
    return (ROLL_DURATION - this.rollTimer) < ROLL_INVINCIBLE_END;
  }

  /** Is the fighter in a rolling state (for visual/detection purposes) */
  isRolling(): boolean {
    return (this.state === FighterState.ROLL || this.state === FighterState.BACK_ROLL)
      && this.rollTimer > 0;
  }

  /** Is the fighter in the invincible portion of backdash? (first BACKDASH_INVINCIBLE_FRAMES frames) */
  isBackdashInvincible(): boolean {
    return this.state === FighterState.BACKDASH
      && this.backdashTimer > 0
      && (BACKDASH_DURATION - this.backdashTimer) < BACKDASH_INVINCIBLE_FRAMES;
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
    this.throwBufferTimer = 0;
    this.isBeingThrown = false;
    this.throwEscapeTimer = 0;
    this.isThrowing = false;
    this.throwVictim = null;
    this.rollTimer = 0;
    this.backdashTimer = 0;
    this.isGCRoll = false;
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
    this.throwInvulnFrames = 0;
    this.invincible = false;
    this.state = FighterState.IDLE;
  }
}
