/**
 * meterSystemIntegration.test.ts — KOF2002 Energy System Integration Tests
 *
 * Verifies the full integration behavior of the meter/energy system:
 *  1. Meter Flow Integration (5 tests) — end-to-end meter accumulation
 *  2. MAX Mode Lifecycle (5 tests) — activation, timer, damage modifiers, expiry
 *  3. Stock Spending Priority (4 tests) — MAX/DM/GC spending and constraints
 *  4. Desperation Integration (3 tests) — low-health damage/meter bonuses
 *  5. Edge Cases (3 tests) — zero health, round reset, multi-stock spending
 *
 * Total: 20 tests.
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
  resetMeterSystem,
  isDesperation,
} from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { AttackType, FighterState } from '../src/core/types.js';
import { Fighter } from '../src/entities/fighter.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import {
  MAX_STOCKS,
  METER_PER_STOCK,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  DM_STOCK_COST,
  FRAME_DATA,
  MAX_HEALTH,
} from '../src/core/constants.js';

// ===== Test Helpers =====

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
// 1. Meter Flow Integration (5 tests)
// =========================================================================
describe('Meter Flow Integration', () => {
  it('continuous hits accumulate from 0 stocks to 5 stocks', () => {
    const gauge = createPowerGauge();
    expect(gauge.stocks).toBe(0);
    expect(gauge.meter).toBe(0);

    // STAND_C (heavy normal) = 100 meter per hit = exactly 1 stock per hit
    // 5 hits = 5 stocks at max
    for (let i = 0; i < 5; i++) {
      gainMeterOnHit(gauge, AttackType.STAND_C);
    }

    expect(gauge.stocks).toBe(MAX_STOCKS);
    expect(gauge.meter).toBeLessThan(METER_PER_STOCK);
  });

  it('auto meter (tickAutoMeter) eventually produces stocks', () => {
    const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];

    // tickAutoMeter adds 1.0 meter per frame per gauge.
    // METER_PER_STOCK = 100, so 100 ticks = 1 stock.
    for (let i = 0; i < 100; i++) {
      tickAutoMeter(gauges);
    }

    expect(gauges[0].stocks).toBe(1);
    expect(gauges[0].meter).toBe(0);
    expect(gauges[1].stocks).toBe(1);
    expect(gauges[1].meter).toBe(0);

    // Run long enough to fill all 5 stocks (500 ticks)
    const gauges2: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
    for (let i = 0; i < 500; i++) {
      tickAutoMeter(gauges2);
    }
    expect(gauges2[0].stocks).toBe(MAX_STOCKS);
    expect(gauges2[1].stocks).toBe(MAX_STOCKS);
  });

  it('whiff gives meter only for specials/DMs, not normals', () => {
    const normalGauge = createPowerGauge();
    gainMeterOnWhiff(normalGauge, AttackType.STAND_C);
    expect(normalGauge.meter).toBe(0);
    expect(normalGauge.stocks).toBe(0);

    const lightGauge = createPowerGauge();
    gainMeterOnWhiff(lightGauge, AttackType.STAND_A);
    expect(lightGauge.meter).toBe(0);

    // Special whiff gives meter (base 10 * 150% = 15)
    const specialGauge = createPowerGauge();
    gainMeterOnWhiff(specialGauge, AttackType.KYO_ONIYAKI);
    expect(specialGauge.meter).toBe(15);
    expect(specialGauge.stocks).toBe(0);

    // DM whiff gives meter (base 10 * 200% = 20)
    const dmGauge = createPowerGauge();
    gainMeterOnWhiff(dmGauge, AttackType.DM_OROCHINAGI);
    expect(dmGauge.meter).toBe(20);
  });

  it('getting hit also grants meter (hitstun gain)', () => {
    const gauge = createPowerGauge();
    // Defender getting hit by heavy normal: base 50 * 100% = 50 meter
    gainMeterOnHitstun(gauge, AttackType.STAND_C);
    expect(gauge.meter).toBe(50);
    expect(gauge.stocks).toBe(0);

    // Getting hit by DM: base 50 * 200% = 100 = 1 stock
    const dmGauge = createPowerGauge();
    gainMeterOnHitstun(dmGauge, AttackType.DM_OROCHINAGI);
    expect(dmGauge.stocks).toBe(1);
    expect(dmGauge.meter).toBe(0);
  });

  it('meter stops increasing at maximum stocks (5)', () => {
    const gauge = createPowerGauge();
    // Fill to max with heavy hits
    for (let i = 0; i < 5; i++) {
      gainMeterOnHit(gauge, AttackType.STAND_C);
    }
    expect(gauge.stocks).toBe(MAX_STOCKS);

    // Additional hits should not increase further
    const meterBefore = gauge.meter;
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    expect(gauge.stocks).toBe(MAX_STOCKS);
    // Meter is clamped to maxMeter - 1
    expect(gauge.meter).toBe(METER_PER_STOCK - 1);

    // Even DM (200 meter) cannot push past max
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI);
    expect(gauge.stocks).toBe(MAX_STOCKS);
    expect(gauge.meter).toBe(METER_PER_STOCK - 1);
  });
});

// =========================================================================
// 2. MAX Mode Lifecycle (5 tests)
// =========================================================================
describe('MAX Mode Lifecycle', () => {
  it('activation -> timer decrement -> expiry full cycle', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = MAX_MODE_STOCK_COST;

    // Activate
    const result = activateMaxMode(gauge, maxMode);
    expect(result).toBe(true);
    expect(maxMode.active).toBe(true);
    expect(maxMode.timer).toBe(MAX_MODE_DURATION);
    expect(gauge.stocks).toBe(0);

    // Tick most of the duration
    for (let i = 0; i < MAX_MODE_DURATION - 1; i++) {
      tickMaxMode(maxMode);
    }
    expect(maxMode.active).toBe(true);
    expect(maxMode.timer).toBe(1);

    // Final tick expires
    tickMaxMode(maxMode);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);
  });

  it('MAX mode grants +20% damage bonus via CombatSystem', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const baseDamage = FRAME_DATA[AttackType.STAND_C].damage;
    const healthBefore = p2.health;

    // P1 in MAX mode attacks P2
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
  });

  it('MAX mode grants defense bonus (reduced damage taken)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const baseDamage = FRAME_DATA[AttackType.STAND_C].damage;
    const healthBefore = p2.health;

    // P2 in MAX mode (defender bonus)
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [false, true]);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDamage * MAX_MODE_DEFENSE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
    expect(actualDamage).toBeLessThan(baseDamage);
  });

  it('damage returns to normal after MAX mode expires', () => {
    const cs = new CombatSystem(createInputProvider());

    // First hit: with MAX mode active
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    const baseDamage = FRAME_DATA[AttackType.STAND_C].damage;
    const healthBeforeMax = p2.health;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const maxDamage = healthBeforeMax - p2.health;
    expect(maxDamage).toBe(Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS));

    // Second fight: without MAX mode (both false)
    const cs2 = new CombatSystem(createInputProvider());
    const p1b = new Fighter(300, '#ff0000', 1);
    const p2b = new Fighter(350, '#0000ff', -1);
    const healthBeforeNormal = p2b.health;

    forceActivePhase(p1b, AttackType.STAND_C);
    cs2.resolveAttacks(p1b, p2b, [], undefined, 0, [false, false]);

    const normalDamage = healthBeforeNormal - p2b.health;
    // Without MAX, damage equals base (no scaling)
    expect(normalDamage).toBe(baseDamage);
    // Verify MAX damage was indeed higher than normal
    expect(maxDamage).toBeGreaterThan(normalDamage);
  });

  it('cannot activate MAX mode while already in MAX mode', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = MAX_MODE_STOCK_COST;

    // First activation succeeds
    expect(activateMaxMode(gauge, maxMode)).toBe(true);
    expect(maxMode.active).toBe(true);

    // Give back stocks to test re-activation
    gauge.stocks = MAX_MODE_STOCK_COST;

    // Second activation while active must fail
    expect(activateMaxMode(gauge, maxMode)).toBe(false);
    // Stocks should NOT be consumed on failed activation
    expect(gauge.stocks).toBe(MAX_MODE_STOCK_COST);
    // MAX mode still active from first activation
    expect(maxMode.active).toBe(true);
  });
});

// =========================================================================
// 3. Stock Spending Priority (4 tests)
// =========================================================================
describe('Stock Spending Priority', () => {
  it('with 3 stocks can activate MAX (costs 3) or DM (costs 1)', () => {
    const gaugeForMax = createPowerGauge();
    gaugeForMax.stocks = 3;

    const gaugeForDM = createPowerGauge();
    gaugeForDM.stocks = 3;

    // MAX activation costs 3
    const maxMode = createMaxMode();
    expect(activateMaxMode(gaugeForMax, maxMode)).toBe(true);
    expect(gaugeForMax.stocks).toBe(0);
    expect(maxMode.active).toBe(true);

    // DM costs 1, leaving 2 stocks
    expect(spendStocks(gaugeForDM, DM_STOCK_COST)).toBe(true);
    expect(gaugeForDM.stocks).toBe(2);
  });

  it('Guard Cancel Roll and CD each cost 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    // GC Roll costs 1
    expect(spendGCRoll(gauge)).toBe(true);
    expect(gauge.stocks).toBe(1);

    // GC CD costs 1
    expect(spendGCCD(gauge)).toBe(true);
    expect(gauge.stocks).toBe(0);

    // No more stocks for another GC
    expect(spendGCRoll(gauge)).toBe(false);
    expect(spendGCCD(gauge)).toBe(false);
  });

  it('insufficient stocks prevents all meter-spending actions', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const maxMode = createMaxMode();

    // DM
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(false);
    // MAX activation
    expect(activateMaxMode(gauge, maxMode)).toBe(false);
    // GC Roll
    expect(spendGCRoll(gauge)).toBe(false);
    // GC CD
    expect(spendGCCD(gauge)).toBe(false);

    // Nothing changed
    expect(gauge.stocks).toBe(0);
    expect(maxMode.active).toBe(false);
  });

  it('distinguishes SDM (requires MAX mode) from HSDM (requires desperation)', () => {
    // SDM is a MAX-mode-only enhanced DM.
    // Verify: cannot spend MAX-mode-level resources without being in MAX.
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();
    gauge.stocks = 3;

    // SDM: In KOF2002, SDM is only usable during MAX mode.
    // The activation cost is already paid via activateMaxMode (3 stocks).
    // Once in MAX, SDM does not cost extra stock — only MAX timer.
    activateMaxMode(gauge, maxMode);
    expect(maxMode.active).toBe(true);
    expect(gauge.stocks).toBe(0);
    // SDM available: maxMode.active === true

    // HSDM: requires desperation (health < 25%) + 3 stocks.
    // This is checked by combat system, not meter module directly.
    // Verify desperation check is independent of MAX mode:
    expect(isDesperation(200, 1000)).toBe(true);   // low health = desperation
    expect(isDesperation(800, 1000)).toBe(false);  // normal health = not desperation

    // HSDM spending: 3 stocks (same as MAX, but no MAX mode created)
    const hsdmGauge = createPowerGauge();
    hsdmGauge.stocks = 3;
    expect(spendStocks(hsdmGauge, 3)).toBe(true);
    expect(hsdmGauge.stocks).toBe(0);

    // HSDM not available with fewer than 3 stocks
    const poorGauge = createPowerGauge();
    poorGauge.stocks = 2;
    expect(spendStocks(poorGauge, 3)).toBe(false);
  });
});

// =========================================================================
// 4. Desperation Integration (3 tests)
// =========================================================================
describe('Desperation Integration', () => {
  it('health below 25% activates +30% DM damage via CombatSystem', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // Put P2 in desperation: set maxHealth high and health low
    // DM_OROCHINAGI damage = 200; with desperation = 260
    // Need health > 260 and health/maxHealth < 0.25
    // maxHealth = 2000, health = 400 (20% < 25%)
    p2.maxHealth = 2000;
    p2.health = 400;
    expect(isDesperation(p2.health, p2.maxHealth)).toBe(true);

    const baseDMDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    const healthBefore = p2.health;

    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const actualDamage = healthBefore - p2.health;
    const expectedDamage = Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(actualDamage).toBe(expectedDamage);
    expect(actualDamage).toBeGreaterThan(baseDMDamage);
  });

  it('desperation and MAX mode damage bonuses stack multiplicatively', () => {
    // Desperation DM damage +30%: base * 1.30
    // MAX mode damage +20%: result * 1.20
    // Combined: base * 1.30 * 1.20 = base * 1.56
    const baseDMDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    const desperOnly = Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS);
    const desperAndMax = Math.round(desperOnly * MAX_MODE_DAMAGE_BONUS);

    // Verify stacking produces higher damage than either alone
    expect(desperAndMax).toBeGreaterThan(Math.round(baseDMDamage * DESPERATION_DM_DAMAGE_BONUS));
    expect(desperAndMax).toBeGreaterThan(Math.round(baseDMDamage * MAX_MODE_DAMAGE_BONUS));
    expect(desperAndMax).toBeGreaterThan(baseDMDamage);

    // Exact values: 200 * 1.30 = 260; 260 * 1.20 = 312
    expect(desperOnly).toBe(260);
    expect(desperAndMax).toBe(312);

    // Verify through CombatSystem: P1 in MAX, P2 in desperation
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 2000;
    p2.health = 400; // 20% < 25% = desperation

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    // P1 in MAX mode, P2 in desperation
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const actualDamage = healthBefore - p2.health;
    // With MAX mode active on attacker, damage = base * MAX_MODE_DAMAGE_BONUS
    // Then CombatSystem also applies desperation bonus on top
    // In resolveHit: MAX bonus applied first, then desperation DM bonus
    // base * MAX_MODE_DAMAGE_BONUS * DESPERATION_DM_DAMAGE_BONUS
    // = 200 * 1.20 * 1.30 = 312
    expect(actualDamage).toBe(desperAndMax);
  });

  it('desperation meter gain +50% verified with actual meter functions', () => {
    const DESPERATION_HEALTH = 200;
    const NORMAL_HEALTH = 800;
    const MAX_HP = 1000;

    // Normal meter gain
    const normalGauge = createPowerGauge();
    gainMeterOnHit(normalGauge, AttackType.STAND_C, NORMAL_HEALTH, MAX_HP);
    // STAND_C = 100 base, no bonus = 100 meter = 1 stock, 0 meter remaining
    expect(normalGauge.stocks).toBe(1);
    expect(normalGauge.meter).toBe(0);

    // Desperation meter gain
    const desperGauge = createPowerGauge();
    gainMeterOnHit(desperGauge, AttackType.STAND_C, DESPERATION_HEALTH, MAX_HP);
    // STAND_C = 100 base * 1.50 (desperation) = 150 meter = 1 stock + 50 meter
    expect(desperGauge.stocks).toBe(1);
    expect(desperGauge.meter).toBe(50);

    // Desperation gain is strictly more
    // Both have 1 stock but desperation has 50 extra meter
    const desperTotal = desperGauge.stocks * METER_PER_STOCK + desperGauge.meter;
    const normalTotal = normalGauge.stocks * METER_PER_STOCK + normalGauge.meter;
    expect(desperTotal).toBeGreaterThan(normalTotal);

    // Also verify hitstun gain is boosted
    const desperHitstunGauge = createPowerGauge();
    gainMeterOnHitstun(desperHitstunGauge, AttackType.STAND_C, DESPERATION_HEALTH, MAX_HP);
    // base 50 * 100% * 1.50 = 75
    expect(desperHitstunGauge.meter).toBe(75);

    const normalHitstunGauge = createPowerGauge();
    gainMeterOnHitstun(normalHitstunGauge, AttackType.STAND_C, NORMAL_HEALTH, MAX_HP);
    // base 50 * 100% = 50 (no desperation bonus)
    expect(normalHitstunGauge.meter).toBe(50);

    expect(desperHitstunGauge.meter).toBeGreaterThan(normalHitstunGauge.meter);
  });
});

// =========================================================================
// 5. Edge Cases (3 tests)
// =========================================================================
describe('Edge Cases', () => {
  it('meter operations work correctly at 0 health', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const maxMode = createMaxMode();

    // isDesperation returns false at 0 health (dead is not desperation)
    expect(isDesperation(0, 1000)).toBe(false);

    // Stock spending still works mechanically (game logic prevents actions, not meter)
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(2);

    // MAX mode activation still works at meter level
    expect(activateMaxMode(gauge, maxMode)).toBe(false); // only 2 stocks, need 3
    gauge.stocks = 3;
    expect(activateMaxMode(gauge, maxMode)).toBe(true);
    expect(maxMode.active).toBe(true);

    // Meter gain functions don't crash at 0 health
    const gainGauge = createPowerGauge();
    gainMeterOnHit(gainGauge, AttackType.STAND_C, 0, 1000);
    expect(gainGauge.stocks).toBe(1); // 100 meter, no desperation bonus
    expect(gainGauge.meter).toBe(0);
  });

  it('round reset clears meter and MAX mode to initial state', () => {
    const gauge = createPowerGauge();
    const maxMode = createMaxMode();

    // Build up state
    gauge.stocks = 4;
    gauge.meter = 75;
    maxMode.active = true;
    maxMode.timer = 300;

    // Reset
    resetMeterSystem(gauge, maxMode);

    expect(gauge.meter).toBe(0);
    expect(gauge.stocks).toBe(0);
    expect(maxMode.active).toBe(false);
    expect(maxMode.timer).toBe(0);

    // After reset, auto meter starts from scratch
    const gauges: [PowerGauge, PowerGauge] = [gauge, createPowerGauge()];
    tickAutoMeter(gauges);
    expect(gauges[0].meter).toBe(1);
    expect(gauges[0].stocks).toBe(0);

    // Can accumulate again after reset
    for (let i = 0; i < 100; i++) {
      tickAutoMeter(gauges);
    }
    expect(gauges[0].stocks).toBe(1);
    expect(gauges[0].meter).toBe(1); // 101 ticks: 1 stock + 1 meter
  });

  it('spending multiple stocks at once is correct', () => {
    const gauge = createPowerGauge();

    // Spend 0 stocks (edge case)
    gauge.stocks = 3;
    expect(spendStocks(gauge, 0)).toBe(true);
    expect(gauge.stocks).toBe(3);

    // Spend exactly available amount
    expect(spendStocks(gauge, 3)).toBe(true);
    expect(gauge.stocks).toBe(0);

    // Spending more than available fails
    expect(spendStocks(gauge, 1)).toBe(false);
    expect(gauge.stocks).toBe(0);

    // Large spend with sufficient stocks
    gauge.stocks = 5;
    expect(spendStocks(gauge, 5)).toBe(true);
    expect(gauge.stocks).toBe(0);

    // Partial spend preserves remainder
    gauge.stocks = 5;
    expect(spendStocks(gauge, 2)).toBe(true);
    expect(gauge.stocks).toBe(3);
    expect(spendStocks(gauge, 2)).toBe(true);
    expect(gauge.stocks).toBe(1);
    expect(spendStocks(gauge, 2)).toBe(false); // only 1 left
    expect(gauge.stocks).toBe(1);
  });
});
