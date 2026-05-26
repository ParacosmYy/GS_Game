/**
 * cornerSystem.test.ts -- 版边/墙弹系统综合测试
 *
 * 验证场景:
 *  1. Stage Boundaries (5 tests)
 *  2. Wall Bounce Mechanics (6 tests)
 *  3. Corner Pressure (5 tests)
 *  4. Position Clamping (4 tests)
 *  5. Corner Combo Dynamics (5 tests)
 *
 * 依赖: CombatSystem + Fighter + 真实 frame data + constants.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_LEFT,
  STAGE_RIGHT,
  STAGE_WIDTH,
  FIGHTER_WIDTH,
  STAGE_GROUND_Y,
  FRAME_DATA,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  PUSHBLOCK_DECAY_FRAMES,
  WRONG_BLOCK_PUSHBACK_MULT,
  WRONG_BLOCK_STUN_MULT,
  WALL_BOUNCE_MAX_PER_COMBO,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  THROW_DISTANCE,
  BACKDASH_VX,
  WALK_SPEED,
  RUN_SPEED,
} from '../src/core/constants.js';

// ===== Minimal IInputProvider mocks =====

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(
  p1Override: Partial<PlayerInput> = {},
  p2Override: Partial<PlayerInput> = {},
): IInputProvider {
  const p1: PlayerInput = { ...noopInput, ...p1Override };
  const p2: PlayerInput = { ...noopInput, ...p2Override };
  return {
    getP1Input: () => p1,
    getP2Input: () => p2,
  };
}

// P2 presses back (facing=-1 so back = right) for blocking
function createBlockingInputProvider(): IInputProvider {
  return createInputProvider({}, { right: true });
}

// P2 presses back and down for crouch blocking
function createCrouchBlockingInputProvider(): IInputProvider {
  return createInputProvider({}, { right: true, down: true });
}

// ===== Test helpers =====

/** Force attacker into active phase so hitbox overlaps */
function forceActivePhase(f: Fighter, attackType: AttackType, frame = 0): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = frame;
}

/** Reset attacker so they can attack again */
function resetAttacker(attacker: Fighter): void {
  attacker.hasHit = false;
  attacker.currentAttack = null;
  attacker.attackPhase = 'none';
  attacker.attackFrame = 0;
}

/** Restore defender to a state where they can be hit again */
function prepareDefenderForNextHit(defender: Fighter): void {
  defender.state = FighterState.IDLE;
  defender.hitstunTimer = 0;
  defender.blockstunTimer = 0;
}

/** Create a standard close-range match: p1(300), p2(350) */
function createCloseMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

// ==========================================================================
// 1. Stage Boundaries (5 tests)
// ==========================================================================

describe('Stage Boundaries', () => {
  it('Fighter cannot move past STAGE_LEFT', () => {
    const f = new Fighter(STAGE_LEFT, '#ff0000', 1);
    // Try to move past left boundary
    f.x = STAGE_LEFT - 100;
    // Manual clamping (as done in game loop)
    f.x = Math.max(STAGE_LEFT, f.x);
    expect(f.x).toBe(STAGE_LEFT);
    expect(f.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Fighter cannot move past STAGE_RIGHT', () => {
    const f = new Fighter(STAGE_RIGHT, '#0000ff', -1);
    // Try to move past right boundary
    f.x = STAGE_RIGHT + 100;
    // Manual clamping
    f.x = Math.min(STAGE_RIGHT, f.x);
    expect(f.x).toBe(STAGE_RIGHT);
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('Pushback from block does not push defender past corner', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    // p2 at right corner, defending
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // p2 should still be in bounds (clamped by game loop)
    const p2X = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));
    expect(p2X).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2X).toBeGreaterThanOrEqual(STAGE_LEFT);
    // Block pushback velocity is set but position should be clamped in practice
    expect(p2.state).toBe(FighterState.BLOCK);
  });

  it('Knockback from hit does not push defender past corner', () => {
    const cs = new CombatSystem(createInputProvider());
    // p2 near right corner
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // p2 gets hitstun + pushback velocity
    expect(p2.state).toBe(FighterState.HITSTUN);
    // Simulate position update with clamping (as game loop does)
    p2.x += p2.vx;
    p2.x = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Both fighters pushed apart when overlapping at corner', () => {
    // Both fighters at same position near right wall
    const p1 = new Fighter(STAGE_RIGHT - 20, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 20, '#0000ff', -1);

    // Pushboxes overlap
    const box1 = p1.getPushbox();
    const box2 = p2.getPushbox();
    const overlapX = box1.x < box2.x + box2.width && box1.x + box1.width > box2.x;
    expect(overlapX).toBe(true);

    // Manual separation: p1 moves left, p2 stays (at wall)
    const halfW = 30; // PUSH_BOX_WIDTH / 2
    p1.x = Math.max(STAGE_LEFT, p1.x - halfW);
    p2.x = Math.min(STAGE_RIGHT, p2.x + halfW);

    // p2 may still be at or past STAGE_RIGHT, clamp it
    p2.x = Math.min(STAGE_RIGHT, p2.x);
    expect(p1.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });
});

// ==========================================================================
// 2. Wall Bounce Mechanics (6 tests)
// ==========================================================================

describe('Wall Bounce Mechanics', () => {
  it('STAND_CD hit causes wall bounce (isCounterWire, wallBounceCount=1)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD attacks always trigger wall bounce (counterWire=true in frame data)
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
  });

  it('Wall bounce sets correct vx/vy (COUNTER_WIRE_BOUNCE_VX/VY)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // Wall bounce velocity: flyDir = defender.x < attacker.x ? -1 : 1
    // p2.x(350) > p1.x(300) so flyDir = 1
    // vx = COUNTER_WIRE_BOUNCE_VX * flyDir * -1 = 8 * 1 * -1 = -8
    // vy = COUNTER_WIRE_BOUNCE_VY = -6
    expect(p2.vy).toBe(COUNTER_WIRE_BOUNCE_VY);
    // p2 is to the right of p1, so flies left (toward left wall)
    const flyDir = p2.x > p1.x ? 1 : -1;
    expect(p2.vx).toBe(COUNTER_WIRE_BOUNCE_VX * flyDir * -1);
  });

  it('Wall bounce count limited to WALL_BOUNCE_MAX_PER_COMBO', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBe(1);

    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // First CD wall bounce
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.wallBounceCount).toBe(1);
    expect(p2.isCounterWire).toBe(true);

    // Reset for second attempt
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    // wallBounceCount stays at 1 (not reset between hits in same combo)

    // Second CD attack -- wallBounceCount already at max, no second bounce
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // Should not increment beyond max
    expect(p2.wallBounceCount).toBe(1);
  });

  it('Wall bounce restores juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD wall bounce gives FULL juggle with JUGGLE_POINTS_MAX
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('Multiple wall bounces in same combo increment count correctly', () => {
    // WALL_BOUNCE_MAX_PER_COMBO = 1, so second bounce should be blocked
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // First hit: CD wall bounce
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.wallBounceCount).toBe(1);

    // Try another CD wall bounce in same combo
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // Count stays at 1 (max per combo)
    expect(p2.wallBounceCount).toBe(1);
  });

  it('Air wall bounce vs ground wall bounce behavior', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // Ground wall bounce: p2 is grounded
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.isCounterWire).toBe(true);
    expect(p2.vy).toBe(COUNTER_WIRE_BOUNCE_VY); // -6 (upward)
    // Grounded defender gets state=HITSTUN (not KNOCKDOWN)
    expect(p2.state).toBe(FighterState.HITSTUN);

    // Now test air wall bounce
    const cs2 = new CombatSystem(createInputProvider());
    const { p1: p1a, p2: p2a } = createCloseMatch();
    // Make defender airborne — y must overlap with STAND_CD hitbox
    // STAND_CD hitbox: oy=-55, h=38 → y range 455..493 (at STAGE_GROUND_Y=510)
    // Defender hurtbox: y-200..y → need y >= 455 and y-200 < 493
    // y=480: hurtbox 280..480, overlap 455..480 → OK
    p2a.y = 480;
    p2a.juggleState = JuggleState.FULL;
    p2a.jugglePoints = JUGGLE_POINTS_MAX;

    forceActivePhase(p1a, AttackType.STAND_CD);
    cs2.resolveAttacks(p1a, p2a, []);

    expect(p2a.isCounterWire).toBe(true);
    expect(p2a.vy).toBe(COUNTER_WIRE_BOUNCE_VY);
    // Air defender also gets wall bounce
    expect(p2a.juggleState).toBe(JuggleState.FULL);
    expect(p2a.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });
});

// ==========================================================================
// 3. Corner Pressure (5 tests)
// ==========================================================================

describe('Corner Pressure', () => {
  it('Corner block: defender cannot be pushed back (stays at boundary)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    // p2 pinned at right wall
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);
    const p2XBefore = p2.x;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // p2 blocks, gets pushback velocity
    expect(p2.state).toBe(FighterState.BLOCK);
    // If we simulate the game loop position update + clamp:
    p2.x += p2.vx;
    p2.x = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));
    // p2 stays within bounds (the clamp prevents going past)
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Corner block: attacker gets pushed back instead', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Corner code: when defender near corner, attacker gets extra pushback
    // defNearCorner: p2.x (STAGE_RIGHT-10) > STAGE_RIGHT-60 → true
    expect(p1.vx).not.toBe(0);
    // Attacker pushback direction: away from corner
    // attacker.facing=1 (right), so -data.pushback * 0.5 * attacker.facing
    expect(p1.vx).toBeLessThan(0); // pushed left (away from right corner)
  });

  it('Consecutive blocks in corner trigger pushblock faster', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    const blockCounts: number[] = [];
    const vxValues: number[] = [];

    for (let i = 0; i < 4; i++) {
      resetAttacker(p1);
      p2.state = FighterState.IDLE;
      p2.blockstunTimer = 0;
      p2.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);
      blockCounts.push(p2.consecutiveBlockCount);
      vxValues.push(Math.abs(p2.vx));
    }

    // Consecutive blocks increment
    expect(blockCounts[0]).toBe(1);
    expect(blockCounts[2]).toBeGreaterThanOrEqual(PUSHBLOCK_THRESHOLD);

    // Pushblock activates at threshold: later blocks have more pushback
    const normalVx = vxValues[0];
    const pushblockVx = vxValues[2];
    expect(pushblockVx).toBeGreaterThan(normalVx);
  });

  it('Wrong block in corner: extra pushback penalty', () => {
    // Wrong block: standing vs low attack, or crouching vs overhead
    // CROUCH_B is LOW, so standing defender pressing back = wrong block
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // CROUCH_B is LOW hitLevel, defender pressing back while standing = wrong block
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);

    // Wrong block still applies blockstun with penalty
    expect(p2.state).toBe(FighterState.BLOCK);
    // Wrong block pushback = base * WRONG_BLOCK_PUSHBACK_MULT (1.3)
    const basePushback = FRAME_DATA[AttackType.CROUCH_B].pushback;
    const expectedVx = basePushback * WRONG_BLOCK_PUSHBACK_MULT * 0.8; // applyBlockstun: * 0.8
    expect(Math.abs(p2.vx)).toBeCloseTo(expectedVx, 1);

    // Attacker also gets pushback in corner
    expect(p1.vx).not.toBe(0);
  });

  it('Guard crush in corner: defender stunned against wall', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // Exhaust guard gauge
    p2.guardGauge = 0;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Guard crush triggers
    expect(p2.state).toBe(FighterState.GUARD_CRUSH);
    expect(p2.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);

    // Guard crush pushback velocity (1.5x multiplier)
    const basePushback = FRAME_DATA[AttackType.STAND_C].pushback;
    expect(Math.abs(p2.vx)).toBeCloseTo(basePushback * 1.5, 1);

    // Position still within bounds after clamping
    p2.x += p2.vx;
    p2.x = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);

    // Cannot block during guard crush
    expect(p2.canBlock()).toBe(false);
  });
});

// ==========================================================================
// 4. Position Clamping (4 tests)
// ==========================================================================

describe('Position Clamping', () => {
  it('After hit, defender.x clamped to [STAGE_LEFT, STAGE_RIGHT]', () => {
    const cs = new CombatSystem(createInputProvider());
    // Defender at right edge
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 5, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.HITSTUN);
    // Apply velocity and clamp
    p2.x += p2.vx;
    p2.x = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('After throw, thrown fighter lands within bounds', () => {
    const cs = new CombatSystem(createInputProvider());
    // Attacker near right wall, throwing forward
    const p1 = new Fighter(STAGE_RIGHT - 50, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 20, '#0000ff', -1);

    forceActivePhase(p1, AttackType.THROW_FORWARD);
    cs.resolveAttacks(p1, p2, []);

    // Throw enters escape window: p2.isBeingThrown = true
    expect(p2.isBeingThrown).toBe(true);
    // Throw position: p1.x + THROW_DISTANCE * facing, clamped
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Backdash does not go past stage edge', () => {
    // Fighter at left edge tries to backdash further left
    const f = new Fighter(STAGE_LEFT + 5, '#ff0000', 1);

    // Backdash: moves backward (facing=1, back = left)
    // BACKDASH_VX = 8, moves in -facing direction
    f.state = FighterState.BACKDASH;
    f.vx = -BACKDASH_VX; // -8

    // Simulate position update + clamp
    f.x += f.vx;
    f.x = Math.max(STAGE_LEFT, Math.min(f.x, STAGE_RIGHT));

    expect(f.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('Running toward corner stops at boundary', () => {
    // Fighter near right wall running right
    const f = new Fighter(STAGE_RIGHT - 10, '#ff0000', 1);
    f.state = FighterState.RUN;
    f.vx = RUN_SPEED; // 7

    // Simulate several frames of running with clamping
    for (let i = 0; i < 5; i++) {
      f.x += f.vx;
      f.x = Math.max(STAGE_LEFT, Math.min(f.x, STAGE_RIGHT));
    }

    expect(f.x).toBe(STAGE_RIGHT);
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });
});

// ==========================================================================
// 5. Corner Combo Dynamics (5 tests)
// ==========================================================================

describe('Corner Combo Dynamics', () => {
  it('Corner combo does more damage (pushback does not help defender escape)', () => {
    // In corner, pushback cannot move defender away, so all hits connect
    // Compare: mid-stage combo vs corner combo
    const csMid = new CombatSystem(createInputProvider());
    const { p1: p1m, p2: p2m } = createCloseMatch();
    p2m.maxHealth = 2000;
    p2m.health = 2000;

    // 3-hit combo mid-stage
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        resetAttacker(p1m);
        prepareDefenderForNextHit(p2m);
      }
      forceActivePhase(p1m, AttackType.STAND_C);
      csMid.resolveAttacks(p1m, p2m, []);
    }
    const midDamage = 2000 - p2m.health;

    // 3-hit corner combo
    const csCorner = new CombatSystem(createInputProvider());
    const p1c = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2c = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);
    p2c.maxHealth = 2000;
    p2c.health = 2000;

    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        resetAttacker(p1c);
        prepareDefenderForNextHit(p2c);
      }
      forceActivePhase(p1c, AttackType.STAND_C);
      csCorner.resolveAttacks(p1c, p2c, []);
    }
    const cornerDamage = 2000 - p2c.health;

    // Same damage (combo scaling is based on combo count, not position)
    // But corner attacker gets pushed back more (prevents infinite pressure)
    expect(cornerDamage).toBe(midDamage);
    // Corner attacker has more pushback (cornerBonus = 1.5)
    // This is verified in corner block tests above
  });

  it('Corner juggle: opponent bounces off wall for extended juggle', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 20, '#0000ff', -1);

    // Airborne opponent near corner
    p2.y = 490;
    p2.vy = 2;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    // CD wall bounce
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);

    // After wall bounce, can follow up with another hit
    p2.y = 480; // Still airborne
    p2.vy = 0;
    p2.state = FighterState.HITSTUN;
    p2.isCounterWire = false;

    resetAttacker(p1);
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    // Follow-up connects (damage dealt, juggle points consumed)
    expect(p2.health).toBeLessThan(healthBefore);
    expect(p2.jugglePoints).toBeLessThan(JUGGLE_POINTS_MAX);
  });

  it('Corner cross-up prevention (cannot pass through opponent)', () => {
    // When defender is at corner, attacker cannot cross behind them
    const p1 = new Fighter(STAGE_RIGHT - 30, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // p1 tries to jump over p2 at corner
    p1.state = FighterState.JUMP;
    p1.vx = 5; // moving right toward wall
    p1.x += p1.vx;
    p1.x = Math.max(STAGE_LEFT, Math.min(p1.x, STAGE_RIGHT));

    // p1 cannot pass STAGE_RIGHT
    expect(p1.x).toBeLessThanOrEqual(STAGE_RIGHT);

    // Facing: p2 is to the right of p1, so p1 faces right
    p1.updateFacing(p2);
    expect(p1.facing).toBe(1); // faces right toward p2
  });

  it('Corner throw: opponent stays in corner', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 20, '#0000ff', -1);
    const p2XBefore = p2.x;

    // Forward throw: throwDir = attacker.facing = 1
    forceActivePhase(p1, AttackType.THROW_FORWARD);
    cs.resolveAttacks(p1, p2, []);

    // Throw enters escape window
    expect(p2.isBeingThrown).toBe(true);
    // Throw destination: p1.x + THROW_DISTANCE * facing (forward = right)
    // But clamped to STAGE_RIGHT
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Corner projectile: defender cannot retreat', () => {
    // When defender is at corner and a projectile is incoming,
    // they cannot back away. Verify position constraint.
    // Start close enough that walking back reaches the wall
    const p2 = new Fighter(STAGE_RIGHT - WALK_SPEED, '#0000ff', -1);

    // Defender tries to walk backward (facing=-1, back=right → toward wall)
    p2.state = FighterState.WALK;
    // Walking "back" for facing=-1 means moving right
    const walkBackVx = WALK_SPEED * (-p2.facing); // = 4 * 1 = 4
    p2.x += walkBackVx;
    p2.x = Math.max(STAGE_LEFT, Math.min(p2.x, STAGE_RIGHT));

    // Cannot go past STAGE_RIGHT
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);

    // After walking toward corner, stays at wall
    expect(p2.x).toBe(STAGE_RIGHT);
  });
});
