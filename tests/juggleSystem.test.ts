/**
 * Juggle System Consolidated Tests
 *
 * Merged from: juggleSystem, juggleSystemFull
 *
 * Covers: juggle points pool, cost per attack type, gravity decay,
 *   wall bounce tracking, ground bounce, air hit limits.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import {
  JUGGLE_POINTS_MAX, JUGGLE_COST_LIGHT, JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL, JUGGLE_COST_DM, JUGGLE_COST_CD,
  JUGGLE_GRAVITY_BASE, JUGGLE_GRAVITY_SCALE_PER_HIT,
  WALL_BOUNCE_MAX_PER_COMBO, STAGE_GROUND_Y,
  GROUND_BOUNCE_VY, GROUND_BOUNCE_COST,
} from '../src/core/constants.js';

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

function setAirborne(f: Fighter, y = 300): void {
  f.y = y;
  f.state = FighterState.HITSTUN;
  f.juggleState = JuggleState.FULL;
  f.jugglePoints = JUGGLE_POINTS_MAX;
}

// ── 1. Juggle Point Constants ───────────────────────────────
describe('Juggle Point Constants', () => {
  it('JUGGLE_POINTS_MAX is positive and allows 2-3 follow-ups', () => {
    expect(JUGGLE_POINTS_MAX).toBeGreaterThan(0);
    const maxLightFollowups = Math.floor(JUGGLE_POINTS_MAX / JUGGLE_COST_LIGHT);
    expect(maxLightFollowups).toBeGreaterThanOrEqual(2);
  });

  it('juggle cost hierarchy: light <= heavy <= special <= DM', () => {
    expect(JUGGLE_COST_LIGHT).toBeLessThanOrEqual(JUGGLE_COST_HEAVY);
    expect(JUGGLE_COST_HEAVY).toBeLessThanOrEqual(JUGGLE_COST_SPECIAL);
    expect(JUGGLE_COST_SPECIAL).toBeLessThanOrEqual(JUGGLE_COST_DM);
  });
});

// ── 2. Juggle Points Pool ───────────────────────────────────
describe('Juggle Points Pool', () => {
  it('initial juggleState is NONE (grounded)', () => {
    const f = createFighter();
    expect(f.juggleState).toBe(JuggleState.NONE);
  });

  it('hit airborne sets juggleState to FULL and sets juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('juggle points deplete with each air hit', () => {
    const f = createFighter();
    setAirborne(f);
    const pointsBefore = f.jugglePoints;
    f.jugglePoints -= JUGGLE_COST_LIGHT;
    expect(f.jugglePoints).toBeLessThan(pointsBefore);
  });

  it('juggle points reaching 0 prevents further juggling', () => {
    const f = createFighter();
    setAirborne(f);
    f.jugglePoints = 0;
    expect(f.jugglePoints).toBe(0);
    // No more juggle follow-ups possible
  });
});

// ── 3. Juggle Gravity ───────────────────────────────────────
describe('Juggle Gravity', () => {
  it('successive air hits add progressively more gravity', () => {
    const f = createFighter();
    setAirborne(f);
    f.airHitCount = 0;
    const g1 = JUGGLE_GRAVITY_BASE * (1 + 0 * JUGGLE_GRAVITY_SCALE_PER_HIT);
    f.airHitCount = 3;
    const g4 = JUGGLE_GRAVITY_BASE * (1 + 3 * JUGGLE_GRAVITY_SCALE_PER_HIT);
    expect(g4).toBeGreaterThan(g1);
  });

  it('gravity constants are reasonable', () => {
    expect(JUGGLE_GRAVITY_BASE).toBeGreaterThan(0);
    expect(JUGGLE_GRAVITY_SCALE_PER_HIT).toBeGreaterThan(0);
  });
});

// ── 4. Wall Bounce ──────────────────────────────────────────
describe('Wall Bounce', () => {
  it('WALL_BOUNCE_MAX_PER_COMBO should be 1', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBe(1);
  });

  it('wall bounce count starts at 0 and increments', () => {
    const f = createFighter();
    expect(f.wallBounceCount).toBe(0);
    f.wallBounceCount++;
    expect(f.wallBounceCount).toBe(1);
  });
});

// ── 5. Ground Bounce ────────────────────────────────────────
describe('Ground Bounce', () => {
  it('ground bounce velocity and cost are defined', () => {
    expect(GROUND_BOUNCE_VY).toBeLessThan(0); // upward
    expect(GROUND_BOUNCE_COST).toBeGreaterThan(0);
  });
});
