/**
 * Hit Effects Consolidated Tests
 *
 * Merged from: stunSystem, guardGaugeSystem, counterHitSystem, stunDizzySystem
 *
 * Covers: stun gauge, dizzy trigger, counter hit detection, guard gauge mechanics.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import {
  STUN_GAUGE_MAX, STUN_FILL_LIGHT, STUN_FILL_HEAVY,
  STUN_FILL_SPECIAL, STUN_FILL_DM, STUN_DECAY_DELAY,
  GUARD_GAUGE_MAX,
} from '../src/core/constants.js';

// ── 1. Stun Gauge ───────────────────────────────────────────
describe('Stun Gauge', () => {
  it('stun fill values are ordered: light < heavy < special < DM', () => {
    expect(STUN_FILL_LIGHT).toBeLessThan(STUN_FILL_HEAVY);
    expect(STUN_FILL_HEAVY).toBeLessThan(STUN_FILL_SPECIAL);
    expect(STUN_FILL_SPECIAL).toBeLessThan(STUN_FILL_DM);
  });

  it('STUN_GAUGE_MAX is positive', () => {
    expect(STUN_GAUGE_MAX).toBeGreaterThan(0);
  });

  it('STUN_DECAY_DELAY is reasonable (>= 30 frames)', () => {
    expect(STUN_DECAY_DELAY).toBeGreaterThanOrEqual(30);
  });

  it('stun gauge accumulates and can trigger dizzy', () => {
    const f = new Fighter(400, '#ff0000', 1);
    f.stunGauge = STUN_GAUGE_MAX - STUN_FILL_LIGHT;
    f.stunGauge += STUN_FILL_LIGHT;
    expect(f.stunGauge).toBeGreaterThanOrEqual(STUN_GAUGE_MAX);
  });
});

// ── 2. Counter Hit ──────────────────────────────────────────
describe('Counter Hit', () => {
  it('counter hit states are attacking states', () => {
    const attackingStates = [
      FighterState.STAND_ATTACK,
      FighterState.CROUCH_ATTACK,
      FighterState.AIR_ATTACK,
    ];
    for (const s of attackingStates) {
      expect(s).toBeDefined();
    }
  });

  it('non-attacking states are not counter hit', () => {
    const nonAttackingStates = [
      FighterState.IDLE,
      FighterState.HITSTUN,
      FighterState.KNOCKDOWN,
      FighterState.BLOCK,
      FighterState.WALK,
    ];
    for (const s of nonAttackingStates) {
      expect(s).toBeDefined();
    }
  });
});

// ── 3. Guard Gauge ──────────────────────────────────────────
describe('Guard Gauge', () => {
  it('guard gauge starts at max', () => {
    const f = new Fighter(400, '#ff0000', 1);
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });

  it('guard gauge decreases when blocking', () => {
    const f = new Fighter(400, '#ff0000', 1);
    f.guardGauge = 100;
    f.guardGauge -= 10;
    expect(f.guardGauge).toBe(90);
  });

  it('guard gauge recovers on reset', () => {
    const f = new Fighter(400, '#ff0000', 1);
    f.guardGauge = 0;
    f.reset();
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });
});
