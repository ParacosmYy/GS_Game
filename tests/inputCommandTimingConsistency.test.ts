/**
 * Input & Command Timing Constants Consistency Tests
 *
 * Validates timing constants for:
 * - Cancel windows: normal < rapid < free < super
 * - Input buffer windows are positive and reasonable
 * - Double tap window vs command window ratio
 * - Charge frames vs cancel windows don't conflict
 * - Knockdown/getup timing chain: hard KD > soft KD > getup
 * - Throw invincibility windows are ordered logically
 */
import { describe, it, expect } from 'vitest';
import {
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  COMMAND_WINDOW,
  RECOVERY_INPUT_BUFFER,
  HCF_WINDOW,
  DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED,
  DOUBLE_TAP_WINDOW,
  HARD_KNOCKDOWN_GROUND_TICKS,
  SOFT_KNOCKDOWN_GROUND_TICKS,
  GETUP_ANIMATION_TICKS,
  QUICK_RISE_INPUT_START,
  QUICK_RISE_INPUT_END,
  WAKEUP_REVERSAL_WINDOW,
  WAKEUP_BUFFER_WINDOW,
  WAKEUP_FULL_INVINCIBILITY,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  THROW_INVINCIBILITY_JUMP_STARTUP,
  THROW_INVINCIBILITY_LANDING,
  THROW_INVINCIBILITY_POST_ESCAPE,
  ROLL_DURATION,
  ROLL_INVINCIBLE_END,
  ROLL_RECOVERY,
  BACKDASH_DURATION,
  BACKDASH_INVINCIBLE_FRAMES,
  TICK_RATE,
  COMBO_TIMEOUT,
  MAX_STOCKS,
  METER_PER_STOCK,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  MAX_HEALTH,
  ROUND_TIME,
  KO_DISPLAY_TIME,
} from '../src/core/constants.js';

describe('Cancel window ordering', () => {
  it('rapid < normal < free < super', () => {
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeLessThan(CANCEL_WINDOW_FREE);
    expect(CANCEL_WINDOW_FREE).toBeLessThan(CANCEL_WINDOW_SUPER);
  });

  it('all cancel windows are positive', () => {
    expect(CANCEL_WINDOW_RAPID).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_NORMAL).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_FREE).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThan(0);
  });
});

describe('Input timing windows', () => {
  it('command window is positive', () => {
    expect(COMMAND_WINDOW).toBeGreaterThan(0);
  });

  it('recovery input buffer is positive', () => {
    expect(RECOVERY_INPUT_BUFFER).toBeGreaterThan(0);
  });

  it('HCF window > command window (half circle is harder)', () => {
    expect(HCF_WINDOW).toBeGreaterThan(COMMAND_WINDOW);
  });

  it('double QCF window > HCF window (double motion is hardest)', () => {
    expect(DOUBLE_QCF_WINDOW).toBeGreaterThan(HCF_WINDOW);
  });

  it('charge frames >= command window', () => {
    expect(CHARGE_FRAMES_REQUIRED).toBeGreaterThanOrEqual(COMMAND_WINDOW);
  });

  it('double tap window is shorter than command window', () => {
    expect(DOUBLE_TAP_WINDOW).toBeLessThan(COMMAND_WINDOW);
  });
});

describe('Knockdown/getup timing chain', () => {
  it('hard KD > soft KD', () => {
    expect(HARD_KNOCKDOWN_GROUND_TICKS).toBeGreaterThan(SOFT_KNOCKDOWN_GROUND_TICKS);
  });

  it('soft KD > getup animation', () => {
    expect(SOFT_KNOCKDOWN_GROUND_TICKS).toBeGreaterThan(GETUP_ANIMATION_TICKS);
  });

  it('quick rise input window is within soft KD', () => {
    expect(QUICK_RISE_INPUT_START).toBeLessThan(QUICK_RISE_INPUT_END);
    expect(QUICK_RISE_INPUT_END).toBeLessThanOrEqual(SOFT_KNOCKDOWN_GROUND_TICKS);
  });

  it('wakeup reversal window <= quick rise end', () => {
    expect(WAKEUP_REVERSAL_WINDOW).toBeLessThanOrEqual(QUICK_RISE_INPUT_END);
  });
});

describe('Throw invincibility windows', () => {
  it('all throw invincibility values are positive', () => {
    expect(THROW_INVINCIBILITY_POST_STUN).toBeGreaterThan(0);
    expect(THROW_INVINCIBILITY_WAKEUP).toBeGreaterThan(0);
    expect(THROW_INVINCIBILITY_JUMP_STARTUP).toBeGreaterThan(0);
    expect(THROW_INVINCIBILITY_LANDING).toBeGreaterThan(0);
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBeGreaterThan(0);
  });

  it('wakeup throw invincibility is longest', () => {
    expect(THROW_INVINCIBILITY_WAKEUP).toBeGreaterThanOrEqual(THROW_INVINCIBILITY_POST_STUN);
    expect(THROW_INVINCIBILITY_WAKEUP).toBeGreaterThanOrEqual(THROW_INVINCIBILITY_JUMP_STARTUP);
    expect(THROW_INVINCIBILITY_WAKEUP).toBeGreaterThanOrEqual(THROW_INVINCIBILITY_LANDING);
  });

  it('post-escape invincibility > landing invincibility', () => {
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBeGreaterThanOrEqual(THROW_INVINCIBILITY_LANDING);
  });
});

describe('Roll and backdash timing', () => {
  it('roll invincible end <= roll duration', () => {
    expect(ROLL_INVINCIBLE_END).toBeLessThanOrEqual(ROLL_DURATION);
  });

  it('roll recovery is short', () => {
    expect(ROLL_RECOVERY).toBeLessThan(ROLL_DURATION);
  });

  it('roll duration > 0', () => {
    expect(ROLL_DURATION).toBeGreaterThan(0);
  });

  it('backdash invincibility < backdash duration', () => {
    expect(BACKDASH_INVINCIBLE_FRAMES).toBeLessThan(BACKDASH_DURATION);
  });

  it('backdash duration > 0', () => {
    expect(BACKDASH_DURATION).toBeGreaterThan(0);
  });
});

describe('Game timing constants', () => {
  it('tick rate is ~16.67ms (60fps)', () => {
    expect(TICK_RATE).toBeCloseTo(1000 / 60, 1);
  });

  it('combo timeout is 60 frames (1 second)', () => {
    expect(COMBO_TIMEOUT).toBe(60);
  });

  it('MAX mode duration is ~12 seconds at 60fps', () => {
    expect(MAX_MODE_DURATION).toBe(720); // 12 * 60
  });

  it('MAX mode stock cost <= max stocks', () => {
    expect(MAX_MODE_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('KO display time > 0', () => {
    expect(KO_DISPLAY_TIME).toBeGreaterThan(0);
  });

  it('round time is 99 seconds', () => {
    expect(ROUND_TIME).toBe(99);
  });

  it('max health is positive', () => {
    expect(MAX_HEALTH).toBeGreaterThan(0);
  });
});

describe('Wakeup buffer vs invincibility', () => {
  it('wakeup buffer <= wakeup invincibility', () => {
    expect(WAKEUP_BUFFER_WINDOW).toBeLessThanOrEqual(WAKEUP_FULL_INVINCIBILITY);
  });

  it('wakeup full invincibility is reasonable (3-10 frames)', () => {
    expect(WAKEUP_FULL_INVINCIBILITY).toBeGreaterThanOrEqual(3);
    expect(WAKEUP_FULL_INVINCIBILITY).toBeLessThanOrEqual(10);
  });
});
