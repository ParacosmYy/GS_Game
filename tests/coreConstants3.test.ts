import { describe, it, expect } from 'vitest';
import {
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION, BACKDASH_INVINCIBLE_FRAMES,
  ROLL_SPEED, ROLL_DURATION, ROLL_INVINCIBLE_END, ROLL_RECOVERY,
  DOUBLE_TAP_WINDOW, COMMAND_WINDOW, HCF_WINDOW, DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED, TICK_RATE,
  WAKEUP_REVERSAL_WINDOW, WAKEUP_BUFFER_WINDOW,
  HARD_KNOCKDOWN_GROUND_TICKS, SOFT_KNOCKDOWN_GROUND_TICKS,
  OTG_DAMAGE_MULTIPLIER, OTG_MAX_HITS
} from '../src/core/constants.js';

describe('core constants batch 3 — movement and input', () => {
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
