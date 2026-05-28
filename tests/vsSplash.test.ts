/**
 * VS Splash Screen Regression Test
 * Verifies drawVSSplash renders without errors for typical game states.
 */
import { describe, it, expect } from 'vitest';
import { drawVSSplash } from '../src/rendering/screens_split/vsSplash.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => { calls.push('strokeRect'); },
    rect: () => {},
    fillText: () => { calls.push('fillText'); },
    strokeText: () => {},
    measureText: () => ({ width: 10 }),
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
    closePath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => { calls.push('stroke'); },
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    clip: () => {},
    setLineDash: () => {},
    ellipse: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    drawImage: () => { calls.push('drawImage'); },
    fillStyle: '' as string,
    strokeStyle: '' as string,
    lineWidth: 1 as number,
    font: '' as string,
    textAlign: '' as string,
    textBaseline: '' as string,
    globalAlpha: 1 as number,
    globalCompositeOperation: 'source-over' as string,
    shadowBlur: 0 as number,
    shadowColor: '' as string,
    calls,
  };
}

function makeMockSelectState(vsTimer: number) {
  return {
    vsSplashTimer: vsTimer,
    p1CharIndex: 0,
    p2CharIndex: 1,
    p1Palette: 0,
    p2Palette: 0,
    confirmed: [true, true] as [boolean, boolean],
  } as any;
}

describe('VS Splash rendering', () => {
  it('renders with active timer without error', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(30);
    expect(() => drawVSSplash(ctx as any, state, 30, 'temple')).not.toThrow();
  });

  it('renders slash wipe during early frames', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(10);
    drawVSSplash(ctx as any, state, 10, 'temple');
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
    expect(ctx.calls).toContain('stroke');
  });

  it('renders with negative timer (early return)', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(-1);
    drawVSSplash(ctx as any, state, 0, 'temple');
    // Should return early with minimal calls
  });

  it('renders with different stages', () => {
    const stages = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];
    for (const stage of stages) {
      const ctx = makeMockCtx();
      const state = makeMockSelectState(30);
      expect(() => drawVSSplash(ctx as any, state, 30, stage as any), `stage ${stage}`).not.toThrow();
    }
  });

  it('renders with timer at maximum', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(120);
    expect(() => drawVSSplash(ctx as any, state, 120, 'temple')).not.toThrow();
  });

  it('generates canvas calls for text rendering', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(60);
    drawVSSplash(ctx as any, state, 60, 'temple');
    expect(ctx.calls).toContain('fillText');
  });

  it('generates background fill', () => {
    const ctx = makeMockCtx();
    const state = makeMockSelectState(60);
    drawVSSplash(ctx as any, state, 60, 'temple');
    expect(ctx.calls).toContain('fillRect');
  });
});
