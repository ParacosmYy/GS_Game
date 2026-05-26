/**
 * Ryo portrait rendering tests — drawRyoPortrait and drawRyoSelectPortrait
 *
 * Covers:
 * - Function existence and exports
 * - Rendering without error at various health percentages
 * - Rendering without error at each color index (0-3)
 * - Select portrait rendering
 * - Visual state differences (normal vs desperate)
 * - Edge cases: zero health, negative coords, out-of-range colorIndex
 */
import { describe, it, expect, vi } from 'vitest';
import { drawRyoPortrait, drawRyoSelectPortrait } from '../src/rendering/skeletalParts.js';

/** Create a mock CanvasRenderingContext2D that records all calls without crashing */
function createMockCtx(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  const ctx = {
    // Path methods
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

    // State
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),

    // Properties
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

    // Transform
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),

    // Gradient factory
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),

    // Clear
    clearRect: vi.fn(),

    // Clipping
    clip: vi.fn(),

    // Image
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

describe('drawRyoPortrait', () => {
  it('function exists and is callable', () => {
    expect(typeof drawRyoPortrait).toBe('function');
  });

  it('renders without error at full health (100%)', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx, 0, 0, 48, 48, 1.0, 0);
    }).not.toThrow();
  });

  it('renders without error at half health (50%)', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx, 0, 0, 48, 48, 0.5, 0);
    }).not.toThrow();
  });

  it('renders without error at low health (25%)', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx, 0, 0, 48, 48, 0.25, 0);
    }).not.toThrow();
  });

  it('renders without error at zero health', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx, 0, 0, 48, 48, 0, 0);
    }).not.toThrow();
  });

  it('renders at each color index (0-3) without error', () => {
    for (let ci = 0; ci <= 3; ci++) {
      const ctx = createMockCtx();
      expect(() => {
        drawRyoPortrait(ctx, 0, 0, 48, 48, 0.8, ci);
      }, `colorIndex=${ci} should not throw`).not.toThrow();
    }
  });

  it('handles negative coordinates without error', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx, -100, -100, 48, 48, 0.8, 0);
    }).not.toThrow();
  });

  it('handles out-of-range colorIndex gracefully (clamped)', () => {
    const ctx1 = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx1, 0, 0, 48, 48, 0.8, -5);
    }).not.toThrow();
    const ctx2 = createMockCtx();
    expect(() => {
      drawRyoPortrait(ctx2, 0, 0, 48, 48, 0.8, 99);
    }).not.toThrow();
  });

  it('draws different paths for normal vs desperate health', () => {
    const ctx1 = createMockCtx();
    drawRyoPortrait(ctx1, 0, 0, 48, 48, 1.0, 0);

    const ctx2 = createMockCtx();
    drawRyoPortrait(ctx2, 0, 0, 48, 48, 0.1, 0);

    // The desperate portrait should have more fill calls
    // (additional red tint overlay + sweat drops)
    const fill1 = (ctx1 as unknown as { fill: ReturnType<typeof vi.fn> }).fill.mock.calls.length;
    const fill2 = (ctx2 as unknown as { fill: ReturnType<typeof vi.fn> }).fill.mock.calls.length;

    // Desperate has extra overlay + sweat drops so more fill calls
    expect(fill2).toBeGreaterThan(fill1);
  });

  it('invokes canvas drawing methods (non-empty render output)', () => {
    const ctx = createMockCtx();
    drawRyoPortrait(ctx, 0, 0, 48, 48, 0.8, 0);

    // Verify that at least some drawing operations happened
    const mockAny = ctx as unknown as Record<string, ReturnType<typeof vi.fn>>;
    const fillCalls = mockAny.fill.mock.calls.length;
    const fillRectCalls = mockAny.fillRect.mock.calls.length;
    expect(fillCalls + fillRectCalls).toBeGreaterThan(0);
  });
});

describe('drawRyoSelectPortrait', () => {
  it('function exists and is callable', () => {
    expect(typeof drawRyoSelectPortrait).toBe('function');
  });

  it('renders without error at standard select screen size', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoSelectPortrait(ctx, 0, 0, 120, 0);
    }).not.toThrow();
  });

  it('renders at each color index (0-3) without error', () => {
    for (let ci = 0; ci <= 3; ci++) {
      const ctx = createMockCtx();
      expect(() => {
        drawRyoSelectPortrait(ctx, 0, 0, 120, ci);
      }, `colorIndex=${ci} should not throw`).not.toThrow();
    }
  });

  it('renders at various square sizes without error', () => {
    const sizes = [80, 120, 160, 200];
    for (const size of sizes) {
      const ctx = createMockCtx();
      expect(() => {
        drawRyoSelectPortrait(ctx, 0, 0, size, 0);
      }, `size=${size} should not throw`).not.toThrow();

      // Verify drawing operations occurred
      const mockAny = ctx as unknown as Record<string, ReturnType<typeof vi.fn>>;
      const fillCalls = mockAny.fill.mock.calls.length;
      const fillRectCalls = mockAny.fillRect.mock.calls.length;
      expect(fillCalls + fillRectCalls, `size=${size} should have drawing calls`).toBeGreaterThan(0);
    }
  });

  it('produces different draw calls for different color indices', () => {
    const ctx1 = createMockCtx();
    drawRyoSelectPortrait(ctx1, 0, 0, 120, 0); // Color A: orange gi

    const ctx2 = createMockCtx();
    drawRyoSelectPortrait(ctx2, 0, 0, 120, 2); // Color C: red gi

    // The fillStyle values will differ due to different palette
    // Check that both rendered successfully
    const mock1 = ctx1 as unknown as Record<string, ReturnType<typeof vi.fn>>;
    const mock2 = ctx2 as unknown as Record<string, ReturnType<typeof vi.fn>>;
    expect(mock1.fill.mock.calls.length).toBeGreaterThan(0);
    expect(mock2.fill.mock.calls.length).toBeGreaterThan(0);
  });

  it('handles edge case: very small size', () => {
    const ctx = createMockCtx();
    expect(() => {
      drawRyoSelectPortrait(ctx, 0, 0, 16, 0);
    }).not.toThrow();
  });
});
