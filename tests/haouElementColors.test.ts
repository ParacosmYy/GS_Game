import { describe, it, expect } from 'vitest';
import { spawnHaouFlash } from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

describe('Haou Flash Element-Coded Colors', () => {
  it('Ryo Haou uses blue element burst', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'ryo');
    const flashes = particles.filter(p => p.type === 'flash' && p.color !== '#ffffff');
    expect(flashes.length).toBe(1);
    expect(flashes[0].color).toBe('#4488ff');
  });

  it('Kyo Haou uses fire orange element burst', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'kyo');
    const flashes = particles.filter(p => p.type === 'flash' && p.color !== '#ffffff');
    expect(flashes.length).toBe(1);
    expect(flashes[0].color).toBe('#ff8c1e');
  });

  it('Iori Haou uses purple element burst', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'iori');
    const flashes = particles.filter(p => p.type === 'flash' && p.color !== '#ffffff');
    expect(flashes.length).toBe(1);
    expect(flashes[0].color).toBe('#8822cc');
  });

  it('unknown charId falls back to gold', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'unknown');
    const flashes = particles.filter(p => p.type === 'flash' && p.color !== '#ffffff');
    expect(flashes.length).toBe(1);
    expect(flashes[0].color).toBe('#ffcc44');
  });

  it('Ryo sparks use blue element palette', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'ryo');
    const sparks = particles.filter(p => p.type === 'spark');
    const ryoColors = ['#ffffff', '#88ccff', '#4488ff'];
    sparks.forEach(s => {
      expect(ryoColors).toContain(s.color);
    });
  });

  it('Ryo ring uses blue element color', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 100, 200, 'ryo');
    const rings = particles.filter(p => p.type === 'ring');
    expect(rings.length).toBe(1);
    expect(rings[0].color).toBe('#4488ff');
  });

  it('always has 13 particles regardless of charId', () => {
    for (const charId of ['ryo', 'kyo', 'iori', 'unknown']) {
      const particles: Particle[] = [];
      spawnHaouFlash(particles, 100, 200, charId);
      expect(particles.length).toBe(13);
    }
  });

  it('all characters get white core flash', () => {
    for (const charId of ['ryo', 'kyo', 'iori']) {
      const particles: Particle[] = [];
      spawnHaouFlash(particles, 100, 200, charId);
      const whiteFlashes = particles.filter(p => p.type === 'flash' && p.color === '#ffffff');
      expect(whiteFlashes.length).toBe(1);
    }
  });
});
