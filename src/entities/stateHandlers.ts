/**
 * State handlers — extracted from FighterController tickStateMachine
 */
import type { FighterCtx } from './stateContext.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION, BACKDASH_INVINCIBLE_FRAMES,
  DOUBLE_TAP_WINDOW, HYPER_CHARGE_WINDOW,
  HOP_THRESHOLD,
  ROLL_SPEED, ROLL_DURATION, ROLL_RECOVERY,
  LANDING_RECOVERY,
  DM_STOCK_COST,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  THROW_INVINCIBILITY_JUMP_STARTUP,
  THROW_INVINCIBILITY_LANDING,
  WAKEUP_BUFFER_WINDOW,
  WAKEUP_FULL_INVINCIBILITY,
  FRAME_DATA,
} from '../core/constants.js';
import { FighterState, AttackType, CLOSE_RANGE } from '../core/types.js';
import { spendStocks, gainMeterOnWhiff } from '../combat/meter.js';

export { handleBlock, handleAirBlock, handleGuardCrush, handleCounterStance, handleHitstun, handleKnockdown } from './stunStateHandlers.js';

// ─── Helper predicates ───

export function fwdJP(ctx: FighterCtx, i: ResolvedInput): boolean { return i.forward && !ctx.prevForward; }
export function backJP(ctx: FighterCtx, i: ResolvedInput): boolean { return i.back && !ctx.prevBack; }
export function dblFwd(ctx: FighterCtx, i: ResolvedInput): boolean {
  if (fwdJP(ctx, i)) { const g = ctx.tickRef.value - ctx.lastForwardTick; ctx.lastForwardTick = ctx.tickRef.value; return g > 0 && g <= DOUBLE_TAP_WINDOW; }
  return false;
}
export function dblBack(ctx: FighterCtx, i: ResolvedInput): boolean {
  if (backJP(ctx, i)) { const g = ctx.tickRef.value - ctx.lastBackTick; ctx.lastBackTick = ctx.tickRef.value; return g > 0 && g <= DOUBLE_TAP_WINDOW; }
  return false;
}
export function upReleased(ctx: FighterCtx, i: ResolvedInput): boolean { return !i.up && ctx.upWasPressed; }
export function hyperJump(ctx: FighterCtx): boolean { const g = ctx.tickRef.value - ctx.lastDownTick; return g > 0 && g <= HYPER_CHARGE_WINDOW; }
export function closeRange(ctx: FighterCtx): boolean {
  const range = ctx.character.stats.closeRange ?? CLOSE_RANGE;
  return ctx.opponent ? Math.abs(ctx.fighter.x - ctx.opponent.x) < range : false;
}

// ─── Attack routing helpers ───

export function defaultAttack(ctx: FighterCtx, input: ResolvedInput): AttackType | null {
  const f = ctx.fighter;
  const air = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
    || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP;
  if (air) {
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
  const cl = closeRange(ctx);
  if (input.buttonAPressed) return cl ? AttackType.CLOSE_A : AttackType.STAND_A;
  if (input.buttonBPressed) return cl ? AttackType.CLOSE_B : AttackType.STAND_B;
  if (input.buttonCPressed) return cl ? AttackType.CLOSE_C : AttackType.STAND_C;
  if (input.buttonDPressed) return cl ? AttackType.CLOSE_D : AttackType.STAND_D;
  return null;
}

export function tryAttack(ctx: FighterCtx, input: ResolvedInput): AttackType | null {
  const f = ctx.fighter;
  const tick = ctx.tickRef.value;
  if (ctx.maxMode && ctx.maxMode.active && f.canAct()) {
    const dmAttack = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (dmAttack && isDM(dmAttack as string) && ctx.gauge && ctx.gauge.stocks >= DM_STOCK_COST) {
      if (spendStocks(ctx.gauge, DM_STOCK_COST)) return dmAttack;
    }
  }
  if (f.canAct()) {
    const specialAttack = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (specialAttack) return specialAttack;
  }
  if (input.blowbackPressed && f.canAct()) return f.isGrounded() ? AttackType.STAND_CD : AttackType.JUMP_CD;
  if (!input.punchPressed && !input.kickPressed) return null;
  if (f.isGrounded()) {
    const cn = ctx.character.routeNormal(input, f.state, closeRange(ctx));
    if (cn) return cn;
  }
  return defaultAttack(ctx, input);
}

export function routeRapidCancelLight(ctx: FighterCtx, input: ResolvedInput): AttackType | null {
  const f = ctx.fighter;
  if (f.state === FighterState.AIR_ATTACK) return null;
  const isCrouching = f.state === FighterState.CROUCH_ATTACK;
  if (isCrouching) {
    if (input.buttonAPressed) return AttackType.CROUCH_A;
    if (input.buttonBPressed) return AttackType.CROUCH_B;
    // KOF2002: 轻攻击→重攻击链
    if (input.buttonCPressed) return AttackType.CROUCH_C;
    if (input.buttonDPressed) return AttackType.CROUCH_D;
  } else {
    const cl = closeRange(ctx);
    if (input.buttonAPressed) return cl ? AttackType.CLOSE_A : AttackType.STAND_A;
    if (input.buttonBPressed) return cl ? AttackType.CLOSE_B : AttackType.STAND_B;
    // KOF2002: 轻攻击→重攻击链 (近距离→CLOSE_C/D, 远距离→STAND_C/D)
    if (input.buttonCPressed) return cl ? AttackType.CLOSE_C : AttackType.STAND_C;
    if (input.buttonDPressed) return cl ? AttackType.CLOSE_D : AttackType.STAND_D;
  }
  return null;
}

export function tryCommandNormalCancel(ctx: FighterCtx, input: ResolvedInput): AttackType | null {
  const result = ctx.character.routeNormal(input, ctx.fighter.state, closeRange(ctx));
  if (result && COMMAND_NORMALS.has(result as string)) return result;
  return null;
}

// ─── Classification helpers ───

export function isSpecialMove(name: string): boolean {
  return !isNormal(name) && !isDM(name);
}

export function isDM(name: string): boolean {
  return name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
}

export function isNormal(name: string): boolean {
  return LIGHT_NORMALS.has(name) || NORMAL_ATTACKS.has(name) || COMMAND_NORMALS.has(name)
    || name === 'STAND_CD' || name === 'JUMP_CD' || name === 'CROUCH_CD';
}

// ─── State handlers ───

/** IDLE / WALK state handler */
export function handleIdleWalk(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.displayHeight = 100; f.vx = 0;

  // 投技输入缓冲消费: blockstun结束→IDLE时立即执行缓冲的投技
  if (f.throwBufferTimer > 0 && f.canAct()) {
    const dir = f.throwBufferDirection;
    f.throwBufferTimer = 0;
    if (dir === 'forward') f.startAttack(AttackType.THROW_FORWARD);
    else if (dir === 'back') f.startAttack(AttackType.THROW_BACK);
    else f.startAttack(AttackType.THROW);
    return;
  }

  if (input.rollPressed && f.canAct() && f.isGrounded()) {
    f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = false;
    f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
    f.displayHeight = 60;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
  }
  if (input.blowbackPressed && f.canAct()) { f.startAttack(AttackType.STAND_CD); return; }
  if (dblBack(ctx, input) && f.canAct() && f.isGrounded()) {
    f.state = FighterState.BACKDASH; f.vx = -BACKDASH_VX * f.facing; f.vy = BACKDASH_VY;
    f.backdashTimer = BACKDASH_DURATION;
    f.displayHeight = 80; ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
  }
  if (dblFwd(ctx, input) && f.canAct() && f.isGrounded()) {
    f.state = FighterState.RUN; f.vx = ctx.stats.runSpeed * f.facing; return;
  }
  if (upReleased(ctx, input) && f.isGrounded() && ctx.upHoldFrames > 0) {
    f.throwInvincibilityTimer = THROW_INVINCIBILITY_JUMP_STARTUP;
    // KOF2002: 跳跃第1帧即脱离地面(isGrounded=false), 可避开地面投技
    f.y = STAGE_GROUND_Y - 1;
    if (ctx.upHoldFrames <= HOP_THRESHOLD) {
      f.vy = ctx.stats.hopVelocity;
      f.vx = ctx.stats.jumpForwardSpeed * 0.7 * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
      f.state = FighterState.HOP;
    }
    else if (hyperJump(ctx)) {
      f.vy = ctx.stats.hyperJumpVelocity; f.vx = ctx.stats.jumpForwardSpeed * 1.4 * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
      f.state = FighterState.HYPER_JUMP; ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
    } else {
      f.vy = ctx.stats.jumpVelocity;
      f.vx = ctx.stats.jumpForwardSpeed * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
      f.state = FighterState.JUMP;
    }
    return;
  }
  if (input.down && !ctx.prevDown) ctx.lastDownTick = ctx.tickRef.value;
  if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; return; }
  if (input.throwAttackPressed && f.canAct()) {
    if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
    else if (input.back) f.startAttack(AttackType.THROW_BACK);
    else f.startAttack(AttackType.THROW);
    return;
  }
  if (f.canAct()) { const atk = tryAttack(ctx, input); if (atk) { f.startAttack(atk); return; } }

  // 当身技: QCB+Punch (214+P)
  if (f.canAct() && input.punchPressed && ctx.character.getCounterConfig) {
    const cfg = ctx.character.getCounterConfig();
    if (cfg && ctx.cmdBuf.hasQCB(ctx.tickRef.value)) {
      f.state = FighterState.COUNTER_STANCE;
      ctx.counterStanceTimer = cfg.activeFrames;
      ctx.vfx.spawnCharacterHitSparks(f.x, f.y - f.displayHeight / 2, 8, '#44ffcc');
      return;
    }
  }

  if (input.forward) { f.vx = ctx.stats.walkSpeed * f.facing; f.state = FighterState.WALK; }
  else if (input.back) { f.vx = -ctx.stats.walkSpeed * f.facing; f.state = FighterState.WALK; }
  else { f.state = FighterState.IDLE; }
}

/** RUN state handler */
export function handleRun(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.displayHeight = 100; f.vx = ctx.stats.runSpeed * f.facing;
  if (input.up && f.isGrounded()) {
    f.state = FighterState.RUN_JUMP; f.vy = ctx.stats.jumpVelocity; f.vx = ctx.stats.jumpForwardSpeed * 1.5 * f.facing;
    f.throwInvincibilityTimer = THROW_INVINCIBILITY_JUMP_STARTUP;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y); return;
  }
  if (input.down && f.isGrounded()) { f.state = FighterState.CROUCH; f.displayHeight = 50; f.vx = 0; return; }
  if (input.throwAttackPressed && f.canAct()) {
    if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
    else if (input.back) f.startAttack(AttackType.THROW_BACK);
    else f.startAttack(AttackType.THROW);
    return;
  }
  if (f.canAct()) { const atk = tryAttack(ctx, input); if (atk) { f.startAttack(atk); return; } }
  if (!input.forward) { f.vx = 0; f.state = FighterState.IDLE; f.runStopTimer = 3; }
}

/** BACKDASH state handler */
export function handleBackdash(ctx: FighterCtx): void {
  const f = ctx.fighter;
  if (f.backdashTimer > 0) f.backdashTimer--;
  if (f.isGrounded() && f.vy >= 0) {
    f.state = FighterState.IDLE; f.vx = 0; f.vy = 0; f.displayHeight = 100;
    f.backdashTimer = 0;
    f.landingRecovery = LANDING_RECOVERY; ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
  }
}

/** ROLL / BACK_ROLL state handler */
export function handleRoll(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.rollTimer--; f.displayHeight = 60;
  if (f.isGCRoll && input.rollPressed && f.rollTimer > 0) {
    f.rollTimer = ROLL_DURATION;
    f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
  }
  if (f.rollTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; f.displayHeight = 100; f.landingRecovery = ROLL_RECOVERY; f.isGCRoll = false; }
}

/** HOP / HYPER_JUMP state handler */
export function handleHop(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  if ((input.punchPressed || input.kickPressed) && !f.currentAttack && !f.hasAttackedInAir) {
    const cn = ctx.character.routeNormal(input, f.state, false);
    const atk = cn || defaultAttack(ctx, input);
    if (atk) f.startAttack(atk);
  }
}

/** JUMP / RUN_JUMP state handler */
export function handleJump(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  if (input.blowbackPressed && !f.currentAttack && !f.hasAttackedInAir) { f.startAttack(AttackType.JUMP_CD); }
  else if ((input.punchPressed || input.kickPressed) && !f.currentAttack && !f.hasAttackedInAir) {
    const cn = ctx.character.routeNormal(input, f.state, false);
    const atk = cn || defaultAttack(ctx, input);
    if (atk) f.startAttack(atk);
  }
}

/** CROUCH state handler */
export function handleCrouch(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;
  f.displayHeight = 50; f.vx = 0;
  if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }
  if (input.throwAttackPressed && f.canAct()) {
    if (input.forward) f.startAttack(AttackType.THROW_FORWARD);
    else if (input.back) f.startAttack(AttackType.THROW_BACK);
    else f.startAttack(AttackType.THROW);
    return;
  }
  if ((input.punchPressed || input.kickPressed) && f.canAct()) {
    const cn = ctx.character.routeNormal(input, f.state, closeRange(ctx));
    if (cn) { f.startAttack(cn); return; }
    const atk = defaultAttack(ctx, input);
    if (atk) { f.startAttack(atk); return; }
  }
}

/** ATTACK / THROW state handler (stand/crouch/air/throw) */
export function handleAttack(ctx: FighterCtx, input: ResolvedInput): void {
  const f = ctx.fighter;

  // Character-specific onAttackActive (fireballs, uppercuts etc.)
  if (f.attackPhase === 'active' && f.currentAttack) {
    ctx.character.onAttackActive(f, f.currentAttack, ctx.projectiles, ctx.playerIndex);
  }

  // 新攻击开始时清除上一招的取消缓冲
  if (f.attackPhase === 'startup' && f.attackFrame <= 1) {
    ctx.cancelSpecialBuffer = null;
  }

  // 提前取消缓冲: active/recovery阶段输入必杀技指令→存储, 命中后立即执行
  // KOF2002: 你可以在命中之前输入取消指令, 游戏会缓冲它
  if (f.currentAttack && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && !ctx.cancelSpecialBuffer && (input.punchPressed || input.kickPressed)) {
    const tick = ctx.tickRef.value;
    const special = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (special && !isDM(special as string)) {
      ctx.cancelSpecialBuffer = special;
    }
  }

  // Normal/Command Normal >> MAX activation (BC during attack on hit/block, costs 2 stocks)
  if (input.buttonB && input.buttonC && (input.buttonBPressed || input.buttonCPressed)
      && f.currentAttack && f.hasHit && ctx.gauge && ctx.maxMode
      && !ctx.maxMode.active && isNormal(f.currentAttack as string)
      && ctx.gauge.stocks >= 2) {
    f.resetAttackState();
    f.resetCancelFlags();
    f.state = FighterState.IDLE;
    spendStocks(ctx.gauge, 1);
    ctx.maxMode.active = true;
    ctx.maxMode.timer = ctx.maxMode.maxDuration;
    ctx.vfx.spawnMAXAura(f.x, f.y);
    ctx.vfx.spawnMAXActivationFlash(f.x, f.y - f.displayHeight / 2);
    return;
  }

  // Super Cancel
  if (f.superCancelReady && ctx.gauge && f.currentAttack) {
    const tick = ctx.tickRef.value;
    const dmAttack = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (dmAttack && isDM(dmAttack as string)
        && ctx.gauge.stocks >= DM_STOCK_COST + SUPER_CANCEL_STOCK_COST) {
      spendStocks(ctx.gauge, DM_STOCK_COST + SUPER_CANCEL_STOCK_COST);
      f.cancelEvent = 'super_cancel';
      ctx.vfx.spawnSuperCancelText(f.x, f.y - f.displayHeight - 30);
      f.startAttack(dmAttack);
      return;
    }
  }

  // Free Cancel (MAX mode only)
  if (ctx.maxMode && ctx.maxMode.active && f.currentAttack) {
    const atkName = f.currentAttack as string;
    const isNormalAttack = isNormal(atkName);
    const canFreeCancel = isNormalAttack || f.hasHit;
    if (canFreeCancel) {
      const tick = ctx.tickRef.value;
      const specialAttack = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
      if (specialAttack && !isDM(specialAttack as string)) {
        ctx.maxMode.timer -= Math.round(ctx.maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
        if (ctx.maxMode.timer <= 0) ctx.maxMode.timer = 0;
        f.cancelEvent = 'free_cancel';
        ctx.vfx.spawnFreeCancelText(f.x, f.y - f.displayHeight - 30);
        f.startAttack(specialAttack);
        return;
      }
    }
  }

  // Rapid Cancel (light chain)
  if (f.rapidCancelReady && f.attackPhase === 'recovery' && f.currentAttack
      && LIGHT_NORMALS.has(f.currentAttack as string)) {
    const nextAtk = routeRapidCancelLight(ctx, input);
    if (nextAtk) {
      f.cancelEvent = 'rapid_cancel';
      f.startAttack(nextAtk);
      return;
    }
  }

  // 提前取消缓冲消费: 命中/被防后立即执行缓冲的必杀技
  if (ctx.cancelSpecialBuffer && f.normalCancelReady
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.currentAttack && NORMAL_ATTACKS.has(f.currentAttack as string)) {
    const buffered = ctx.cancelSpecialBuffer;
    ctx.cancelSpecialBuffer = null;
    // KOF2002: 正常→必杀技取消视觉反馈 — 小蓝色冲击环
    ctx.vfx.spawnImpactRing(f.x, f.y - f.displayHeight * 0.5);
    f.startAttack(buffered);
    return;
  }

  // Normal → Command Normal Cancel (命中时才有, 被防不触发命令通常技取消)
  if (f.normalCancelReady && f.hasHit && f.attackPhase === 'recovery' && f.currentAttack
      && NORMAL_ATTACKS.has(f.currentAttack as string)) {
    const cmdNormal = tryCommandNormalCancel(ctx, input);
    if (cmdNormal) {
      f.cancelEvent = 'command_cancel';
      f.startAttack(cmdNormal);
      f.cancelledIntoNormal = true;
      f.normalCancelReady = false;
      return;
    }
  }

  // KOF2002: Command Normal → Special Cancel (hit AND block both allow cancel)
  if (f.cancelledIntoNormal && f.attackPhase === 'recovery' && f.currentAttack
      && COMMAND_NORMALS.has(f.currentAttack as string)) {
    const tick = ctx.tickRef.value;
    const special = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (special && !isDM(special as string)) {
      f.startAttack(special);
      f.cancelledIntoNormal = false;
      f.normalCancelReady = false;
      return;
    }
  }

  // KOF2002: 通常技被防→必杀技取消 (压力博弈核心机制)
  if (f.normalCancelReady && !f.hasHit && f.attackPhase === 'recovery' && f.currentAttack
      && NORMAL_ATTACKS.has(f.currentAttack as string)) {
    const tick = ctx.tickRef.value;
    const special = ctx.character.routeSpecial(input, ctx.cmdBuf, tick, ctx.wasChargingDown);
    if (special && !isDM(special as string)) {
      f.startAttack(special);
      f.normalCancelReady = false;
      return;
    }
  }

  // Rekka followup
  if (f.currentAttack && ctx.rekkaWindow > 0 && (f.attackPhase === 'recovery' || f.attackPhase === 'active')) {
    const followup = ctx.character.routeRekkaFollowup(input, ctx.cmdBuf, ctx.tickRef.value, f.currentAttack);
    if (followup) {
      f.endAttack(); f.startAttack(followup); ctx.rekkaWindow = 20; return;
    }
  }

  // Set rekka chain on starter hit
  if (f.currentAttack && f.attackPhase === 'active' && f.attackFrame === 0) {
    const chain = ctx.character.getRekkaChain(f.currentAttack);
    if (chain) { f.rekkaChain = chain; ctx.rekkaWindow = 20; }
  }

  // Attack Cancel Roll (AB during attack recovery, on hit/block only)
  if (input.rollPressed && f.currentAttack && f.hasHit && f.attackPhase === 'recovery'
      && f.isGrounded() && !isSpecialMove(f.currentAttack as string)) {
    f.resetAttackState();
    f.resetCancelFlags();
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = false;
    f.vx = ROLL_SPEED * f.facing;
    f.displayHeight = 60;
    ctx.vfx.spawnDust(f.x, STAGE_GROUND_Y);
    return;
  }

  // 捕获当前攻击状态, tickAttack可能清除它
  const lastAttack = f.currentAttack;
  const lastHit = f.hasHit;

  f.tickAttack();
  // KOF2002: 挥空攻击也获得气槽 (攻击结束且未命中)
  if (!f.currentAttack && lastAttack && !lastHit && ctx.gauge) {
    gainMeterOnWhiff(ctx.gauge, lastAttack);
  }
  // KOF2002: 攻击恢复最后几帧按住后→直接进入防御(而不是恢复IDLE再防)
  if (f.currentAttack && f.attackPhase === 'recovery' && input.back && f.isGrounded()) {
    const data = FRAME_DATA[f.currentAttack as keyof typeof FRAME_DATA];
    const totalFrames = (data?.startup ?? 0) + (data?.active ?? 0) + (data?.recovery ?? 0);
    if (totalFrames > 0 && f.attackFrame >= totalFrames - 2) {
      f.resetAttackState();
      f.state = FighterState.BLOCK;
      f.blockstunTimer = 0;
      f.vx = 0;
    }
  }
  if (!f.currentAttack && !f.isGrounded()) { f.state = FighterState.JUMP; }
}
