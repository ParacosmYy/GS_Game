import { describe, it, expect } from 'vitest';
import {
  JUGGLE_POINTS_MAX, JUGGLE_COST_LIGHT, JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL, JUGGLE_COST_DM, JUGGLE_COST_CD,
  DAMAGE_SCALE_STEP, DAMAGE_SCALE_MIN_NORMAL, DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM, COMBO_TIMEOUT,
  GUARD_GAUGE_MAX, GUARD_CRUSH_DURATION,
  STUN_GAUGE_MAX, STUN_DECAY_DELAY, STUN_DECAY_RATE,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  DESPERATION_HEALTH_THRESHOLD
} from '../src/core/constants.js';

describe('core constants batch 2 — combat system', () => {
  it('juggle costs are positive and consistent', () => {
    expect(JUGGLE_POINTS_MAX).toBeGreaterThan(0);
    expect(JUGGLE_COST_LIGHT).toBeLessThanOrEqual(JUGGLE_COST_HEAVY);
    expect(JUGGLE_COST_SPECIAL).toBeGreaterThan(0);
    expect(JUGGLE_COST_DM).toBeGreaterThanOrEqual(JUGGLE_COST_SPECIAL);
    expect(JUGGLE_COST_CD).toBeGreaterThan(0);
  });
  it('damage scale has valid minimums', () => {
    expect(DAMAGE_SCALE_MIN_NORMAL).toBeGreaterThan(0);
    expect(DAMAGE_SCALE_MIN_NORMAL).toBeLessThan(DAMAGE_SCALE_MIN_SPECIAL);
    expect(DAMAGE_SCALE_MIN_SPECIAL).toBeLessThan(DAMAGE_SCALE_MIN_DM);
    expect(DAMAGE_SCALE_STEP).toBeGreaterThan(0);
  });
  it('combo timeout is positive', () => {
    expect(COMBO_TIMEOUT).toBeGreaterThan(0);
  });
  it('guard system constants are valid', () => {
    expect(GUARD_GAUGE_MAX).toBeGreaterThan(0);
    expect(GUARD_CRUSH_DURATION).toBeGreaterThan(0);
  });
  it('stun system constants are valid', () => {
    expect(STUN_GAUGE_MAX).toBeGreaterThan(0);
    expect(STUN_DECAY_DELAY).toBeGreaterThan(0);
    expect(STUN_DECAY_RATE).toBeGreaterThan(0);
  });
  it('MAX mode constants are valid', () => {
    expect(MAX_MODE_DURATION).toBeGreaterThan(0);
    expect(MAX_MODE_STOCK_COST).toBeGreaterThan(0);
  });
  it('desperation threshold is between 0 and 1', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeGreaterThan(0);
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThan(1);
  });
});
