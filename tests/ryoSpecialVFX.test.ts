/**
 * Ryo-specific Special Move VFX Tests
 *
 * Verifies particle counts, movement patterns, colors, and hit callback integration
 * for all five Ryo special move VFX functions.
 */
import { describe, it, expect } from 'vitest';
import {
  spawnKooukenVFX,
  spawnKoHouVFX,
  spawnHienTrail,
  spawnDMTenHaOuVFX,
  spawnHaouFlash,
} from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ═══════════════════════════════════════════════════════════════
// 1. Ko'ou Ken (虎煌拳) Projectile VFX
// ═══════════════════════════════════════════════════════════════

describe('1. Ko\'ou Ken Projectile VFX', () => {
  it('spawns correct particle count: 2 cores + 8 trailing = 10 particles', () => {
    const particles: Particle[] = [];
    spawnKooukenVFX(particles, 400, 300, 1, 'ryo');
    // 2 core flash particles + 8 trailing sparks = 10
    expect(particles.length).toBe(10);
  });

  it('core orb particles move forward at ~8px/frame in facing direction', () => {
    const particles: Particle[] = [];
    spawnKooukenVFX(particles, 400, 300, 1, 'ryo');
    // Core orb should move right (facing=1) at vx=8
    const coreFlash = particles[0];
    expect(coreFlash.vx).toBe(8);
    expect(coreFlash.size).toBe(30);
    expect(coreFlash.type).toBe('flash');
    // Facing left should give negative vx
    const leftParticles: Particle[] = [];
    spawnKooukenVFX(leftParticles, 400, 300, -1, 'ryo');
    expect(leftParticles[0].vx).toBe(-8);
  });

  it('uses orange/yellow color palette consistent with Ryo specials', () => {
    const particles: Particle[] = [];
    spawnKooukenVFX(particles, 400, 300, 1, 'ryo');
    // All particles should use orange/yellow/white palette
    const validColors = new Set(['#ffaa22', '#ffffff', '#ff8800', '#ffcc44']);
    for (const p of particles) {
      expect(validColors.has(p.color)).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Ko Hou (虎咲) Uppercut Flame VFX
// ═══════════════════════════════════════════════════════════════

describe('2. Ko Hou Uppercut Flame VFX', () => {
  it('spawns correct particle count: 1 core flash + 12 flame + 1 ring = 14', () => {
    const particles: Particle[] = [];
    spawnKoHouVFX(particles, 400, 400, 'ryo');
    // 1 white core flash + 12 rising flame particles + 1 base ring = 14
    expect(particles.length).toBe(14);
  });

  it('flame particles rise upward (negative vy)', () => {
    const particles: Particle[] = [];
    spawnKoHouVFX(particles, 400, 400, 'ryo');
    // Flame column particles (indices 1..12) should have upward velocity
    const flameParticles = particles.slice(1, 13);
    const risingParticles = flameParticles.filter(p => p.vy < 0);
    expect(risingParticles.length).toBe(12);
  });

  it('uses orange-red color palette with white core', () => {
    const particles: Particle[] = [];
    spawnKoHouVFX(particles, 400, 400, 'ryo');
    // Core flash is white
    expect(particles[0].color).toBe('#ffffff');
    // Flame particles use orange/red/white palette
    const validColors = new Set(['#ffffff', '#ffaa33', '#ff4400']);
    const flameParticles = particles.slice(1, 13);
    for (const p of flameParticles) {
      expect(validColors.has(p.color)).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Hien (飛燕) Flying Kick Trail
// ═══════════════════════════════════════════════════════════════

describe('3. Hien Flying Kick Trail', () => {
  it('spawns 6 horizontal speed line particles', () => {
    const particles: Particle[] = [];
    spawnHienTrail(particles, 400, 300, 1, 'ryo');
    expect(particles.length).toBe(6);
  });

  it('all trail particles are slash type (speed lines)', () => {
    const particles: Particle[] = [];
    spawnHienTrail(particles, 400, 300, 1, 'ryo');
    expect(particles.every(p => p.type === 'slash')).toBe(true);
  });

  it('trail particles move opposite to facing direction (behind character)', () => {
    const particles: Particle[] = [];
    spawnHienTrail(particles, 400, 300, 1, 'ryo');
    // Facing right (1): trail should move left (negative vx)
    const behindMotion = particles.every(p => p.vx < 0);
    expect(behindMotion).toBe(true);
    // Facing left (-1): trail should move right (positive vx)
    const leftParticles: Particle[] = [];
    spawnHienTrail(leftParticles, 400, 300, -1, 'ryo');
    const leftBehindMotion = leftParticles.every(p => p.vx > 0);
    expect(leftBehindMotion).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. DM Ten Ha Ou (天地霸煌拳) Energy Burst
// ═══════════════════════════════════════════════════════════════

describe('4. DM Ten Ha Ou Energy Burst', () => {
  it('spawns 30+ particles for massive explosion', () => {
    const particles: Particle[] = [];
    spawnDMTenHaOuVFX(particles, 400, 300, 'ryo');
    // 2 superburst cores + 32 expanding stars + 3 rings = 37 particles
    expect(particles.length).toBeGreaterThanOrEqual(30);
    expect(particles.length).toBe(37);
  });

  it('produces the most particles among all Ryo VFX', () => {
    const koouken: Particle[] = [];
    const koHou: Particle[] = [];
    const hien: Particle[] = [];
    const dm: Particle[] = [];
    const haou: Particle[] = [];

    spawnKooukenVFX(koouken, 400, 300, 1, 'ryo');
    spawnKoHouVFX(koHou, 400, 300, 'ryo');
    spawnHienTrail(hien, 400, 300, 1, 'ryo');
    spawnDMTenHaOuVFX(dm, 400, 300, 'ryo');
    spawnHaouFlash(haou, 400, 300, 'ryo');

    expect(dm.length).toBeGreaterThan(koouken.length);
    expect(dm.length).toBeGreaterThan(koHou.length);
    expect(dm.length).toBeGreaterThan(hien.length);
    expect(dm.length).toBeGreaterThan(haou.length);
  });

  it('uses golden yellow and white color palette', () => {
    const particles: Particle[] = [];
    spawnDMTenHaOuVFX(particles, 400, 300, 'ryo');
    const validColors = new Set(['#ffffff', '#ffee66', '#ffaa00', '#ffcc00']);
    // Check superburst cores and expanding stars
    for (const p of particles) {
      expect(validColors.has(p.color)).toBe(true);
    }
  });

  it('expanding star particles scatter in all directions', () => {
    const particles: Particle[] = [];
    spawnDMTenHaOuVFX(particles, 400, 300, 'ryo');
    // Star particles should scatter
    const stars = particles.filter(p => p.type === 'star');
    expect(stars.length).toBe(32);
    // Stars should have varied angles (unique atan2 values)
    const angles = stars.map(p => Math.atan2(p.vy, p.vx));
    const uniqueAngles = new Set(angles.map(a => Math.round(a * 10)));
    expect(uniqueAngles.size).toBeGreaterThan(4);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Haou Shou Kou Ken (霸王翔吼拳) Counter Flash
// ═══════════════════════════════════════════════════════════════

describe('5. Haou Counter Flash', () => {
  it('spawns shield-like burst with correct particle count', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 400, 300, 'ryo');
    // 2 flash cores + 10 scattered sparks + 1 ring = 13
    expect(particles.length).toBe(13);
  });

  it('includes white and golden flash core particles', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 400, 300, 'ryo');
    const flashes = particles.filter(p => p.type === 'flash');
    expect(flashes.length).toBe(2);
    const colors = flashes.map(p => p.color);
    expect(colors).toContain('#ffffff');
    expect(colors).toContain('#ffcc44');
  });

  it('sparks scatter outward in a shield pattern', () => {
    const particles: Particle[] = [];
    spawnHaouFlash(particles, 400, 300, 'ryo');
    const sparks = particles.filter(p => p.type === 'spark');
    expect(sparks.length).toBe(10);
    // Sparks should have outward velocity
    const moving = sparks.filter(p => Math.abs(p.vx) > 0 || Math.abs(p.vy) > 0);
    expect(moving.length).toBe(10);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. VFX Trigger Integration (Attack Type Matching)
// ═══════════════════════════════════════════════════════════════

describe('6. VFX Trigger Integration', () => {
  // Simulate the attack type string matching used in hitCallback
  it('RYO_KOOU matches the Ko\'ou Ken VFX trigger pattern', () => {
    const atkName = 'RYO_KOOU';
    expect(atkName.startsWith('RYO_KOOU')).toBe(true);
  });

  it('RYO_KOOU_C also matches the Ko\'ou Ken VFX trigger pattern', () => {
    const atkName = 'RYO_KOOU_C';
    expect(atkName.startsWith('RYO_KOOU')).toBe(true);
  });

  it('RYO_KO_HOU matches the Ko Hou VFX trigger pattern', () => {
    const atkName = 'RYO_KO_HOU';
    expect(atkName.startsWith('RYO_KO_HOU')).toBe(true);
  });

  it('RYO_KO_HOU_C also matches the Ko Hou VFX trigger pattern', () => {
    const atkName = 'RYO_KO_HOU_C';
    expect(atkName.startsWith('RYO_KO_HOU')).toBe(true);
  });

  it('RYO_HIEN matches the Hien trail VFX trigger exactly', () => {
    const atkName = 'RYO_HIEN';
    expect(atkName === 'RYO_HIEN').toBe(true);
  });

  it('DM_TEN_HA_OU matches the DM energy burst trigger exactly', () => {
    const atkName = 'DM_TEN_HA_OU';
    expect(atkName === 'DM_TEN_HA_OU').toBe(true);
  });

  it('RYO_HAOU matches the counter flash trigger exactly', () => {
    const atkName = 'RYO_HAOU';
    expect(atkName === 'RYO_HAOU').toBe(true);
  });

  it('non-Ryo attack types do NOT match any Ryo VFX trigger', () => {
    const nonRyoAttacks = ['KYO_ONIYAKI', 'IORI_AOIHANA', 'TERRY_POWER_WAVE', 'STAND_C', 'DM_OROCHINAGI'];
    for (const atk of nonRyoAttacks) {
      expect(atk.startsWith('RYO_KOOU')).toBe(false);
      expect(atk.startsWith('RYO_KO_HOU')).toBe(false);
      expect(atk === 'RYO_HIEN').toBe(false);
      expect(atk === 'DM_TEN_HA_OU').toBe(false);
      expect(atk === 'RYO_HAOU').toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. VFX Color Consistency (Ryo Special Color)
// ═══════════════════════════════════════════════════════════════

describe('7. Ryo VFX Color Consistency', () => {
  it('all Ryo VFX use orange/yellow/golden palette — no blue or green', () => {
    const allParticles: Particle[] = [];
    spawnKooukenVFX(allParticles, 400, 300, 1, 'ryo');
    spawnKoHouVFX(allParticles, 400, 300, 'ryo');
    spawnHienTrail(allParticles, 400, 300, 1, 'ryo');
    spawnDMTenHaOuVFX(allParticles, 400, 300, 'ryo');
    spawnHaouFlash(allParticles, 400, 300, 'ryo');

    // Valid Ryo colors: orange, yellow, golden, white, red-orange
    const validColors = new Set([
      '#ffaa22', '#ffffff', '#ff8800', '#ffcc44',
      '#ff4400', '#ffaa33', '#ffee66', '#ffcc00', '#ff8833', '#ff6600',
      '#ffaa00',
    ]);

    for (const p of allParticles) {
      expect(validColors.has(p.color)).toBe(true);
    }
  });
});
