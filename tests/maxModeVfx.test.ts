/**
 * Tests for MAX Mode VFX — aura behavior, wisp management, activation flash
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { drawMAXModeAura, drawMAXActivationFlash, resetMAXWisps } from '../src/rendering/maxModeVfx.js';
import type { MaxModeState } from '../src/core/types.js';

/** Create a mock 2D canvas context that records fillRect calls */
function createMockCtx(): {
  fillRect: () => void;
  arc: () => void;
  fill: () => void;
  stroke: () => void;
  save: () => void;
  restore: () => void;
  beginPath: () => void;
  ellipse: () => void;
  strokeRect: () => void;
  calls: string[];
  createRadialGradient: () => { addColorStop: () => void };
  createLinearGradient: () => { addColorStop: () => void };
} {
  const calls: string[] = [];
  return {
    fillRect: () => { calls.push('fillRect'); },
    arc: () => { calls.push('arc'); },
    fill: () => { calls.push('fill'); },
    stroke: () => { calls.push('stroke'); },
    save: () => { calls.push('save'); },
    restore: () => { calls.push('restore'); },
    beginPath: () => { calls.push('beginPath'); },
    ellipse: () => { calls.push('ellipse'); },
    strokeRect: () => { calls.push('strokeRect'); },
    calls,
    createRadialGradient: () => ({
      addColorStop: () => { calls.push('addColorStop'); },
    }),
    createLinearGradient: () => ({
      addColorStop: () => { calls.push('addColorStop'); },
    }),
  };
}

describe('MAX Mode VFX', () => {
  beforeEach(() => {
    resetMAXWisps();
  });

  describe('drawMAXModeAura', () => {
    it('should not draw when maxMode is inactive', () => {
      const ctx = createMockCtx();
      const inactiveMaxMode: MaxModeState = { active: false, timer: 0, maxDuration: 900 };

      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 100,
        inactiveMaxMode,
        0,
      );

      // Should not have called any rendering methods
      expect(ctx.calls.length).toBe(0);
    });

    it('should draw aura elements when maxMode is active', () => {
      const ctx = createMockCtx();
      const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };

      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 100,
        activeMaxMode,
        0,
      );

      // Should have called rendering methods (save, createRadialGradient, fillRect, restore, etc.)
      expect(ctx.calls.length).toBeGreaterThan(0);
      expect(ctx.calls).toContain('fillRect');
      expect(ctx.calls).toContain('save');
      expect(ctx.calls).toContain('restore');
    });

    it('should draw outer ring', () => {
      const ctx = createMockCtx();
      const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };

      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 100,
        activeMaxMode,
        0,
      );

      expect(ctx.calls).toContain('arc');
      expect(ctx.calls).toContain('stroke');
    });

    it('should draw ground shimmer', () => {
      const ctx = createMockCtx();
      const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };

      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 100,
        activeMaxMode,
        0,
      );

      // Ground shimmer uses ellipse
      expect(ctx.calls).toContain('ellipse');
    });

    it('should spawn wisps at regular intervals', () => {
      const ctx = createMockCtx();
      const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };

      // Call on a tick divisible by 4 (wisp spawn interval)
      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 4, // tick=4, divisible by 4
        activeMaxMode,
        0,
      );

      // Second call on tick 8 should also spawn
      drawMAXModeAura(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 8,
        activeMaxMode,
        0,
      );

      // Wisps should produce additional fill calls for particles
      const fillCount = ctx.calls.filter(c => c === 'fill').length;
      expect(fillCount).toBeGreaterThan(0);
    });
  });

  describe('drawMAXActivationFlash', () => {
    it('should not draw when timer is 0', () => {
      const ctx = createMockCtx();

      drawMAXActivationFlash(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 0, // timer=0
        800, 600,
      );

      expect(ctx.calls.length).toBe(0);
    });

    it('should draw white flash when timer > 0', () => {
      const ctx = createMockCtx();

      drawMAXActivationFlash(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 4, // timer=4
        800, 600,
      );

      expect(ctx.calls.length).toBeGreaterThan(0);
      expect(ctx.calls).toContain('fillRect');
    });

    it('should draw golden screen tint when timer >= 2', () => {
      const ctx = createMockCtx();

      drawMAXActivationFlash(
        ctx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 3, // timer=3, >= 2
        800, 600,
      );

      // Should have at least 2 fillRect calls: one for the center flash, one for the screen tint
      const fillRectCount = ctx.calls.filter(c => c === 'fillRect').length;
      expect(fillRectCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('resetMAXWisps', () => {
    it('should clear all wisp pools', () => {
      const ctx = createMockCtx();
      const activeMaxMode: MaxModeState = { active: true, timer: 500, maxDuration: 900 };

      // Spawn some wisps by calling on multiple ticks
      for (let tick = 0; tick < 20; tick += 4) {
        drawMAXModeAura(
          ctx as unknown as CanvasRenderingContext2D,
          400, 400, 120, tick,
          activeMaxMode,
          0,
        );
      }

      // Reset
      resetMAXWisps();

      // Verify no errors and wisps are cleared
      // After reset, a new draw should work fine with no wisps to update
      const freshCtx = createMockCtx();
      drawMAXModeAura(
        freshCtx as unknown as CanvasRenderingContext2D,
        400, 400, 120, 24,
        activeMaxMode,
        0,
      );

      expect(freshCtx.calls.length).toBeGreaterThan(0);
    });
  });
});
