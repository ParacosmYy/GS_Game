/**
 * Character Intro Animation State Machine Test
 * Verifies intro lifecycle: start → tick → complete, reset, state queries.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  startCharIntro,
  tickCharIntro,
  resetCharIntro,
  isIntroActive,
  drawCharIntro,
} from '../src/rendering/charIntro.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => {},
    rect: () => {},
    fillText: () => { calls.push('fillText'); },
    strokeText: () => {},
    measureText: () => ({ width: 10 }),
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
    closePath: () => {},
    arc: () => { calls.push('arc'); },
    fill: () => { calls.push('fill'); },
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    clip: () => {},
    setLineDash: () => {},
    ellipse: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    roundRect: () => {},
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

describe('Char Intro — lifecycle', () => {
  beforeEach(() => {
    resetCharIntro();
  });

  it('not active after reset', () => {
    expect(isIntroActive()).toBe(false);
  });

  it('active after start', () => {
    startCharIntro('kyo', 'iori');
    expect(isIntroActive()).toBe(true);
  });

  it('deactivates after 60 ticks', () => {
    startCharIntro('ryo', 'kyo');
    for (let i = 0; i < 61; i++) tickCharIntro();
    expect(isIntroActive()).toBe(false);
  });

  it('still active at tick 59', () => {
    startCharIntro('ryo', 'iori');
    for (let i = 0; i < 59; i++) tickCharIntro();
    expect(isIntroActive()).toBe(true);
  });

  it('reset during active intro clears state', () => {
    startCharIntro('kyo', 'iori');
    for (let i = 0; i < 30; i++) tickCharIntro();
    resetCharIntro();
    expect(isIntroActive()).toBe(false);
  });

  it('multiple start+reset cycles work', () => {
    for (let i = 0; i < 3; i++) {
      startCharIntro('ryo', 'kyo');
      expect(isIntroActive()).toBe(true);
      resetCharIntro();
      expect(isIntroActive()).toBe(false);
    }
  });

  it('drawCharIntro renders during active intro for kyo', () => {
    startCharIntro('kyo', 'iori');
    for (let i = 0; i < 10; i++) tickCharIntro();
    const ctx = makeMockCtx();
    // P1 = kyo (left), P2 = iori (right)
    drawCharIntro(ctx as any, 'kyo', 200, 300, 1, 'iori', 600, 300, -1);
    // Should have some rendering activity (particles, arcs)
    expect(ctx.calls.length).toBeGreaterThan(0);
  });

  it('drawCharIntro renders ryo vs iori', () => {
    startCharIntro('ryo', 'iori');
    for (let i = 0; i < 15; i++) tickCharIntro();
    const ctx = makeMockCtx();
    expect(() => drawCharIntro(ctx as any, 'ryo', 200, 300, 1, 'iori', 600, 300, -1)).not.toThrow();
  });

  it('drawCharIntro with unknown char does not crash', () => {
    startCharIntro('unknown', 'also_unknown');
    for (let i = 0; i < 10; i++) tickCharIntro();
    const ctx = makeMockCtx();
    expect(() => drawCharIntro(ctx as any, 'unknown', 200, 300, 1, 'unknown2', 600, 300, -1)).not.toThrow();
  });

  it('drawCharIntro after completion produces no rendering', () => {
    startCharIntro('kyo', 'iori');
    for (let i = 0; i < 70; i++) tickCharIntro();
    const ctx = makeMockCtx();
    drawCharIntro(ctx as any, 'kyo', 200, 300, 1, 'iori', 600, 300, -1);
    // No arc calls since intro is done
    const arcCalls = ctx.calls.filter(c => c === 'arc');
    expect(arcCalls.length).toBe(0);
  });

  it('tick without start is a no-op', () => {
    resetCharIntro();
    tickCharIntro();
    expect(isIntroActive()).toBe(false);
  });
});
