/**
 * Stun/defensive state handlers — extracted from stateHandlers.ts.
 * BLOCK, AIR_BLOCK, GUARD_CRUSH, COUNTER_STANCE, HITSTUN, KNOCKDOWN.
 */
import type { FighterCtx } from './stateContext.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y,
  ROLL_SPEED, ROLL_DURATION,
  DM_STOCK_COST,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  WAKEUP_BUFFER_WINDOW,
  WAKEUP_FULL_INVINCIBILITY,
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
  // Guard Cancel Roll (A+B during early blockstun, costs 1 stock)
  if (f.blockstunTimer > 0 && input.rollPressed && ctx.gauge && spendStocks(ctx.gauge, DM_STOCK_COST)) {
    f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
    f.displayHeight = 60;
    f.blockstunTimer = 0;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
    return;
  }
  // Guard Cancel CD
  if (f.blockstunTimer > 0 && input.blowbackPressed && ctx.gauge && spendStocks(ctx.gauge, DM_STOCK_COST)) {
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
  f.knockdownTimer--;
  if (!f.isHardKnockdown && input.rollPressed && f.knockdownTimer > 3
    && f.knockdownTimer >= 10) {
    f.knockdownTimer = 3;
    f.usedQuickStand = true;
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
    f.state = FighterState.IDLE; f.isKnockedDown = false; f.isHardKnockdown = false; f.displayHeight = 100; f.vx = 0;
    if (!f.usedQuickStand) {
      f.throwInvincibilityTimer = THROW_INVINCIBILITY_WAKEUP;
      f.invincible = true;
      f.wakeupInvulnFrames = WAKEUP_FULL_INVINCIBILITY;
    } else {
      f.throwInvincibilityTimer = Math.round(THROW_INVINCIBILITY_WAKEUP * 0.5);
    }
    f.usedQuickStand = false;
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
