import { describe, it, expect } from 'vitest';
import { drawKO } from '../src/rendering/screens_split/introKo.js';

function makeMockCtx(): Record<string, () => void> {
  const noop = () => {};
  const handlers: Record<string, () => void> = {
    save: noop, restore: noop,
    beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop,
    fill: noop, stroke: noop,
    arc: noop, ellipse: noop,
    fillRect: noop, strokeRect: noop,
    fillText: noop, strokeText: noop,
    quadraticCurveTo: noop,
    clip: noop, measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
  return handlers;
}

describe('KO Tier Visual Differentiation', () => {
  it('renders normal KO without error', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, null, false, 500, 0, 1000, 30, [], 0)).not.toThrow();
  });

  it('renders DM KO with finishingAttackType', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, null, false, 500, 0, 1000, 30, [], 0, 'done', 0, 'DM_RYUKO_RANBU', 'ryo')).not.toThrow();
  });

  it('renders SDM KO with finishingAttackType', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, null, false, 500, 0, 1000, 30, [], 0, 'done', 0, 'SDM_RYUKO_RANBU', 'ryo')).not.toThrow();
  });

  it('renders HSDM KO with finishingAttackType', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, null, false, 500, 0, 1000, 30, [], 0, 'done', 0, 'HSDM_RYUKO_RANBU', 'ryo')).not.toThrow();
  });

  it('renders TIME OVER variant', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, null, true, 100, 200, 1000, 30, [], 0)).not.toThrow();
  });

  it('renders PERFECT with DM finishing', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    expect(() => drawKO(ctx, 0, 0, false, 1000, 0, 1000, 60, [], 0, 'done', 0, 'DM_RYUKO_RANBU', 'ryo')).not.toThrow();
  });
});
