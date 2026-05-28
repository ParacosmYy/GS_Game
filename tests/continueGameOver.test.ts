/**
 * Continue / Game Over Screen Regression Test
 * Verifies drawContinue and drawGameOver render without errors.
 */
import { describe, it, expect } from 'vitest';
import { drawContinue, drawGameOver } from '../src/rendering/overlays/overlayContinueGameOver.js';

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
    fill: () => { calls.push('fill'); },
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

describe('Continue screen rendering', () => {
  it('renders with 10 seconds left, cursor on YES', () => {
    const ctx = makeMockCtx();
    expect(() => drawContinue(ctx as any, 10, true)).not.toThrow();
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
    expect(ctx.calls).toContain('fillRect');
  });

  it('renders with 1 second left (urgent)', () => {
    const ctx = makeMockCtx();
    expect(() => drawContinue(ctx as any, 1, false)).not.toThrow();
  });

  it('renders with 0 seconds left', () => {
    const ctx = makeMockCtx();
    expect(() => drawContinue(ctx as any, 0, true)).not.toThrow();
  });

  it('renders with cursor on NO', () => {
    const ctx = makeMockCtx();
    expect(() => drawContinue(ctx as any, 10, false)).not.toThrow();
  });

  it('renders with defeated/winner characters', () => {
    const ctx = makeMockCtx();
    const defeated = { id: 'ryo', name: 'Ryo', color: '#2196F3' } as any;
    const winner = { id: 'kyo', name: 'Kyo', color: '#FF6600' } as any;
    expect(() => drawContinue(ctx as any, 10, true, defeated, winner)).not.toThrow();
  });

  it('generates text rendering calls', () => {
    const ctx = makeMockCtx();
    drawContinue(ctx as any, 10, true);
    expect(ctx.calls).toContain('fillText');
  });

  it('generates pulse background for low time', () => {
    const ctx = makeMockCtx();
    drawContinue(ctx as any, 2, true);
    // Should have multiple fillRect calls (background + pulse)
    const rectCount = ctx.calls.filter(c => c === 'fillRect').length;
    expect(rectCount, 'multiple fillRect for pulse').toBeGreaterThanOrEqual(2);
  });
});

describe('Game Over screen rendering', () => {
  it('renders at timer 0', () => {
    const ctx = makeMockCtx();
    expect(() => drawGameOver(ctx as any, 0)).not.toThrow();
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('renders at timer 100', () => {
    const ctx = makeMockCtx();
    expect(() => drawGameOver(ctx as any, 100)).not.toThrow();
  });

  it('renders at timer 180 (max)', () => {
    const ctx = makeMockCtx();
    expect(() => drawGameOver(ctx as any, 180)).not.toThrow();
  });

  it('generates background and text', () => {
    const ctx = makeMockCtx();
    drawGameOver(ctx as any, 60);
    expect(ctx.calls).toContain('fillRect');
    expect(ctx.calls).toContain('fillText');
  });
});
