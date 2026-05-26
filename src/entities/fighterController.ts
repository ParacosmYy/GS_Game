import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CharacterDefinition, CharacterStats } from '../characters/types.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  STAGE_LEFT, STAGE_RIGHT,
  GRAVITY,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION, BACKDASH_INVINCIBLE_FRAMES,
  DOUBLE_TAP_WINDOW, HYPER_CHARGE_WINDOW,
  CHARGE_FRAMES_REQUIRED,
  HOP_THRESHOLD,
  ROLL_SPEED, ROLL_DURATION, ROLL_RECOVERY,
  LANDING_RECOVERY, HOP_LANDING_RECOVERY, JUMP_LANDING_RECOVERY, AIR_ATTACK_LANDING_RECOVERY,
  DM_STOCK_COST,
  PROXIMITY_GUARD_RANGE,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  THROW_INVINCIBILITY_JUMP_STARTUP,
  THROW_INVINCIBILITY_LANDING,
  FRAME_DATA,
  WAKEUP_BUFFER_WINDOW,
} from '../core/constants.js';
import { FighterState, AttackType, CLOSE_RANGE, JuggleState } from '../core/types.js';
import type { PowerGauge, MaxModeState, CounterConfig } from '../core/types.js';
import { spendStocks } from '../combat/meter.js';
import { playWallBounce, playGroundBounce } from '../audio/sampler.js';
import type { VFXSystem } from '../rendering/vfx.js';
import type { FighterCtx } from './stateContext.js';
import {
  handleIdleWalk, handleRun, handleBackdash, handleRoll,
  handleHop, handleJump, handleCrouch, handleAttack,
  handleBlock, handleAirBlock, handleGuardCrush,
  handleCounterStance, handleHitstun, handleKnockdown, handleGetup, handleTaunt, handleDizzy,
} from './stateHandlers.js';

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
  private chargeDownFrames = 0;
  private wasChargingDown = false;
  private wakeupBuffer: ResolvedInput | null = null;
  private cancelSpecialBuffer: AttackType | null = null;
  private recoveryRollRequested = false;

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
    if (input.down && !input.up) {
      this.chargeDownFrames++;
      this.wasChargingDown = true;
    } else if (this.wasChargingDown && input.up && this.chargeDownFrames >= 20) {
      this.wasChargingDown = false;
    } else if (!input.down) {
      if (this.chargeDownFrames < 20) this.wasChargingDown = false;
      this.chargeDownFrames = 0;
    }

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

  /** Check if a charge release (↓蓄↑) is available and consume it */
  consumeChargeRelease(): boolean {
    const chargeState = this.cmdBuf.getChargeState('down');
    if (chargeState.ready) {
      // Use the buffer's charge release detection
      return true;
    }
    // Fallback: old local counter for backward compatibility
    if (this.chargeDownFrames >= CHARGE_FRAMES_REQUIRED) {
      this.chargeDownFrames = 0;
      this.wasChargingDown = false;
      return true;
    }
    return false;
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
        f.vx = -f.vx * 0.6;
        f.vy = -3;
        f.isCounterWire = false;
        const wallX = f.x <= leftBound ? leftBound : rightBound;
        this.vfx.spawnCounterWireSparks(wallX, f.y - f.displayHeight / 2);
        f.juggleState = JuggleState.FULL;
        f.jugglePoints = 3;
        // Wall bounce SFX
        playWallBounce();
      }
    } else if (f.state === FighterState.HITSTUN || f.state === FighterState.BLOCK
        || f.state === FighterState.KNOCKDOWN || f.state === FighterState.GETUP
        || f.state === FighterState.GUARD_CRUSH) {
      f.x += f.vx;
      f.vx *= 0.75;
      if (Math.abs(f.vx) < 0.1) f.vx = 0;
      f.y += f.vy;
    } else {
      f.x += f.vx;
      f.y += f.vy;
    }

    if (f.y < STAGE_GROUND_Y) {
      f.vy += GRAVITY;
    }

    if (f.y >= STAGE_GROUND_Y) {
      const wasAirborne = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP
        || f.state === FighterState.BACKDASH || f.state === FighterState.AIR_ATTACK
        || f.state === FighterState.AIR_BLOCK;
      const wasAirHitstun = f.state === FighterState.HITSTUN && f.vy >= 0 && f.y >= STAGE_GROUND_Y - 1;
      if (wasAirborne) {
        const wasAirAttack = f.currentAttack !== null;
        const wasHop = f.state === FighterState.HOP;
        const wasAirBlock = f.state === FighterState.AIR_BLOCK;
        const remainingBlockstun = f.blockstunTimer;
        if (f.currentAttack) f.endAttack();
        f.y = STAGE_GROUND_Y; f.vy = 0; f.vx = 0;
        // KOF2002: 空中防御着陆后如果有剩余blockstun → 转为地面防御
        if (wasAirBlock && remainingBlockstun > 0) {
          f.state = FighterState.BLOCK;
          f.blockstunTimer = remainingBlockstun;
        } else {
          f.state = FighterState.IDLE;
          if (wasAirAttack) f.landingRecovery = AIR_ATTACK_LANDING_RECOVERY;
          else if (wasAirBlock) f.landingRecovery = JUMP_LANDING_RECOVERY + 3;
          else if (wasHop) f.landingRecovery = HOP_LANDING_RECOVERY;
          else f.landingRecovery = JUMP_LANDING_RECOVERY;
        }
        f.throwInvincibilityTimer = THROW_INVINCIBILITY_LANDING;
        f.resetComboJuggleState();
        f.hasAttackedInAir = false;
        this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
      } else if (wasAirHitstun) {
        f.y = STAGE_GROUND_Y; f.vy = 0; f.vx = 0;
        // Ground bounce: if fighter has ground bounce state, launch back up
        if (f.isGroundBounce && f.groundBounceTimer > 0) {
          // Ground bounce preserves combo state (juggle points, wall bounce count)
          // The timer was already set by combatSystem on the initial impact
          // Just keep the fighter in hitstun while bouncing
          f.state = FighterState.HITSTUN;
          f.hitstunTimer = f.groundBounceTimer;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          // Ground bounce SFX
          playGroundBounce();
        } else if (this.recoveryRollRequested) {
          f.state = FighterState.IDLE;
          f.isKnockedDown = false;
          f.landingRecovery = LANDING_RECOVERY;
          this.recoveryRollRequested = false;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        } else {
          f.state = FighterState.KNOCKDOWN;
          f.knockdownTimer = 25;
          f.isKnockedDown = true;
          f.isHardKnockdown = false;
          f.resetComboJuggleState();
          this.recoveryRollRequested = false;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        }
      } else if (f.vy > 0) { f.y = STAGE_GROUND_Y; f.vy = 0; }
    }
    f.x = Math.max(STAGE_LEFT, Math.min(f.x, STAGE_RIGHT));
  }

  private buildCtx(): FighterCtx {
    return {
      fighter: this.fighter,
      playerIndex: this.playerIndex,
      cmdBuf: this.cmdBuf,
      vfx: this.vfx,
      projectiles: this.projectiles,
      tickRef: this.tickRef,
      opponent: this.opponent,
      character: this.character,
      stats: this.stats,
      gauge: this.gauge,
      maxMode: this.maxMode,
      rekkaWindow: this.rekkaWindow,
      counterStanceTimer: this.counterStanceTimer,
      chargeDownFrames: this.chargeDownFrames,
      wasChargingDown: this.wasChargingDown,
      wakeupBuffer: this.wakeupBuffer,
      cancelSpecialBuffer: this.cancelSpecialBuffer,
      recoveryRollRequested: this.recoveryRollRequested,
      prevForward: this.prevForward,
      prevBack: this.prevBack,
      prevDown: this.prevDown,
      upHoldFrames: this.upHoldFrames,
      upWasPressed: this.upWasPressed,
      lastForwardTick: this.lastForwardTick,
      lastBackTick: this.lastBackTick,
      lastDownTick: this.lastDownTick,
    };
  }

  private syncCtx(ctx: FighterCtx): void {
    this.rekkaWindow = ctx.rekkaWindow;
    this.counterStanceTimer = ctx.counterStanceTimer;
    this.wakeupBuffer = ctx.wakeupBuffer;
    this.cancelSpecialBuffer = ctx.cancelSpecialBuffer;
    this.lastForwardTick = ctx.lastForwardTick;
    this.lastBackTick = ctx.lastBackTick;
    this.lastDownTick = ctx.lastDownTick;
  }

  private checkProximityGuard(input: ResolvedInput): boolean {
    const f = this.fighter;
    if (!this.opponent) return false;
    if (f.state !== FighterState.IDLE && f.state !== FighterState.WALK && f.state !== FighterState.CROUCH) return false;
    const dist = Math.abs(f.x - this.opponent.x);
    if (dist > PROXIMITY_GUARD_RANGE) return false;
    if (!input.back) return false;
    const opp = this.opponent;
    if (opp.state !== FighterState.STAND_ATTACK && opp.state !== FighterState.CROUCH_ATTACK
        && opp.state !== FighterState.AIR_ATTACK && opp.state !== FighterState.THROW) return false;
    if (!opp.currentAttack || opp.attackPhase !== 'active') return false;
    f.state = input.down ? FighterState.CROUCH : FighterState.BLOCK;
    if (input.down) f.displayHeight = 50;
    return true;
  }

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    f.tickTimers();
    if (this.rekkaWindow > 0) this.rekkaWindow--;

    if (input.rollPressed && f.state === FighterState.HITSTUN && !f.isGrounded() && !f.isHardKnockdown) {
      this.recoveryRollRequested = true;
    }

    if (f.isBeingThrown) return;

    if (f.isThrowing) {
      f.tickAttack();
      return;
    }

    const ctx = this.buildCtx();

    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK:
        handleIdleWalk(ctx, input);
        break;
      case FighterState.RUN:
        handleRun(ctx, input);
        break;
      case FighterState.BACKDASH:
        handleBackdash(ctx);
        break;
      case FighterState.ROLL:
      case FighterState.BACK_ROLL:
        handleRoll(ctx, input);
        break;
      case FighterState.HOP:
      case FighterState.HYPER_JUMP:
        handleHop(ctx, input);
        break;
      case FighterState.JUMP:
      case FighterState.RUN_JUMP:
        handleJump(ctx, input);
        break;
      case FighterState.CROUCH:
        handleCrouch(ctx, input);
        break;
      case FighterState.STAND_ATTACK:
      case FighterState.CROUCH_ATTACK:
      case FighterState.AIR_ATTACK:
      case FighterState.THROW:
        handleAttack(ctx, input);
        break;
      case FighterState.BLOCK:
        handleBlock(ctx, input);
        break;
      case FighterState.AIR_BLOCK:
        handleAirBlock(ctx);
        break;
      case FighterState.GUARD_CRUSH:
        handleGuardCrush(ctx);
        break;
      case FighterState.COUNTER_STANCE:
        handleCounterStance(ctx);
        break;
      case FighterState.HITSTUN:
        handleHitstun(ctx, input);
        break;
      case FighterState.KNOCKDOWN:
        handleKnockdown(ctx, input);
        break;
      case FighterState.GETUP:
        handleGetup(ctx, input);
        break;
      case FighterState.DIZZY:
        handleDizzy(ctx, input);
        break;
      case FighterState.TAUNT:
        handleTaunt(ctx);
        break;
    }

    this.syncCtx(ctx);
  }
}

export function resolvePushbox(a: Fighter, b: Fighter): void {
  // KOF2002: pushbox disabled during roll, knockdown, and throw
  if (a.isRolling() || b.isRolling()) return;
  if (a.isKnockedDown || b.isKnockedDown) return;
  if (a.isBeingThrown || b.isBeingThrown) return;
  if (a.isThrowing || b.isThrowing) return;

  const aBox = a.getPushbox();
  const bBox = b.getPushbox();

  const xOverlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (xOverlap <= 0) return;

  const yOverlap = Math.min(aBox.y + aBox.height, bBox.y + bBox.height) - Math.max(aBox.y, bBox.y);
  if (yOverlap <= 0) return;

  const push = xOverlap / 2 + 0.5;
  if (a.x < b.x) { a.x -= push; b.x += push; } else { a.x += push; b.x -= push; }
  a.x = Math.max(STAGE_LEFT, Math.min(a.x, STAGE_RIGHT));
  b.x = Math.max(STAGE_LEFT, Math.min(b.x, STAGE_RIGHT));
}
