import { describe, it, expect } from 'vitest';
import { RoundState, RoundTransitionPhase } from '../src/state/roundState.js';
import { Fighter } from '../src/entities/fighter.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { createPowerGauge, createMaxMode, MAX_MODE_DURATION } from '../src/combat/meter.js';
import type { PowerGauge, MaxmodeState } from '../src/core/types.js';

function makeDeps() {
  const p1 = new Fighter(200, '#ff0000', 1);
  const p2 = new Fighter(400, '#0000ff', -1);
  const gauges: [PowerGauge, any] = [createPowerGauge(), createPowerGauge()];
  const maxModes: [any, any] = [createMaxMode(), createMaxMode()];
  // Simulate MAX mode active at end of a round
  maxModes[0].active = true;
  maxModes[0].timer = MAX_MODE_DURATION;
  maxModes[1].active = true;
  maxModes[1].timer = MAX_MODE_DURATION / 2;
  // Add gauge stocks to verify they survive reset
  gauges[0].stocks = 2;
  gauges[0].meter = 500;
  gauges[1].stocks = 1;
  gauges[1].meter = 300;

  return {
    p1, p2,
    p1Cmd: new CommandBuffer(),
    p2Cmd: new CommandBuffer(),
    combatSystem: new CombatSystem(),
    projectiles: [] as any[],
    vfx: { reset: () => {} } as any,
    cinematic: { resetForNewRound: () => {}, reset: () => {} } as any,
    gauges: gauges as any,
    maxModes: maxModes as any,
    tickRef: { value: 99 },
  };
}

describe('MAX mode round reset', () => {
  it('resetForNextRound deactivates MAX mode but preserves gauge stocks', () => {
    const deps = makeDeps();
    const rs = new RoundState(deps);

    rs.resetForNextRound();

    // MAX mode must be off for both players
    expect(deps.maxModes[0].active).toBe(false);
    expect(deps.maxModes[0].timer).toBe(0);
    expect(deps.maxModes[1].active).toBe(false);
    expect(deps.maxModes[1].timer).toBe(0);

    // Gauge stocks carry over (authentic KOF2002)
    expect(deps.gauges[0].stocks).toBe(2);
    expect(deps.gauges[0].meter).toBe(500);
    expect(deps.gauges[1].stocks).toBe(1);
    expect(deps.gauges[1].meter).toBe(300);
  });

  it('fullReset clears MAX mode and gauge completely', () => {
    const deps = makeDeps();
    const rs = new RoundState(deps);

    rs.fullReset();

    expect(deps.maxModes[0].active).toBe(false);
    expect(deps.maxModes[0].timer).toBe(0);
    expect(deps.maxModes[1].active).toBe(false);
    expect(deps.maxModes[1].timer).toBe(0);

    // Full reset zeros gauge
    expect(deps.gauges[0].stocks).toBe(0);
    expect(deps.gauges[0].meter).toBe(0);
    expect(deps.gauges[1].stocks).toBe(0);
    expect(deps.gauges[1].meter).toBe(0);
  });

  it('cinematic transition resets MAX mode at peak of fade', () => {
    const deps = makeDeps();
    const rs = new RoundState(deps);

    let peakFired = false;
    rs.startCinematicTransition(
      () => { peakFired = true; },
      () => {},
      'wipe',
    );

    // Drive fade to black (peak)
    for (let i = 0; i < 30; i++) rs.tickFade();

    // At peak: MAX mode should be deactivated, callback fired
    expect(peakFired).toBe(true);
    expect(deps.maxModes[0].active).toBe(false);
    expect(deps.maxModes[1].active).toBe(false);

    // Stocks survive
    expect(deps.gauges[0].stocks).toBe(2);
    expect(deps.gauges[1].stocks).toBe(1);
  });

  it('legacy startRoundTransition resets MAX mode at fade peak', () => {
    const deps = makeDeps();
    const rs = new RoundState(deps);

    rs.startRoundTransition();

    // Drive fade to black
    for (let i = 0; i < 30; i++) rs.tickFade();

    expect(deps.maxModes[0].active).toBe(false);
    expect(deps.maxModes[1].active).toBe(false);
    expect(deps.gauges[0].stocks).toBe(2);
    expect(deps.gauges[1].stocks).toBe(1);
  });
});
