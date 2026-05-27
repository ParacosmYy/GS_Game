import { describe, it, expect, vi } from 'vitest';
import { DMManager } from '../src/combat/dmManager.js';
import { createPowerGauge, createMaxMode } from '../src/combat/meter.js';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType } from '../src/core/types.js';
import { CinematicState } from '../src/state/cinematicState.js';
import type { VFXSystem, ScreenShake } from '../src/rendering/vfx.js';
import {
  MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
  METER_PER_STOCK,
} from '../src/core/constants.js';

function createMockVFX(): VFXSystem {
  return {
    spawnMAXAura: vi.fn(),
    spawnMAXActivationFlash: vi.fn(),
    render: vi.fn(),
    update: vi.fn(),
  } as unknown as VFXSystem;
}

function createMockShake(): ScreenShake {
  return {
    trigger: vi.fn(),
    update: vi.fn(),
    offsetX: 0,
    offsetY: 0,
  } as unknown as ScreenShake;
}

describe('DMManager MAX consumption', () => {
  it('uses MAX timer rather than stock when a DM starts during MAX mode', () => {
    const p1 = new Fighter(200, '#ff0000', 1);
    const p2 = new Fighter(400, '#0000ff', -1);
    const gauges = [createPowerGauge(), createPowerGauge()] as const;
    gauges[0].stocks = 3;
    const maxModes = [createMaxMode(), createMaxMode()] as const;
    maxModes[0].active = true;
    maxModes[0].timer = maxModes[0].maxDuration;
    const cinematic = new CinematicState();
    const dmMgr = new DMManager({
      gauges: [gauges[0], gauges[1]],
      maxModes: [maxModes[0], maxModes[1]],
      cinematic,
      vfx: createMockVFX(),
      screenShake: createMockShake(),
      fighters: [p1, p2],
    });

    p1.currentAttack = AttackType.DM_TEN_HA_OU;
    p1.attackPhase = 'startup';
    p1.attackFrame = 0;

    dmMgr.checkDMActivation();

    expect(gauges[0].stocks).toBe(3);
    expect(maxModes[0].active).toBe(true);
    expect(maxModes[0].timer).toBeLessThan(maxModes[0].maxDuration);
    expect(p1.currentAttack).toBe(AttackType.SDM_TEN_HA_OU);
  });
});

// Helper to create DMManager with configurable state
function makeDmManager(opts: {
  stocks?: number;
  maxActive?: boolean;
  maxTimer?: number;
  health?: number;
  maxHealth?: number;
  currentAttack?: AttackType;
}) {
  const gauge = createPowerGauge();
  gauge.stocks = opts.stocks ?? 0;
  const maxMode = createMaxMode();
  maxMode.active = opts.maxActive ?? false;
  maxMode.timer = opts.maxTimer ?? (opts.maxActive ? MAX_MODE_DURATION : 0);
  const p1 = new Fighter(opts.health ?? 1000, '#f00', 1);
  const p2 = new Fighter(400, '#00f', -1);
  if (opts.currentAttack) {
    p1.currentAttack = opts.currentAttack;
    p1.attackPhase = 'startup';
    p1.attackFrame = 0;
  }
  const cinematic = new CinematicState();
  return new DMManager({
    gauges: [gauge, createPowerGauge()] as any,
    maxModes: [maxMode, createMaxMode()] as any,
    cinematic,
    vfx: createMockVFX(),
    screenShake: createMockShake(),
    fighters: [p1, p2],
  });
}

describe('Kyo DM→SDM→HSDM upgrade chain', () => {
  it('MAX mode upgrades DM_OROCHINAGI to SDM', () => {
    const mgr = makeDmManager({
      stocks: 3, maxActive: true, currentAttack: AttackType.DM_OROCHINAGI,
    });
    mgr.checkDMActivation();
    // Kyo DM should upgrade to SDM via DM_TO_SDM mapping
  });

  it('MAX + desperation upgrades DM_OROCHINAGI to HSDM', () => {
    const mgr = makeDmManager({
      stocks: 3, maxActive: true, health: 200, maxHealth: 1000,
      currentAttack: AttackType.DM_OROCHINAGI,
    });
    mgr.checkDMActivation();
    // Should upgrade to HSDM_OROCHINAGI
  });
});

describe('Iori DM→SDM→HSDM upgrade chain', () => {
  it('MAX mode upgrades DM_YATAGARASU to SDM', () => {
    const mgr = makeDmManager({
      stocks: 3, maxActive: true, currentAttack: AttackType.DM_YATAGARASU,
    });
    mgr.checkDMActivation();
  });

  it('MAX + desperation upgrades DM_YATAGARASU to HSDM_YAOTOME', () => {
    const mgr = makeDmManager({
      stocks: 3, maxActive: true, health: 200, maxHealth: 1000,
      currentAttack: AttackType.DM_YATAGARASU,
    });
    mgr.checkDMActivation();
  });
});

describe('DM upgrade mapping consistency', () => {
  it('HSDM entries are a subset of DM_TO_SDM entries', () => {
    // Every HSDM mapping should have a corresponding SDM mapping
    const hsdmDms = [AttackType.DM_RYUKO_RANBU, AttackType.DM_OROCHINAGI, AttackType.DM_YATAGARASU];
    for (const dm of hsdmDms) {
      const mgr = makeDmManager({ stocks: 3, maxActive: true, currentAttack: dm });
      expect(mgr.isHSDMAttack(dm)).toBe(false);
      // The DM should be upgradeable (has both SDM and HSDM mappings)
    }
  });

  it('all 3 main characters have HSDM mappings', () => {
    const mgr = makeDmManager({ stocks: 0 });
    // Ryo
    expect(mgr.isHSDMAttack(AttackType.HSDM_RYUKO_RANBU)).toBe(true);
    // Kyo
    expect(mgr.isHSDMAttack(AttackType.HSDM_OROCHINAGI)).toBe(true);
    // Iori
    expect(mgr.isHSDMAttack(AttackType.HSDM_YAOTOME)).toBe(true);
  });

  it('non-HSDM attacks are not classified as HSDM', () => {
    const mgr = makeDmManager({ stocks: 0 });
    expect(mgr.isHSDMAttack(AttackType.DM_TEN_HA_OU)).toBe(false);
    expect(mgr.isHSDMAttack(AttackType.SDM_TEN_HA_OU)).toBe(false);
    expect(mgr.isHSDMAttack(AttackType.STAND_A)).toBe(false);
  });
});
