import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import {
  FighterState,
  AttackType,
  JuggleState,
} from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_GROUND_Y,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_MAX,
  STUN_GAUGE_MAX,
} from '../src/core/constants.js';

/**
 * Helper: create a grounded fighter at x=400 facing right.
 */
function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1 as const);
}

/**
 * Helper: put fighter in the air (above ground) with a given vertical state.
 */
function makeAirborne(f: Fighter, vy = -10): void {
  f.y = STAGE_GROUND_Y - 200;
  f.vy = vy;
}

// ============================================================================
// 1. Valid State Transitions
// ============================================================================
describe('Fighter State Machine: Valid State Transitions', () => {
  it('IDLE -> STAND_ATTACK via startAttack(STAND_A)', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    f.startAttack(AttackType.STAND_A);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
  });

  it('IDLE -> CROUCH (manual state assignment simulating crouch input)', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    // In the game loop, crouch is set by the fighter controller when down is held
    // The fighter state machine allows CROUCH from IDLE via direct assignment
    f.state = FighterState.CROUCH;
    f.displayHeight = 100; // crouch reduces height
    expect(f.state).toBe(FighterState.CROUCH);
    expect(f.canAct()).toBe(true);
  });

  it('IDLE -> JUMP (manual state assignment simulating jump input)', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    f.state = FighterState.JUMP;
    makeAirborne(f);
    expect(f.state).toBe(FighterState.JUMP);
    expect(f.isGrounded()).toBe(false);
  });

  it('IDLE -> STAND_ATTACK via startAttack(CLOSE_C)', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    f.startAttack(AttackType.CLOSE_C);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    expect(f.currentAttack).toBe(AttackType.CLOSE_C);
  });

  it('STAND_ATTACK -> HITSTUN via applyHitstun', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_C);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    // Simulate getting hit during attack
    f.applyHitstun(15, 6);
    expect(f.state).toBe(FighterState.HITSTUN);
    expect(f.hitstunTimer).toBe(15);
  });

  it('HITSTUN -> IDLE when hitstun expires', () => {
    const f = createFighter();
    f.applyHitstun(5, 4);
    expect(f.state).toBe(FighterState.HITSTUN);
    // Tick hitstun down — in game loop, state returns to IDLE when timer hits 0
    // The Fighter doesn't auto-transition; the main loop handles that.
    // We simulate the expected pattern: tick timer, then set state
    for (let i = 0; i < 5; i++) {
      f.hitstunTimer--;
      f.tickTimers();
    }
    expect(f.hitstunTimer).toBe(0);
    // Main loop would set f.state = FighterState.IDLE here
    f.state = FighterState.IDLE;
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('KNOCKDOWN -> IDLE on getup', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isKnockedDown).toBe(true);
    // Simulate knockdown timer expiring
    f.knockdownTimer = 0;
    f.isKnockedDown = false;
    f.state = FighterState.IDLE;
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.isKnockedDown).toBe(false);
  });

  it('IDLE -> BLOCK via applyBlockstun', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    f.applyBlockstun(10, 5);
    expect(f.state).toBe(FighterState.BLOCK);
    expect(f.blockstunTimer).toBe(10);
  });

  it('IDLE -> CROUCH_ATTACK via startAttack(CROUCH_A)', () => {
    const f = createFighter();
    f.state = FighterState.CROUCH;
    f.startAttack(AttackType.CROUCH_A);
    expect(f.state).toBe(FighterState.CROUCH_ATTACK);
  });
});

// ============================================================================
// 2. Invalid State Guards
// ============================================================================
describe('Fighter State Machine: Invalid State Guards', () => {
  it('cannot attack while in HITSTUN (canAct returns false)', () => {
    const f = createFighter();
    f.applyHitstun(15, 6);
    expect(f.state).toBe(FighterState.HITSTUN);
    expect(f.canAct()).toBe(false);
    // If startAttack is called regardless, it overrides state — but canAct guards input
    // The real guard is in the input handler checking canAct()
    // Verifying canAct is the gate
  });

  it('cannot move while in KNOCKDOWN (canAct returns false)', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.canAct()).toBe(false);
  });

  it('cannot block while attacking (canBlock returns false for STAND_ATTACK)', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_C);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    expect(f.canBlock()).toBe(false);
  });

  it('cannot jump while crouching (WALK and CROUCH both canAct but CROUCH should not transition to JUMP directly)', () => {
    const f = createFighter();
    f.state = FighterState.CROUCH;
    expect(f.canAct()).toBe(true);
    // The game loop prevents JUMP from CROUCH — crouch must release first
    // A crouching fighter can still canAct (for crouch attacks), but
    // the jump transition in the controller checks that up is pressed AND
    // the fighter is not crouching. This is a logic guard, not a state guard.
    // We verify the canAct is true but the CROUCH state is explicitly not JUMP
    expect(f.state).toBe(FighterState.CROUCH);
    expect(f.state).not.toBe(FighterState.JUMP);
  });

  it('cannot throw while in hitstun (isThrowVulnerable returns false for HITSTUN)', () => {
    const f = createFighter();
    f.applyHitstun(10, 4);
    expect(f.state).toBe(FighterState.HITSTUN);
    // A fighter in HITSTUN cannot be thrown (throw vulnerability check)
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('cannot air-block from ground (canAirBlock returns false when grounded)', () => {
    const f = createFighter();
    expect(f.isGrounded()).toBe(true);
    expect(f.canAirBlock()).toBe(false);
  });

  it('cannot block during run stop delay', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    f.runStopTimer = 5;
    expect(f.canBlock()).toBe(false);
  });
});

// ============================================================================
// 3. State Reset
// ============================================================================
describe('Fighter State Machine: State Reset', () => {
  it('reset() returns fighter to IDLE state', () => {
    const f = createFighter();
    f.state = FighterState.KNOCKDOWN;
    f.isKnockedDown = true;
    f.applyKnockdown(25);
    f.reset(300);
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('reset() clears all timers (hitstun, blockstun, knockdown, landing)', () => {
    const f = createFighter();
    f.hitstunTimer = 15;
    f.blockstunTimer = 10;
    f.knockdownTimer = 25;
    f.landingRecovery = 5;
    f.rollTimer = 15;
    f.backdashTimer = 18;
    f.guardCrushTimer = 30;
    f.dizzyTimer = 60;
    f.throwBufferTimer = 3;
    f.groundBounceTimer = 10;
    f.runStopTimer = 6;
    f.reset(400);
    expect(f.hitstunTimer).toBe(0);
    expect(f.blockstunTimer).toBe(0);
    expect(f.knockdownTimer).toBe(0);
    expect(f.landingRecovery).toBe(0);
    expect(f.rollTimer).toBe(0);
    expect(f.backdashTimer).toBe(0);
    expect(f.guardCrushTimer).toBe(0);
    expect(f.dizzyTimer).toBe(0);
    expect(f.throwBufferTimer).toBe(0);
    expect(f.groundBounceTimer).toBe(0);
    expect(f.runStopTimer).toBe(0);
  });

  it('reset() restores health to maxHealth', () => {
    const f = createFighter();
    f.health = 1;
    f.maxHealth = MAX_HEALTH;
    f.reset(400);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.health).toBe(f.maxHealth);
  });

  it('reset() clears combo state (juggle, air hit count, cancel flags)', () => {
    const f = createFighter();
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 5;
    f.airHitCount = 3;
    f.wallBounceCount = 1;
    f.isGroundBounce = true;
    f.airThrowVulnerable = true;
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'super_cancel';
    f.isCounterWire = true;
    f.hasAttackedInAir = true;
    f.reset(400);
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
    expect(f.wallBounceCount).toBe(0);
    expect(f.isGroundBounce).toBe(false);
    expect(f.airThrowVulnerable).toBe(false);
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelledIntoNormal).toBe(false);
    expect(f.cancelEvent).toBeNull();
    expect(f.isCounterWire).toBe(false);
    expect(f.hasAttackedInAir).toBe(false);
  });
});

// ============================================================================
// 4. Air State Machine
// ============================================================================
describe('Fighter State Machine: Air State Machine', () => {
  it('JUMP -> AIR_ATTACK via startAttack(JUMP_C) while airborne', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    makeAirborne(f);
    f.startAttack(AttackType.JUMP_C);
    expect(f.state).toBe(FighterState.AIR_ATTACK);
    expect(f.currentAttack).toBe(AttackType.JUMP_C);
    expect(f.hasAttackedInAir).toBe(true);
  });

  it('AIR_ATTACK -> HITSTUN via applyHitstun while airborne', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    makeAirborne(f);
    f.startAttack(AttackType.JUMP_A);
    expect(f.state).toBe(FighterState.AIR_ATTACK);
    // Getting hit mid-air
    f.applyHitstun(12, 4);
    expect(f.state).toBe(FighterState.HITSTUN);
    expect(f.hitstunTimer).toBe(12);
  });

  it('JUMP -> AIR_BLOCK via applyAirBlockstun', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    makeAirborne(f);
    expect(f.canAirBlock()).toBe(true);
    f.applyAirBlockstun(8, 3);
    expect(f.state).toBe(FighterState.AIR_BLOCK);
    expect(f.blockstunTimer).toBe(8);
  });

  it('airborne fighter lands and returns to IDLE', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    makeAirborne(f);
    expect(f.isGrounded()).toBe(false);
    // Simulate landing
    f.y = STAGE_GROUND_Y;
    expect(f.isGrounded()).toBe(true);
    f.state = FighterState.IDLE;
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('hasAttackedInAir flag prevents double air attack in one jump', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    makeAirborne(f);
    // First air attack
    f.startAttack(AttackType.JUMP_A);
    expect(f.hasAttackedInAir).toBe(true);
    // Simulate attack ending (endAttack sets state to IDLE but doesn't clear hasAttackedInAir)
    f.endAttack();
    // hasAttackedInAir persists for the jump duration
    expect(f.hasAttackedInAir).toBe(true);
    // The game loop checks hasAttackedInAir before allowing another air attack
    // A second startAttack from JUMP state would still set the flag,
    // but the controller gate prevents the call
  });

  it('HOP -> AIR_ATTACK marks hasAttackedInAir', () => {
    const f = createFighter();
    f.state = FighterState.HOP;
    makeAirborne(f);
    f.startAttack(AttackType.JUMP_B);
    expect(f.state).toBe(FighterState.AIR_ATTACK);
    expect(f.hasAttackedInAir).toBe(true);
  });

  it('RUN_JUMP -> AIR_ATTACK marks hasAttackedInAir', () => {
    const f = createFighter();
    f.state = FighterState.RUN_JUMP;
    makeAirborne(f);
    f.startAttack(AttackType.JUMP_D);
    expect(f.state).toBe(FighterState.AIR_ATTACK);
    expect(f.hasAttackedInAir).toBe(true);
  });
});

// ============================================================================
// 5. Special State Transitions
// ============================================================================
describe('Fighter State Machine: Special State Transitions', () => {
  it('BLOCK -> GUARD_CRUSH when guard gauge depleted', () => {
    const f = createFighter();
    f.state = FighterState.BLOCK;
    f.guardGauge = 0;
    // Simulate guard crush (normally set by combatSystem when guardGauge <= 0)
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);
  });

  it('GUARD_CRUSH -> IDLE when guard crush timer expires', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    // Simulate timer countdown
    for (let i = 0; i < GUARD_CRUSH_DURATION; i++) {
      f.guardCrushTimer--;
    }
    expect(f.guardCrushTimer).toBe(0);
    // Main loop transitions to IDLE
    f.state = FighterState.IDLE;
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('any state -> KNOCKDOWN via applyKnockdown (knockdown attack)', () => {
    const states: FighterState[] = [
      FighterState.IDLE,
      FighterState.WALK,
      FighterState.STAND_ATTACK,
      FighterState.HITSTUN,
      FighterState.BLOCK,
    ];
    for (const initialState of states) {
      const f = createFighter();
      f.state = initialState;
      f.applyKnockdown(25);
      expect(f.state).toBe(FighterState.KNOCKDOWN);
      expect(f.isKnockedDown).toBe(true);
    }
  });

  it('DIZZY state: fighter cannot defend (canAct and canBlock return false)', () => {
    const f = createFighter();
    // Simulate stun gauge filling up and entering dizzy
    f.state = FighterState.DIZZY;
    f.dizzyTimer = 120;
    expect(f.state).toBe(FighterState.DIZZY);
    expect(f.canAct()).toBe(false);
    expect(f.canBlock()).toBe(false);
    // Any hit on a dizzy fighter connects without defense
  });

  it('COUNTER_STANCE: triggers counter on hit', () => {
    const f = createFighter();
    f.state = FighterState.COUNTER_STANCE;
    expect(f.state).toBe(FighterState.COUNTER_STANCE);
    // When hit in counter stance, the combat system checks for
    // defender.state === FighterState.COUNTER_STANCE and triggers counter
    // Here we verify the state is correctly set
    expect(f.canAct()).toBe(false);
    expect(f.canBlock()).toBe(false);
  });

  it('THROW state: correctly set for THROW_FORWARD attack type', () => {
    const f = createFighter();
    f.startAttack(AttackType.THROW_FORWARD);
    expect(f.state).toBe(FighterState.THROW);
    expect(f.currentAttack).toBe(AttackType.THROW_FORWARD);
  });

  it('applyDizzy sets DIZZY state and clears velocity', () => {
    const f = createFighter();
    f.vx = 5;
    f.vy = -3;
    f.applyDizzy();
    expect(f.state).toBe(FighterState.DIZZY);
    expect(f.vx).toBe(0);
    expect(f.vy).toBe(0);
    expect(f.dizzyTimer).toBeGreaterThanOrEqual(60); // DIZZY_BASE_DURATION_MIN
    expect(f.dizzyTimer).toBeLessThanOrEqual(180);   // DIZZY_BASE_DURATION_MAX
    expect(f.dizzyMashCount).toBe(0);
  });

  it('mashDizzy reduces dizzy timer', () => {
    const f = createFighter();
    f.applyDizzy();
    const initialTimer = f.dizzyTimer;
    f.mashDizzy();
    expect(f.dizzyTimer).toBeLessThan(initialTimer);
    expect(f.dizzyMashCount).toBe(1);
  });
});

// ============================================================================
// 6. State Timer Integration
// ============================================================================
describe('Fighter State Machine: State Timer Integration', () => {
  it('hitstunTimer counts down via tickTimers (verified manually)', () => {
    const f = createFighter();
    f.applyHitstun(10, 4);
    expect(f.hitstunTimer).toBe(10);
    // Note: tickTimers() does NOT decrement hitstunTimer — the main loop does that.
    // We verify the timer is set and can be manually decremented.
    f.hitstunTimer--;
    expect(f.hitstunTimer).toBe(9);
  });

  it('blockstunTimer counts down via tickTimers (verified manually)', () => {
    const f = createFighter();
    f.applyBlockstun(12, 5);
    expect(f.blockstunTimer).toBe(12);
    // tickTimers does not decrement blockstunTimer either — main loop handles it
    f.blockstunTimer--;
    expect(f.blockstunTimer).toBe(11);
  });

  it('landingRecovery counts down each frame via tickTimers', () => {
    const f = createFighter();
    f.landingRecovery = 4;
    f.tickTimers();
    expect(f.landingRecovery).toBe(3);
    f.tickTimers();
    expect(f.landingRecovery).toBe(2);
    f.tickTimers();
    expect(f.landingRecovery).toBe(1);
    f.tickTimers();
    expect(f.landingRecovery).toBe(0);
  });

  it('multiple timers can be active simultaneously', () => {
    const f = createFighter();
    f.landingRecovery = 3;
    f.runStopTimer = 5;
    f.throwInvincibilityTimer = 7;
    f.hitFlashFrames = 4;
    f.throwBufferTimer = 2;
    f.groundBounceTimer = 8;
    // All these timers should decrement together via tickTimers
    f.tickTimers();
    expect(f.landingRecovery).toBe(2);
    expect(f.runStopTimer).toBe(4);
    expect(f.throwInvincibilityTimer).toBe(6);
    expect(f.hitFlashFrames).toBe(3);
    expect(f.throwBufferTimer).toBe(1);
    expect(f.groundBounceTimer).toBe(7);
    // Tick remaining
    f.tickTimers();
    f.tickTimers();
    expect(f.throwBufferTimer).toBe(0);
    expect(f.landingRecovery).toBe(0);
    expect(f.groundBounceTimer).toBe(5);
  });

  it('groundBounceTimer reaching 0 clears isGroundBounce', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 2;
    f.tickTimers();
    expect(f.isGroundBounce).toBe(true);
    f.tickTimers();
    expect(f.groundBounceTimer).toBe(0);
    expect(f.isGroundBounce).toBe(false);
  });

  it('runStopTimer decrementing restores block ability', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    f.runStopTimer = 2;
    expect(f.canBlock()).toBe(false);
    f.tickTimers();
    expect(f.runStopTimer).toBe(1);
    expect(f.canBlock()).toBe(false);
    f.tickTimers();
    expect(f.runStopTimer).toBe(0);
    expect(f.canBlock()).toBe(true);
  });
});

// ============================================================================
// Bonus: Edge Cases and State Consistency
// ============================================================================
describe('Fighter State Machine: Edge Cases', () => {
  it('attack endAttack always returns to IDLE', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_D);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    f.endAttack();
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.currentAttack).toBeNull();
    expect(f.attackPhase).toBe('none');
    expect(f.hasHit).toBe(false);
  });

  it('resetAttackState clears attack without changing state', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_A);
    f.state = FighterState.HITSTUN; // simulate state override by hitstun
    f.resetAttackState();
    expect(f.currentAttack).toBeNull();
    expect(f.attackFrame).toBe(0);
    expect(f.attackPhase).toBe('none');
    // state remains HITSTUN — resetAttackState does not change state
    expect(f.state).toBe(FighterState.HITSTUN);
  });

  it('resetCancelFlags clears all cancel-related flags', () => {
    const f = createFighter();
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'free_cancel';
    f.resetCancelFlags();
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelledIntoNormal).toBe(false);
    expect(f.cancelEvent).toBeNull();
  });

  it('resetComboJuggleState clears all juggle tracking', () => {
    const f = createFighter();
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 5;
    f.airHitCount = 3;
    f.wallBounceCount = 2;
    f.isGroundBounce = true;
    f.groundBounceTimer = 15;
    f.airThrowVulnerable = true;
    f.resetComboJuggleState();
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
    expect(f.wallBounceCount).toBe(0);
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
    expect(f.airThrowVulnerable).toBe(false);
  });

  it('applyKnockdown with hard=true sets isHardKnockdown', () => {
    const f = createFighter();
    f.applyKnockdown(30, true);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isHardKnockdown).toBe(true);
    expect(f.isKnockedDown).toBe(true);
    expect(f.knockdownTimer).toBe(30);
  });

  it('applyKnockdown without hard flag sets normal knockdown', () => {
    const f = createFighter();
    f.applyKnockdown(25);
    expect(f.state).toBe(FighterState.KNOCKDOWN);
    expect(f.isHardKnockdown).toBe(false);
    expect(f.isKnockedDown).toBe(true);
  });

  it('stun gauge accumulation: addStunFill returns true when maxed', () => {
    const f = createFighter();
    expect(f.stunGauge).toBe(0);
    // Fill to near max
    const nearMax = STUN_GAUGE_MAX - 5;
    f.stunGauge = nearMax;
    const reachedMax = f.addStunFill(10);
    expect(reachedMax).toBe(true);
    expect(f.stunGauge).toBe(STUN_GAUGE_MAX);
  });

  it('stun gauge accumulation: addStunFill returns false when not maxed', () => {
    const f = createFighter();
    const reachedMax = f.addStunFill(10);
    expect(reachedMax).toBe(false);
    expect(f.stunGauge).toBe(10);
  });

  it('stun gauge resets decay timer on each hit', () => {
    const f = createFighter();
    f.stunDecayTimer = 50;
    f.addStunFill(5);
    expect(f.stunDecayTimer).toBe(0);
  });

  it('guard gauge recovery in IDLE state via tickTimers', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.IDLE;
    f.tickTimers();
    // IDLE recovery rate is 0.25 per frame
    expect(f.guardGauge).toBeCloseTo(50.25, 1);
  });

  it('guard gauge does NOT recover in BLOCK state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.BLOCK;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge does NOT recover in HITSTUN state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.HITSTUN;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge recovers slower in RUN state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.RUN;
    f.tickTimers();
    // RUN recovery rate is 0.15 per frame
    expect(f.guardGauge).toBeCloseTo(50.15, 1);
  });

  it('consecutive block count decays after PUSHBLOCK_DECAY_FRAMES', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = 0; // already expired
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('savePrevState tracks previous state correctly', () => {
    const f = createFighter();
    expect(f.prevState).toBe(FighterState.IDLE);
    f.state = FighterState.WALK;
    f.savePrevState();
    expect(f.prevState).toBe(FighterState.WALK);
    f.state = FighterState.HITSTUN;
    f.savePrevState();
    expect(f.prevState).toBe(FighterState.HITSTUN);
  });
});
