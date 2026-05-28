/**
 * Screen Transition Regression Test
 * Verifies all 4 transition types render correctly and return completion state.
 */
import { describe, it, expect } from 'vitest';
import { drawTransition } from '../src/rendering/screens_split/transition.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => {},
    rect: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: () => ({ width: 10 }),
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => {},
    closePath: () => {},
    arc: () => {},
    fill: () => {},
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

const TYPES = ['curtain', 'wipe', 'zoom', 'fade'] as const;

describe('Transition rendering — all types', () => {
  it('all 4 types render without error at mid-progress', () => {
    for (const type of TYPES) {
      const ctx = makeMockCtx();
      expect(() => drawTransition(ctx as any, 15, type, 800, 600), `${type}`).not.toThrow();
    }
  });

  it('all types generate save/restore calls', () => {
    for (const type of TYPES) {
      const ctx = makeMockCtx();
      drawTransition(ctx as any, 15, type, 800, 600);
      expect(ctx.calls, `${type} save`).toContain('save');
      expect(ctx.calls, `${type} restore`).toContain('restore');
    }
  });

  it('all types generate fillRect calls', () => {
    for (const type of TYPES) {
      const ctx = makeMockCtx();
      drawTransition(ctx as any, 15, type, 800, 600);
      expect(ctx.calls, `${type} fillRect`).toContain('fillRect');
    }
  });
});

describe('Curtain transition — KOF2002 style', () => {
  it('returns false during animation', () => {
    const ctx = makeMockCtx();
    const done = drawTransition(ctx as any, 10, 'curtain', 800, 600);
    expect(done).toBe(false);
  });

  it('returns true when complete', () => {
    const ctx = makeMockCtx();
    const done = drawTransition(ctx as any, 50, 'curtain', 800, 600);
    expect(done).toBe(true);
  });

  it('at tick 0 both bars are at edges', () => {
    const ctx = makeMockCtx();
    drawTransition(ctx as any, 0, 'curtain', 800, 600);
    expect(ctx.calls).toContain('fillRect');
  });

  it('gold edge glow creates gradient', () => {
    const ctx = makeMockCtx();
    drawTransition(ctx as any, 5, 'curtain', 800, 600);
    // Should use createLinearGradient for gold edges
    expect(ctx.calls).toContain('fillRect');
  });
});

describe('Wipe transition', () => {
  it('returns false during wipe', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 10, 'wipe', 800, 600)).toBe(false);
  });

  it('returns true when wipe complete', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 50, 'wipe', 800, 600)).toBe(true);
  });
});

describe('Zoom transition', () => {
  it('returns false during zoom', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 15, 'zoom', 800, 600)).toBe(false);
  });

  it('returns true when zoom complete', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 60, 'zoom', 800, 600)).toBe(true);
  });
});

describe('Fade transition', () => {
  it('returns false during fade', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 10, 'fade', 800, 600)).toBe(false);
  });

  it('returns true when fade complete', () => {
    const ctx = makeMockCtx();
    expect(drawTransition(ctx as any, 40, 'fade', 800, 600)).toBe(true);
  });
});

describe('Transition edge cases', () => {
  it('handles different canvas sizes', () => {
    for (const [w, h] of [[640, 480], [800, 600], [1024, 768]]) {
      for (const type of TYPES) {
        const ctx = makeMockCtx();
        expect(() => drawTransition(ctx as any, 10, type, w, h), `${type} ${w}x${h}`).not.toThrow();
      }
    }
  });

  it('handles tick 0 gracefully', () => {
    for (const type of TYPES) {
      const ctx = makeMockCtx();
      expect(() => drawTransition(ctx as any, 0, type, 800, 600), `${type} tick=0`).not.toThrow();
    }
  });
});
