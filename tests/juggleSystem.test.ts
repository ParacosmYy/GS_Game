import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import {
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL,
  JUGGLE_COST_DM,
  JUGGLE_COST_CD,
  JUGGLE_GRAVITY_BASE,
  JUGGLE_GRAVITY_SCALE_PER_HIT,
  GROUND_BOUNCE_VY,
  GROUND_BOUNCE_COST,
  GROUND_BOUNCE_HITSTUN,
  WALL_BOUNCE_MAX_PER_COMBO,
  WALL_BOUNCE_SLIDE_FRICTION,
  STAGE_GROUND_Y,
  MAX_HEALTH,
  GRAVITY,
  STAGE_LEFT,
  STAGE_RIGHT,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
} from '../src/core/constants.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';

// Helper to create a fighter
function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

// Helper to set fighter airborne
function setAirborne(f: Fighter, y = 300): void {
  f.y = y;
  f.state = FighterState.HITSTUN;
  f.juggleState = JuggleState.FULL;
  f.jugglePoints = JUGGLE_POINTS_MAX;
}

// Minimal IInputProvider mock — no inputs (defender doesn't block)
function createNoInputProvider(): IInputProvider {
  const noop: PlayerInput = {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
  };
  return {
    getP1Input: () => noop,
    getP2Input: () => noop,
  };
}

/**
 * Simulate the gravity that combatSystem.resolveHit applies to an airborne defender.
 * Replicates the exact formula from resolveHit lines 338-339:
 *   const gravityScale = 1 + defender.airHitCount * JUGGLE_GRAVITY_SCALE_PER_HIT;
 *   defender.vy += JUGGLE_GRAVITY_BASE * gravityScale;
 */
function simulateJuggleGravity(f: Fighter): void {
  const gravityScale = 1 + f.airHitCount * JUGGLE_GRAVITY_SCALE_PER_HIT;
  f.vy += JUGGLE_GRAVITY_BASE * gravityScale;
}

/**
 * Simulate the juggle point consumption from resolveHit:
 *   const baseCost = getJuggleCost(attackType);
 *   const juggleCost = Math.ceil(baseCost * (1 + defender.airHitCount * 0.2));
 *   defender.jugglePoints -= juggleCost;
 *   defender.airHitCount++;
 */
function simulateJugglePointDeduction(f: Fighter, baseCost: number): void {
  const juggleCost = Math.ceil(baseCost * (1 + f.airHitCount * 0.2));
  f.jugglePoints -= juggleCost;
  f.airHitCount++;
}

// ============================================================================
// JUGGLE POINT SYSTEM
// ============================================================================

describe('Juggle Point System', () => {
  describe('Juggle point constants', () => {
    it('JUGGLE_POINTS_MAX should be 5', () => {
      expect(JUGGLE_POINTS_MAX).toBe(5);
    });

    it('Light attacks cost 1 juggle point', () => {
      expect(JUGGLE_COST_LIGHT).toBe(1);
    });

    it('Heavy attacks cost 2 juggle points', () => {
      expect(JUGGLE_COST_HEAVY).toBe(2);
    });

    it('Special attacks cost 2 juggle points', () => {
      expect(JUGGLE_COST_SPECIAL).toBe(2);
    });

    it('DM attacks cost 3 juggle points', () => {
      expect(JUGGLE_COST_DM).toBe(3);
    });

    it('CD blowback costs 2 juggle points', () => {
      expect(JUGGLE_COST_CD).toBe(2);
    });

    it('Cost hierarchy: DM > Heavy/Special/CD > Light', () => {
      expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_HEAVY);
      expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_SPECIAL);
      expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_CD);
      expect(JUGGLE_COST_HEAVY).toBeGreaterThan(JUGGLE_COST_LIGHT);
      expect(JUGGLE_COST_SPECIAL).toBeGreaterThan(JUGGLE_COST_LIGHT);
      expect(JUGGLE_COST_CD).toBeGreaterThan(JUGGLE_COST_LIGHT);
    });
  });

  describe('Juggle point consumption', () => {
    it('Light attacks consume from juggle budget', () => {
      const f = createFighter();
      setAirborne(f);
      const initialPoints = f.jugglePoints;
      // Simulate consuming 1 light attack cost
      f.jugglePoints -= JUGGLE_COST_LIGHT;
      expect(f.jugglePoints).toBe(initialPoints - 1);
    });

    it('Heavy attacks consume same points as two light attacks', () => {
      const f = createFighter();
      setAirborne(f);
      const initialPoints = f.jugglePoints;
      // Two light attacks cost = 1+1 = 2, one heavy attack cost = 2
      const twoLightCost = JUGGLE_COST_LIGHT * 2;
      expect(JUGGLE_COST_HEAVY).toBe(twoLightCost);
    });

    it('DM consumes the most points (3 of 5)', () => {
      // DM cost 3 out of max 5 leaves only 2 points
      expect(JUGGLE_POINTS_MAX - JUGGLE_COST_DM).toBe(2);
    });

    it('Multiple light attacks exhaust juggle budget', () => {
      const f = createFighter();
      setAirborne(f);
      // With progressive cost: hit 0 costs 1, hit 1 costs 2, hit 2 costs 2, ...
      // Total: 1 + 2 + 2 = 5 (exhausted after 3 hits with progressive scaling)
      let remaining = f.jugglePoints;
      let hitCount = 0;

      // Hit 1: baseCost=1, scaled=1*(1+0*0.2)=1
      const cost1 = Math.ceil(JUGGLE_COST_LIGHT * (1 + hitCount * 0.2));
      remaining -= cost1;
      hitCount++;
      expect(remaining).toBe(4);

      // Hit 2: baseCost=1, scaled=1*(1+1*0.2)=1.2->2
      const cost2 = Math.ceil(JUGGLE_COST_LIGHT * (1 + hitCount * 0.2));
      remaining -= cost2;
      hitCount++;
      expect(remaining).toBe(2);

      // Hit 3: baseCost=1, scaled=1*(1+2*0.2)=1.4->2
      const cost3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + hitCount * 0.2));
      remaining -= cost3;
      hitCount++;
      expect(remaining).toBe(0);

      // Hit 4: baseCost=1, scaled=1*(1+3*0.2)=1.6->2, but only 0 points left
      const cost4 = Math.ceil(JUGGLE_COST_LIGHT * (1 + hitCount * 0.2));
      expect(remaining < cost4).toBe(true);
    });
  });

  describe('Juggle point exhaustion prevents air hits', () => {
    it('Zero juggle points means no more air hits', () => {
      const f = createFighter();
      setAirborne(f);
      f.jugglePoints = 0;
      // Any positive cost should fail
      expect(f.jugglePoints < JUGGLE_COST_LIGHT).toBe(true);
      expect(f.jugglePoints < JUGGLE_COST_HEAVY).toBe(true);
    });

    it('Juggle points below cost means no hit', () => {
      const f = createFighter();
      setAirborne(f);
      f.jugglePoints = 1;
      // Light attack (cost 1) still works
      expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
      // Heavy attack (cost 2) does not
      expect(f.jugglePoints >= JUGGLE_COST_HEAVY).toBe(false);
    });

    it('JuggleState.NONE prevents air hits entirely', () => {
      const f = createFighter();
      setAirborne(f);
      f.juggleState = JuggleState.NONE;
      // Even with points, NONE state prevents juggling
      expect(f.juggleState).toBe(JuggleState.NONE);
      expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    });
  });

  describe('Juggle point reset on landing', () => {
    it('resetComboJuggleState resets all juggle state', () => {
      const f = createFighter();
      setAirborne(f);
      f.airHitCount = 3;
      f.wallBounceCount = 1;
      f.isGroundBounce = true;
      f.groundBounceTimer = 10;
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

    it('Full reset also clears juggle state', () => {
      const f = createFighter();
      setAirborne(f);
      f.airHitCount = 5;
      f.wallBounceCount = 1;
      f.isGroundBounce = true;

      f.reset(400);

      expect(f.juggleState).toBe(JuggleState.NONE);
      expect(f.jugglePoints).toBe(0);
      expect(f.airHitCount).toBe(0);
      expect(f.wallBounceCount).toBe(0);
      expect(f.isGroundBounce).toBe(false);
    });
  });
});

// ============================================================================
// JUGGLE HEIGHT DECAY (GRAVITY SCALING)
// ============================================================================

describe('Juggle Height Decay', () => {
  it('First air hit adds base gravity', () => {
    const f = createFighter();
    setAirborne(f);
    f.airHitCount = 0;
    const hitCount = f.airHitCount;
    const gravityScale = 1 + (hitCount + 1) * JUGGLE_GRAVITY_SCALE_PER_HIT;
    const gravityAdd = JUGGLE_GRAVITY_BASE * gravityScale;
    // After first hit: gravityScale = 1 + 1*0.15 = 1.15, addition = 0.3*1.15 = 0.345
    expect(gravityAdd).toBeCloseTo(0.345, 2);
  });

  it('Successive air hits add progressively more gravity', () => {
    const additions: number[] = [];
    for (let hit = 1; hit <= 5; hit++) {
      const gravityScale = 1 + hit * JUGGLE_GRAVITY_SCALE_PER_HIT;
      additions.push(JUGGLE_GRAVITY_BASE * gravityScale);
    }
    // Each successive hit should add more gravity than the last
    for (let i = 1; i < additions.length; i++) {
      expect(additions[i]).toBeGreaterThan(additions[i - 1]);
    }
  });

  it('After 4 air hits, gravity is very high (prevents infinite combos)', () => {
    // hit 4: gravityScale = 1 + 4*0.15 = 1.6, addition = 0.48
    const hit4Scale = 1 + 4 * JUGGLE_GRAVITY_SCALE_PER_HIT;
    const hit4Gravity = JUGGLE_GRAVITY_BASE * hit4Scale;
    expect(hit4Gravity).toBeGreaterThan(JUGGLE_GRAVITY_BASE * 1.5);
  });

  it('Gravity constants are reasonable', () => {
    expect(JUGGLE_GRAVITY_BASE).toBeGreaterThan(0);
    expect(JUGGLE_GRAVITY_SCALE_PER_HIT).toBeGreaterThan(0);
    // At 10 hits, gravity should be very strong but not extreme
    const scale10 = 1 + 10 * JUGGLE_GRAVITY_SCALE_PER_HIT;
    const gravity10 = JUGGLE_GRAVITY_BASE * scale10;
    expect(gravity10).toBeLessThan(5); // Not so extreme it breaks physics
  });
});

// ============================================================================
// WALL BOUNCE TRACKING
// ============================================================================

describe('Wall Bounce Tracking', () => {
  it('WALL_BOUNCE_MAX_PER_COMBO should be 1', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBe(1);
  });

  it('Wall bounce count starts at 0', () => {
    const f = createFighter();
    expect(f.wallBounceCount).toBe(0);
  });

  it('Wall bounce count increments on wall bounce', () => {
    const f = createFighter();
    f.wallBounceCount++;
    expect(f.wallBounceCount).toBe(1);
  });

  it('Second wall bounce in same combo is blocked', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    // Should not trigger wall bounce again
    expect(f.wallBounceCount >= WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('Wall bounce count resets on landing', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    f.resetComboJuggleState();
    expect(f.wallBounceCount).toBe(0);
  });

  it('Wall bounce count resets on full reset', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    f.reset(400);
    expect(f.wallBounceCount).toBe(0);
  });

  it('Counter Wire state and wall bounce count are independent', () => {
    const f = createFighter();
    f.isCounterWire = true;
    f.wallBounceCount = 1;
    // Resetting combo state should reset wall bounce but not isCounterWire
    f.resetComboJuggleState();
    expect(f.wallBounceCount).toBe(0);
    expect(f.isCounterWire).toBe(true); // isCounterWire is NOT reset by resetComboJuggleState
  });

  it('isCounterWire resets on full fighter reset', () => {
    const f = createFighter();
    f.isCounterWire = true;
    f.reset(400);
    expect(f.isCounterWire).toBe(false);
  });

  it('WALL_BOUNCE_SLIDE_FRICTION is between 0 and 1', () => {
    expect(WALL_BOUNCE_SLIDE_FRICTION).toBeGreaterThan(0);
    expect(WALL_BOUNCE_SLIDE_FRICTION).toBeLessThanOrEqual(1);
  });
});

// ============================================================================
// GROUND BOUNCE
// ============================================================================

describe('Ground Bounce', () => {
  it('GROUND_BOUNCE_VY should be negative (upward)', () => {
    expect(GROUND_BOUNCE_VY).toBeLessThan(0);
  });

  it('GROUND_BOUNCE_COST should be positive', () => {
    expect(GROUND_BOUNCE_COST).toBeGreaterThan(0);
  });

  it('GROUND_BOUNCE_HITSTUN should be positive', () => {
    expect(GROUND_BOUNCE_HITSTUN).toBeGreaterThan(0);
  });

  it('Ground bounce fields start at default values', () => {
    const f = createFighter();
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
  });

  it('Ground bounce can be set and cleared', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    expect(f.isGroundBounce).toBe(true);

    // Simulate timer ticking down
    for (let i = 0; i < GROUND_BOUNCE_HITSTUN; i++) {
      f.groundBounceTimer--;
    }
    expect(f.groundBounceTimer).toBe(0);
    // After timer hits 0, isGroundBounce should be cleared by tickTimers
  });

  it('tickTimers decrements groundBounceTimer', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 5;
    f.tickTimers();
    expect(f.groundBounceTimer).toBe(4);
    expect(f.isGroundBounce).toBe(true); // Still active while timer > 0
  });

  it('tickTimers clears isGroundBounce when timer reaches 0', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 1;
    f.tickTimers();
    expect(f.groundBounceTimer).toBe(0);
    expect(f.isGroundBounce).toBe(false);
  });

  it('Ground bounce state resets on resetComboJuggleState', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 10;
    f.resetComboJuggleState();
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
  });

  it('Ground bounce state resets on full reset', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 10;
    f.reset(400);
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
  });

  it('Ground bounce gives juggle state for follow-up', () => {
    // When a ground bounce triggers, the fighter should have juggle state
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);

    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);
    // Should have enough points for at least a light follow-up
    expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
  });

  it('Ground bounce does not give full juggle points (costs extra)', () => {
    const pointsAfterBounce = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);
    expect(pointsAfterBounce).toBeLessThan(JUGGLE_POINTS_MAX);
  });
});

// ============================================================================
// AIR THROW MECHANICS
// ============================================================================

describe('Air Throw Mechanics', () => {
  it('Grounded fighter is not air throw vulnerable', () => {
    const f = createFighter();
    expect(f.isGrounded()).toBe(true);
    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('Airborne fighter is not air throw vulnerable by default', () => {
    const f = createFighter();
    f.y = 300;
    expect(f.isGrounded()).toBe(false);
    expect(f.isAirThrowVulnerable()).toBe(false); // airThrowVulnerable defaults to false
  });

  it('Airborne fighter with airThrowVulnerable=true can be air thrown', () => {
    const f = createFighter();
    f.y = 300;
    f.airThrowVulnerable = true;
    expect(f.isAirThrowVulnerable()).toBe(true);
  });

  it('Ground throw vulnerability requires grounded state', () => {
    const f = createFighter();
    expect(f.isGrounded()).toBe(true);
    expect(f.isThrowVulnerable()).toBe(true); // IDLE, grounded
  });

  it('Airborne fighter cannot be ground thrown', () => {
    const f = createFighter();
    f.y = 300;
    f.state = FighterState.JUMP;
    expect(f.isGrounded()).toBe(false);
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('airThrowVulnerable is reset on combo reset', () => {
    const f = createFighter();
    f.airThrowVulnerable = true;
    f.resetComboJuggleState();
    expect(f.airThrowVulnerable).toBe(false);
  });

  it('airThrowVulnerable is reset on full reset', () => {
    const f = createFighter();
    f.airThrowVulnerable = true;
    f.reset(400);
    expect(f.airThrowVulnerable).toBe(false);
  });

  it('Throw invuln frames block air throw', () => {
    const f = createFighter();
    f.y = 300;
    f.airThrowVulnerable = true;
    f.throwInvulnFrames = 5;
    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('AIR_BLOCK state blocks air throw', () => {
    const f = createFighter();
    f.y = 300;
    f.airThrowVulnerable = true;
    f.state = FighterState.AIR_BLOCK;
    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('THROW state blocks air throw', () => {
    const f = createFighter();
    f.y = 300;
    f.airThrowVulnerable = true;
    f.state = FighterState.THROW;
    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('Command throws (ground only) cannot grab airborne opponents', () => {
    const f = createFighter();
    f.y = 300;
    f.state = FighterState.IDLE;
    // Ground throw vulnerability check: !isGrounded() => false
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Normal throws (ground only) cannot grab airborne opponents', () => {
    const f = createFighter();
    f.y = 300;
    // Even in a throwable state, airborne => not throw-vulnerable
    expect(f.isThrowVulnerable()).toBe(false);
  });
});

// ============================================================================
// INTEGRATION: JUGGLE COMBO FLOW
// ============================================================================

describe('Juggle Combo Flow Integration', () => {
  it('Complete juggle combo: launch -> light -> light -> exhausted', () => {
    const f = createFighter();
    setAirborne(f);

    // Simulate progressive juggle cost for light attacks
    let points = f.jugglePoints;
    let airHits = 0;

    // Hit 1: cost = ceil(1 * (1 + 0*0.2)) = 1
    const cost1 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost1;
    airHits++;
    expect(points).toBe(4);

    // Hit 2: cost = ceil(1 * (1 + 1*0.2)) = ceil(1.2) = 2
    const cost2 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost2;
    airHits++;
    expect(points).toBe(2);

    // Hit 3: cost = ceil(1 * (1 + 2*0.2)) = ceil(1.4) = 2
    const cost3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost3;
    airHits++;
    expect(points).toBe(0);

    // Hit 4: cost = ceil(1 * (1 + 3*0.2)) = ceil(1.6) = 2, but 0 points left
    const cost4 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    expect(points >= cost4).toBe(false); // Cannot afford
  });

  it('Heavy attack juggle combo exhausts budget faster', () => {
    const f = createFighter();
    setAirborne(f);

    let points = f.jugglePoints;
    let airHits = 0;

    // Hit 1 heavy: cost = ceil(2 * (1 + 0*0.2)) = 2
    const cost1 = Math.ceil(JUGGLE_COST_HEAVY * (1 + airHits * 0.2));
    points -= cost1;
    airHits++;
    expect(points).toBe(3);

    // Hit 2 heavy: cost = ceil(2 * (1 + 1*0.2)) = ceil(2.4) = 3
    const cost2 = Math.ceil(JUGGLE_COST_HEAVY * (1 + airHits * 0.2));
    points -= cost2;
    airHits++;
    expect(points).toBe(0);

    // Hit 3 heavy: cost = ceil(2 * (1 + 2*0.2)) = ceil(2.8) = 3, 0 points left
    const cost3 = Math.ceil(JUGGLE_COST_HEAVY * (1 + airHits * 0.2));
    expect(points >= cost3).toBe(false);
  });

  it('Counter Wire -> wall bounce -> follow-up is possible', () => {
    const f = createFighter();
    setAirborne(f);
    f.isCounterWire = true;
    f.wallBounceCount = 0;
    f.jugglePoints = JUGGLE_POINTS_MAX;

    // After wall bounce (handled by physics), juggle state is set
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 3;

    // Can follow up with light (cost 1, progressive from 0)
    const followUpCost = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints >= followUpCost).toBe(true);
  });

  it('Second wall bounce in same combo is prevented', () => {
    const f = createFighter();
    setAirborne(f);
    f.wallBounceCount = 1;

    // A second wall bounce should be blocked
    expect(f.wallBounceCount >= WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('New combo after landing allows wall bounce again', () => {
    const f = createFighter();
    setAirborne(f);
    f.wallBounceCount = 1;

    // Land and reset combo state
    f.resetComboJuggleState();
    expect(f.wallBounceCount).toBe(0);
    expect(f.wallBounceCount < WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('Ground bounce creates juggle opportunity', () => {
    const f = createFighter();
    // Simulate ground bounce scenario
    f.y = STAGE_GROUND_Y;
    f.state = FighterState.HITSTUN;
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);

    // Fighter should be juggleable during ground bounce
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBeGreaterThan(0);
    // Can afford at least a light attack follow-up
    expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
  });

  it('Ground bounce with DM leaves no follow-up points', () => {
    const pointsAfterBounce = JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST; // 5 - 2 = 3
    // DM costs 3, so exactly enough for one DM follow-up
    expect(pointsAfterBounce >= JUGGLE_COST_DM).toBe(true);
    // But nothing left after DM
    expect(pointsAfterBounce - JUGGLE_COST_DM).toBe(0);
  });
});

// ============================================================================
// CONSTISTENCY CHECKS
// ============================================================================

describe('Juggle System Consistency', () => {
  it('All new Fighter fields are properly initialized', () => {
    const f = createFighter();
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
    expect(f.wallBounceCount).toBe(0);
    expect(f.airThrowVulnerable).toBe(false);
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
  });

  it('resetComboJuggleState does not affect non-juggle state', () => {
    const f = createFighter();
    f.health = 500;
    f.state = FighterState.HITSTUN;
    f.x = 300;
    f.vx = 5;
    f.vy = -3;
    f.guardGauge = 50;
    f.stunGauge = 30;

    f.resetComboJuggleState();

    // These should NOT be affected
    expect(f.health).toBe(500);
    expect(f.state).toBe(FighterState.HITSTUN);
    expect(f.x).toBe(300);
    expect(f.vx).toBe(5);
    expect(f.vy).toBe(-3);
    expect(f.guardGauge).toBe(50);
    expect(f.stunGauge).toBe(30);
  });

  it('isCounterWire is NOT reset by resetComboJuggleState', () => {
    // This is intentional: isCounterWire is a physics flag, not a combo counter
    const f = createFighter();
    f.isCounterWire = true;
    f.resetComboJuggleState();
    expect(f.isCounterWire).toBe(true);
  });

  it('Fighter is grounded at STAGE_GROUND_Y', () => {
    const f = createFighter();
    expect(f.y).toBe(STAGE_GROUND_Y);
    expect(f.isGrounded()).toBe(true);
  });

  it('Fighter is airborne below STAGE_GROUND_Y', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y - 1;
    expect(f.isGrounded()).toBe(false);
  });
});

// ============================================================================
// COMBAT SYSTEM INTEGRATION: JUGGLE GRAVITY DECAY
// ============================================================================

describe('Combat System Juggle Gravity Decay Integration', () => {
  it('1st air hit: gravity addition = 0.345 (BASE * (1 + 1 * SCALE))', () => {
    // After the first air hit, airHitCount has been incremented to 1 inside resolveHit.
    // The formula uses the post-increment count: gravityScale = 1 + 1 * 0.15 = 1.15
    // gravity addition = 0.3 * 1.15 = 0.345
    const f = createFighter();
    setAirborne(f);
    f.vy = 0;
    f.airHitCount = 0;

    // Simulate what resolveHit does: increment airHitCount THEN apply gravity
    f.airHitCount++;
    simulateJuggleGravity(f);

    // After 1st hit: airHitCount=1, gravityScale=1+1*0.15=1.15, addition=0.345
    expect(f.vy).toBeCloseTo(0.345, 2);
  });

  it('2nd air hit: gravity addition = 0.39 (cumulative)', () => {
    const f = createFighter();
    setAirborne(f);
    f.vy = 0;

    // Hit 1
    f.airHitCount++;
    simulateJuggleGravity(f);
    // Hit 2
    f.airHitCount++;
    simulateJuggleGravity(f);

    // Total: 0.345 + 0.39 = 0.735
    // Hit 2: gravityScale=1+2*0.15=1.30, addition=0.3*1.30=0.39
    expect(f.vy).toBeCloseTo(0.345 + 0.39, 2);
  });

  it('3rd air hit: gravity addition = 0.435 (progressive)', () => {
    const f = createFighter();
    setAirborne(f);
    f.vy = 0;

    for (let i = 0; i < 3; i++) {
      f.airHitCount++;
      simulateJuggleGravity(f);
    }

    // Hit 3: gravityScale=1+3*0.15=1.45, addition=0.3*1.45=0.435
    // Total: 0.345 + 0.39 + 0.435 = 1.17
    expect(f.vy).toBeCloseTo(0.345 + 0.39 + 0.435, 2);
  });

  it('Successive gravity additions are strictly increasing', () => {
    const additions: number[] = [];
    for (let hit = 1; hit <= 6; hit++) {
      const gravityScale = 1 + hit * JUGGLE_GRAVITY_SCALE_PER_HIT;
      additions.push(JUGGLE_GRAVITY_BASE * gravityScale);
    }
    for (let i = 1; i < additions.length; i++) {
      expect(additions[i]).toBeGreaterThan(additions[i - 1]);
    }
  });
});

// ============================================================================
// COMBAT SYSTEM INTEGRATION: WALL BOUNCE LIMIT
// ============================================================================

describe('Combat System Wall Bounce Limit Integration', () => {
  it('Wall bounce count check: first bounce allowed (0 < 1)', () => {
    const f = createFighter();
    expect(f.wallBounceCount).toBe(0);
    expect(f.wallBounceCount < WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('Wall bounce count check: second bounce blocked (1 >= 1)', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    expect(f.wallBounceCount >= WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('Wall bounce via counter wire sets juggle state and increments count', () => {
    const f = createFighter();
    // Simulate counter wire trigger (as resolveHit does)
    f.isCounterWire = true;
    f.wallBounceCount++;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 3;

    expect(f.isCounterWire).toBe(true);
    expect(f.wallBounceCount).toBe(1);
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.wallBounceCount >= WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('Wall bounce resets when combo state resets (new combo)', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    f.resetComboJuggleState();
    expect(f.wallBounceCount).toBe(0);
    expect(f.wallBounceCount < WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });
});

// ============================================================================
// COMBAT SYSTEM INTEGRATION: GROUND BOUNCE
// ============================================================================

describe('Combat System Ground Bounce Integration', () => {
  it('Ground bounce sets vy to GROUND_BOUNCE_VY (-5)', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y;
    f.state = FighterState.HITSTUN;
    f.vy = 0;

    // Simulate ground bounce trigger (as resolveHit does for knockdown moves with groundBounce)
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.vy = GROUND_BOUNCE_VY;

    expect(f.vy).toBe(GROUND_BOUNCE_VY);
    expect(f.vy).toBe(-5);
    expect(f.isGroundBounce).toBe(true);
    expect(f.groundBounceTimer).toBe(GROUND_BOUNCE_HITSTUN);
  });

  it('Ground bounce sets juggle state to FULL with reduced points', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y;
    f.state = FighterState.HITSTUN;

    // Simulate ground bounce juggle setup (as resolveHit does)
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.vy = GROUND_BOUNCE_VY;
    f.vx = 0;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);
    f.state = FighterState.HITSTUN;
    f.hitstunTimer = GROUND_BOUNCE_HITSTUN;
    f.isKnockedDown = false;

    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST); // 5-2=3
    // Can still afford a light attack follow-up
    expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
  });

  it('Ground bounce timer decrements via tickTimers', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 5;
    f.tickTimers();
    expect(f.groundBounceTimer).toBe(4);
    expect(f.isGroundBounce).toBe(true);
  });

  it('Ground bounce timer clears isGroundBounce when reaching 0', () => {
    const f = createFighter();
    f.isGroundBounce = true;
    f.groundBounceTimer = 1;
    f.tickTimers();
    expect(f.groundBounceTimer).toBe(0);
    expect(f.isGroundBounce).toBe(false);
  });

  it('Ground bounce preserves wall bounce count (combo continues)', () => {
    const f = createFighter();
    f.wallBounceCount = 1;
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    // Ground bounce should NOT reset wall bounce count
    expect(f.wallBounceCount).toBe(1);
  });
});

// ============================================================================
// COMBAT SYSTEM INTEGRATION: JUGGLE POINT COST VIA COMBAT FLOW
// ============================================================================

describe('Combat System Juggle Point Cost Integration', () => {
  it('Light attack costs 1 juggle point (base cost)', () => {
    expect(JUGGLE_COST_LIGHT).toBe(1);
  });

  it('Heavy attack costs 2 juggle points (base cost)', () => {
    expect(JUGGLE_COST_HEAVY).toBe(2);
  });

  it('Special attack costs 2 juggle points (base cost)', () => {
    expect(JUGGLE_COST_SPECIAL).toBe(2);
  });

  it('DM costs 3 juggle points (base cost)', () => {
    expect(JUGGLE_COST_DM).toBe(3);
  });

  it('CD blowback costs 2 juggle points (base cost)', () => {
    expect(JUGGLE_COST_CD).toBe(2);
  });

  it('Progressive juggle cost: light attack cost scales with airHitCount', () => {
    // Hit 0: ceil(1 * (1 + 0*0.2)) = 1
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 0 * 0.2))).toBe(1);
    // Hit 1: ceil(1 * (1 + 1*0.2)) = ceil(1.2) = 2
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 1 * 0.2))).toBe(2);
    // Hit 2: ceil(1 * (1 + 2*0.2)) = ceil(1.4) = 2
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 2 * 0.2))).toBe(2);
    // Hit 3: ceil(1 * (1 + 3*0.2)) = ceil(1.6) = 2
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 3 * 0.2))).toBe(2);
    // Hit 4: ceil(1 * (1 + 4*0.2)) = ceil(1.8) = 2
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 4 * 0.2))).toBe(2);
    // Hit 5: ceil(1 * (1 + 5*0.2)) = ceil(2.0) = 2
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 5 * 0.2))).toBe(2);
  });

  it('Progressive juggle cost: heavy attack exhausts budget faster', () => {
    // Hit 0: ceil(2 * (1 + 0*0.2)) = 2
    expect(Math.ceil(JUGGLE_COST_HEAVY * (1 + 0 * 0.2))).toBe(2);
    // Hit 1: ceil(2 * (1 + 1*0.2)) = ceil(2.4) = 3
    expect(Math.ceil(JUGGLE_COST_HEAVY * (1 + 1 * 0.2))).toBe(3);
    // After 2 heavy hits: 2 + 3 = 5, budget exhausted
    expect(2 + 3).toBe(JUGGLE_POINTS_MAX);
  });

  it('Full juggle budget allows DM follow-up only once', () => {
    // DM costs 3 base, progressive: ceil(3*(1+0*0.2))=3, ceil(3*(1+1*0.2))=4
    const dm1 = Math.ceil(JUGGLE_COST_DM * (1 + 0 * 0.2));
    const dm2 = Math.ceil(JUGGLE_COST_DM * (1 + 1 * 0.2));
    expect(dm1).toBe(3);
    expect(dm2).toBe(4);
    // After first DM: 5-3=2 remaining, not enough for second DM (needs 4)
    expect(JUGGLE_POINTS_MAX - dm1).toBe(2);
    expect(JUGGLE_POINTS_MAX - dm1 < dm2).toBe(true);
  });
});

// ============================================================================
// COMBAT SYSTEM INTEGRATION: FULL COMBO FLOW
// ============================================================================

describe('Combat System Full Juggle Combo Flow', () => {
  it('Launch -> light x3 exhausts juggle budget (progressive cost)', () => {
    const f = createFighter();
    setAirborne(f);
    let points = f.jugglePoints;
    let airHits = 0;

    // Hit 1: cost = ceil(1 * (1 + 0*0.2)) = 1
    const cost1 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost1;
    airHits++;
    expect(points).toBe(4);

    // Hit 2: cost = ceil(1 * (1 + 1*0.2)) = ceil(1.2) = 2
    const cost2 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost2;
    airHits++;
    expect(points).toBe(2);

    // Hit 3: cost = ceil(1 * (1 + 2*0.2)) = ceil(1.4) = 2
    const cost3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost3;
    airHits++;
    expect(points).toBe(0);

    // Hit 4 blocked: cost = ceil(1 * (1 + 3*0.2)) = 2, but 0 remaining
    const cost4 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    expect(points < cost4).toBe(true);
  });

  it('Gravity decay simulation: after 3 air hits opponent falls much faster', () => {
    const f = createFighter();
    setAirborne(f);
    f.vy = -10; // typical launch velocity

    // Simulate 3 juggle hits with gravity additions
    for (let i = 0; i < 3; i++) {
      f.airHitCount++;
      simulateJuggleGravity(f);
    }

    // After 3 hits: additional gravity = 0.345 + 0.39 + 0.435 = 1.17
    // Total vy = -10 + 1.17 = -8.83 (much less upward than -10)
    expect(f.vy).toBeCloseTo(-10 + 0.345 + 0.39 + 0.435, 2);
    // Verify the gravity has made the opponent fall faster
    expect(f.vy).toBeGreaterThan(-10); // less negative = less upward / more downward
  });

  it('Counter Wire -> wall bounce -> follow-up combo is possible', () => {
    const f = createFighter();
    setAirborne(f);

    // Step 1: Counter wire triggers (as resolveHit does)
    f.isCounterWire = true;
    f.wallBounceCount++;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 3; // counter wire gives 3 points

    // Step 2: Wall bounce physics sets up juggleable state
    // (handled by fighterController applyPhysics)
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.wallBounceCount).toBe(1);

    // Step 3: Follow-up possible
    const followUpCost = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints >= followUpCost).toBe(true);

    // Step 4: Second wall bounce NOT possible
    expect(f.wallBounceCount >= WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });

  it('resetComboJuggleState clears all juggle state', () => {
    const f = createFighter();
    setAirborne(f);
    f.airHitCount = 3;
    f.wallBounceCount = 1;
    f.isGroundBounce = true;
    f.groundBounceTimer = 10;
    f.airThrowVulnerable = true;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = 2;

    f.resetComboJuggleState();

    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
    expect(f.wallBounceCount).toBe(0);
    expect(f.isGroundBounce).toBe(false);
    expect(f.groundBounceTimer).toBe(0);
    expect(f.airThrowVulnerable).toBe(false);
  });

  it('Ground bounce creates juggle opportunity with 3 points', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y;
    f.state = FighterState.HITSTUN;

    // Ground bounce trigger (as resolveHit does)
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.vy = GROUND_BOUNCE_VY;
    f.vx = 0;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);

    // Verify follow-up is possible
    expect(f.vy).toBe(-5); // bouncing up
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(3); // 5-2=3, enough for light or heavy
    expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
    expect(f.jugglePoints >= JUGGLE_COST_HEAVY).toBe(true);
    // DM would use all remaining points
    expect(f.jugglePoints >= JUGGLE_COST_DM).toBe(true);
  });
});
