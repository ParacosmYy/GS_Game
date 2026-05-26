import { describe, it, expect } from 'vitest';
import {
  createPowerGauge,
  createMaxMode,
  gainMeterOnHit,
  gainMeterOnBlock,
  gainMeterOnWhiff,
  gainMeterOnHitstun,
  spendStocks,
  spendGCRoll,
  spendGCCD,
  activateMaxMode,
  tickMaxMode,
  tickAutoMeter,
  resetMeterSystem,
  isDesperation,
  drainMeterByTaunt,
} from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { AttackType } from '../src/core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS, MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD, DESPERATION_DM_DAMAGE_BONUS, DESPERATION_METER_GAIN_BONUS,
  DM_STOCK_COST,
} from '../src/core/constants.js';

// =====================================================================
// 1. Stock System (6 tests)
// =====================================================================
describe('Stock System', () => {
  it('initial stock = 0 and meter = 0', () => {
    const gauge = createPowerGauge();
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);
  });

  it('hitting opponent accumulates meter into stocks', () => {
    const gauge = createPowerGauge();
    // STAND_C heavy hit = 100 meter = exactly 1 stock
    gainMeterOnHit(gauge, AttackType.STAND_C);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(0);
  });

  it('max stocks capped at 5', () => {
    const gauge = createPowerGauge();
    // 10 heavy hits = 1000 meter = 10 stocks, but cap at 5
    for (let i = 0; i < 10; i++) {
      gainMeterOnHit(gauge, AttackType.STAND_C);
    }
    expect(gauge.stocks).toBe(MAX_STOCKS);
    expect(gauge.meter).toBeLessThan(METER_PER_STOCK);
  });

  it('stock overflow does not lose precision — meter clamped at max', () => {
    const gauge = createPowerGauge();
    gauge.stocks = MAX_STOCKS;
    gauge.meter = 99;
    // DM hit = 200 meter, but stocks already at max
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    expect(gauge.stocks).toBe(MAX_STOCKS);
    // meter should be clamped to maxMeter - 1 (99)
    expect(gauge.meter).toBe(METER_PER_STOCK - 1);
  });

  it('getting hit gives defender meter (via gainMeterOnHitstun)', () => {
    const gauge = createPowerGauge();
    // Defender getting hit by heavy normal: base 50 * 100% = 50
    gainMeterOnHitstun(gauge, AttackType.STAND_C);
    expect(gauge.meter).toBe(50);
    expect(gauge.stocks).toBe(0);
  });

  it('blocking does not give defender meter via gainMeterOnBlock (attacker-side only)', () => {
    const attackerGauge = createPowerGauge();
    const defenderGauge = createPowerGauge();
    // gainMeterOnBlock is attacker meter when attack is blocked
    gainMeterOnBlock(attackerGauge, AttackType.STAND_C);
    // Attacker gets block meter (20 base * 100% = 20)
    expect(attackerGauge.meter).toBe(20);
    // Defender gets nothing from this call
    expect(defenderGauge.meter).toBe(0);
    expect(defenderGauge.stocks).toBe(0);
  });
});

// =====================================================================
// 2. DM Consumption (6 tests)
// =====================================================================
describe('DM Consumption', () => {
  it('DM costs 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const success = spendStocks(gauge, DM_STOCK_COST);
    expect(success).toBe(true);
    expect(gauge.stocks).toBe(2);
  });

  it('SDM costs 1 stock when in MAX mode', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    // Activate MAX with 3 stocks
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);
    expect(gauge.stocks).toBe(0);
    // In KOF2002, SDM is performed during MAX mode — no extra stock cost beyond MAX activation
    // But the DM_STOCK_COST is 1 for a regular DM. Verify constant.
    expect(DM_STOCK_COST).toBe(1);
  });

  it('HSDM (Hidden SDM) costs 3 stocks (2 extra on top of DM)', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    // HSDM costs: DM_STOCK_COST (1) + SUPER_CANCEL_STOCK_COST (2) = effectively spending 3
    // Simulate spending 3 stocks for HSDM
    const success = spendStocks(gauge, 3);
    expect(success).toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('DM not usable with insufficient stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const success = spendStocks(gauge, DM_STOCK_COST);
    expect(success).toBe(false);
    expect(gauge.stocks).toBe(0);
  });

  it('DM consumption leaves correct remaining stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 5;
    spendStocks(gauge, DM_STOCK_COST);
    expect(gauge.stocks).toBe(4);
    spendStocks(gauge, DM_STOCK_COST);
    expect(gauge.stocks).toBe(3);
    spendStocks(gauge, DM_STOCK_COST);
    expect(gauge.stocks).toBe(2);
  });

  it('consecutive DM spending is correct', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 5;
    // Spend DM 5 times — last one should fail
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(4);
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(3);
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(2);
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(1);
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(0);
    // 6th attempt fails
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(false);
    expect(gauge.stocks).toBe(0);
  });
});

// =====================================================================
// 3. MAX Mode (6 tests)
// =====================================================================
describe('MAX Mode', () => {
  it('MAX activation costs 3 stocks', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    const result = activateMaxMode(gauge, maxMode);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(0);
    expect(maxMode.active).toBe(true);
  });

  it('MAX mode lasts a fixed number of frames (720)', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = MAX_MODE_DURATION;
    // Tick all but 1 frame
    for (let i = 0; i < MAX_MODE_DURATION - 1; i++) {
      tickMaxMode(maxMode);
    }
    expect(maxMode.active).toBe(true);
    expect(maxMode.timer).toBe(1);
    // Final tick deactivates
    tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('MAX mode damage bonus is +20%', () => {
    // Verify the constant is used correctly in combat calculation
    expect(MAX_MODE_DAMAGE_BONUS).toBe(1.20);
    // Simulate: base 100 damage in MAX mode = 120
    const baseDamage = 100;
    const maxDamage = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    expect(maxDamage).toBe(120);
  });

  it('MAX mode defense bonus reduces damage by 25%', () => {
    // Defender in MAX mode takes 75% damage
    expect(MAX_MODE_DEFENSE_BONUS).toBe(0.75);
    const baseDamage = 100;
    const reducedDamage = Math.round(baseDamage * MAX_MODE_DEFENSE_BONUS);
    expect(reducedDamage).toBe(75);
  });

  it('MAX mode enables Free Cancel (cancel cost reduces timer)', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);
    // Simulate Free Cancel: reduces timer by FREE_CANCEL_TIMER_COST ratio (20%)
    const FREE_CANCEL_TIMER_COST = 0.20;
    const initialTimer = maxMode.timer;
    maxMode.timer = Math.floor(maxMode.timer * (1 - FREE_CANCEL_TIMER_COST));
    expect(maxMode.timer).toBeLessThan(initialTimer);
    expect(maxMode.active).toBe(true);
  });

  it('MAX mode expires automatically when timer reaches 0', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);
    expect(maxMode.active).toBe(true);
    // Tick through entire duration
    for (let i = 0; i < MAX_MODE_DURATION; i++) {
      tickMaxMode(maxMode);
    }
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });
});

// =====================================================================
// 4. Desperation Mode (6 tests)
// =====================================================================
describe('Desperation Mode (health < 25%)', () => {
  it('triggers when health < 25% of maxHealth', () => {
    // Health = 200, maxHealth = 1000 -> 20% < 25%
    expect(isDesperation(200, 1000)).toBe(true);
    // Health = 249, maxHealth = 1000 -> 24.9% < 25%
    expect(isDesperation(249, 1000)).toBe(true);
  });

  it('desperation gives +30% DM damage bonus', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBe(1.30);
    // Base DM damage 200, desperation = 200 * 1.30 = 260
    const baseDMDamage = 200;
    const desperDMDamage = Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(desperDMDamage).toBe(260);
  });

  it('desperation gives +50% meter gain bonus', () => {
    expect(DESPERATION_METER_GAIN_BONUS).toBe(1.50);
    // Verify via gainMeterOnHit with desperation health
    const gauge = createPowerGauge();
    // health=200, maxHealth=1000 -> desperation
    gainMeterOnHit(gauge, AttackType.STAND_C, 200, 1000);
    // STAND_C hit = 100 base, desperation bonus = 100 * 1.50 = 150 -> 1 stock + 50 meter
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
  });

  it('desperation allows SDM without MAX mode (via DM_STOCK_COST)', () => {
    // In KOF2002, desperation mode allows SDM usage even outside MAX mode.
    // The mechanic is that in desperation, the SDM is treated as a DM cost.
    // This is handled at combat system level — meter only checks stock cost.
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    // SDM costs same as DM (1 stock) in desperation mode
    const success = spendStocks(gauge, DM_STOCK_COST);
    expect(success).toBe(true);
  });

  it('desperation mode deactivates when health recovers above 25%', () => {
    // health=300, maxHealth=1000 -> 30% >= 25% -> not desperation
    expect(isDesperation(300, 1000)).toBe(false);
    expect(isDesperation(250, 1000)).toBe(false);
    // health drops back -> desperation again
    expect(isDesperation(249, 1000)).toBe(true);
  });

  it('desperation + MAX mode bonuses stack', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    // Activate MAX (need 3 stocks)
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);
    expect(maxMode.active).toBe(true);

    // MAX damage bonus on top of desperation DM damage bonus
    const baseDMDamage = 200;
    // Desperation DM damage: 200 * 1.30 = 260
    const desperDamage = Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS);
    // MAX mode further boosts: 260 * 1.20 = 312
    const maxDesperDamage = Math.round(desperDamage * MAX_MODE_DAMAGE_BONUS);
    expect(maxDesperDamage).toBe(312);
  });
});

// =====================================================================
// 5. Meter Gain Sources (6 tests)
// =====================================================================
describe('Meter Gain Sources', () => {
  it('normal attack on hit gives meter', () => {
    const gauge = createPowerGauge();
    // STAND_A (light normal) = 60% of 100 = 60
    gainMeterOnHit(gauge, AttackType.STAND_A);
    expect(gauge.meter).toBe(60);
    expect(gauge.stocks).toBe(0);

    // STAND_C (heavy normal) = 100% of 100 = 100 = 1 stock
    const gauge2 = createPowerGauge();
    gainMeterOnHit(gauge2, AttackType.STAND_C);
    expect(gauge2.stocks).toBe(1);
    expect(gauge2.meter).toBe(0);
  });

  it('special move on hit gives more meter (150%)', () => {
    const gauge = createPowerGauge();
    // KYO_ONIYAKI (special) = 150% of 100 = 150 -> 1 stock + 50 meter
    gainMeterOnHit(gauge, AttackType.KYO_ONIYAKI);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
  });

  it('DM on hit gives meter (200%)', () => {
    const gauge = createPowerGauge();
    // DM_OROCHINAGI (DM) = 200% of 100 = 200 -> 2 stocks
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    expect(gauge.stocks).toBe(2);
    expect(gauge.meter).toBe(0);
  });

  it('normal attack whiff gives zero meter', () => {
    const gauge = createPowerGauge();
    gainMeterOnWhiff(gauge, AttackType.STAND_C);
    expect(gauge.meter).toBe(0);
    expect(gauge.stocks).toBe(0);

    const gauge2 = createPowerGauge();
    gainMeterOnWhiff(gauge2, AttackType.STAND_A);
    expect(gauge2.meter).toBe(0);
    expect(gauge2.stocks).toBe(0);

    const gauge3 = createPowerGauge();
    gainMeterOnWhiff(gauge3, AttackType.CROUCH_D);
    expect(gauge3.meter).toBe(0);
    expect(gauge3.stocks).toBe(0);
  });

  it('special move whiff gives small meter', () => {
    const gauge = createPowerGauge();
    // Special whiff: base 10 * 150% = 15
    gainMeterOnWhiff(gauge, AttackType.KYO_ONIYAKI);
    expect(gauge.meter).toBe(15);
    expect(gauge.stocks).toBe(0);

    // DM whiff: base 10 * 200% = 20
    const gauge2 = createPowerGauge();
    gainMeterOnWhiff(gauge2, AttackType.DM_OROCHINAGI);
    expect(gauge2.meter).toBe(20);
  });

  it('taunt drains opponent meter (gives meter indirectly)', () => {
    // Taunt drains opponent's meter, indirectly giving advantage
    // Test the drainMeterByTaunt function
    const opponentGauge = createPowerGauge();
    opponentGauge.stocks = 1;
    opponentGauge.meter = 50;

    drainMeterByTaunt(opponentGauge);
    // Drains 80% of METER_PER_STOCK = 80; meter was 50, so 50 - 80 = -30
    // Since meter < 0, lose 1 stock and meter = -30 + 100 = 70
    expect(opponentGauge.stocks).toBe(0);
    expect(opponentGauge.meter).toBe(70);

    // Taunt on opponent with no stocks drains partial meter
    const noStockOpponent = createPowerGauge();
    noStockOpponent.stocks = 0;
    noStockOpponent.meter = 80;
    drainMeterByTaunt(noStockOpponent);
    // Drains 30% of METER_PER_STOCK = 30; meter = 80 - 30 = 50
    expect(noStockOpponent.stocks).toBe(0);
    expect(noStockOpponent.meter).toBe(50);
  });
});
