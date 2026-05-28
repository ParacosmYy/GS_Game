/**
 * Round Score Breakdown Popup Regression Test
 * Verifies drawRoundScoreBreakdown renders with and without perfect bonus.
 */
import { describe, it, expect } from 'vitest';
import { drawRoundScoreBreakdown, type RoundScoreBreakdown } from '../src/rendering/overlays/overlayArcadeFlow.js';

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

const normalBreakdown: RoundScoreBreakdown = {
  baseScore: 1000,
  hpBonus: 200,
  perfectBonus: 0,
  totalScore: 1200,
  isPerfect: false,
};

const perfectBreakdown: RoundScoreBreakdown = {
  baseScore: 1000,
  hpBonus: 500,
  perfectBonus: 3000,
  totalScore: 4500,
  isPerfect: true,
};

describe('Round score breakdown popup', () => {
  it('renders normal round without error', () => {
    const ctx = makeMockCtx();
    expect(() => drawRoundScoreBreakdown(ctx as any, 30, normalBreakdown)).not.toThrow();
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('renders perfect round without error', () => {
    const ctx = makeMockCtx();
    expect(() => drawRoundScoreBreakdown(ctx as any, 30, perfectBreakdown)).not.toThrow();
  });

  it('renders at timer 0 (fade in start)', () => {
    const ctx = makeMockCtx();
    expect(() => drawRoundScoreBreakdown(ctx as any, 0, normalBreakdown)).not.toThrow();
  });

  it('renders at timer 100 (fully visible)', () => {
    const ctx = makeMockCtx();
    expect(() => drawRoundScoreBreakdown(ctx as any, 100, normalBreakdown)).not.toThrow();
  });

  it('generates text rendering calls', () => {
    const ctx = makeMockCtx();
    drawRoundScoreBreakdown(ctx as any, 30, normalBreakdown);
    expect(ctx.calls).toContain('fillText');
  });

  it('generates background fill', () => {
    const ctx = makeMockCtx();
    drawRoundScoreBreakdown(ctx as any, 30, normalBreakdown);
    expect(ctx.calls).toContain('fill');
  });

  it('generates border stroke', () => {
    const ctx = makeMockCtx();
    drawRoundScoreBreakdown(ctx as any, 30, normalBreakdown);
    expect(ctx.calls).toContain('stroke');
  });

  it('handles zero scores', () => {
    const ctx = makeMockCtx();
    const zeroBreakdown: RoundScoreBreakdown = {
      baseScore: 0, hpBonus: 0, perfectBonus: 0, totalScore: 0, isPerfect: false,
    };
    expect(() => drawRoundScoreBreakdown(ctx as any, 30, zeroBreakdown)).not.toThrow();
  });
});
