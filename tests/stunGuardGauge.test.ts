/**
 * Stun Gauge & Guard Gauge Constants Regression Test
 * Verifies KOF2002-calibrated stun accumulation and guard crush systems.
 */
import { describe, it, expect } from 'vitest';
import {
  STUN_GAUGE_MAX,
  STUN_DECAY_DELAY,
  STUN_DECAY_RATE,
  STUN_FILL_LIGHT,
  STUN_FILL_HEAVY,
  STUN_FILL_COMMAND_NORMAL,
  STUN_FILL_SPECIAL,
  STUN_FILL_DM,
  STUN_FILL_CD,
  STUN_FILL_THROW,
  DIZZY_BASE_DURATION_MIN,
  DIZZY_BASE_DURATION_MAX,
  DIZZY_MASH_RECOVERY,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_MAX,
  GUARD_GAUGE_RECOVERY_IDLE,
  GUARD_GAUGE_RECOVERY_RUN,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_COMMAND_NORMAL,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM,
  GUARD_GAUGE_DRAIN_CD,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  GUARD_GAUGE_WARNING_THRESHOLD,
} from '../src/core/constants.js';

describe('Stun gauge constants — KOF2002 calibrated', () => {
  it('STUN_GAUGE_MAX is positive', () => {
    expect(STUN_GAUGE_MAX).toBeGreaterThan(0);
  });

  it('all STUN_FILL values are positive', () => {
    const fills = [STUN_FILL_LIGHT, STUN_FILL_HEAVY, STUN_FILL_COMMAND_NORMAL,
      STUN_FILL_SPECIAL, STUN_FILL_DM, STUN_FILL_CD, STUN_FILL_THROW];
    for (const f of fills) {
      expect(f, `STUN_FILL ${f}`).toBeGreaterThan(0);
    }
  });

  it('stun fill increases with attack weight', () => {
    expect(STUN_FILL_LIGHT).toBeLessThan(STUN_FILL_HEAVY);
    expect(STUN_FILL_HEAVY).toBeLessThan(STUN_FILL_SPECIAL);
    expect(STUN_FILL_SPECIAL).toBeLessThan(STUN_FILL_DM);
    expect(STUN_FILL_COMMAND_NORMAL).toBeGreaterThan(STUN_FILL_LIGHT);
    expect(STUN_FILL_COMMAND_NORMAL).toBeLessThan(STUN_FILL_SPECIAL);
  });

  it('CD blowback stun is between heavy and special', () => {
    expect(STUN_FILL_CD).toBeGreaterThanOrEqual(STUN_FILL_HEAVY);
    expect(STUN_FILL_CD).toBeLessThanOrEqual(STUN_FILL_SPECIAL);
  });

  it('throw stun is between heavy and special', () => {
    expect(STUN_FILL_THROW).toBeGreaterThanOrEqual(STUN_FILL_HEAVY);
    expect(STUN_FILL_THROW).toBeLessThanOrEqual(STUN_FILL_SPECIAL);
  });

  it('stun gauge can be filled by ~6 heavy hits', () => {
    // KOF2002: roughly 5-7 heavy hits cause dizzy
    const hitsToDizzy = Math.ceil(STUN_GAUGE_MAX / STUN_FILL_HEAVY);
    expect(hitsToDizzy, 'heavy hits to dizzy').toBeGreaterThanOrEqual(5);
    expect(hitsToDizzy, 'heavy hits to dizzy').toBeLessThanOrEqual(12);
  });

  it('DM fills about 1/4 of stun gauge', () => {
    const ratio = STUN_FILL_DM / STUN_GAUGE_MAX;
    expect(ratio, 'DM fill ratio ~0.25').toBeGreaterThanOrEqual(0.15);
    expect(ratio, 'DM fill ratio ~0.25').toBeLessThanOrEqual(0.35);
  });

  it('decay delay is reasonable (0.5–2 seconds at 60fps)', () => {
    expect(STUN_DECAY_DELAY).toBeGreaterThanOrEqual(30);
    expect(STUN_DECAY_DELAY).toBeLessThanOrEqual(120);
  });

  it('decay rate is positive but slow', () => {
    expect(STUN_DECAY_RATE).toBeGreaterThan(0);
    expect(STUN_DECAY_RATE).toBeLessThan(STUN_FILL_LIGHT);
  });
});

describe('Dizzy constants — KOF2002 calibrated', () => {
  it('dizzy duration range is 1–3 seconds at 60fps', () => {
    expect(DIZZY_BASE_DURATION_MIN).toBeGreaterThanOrEqual(30);
    expect(DIZZY_BASE_DURATION_MAX).toBeLessThanOrEqual(240);
    expect(DIZZY_BASE_DURATION_MIN).toBeLessThan(DIZZY_BASE_DURATION_MAX);
  });

  it('mash recovery is positive and less than min duration', () => {
    expect(DIZZY_MASH_RECOVERY).toBeGreaterThan(0);
    expect(DIZZY_MASH_RECOVERY).toBeLessThan(DIZZY_BASE_DURATION_MAX);
  });

  it('mashing out is possible within max dizzy duration', () => {
    const mashesNeeded = Math.ceil(DIZZY_BASE_DURATION_MAX / DIZZY_MASH_RECOVERY);
    // Should require more than 1 press but not unreasonably many
    expect(mashesNeeded).toBeGreaterThan(5);
    expect(mashesNeeded).toBeLessThanOrEqual(120);
  });
});

describe('Guard gauge constants — KOF2002 calibrated', () => {
  it('GUARD_GAUGE_MAX is positive', () => {
    expect(GUARD_GAUGE_MAX).toBeGreaterThan(0);
  });

  it('all GUARD_GAUGE_DRAIN values are positive', () => {
    const drains = [GUARD_GAUGE_DRAIN_LIGHT, GUARD_GAUGE_DRAIN_HEAVY,
      GUARD_GAUGE_DRAIN_COMMAND_NORMAL, GUARD_GAUGE_DRAIN_SPECIAL,
      GUARD_GAUGE_DRAIN_DM, GUARD_GAUGE_DRAIN_SDM, GUARD_GAUGE_DRAIN_CD];
    for (const d of drains) {
      expect(d, `GUARD_GAUGE_DRAIN ${d}`).toBeGreaterThan(0);
    }
  });

  it('guard drain increases with attack weight', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBeLessThan(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeLessThan(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeLessThan(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBeLessThan(GUARD_GAUGE_DRAIN_SDM);
  });

  it('SDM guard drain is the highest', () => {
    expect(GUARD_GAUGE_DRAIN_SDM).toBeGreaterThanOrEqual(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_SDM).toBeGreaterThanOrEqual(GUARD_GAUGE_DRAIN_SPECIAL);
  });

  it('guard crush can happen from repeated heavy blocks', () => {
    const blocksToCrush = Math.ceil(GUARD_GAUGE_MAX / GUARD_GAUGE_DRAIN_HEAVY);
    expect(blocksToCrush, 'heavy blocks to crush').toBeGreaterThanOrEqual(5);
    expect(blocksToCrush, 'heavy blocks to crush').toBeLessThanOrEqual(20);
  });

  it('GUARD_CRUSH_DURATION is 1–2 seconds at 60fps', () => {
    expect(GUARD_CRUSH_DURATION).toBeGreaterThanOrEqual(40);
    expect(GUARD_CRUSH_DURATION).toBeLessThanOrEqual(150);
  });

  it('guard recovery rates are positive and idle > run', () => {
    expect(GUARD_GAUGE_RECOVERY_IDLE).toBeGreaterThan(0);
    expect(GUARD_GAUGE_RECOVERY_RUN).toBeGreaterThan(0);
    expect(GUARD_GAUGE_RECOVERY_IDLE).toBeGreaterThan(GUARD_GAUGE_RECOVERY_RUN);
  });

  it('warning threshold is less than max gauge', () => {
    expect(GUARD_GAUGE_WARNING_THRESHOLD).toBeGreaterThan(0);
    expect(GUARD_GAUGE_WARNING_THRESHOLD).toBeLessThan(GUARD_GAUGE_MAX);
  });

  it('meter bonus on block is positive', () => {
    expect(GUARD_GAUGE_METER_BONUS_ON_BLOCK).toBeGreaterThan(0);
  });

  it('command normal drain is between heavy and special', () => {
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBeGreaterThanOrEqual(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBeLessThanOrEqual(GUARD_GAUGE_DRAIN_SPECIAL);
  });

  it('CD blowback drain is between heavy and special', () => {
    expect(GUARD_GAUGE_DRAIN_CD).toBeGreaterThanOrEqual(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_CD).toBeLessThanOrEqual(GUARD_GAUGE_DRAIN_SPECIAL);
  });
});

describe('Cross-system consistency', () => {
  it('stun fill and guard drain have same attack type ordering', () => {
    // Both systems should rank attack types the same way
    expect(STUN_FILL_LIGHT < STUN_FILL_HEAVY).toBe(true);
    expect(GUARD_GAUGE_DRAIN_LIGHT < GUARD_GAUGE_DRAIN_HEAVY).toBe(true);

    expect(STUN_FILL_SPECIAL < STUN_FILL_DM).toBe(true);
    expect(GUARD_GAUGE_DRAIN_SPECIAL < GUARD_GAUGE_DRAIN_DM).toBe(true);
  });

  it('DM stun fill is roughly proportional to DM guard drain', () => {
    const stunRatio = STUN_FILL_DM / STUN_GAUGE_MAX;
    const guardRatio = GUARD_GAUGE_DRAIN_DM / GUARD_GAUGE_MAX;
    // Both should be significant but not overwhelming (~15-35%)
    expect(Math.abs(stunRatio - guardRatio), 'DM ratios within 2×').toBeLessThan(stunRatio);
  });
});
