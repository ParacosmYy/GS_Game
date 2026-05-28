/**
 * Super Flash Overlay Regression Test
 * Verifies drawSuperFlash renders DM/SDM/HSDM variants without errors.
 */
import { describe, it, expect } from 'vitest';
import { drawSuperFlash, getSuperFlashZoom, updateSuperFlashZoom } from '../src/rendering/overlays/overlaySuperFlash.js';

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
    arc: () => { calls.push('arc'); },
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

describe('Super Flash rendering — all types', () => {
  it('renders DM type', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 20, 400, 300, 'DM')).not.toThrow();
    expect(ctx.calls.length).toBeGreaterThan(0);
  });

  it('renders SDM type', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 20, 400, 300, 'SDM')).not.toThrow();
  });

  it('renders HSDM type', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 20, 400, 300, 'HSDM')).not.toThrow();
  });

  it('renders with move name', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 20, 400, 300, 'DM', '大蛇薙')).not.toThrow();
  });

  it('renders at timer 0 (start)', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 0, 400, 300, 'DM')).not.toThrow();
  });

  it('renders at max timer (end)', () => {
    const ctx = makeMockCtx();
    expect(() => drawSuperFlash(ctx as any, 32, 400, 300, 'HSDM')).not.toThrow();
  });

  it('renders at different screen positions', () => {
    for (const [x, y] of [[100, 100], [400, 300], [700, 500]]) {
      const ctx = makeMockCtx();
      expect(() => drawSuperFlash(ctx as any, 10, x, y, 'SDM'), `pos ${x},${y}`).not.toThrow();
    }
  });

  it('generates canvas save/restore', () => {
    const ctx = makeMockCtx();
    drawSuperFlash(ctx as any, 10, 400, 300, 'DM');
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });
});

describe('Super Flash zoom', () => {
  it('getSuperFlashZoom returns a number', () => {
    expect(typeof getSuperFlashZoom()).toBe('number');
  });

  it('zoom starts at 1 when timer is 0', () => {
    updateSuperFlashZoom(0, 24);
    const zoom = getSuperFlashZoom();
    expect(zoom).toBeGreaterThanOrEqual(0.9);
    expect(zoom).toBeLessThanOrEqual(1.2);
  });

  it('zoom updates with timer progress', () => {
    updateSuperFlashZoom(12, 24);
    const zoom = getSuperFlashZoom();
    expect(typeof zoom).toBe('number');
    expect(zoom).toBeGreaterThan(0);
  });
});
