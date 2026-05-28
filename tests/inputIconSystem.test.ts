/**
 * Visual Input Icon System Regression Test
 * Verifies measureVisualInput and drawVisualInput handle all KOF2002 notation tokens.
 */
import { describe, it, expect } from 'vitest';
import { measureVisualInput, drawVisualInput } from '../src/rendering/overlays/overlayInputIcons.js';

function makeMockCtx() {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    arc: () => { calls.push('arc'); },
    fill: () => { calls.push('fill'); },
    stroke: () => { calls.push('stroke'); },
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
    closePath: () => { calls.push('closePath'); },
    moveTo: () => { calls.push('moveTo'); },
    lineTo: () => { calls.push('lineTo'); },
    fillText: () => { calls.push('fillText'); },
    strokeText: () => {},
    measureText: () => ({ width: 5 }),
    fillStyle: '' as string,
    strokeStyle: '' as string,
    lineWidth: 1 as number,
    font: '' as string,
    textAlign: '' as string,
    textBaseline: '' as string,
    globalAlpha: 1 as number,
    calls,
  };
}

describe('measureVisualInput — all notation types', () => {
  it('arrow directions have positive width', () => {
    const arrows = ['→', '←', '↑', '↓', '↘', '↙', '↗', '↖', '·'];
    for (const arrow of arrows) {
      const w = measureVisualInput(arrow);
      expect(w, `arrow ${arrow}`).toBeGreaterThan(0);
    }
  });

  it('button labels have positive width', () => {
    const buttons = ['A', 'B', 'C', 'D', 'P', 'K'];
    for (const btn of buttons) {
      const w = measureVisualInput(btn);
      expect(w, `button ${btn}`).toBeGreaterThan(0);
    }
  });

  it('separators have positive width', () => {
    for (const sep of ['+', '/', '~']) {
      const w = measureVisualInput(sep);
      expect(w, `separator ${sep}`).toBeGreaterThan(0);
    }
  });

  it('multi-char text has positive width', () => {
    expect(measureVisualInput('MAX')).toBeGreaterThan(0);
    expect(measureVisualInput('HSDM')).toBeGreaterThan(0);
  });

  it('longer inputs have wider measurement', () => {
    const single = measureVisualInput('→');
    const combo = measureVisualInput('↓↘→+P');
    expect(combo).toBeGreaterThan(single);
  });

  it('empty input has zero width', () => {
    expect(measureVisualInput('')).toBe(0);
  });
});

describe('measureVisualInput — KOF2002 move inputs', () => {
  it('QCF notation (↓↘→+P) has positive width', () => {
    expect(measureVisualInput('↓↘→+P')).toBeGreaterThan(0);
  });

  it('DP notation (→↓↘+P) has positive width', () => {
    expect(measureVisualInput('→↓↘+P')).toBeGreaterThan(0);
  });

  it('HCF notation (←↙↓↘→+P) has positive width', () => {
    expect(measureVisualInput('←↙↓↘→+P')).toBeGreaterThan(0);
  });

  it('charge notation (↓蓄↑+K) has positive width', () => {
    expect(measureVisualInput('↓蓄↑+K')).toBeGreaterThan(0);
  });

  it('MAX activation notation (B+C) has positive width', () => {
    expect(measureVisualInput('B+C')).toBeGreaterThan(0);
  });

  it('multi-button notation (A/C) has positive width', () => {
    expect(measureVisualInput('A/C')).toBeGreaterThan(0);
  });
});

describe('drawVisualInput — rendering calls', () => {
  it('arrow input generates canvas calls', () => {
    const ctx = makeMockCtx();
    drawVisualInput(ctx as any, '→', 100, 50);
    expect(ctx.calls.length, 'canvas calls made').toBeGreaterThan(0);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('button input generates canvas calls', () => {
    const ctx = makeMockCtx();
    drawVisualInput(ctx as any, 'A', 100, 50);
    expect(ctx.calls.length, 'canvas calls made').toBeGreaterThan(0);
  });

  it('complex input generates canvas calls', () => {
    const ctx = makeMockCtx();
    drawVisualInput(ctx as any, '↓↘→+P', 200, 50);
    expect(ctx.calls.length, 'canvas calls made').toBeGreaterThan(0);
  });

  it('text token generates fillText call', () => {
    const ctx = makeMockCtx();
    drawVisualInput(ctx as any, 'MAX', 100, 50);
    expect(ctx.calls).toContain('fillText');
  });

  it('does not throw for any standard KOF input', () => {
    const inputs = [
      '→+A', '↓↘→+P', '→↓↘+K', '←↙↓↘→+P', '←↙↓↘→↗↓↙←+P',
      'A/B', 'A+C', 'B+D', '↓蓄↑+K', '空中↓+C',
      '→+B', '↘+D', '↘↘+D', 'MAX', 'HSDM',
    ];
    for (const input of inputs) {
      const ctx = makeMockCtx();
      expect(() => drawVisualInput(ctx as any, input, 200, 50), `input "${input}"`).not.toThrow();
    }
  });
});

describe('drawVisualInput — right-alignment consistency', () => {
  it('drawVisualInput at different rightX positions does not throw', () => {
    const ctx = makeMockCtx();
    for (const x of [50, 100, 200, 400]) {
      expect(() => drawVisualInput(ctx as any, '↓↘→+A', x, 50), `rightX=${x}`).not.toThrow();
    }
  });
});
