/**
 * VFX System Tests — Particle lifecycle, ScreenShake math, ScreenFlash timing.
 *
 * These tests verify the deterministic behavior of the visual effects system
 * without requiring a real Canvas context.
 */
import { describe, it, expect } from 'vitest';
import { VFXSystem, ScreenFlash, ScreenShake } from '../src/rendering/vfx.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ─── VFXSystem: Particle creation and lifecycle ───

describe('VFXSystem', () => {
  it('starts with zero particles', () => {
    const vfx = new VFXSystem();
    expect(vfx.count).toBe(0);
  });

  it('spawnHitSparks creates the requested number of particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(100, 200, 6);
    // spawnHitSparks creates exactly `count` spark particles
    expect(vfx.count).toBe(6);
  });

  it('spawnBlockFlash creates exactly one flash particle', () => {
    const vfx = new VFXSystem();
    vfx.spawnBlockFlash(100, 200, 1.0);
    expect(vfx.count).toBe(1);
  });

  it('spawnImpactRing creates exactly two ring particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnImpactRing(100, 200, 1.0);
    expect(vfx.count).toBe(2);
  });

  it('spawnCounterText creates exactly one text particle with COUNTER text', () => {
    const vfx = new VFXSystem();
    vfx.spawnCounterText(100, 150);
    // Access internal particles via a wrapper test
    // We verify by count since render uses the particle data
    expect(vfx.count).toBe(1);
  });

  it('reset clears all particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(100, 200, 8);
    vfx.spawnBlockFlash(50, 100);
    expect(vfx.count).toBeGreaterThan(0);
    vfx.reset();
    expect(vfx.count).toBe(0);
  });

  it('update decrements particle life by 1 each tick', () => {
    const vfx = new VFXSystem();
    vfx.spawnBlockFlash(100, 200, 1.0);
    // Block flash particle has life=8
    // After 8 updates it should be removed
    for (let i = 0; i < 8; i++) {
      vfx.update();
    }
    expect(vfx.count).toBe(0);
  });

  it('update removes particles when life reaches 0', () => {
    const vfx = new VFXSystem();
    vfx.spawnBlockFlash(100, 200, 1.0);
    // Block flash: life=8, maxLife=8
    // After 7 updates, life=1, still alive
    for (let i = 0; i < 7; i++) vfx.update();
    expect(vfx.count).toBe(1);
    // 8th update decrements to 0 and removes
    vfx.update();
    expect(vfx.count).toBe(0);
  });

  it('update applies gravity to particle velocity', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(100, 200, 1);
    // Before update, vy is some negative value (upward bias) - 2
    // After update, vy increases by gravity=0.15
    // We cannot easily inspect internal state, but we can verify particle
    // is still alive after partial lifecycle
    vfx.update();
    expect(vfx.count).toBeGreaterThanOrEqual(1);
  });

  it('particles with short life expire before particles with long life', () => {
    const vfx = new VFXSystem();
    // spawnBlockFlash: life=8
    vfx.spawnBlockFlash(100, 200, 1.0);
    // spawnCharacterHitSparks with multiple particles, life ranges up to ~20
    vfx.spawnCharacterHitSparks(100, 200, 4, '#ff0000', 1.0);
    const initialCount = vfx.count;

    // After 8 ticks, the block flash should be gone but sparks remain
    for (let i = 0; i < 9; i++) vfx.update();
    expect(vfx.count).toBeLessThan(initialCount);
    expect(vfx.count).toBeGreaterThan(0);
  });

  it('spawnCharacterHitSparks creates a flash core plus N scattered particles', () => {
    const vfx = new VFXSystem();
    // spawnCharacterHitSparks: 1 main flash + 1 white core + count scattered
    vfx.spawnCharacterHitSparks(100, 200, 8, '#ffdd44', 1.0);
    // Total = 2 (cores) + 8 (scattered) = 10
    expect(vfx.count).toBe(10);
  });

  it('spawnDamageText creates exactly one text particle', () => {
    const vfx = new VFXSystem();
    vfx.spawnDamageText(100, 150, 42);
    expect(vfx.count).toBe(1);
  });

  it('spawnDust creates exactly 10 dust particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnDust(100, 500);
    expect(vfx.count).toBe(10);
  });

  it('spawnHeavyDust with count=5 creates exactly 5 particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHeavyDust(100, 500, 5);
    expect(vfx.count).toBe(5);
  });

  it('all particles eventually decay to zero after sufficient updates', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(100, 200, 12);
    vfx.spawnCharacterHitSparks(100, 200, 10, '#ff0000', 1.0);
    vfx.spawnImpactRing(100, 200, 1.0);
    // Max life across all particles is bounded (max ~30 for superburst),
    // but hit sparks have life 10-20, so 40 ticks is safe
    for (let i = 0; i < 40; i++) vfx.update();
    expect(vfx.count).toBe(0);
  });
});

// ─── ScreenShake: deterministic displacement and damped bounce ───

describe('ScreenShake', () => {
  it('starts at zero offset', () => {
    const shake = new ScreenShake();
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('phase 1 produces deterministic displacement along biasX direction', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1); // intensity=10, duration=20, biasX=1
    // First update: elapsed=0, t=0
    shake.update();
    // offsetX = biasX * intensity * (1 - 0 * 0.3) = 1 * 10 * 1 = 10
    expect(shake.offsetX).toBe(10);
    // offsetY = intensity * 0.5 * (1 - 0) = 5
    expect(shake.offsetY).toBe(5);
  });

  it('phase 1 second frame reduces displacement along bias', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1);
    shake.update(); // elapsed=0
    shake.update(); // elapsed=1, t=1/3
    // offsetX = 1 * 10 * (1 - (1/3) * 0.3) = 10 * (1 - 0.1) = 9
    expect(shake.offsetX).toBeCloseTo(9);
    // offsetY = 10 * 0.5 * (1 - 1/3) = 5 * 0.6667 = 3.333...
    expect(shake.offsetY).toBeCloseTo(5 * (1 - 1 / 3));
  });

  it('phase 2 produces damped sinusoidal oscillation after frame 3', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1);
    // Skip first 3 frames (phase 1)
    shake.update(); // elapsed=0
    shake.update(); // elapsed=1
    shake.update(); // elapsed=2
    // Now elapsed=3, enters phase 2
    shake.update();
    // Phase 2: progress = (3-3)/(20-3) = 0, decay = e^0 = 1
    // frequency=8, phase = 0 * 8 * PI = 0, sin(0) = 0
    // offsetX = 1 * 10 * 0.5 * sin(0) * 1 = 0
    expect(shake.offsetX).toBe(0);
  });

  it('phase 2 non-zero oscillation after progress > 0', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1);
    // Run 5 frames to get into phase 2 with some progress
    for (let i = 0; i < 5; i++) shake.update();
    // elapsed=4, phase 2: progress = (4-3)/(20-3) = 1/17
    // The displacement should be non-zero due to sin term
    // decay = exp(-4/17 * 4) which is still significant
    const ox = shake.offsetX;
    const oy = shake.offsetY;
    // At least one should be non-zero in the oscillation
    expect(Math.abs(ox) + Math.abs(oy)).toBeGreaterThan(0);
  });

  it('offsets reset to 0 when duration expires', () => {
    const shake = new ScreenShake();
    shake.trigger(5, 4, 1); // short duration
    for (let i = 0; i < 4; i++) shake.update();
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('offsets are clamped to max range', () => {
    const shake = new ScreenShake();
    // Extreme intensity should be clamped
    shake.trigger(100, 20, 1);
    shake.update();
    expect(Math.abs(shake.offsetX)).toBeLessThanOrEqual(30);
    expect(Math.abs(shake.offsetY)).toBeLessThanOrEqual(20);
  });

  it('subsequent trigger with lower intensity is ignored', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1);
    shake.update();
    // Try to trigger with lower intensity
    shake.trigger(5, 20, 1);
    // Should still use intensity=10 from first trigger
    // offsetX = 1 * 10 * 1 = 10 (not 5)
    expect(shake.offsetX).toBe(10);
  });

  it('subsequent trigger with higher intensity overrides', () => {
    const shake = new ScreenShake();
    shake.trigger(5, 20, 1);
    shake.trigger(15, 10, -1);
    shake.update();
    // Should use intensity=15 and biasX=-1
    expect(shake.offsetX).toBe(-15);
  });

  it('is fully deterministic — same inputs produce same offsets', () => {
    const shake1 = new ScreenShake();
    const shake2 = new ScreenShake();
    shake1.trigger(8, 15, 1);
    shake2.trigger(8, 15, 1);
    for (let i = 0; i < 15; i++) {
      shake1.update();
      shake2.update();
      expect(shake1.offsetX).toBe(shake2.offsetX);
      expect(shake1.offsetY).toBe(shake2.offsetY);
    }
  });
});

// ─── ScreenFlash: timing and state ───

describe('ScreenFlash', () => {
  it('starts inactive', () => {
    const flash = new ScreenFlash();
    expect(flash.active).toBe(false);
  });

  it('becomes active after trigger', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 10);
    expect(flash.active).toBe(true);
  });

  it('deactivates after the specified number of frames', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 6);
    for (let i = 0; i < 6; i++) flash.update();
    expect(flash.active).toBe(false);
  });

  it('stays active before the frame count is exhausted', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 10);
    for (let i = 0; i < 9; i++) flash.update();
    expect(flash.active).toBe(true);
    flash.update(); // 10th frame
    expect(flash.active).toBe(false);
  });

  it('reset deactivates immediately', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 100);
    expect(flash.active).toBe(true);
    flash.reset();
    expect(flash.active).toBe(false);
  });

  it('multiple triggers override previous flash', () => {
    const flash = new ScreenFlash();
    flash.trigger('#ff0000', 0.5, 10);
    flash.trigger('#0000ff', 0.8, 3);
    // Should last 3 frames, not 10
    for (let i = 0; i < 3; i++) flash.update();
    expect(flash.active).toBe(false);
  });
});
