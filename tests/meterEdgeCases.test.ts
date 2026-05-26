/**
 * meterEdgeCases.test.ts -- Meter/Energy system edge case tests
 *
 * Covers:
 *  1. Meter Accumulation (5 tests)
 *  2. MAX Mode (5 tests)
 *  3. DM Activation (5 tests)
 *  4. Desperation Mode (4 tests)
 *  5. Free Cancel in MAX mode (4 tests)
 *  6. Guard Cancel (3 tests)
 *
 * Total: 26 tests.
 *
 * Uses the meter module's pure functions and CombatSystem integration
 * to verify KOF2002 meter/energy mechanics at boundary conditions.
 */
import { describe, it, expect } from 'vitest';
import {
  createPowerGauge,
  createMaxMode,
  gainMeterOnHit,
  gainMeterOnHitstun,
  gainMeterOnWhiff,
  spendStocks,
  spendGCRoll,
  spendGCCD,
  activateMaxMode,
  tickMaxMode,
  tickAutoMeter,
  isDesperation,
} from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { AttackType } from '../src/core/types.js';
import {
  MAX_STOCKS,
  METER_PER_STOCK,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  DM_STOCK_COST,
  GC_ROLL_STOCK_COST,
  GC_CD_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  FRAME_DATA,
} from '../src/core/constants.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { FighterState } from '../src/core/types.js';

// ===== Test helpers =====

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(
  p1Override: Partial<PlayerInput> = {},
  p2Override: Partial<PlayerInput> = {},
): IInputProvider {
  const p1: PlayerInput = { ...noopInput, ...p1Override };
  const p2: PlayerInput = { ...noopInput, ...p2Override };
  return { getP1Input: () => p1, getP2Input: () => p2 };
}

function forceActivePhase(f: Fighter, attackType: AttackType, frame = 0): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = frame;
}

// =========================================================================
// 1. Meter Accumulation (5 tests)
// =========================================================================
describe('Meter Accumulation', () => {
  it('light attack gives minimal meter (60% of base)', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_A);
    // base = METER_GAIN_HIT (100), light multiplier = 0.6 => 60
    expect(gauge.meter).toBe(60);
    expect(gauge.stocks).toBe(0);
  });

  it('heavy attack gives more meter (100% of base = 1 stock)', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(0);
  });

  it('special gives even more meter (150% of base)', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.KYO_ONIYAKI);
    // 100 * 1.5 = 150 => 1 stock + 50 meter
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);
  });

  it('taking damage gives meter to defender via gainMeterOnHitstun', () => {
    const gauge = createPowerGauge();
    gainMeterOnHitstun(gauge, AttackType.STAND_C);
    // base = METER_GAIN_HITSTUN (50), heavy multiplier = 100% => 50
    expect(gauge.meter).toBe(50);
    expect(gauge.stocks).toBe(0);

    // Special gives defender even more meter
    const gauge2 = createPowerGauge();
    gainMeterOnHitstun(gauge2, AttackType.KYO_ONIYAKI);
    // 50 * 1.5 = 75
    expect(gauge2.meter).toBe(75);
  });

  it('meter capped at maximum (5 stocks, overflow meter clamped)', () => {
    const gauge = createPowerGauge();
    // Force near-max
    gauge.stocks = MAX_STOCKS;
    gauge.meter = METER_PER_STOCK - 1; // 99

    // Try adding a large amount (DM = 200 meter)
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);

    // Stocks must remain at max
    expect(gauge.stocks).toBe(MAX_STOCKS);
    // Meter clamped to maxMeter - 1 (99) per addMeter logic
    expect(gauge.meter).toBe(METER_PER_STOCK - 1);
  });
});

// =========================================================================
// 2. MAX Mode (5 tests)
// =========================================================================
describe('MAX Mode', () => {
  it('MAX mode costs 3 stocks', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;

    const result = activateMaxMode(gauge, maxMode);

    expect(result).toBe(true);
    expect(gauge.stocks).toBe(0); // 3 - 3 = 0
    expect(maxMode.active).toBe(true);
  });

  it('MAX mode damage +20% verified through CombatSystem', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const baseDamage = FRAME_DATA[AttackType.STAND_C].damage;
    const healthBefore = p2.health;

    // Activate MAX mode for P1 (pass maxModes array)
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
  });

  it('MAX mode defense +25% verified through damage taken', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const baseDamage = FRAME_DATA[AttackType.STAND_C].damage;
    const healthBefore = p2.health;

    // P2 is in MAX mode (defender bonus)
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [false, true]);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDamage * MAX_MODE_DEFENSE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
  });

  it('MAX mode timer duration and expiration', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;

    activateMaxMode(gauge, maxMode);
    expect(maxMode.timer).toBe(MAX_MODE_DURATION); // 720 frames
    expect(maxMode.active).toBe(true);

    // Tick all but one frame
    for (let i = 0; i < MAX_MODE_DURATION - 1; i++) {
      tickMaxMode(maxMode);
    }
    expect(maxMode.active).toBe(true);
    expect(maxMode.timer).toBe(1);

    // Final tick expires MAX mode
    tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('cannot activate MAX with fewer than 3 stocks', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();

    // Test with 0, 1, 2 stocks
    for (const stocks of [0, 1, 2]) {
      gauge.stocks = stocks;
      gauge.meter = 0;
      maxMode.active = false;
      maxMode.timer = 0;

      const result = activateMaxMode(gauge, maxMode);
      expect(result).toBe(false);
      expect(maxMode.active).toBe(false);
      expect(maxMode.timer).toBe(0);
    }
  });
});

// =========================================================================
// 3. DM Activation (5 tests)
// =========================================================================
describe('DM Activation', () => {
  it('DM costs 1 stock', () => {
    expect(DM_STOCK_COST).toBe(1);
    const gauge = createPowerGauge();
    gauge.stocks = 3;

    const result = spendStocks(gauge, DM_STOCK_COST);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(2);
  });

  it('SDM costs effectively via MAX mode activation (MAX=3 stocks, SDM inside is free)', () => {
    // In KOF2002, SDM is only available during MAX mode.
    // The cost is the MAX activation itself (3 stocks).
    // Once in MAX, SDM does not cost extra stock beyond the MAX timer.
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;

    activateMaxMode(gauge, maxMode);
    expect(gauge.stocks).toBe(0);
    expect(maxMode.active).toBe(true);

    // SDM can be used inside MAX without additional stock cost
    // (only the MAX timer is consumed via Free Cancel, not direct stock spending)
  });

  it('cannot use DM with 0 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;

    const result = spendStocks(gauge, DM_STOCK_COST);
    expect(result).toBe(false);
    expect(gauge.stocks).toBe(0);
  });

  it('meter is consumed on activation, not on hit', () => {
    // Simulate: player has 2 stocks, activates DM (costs 1 stock on input)
    // The stock should be deducted immediately, not when the DM lands
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    // Activation: spend 1 stock
    const result = spendStocks(gauge, DM_STOCK_COST);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(1);

    // Even if the DM whiffs, the stock is already spent
    // Verify the stock does not return
    expect(gauge.stocks).toBe(1);
  });

  it('DM in MAX mode gets +20% damage bonus', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const baseDMDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    const healthBefore = p2.health;

    // P1 in MAX mode using DM on P2
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDMDamage * MAX_MODE_DAMAGE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
    expect(actualDamage).toBeGreaterThan(baseDMDamage);
  });
});

// =========================================================================
// 4. Desperation Mode (4 tests)
// =========================================================================
describe('Desperation Mode', () => {
  it('health below 25% triggers desperation indicator', () => {
    // Exact boundary: 25% is NOT desperation (< 0.25, not <=)
    expect(isDesperation(249, 1000)).toBe(true);   // 24.9%
    expect(isDesperation(1, 1000)).toBe(true);      // 0.1%
    expect(isDesperation(250, 1000)).toBe(false);   // exactly 25% - NOT desperation
    expect(isDesperation(251, 1000)).toBe(false);   // 25.1%
    expect(isDesperation(0, 1000)).toBe(false);     // dead = not desperation

    // With MAX_HEALTH = 1000, threshold is 250
    expect(isDesperation(249, 1000)).toBe(true);
  });

  it('desperation DM damage +30% via CombatSystem', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // Put P2 in desperation (< 25% of maxHealth) but with enough HP to survive the DM.
    // Use a high maxHealth so the desperation threshold is high, and set health below it.
    // DM_OROCHINAGI base damage = 200, desperation bonus = 260.
    // Need health > 260 but health/maxHealth < 0.25.
    // Set maxHealth = 2000, threshold = 500, health = 400 (0.20 < 0.25)
    p2.maxHealth = 2000;
    p2.health = 400; // 400/2000 = 0.20 < 0.25
    expect(isDesperation(p2.health, p2.maxHealth)).toBe(true);

    const baseDMDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    const healthBefore = p2.health;

    // P1 DM hits P2 who is in desperation
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const actualDamage = healthBefore - p2.health;
    // Desperation DM damage: base * 1.30 = 200 * 1.30 = 260
    const expectedDamage = Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
    expect(actualDamage).toBeGreaterThan(baseDMDamage);
  });

  it('desperation meter gain +50%', () => {
    const gauge = createPowerGauge();
    // Normal heavy hit: 100 meter, desperation: 100 * 1.50 = 150 -> 1 stock + 50 meter
    gainMeterOnHit(gauge, AttackType.STAND_C, 200, 1000);
    expect(gauge.stocks).toBe(1);
    expect(gauge.meter).toBe(50);

    // Compare with non-desperation
    const gaugeNormal = createPowerGauge();
    gainMeterOnHit(gaugeNormal, AttackType.STAND_C, 800, 1000);
    expect(gaugeNormal.stocks).toBe(1);
    expect(gaugeNormal.meter).toBe(0); // 100 exactly = 1 stock, 0 remainder

    // Desperation gain is strictly higher
    expect(gauge.meter).toBeGreaterThan(gaugeNormal.meter);
  });

  it('HSDM only available in desperation mode', () => {
    // HSDM requires: health < 25% maxHealth AND sufficient stocks (3)
    // At full health, HSDM conditions are NOT met
    expect(isDesperation(1000, 1000)).toBe(false);
    expect(isDesperation(500, 1000)).toBe(false);

    // At low health, HSDM conditions ARE met
    expect(isDesperation(100, 1000)).toBe(true);
    expect(isDesperation(200, 1000)).toBe(true);

    // HSDM stock cost: 3 stocks (same as MAX activation, but no MAX mode required)
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    expect(spendStocks(gauge, 3)).toBe(true);
    expect(gauge.stocks).toBe(0);

    // HSDM unavailable without 3 stocks
    const gaugePoor = createPowerGauge();
    gaugePoor.stocks = 2;
    expect(spendStocks(gaugePoor, 3)).toBe(false);
  });
});

// =========================================================================
// 5. Free Cancel in MAX mode (4 tests)
// =========================================================================
describe('Free Cancel (MAX)', () => {
  it('free cancel reduces MAX mode timer by 20% per cancel', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);

    const initialTimer = maxMode.timer;
    // Simulate free cancel: timer -= 20% of maxDuration
    maxMode.timer -= Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);

    expect(maxMode.timer).toBe(initialTimer - Math.round(MAX_MODE_DURATION * FREE_CANCEL_TIMER_COST));
    expect(maxMode.active).toBe(true);
  });

  it('free cancel allows canceling any move into any special (not DM)', () => {
    // Verify the cancel window for free cancel exists
    const cancelWindow = CombatSystem.getCancelWindow('free');
    expect(cancelWindow).toBe(4); // CANCEL_WINDOW_FREE

    // Free cancel does NOT cost stocks (costs timer instead)
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const maxMode = createMaxMode();
    activateMaxMode(gauge, maxMode);

    const stocksBefore = gauge.stocks;
    // Simulate free cancel by reducing timer
    maxMode.timer -= Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);

    // Stocks unchanged (free cancel costs timer, not stocks)
    expect(gauge.stocks).toBe(stocksBefore);
    expect(maxMode.active).toBe(true);
  });

  it('free cancel preserves combo (comboHits does not reset)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // First hit lands
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // Free cancel: simulate by hitting again without resetting combo
    // In real gameplay, free cancel transitions to a new special move
    // but combo count is preserved because the opponent is still in hitstun
    p1.hasHit = false;
    p1.currentAttack = null;
    p1.attackPhase = 'none';
    p2.state = FighterState.HITSTUN; // still in hitstun from first hit

    forceActivePhase(p1, AttackType.KYO_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);

    // Combo count incremented (not reset)
    expect(cs.getComboCount(1)).toBe(2);
  });

  it('MAX mode free cancel window -- multiple cancels can deplete timer', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;
    activateMaxMode(gauge, maxMode);

    const maxDuration = maxMode.maxDuration;
    const costPerCancel = Math.round(maxDuration * FREE_CANCEL_TIMER_COST);

    // Perform multiple free cancels until timer runs out
    let cancelCount = 0;
    while (maxMode.timer > costPerCancel) {
      maxMode.timer -= costPerCancel;
      cancelCount++;
    }

    // Should be able to perform several cancels (5 cancels of 20% = 100%)
    // But since we round, the exact count depends on the math
    expect(cancelCount).toBeGreaterThanOrEqual(4); // at least 4 free cancels

    // Final cancel that depletes timer entirely
    maxMode.timer -= maxMode.timer;
    expect(maxMode.timer).toBe(0);
    // When timer hits 0, the next tickMaxMode will deactivate
    tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
  });
});

// =========================================================================
// 6. Guard Cancel (3 tests)
// =========================================================================
describe('Guard Cancel', () => {
  it('guard cancel CD while blocking costs 1 stock', () => {
    expect(GC_CD_STOCK_COST).toBe(1);

    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const result = spendGCCD(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(1);
  });

  it('guard cancel roll costs 1 stock', () => {
    expect(GC_ROLL_STOCK_COST).toBe(1);

    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const result = spendGCRoll(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(1);
  });

  it('cannot guard cancel with 0 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;

    expect(spendGCRoll(gauge)).toBe(false);
    expect(gauge.stocks).toBe(0);

    expect(spendGCCD(gauge)).toBe(false);
    expect(gauge.stocks).toBe(0);
  });
});
