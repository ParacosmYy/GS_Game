/**
 * Desperation Gauge Visual Indicator Regression Test
 * Validates that drawPowerGauges accepts the desperation parameter
 * and that isDesperation correctly determines HP < 25% state.
 */
import { describe, it, expect } from 'vitest';
import { isDesperation } from '../src/combat/meter.js';

describe('isDesperation threshold', () => {
  it('returns true when health < 25%', () => {
    expect(isDesperation(1, 1000)).toBe(true);
    expect(isDesperation(200, 1000)).toBe(true);
    expect(isDesperation(249, 1000)).toBe(true);
  });

  it('returns false when health >= 25%', () => {
    expect(isDesperation(250, 1000)).toBe(false);
    expect(isDesperation(500, 1000)).toBe(false);
    expect(isDesperation(1000, 1000)).toBe(false);
  });

  it('returns false for zero health (KO, not desperation)', () => {
    expect(isDesperation(0, 1000)).toBe(false);
  });

  it('returns false for zero maxHealth', () => {
    expect(isDesperation(50, 0)).toBe(false);
  });
});

describe('drawPowerGauges accepts desperation parameter', () => {
  it('exports drawPowerGauges with optional desperation array', async () => {
    const { drawPowerGauges } = await import('../src/rendering/hud.js');
    expect(typeof drawPowerGauges).toBe('function');
    // Create minimal mock objects to verify function accepts the parameter
    const mockCtx = {
      save: () => {}, restore: () => {}, fillRect: () => {}, strokeRect: () => {},
      beginPath: () => {}, closePath: () => {}, fill: () => {}, stroke: () => {},
      arc: () => {}, moveTo: () => {}, lineTo: () => {}, quadraticCurveTo: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    } as unknown as CanvasRenderingContext2D;
    const gauge = { stocks: 2, meter: 50, maxMeter: 100 };
    const maxMode = { active: false, timer: 0, maxDuration: 600 };
    // Should not throw with desperation parameter
    expect(() => drawPowerGauges(mockCtx, [gauge, gauge] as any, [maxMode, maxMode] as any, [true, false])).not.toThrow();
    // Should not throw without desperation parameter (backward compatible)
    expect(() => drawPowerGauges(mockCtx, [gauge, gauge] as any, [maxMode, maxMode] as any)).not.toThrow();
  });
});
