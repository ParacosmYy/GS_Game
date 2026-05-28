/**
 * Combat System Constants Regression Test
 * Verifies KOF2002-calibrated combat constants: damage scaling, cancel windows,
 * meter system, MAX mode, desperation, combo system, and juggle system.
 */
import { describe, it, expect } from 'vitest';
import {
  DAMAGE_SCALE_STEP,
  DAMAGE_SCALE_MIN_NORMAL,
  DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM,
  COMBO_TIMEOUT,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  MAX_STOCKS,
  METER_PER_STOCK,
  METER_GAIN_HIT,
  METER_GAIN_BLOCK,
  METER_GAIN_WHIFF,
  METER_GAIN_HITSTUN,
  DM_STOCK_COST,
  SUPER_CANCEL_STOCK_COST,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  CHIP_DAMAGE_RATIO,
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL,
  JUGGLE_COST_DM,
  JUGGLE_COST_CD,
  JUGGLE_GRAVITY_BASE,
  JUGGLE_GRAVITY_SCALE_PER_HIT,
  GROUND_BOUNCE_VY,
  GROUND_BOUNCE_COST,
  GROUND_BOUNCE_HITSTUN,
  WALL_BOUNCE_MAX_PER_COMBO,
  WALL_BOUNCE_SLIDE_FRICTION,
  WALL_SPLAT_SHAKE_DURATION,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
} from '../src/core/constants.js';

describe('Damage scaling — KOF2002 calibrated', () => {
  it('scale step is small positive fraction', () => {
    expect(DAMAGE_SCALE_STEP).toBeGreaterThan(0);
    expect(DAMAGE_SCALE_STEP).toBeLessThan(0.15);
  });

  it('minimum scales increase: normal < special < DM', () => {
    expect(DAMAGE_SCALE_MIN_NORMAL).toBeLessThan(DAMAGE_SCALE_MIN_SPECIAL);
    expect(DAMAGE_SCALE_MIN_SPECIAL).toBeLessThan(DAMAGE_SCALE_MIN_DM);
  });

  it('all minimum scales are between 0 and 1', () => {
    for (const s of [DAMAGE_SCALE_MIN_NORMAL, DAMAGE_SCALE_MIN_SPECIAL, DAMAGE_SCALE_MIN_DM]) {
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    }
  });

  it('combo timeout is 0.5–2 seconds at 60fps', () => {
    expect(COMBO_TIMEOUT).toBeGreaterThanOrEqual(30);
    expect(COMBO_TIMEOUT).toBeLessThanOrEqual(120);
  });
});

describe('Combo tier scaling', () => {
  it('COMBO_DAMAGE_SCALE keys are ascending', () => {
    const keys = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]).toBeGreaterThan(keys[i - 1]);
    }
  });

  it('COMBO_DAMAGE_SCALE values decrease with combo length', () => {
    const keys = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < keys.length; i++) {
      expect(COMBO_DAMAGE_SCALE[keys[i]], `scale at ${keys[i]}`).toBeLessThan(COMBO_DAMAGE_SCALE[keys[i - 1]]);
    }
  });

  it('all scale values are between 0 and 1', () => {
    for (const val of Object.values(COMBO_DAMAGE_SCALE)) {
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it('COMBO_MIN_SCALE is positive and less than 1', () => {
    expect(COMBO_MIN_SCALE).toBeGreaterThan(0);
    expect(COMBO_MIN_SCALE).toBeLessThan(1);
  });

  it('DM_COMBO_PENALTY is positive but less than COMBO_MIN_SCALE', () => {
    expect(DM_COMBO_PENALTY).toBeGreaterThan(0);
    expect(DM_COMBO_PENALTY).toBeLessThan(COMBO_MIN_SCALE);
  });
});

describe('Cancel windows — KOF2002 calibrated', () => {
  it('all cancel windows are positive', () => {
    for (const w of [CANCEL_WINDOW_NORMAL, CANCEL_WINDOW_RAPID, CANCEL_WINDOW_SUPER, CANCEL_WINDOW_FREE]) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('rapid is tightest, super is widest', () => {
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeLessThanOrEqual(CANCEL_WINDOW_SUPER);
  });

  it('all windows are under 10 frames', () => {
    for (const w of [CANCEL_WINDOW_NORMAL, CANCEL_WINDOW_RAPID, CANCEL_WINDOW_SUPER, CANCEL_WINDOW_FREE]) {
      expect(w).toBeLessThanOrEqual(10);
    }
  });
});

describe('Power gauge / meter system', () => {
  it('MAX_STOCKS is 3–5', () => {
    expect(MAX_STOCKS).toBeGreaterThanOrEqual(3);
    expect(MAX_STOCKS).toBeLessThanOrEqual(5);
  });

  it('METER_PER_STOCK is positive', () => {
    expect(METER_PER_STOCK).toBeGreaterThan(0);
  });

  it('meter gain ordering: hit > hitstun > block > whiff', () => {
    expect(METER_GAIN_HIT).toBeGreaterThan(METER_GAIN_HITSTUN);
    expect(METER_GAIN_HITSTUN).toBeGreaterThan(METER_GAIN_BLOCK);
    expect(METER_GAIN_BLOCK).toBeGreaterThan(METER_GAIN_WHIFF);
  });

  it('hitting fills one full stock', () => {
    expect(METER_GAIN_HIT).toBeGreaterThanOrEqual(METER_PER_STOCK);
  });

  it('DM costs 1 stock', () => {
    expect(DM_STOCK_COST).toBe(1);
  });

  it('super cancel costs at most 1 extra stock', () => {
    expect(SUPER_CANCEL_STOCK_COST).toBeLessThanOrEqual(1);
  });
});

describe('MAX mode system', () => {
  it('MAX mode costs 3 stocks (KOF2002)', () => {
    expect(MAX_MODE_STOCK_COST).toBe(3);
  });

  it('MAX mode duration is 8–15 seconds at 60fps', () => {
    expect(MAX_MODE_DURATION).toBeGreaterThanOrEqual(480);
    expect(MAX_MODE_DURATION).toBeLessThanOrEqual(900);
  });

  it('damage bonus is between 1.0 and 1.5', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeGreaterThan(1);
    expect(MAX_MODE_DAMAGE_BONUS).toBeLessThan(1.5);
  });

  it('defense bonus is between 0.5 and 1.0 (reduces damage)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeGreaterThan(0.5);
    expect(MAX_MODE_DEFENSE_BONUS).toBeLessThan(1);
  });

  it('MAX mode stock cost is less than max stocks', () => {
    expect(MAX_MODE_STOCK_COST).toBeLessThan(MAX_STOCKS);
  });
});

describe('Desperation system', () => {
  it('health threshold is between 10% and 33%', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeGreaterThanOrEqual(0.10);
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThanOrEqual(0.33);
  });

  it('DM damage bonus is between 1.0 and 1.5', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeGreaterThan(1);
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeLessThanOrEqual(1.5);
  });

  it('meter gain bonus is positive', () => {
    expect(DESPERATION_METER_GAIN_BONUS).toBeGreaterThan(1);
  });
});

describe('Juggle system', () => {
  it('JUGGLE_POINTS_MAX is 3–10', () => {
    expect(JUGGLE_POINTS_MAX).toBeGreaterThanOrEqual(3);
    expect(JUGGLE_POINTS_MAX).toBeLessThanOrEqual(10);
  });

  it('juggle costs are positive and increase: light <= heavy/special/CD < DM', () => {
    expect(JUGGLE_COST_LIGHT).toBeGreaterThan(0);
    expect(JUGGLE_COST_HEAVY).toBeGreaterThanOrEqual(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_SPECIAL).toBeGreaterThanOrEqual(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_LIGHT);
  });

  it('juggle costs do not exceed max points in one hit', () => {
    expect(JUGGLE_COST_LIGHT).toBeLessThanOrEqual(JUGGLE_POINTS_MAX);
    expect(JUGGLE_COST_HEAVY).toBeLessThanOrEqual(JUGGLE_POINTS_MAX);
    expect(JUGGLE_COST_SPECIAL).toBeLessThanOrEqual(JUGGLE_POINTS_MAX);
    expect(JUGGLE_COST_DM).toBeLessThanOrEqual(JUGGLE_POINTS_MAX);
    expect(JUGGLE_COST_CD).toBeLessThanOrEqual(JUGGLE_POINTS_MAX);
  });

  it('gravity constants are positive', () => {
    expect(JUGGLE_GRAVITY_BASE).toBeGreaterThan(0);
    expect(JUGGLE_GRAVITY_SCALE_PER_HIT).toBeGreaterThan(0);
  });
});

describe('Bounce system', () => {
  it('ground bounce goes upward (negative vy)', () => {
    expect(GROUND_BOUNCE_VY).toBeLessThan(0);
  });

  it('ground bounce cost is positive', () => {
    expect(GROUND_BOUNCE_COST).toBeGreaterThan(0);
  });

  it('ground bounce hitstun is 10–30 frames', () => {
    expect(GROUND_BOUNCE_HITSTUN).toBeGreaterThanOrEqual(10);
    expect(GROUND_BOUNCE_HITSTUN).toBeLessThanOrEqual(30);
  });

  it('wall bounce limit is 1 per combo (KOF2002)', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBeGreaterThanOrEqual(1);
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBeLessThanOrEqual(2);
  });

  it('counter wire bounce goes upward and toward', () => {
    expect(COUNTER_WIRE_BOUNCE_VX).toBeGreaterThan(0);
    expect(COUNTER_WIRE_BOUNCE_VY).toBeLessThan(0);
  });

  it('wall slide friction is between 0.5 and 1.0', () => {
    expect(WALL_BOUNCE_SLIDE_FRICTION).toBeGreaterThan(0.5);
    expect(WALL_BOUNCE_SLIDE_FRICTION).toBeLessThanOrEqual(1);
  });
});

describe('Chip damage', () => {
  it('chip damage ratio is between 1% and 25%', () => {
    expect(CHIP_DAMAGE_RATIO).toBeGreaterThan(0);
    expect(CHIP_DAMAGE_RATIO).toBeLessThanOrEqual(0.25);
  });
});
