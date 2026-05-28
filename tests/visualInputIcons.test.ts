import { describe, it, expect } from 'vitest';
import { measureVisualInput, drawVisualInput } from '../src/rendering/overlays/overlayInputIcons.js';

describe('Visual Input Icons', () => {
  it('measureVisualInput returns positive width for basic inputs', () => {
    expect(measureVisualInput('↓↘→+A')).toBeGreaterThan(0);
    expect(measureVisualInput('→↓↘+C')).toBeGreaterThan(0);
  });

  it('measureVisualInput handles buttons only', () => {
    expect(measureVisualInput('A')).toBeGreaterThan(0);
    expect(measureVisualInput('P')).toBeGreaterThan(0);
  });

  it('measureVisualInput handles multi-char text tokens', () => {
    expect(measureVisualInput('MAX+A')).toBeGreaterThan(0);
  });

  it('measureVisualInput handles slash alternatives', () => {
    expect(measureVisualInput('↓↘→+A/C')).toBeGreaterThan(0);
  });

  it('measureVisualInput handles complex motion inputs', () => {
    expect(measureVisualInput('←↙↓↘→+B')).toBeGreaterThan(0);
    expect(measureVisualInput('↓↘→↓↘→+P')).toBeGreaterThan(0);
  });

  it('drawVisualInput renders without error on mock context', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      fill: () => {},
      stroke: () => {},
      arc: () => {},
      fillText: () => {},
      fillRect: () => {},
      measureText: () => ({ width: 0 }),
    } as unknown as CanvasRenderingContext2D;

    expect(() => drawVisualInput(mockCtx, '↓↘→+A', 250, 10)).not.toThrow();
    expect(() => drawVisualInput(mockCtx, '→↓↘+C', 250, 10)).not.toThrow();
    expect(() => drawVisualInput(mockCtx, '←↙↓↘→+B/D', 250, 10)).not.toThrow();
  });

  it('longer inputs measure wider than shorter ones', () => {
    const short = measureVisualInput('A');
    const medium = measureVisualInput('↓↘→+A');
    const long = measureVisualInput('←↙↓↘→+B/D');
    expect(long).toBeGreaterThan(medium);
    expect(medium).toBeGreaterThan(short);
  });
});
