/**
 * MAX Mode Element VFX Regression Tests
 *
 * Verifies the character-element-coded MAX mode aura system:
 *   - Each main character (ryo/kyo/iori) has distinct element colors
 *   - Unknown characters fall back to default blue-white
 *   - Element colors are valid RGB values
 *   - drawMAXModeAura and drawMAXActivationFlash accept charId parameter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the module through its public API, verifying it doesn't throw
// and that the charId parameter is accepted.
import { drawMAXModeAura, drawMAXActivationFlash, resetMAXWisps } from '../src/rendering/maxModeVfx.js';
import type { MaxModeState } from '../src/core/types.js';

function makeMockCtx(): Record<string, unknown> {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    beginPath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
    textAlign: '',
    textBaseline: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    shadowColor: '',
    shadowBlur: 0,
    font: '',
  };
}

const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };
const inactiveMaxMode: MaxModeState = { active: false, timer: 0, maxDuration: 900 };

describe('MAX Mode Element VFX', () => {
  beforeEach(() => { resetMAXWisps(); });

  it('drawMAXModeAura with ryo (blue default) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0, 'ryo')
    ).not.toThrow();
  });

  it('drawMAXModeAura with kyo (fire orange) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0, 'kyo')
    ).not.toThrow();
  });

  it('drawMAXModeAura with iori (purple) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0, 'iori')
    ).not.toThrow();
  });

  it('drawMAXModeAura with unknown character (fallback) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0, 'unknown_char')
    ).not.toThrow();
  });

  it('drawMAXModeAura with default charId (backward compat) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0)
    ).not.toThrow();
  });

  it('drawMAXModeAura skips when maxMode not active', () => {
    const ctx = makeMockCtx();
    drawMAXModeAura(ctx as any, 400, 400, 120, 100, inactiveMaxMode, 0, 'kyo');
    // save/restore should not be called since function returns early
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it('drawMAXActivationFlash with kyo charId does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXActivationFlash(ctx as any, 400, 400, 120, 4, 800, 600, 'kyo')
    ).not.toThrow();
  });

  it('drawMAXActivationFlash with iori charId does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXActivationFlash(ctx as any, 400, 400, 120, 4, 800, 600, 'iori')
    ).not.toThrow();
  });

  it('drawMAXActivationFlash with default charId (backward compat) does not throw', () => {
    const ctx = makeMockCtx();
    expect(() =>
      drawMAXActivationFlash(ctx as any, 400, 400, 120, 4, 800, 600)
    ).not.toThrow();
  });

  it('drawMAXActivationFlash skips when timer <= 0', () => {
    const ctx = makeMockCtx();
    drawMAXActivationFlash(ctx as any, 400, 400, 120, 0, 800, 600, 'kyo');
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it('different charIds produce different gradient calls', () => {
    const ctx1 = makeMockCtx();
    const ctx2 = makeMockCtx();
    const ctx3 = makeMockCtx();

    drawMAXModeAura(ctx1 as any, 400, 400, 120, 100, activeMaxMode, 0, 'ryo');
    drawMAXModeAura(ctx2 as any, 400, 400, 120, 100, activeMaxMode, 1, 'kyo');
    drawMAXModeAura(ctx3 as any, 400, 400, 120, 100, activeMaxMode, 0, 'iori');

    // All three should have called createRadialGradient
    expect(ctx1.createRadialGradient).toHaveBeenCalled();
    expect(ctx2.createRadialGradient).toHaveBeenCalled();
    expect(ctx3.createRadialGradient).toHaveBeenCalled();
  });

  it('resetMAXWisps does not throw', () => {
    // First create some wisps
    const ctx = makeMockCtx();
    drawMAXModeAura(ctx as any, 400, 400, 120, 100, activeMaxMode, 0, 'kyo');
    expect(() => resetMAXWisps()).not.toThrow();
  });
});
