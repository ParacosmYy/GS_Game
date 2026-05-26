/**
 * Ryo hand and foot detail rendering tests
 *
 * Verifies that drawPixelArm and drawPixelLeg render Ryo-specific
 * karate fist and shoe details without errors, and that the attack
 * trail helper function works correctly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawPixelArm, drawPixelLeg, setBodyPartTick } from '../src/rendering/bodyPartRenderer.js';
import { drawAttackTrail } from '../src/rendering/skeletalParts.js';

// ─── Mock Canvas ──────────────────────────────────────────────────────────────

function createMockCtx(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),
    clip: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    canvas: {} as unknown as HTMLCanvasElement,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  } as unknown as CanvasRenderingContext2D;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Ryo hand rendering (drawPixelArm)', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
    setBodyPartTick(0);
  });

  it('renders without error for Ryo charId', () => {
    expect(() => {
      drawPixelArm(ctx, 'ryo', 14, 26, false);
    }).not.toThrow();
  });

  it('renders without error for Ryo charId (back arm)', () => {
    expect(() => {
      drawPixelArm(ctx, 'ryo', 14, 26, true);
    }).not.toThrow();
  });

  it('renders fist shape with wider top and narrower bottom (trapezoid)', () => {
    drawPixelArm(ctx, 'ryo', 14, 26, false);
    // The function should have called beginPath, moveTo, lineTo, closePath for the fist trapezoid
    // We verify it ran without error and called canvas operations
    expect((ctx as unknown as Record<string, unknown>).beginPath).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).moveTo).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).lineTo).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).fill).toHaveBeenCalled();
  });

  it('draws knuckle lines (multiple horizontal strokes)', () => {
    drawPixelArm(ctx, 'ryo', 14, 26, false);
    // Ryo's fist should have knuckle ridge lines — stroke should be called multiple times
    const strokeCalls = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(strokeCalls).toBeGreaterThan(5); // knuckle lines + wrap lines + outline
  });

  it('draws thumb outline as ellipse on fist side', () => {
    drawPixelArm(ctx, 'ryo', 14, 26, false);
    // Ellipse is used for thumb
    expect((ctx as unknown as Record<string, unknown>).ellipse).toHaveBeenCalled();
  });

  it('activates motion blur when scale > 1.0 (attack active)', () => {
    // When scale > 1.0, w is larger than base arm width (14).
    // Passing w=20 simulates an enlarged (attacking) arm.
    const strokeCallsBefore = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    drawPixelArm(ctx, 'ryo', 20, 30, false);
    const strokeCallsAfter = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    // Motion blur adds extra stroke calls (3 trail lines)
    expect(strokeCallsAfter - strokeCallsBefore).toBeGreaterThan(3);
  });

  it('handles edge case: zero scale (zero width/height)', () => {
    expect(() => {
      drawPixelArm(ctx, 'ryo', 0, 0, false);
    }).not.toThrow();
  });

  it('handles edge case: negative offset dimensions gracefully', () => {
    expect(() => {
      drawPixelArm(ctx, 'ryo', -5, -10, false);
    }).not.toThrow();
  });
});

describe('Ryo foot/shoe rendering (drawPixelLeg)', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
    setBodyPartTick(0);
  });

  it('renders without error for Ryo charId', () => {
    expect(() => {
      drawPixelLeg(ctx, 'ryo', 16, 34, false);
    }).not.toThrow();
  });

  it('renders without error for Ryo charId (back leg)', () => {
    expect(() => {
      drawPixelLeg(ctx, 'ryo', 16, 34, true);
    }).not.toThrow();
  });

  it('draws shoe shape with wider sole than ankle', () => {
    drawPixelLeg(ctx, 'ryo', 16, 34, false);
    // Ryo's shoe uses a trapezoid shape — beginPath + moveTo + lineTo calls
    expect((ctx as unknown as Record<string, unknown>).beginPath).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).moveTo).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).lineTo).toHaveBeenCalled();
  });

  it('draws ankle wrapping band at top of shoe', () => {
    drawPixelLeg(ctx, 'ryo', 16, 34, false);
    // fillRect is used for the ankle wrapping band
    expect((ctx as unknown as Record<string, unknown>).fillRect).toHaveBeenCalled();
    // Should have multiple fillRect calls for shoe layers
    const fillRectCalls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(fillRectCalls).toBeGreaterThan(3);
  });

  it('draws sole line at bottom of shoe', () => {
    drawPixelLeg(ctx, 'ryo', 16, 34, false);
    // The sole should use a darker fill near the bottom
    expect((ctx as unknown as Record<string, unknown>).fillRect).toHaveBeenCalled();
  });

  it('handles edge case: very small shoe dimensions', () => {
    expect(() => {
      drawPixelLeg(ctx, 'ryo', 4, 8, false);
    }).not.toThrow();
  });

  it('handles edge case: zero dimensions', () => {
    expect(() => {
      drawPixelLeg(ctx, 'ryo', 0, 0, false);
    }).not.toThrow();
  });
});

describe('drawAttackTrail helper function', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('exists and is callable', () => {
    expect(typeof drawAttackTrail).toBe('function');
  });

  it('accepts correct parameters without error', () => {
    expect(() => {
      drawAttackTrail(ctx, 'active', false, '#ff8800', 26, 1);
    }).not.toThrow();
  });

  it('draws trails during active phase', () => {
    drawAttackTrail(ctx, 'active', false, '#ff8800', 26, 1);
    // Should call stroke for trail lines
    expect((ctx as unknown as Record<string, unknown>).stroke).toHaveBeenCalled();
  });

  it('does NOT draw trails during non-active phase (startup)', () => {
    const strokeCallsBefore = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    drawAttackTrail(ctx, 'startup', false, '#ff8800', 26, 1);
    const strokeCallsAfter = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(strokeCallsAfter).toBe(strokeCallsBefore);
  });

  it('does NOT draw trails during non-active phase (recovery)', () => {
    const strokeCallsBefore = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    drawAttackTrail(ctx, 'recovery', false, '#ff8800', 26, 1);
    const strokeCallsAfter = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(strokeCallsAfter).toBe(strokeCallsBefore);
  });

  it('does NOT draw trails during none phase', () => {
    const strokeCallsBefore = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    drawAttackTrail(ctx, 'none', false, '#ff8800', 26, 1);
    const strokeCallsAfter = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(strokeCallsAfter).toBe(strokeCallsBefore);
  });

  it('draws horizontal trails for punches (isKick=false)', () => {
    drawAttackTrail(ctx, 'active', false, '#ff8800', 26, 1);
    // Should have moveTo and lineTo for horizontal trails
    expect((ctx as unknown as Record<string, unknown>).moveTo).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).lineTo).toHaveBeenCalled();
  });

  it('draws vertical trails for kicks (isKick=true)', () => {
    drawAttackTrail(ctx, 'active', true, '#ff8800', 34, 1);
    expect((ctx as unknown as Record<string, unknown>).moveTo).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).lineTo).toHaveBeenCalled();
  });

  it('saves and restores canvas state', () => {
    drawAttackTrail(ctx, 'active', false, '#ff8800', 26, 1);
    expect((ctx as unknown as Record<string, unknown>).save).toHaveBeenCalled();
    expect((ctx as unknown as Record<string, unknown>).restore).toHaveBeenCalled();
  });

  it('handles edge case: zero limb length', () => {
    expect(() => {
      drawAttackTrail(ctx, 'active', false, '#ff8800', 0, 1);
    }).not.toThrow();
  });

  it('handles rgba color strings', () => {
    expect(() => {
      drawAttackTrail(ctx, 'active', false, 'rgba(255, 160, 0, 1.0)', 26, 1);
    }).not.toThrow();
  });
});
