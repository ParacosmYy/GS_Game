/**
 * VFX Consolidated Tests
 *
 * Merged from: vfx, vfxSystem, vfxPresets
 *
 * Covers: hitstop tiers, screen shake, spark presets,
 *   particle lifecycle, VFX coordination.
 */
import { describe, it, expect } from 'vitest';
import {
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  HITSTOP_COUNTER_BONUS,
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_SPECIAL, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_DM,
  getHitstopFrames,
} from '../src/core/constants.js';
import { VFXSystem } from '../src/rendering/vfx.js';
import {
  spawnCharacterHitSparks, spawnBlockFlash, spawnCounterText,
} from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ── 1. Hitstop Tiers ────────────────────────────────────────
describe('Hitstop Tiers', () => {
  it('hitstop increases with attack strength', () => {
    expect(HITSTOP_LIGHT).toBeLessThanOrEqual(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThanOrEqual(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThanOrEqual(HITSTOP_DM);
  });

  it('counter hit adds bonus hitstop frames', () => {
    expect(HITSTOP_COUNTER_BONUS).toBeGreaterThan(0);
  });

  it('getHitstopFrames returns correct values', () => {
    expect(getHitstopFrames('STAND_A')).toBe(HITSTOP_LIGHT);
    expect(getHitstopFrames('STAND_C')).toBe(HITSTOP_MEDIUM);
  });
});

// ── 2. Screen Shake ─────────────────────────────────────────
describe('Screen Shake', () => {
  it('shake intensity increases with attack strength', () => {
    expect(SHAKE_LIGHT).toBeLessThanOrEqual(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBeLessThanOrEqual(SHAKE_SPECIAL);
    expect(SHAKE_SPECIAL).toBeLessThanOrEqual(SHAKE_DM);
  });

  it('KO shake is the strongest', () => {
    expect(SHAKE_KO).toBeGreaterThanOrEqual(SHAKE_DM);
  });

  it('shake duration increases with strength', () => {
    expect(SHAKE_DURATION_LIGHT).toBeLessThanOrEqual(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThanOrEqual(SHAKE_DURATION_DM);
  });
});

// ── 3. VFXSystem Particle Lifecycle ─────────────────────────
describe('VFXSystem Particle Lifecycle', () => {
  it('starts with zero particles', () => {
    const vfx = new VFXSystem();
    expect(vfx.particles.length).toBe(0);
  });

  it('spawnHitSparks creates particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 5);
    expect(vfx.particles.length).toBeGreaterThan(0);
  });

  it('update decrements life and removes dead particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 3);
    const count = vfx.particles.length;
    for (let i = 0; i < 100; i++) vfx.update();
    expect(vfx.particles.length).toBeLessThan(count);
  });

  it('reset clears all particles', () => {
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 300, 5);
    vfx.reset();
    expect(vfx.particles.length).toBe(0);
  });
});

// ── 4. VFX Presets ──────────────────────────────────────────
describe('VFX Presets', () => {
  it('spawnCharacterHitSparks adds particles to array', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 400, 300, 5, '#ff0000');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('more sparks with higher count', () => {
    const p1: Particle[] = [];
    const p2: Particle[] = [];
    spawnCharacterHitSparks(p1, 400, 300, 3, '#ff0000');
    spawnCharacterHitSparks(p2, 400, 300, 8, '#ff0000');
    expect(p2.length).toBeGreaterThan(p1.length);
  });

  it('spawnBlockFlash creates exactly one particle', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300);
    expect(particles.length).toBe(1);
  });

  it('spawnCounterText creates counter text', () => {
    const particles: Particle[] = [];
    spawnCounterText(particles, 400, 300);
    expect(particles.length).toBeGreaterThan(0);
  });
});
