import { describe, it, expect, vi } from 'vitest';
import { spawnKyoFireKickTrail } from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

describe('Kyo Fire Kick Trail VFX', () => {
  it('spawnsKyoFireKickTrail generates 12 particles', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, 1);
    expect(particles.length).toBe(12);
  });

  it('fire arc particles trail backward from kick point', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, 1);
    // Facing right (1): arc particles should have negative vx (trail backward)
    const arcParticles = particles.slice(0, 5);
    arcParticles.forEach(p => {
      expect(p.vx).toBeLessThan(0); // trails backward
    });
  });

  it('fire core particles spread outward', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, 1);
    const coreParticles = particles.slice(5, 9);
    coreParticles.forEach(p => {
      expect(p.life).toBeGreaterThan(0);
      expect(p.size).toBeGreaterThan(0);
    });
  });

  it('embers rise with negative gravity', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, 1);
    const embers = particles.slice(9, 12);
    embers.forEach(p => {
      expect(p.vy).toBeLessThan(0); // rising
      expect(p.gravity).toBeLessThan(0); // negative gravity keeps them rising
    });
  });

  it('uses Kyo fire color palette', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, 1);
    const allColors = ['#ff4400', '#ff6622', '#ff8833', '#ffaa44', '#ffdd66', '#ffcc44'];
    particles.forEach(p => {
      expect(allColors).toContain(p.color);
    });
  });

  it('works with negative facing (left)', () => {
    const particles: Particle[] = [];
    spawnKyoFireKickTrail(particles, 100, 200, -1);
    expect(particles.length).toBe(12);
    // Facing left (-1): arc particles should have positive vx (trail backward = right)
    const arcParticles = particles.slice(0, 5);
    arcParticles.forEach(p => {
      expect(p.vx).toBeGreaterThan(0);
    });
  });

  it('VFXSystem has spawnKyoFireKickTrail wrapper', async () => {
    const { VFXSystem } = await import('../src/rendering/vfx.js');
    const vfx = new VFXSystem();
    expect(typeof vfx.spawnKyoFireKickTrail).toBe('function');
    vfx.spawnKyoFireKickTrail(100, 200, 1);
    expect(vfx.particles.length).toBe(12);
  });
});
