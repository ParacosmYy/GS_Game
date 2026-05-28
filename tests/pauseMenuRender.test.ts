/**
 * Pause Menu Rendering Test
 * Verifies drawPauseMenu renders without errors for all tabs.
 */
import { describe, it, expect } from 'vitest';
import { drawPauseMenu } from '../src/rendering/pauseMenu.js';
import type { CharacterDefinition } from '../src/characters/types.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    strokeRect: () => { calls.push('strokeRect'); },
    rect: () => { calls.push('rect'); },
    fillText: () => { calls.push('fillText'); },
    strokeText: () => {},
    measureText: () => ({ width: 10 }),
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
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

const mockChar: CharacterDefinition = {
  id: 'ryo',
  name: 'Ryo Sakazaki',
  color: '#2196F3',
  moveList: [
    { name: 'Ko Ou', input: '↓↘→+A', type: 'special' },
  ],
} as any;

describe('Pause menu rendering', () => {
  it('renders moves tab without error', () => {
    const ctx = makeMockCtx();
    expect(() => drawPauseMenu(ctx as any, mockChar, 0, 0, 'moves', 800, 600)).not.toThrow();
    expect(ctx.calls.length).toBeGreaterThan(0);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('renders controls tab without error', () => {
    const ctx = makeMockCtx();
    expect(() => drawPauseMenu(ctx as any, mockChar, 0, 0, 'controls', 800, 600)).not.toThrow();
  });

  it('renders settings tab without error', () => {
    const ctx = makeMockCtx();
    expect(() => drawPauseMenu(ctx as any, mockChar, 0, 0, 'settings', 800, 600)).not.toThrow();
  });

  it('generates fillRect calls for background', () => {
    const ctx = makeMockCtx();
    drawPauseMenu(ctx as any, mockChar, 0, 0, 'moves', 800, 600);
    expect(ctx.calls).toContain('fillRect');
  });

  it('generates fillText calls for menu text', () => {
    const ctx = makeMockCtx();
    drawPauseMenu(ctx as any, mockChar, 0, 0, 'moves', 800, 600);
    expect(ctx.calls).toContain('fillText');
  });

  it('handles different canvas sizes', () => {
    for (const [w, h] of [[640, 480], [800, 600], [1024, 768]]) {
      const ctx = makeMockCtx();
      expect(() => drawPauseMenu(ctx as any, mockChar, 0, 0, 'moves', w, h), `${w}x${h}`).not.toThrow();
    }
  });

  it('handles different cursor positions', () => {
    for (const cursor of [0, 1, 2]) {
      const ctx = makeMockCtx();
      expect(() => drawPauseMenu(ctx as any, mockChar, cursor, 0, 'moves', 800, 600), `cursor=${cursor}`).not.toThrow();
    }
  });

  it('handles empty move list', () => {
    const emptyChar = { ...mockChar, moveList: [] };
    const ctx = makeMockCtx();
    expect(() => drawPauseMenu(ctx as any, emptyChar, 0, 0, 'moves', 800, 600)).not.toThrow();
  });
});
