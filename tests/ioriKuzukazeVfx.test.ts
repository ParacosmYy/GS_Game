import { describe, it, expect } from 'vitest';
import { spawnIoriKuzukazeVFX } from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

describe('Iori Kuzukaze Dark Vortex VFX', () => {
  it('generates 14 particles', () => {
    const particles: Particle[] = [];
    spawnIoriKuzukazeVFX(particles, 100, 200, 1);
    expect(particles.length).toBe(14);
  });

  it('has 6 spiral orbs with dark purple palette', () => {
    const particles: Particle[] = [];
    spawnIoriKuzukazeVFX(particles, 100, 200, 1);
    const orbs = particles.slice(0, 6);
    const purpleColors = ['#6600aa', '#330066'];
    orbs.forEach(p => {
      expect(purpleColors).toContain(p.color);
    });
  });

  it('has 4 claw slash particles', () => {
    const particles: Particle[] = [];
    spawnIoriKuzukazeVFX(particles, 100, 200, 1);
    const claws = particles.slice(6, 10);
    claws.forEach(p => {
      expect(p.type).toBe('slash');
      expect(p.color).toBe('#cc88ff');
    });
  });

  it('has 4 dark wisps with negative gravity', () => {
    const particles: Particle[] = [];
    spawnIoriKuzukazeVFX(particles, 100, 200, 1);
    const wisps = particles.slice(10, 14);
    wisps.forEach(p => {
      expect(p.gravity).toBeLessThan(0);
      expect(p.color).toBe('#440088');
    });
  });

  it('works with negative facing (left)', () => {
    const particles: Particle[] = [];
    spawnIoriKuzukazeVFX(particles, 100, 200, -1);
    expect(particles.length).toBe(14);
    const claws = particles.slice(6, 10);
    claws.forEach(p => {
      expect(p.type).toBe('slash');
    });
  });

  it('VFXSystem has spawnIoriKuzukazeVFX wrapper', async () => {
    const { VFXSystem } = await import('../src/rendering/vfx.js');
    const vfx = new VFXSystem();
    expect(typeof vfx.spawnIoriKuzukazeVFX).toBe('function');
    vfx.spawnIoriKuzukazeVFX(100, 200, 1);
    expect(vfx.particles.length).toBe(14);
  });
});
