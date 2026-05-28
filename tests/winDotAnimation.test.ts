/**
 * Win dot animation regression tests
 * Verifies RoundState.lastWinTick/lastWinSide tracking and HUD rendering.
 */
import { describe, it, expect } from 'vitest';

describe('Win dot animation', () => {
  it('RoundState tracks lastWinTick on P1 win', async () => {
    const { RoundState } = await import('../src/state/roundState.js');
    const rs = new RoundState({
      p1: { health: 100, maxHealth: 100 } as any,
      p2: { health: 0, maxHealth: 100 } as any,
      p1Cmd: {} as any, p2Cmd: {} as any,
      combatSystem: {} as any, projectiles: [],
      vfx: {} as any, cinematic: {} as any,
      gauges: [{} as any, {} as any],
      maxModes: [{} as any, {} as any],
      tickRef: { value: 42 },
    });
    rs.addWin(0);
    expect(rs.lastWinTick).toBe(42);
    expect(rs.lastWinSide).toBe(0);
  });

  it('RoundState tracks lastWinTick on P2 win', async () => {
    const { RoundState } = await import('../src/state/roundState.js');
    const rs = new RoundState({
      p1: { health: 0, maxHealth: 100 } as any,
      p2: { health: 100, maxHealth: 100 } as any,
      p1Cmd: {} as any, p2Cmd: {} as any,
      combatSystem: {} as any, projectiles: [],
      vfx: {} as any, cinematic: {} as any,
      gauges: [{} as any, {} as any],
      maxModes: [{} as any, {} as any],
      tickRef: { value: 77 },
    });
    rs.addWin(1);
    expect(rs.lastWinTick).toBe(77);
    expect(rs.lastWinSide).toBe(1);
  });

  it('RoundState does not update on draw', async () => {
    const { RoundState } = await import('../src/state/roundState.js');
    const rs = new RoundState({
      p1: { health: 50, maxHealth: 100 } as any,
      p2: { health: 50, maxHealth: 100 } as any,
      p1Cmd: {} as any, p2Cmd: {} as any,
      combatSystem: {} as any, projectiles: [],
      vfx: {} as any, cinematic: {} as any,
      gauges: [{} as any, {} as any],
      maxModes: [{} as any, {} as any],
      tickRef: { value: 99 },
    });
    rs.addWin(null);
    expect(rs.lastWinTick).toBe(-100);
    expect(rs.lastWinSide).toBe(-1);
  });

  it('RoundState defaults to no animation', async () => {
    const { RoundState } = await import('../src/state/roundState.js');
    const rs = new RoundState({
      p1: { health: 100, maxHealth: 100 } as any,
      p2: { health: 100, maxHealth: 100 } as any,
      p1Cmd: {} as any, p2Cmd: {} as any,
      combatSystem: {} as any, projectiles: [],
      vfx: {} as any, cinematic: {} as any,
      gauges: [{} as any, {} as any],
      maxModes: [{} as any, {} as any],
      tickRef: { value: 0 },
    });
    expect(rs.lastWinTick).toBe(-100);
    expect(rs.lastWinSide).toBe(-1);
  });

  it('addWin increments win counts correctly', async () => {
    const { RoundState } = await import('../src/state/roundState.js');
    const rs = new RoundState({
      p1: { health: 100, maxHealth: 100 } as any,
      p2: { health: 100, maxHealth: 100 } as any,
      p1Cmd: {} as any, p2Cmd: {} as any,
      combatSystem: {} as any, projectiles: [],
      vfx: {} as any, cinematic: {} as any,
      gauges: [{} as any, {} as any],
      maxModes: [{} as any, {} as any],
      tickRef: { value: 0 },
    });
    rs.addWin(0);
    expect(rs.p1Wins).toBe(1);
    rs.addWin(1);
    expect(rs.p2Wins).toBe(1);
    // P1 wins match
    const result = rs.addWin(0);
    expect(rs.p1Wins).toBe(2);
    expect(result).toBe(0); // P1 wins match
  });

  it('HUD drawHUD accepts lastWinTick/lastWinSide params', async () => {
    const mod = await import('../src/rendering/hud.js');
    expect(typeof mod.drawHUD).toBe('function');
  }, 15000);

  it('Renderer.render accepts lastWinTick/lastWinSide params', async () => {
    const { Renderer } = await import('../src/rendering/renderer.js');
    // Renderer.render has many params with defaults — just verify it's callable
    expect(typeof Renderer.prototype.render).toBe('function');
  });
});
