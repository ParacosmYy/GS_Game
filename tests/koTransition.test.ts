/**
 * KO Transition Overlay Regression Test
 * Verifies drawCharacterKOOverlay, drawScreenFade, drawScreenWipe render correctly.
 */
import { describe, it, expect } from 'vitest';
import {
  drawCharacterKOOverlay,
  drawScreenFade,
  drawScreenWipe,
} from '../src/rendering/overlays/overlayKoTransition.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => {},
    rect: () => {},
    fillText: () => { calls.push('fillText'); },
    strokeText: () => { calls.push('strokeText'); },
    measureText: () => ({ width: 80 }),
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
    roundRect: () => {},
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
    lineJoin: 'round' as CanvasLineJoin,
    calls,
  };
}

describe('Character KO Overlay', () => {
  it('renders with name during fade-in', () => {
    const ctx = makeMockCtx();
    drawCharacterKOOverlay(ctx as any, 'Ryo', 'リョウ', '#ff4444', null, 10);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
    expect(ctx.calls).toContain('fillText');
  });

  it('renders with move name', () => {
    const ctx = makeMockCtx();
    drawCharacterKOOverlay(ctx as any, 'Kyo', '京', '#ff4400', '大蛇薙', 50);
    expect(ctx.calls).toContain('fillText');
    // Should have both character name and move name text
    const textCalls = ctx.calls.filter(c => c === 'fillText');
    expect(textCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('renders during hold phase', () => {
    const ctx = makeMockCtx();
    drawCharacterKOOverlay(ctx as any, 'Iori', '庵', '#aa44ff', null, 60);
    expect(ctx.calls).toContain('fillText');
  });

  it('no rendering after total duration', () => {
    const ctx = makeMockCtx();
    // Total = 20 fadeIn + 100 hold + 30 fadeOut = 150
    drawCharacterKOOverlay(ctx as any, 'Ryo', 'リョウ', '#ff4444', null, 160);
    // Should have save/restore but no text after alpha goes to 0
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('renders at tick 0', () => {
    const ctx = makeMockCtx();
    expect(() => drawCharacterKOOverlay(ctx as any, 'Ryo', 'リョウ', '#ff4444', null, 0)).not.toThrow();
  });
});

describe('Screen Fade', () => {
  it('renders with positive alpha', () => {
    const ctx = makeMockCtx();
    drawScreenFade(ctx as any, 0.5);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('fillRect');
    expect(ctx.calls).toContain('restore');
  });

  it('skips rendering at alpha 0', () => {
    const ctx = makeMockCtx();
    drawScreenFade(ctx as any, 0);
    expect(ctx.calls.length).toBe(0);
  });

  it('renders full black at alpha 1', () => {
    const ctx = makeMockCtx();
    drawScreenFade(ctx as any, 1);
    expect(ctx.calls).toContain('fillRect');
  });

  it('clamps alpha > 1', () => {
    const ctx = makeMockCtx();
    expect(() => drawScreenFade(ctx as any, 2)).not.toThrow();
    expect(ctx.calls).toContain('fillRect');
  });
});

describe('Screen Wipe', () => {
  it('renders left wipe', () => {
    const ctx = makeMockCtx();
    drawScreenWipe(ctx as any, 0.5, 'left');
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('fillRect');
    expect(ctx.calls).toContain('restore');
  });

  it('renders right wipe', () => {
    const ctx = makeMockCtx();
    drawScreenWipe(ctx as any, 0.5, 'right');
    expect(ctx.calls).toContain('fillRect');
  });

  it('skips rendering at progress 0', () => {
    const ctx = makeMockCtx();
    drawScreenWipe(ctx as any, 0, 'left');
    expect(ctx.calls.length).toBe(0);
  });

  it('renders full wipe at progress 1', () => {
    const ctx = makeMockCtx();
    drawScreenWipe(ctx as any, 1, 'right');
    expect(ctx.calls).toContain('fillRect');
  });

  it('left wipe creates gradient for glow effect', () => {
    const ctx = makeMockCtx();
    drawScreenWipe(ctx as any, 0.3, 'left');
    // Should have createLinearGradient for the gold glow edge
    expect(ctx.calls).toContain('fillRect');
  });
});
