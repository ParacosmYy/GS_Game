import { describe, it, expect, vi } from 'vitest';
import { DMManager } from '../src/combat/dmManager.js';
import { createPowerGauge, createMaxMode } from '../src/combat/meter.js';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType } from '../src/core/types.js';
import { CinematicState } from '../src/state/cinematicState.js';
import type { VFXSystem, ScreenShake } from '../src/rendering/vfx.js';

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
