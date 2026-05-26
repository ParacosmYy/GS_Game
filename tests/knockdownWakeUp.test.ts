import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_GROUND_Y,
  STAGE_LEFT,
  STAGE_RIGHT,
  FRAME_DATA,
  THROW_INVINCIBILITY_WAKEUP,
  WAKEUP_BUFFER_WINDOW,
  WAKEUP_FULL_INVINCIBILITY,
} from '../src/core/constants.js';
import { handleKnockdown } from '../src/entities/stunStateHandlers.js';
import type { FighterCtx } from '../src/entities/stateContext.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';

// ─── Helpers ───

/** Create a grounded fighter at x, facing right. */
function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1 as const);
}

/** Create a minimal FighterCtx for knockdown handler testing. */
function createCtx(fighter: Fighter, overrides?: Partial<FighterCtx>): FighterCtx {
  return {
    fighter,
    playerIndex: 0,
    cmdBuf: {} as any,
    vfx: {
      spawnDust: () => {},
      spawnRecoverySpark: () => {},
      spawnReversalText: () => {},
    } as any,
    projectiles: [],
    tickRef: { value: 0 },
    opponent: null,
    character: {} as any,
    stats: {} as any,
    gauge: null,
    maxMode: null,
    rekkaWindow: 0,
    counterStanceTimer: 0,
    chargeDownFrames: 0,
    wasChargingDown: false,
    wakeupBuffer: null,
    cancelSpecialBuffer: null,
    recoveryRollRequested: false,
    prevForward: false,
    prevBack: false,
    prevDown: false,
    upHoldFrames: 0,
    upWasPressed: false,
    lastForwardTick: 0,
    lastBackTick: 0,
    lastDownTick: 0,
    ...overrides,
  };
}

/** Neutral input (no buttons pressed). */
const neutralInput: ResolvedInput = {
  up: false, down: false, forward: false, back: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false,
  buttonAPressed: false, buttonBPressed: false,
  buttonCPressed: false, buttonDPressed: false,
  throwAttackPressed: false, blowbackPressed: false,
  rollPressed: false,
  punchPressed: false, kickPressed: false,
  punchJustReleased: false, kickJustReleased: false,
  startPressed: false,
};

/** Roll input (A+B). */
const rollInput: ResolvedInput = {
  ...neutralInput,
  rollPressed: true,
  buttonA: true, buttonB: true,
  buttonAPressed: true, buttonBPressed: true,
};

// ============================================================================
// 1. Knockdown Causes (3 tests)
// ============================================================================
describe('Knockdown Causes', () => {
  it('CROUCH_D (Sweep) has knockdown=true in frame data', () => {
    const fd = FRAME_DATA[AttackType.CROUCH_D];
    expect(fd).toBeDefined();
    expect(fd.knockdown).toBe(true);
    // CROUCH_D is a LOW attack (must be blocked crouching)
    expect(fd.hitLevel).toBe('LOW');
  });

  it('STAND_CD (Blowback) has knockdown=true in frame data', () => {
    const fd = FRAME_DATA[AttackType.STAND_CD];
    expect(fd).toBeDefined();
    expect(fd.knockdown).toBe(true);
    // CD is a MID attack and has counterWire property
    expect(fd.hitLevel).toBe('MID');
    expect(fd.counterWire).toBe(true);
  });

  it('SPECIAL_UPPER (uppercut) causes knockdown', () => {
    const fd = FRAME_DATA[AttackType.SPECIAL_UPPER];
    expect(fd).toBeDefined();
    expect(fd.knockdown).toBe(true);
    // Special upper should deal more damage than normals
    expect(fd.damage).toBeGreaterThan(100);
  });
});

// ============================================================================
// 2. Knockdown Duration (3 tests)
// ============================================================================
describe('Knockdown Duration', () => {
  it('applyKnockdown sets state and minimum knockdown timer', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);

    f.applyKnockdown(25);

    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isKnockedDown).toBe(true);
    expect(f.knockdownTimer).toBe(25);
    // Attack state should be cleared
    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');
  });

  it('Quick Stand (rollPressed) shortens remaining knockdown', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    expect(f.usedQuickStand).toBe(false);

    const ctx = createCtx(f);

    // Tick down to frame 15 (still above threshold 10)
    for (let i = 0; i < 10; i++) {
      handleKnockdown(ctx, neutralInput);
    }
    expect(f.knockdownTimer).toBe(15);

    // Press roll at frame 15 -- should trigger Quick Stand
    handleKnockdown(ctx, rollInput);
    expect(f.usedQuickStand).toBe(true);
    // Quick Stand reduces timer to 3, then handleKnockdown decrements by 1
    // so after this call knockdownTimer = 2
    expect(f.knockdownTimer).toBeLessThanOrEqual(3);

    // Tick through remaining frames with neutral input
    // The wakeup buffer may have captured the rollInput, so we need to clear it
    ctx.wakeupBuffer = null;

    while (f.knockdownTimer > 0) {
      handleKnockdown(ctx, neutralInput);
    }

    // Should now be awake (IDLE, not ROLL)
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
  });

  it('Delaying wake-up (no input) keeps fighter in KNOCKDOWN for full duration', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    const ctx = createCtx(f);

    // No input for all 25 frames
    for (let i = 0; i < 25; i++) {
      handleKnockdown(ctx, neutralInput);
    }

    // Should be awake now, timer expired
    expect(f.knockdownTimer).toBe(0);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
    // Normal wakeup should have full invincibility
    expect(f.invincible).toBe(true);
    expect(f.wakeupInvulnFrames).toBe(WAKEUP_FULL_INVINCIBILITY);
    expect(f.throwInvincibilityTimer).toBe(THROW_INVINCIBILITY_WAKEUP);
  });
});

// ============================================================================
// 3. Wake-up Options (3 tests)
// ============================================================================
describe('Wake-up Options', () => {
  it('Normal wake-up returns to IDLE state', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    const ctx = createCtx(f);

    for (let i = 0; i < 25; i++) {
      handleKnockdown(ctx, neutralInput);
    }

    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
    expect(f.isHardKnockdown).toBe(false);
  });

  it('Quick Stand requires roll input during knockdown window', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    const ctx = createCtx(f);

    // Quick Stand only works when knockdownTimer > 10 and > 3
    // At timer=5, it's too late (timer <= 10)
    for (let i = 0; i < 20; i++) {
      handleKnockdown(ctx, neutralInput);
    }
    expect(f.knockdownTimer).toBe(5);

    // Roll at timer=5 should NOT trigger quick stand (below threshold)
    handleKnockdown(ctx, rollInput);
    expect(f.usedQuickStand).toBe(false);
    // Timer continues normally
    expect(f.knockdownTimer).toBe(4);
  });

  it('Normal wake-up grants full invincibility (throw + strike)', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    const ctx = createCtx(f);

    for (let i = 0; i < 25; i++) {
      handleKnockdown(ctx, neutralInput);
    }

    // Normal wakeup: full invincibility
    expect(f.invincible).toBe(true);
    expect(f.wakeupInvulnFrames).toBe(WAKEUP_FULL_INVINCIBILITY);
    expect(f.throwInvincibilityTimer).toBe(THROW_INVINCIBILITY_WAKEUP);

    // After invuln frames expire, invincible should turn off
    for (let i = 0; i < WAKEUP_FULL_INVINCIBILITY; i++) {
      f.tickTimers();
    }
    expect(f.wakeupInvulnFrames).toBe(0);
  });
});

// ============================================================================
// 4. Meaty Attacks (3 tests)
// ============================================================================
describe('Meaty Attacks', () => {
  it('Knocked-down fighter cannot be thrown (throw invulnerable)', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    // Fighter in KNOCKDOWN state is not throw vulnerable
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Knocked-down fighter hurtbox is still present (can be hit if not invincible)', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    // Not invincible by default during knockdown (invincibility is granted on WAKEUP)
    expect(f.invincible).toBe(false);
    // Hurtbox should still exist
    const hurtbox = f.getEffectiveHurtbox();
    expect(hurtbox).not.toBeNull();
    expect(hurtbox!.width).toBeGreaterThan(0);
    expect(hurtbox!.height).toBeGreaterThan(0);
  });

  it('Wake-up reversal buffer allows attack on wake-up frame', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    const ctx = createCtx(f);

    // Tick down to exactly WAKEUP_BUFFER_WINDOW (5 frames remaining)
    for (let i = 0; i < 20; i++) {
      handleKnockdown(ctx, neutralInput);
    }
    expect(f.knockdownTimer).toBe(5);

    // Buffer a blowback (C+D) during the last 5 frames
    const cdInput: ResolvedInput = {
      ...neutralInput,
      blowbackPressed: true,
      punchPressed: true,
      kickPressed: true,
      buttonC: true,
      buttonD: true,
      buttonCPressed: true,
      buttonDPressed: true,
    };
    handleKnockdown(ctx, cdInput);

    // Wakeup buffer should be set
    expect(ctx.wakeupBuffer).not.toBeNull();

    // Tick through remaining frames to wake up
    for (let i = 0; i < 4; i++) {
      handleKnockdown(ctx, neutralInput);
    }

    // Fighter should have woken up and executed the buffered CD attack
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    expect(f.currentAttack).toBe(AttackType.STAND_CD);
  });
});

// ============================================================================
// 5. Knockdown Physics (3 tests)
// ============================================================================
describe('Knockdown Physics', () => {
  it('Knockdown has pushback velocity', () => {
    const f = createFighter(400);
    // Simulate hitstun with pushback leading to knockdown
    f.applyHitstun(15, 8);
    expect(f.state).toBe(FighterState.HITSTUN);
    expect(f.vx).not.toBe(0);
    // Facing right (1), pushback should push left
    expect(f.vx).toBeLessThan(0);

    // Now apply knockdown (simulating what combatSystem does on knockdown hit)
    f.applyKnockdown(25);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    // knockdownTimer should be set
    expect(f.knockdownTimer).toBe(25);
  });

  it('Knockdown state prevents acting (canAct returns false)', () => {
    const f = createFighter();
    f.applyKnockdown(25);

    // Fighter in knockdown cannot act
    expect(f.canAct()).toBe(false);
    // Cannot block during knockdown
    expect(f.canBlock()).toBe(false);
    // Cannot start an attack directly (state overrides)
    // The state machine should handle this, but the state itself is KNOCKDOWN
    expect(f.state).toBe(FighterState.KNOCKDOWN);
  });

  it('Position is clamped to stage bounds during knockdown', () => {
    // Test near right wall
    const f = createFighter(STAGE_RIGHT - 10);
    f.applyKnockdown(25);
    // Fighter should already be within bounds
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(f.x).toBeGreaterThanOrEqual(STAGE_LEFT);

    // Test near left wall
    const f2 = createFighter(STAGE_LEFT + 10);
    f2.applyKnockdown(25);
    expect(f2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });
});

// ============================================================================
// Additional: Hard Knockdown (bonus coverage)
// ============================================================================
describe('Hard Knockdown', () => {
  it('Hard knockdown prevents Quick Stand', () => {
    const f = createFighter();
    f.applyKnockdown(25, true); // hard knockdown
    expect(f.isHardKnockdown).toBe(true);

    const ctx = createCtx(f);

    // Tick down to frame 15
    for (let i = 0; i < 10; i++) {
      handleKnockdown(ctx, neutralInput);
    }
    expect(f.knockdownTimer).toBe(15);

    // Try Quick Stand -- should NOT work on hard knockdown
    handleKnockdown(ctx, rollInput);
    expect(f.usedQuickStand).toBe(false);
    // Timer should NOT be reduced (hard knockdown blocks quick stand)
    expect(f.knockdownTimer).toBe(14);

    // Full duration should pass
    for (let i = 0; i < 14; i++) {
      handleKnockdown(ctx, neutralInput);
    }
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('Hard knockdown reset clears all knockdown flags', () => {
    const f = createFighter();
    f.applyKnockdown(30, true);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isKnockedDown).toBe(true);
    expect(f.isHardKnockdown).toBe(true);

    f.reset(400);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.knockdownTimer).toBe(0);
    expect(f.usedQuickStand).toBe(false);
  });
});
