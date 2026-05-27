/**
 * Stun/defensive state handlers — extracted from stateHandlers.ts.
 * BLOCK, AIR_BLOCK, GUARD_CRUSH, COUNTER_STANCE, HITSTUN, KNOCKDOWN, DIZZY.
 */
import type { FighterCtx } from './stateContext.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y,
  ROLL_SPEED, ROLL_DURATION,
  GC_ROLL_STOCK_COST, GC_CD_STOCK_COST,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  WAKEUP_BUFFER_WINDOW,
  WAKEUP_FULL_INVINCIBILITY,
  HARD_KNOCKDOWN_GROUND_TICKS,
  SOFT_KNOCKDOWN_GROUND_TICKS,
  GETUP_ANIMATION_TICKS,
  QUICK_RISE_INPUT_START,
  QUICK_RISE_INPUT_END,
  TECH_ROLL_DISTANCE,
} from '../core/constants.js';
import { FighterState, AttackType } from '../core/types.js';
import { spendStocks } from '../combat/meter.js';
import { tryAttack } from './stateHandlers.js';

/** BLOCK state handler */
export function handleBlock(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.blockstunTimer--;
  if (f.blockstunTimer > 0 && f.blockstunTimer <= 5 && input.throwAttackPressed) {
    f.throwBufferTimer = 3;
    f.throwBufferDirection = input.forward ? 'forward' : input.back ? 'back' : 'neutral';
  }
  // Guard Cancel Roll (A+B during early blockstun, costs GC_ROLL_STOCK_COST stocks)
  if (f.blockstunTimer > 0 && input.rollPressed && ctx.gauge && spendStocks(ctx.gauge, GC_ROLL_STOCK_COST)) {
    f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
    f.displayHeight = 60;
    f.blockstunTimer = 0;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
    return;
  }
  // Guard Cancel CD (costs GC_CD_STOCK_COST stocks)
  if (f.blockstunTimer > 0 && input.blowbackPressed && ctx.gauge && spendStocks(ctx.gauge, GC_CD_STOCK_COST)) {
    f.blockstunTimer = 0;
    f.startAttack(AttackType.STAND_CD);
    return;
  }
  if (f.blockstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; f.throwInvincibilityTimer = THROW_INVINCIBILITY_POST_STUN; }
}

/** AIR_BLOCK state handler */
export function handleAirBlock(ctx: FighterCtx): void {
  const f = ctx.fighter;
  f.blockstunTimer--;
  if (f.blockstunTimer <= 0) { f.state = FighterState.JUMP; }
}

/** GUARD_CRUSH state handler */
export function handleGuardCrush(ctx: FighterCtx): void {
  const f = ctx.fighter;
  f.guardCrushTimer--;
  if (f.guardCrushTimer <= 0) {
    f.state = FighterState.IDLE; f.vx = 0;
    // KOF2002: Guard Crush恢复后防御槽从0开始(而非100), 连续GC风险极高
    f.guardGauge = 0;
  }
}

/** COUNTER_STANCE state handler */
export function handleCounterStance(ctx: FighterCtx): void {
  const f = ctx.fighter;
  ctx.counterStanceTimer--;
  if (ctx.counterStanceTimer <= 0) {
    f.applyHitstun(20, 3);
  }
}

/** HITSTUN state handler */
export function handleHitstun(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.hitstunTimer--;
  if (f.hitstunTimer > 0 && f.hitstunTimer <= 5 && input.throwAttackPressed) {
    f.throwBufferTimer = 3;
    f.throwBufferDirection = input.forward ? 'forward' : input.back ? 'back' : 'neutral';
  }
  if (f.hitstunTimer <= 0) {
    f.state = FighterState.IDLE; f.vx = 0; f.throwInvincibilityTimer = THROW_INVINCIBILITY_POST_STUN;
    ctx.vfx.spawnRecoverySpark(f.x, f.y - f.displayHeight / 2);
  }
}

/** KNOCKDOWN state handler */
export function handleKnockdown(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;

  // Total ground time: original knockdown timer
  // Hard knockdown: fighter must fully lie on ground (longer timer)
  // Soft knockdown: can quick-rise during the input window

  // #26 Delayed Get-up: holding down pauses knockdown timer (KOF2002 mindgame tool)
  // Max delay: 2x original knockdown duration to prevent infinite stall
  if (!f.isHardKnockdown && input.down && f.knockdownTimer <= 1 && f.knockdownDelayUsed < f.knockdownDelayMax) {
    f.knockdownDelayUsed++;
    // Don't decrement timer — fighter stays on the ground
  } else {
    f.knockdownTimer--;
  }

  // #24 Quick Stand: A+B during frames QUICK_RISE_INPUT_START..QUICK_RISE_INPUT_END
  // Soft knockdown only: shortens remaining knockdown to 3 ticks
  if (!f.isHardKnockdown && input.rollPressed && !f.usedQuickStand
    && f.knockdownTimer >= QUICK_RISE_INPUT_START
    && f.knockdownTimer <= QUICK_RISE_INPUT_END) {
    f.knockdownTimer = 3;
    f.usedQuickStand = true;
  }

  // #25 Counter Roll: A+B during late knockdown transitions directly to ROLL
  if (!f.isHardKnockdown && input.rollPressed && f.knockdownTimer > 3
    && f.knockdownTimer < 10 && !f.usedQuickStand) {
    f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isKnockedDown = false;
    f.isHardKnockdown = false;
    f.usedQuickStand = false;
    f.otgHitCount = 0;
    f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
    f.displayHeight = 60;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
    return;
  }

  // Tech Roll: →+A+B during ground bounce (soft knockdown only)
  // Rolls forward TECH_ROLL_DISTANCE pixels, then enters getup
  if (!f.isHardKnockdown && input.forward && input.rollPressed
    && f.knockdownTimer <= QUICK_RISE_INPUT_END
    && f.knockdownTimer >= 5
    && !f.usedQuickStand) {
    f.x += TECH_ROLL_DISTANCE * f.facing;
    f.usedQuickStand = true;
    // Fall through to getup transition below
  }

  // Wake-up reversal buffer
  if (f.knockdownTimer <= WAKEUP_BUFFER_WINDOW && f.knockdownTimer > 0) {
    if (input.throwAttackPressed) {
      f.throwBufferTimer = 3;
      f.throwBufferDirection = input.forward ? 'forward' : input.back ? 'back' : 'neutral';
    }
    if (input.punchPressed || input.kickPressed || input.rollPressed || input.blowbackPressed) {
      ctx.wakeupBuffer = input;
    }
  }

  if (f.knockdownTimer <= 0) {
    // Transition to GETUP animation instead of instantly becoming IDLE
    f.applyGetup(GETUP_ANIMATION_TICKS);
    // Wakeup invincibility: throw invincible during getup
    f.throwInvincibilityTimer = THROW_INVINCIBILITY_WAKEUP;
    if (!f.usedQuickStand) {
      f.invincible = true;
      f.wakeupInvulnFrames = WAKEUP_FULL_INVINCIBILITY;
    } else {
      f.throwInvincibilityTimer = Math.round(THROW_INVINCIBILITY_WAKEUP * 0.5);
    }
    f.usedQuickStand = false;
    f.knockdownDelayUsed = 0;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
  }
}

/** GETUP state handler — rising from knockdown to standing */
export function handleGetup(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.getupTimer--;

  // Gradually restore displayHeight from lying (low) to standing
  const progress = 1 - (f.getupTimer / f.getupDuration);
  // Interpolate displayHeight from 40 (lying) to FIGHTER_HEIGHT (standing)
  f.displayHeight = 40 + (100 - 40) * progress;

  // Wake-up reversal buffer (also active during getup)
  if (f.getupTimer <= WAKEUP_BUFFER_WINDOW && f.getupTimer > 0) {
    if (input.punchPressed || input.kickPressed || input.rollPressed || input.blowbackPressed) {
      ctx.wakeupBuffer = input;
    }
  }

  if (f.getupTimer <= 0) {
    f.state = FighterState.IDLE;
    f.isKnockedDown = false;
    f.isHardKnockdown = false;
    f.displayHeight = 100;
    f.vx = 0;
    f.otgHitCount = 0;
    // KOF2002: 起身烟尘 — 起身瞬间产生灰尘
    ctx.vfx.spawnDust(f.x, f.y);

    // Execute buffered reversal
    if (ctx.wakeupBuffer) {
      const buf = ctx.wakeupBuffer;
      ctx.wakeupBuffer = null;
      let reversed = false;
      if (buf.rollPressed) {
        f.state = buf.back ? FighterState.BACK_ROLL : FighterState.ROLL;
        f.rollTimer = ROLL_DURATION;
        f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
        f.displayHeight = 60;
        ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        reversed = true;
      } else if (buf.blowbackPressed) {
        f.startAttack(AttackType.STAND_CD);
        reversed = true;
      } else {
        const atk = tryAttack(ctx, buf);
        if (atk) { f.startAttack(atk); reversed = true; }
      }
      if (reversed) {
        ctx.vfx.spawnReversalText(f.x, f.y - f.displayHeight - 30);
      }
    }
  }
}

/** DIZZY state handler — stun gauge full, character dazed (stars/birds visual)
 *  KOF2002: mashing buttons reduces dizzy duration; when timer hits 0, recover to IDLE.
 */
export function handleDizzy(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.vx = 0;

  // Mash detection: any button press reduces dizzy timer
  if (input.punchPressed || input.kickPressed || input.buttonAPressed
    || input.buttonBPressed || input.buttonCPressed || input.buttonDPressed
    || input.blowbackPressed) {
    f.mashDizzy();
  }

  f.dizzyTimer--;
  if (f.dizzyTimer <= 0) {
    f.state = FighterState.IDLE;
    f.vx = 0;
    f.stunGauge = 0;
    f.stunDecayTimer = 0;
    f.dizzyTimer = 0;
    f.dizzyMashCount = 0;
    f.throwInvincibilityTimer = THROW_INVINCIBILITY_POST_STUN;
  }
}
