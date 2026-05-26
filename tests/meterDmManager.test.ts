import { describe, it, expect } from 'vitest';
import {
  createPowerGauge,
  createMaxMode,
  isDesperation,
  gainMeterOnHit,
  gainMeterOnBlock,
  gainMeterOnWhiff,
  gainMeterOnHitstun,
  spendStocks,
  spendGCRoll,
  spendGCCD,
  activateMaxMode,
  tickMaxMode,
  drainMaxModeTimer,
  tickAutoMeter,
  resetMeterSystem,
  drainMeterByTaunt,
} from '../src/combat/meter.js';
import { DMManager } from '../src/combat/dmManager.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { AttackType } from '../src/core/types.js';
import {
  MAX_STOCKS,
  METER_PER_STOCK,
  DM_STOCK_COST,
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_METER_GAIN_BONUS,
  GC_ROLL_STOCK_COST,
  GC_CD_STOCK_COST,
} from '../src/core/constants.js';

// ─── Meter system ───────────────────────────────────────────────

describe('PowerGauge creation', () => {
  it('initialises at zero meter and zero stocks', () => {
    const g = createPowerGauge();
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(0);
    expect(g.maxMeter).toBe(METER_PER_STOCK);
  });
});

describe('MaxMode creation', () => {
  it('initialises inactive with zero timer', () => {
    const m = createMaxMode();
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
    expect(m.maxDuration).toBe(MAX_MODE_DURATION);
  });
});

describe('isDesperation', () => {
  it('returns true when health < 25% of maxHealth', () => {
    expect(isDesperation(200, 1000)).toBe(true);
    expect(isDesperation(249, 1000)).toBe(true);
  });

  it('returns false when health >= 25%', () => {
    expect(isDesperation(250, 1000)).toBe(false);
    expect(isDesperation(500, 1000)).toBe(false);
  });

  it('handles edge cases', () => {
    expect(isDesperation(0, 1000)).toBe(false);
    expect(isDesperation(100, 0)).toBe(false);
  });
});

describe('gainMeterOnHit', () => {
  it('gains meter and converts to stock at METER_PER_STOCK', () => {
    const g = createPowerGauge();
    // STAND_C = heavy baseline = 1x METER_GAIN_HIT = 100
    gainMeterOnHit(g, AttackType.STAND_C);
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(1);
  });

  it('light attacks give 60% of base', () => {
    const g = createPowerGauge();
    gainMeterOnHit(g, AttackType.STAND_A);
    expect(g.meter).toBe(60);
    expect(g.stocks).toBe(0);
  });

  it('applies desperation bonus when low health', () => {
    const g = createPowerGauge();
    gainMeterOnHit(g, AttackType.STAND_C, 100, 1000);
    // base=100, desperation bonus=1.5x => 150
    expect(g.meter).toBe(50);
    expect(g.stocks).toBe(1);
  });

  it('caps at MAX_STOCKS', () => {
    const g = createPowerGauge();
    g.stocks = MAX_STOCKS;
    gainMeterOnHit(g, AttackType.STAND_C);
    expect(g.stocks).toBe(MAX_STOCKS);
    expect(g.meter).toBeLessThan(METER_PER_STOCK);
  });
});

describe('gainMeterOnBlock', () => {
  it('gains reduced meter on block', () => {
    const g = createPowerGauge();
    gainMeterOnBlock(g, AttackType.STAND_C);
    // block base=20, heavy=1x => 20
    expect(g.meter).toBe(20);
    expect(g.stocks).toBe(0);
  });
});

describe('gainMeterOnWhiff', () => {
  it('normals give zero meter on whiff', () => {
    const g = createPowerGauge();
    gainMeterOnWhiff(g, AttackType.STAND_C);
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(0);
  });

  it('specials give meter on whiff', () => {
    const g = createPowerGauge();
    gainMeterOnWhiff(g, AttackType.SPECIAL_UPPER);
    expect(g.meter).toBeGreaterThan(0);
  });
});

describe('gainMeterOnHitstun', () => {
  it('defender gains meter when hit', () => {
    const g = createPowerGauge();
    gainMeterOnHitstun(g, AttackType.STAND_C);
    // hitstun base=50, heavy=1x => 50
    expect(g.meter).toBe(50);
    expect(g.stocks).toBe(0);
  });
});

describe('spendStocks', () => {
  it('spends stocks when available', () => {
    const g = createPowerGauge();
    g.stocks = 3;
    expect(spendStocks(g, 1)).toBe(true);
    expect(g.stocks).toBe(2);
  });

  it('fails when not enough stocks', () => {
    const g = createPowerGauge();
    g.stocks = 0;
    expect(spendStocks(g, 1)).toBe(false);
  });
});

describe('spendGCRoll / spendGCCD', () => {
  it('spends correct stock cost for GC Roll', () => {
    const g = createPowerGauge();
    g.stocks = GC_ROLL_STOCK_COST;
    expect(spendGCRoll(g)).toBe(true);
    expect(g.stocks).toBe(0);
  });

  it('spends correct stock cost for GC CD', () => {
    const g = createPowerGauge();
    g.stocks = GC_CD_STOCK_COST;
    expect(spendGCCD(g)).toBe(true);
    expect(g.stocks).toBe(0);
  });
});

describe('activateMaxMode', () => {
  it('activates when enough stocks', () => {
    const g = createPowerGauge();
    g.stocks = MAX_MODE_STOCK_COST;
    const m = createMaxMode();
    expect(activateMaxMode(g, m)).toBe(true);
    expect(m.active).toBe(true);
    expect(m.timer).toBe(MAX_MODE_DURATION);
    expect(g.stocks).toBe(0);
  });

  it('fails when not enough stocks', () => {
    const g = createPowerGauge();
    g.stocks = 1;
    const m = createMaxMode();
    expect(activateMaxMode(g, m)).toBe(false);
    expect(m.active).toBe(false);
  });

  it('fails when already active', () => {
    const g = createPowerGauge();
    g.stocks = MAX_MODE_STOCK_COST;
    const m = createMaxMode();
    m.active = true;
    expect(activateMaxMode(g, m)).toBe(false);
  });
});

describe('tickMaxMode', () => {
  it('counts down and deactivates when timer reaches zero', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = 3;
    tickMaxMode(m);
    expect(m.timer).toBe(2);
    expect(m.active).toBe(true);
    tickMaxMode(m);
    tickMaxMode(m);
    expect(m.timer).toBe(0);
    expect(m.active).toBe(false);
  });

  it('does nothing when inactive', () => {
    const m = createMaxMode();
    tickMaxMode(m);
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
  });
});

describe('drainMaxModeTimer', () => {
  it('drains a ratio of maxDuration and deactivates when depleted', () => {
    const m = createMaxMode();
    m.active = true;
    m.timer = MAX_MODE_DURATION;
    // drain 100% of maxDuration
    drainMaxModeTimer(m, 1.0);
    expect(m.timer).toBe(0);
    expect(m.active).toBe(false);
  });

  it('returns false when not active', () => {
    const m = createMaxMode();
    expect(drainMaxModeTimer(m, 0.2)).toBe(false);
  });
});

describe('tickAutoMeter', () => {
  it('slowly fills meter and converts to stocks', () => {
    const g1 = createPowerGauge();
    const g2 = createPowerGauge();
    // tick enough times to fill one stock (METER_PER_STOCK ticks)
    for (let i = 0; i < METER_PER_STOCK; i++) {
      tickAutoMeter([g1, g2]);
    }
    expect(g1.stocks).toBe(1);
    expect(g2.stocks).toBe(1);
  });

  it('stops at MAX_STOCKS', () => {
    const g = createPowerGauge();
    g.stocks = MAX_STOCKS;
    const before = g.stocks;
    tickAutoMeter([g, createPowerGauge()]);
    expect(g.stocks).toBe(before);
  });
});

describe('resetMeterSystem', () => {
  it('resets both gauge and max mode', () => {
    const g = createPowerGauge();
    g.meter = 50;
    g.stocks = 3;
    const m = createMaxMode();
    m.active = true;
    m.timer = 100;
    resetMeterSystem(g, m);
    expect(g.meter).toBe(0);
    expect(g.stocks).toBe(0);
    expect(m.active).toBe(false);
    expect(m.timer).toBe(0);
  });
});

describe('drainMeterByTaunt', () => {
  it('drains meter from opponent with stocks', () => {
    const g = createPowerGauge();
    g.stocks = 2;
    g.meter = 50;
    drainMeterByTaunt(g);
    // should have drained some meter
    expect(g.stocks + g.meter / METER_PER_STOCK).toBeLessThan(2.5);
  });

  it('drains partial meter when no stocks', () => {
    const g = createPowerGauge();
    g.meter = 80;
    drainMeterByTaunt(g);
    expect(g.meter).toBeLessThan(80);
    expect(g.meter).toBeGreaterThanOrEqual(0);
  });
});

// ─── DM Manager — Ryo DM types ──────────────────────────────────

describe('DM Manager — Ryo DM type recognition', () => {
  it('recognises Ryo DM AttackTypes as valid AttackType values', () => {
    const ryoDMs = [
      AttackType.DM_TEN_HA_OU,
      AttackType.DM_RYUKO_RANBU,
    ];
    for (const dm of ryoDMs) {
      expect(dm.startsWith('DM_')).toBe(true);
    }
  });

  it('recognises Ryo SDM AttackTypes', () => {
    const ryoSDMs = [
      AttackType.SDM_TEN_HA_OU,
      AttackType.SDM_RYUKO_RANBU,
    ];
    for (const sdm of ryoSDMs) {
      expect(sdm.startsWith('SDM_')).toBe(true);
    }
  });

  it('recognises Ryo HSDM AttackType', () => {
    expect(AttackType.HSDM_RYUKO_RANBU.startsWith('HSDM_')).toBe(true);
  });

  it('Ryo has exactly 2 DMs, 2 SDMs, and 1 HSDM', () => {
    const ryoAttacks = Object.values(AttackType).filter(a => {
      const s = a as string;
      return s.includes('TEN_HA_OU') || s.includes('RYUKO_RANBU');
    });
    const dms = ryoAttacks.filter(a => a.startsWith('DM_'));
    const sdms = ryoAttacks.filter(a => a.startsWith('SDM_'));
    const hsdms = ryoAttacks.filter(a => a.startsWith('HSDM_'));
    expect(dms.length).toBe(2);
    expect(sdms.length).toBe(2);
    expect(hsdms.length).toBe(1);
  });
});

describe('DM Manager — canUseDM / isHSDMAttack with mock deps', () => {
  // Minimal mock deps for DMManager
  function makeMockDeps(stockCount: number, maxActive = false, health = 1000, maxHealth = 1000) {
    const gauge: PowerGauge = { meter: 0, stocks: stockCount, maxMeter: METER_PER_STOCK };
    const maxMode: MaxModeState = { active: maxActive, timer: maxActive ? MAX_MODE_DURATION : 0, maxDuration: MAX_MODE_DURATION };
    const fighter = {
      health,
      maxHealth,
      currentAttack: undefined as AttackType | undefined,
      attackPhase: 'idle' as string,
      attackFrame: 0,
      x: 100,
      y: 200,
      displayHeight: 80,
      endAttack: () => {},
    };
    return {
      gauges: [gauge, createPowerGauge()] as [PowerGauge, PowerGauge],
      maxModes: [maxMode, createMaxMode()] as [MaxModeState, MaxModeState],
      cinematic: { triggerSuperFlash: () => {} } as any,
      vfx: { spawnMAXAura: () => {}, spawnMAXActivationFlash: () => {} } as any,
      screenShake: { trigger: () => {} } as any,
      fighters: [fighter, fighter] as any,
    };
  }

  it('canUseDM returns true with enough stocks', () => {
    const deps = makeMockDeps(DM_STOCK_COST);
    const mgr = new DMManager(deps);
    expect(mgr.canUseDM(0)).toBe(true);
  });

  it('canUseDM returns false with zero stocks', () => {
    const deps = makeMockDeps(0);
    const mgr = new DMManager(deps);
    expect(mgr.canUseDM(0)).toBe(false);
  });

  it('isHSDMAttack identifies HSDM correctly', () => {
    const deps = makeMockDeps(0);
    const mgr = new DMManager(deps);
    expect(mgr.isHSDMAttack(AttackType.HSDM_RYUKO_RANBU)).toBe(true);
    expect(mgr.isHSDMAttack(AttackType.DM_TEN_HA_OU)).toBe(false);
    expect(mgr.isHSDMAttack(AttackType.SDM_RYUKO_RANBU)).toBe(false);
  });

  it('canUseHSDM requires MAX mode + desperation', () => {
    const deps = makeMockDeps(3, true, 200, 1000);
    const mgr = new DMManager(deps);
    expect(mgr.canUseHSDM(0)).toBe(true);
  });

  it('canUseHSDM returns false without MAX mode', () => {
    const deps = makeMockDeps(3, false, 200, 1000);
    const mgr = new DMManager(deps);
    expect(mgr.canUseHSDM(0)).toBe(false);
  });

  it('canUseHSDM returns false without desperation', () => {
    const deps = makeMockDeps(3, true, 500, 1000);
    const mgr = new DMManager(deps);
    expect(mgr.canUseHSDM(0)).toBe(false);
  });
});

// ─── Meter + DM integration ─────────────────────────────────────

describe('Meter + DM activation flow', () => {
  it('can fill meter via hits and then spend on DM', () => {
    const g = createPowerGauge();
    // Fill to at least DM_STOCK_COST stocks
    for (let i = 0; i < DM_STOCK_COST; i++) {
      gainMeterOnHit(g, AttackType.STAND_C);
    }
    expect(g.stocks).toBeGreaterThanOrEqual(DM_STOCK_COST);
    expect(spendStocks(g, DM_STOCK_COST)).toBe(true);
  });

  it('Ryo DM activation: fill 3 stocks → activate MAX → drain timer', () => {
    const g = createPowerGauge();
    const m = createMaxMode();
    // Fill 3 stocks
    for (let i = 0; i < MAX_MODE_STOCK_COST; i++) {
      gainMeterOnHit(g, AttackType.STAND_C);
    }
    expect(g.stocks).toBe(MAX_MODE_STOCK_COST);
    // Activate MAX
    expect(activateMaxMode(g, m)).toBe(true);
    expect(m.active).toBe(true);
    // Drain entire timer
    drainMaxModeTimer(m, 1.0);
    expect(m.active).toBe(false);
  });
});
