import { describe, it, expect } from 'vitest';
import { measureVisualInput, drawVisualInput } from '../src/rendering/overlays/overlayInputIcons.js';
import { RYO_MOVE_LIST } from '../src/content/characters/ryo/commands/ryoCommands.js';
import { KYO_MOVE_LIST } from '../src/content/characters/kyo/commands/kyoCommands.js';
import { IORI_MOVE_LIST } from '../src/content/characters/iori/commands/ioriCommands.js';

function makeMockCtx(): Record<string, () => void> {
  const noop = () => {};
  return {
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
}

describe('Visual Input Icons — All Characters Move List Compatibility', () => {
  const allMoves = [
    ...RYO_MOVE_LIST.map(m => ({ ...m, char: 'Ryo' })),
    ...KYO_MOVE_LIST.map(m => ({ ...m, char: 'Kyo' })),
    ...IORI_MOVE_LIST.map(m => ({ ...m, char: 'Iori' })),
  ];

  it('all moves from all characters have measurable input width', () => {
    let zeroWidthCount = 0;
    for (const move of allMoves) {
      const w = measureVisualInput(move.input);
      if (w <= 0) zeroWidthCount++;
    }
    expect(zeroWidthCount, 'No moves should have zero-width input').toBe(0);
  });

  it('all moves render without error on mock context', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    for (const move of allMoves) {
      expect(() => drawVisualInput(ctx, move.input, 250, 10), `${move.char}: ${move.input}`).not.toThrow();
    }
  });

  it('special move inputs are wider than normal inputs', () => {
    const normalMove = allMoves.find(m => m.input === 'A' || m.input === 'B');
    const specialMove = allMoves.find(m => m.input.includes('↘') && m.input.includes('+'));
    if (normalMove && specialMove) {
      const normalW = measureVisualInput(normalMove.input);
      const specialW = measureVisualInput(specialMove.input);
      expect(specialW).toBeGreaterThan(normalW);
    }
  });

  it('DM inputs are wider than special inputs', () => {
    const specialMove = allMoves.find(m => (m.type === 'special') && m.input.includes('↘'));
    const dmMove = allMoves.find(m => m.type === 'dm');
    if (specialMove && dmMove) {
      const specialW = measureVisualInput(specialMove.input);
      const dmW = measureVisualInput(dmMove.input);
      expect(dmW).toBeGreaterThanOrEqual(specialW);
    }
  });

  it('each character has at least 5 unique input patterns', () => {
    const chars = ['Ryo', 'Kyo', 'Iori'];
    for (const char of chars) {
      const moves = allMoves.filter(m => m.char === char);
      const uniqueInputs = new Set(moves.map(m => m.input));
      expect(uniqueInputs.size, `${char} should have at least 5 unique inputs`).toBeGreaterThanOrEqual(5);
    }
  });
});
