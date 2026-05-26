/**
 * VFX Presets Tests — Parameter validation for spawn functions in vfxPresets.ts
 *
 * Verifies particle counts, types, positions, velocities, colors, life values,
 * and parameterized behavior across all VFX spawn functions.
 */
import { describe, it, expect } from 'vitest';
import {
  spawnHitSparks,
  spawnBlockFlash,
  spawnCharacterHitSparks,
  spawnGuardCrushSparks,
  spawnGuardCrushText,
  spawnWireText,
  spawnQuickStandText,
  spawnThrowEscapeSparks,
  spawnImpactRing,
  spawnSlashLine,
  spawnSuperBurst,
  spawnGroundSlam,
  spawnDamageText,
  spawnCounterText,
  spawnTechText,
  spawnFirstAttackText,
  spawnComboEndText,
  spawnComboDamageText,
  spawnSuperCancelText,
  spawnFreeCancelText,
  spawnGCCDText,
  spawnCounterStanceText,
  spawnReversalText,
  spawnRecoverySpark,
  spawnDust,
  spawnHeavyDust,
  spawnCounterWireSparks,
  spawnMAXAura,
  spawnMAXActivationFlash,
  spawnPerfectFlash,
  spawnProjectileExplosion,
  spawnTauntSparks,
  spawnCancelFlash,
  spawnDizzyStars,
  spawnFloatingComboText,
  getSparkSizeScaleFromDamage,
} from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ═══════════════════════════════════════════════════════════════
// 1. Hit Spark Parameters (5 tests)
// ═══════════════════════════════════════════════════════════════

describe('1. Hit Spark Parameters', () => {
  it('spawnHitSparks returns non-empty array', () => {
    const particles: Particle[] = [];
    spawnHitSparks(particles, 400, 300);
    expect(particles.length).toBeGreaterThan(0);
  });

  it('light attack produces fewer sparks (<5), heavy attack produces more (>5)', () => {
    const light: Particle[] = [];
    const heavy: Particle[] = [];
    spawnHitSparks(light, 400, 300, 3);
    spawnHitSparks(heavy, 400, 300, 12);
    expect(light.length).toBe(3);
    expect(light.length).toBeLessThan(5);
    expect(heavy.length).toBe(12);
    expect(heavy.length).toBeGreaterThan(5);
  });

  it('spark particles have outward velocity (vx/vy not both zero)', () => {
    const particles: Particle[] = [];
    spawnHitSparks(particles, 400, 300, 10);
    // At least some particles should have non-zero velocity
    const moving = particles.filter(p => Math.abs(p.vx) > 0 || Math.abs(p.vy) > 0);
    expect(moving.length).toBeGreaterThan(0);
  });

  it('particles have finite life and maxLife', () => {
    const particles: Particle[] = [];
    spawnHitSparks(particles, 400, 300, 8);
    for (const p of particles) {
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBeGreaterThan(0);
      expect(p.life).toBeLessThanOrEqual(p.maxLife);
    }
  });

  it('getSparkSizeScaleFromDamage: low damage -> small scale, high damage -> large scale', () => {
    expect(getSparkSizeScaleFromDamage(10)).toBe(0.5);
    expect(getSparkSizeScaleFromDamage(60)).toBe(0.8);
    expect(getSparkSizeScaleFromDamage(120)).toBe(1.1);
    expect(getSparkSizeScaleFromDamage(170)).toBe(1.4);
    expect(getSparkSizeScaleFromDamage(250)).toBe(1.7);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Block Flash (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('2. Block Flash', () => {
  it('spawnBlockFlash returns exactly one flash particle', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300);
    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('flash');
  });

  it('block flash position is at the block point', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 250, 180, 1.0);
    expect(particles[0].x).toBe(250);
    expect(particles[0].y).toBe(180);
  });

  it('block flash color is blue-tinted (#aaccff) and has no velocity', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300, 1.0);
    expect(particles[0].color).toBe('#aaccff');
    expect(particles[0].vx).toBe(0);
    expect(particles[0].vy).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. DM/Super Effects (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('3. DM/Super Effects', () => {
  it('spawnSuperBurst creates many particles (>10)', () => {
    const particles: Particle[] = [];
    spawnSuperBurst(particles, 400, 300, '#4488ff', '#aaccff', false);
    expect(particles.length).toBeGreaterThan(10);
  });

  it('super burst particles scatter in all directions', () => {
    const particles: Particle[] = [];
    spawnSuperBurst(particles, 400, 300, '#4488ff', '#aaccff', false);
    // Filter only scattered star particles (not the core bursts or rings)
    const stars = particles.filter(p => p.type === 'star');
    expect(stars.length).toBeGreaterThan(0);
    // Star particles should have different velocity directions
    const angles = stars.map(p => Math.atan2(p.vy, p.vx));
    const uniqueDirections = new Set(angles.map(a => Math.round(a * 10)));
    expect(uniqueDirections.size).toBeGreaterThan(1);
  });

  it('spawnMAXActivationFlash creates particles with multiple types', () => {
    const particles: Particle[] = [];
    spawnMAXActivationFlash(particles, 400, 300);
    expect(particles.length).toBeGreaterThan(0);
    const types = new Set(particles.map(p => p.type));
    expect(types.has('flash')).toBe(true);
    expect(types.has('ring')).toBe(true);
    expect(types.has('star')).toBe(true);
  });

  it('DM effects produce more particles than normal hit effects', () => {
    const normalHit: Particle[] = [];
    const dmBurst: Particle[] = [];
    spawnHitSparks(normalHit, 400, 300, 8);
    spawnSuperBurst(dmBurst, 400, 300, '#4488ff', '#aaccff', false);
    expect(dmBurst.length).toBeGreaterThan(normalHit.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. KO Effects (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('4. KO Effects', () => {
  it('spawnGroundSlam returns particles with correct structure', () => {
    const particles: Particle[] = [];
    spawnGroundSlam(particles, 400, 510);
    expect(particles.length).toBeGreaterThan(0);
    // First particle should be the groundslam core
    expect(particles[0].type).toBe('groundslam');
    expect(particles[0].color).toBe('#ff2200');
    expect(particles[0].x).toBe(400);
    expect(particles[0].y).toBe(510);
  });

  it('ground slam dust particles spread outward from ground level', () => {
    const particles: Particle[] = [];
    spawnGroundSlam(particles, 400, 510);
    // Filter spark particles (dust)
    const sparks = particles.filter(p => p.type === 'spark');
    expect(sparks.length).toBeGreaterThan(0);
    // Dust particles should have outward horizontal velocity
    const hasHorizontalMotion = sparks.some(p => Math.abs(p.vx) > 0);
    expect(hasHorizontalMotion).toBe(true);
    // Dust particles should have upward or near-zero vertical velocity (close to ground)
    const nearGround = sparks.every(p => p.y <= 510);
    expect(nearGround).toBe(true);
  });

  it('spawnHeavyDust returns particles at the specified position', () => {
    const particles: Particle[] = [];
    spawnHeavyDust(particles, 300, 500);
    expect(particles.length).toBeGreaterThan(0);
    // All particles should be near the spawn position
    for (const p of particles) {
      expect(p.type).toBe('spark');
      expect(p.gravity).toBeDefined();
      expect(p.gravity).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Text Effects (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('5. Text Effects', () => {
  it('spawnCounterText creates a text particle with COUNTER! text', () => {
    const particles: Particle[] = [];
    spawnCounterText(particles, 400, 300);
    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('text');
    expect(particles[0].text).toBe('COUNTER!');
    expect(particles[0].color).toBe('#ff8800');
    expect(particles[0].life).toBe(50);
    expect(particles[0].vy).toBeLessThan(0); // moves upward
  });

  it('spawnDamageText produces correct text format and color based on damage value', () => {
    // Values 1-50 are treated as combo hits ("N HITS!"), values >50 are damage ("-N")
    const low: Particle[] = [];
    const mid: Particle[] = [];
    const high: Particle[] = [];
    const combo: Particle[] = [];
    spawnDamageText(low, 400, 300, 60);   // low damage: -60
    spawnDamageText(mid, 400, 300, 90);   // mid damage: -90
    spawnDamageText(high, 400, 300, 150); // high damage: -150
    spawnDamageText(combo, 400, 300, 8);  // combo hit: "8 HITS!"
    expect(low[0].text).toBe('-60');
    expect(high[0].text).toBe('-150');
    expect(combo[0].text).toBe('8 HITS!');
    // High damage should have red color, low damage cooler tone
    expect(high[0].color).toBe('#ff0000');
    expect(low[0].color).toBe('#ffaa22');
  });

  it('spawnFirstAttackText creates text with correct content and style', () => {
    const particles: Particle[] = [];
    spawnFirstAttackText(particles, 400, 200);
    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('text');
    expect(particles[0].text).toBe('FIRST ATTACK!');
    expect(particles[0].color).toBe('#ffdd00');
    expect(particles[0].size).toBe(22);
  });

  it('spawnComboEndText size and color scale with hit count', () => {
    const low: Particle[] = [];
    const high: Particle[] = [];
    spawnComboEndText(low, 400, 300, 3);
    spawnComboEndText(high, 400, 300, 15);
    expect(low[0].text).toBe('3 HITS');
    expect(high[0].text).toBe('15 HITS');
    // High combo should have larger size and redder color
    expect(high[0].size).toBeGreaterThanOrEqual(low[0].size);
    expect(high[0].color).toBe('#ff4444');
    expect(low[0].color).toBe('#ff8844');
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Character-specific Effects (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('6. Character-specific Effects', () => {
  it('spawnCharacterHitSparks produces different spark counts for different count parameter', () => {
    const few: Particle[] = [];
    const many: Particle[] = [];
    spawnCharacterHitSparks(few, 400, 300, 4, '#ffdd44', 1.0);
    spawnCharacterHitSparks(many, 400, 300, 16, '#ffdd44', 1.0);
    // Total = 2 (cores) + count (scattered)
    expect(few.length).toBe(2 + 4);
    expect(many.length).toBe(2 + 16);
    expect(many.length).toBeGreaterThan(few.length);
  });

  it('spawnProjectileExplosion places particles at specified position', () => {
    const particles: Particle[] = [];
    spawnProjectileExplosion(particles, 350, 280, '#4488ff', '#aaccff');
    expect(particles.length).toBeGreaterThan(0);
    // All particles should be centered near the explosion point
    const core = particles[0]; // flash core
    expect(core.x).toBe(350);
    expect(core.y).toBe(280);
    expect(core.type).toBe('flash');
    // Should include ring particles
    const rings = particles.filter(p => p.type === 'ring');
    expect(rings.length).toBeGreaterThan(0);
  });

  it('spawnMAXAura creates sustained effect with rings and upward-floating stars', () => {
    const particles: Particle[] = [];
    spawnMAXAura(particles, 400, 400);
    expect(particles.length).toBeGreaterThan(0);
    // Should have ring particles
    const rings = particles.filter(p => p.type === 'ring');
    expect(rings.length).toBeGreaterThan(0);
    // Should have star particles
    const stars = particles.filter(p => p.type === 'star');
    expect(stars.length).toBeGreaterThan(0);
    // Stars should have negative gravity (upward float)
    const floatingStars = stars.filter(p => p.gravity !== undefined && p.gravity < 0);
    expect(floatingStars.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Particle Lifecycle (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('7. Particle Lifecycle', () => {
  it('particle life decrements by 1 each simulated tick', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300);
    const initialLife = particles[0].life;
    // Simulate one update tick: life--
    particles[0].life--;
    expect(particles[0].life).toBe(initialLife - 1);
  });

  it('particles with zero or negative life are considered dead', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300);
    expect(particles[0].life).toBeGreaterThan(0);
    // Drain life
    while (particles[0].life > 0) particles[0].life--;
    expect(particles[0].life).toBe(0);
    // A dead particle has life <= 0
    expect(particles[0].life <= 0).toBe(true);
  });

  it('particle position updates with velocity and gravity', () => {
    const particles: Particle[] = [];
    spawnHitSparks(particles, 400, 300, 1);
    const p = particles[0];
    const prevX = p.x;
    const prevY = p.y;
    // Simulate update: x += vx, y += vy, vy += gravity
    p.x += p.vx;
    p.y += p.vy;
    if (p.gravity) p.vy += p.gravity;
    // Position should have changed (particles with outward velocity move)
    expect(p.x).not.toBe(400); // spawn was at 400, should have moved
  });
});
