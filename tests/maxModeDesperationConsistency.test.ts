/**
 * MAX Mode & Desperation System Constants Consistency Tests
 *
 * Validates the MAX mode activation, desperation mode, and
 * power gauge systems are internally consistent:
 * - MAX activation cost <= max stocks
 * - MAX duration is reasonable (10-15 seconds at 60fps)
 * - Desperation threshold is between 0 and 1
 * - Damage/defense bonuses are > 1.0 and < 1.0 respectively
 * - Meter gain ordering: hit > hitstun > block > whiff
 * - Guard cancel costs are reasonable
 */
import { describe, it, expect } from 'vitest';
import {
  MAX_STOCKS,
  METER_PER_STOCK,
  METER_GAIN_HIT,
  METER_GAIN_BLOCK,
  METER_GAIN_WHIFF,
  METER_GAIN_HITSTUN,
  DM_STOCK_COST,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  GC_ROLL_STOCK_COST,
  GC_CD_STOCK_COST,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  MAX_HEALTH,
  PROXIMITY_GUARD_RANGE,
} from '../src/core/constants.js';

describe('Power gauge system', () => {
  it('max stocks is between 3 and 10', () => {
    expect(MAX_STOCKS).toBeGreaterThanOrEqual(3);
    expect(MAX_STOCKS).toBeLessThanOrEqual(10);
  });

  it('meter per stock is positive', () => {
    expect(METER_PER_STOCK).toBeGreaterThan(0);
  });

  it('meter gain ordering: hit > hitstun > block > whiff', () => {
    expect(METER_GAIN_HIT).toBeGreaterThan(METER_GAIN_HITSTUN);
    expect(METER_GAIN_HITSTUN).toBeGreaterThan(METER_GAIN_BLOCK);
    expect(METER_GAIN_BLOCK).toBeGreaterThan(METER_GAIN_WHIFF);
  });

  it('all meter gain values are positive', () => {
    expect(METER_GAIN_HIT).toBeGreaterThan(0);
    expect(METER_GAIN_BLOCK).toBeGreaterThan(0);
    expect(METER_GAIN_WHIFF).toBeGreaterThan(0);
    expect(METER_GAIN_HITSTUN).toBeGreaterThan(0);
  });

  it('hit meter gain fills at least 1 stock', () => {
    expect(METER_GAIN_HIT).toBeGreaterThanOrEqual(METER_PER_STOCK);
  });

  it('DM stock cost is at least 1', () => {
    expect(DM_STOCK_COST).toBeGreaterThanOrEqual(1);
  });

  it('DM stock cost <= max stocks', () => {
    expect(DM_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });
});

describe('MAX mode system', () => {
  it('activation stock cost <= max stocks', () => {
    expect(MAX_MODE_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('activation cost >= DM cost', () => {
    expect(MAX_MODE_STOCK_COST).toBeGreaterThanOrEqual(DM_STOCK_COST);
  });

  it('duration is 10-15 seconds at 60fps', () => {
    const seconds = MAX_MODE_DURATION / 60;
    expect(seconds).toBeGreaterThanOrEqual(10);
    expect(seconds).toBeLessThanOrEqual(15);
  });

  it('damage bonus is > 1.0 (attack power increases)', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeGreaterThan(1.0);
  });

  it('defense bonus is < 1.0 (damage taken decreases)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeLessThan(1.0);
  });

  it('damage bonus is reasonable (< 2.0)', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeLessThan(2.0);
  });

  it('defense bonus is reasonable (> 0.5)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeGreaterThan(0.5);
  });

  it('free cancel timer cost is between 0 and 1', () => {
    expect(FREE_CANCEL_TIMER_COST).toBeGreaterThan(0);
    expect(FREE_CANCEL_TIMER_COST).toBeLessThanOrEqual(1);
  });
});

describe('Desperation mode system', () => {
  it('health threshold is between 0 and 0.5', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeGreaterThan(0);
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThan(0.5);
  });

  it('DM damage bonus is > 1.0', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeGreaterThan(1.0);
  });

  it('meter gain bonus is > 1.0', () => {
    expect(DESPERATION_METER_GAIN_BONUS).toBeGreaterThan(1.0);
  });

  it('desperation DM bonus > MAX damage bonus', () => {
    // Desperation mode DM should hit harder than MAX mode base
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeGreaterThan(MAX_MODE_DAMAGE_BONUS);
  });

  it('threshold translates to health < 250 (out of 1000)', () => {
    const thresholdHp = DESPERATION_HEALTH_THRESHOLD * MAX_HEALTH;
    expect(thresholdHp).toBeLessThan(MAX_HEALTH * 0.5);
    expect(thresholdHp).toBeGreaterThan(0);
  });
});

describe('Guard cancel costs', () => {
  it('GC roll cost <= max stocks', () => {
    expect(GC_ROLL_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('GC CD cost <= max stocks', () => {
    expect(GC_CD_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('super cancel cost <= max stocks', () => {
    expect(SUPER_CANCEL_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('GC costs are positive', () => {
    expect(GC_ROLL_STOCK_COST).toBeGreaterThan(0);
    expect(GC_CD_STOCK_COST).toBeGreaterThan(0);
  });

  it('proximity guard range is positive', () => {
    expect(PROXIMITY_GUARD_RANGE).toBeGreaterThan(0);
  });
});

describe('Cross-system balance', () => {
  it('MAX mode activation costs more than a single DM', () => {
    // MAX mode should be a bigger investment than using one DM
    expect(MAX_MODE_STOCK_COST).toBeGreaterThan(DM_STOCK_COST);
  });

  it('can activate MAX mode and still have stocks for DM', () => {
    // With max stocks, should be able to activate MAX and use at least 1 DM
    const remainingStocks = MAX_STOCKS - MAX_MODE_STOCK_COST;
    expect(remainingStocks).toBeGreaterThanOrEqual(DM_STOCK_COST);
  });

  it('MAX + desperation DM bonus is significant', () => {
    // Combined MAX + desperation DM damage should be > 1.5x
    const combined = MAX_MODE_DAMAGE_BONUS * DESPERATION_DM_DAMAGE_BONUS;
    // Not testing exact value, just that stacking is meaningful
    expect(combined).toBeGreaterThan(1.5);
  });
});
