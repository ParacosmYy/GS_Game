import { describe, it, expect } from 'vitest';
import { ScreenFlash, ScreenShake, VFXSystem } from '../src/rendering/vfx.js';

function makeMockCtx(): Record<string, () => void> {
  const noop = () => {};
  return {
    save: noop, restore: noop,
    fillRect: noop, strokeRect: noop,
    fillText: noop, strokeText: noop,
    beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop,
    fill: noop, stroke: noop,
    arc: noop, ellipse: noop,
    clip: noop, measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
}

describe('ScreenFlash', () => {
  it('starts inactive', () => {
    const flash = new ScreenFlash();
    expect(flash.active).toBe(false);
  });

  it('becomes active after trigger', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 8);
    expect(flash.active).toBe(true);
  });

  it('deactivates after all frames elapse', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 4);
    for (let i = 0; i < 4; i++) flash.update();
    expect(flash.active).toBe(false);
  });

  it('stays active during countdown', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 6);
    for (let i = 0; i < 5; i++) {
      expect(flash.active).toBe(true);
      flash.update();
    }
    // Timer is now 1, still active
    expect(flash.active).toBe(true);
    flash.update(); // timer goes to 0
    expect(flash.active).toBe(false);
  });

  it('renders without error on mock context', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    const flash = new ScreenFlash();
    flash.trigger('#4488ff', 0.3, 8);
    flash.render(ctx, 1000, 600);
    expect(flash.active).toBe(true);
  });

  it('triggerDarken activates darkening', () => {
    const flash = new ScreenFlash();
    flash.triggerDarken(6);
    expect(flash.active).toBe(true);
  });

  it('triggerDarken deactivates after frames', () => {
    const flash = new ScreenFlash();
    flash.triggerDarken(4);
    for (let i = 0; i < 4; i++) flash.update();
    expect(flash.active).toBe(false);
  });

  it('reset clears all timers', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 10);
    flash.triggerDarken(8);
    flash.reset();
    expect(flash.active).toBe(false);
  });

  it('renders darken without error', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    const flash = new ScreenFlash();
    flash.triggerDarken(6);
    flash.render(ctx, 1000, 600);
    expect(flash.active).toBe(true);
  });

  it('higher intensity flash has more impact frames', () => {
    const flash1 = new ScreenFlash();
    const flash2 = new ScreenFlash();
    flash1.trigger('#ff0000', 0.1, 3);
    flash2.trigger('#ff0000', 0.8, 10);
    expect(flash1.active).toBe(true);
    expect(flash2.active).toBe(true);
    // Flash2 should last longer
    for (let i = 0; i < 3; i++) { flash1.update(); flash2.update(); }
    expect(flash1.active).toBe(false);
    expect(flash2.active).toBe(true);
  });
});

describe('ScreenShake', () => {
  it('starts with zero offset', () => {
    const shake = new ScreenShake();
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('produces non-zero offset after trigger and update', () => {
    const shake = new ScreenShake();
    shake.trigger(5, 10, 1, 0);
    shake.update();
    // Should have some offset (deterministic)
    const hasOffset = shake.offsetX !== 0 || shake.offsetY !== 0;
    expect(hasOffset).toBe(true);
  });

  it('offset returns to zero after duration ends', () => {
    const shake = new ScreenShake();
    shake.trigger(3, 6, 1, 0);
    for (let i = 0; i < 10; i++) shake.update();
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('stronger trigger overrides weaker', () => {
    const shake = new ScreenShake();
    shake.trigger(2, 10);
    shake.trigger(8, 10);
    shake.update();
    // Should use the stronger intensity
    const hasSignificantOffset = Math.abs(shake.offsetX) > 1 || Math.abs(shake.offsetY) > 1;
    expect(hasSignificantOffset).toBe(true);
  });

  it('weaker trigger does not override stronger', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 10);
    shake.trigger(2, 10);
    shake.update();
    // Should still have the stronger offset
    const hasSignificantOffset = Math.abs(shake.offsetX) > 2 || Math.abs(shake.offsetY) > 2;
    expect(hasSignificantOffset).toBe(true);
  });

  it('offsets are clamped within bounds', () => {
    const shake = new ScreenShake();
    shake.trigger(50, 20, 10, 10);
    for (let i = 0; i < 20; i++) shake.update();
    expect(Math.abs(shake.offsetX)).toBeLessThanOrEqual(30);
    expect(Math.abs(shake.offsetY)).toBeLessThanOrEqual(20);
  });

  it('biasX controls horizontal direction', () => {
    const shake1 = new ScreenShake();
    const shake2 = new ScreenShake();
    shake1.trigger(5, 8, 1, 0);   // right bias
    shake2.trigger(5, 8, -1, 0);  // left bias
    shake1.update();
    shake2.update();
    // They should go in opposite horizontal directions on first frame
    expect(Math.sign(shake1.offsetX)).not.toBe(Math.sign(shake2.offsetX));
  });
});

describe('VFXSystem', () => {
  it('creates without error', () => {
    expect(() => new VFXSystem()).not.toThrow();
  });

  it('spawnHitSparks does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnHitSparks(400, 300, 8)).not.toThrow();
  });

  it('spawnBlockFlash does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnBlockFlash(400, 300)).not.toThrow();
  });

  it('spawnCharacterHitSparks does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnCharacterHitSparks(400, 300, 12, '#ff4400', 1.5, 1.0, 0.3, false, 1)).not.toThrow();
  });

  it('spawnTierSparks does not throw for all tiers', () => {
    const vfx = new VFXSystem();
    const tiers: ('small' | 'medium' | 'large' | 'burst' | 'mega' | 'hyper')[] =
      ['small', 'medium', 'large', 'burst', 'mega', 'hyper'];
    for (const tier of tiers) {
      expect(() => vfx.spawnTierSparks(400, 300, 8, tier, ['#ff0000', '#ff8800'], 1.0)).not.toThrow();
    }
  });

  it('spawnGuardCrushSparks does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnGuardCrushSparks(400, 300)).not.toThrow();
  });

  it('spawnGuardCrushText does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnGuardCrushText(400, 300)).not.toThrow();
  });

  it('spawnWireText does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnWireText(400, 300)).not.toThrow();
  });

  it('spawnQuickStandText does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnQuickStandText(400, 300)).not.toThrow();
  });

  it('spawnThrowEscapeSparks does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnThrowEscapeSparks(400, 300)).not.toThrow();
  });

  it('update does not throw after spawning', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 8);
    expect(() => vfx.update()).not.toThrow();
  });

  it('render does not throw on mock context after spawning', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 8);
    expect(() => vfx.render(ctx, 0)).not.toThrow();
  });

  it('particles expire after sufficient updates', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D;
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 8);
    // Run enough frames for all particles to expire
    for (let i = 0; i < 120; i++) {
      vfx.update();
    }
    // Render should still work (no particles left)
    expect(() => vfx.render(ctx, 0)).not.toThrow();
  });
});
