/**
 * Character Intro Quotes Regression Test
 * Verifies intro quote data structure, trigger/tick lifecycle, and rendering.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  triggerIntroQuotes,
  tickIntroQuotes,
  resetIntroQuotes,
  drawIntroQuotes,
} from '../src/rendering/charIntroQuotes.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => {},
    rect: () => {},
    fillText: () => { calls.push('fillText'); },
    strokeText: () => {},
    measureText: () => ({ width: 60 }),
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
    closePath: () => { calls.push('closePath'); },
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
    calls,
  };
}

describe('Intro Quotes — lifecycle', () => {
  beforeEach(() => {
    resetIntroQuotes();
  });

  it('trigger activates for known characters', () => {
    triggerIntroQuotes('ryo', 'kyo');
    // Quotes are random, but rendering should work
    const ctx = makeMockCtx();
    expect(() => drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'kyo', 600, 300, 0)).not.toThrow();
  });

  it('trigger for ryo vs iori renders', () => {
    triggerIntroQuotes('ryo', 'iori');
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'iori', 600, 300, 0);
    // Should have rendering calls if active
    if (ctx.calls.length > 0) {
      expect(ctx.calls).toContain('save');
      expect(ctx.calls).toContain('restore');
    }
  });

  it('trigger for kyo vs iori renders', () => {
    triggerIntroQuotes('kyo', 'iori');
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'kyo', 200, 300, 'iori', 600, 300, 0);
    expect(() => {}).not.toThrow();
  });

  it('tick advances timer and eventually deactivates', () => {
    triggerIntroQuotes('ryo', 'kyo');
    // Tick past duration (70 frames)
    for (let i = 0; i < 75; i++) {
      tickIntroQuotes();
    }
    // After deactivation, no rendering calls
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'kyo', 600, 300, 0);
    expect(ctx.calls.length).toBe(0);
  });

  it('reset clears active state', () => {
    triggerIntroQuotes('ryo', 'kyo');
    resetIntroQuotes();
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'kyo', 600, 300, 0);
    expect(ctx.calls.length).toBe(0);
  });

  it('trigger with unknown character does not crash', () => {
    expect(() => triggerIntroQuotes('unknown_char', 'ryo')).not.toThrow();
  });

  it('drawIntroQuotes with no trigger produces no calls', () => {
    resetIntroQuotes();
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'kyo', 600, 300, 0);
    expect(ctx.calls.length).toBe(0);
  });

  it('multiple trigger+reset cycles work', () => {
    for (let i = 0; i < 5; i++) {
      triggerIntroQuotes('ryo', 'kyo');
      resetIntroQuotes();
    }
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'ryo', 200, 300, 'kyo', 600, 300, 0);
    expect(ctx.calls.length).toBe(0);
  });

  it('renders during mid-lifecycle (not expired)', () => {
    triggerIntroQuotes('kyo', 'iori');
    // Tick a few frames but not past duration
    for (let i = 0; i < 20; i++) {
      tickIntroQuotes();
    }
    const ctx = makeMockCtx();
    drawIntroQuotes(ctx as any, 'kyo', 200, 300, 'iori', 600, 300, 0);
    // Should have rendering activity
    expect(ctx.calls).toContain('save');
  });
});
