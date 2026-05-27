import { describe, it, expect, vi } from 'vitest';
import { spawnHienLandingDust } from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

describe('Hien Landing Dust VFX', () => {
  it('spawnsHienLandingDust generates 5 particles', () => {
    const particles: Particle[] = [];
    spawnHienLandingDust(particles, 100, 200);
    expect(particles.length).toBe(5);
  });

  it('particles fan upward (negative vy)', () => {
    const particles: Particle[] = [];
    spawnHienLandingDust(particles, 100, 200);
    particles.forEach(p => {
      expect(p.vy).toBeLessThan(0); // dust rises
    });
  });

  it('uses earth-tone colors', () => {
    const particles: Particle[] = [];
    spawnHienLandingDust(particles, 100, 200);
    const dustColors = ['#9a7b5d', '#bb9a73', '#887766', '#aa9070', '#776655'];
    particles.forEach(p => {
      expect(dustColors).toContain(p.color);
    });
  });

  it('particles have gravity pulling them down', () => {
    const particles: Particle[] = [];
    spawnHienLandingDust(particles, 100, 200);
    particles.forEach(p => {
      expect(p.gravity).toBeGreaterThan(0); // falls back down
    });
  });

  it('VFXSystem has spawnHienLandingDust wrapper', async () => {
    const { VFXSystem } = await import('../src/rendering/vfx.js');
    const vfx = new VFXSystem();
    expect(typeof vfx.spawnHienLandingDust).toBe('function');
    vfx.spawnHienLandingDust(100, 200);
    expect(vfx.particles.length).toBe(5);
  });
});
