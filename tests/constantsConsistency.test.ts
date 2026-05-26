/**
 * constantsConsistency.test.ts — 验证 src/core/constants.ts 中所有常量的交叉一致性
 *
 * 确保 stock/gauge、伤害加成、计时器、hitstop/shake 层级、以及范围/位置常量
 * 之间的关系在语义上是合理的，防止不慎改坏某个值导致整体逻辑矛盾。
 */
import { describe, it, expect } from 'vitest';
import {
  // Stock / Gauge
  MAX_STOCKS,
  METER_PER_STOCK,
  MAX_MODE_STOCK_COST,
  DM_STOCK_COST,

  // Damage Bonus
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_DM_DAMAGE_BONUS,

  // Timer
  MAX_MODE_DURATION,
  ROUND_TIME,
  COMBO_TIMEOUT,

  // Hitstop
  HITSTOP_LIGHT,
  HITSTOP_MEDIUM,
  HITSTOP_SPECIAL,
  HITSTOP_DM,

  // Blockstop
  BLOCKSTOP_LIGHT,
  BLOCKSTOP_HEAVY,
  BLOCKSTOP_SPECIAL,
  BLOCKSTOP_DM,

  // Shake
  SHAKE_LIGHT,
  SHAKE_HEAVY,
  SHAKE_DM,
  SHAKE_KO,

  // Range / Position
  CANVAS_WIDTH,
  STAGE_WIDTH,
  STAGE_LEFT,
  STAGE_RIGHT,
  THROW_RANGE,
} from '../src/core/constants.js';
import { CLOSE_RANGE } from '../src/core/types.js';

// ===== 1. Stock / Gauge Consistency =====
describe('Stock/Gauge Consistency', () => {
  it('MAX_STOCKS * METER_PER_STOCK should equal max meter value (500)', () => {
    expect(MAX_STOCKS * METER_PER_STOCK).toBe(500);
  });

  it('MAX_MODE_STOCK_COST should not exceed MAX_STOCKS', () => {
    expect(MAX_MODE_STOCK_COST).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('DM_STOCK_COST should be less than or equal to MAX_MODE_STOCK_COST (DM is cheaper than MAX activation)', () => {
    expect(DM_STOCK_COST).toBeLessThanOrEqual(MAX_MODE_STOCK_COST);
  });
});

// ===== 2. Damage Bonus Consistency =====
describe('Damage Bonus Consistency', () => {
  it('MAX_MODE_DAMAGE_BONUS should be greater than 1.0 (damage increase)', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeGreaterThan(1.0);
  });

  it('MAX_MODE_DEFENSE_BONUS should be less than 1.0 (damage reduction)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeLessThan(1.0);
  });

  it('DESPERATION_DM_DAMAGE_BONUS should be greater than MAX_MODE_DAMAGE_BONUS', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeGreaterThan(MAX_MODE_DAMAGE_BONUS);
  });
});

// ===== 3. Timer Consistency =====
describe('Timer Consistency', () => {
  it('MAX_MODE_DURATION should be positive (frames)', () => {
    expect(MAX_MODE_DURATION).toBeGreaterThan(0);
  });

  it('ROUND_TIME should be positive (seconds)', () => {
    expect(ROUND_TIME).toBeGreaterThan(0);
  });

  it('COMBO_TIMEOUT should be positive (frames)', () => {
    expect(COMBO_TIMEOUT).toBeGreaterThan(0);
  });
});

// ===== 4. Hitstop / Shake Hierarchy =====
describe('Hitstop/Shake Hierarchy', () => {
  it('HITSTOP should increase: LIGHT < MEDIUM < SPECIAL < DM', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThan(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThan(HITSTOP_DM);
  });

  it('SHAKE should increase: LIGHT < HEAVY < DM < KO', () => {
    expect(SHAKE_LIGHT).toBeLessThan(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBeLessThan(SHAKE_DM);
    expect(SHAKE_DM).toBeLessThan(SHAKE_KO);
  });

  it('BLOCKSTOP values should be less than corresponding HITSTOP values (block pause < hit pause)', () => {
    expect(BLOCKSTOP_LIGHT).toBeLessThan(HITSTOP_LIGHT);
    expect(BLOCKSTOP_HEAVY).toBeLessThan(HITSTOP_MEDIUM);
    expect(BLOCKSTOP_SPECIAL).toBeLessThan(HITSTOP_SPECIAL);
    expect(BLOCKSTOP_DM).toBeLessThan(HITSTOP_DM);
  });
});

// ===== 5. Range / Position Consistency =====
describe('Range/Position Consistency', () => {
  it('CANVAS_WIDTH should be less than STAGE_WIDTH (stage wider than viewport)', () => {
    expect(CANVAS_WIDTH).toBeLessThan(STAGE_WIDTH);
  });

  it('STAGE_LEFT should be less than STAGE_RIGHT (valid play area)', () => {
    expect(STAGE_LEFT).toBeLessThan(STAGE_RIGHT);
  });

  it('CLOSE_RANGE should be less than THROW_RANGE (throw range is reasonable)', () => {
    expect(CLOSE_RANGE).toBeLessThan(THROW_RANGE);
  });
});
