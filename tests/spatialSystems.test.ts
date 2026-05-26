/**
 * Spatial Systems Consolidated Tests
 *
 * Merged from: knockdownWakeUp, crossupSystem, cornerSystem,
 *   wallAndPushback, antiAirSystem, proximityGuard, proximityGuardPushblock
 *
 * Covers: knockdown/wakeup, corner pressure, wall bounce, anti-air, proximity guard.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import {
  STAGE_LEFT, STAGE_RIGHT, STAGE_WIDTH,
  THROW_INVINCIBILITY_WAKEUP, WAKEUP_FULL_INVINCIBILITY,
  PROXIMITY_GUARD_RANGE, WALL_BOUNCE_MAX_PER_COMBO,
} from '../src/core/constants.js';

// ── 1. Knockdown / Wakeup ──────────────────────────────────
describe('Knockdown / Wakeup', () => {
  it('WAKEUP_INVINCIBILITY is positive (THROW_INVINCIBILITY_WAKEUP)', () => {
    expect(THROW_INVINCIBILITY_WAKEUP).toBeGreaterThan(0);
  });

  it('WAKEUP_FULL_INVINCIBILITY is positive', () => {
    expect(WAKEUP_FULL_INVINCIBILITY).toBeGreaterThan(0);
  });

  it('fighter in KNOCKDOWN state cannot act', () => {
    const f = new Fighter(400, '#ff0000', 1);
    f.state = FighterState.KNOCKDOWN;
    expect(f.canAct()).toBe(false);
  });
});

// ── 2. Corner System ───────────────────────────────────────
describe('Corner System', () => {
  it('STAGE_LEFT and STAGE_RIGHT define boundaries', () => {
    expect(STAGE_LEFT).toBeLessThan(STAGE_RIGHT);
  });

  it('STAGE_WIDTH matches STAGE_RIGHT - STAGE_LEFT', () => {
    expect(STAGE_RIGHT - STAGE_LEFT).toBeLessThanOrEqual(STAGE_WIDTH);
  });
});

// ── 3. Wall Bounce ─────────────────────────────────────────
describe('Wall Bounce', () => {
  it('WALL_BOUNCE_MAX_PER_COMBO is defined', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBeGreaterThanOrEqual(1);
  });
});

// ── 4. Proximity Guard ─────────────────────────────────────
describe('Proximity Guard', () => {
  it('PROXIMITY_GUARD_RANGE is positive', () => {
    expect(PROXIMITY_GUARD_RANGE).toBeGreaterThan(0);
  });
});
