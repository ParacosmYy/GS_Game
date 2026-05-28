/**
 * Rendering Utils Regression Test
 * Verifies shiftColor, parseColor, verticalGrad, horizontalGrad, drawBar.
 */
import { describe, it, expect } from 'vitest';
import { parseColor, shiftColor, verticalGrad, horizontalGrad, drawBar } from '../src/rendering/utils.js';

function mockCtx() {
  const stops: { offset: number; color: string }[] = [];
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  let fillStyle = '';
  return {
    stops, rects, fillStyle,
    createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
      return {
        addColorStop(offset: number, color: string) { stops.push({ offset, color }); },
      };
    },
    fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h }); },
    save() {},
    restore() {},
  } as unknown as CanvasRenderingContext2D;
}

describe('parseColor', () => {
  it('parses #rrggbb', () => {
    const c = parseColor('#ff8800');
    expect(c.r).toBe(255);
    expect(c.g).toBe(136);
    expect(c.b).toBe(0);
  });

  it('parses #000000', () => {
    const c = parseColor('#000000');
    expect(c).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses #ffffff', () => {
    const c = parseColor('#ffffff');
    expect(c).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses rgba format', () => {
    const c = parseColor('rgba(100, 200, 50, 0.5)');
    expect(c.r).toBe(100);
    expect(c.g).toBe(200);
    expect(c.b).toBe(50);
  });

  it('parses rgb format', () => {
    const c = parseColor('rgb(10, 20, 30)');
    expect(c).toEqual({ r: 10, g: 20, b: 30 });
  });

  it('returns gray for unknown format', () => {
    const c = parseColor('red');
    expect(c).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe('shiftColor', () => {
  it('positive shifts brighter', () => {
    const result = shiftColor('#808080', 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('negative shifts darker', () => {
    const result = shiftColor('#808080', -50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('clamps at 255', () => {
    const result = shiftColor('#ffffff', 100);
    expect(result).toBe('#ffffff');
  });

  it('clamps at 0', () => {
    const result = shiftColor('#000000', -100);
    expect(result).toBe('#000000');
  });

  it('zero shift returns same color', () => {
    expect(shiftColor('#aabbcc', 0)).toBe('#aabbcc');
  });

  it('shifts from middle gray', () => {
    const result = shiftColor('#808080', 40);
    const { r, g, b } = parseColor(result);
    expect(r).toBe(168);
    expect(g).toBe(168);
    expect(b).toBe(168);
  });

  it('round-trip: shift + inverse shift', () => {
    const original = '#4488cc';
    const brightened = shiftColor(original, 30);
    const restored = shiftColor(brightened, -30);
    expect(restored).toBe(original);
  });

  it('handles pure red', () => {
    expect(shiftColor('#ff0000', -55)).toBe('#c80000');
  });

  it('handles pure green', () => {
    expect(shiftColor('#00ff00', 0)).toBe('#00ff00');
  });

  it('handles pure blue', () => {
    // 255 - 200 = 55 = 0x37
    expect(shiftColor('#0000ff', -200)).toBe('#000037');
  });

  it('brightens a specific color', () => {
    const result = shiftColor('#804020', 50);
    const { r, g, b } = parseColor(result);
    expect(r).toBe(178);
    expect(g).toBe(114);
    expect(b).toBe(82);
  });

  it('darkens white by -100', () => {
    const result = shiftColor('#ffffff', -100);
    expect(result).toBe('#9b9b9b');
  });
});

// ── verticalGrad ──────────────────────────────────────────────
describe('verticalGrad', () => {
  it('creates gradient with two stops', () => {
    const ctx = mockCtx();
    const g = verticalGrad(ctx as any, 10, 0, 100, '#ff0000', '#0000ff');
    expect((ctx as any).stops).toEqual([
      { offset: 0, color: '#ff0000' },
      { offset: 1, color: '#0000ff' },
    ]);
  });
});

// ── horizontalGrad ────────────────────────────────────────────
describe('horizontalGrad', () => {
  it('creates gradient with two stops', () => {
    const ctx = mockCtx();
    const g = horizontalGrad(ctx as any, 0, 50, 200, '#00ff00', '#000000');
    expect((ctx as any).stops).toEqual([
      { offset: 0, color: '#00ff00' },
      { offset: 1, color: '#000000' },
    ]);
  });
});

// ── drawBar ───────────────────────────────────────────────────
describe('drawBar', () => {
  it('draws border and fill rects', () => {
    const ctx = mockCtx();
    drawBar(ctx, 10, 20, 100, 8, 0.5, '#ff0000', '#ffffff', 1);
    // border rect (x-1, y-1, w+2, h+2) then fill rect (x, y, w*0.5, h)
    expect((ctx as any).rects.length).toBe(2);
    expect((ctx as any).rects[0]).toEqual({ x: 9, y: 19, w: 102, h: 10 });
    expect((ctx as any).rects[1]).toEqual({ x: 10, y: 20, w: 50, h: 8 });
  });

  it('clamps fillRatio to [0,1]', () => {
    const ctx = mockCtx();
    drawBar(ctx, 0, 0, 100, 10, 2.0, '#fff', '#000', 0);
    expect((ctx as any).rects[0].w).toBe(100);
    const ctx2 = mockCtx();
    drawBar(ctx2, 0, 0, 100, 10, -0.5, '#fff', '#000', 0);
    expect((ctx2 as any).rects[0].w).toBe(0);
  });

  it('skips border when borderWidth is 0', () => {
    const ctx = mockCtx();
    drawBar(ctx, 0, 0, 100, 10, 0.5, '#fff', '#000', 0);
    expect((ctx as any).rects.length).toBe(1);
  });
});
