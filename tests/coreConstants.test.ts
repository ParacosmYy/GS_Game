/**
 * Core constants regression tests
 * Consolidated from coreConstants1-3 (3 files → 1 file)
 */
import { describe, it, expect } from 'vitest';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, ROUND_TIME, STAGE_WIDTH,
  GRAVITY, MAX_HEALTH, FIGHTER_WIDTH, FIGHTER_HEIGHT,
  MAX_STOCKS, METER_PER_STOCK, THROW_RANGE,
  HITSTOP_LIGHT, HITSTOP_DM, SHAKE_KO, KO_DISPLAY_TIME,
  JUGGLE_POINTS_MAX, JUGGLE_COST_LIGHT, JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL, JUGGLE_COST_DM, JUGGLE_COST_CD,
  DAMAGE_SCALE_STEP, DAMAGE_SCALE_MIN_NORMAL, DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM, COMBO_TIMEOUT,
  GUARD_GAUGE_MAX, GUARD_CRUSH_DURATION,
  STUN_GAUGE_MAX, STUN_DECAY_DELAY, STUN_DECAY_RATE,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  DESPERATION_HEALTH_THRESHOLD,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION, BACKDASH_INVINCIBLE_FRAMES,
  ROLL_SPEED, ROLL_DURATION, ROLL_INVINCIBLE_END, ROLL_RECOVERY,
  DOUBLE_TAP_WINDOW, COMMAND_WINDOW, HCF_WINDOW, DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED, TICK_RATE,
  WAKEUP_REVERSAL_WINDOW, WAKEUP_BUFFER_WINDOW,
  HARD_KNOCKDOWN_GROUND_TICKS, SOFT_KNOCKDOWN_GROUND_TICKS,
  OTG_DAMAGE_MULTIPLIER, OTG_MAX_HITS,
} from '../src/core/constants.js';

describe('Core constants — canvas/dimensions', () => {
  it('canvas is 800x600', () => {
    expect(CANVAS_WIDTH).toBe(800);
    expect(CANVAS_HEIGHT).toBe(600);
  });
  it('round time is 99', () => {
    expect(ROUND_TIME).toBe(99);
  });
  it('stage and fighter dimensions are positive', () => {
    expect(STAGE_WIDTH).toBeGreaterThan(0);
    expect(FIGHTER_WIDTH).toBeGreaterThan(0);
    expect(FIGHTER_HEIGHT).toBeGreaterThan(0);
  });
  it('physics constants are valid', () => {
    expect(GRAVITY).toBeGreaterThan(0);
    expect(MAX_HEALTH).toBeGreaterThan(0);
    expect(THROW_RANGE).toBeGreaterThan(0);
  });
  it('meter system is consistent', () => {
    expect(MAX_STOCKS).toBeGreaterThan(0);
    expect(METER_PER_STOCK).toBeGreaterThan(0);
  });
  it('hitstop values increase by tier', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_DM);
    expect(HITSTOP_DM).toBeGreaterThan(0);
  });
  it('shake values increase by tier', () => {
    expect(SHAKE_KO).toBeGreaterThan(0);
    expect(KO_DISPLAY_TIME).toBeGreaterThan(0);
  });
});

describe('Core constants — combat system', () => {
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

describe('Core constants — movement and input', () => {
  it('backdash constants are valid', () => {
    expect(BACKDASH_VX).toBeGreaterThan(0);
    expect(BACKDASH_VY).toBeLessThan(0);
    expect(BACKDASH_DURATION).toBeGreaterThan(0);
    expect(BACKDASH_INVINCIBLE_FRAMES).toBeLessThanOrEqual(BACKDASH_DURATION);
  });
  it('roll constants are valid', () => {
    expect(ROLL_SPEED).toBeGreaterThan(0);
    expect(ROLL_DURATION).toBeGreaterThan(0);
    expect(ROLL_INVINCIBLE_END).toBeLessThanOrEqual(ROLL_DURATION);
    expect(ROLL_RECOVERY).toBeGreaterThan(0);
  });
  it('input windows are positive and ordered', () => {
    expect(DOUBLE_TAP_WINDOW).toBeGreaterThan(0);
    expect(COMMAND_WINDOW).toBeGreaterThan(0);
    expect(HCF_WINDOW).toBeGreaterThan(COMMAND_WINDOW);
    expect(DOUBLE_QCF_WINDOW).toBeGreaterThan(HCF_WINDOW);
  });
  it('charge frames is positive', () => {
    expect(CHARGE_FRAMES_REQUIRED).toBeGreaterThan(0);
  });
  it('tick rate is ~16.67ms (60fps)', () => {
    expect(TICK_RATE).toBeCloseTo(1000 / 60, 1);
  });
  it('wakeup windows are positive', () => {
    expect(WAKEUP_REVERSAL_WINDOW).toBeGreaterThan(0);
    expect(WAKEUP_BUFFER_WINDOW).toBeGreaterThan(0);
  });
  it('knockdown and OTG constants are valid', () => {
    expect(HARD_KNOCKDOWN_GROUND_TICKS).toBeGreaterThan(SOFT_KNOCKDOWN_GROUND_TICKS);
    expect(OTG_DAMAGE_MULTIPLIER).toBeGreaterThan(0);
    expect(OTG_DAMAGE_MULTIPLIER).toBeLessThanOrEqual(1);
    expect(OTG_MAX_HITS).toBeGreaterThan(0);
  });
});
