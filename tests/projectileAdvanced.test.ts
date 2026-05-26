/**
 * Projectile Advanced Tests
 *
 * Covers: projectile level system, clash resolution, EX/MAX mode,
 * trail rendering data, DM super-level projectiles.
 */
import { describe, it, expect } from 'vitest';
import { Projectile, resolveProjectileClashes } from '../src/entities/projectile.js';
import type { ProjectileLevel } from '../src/entities/projectile.js';
import { PROJECTILE_SPEED } from '../src/core/constants.js';

// ── 1. Projectile Level System ──────────────────────────────────
describe('Projectile Level System', () => {
  it('default projectile is weak level', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    expect(p.level).toBe('weak');
  });

  it('can create strong level projectile', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    expect(p.level).toBe('strong');
  });

  it('can create super level projectile (DM)', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'DM', 'super');
    expect(p.level).toBe('super');
  });

  it('isEX flag defaults to false', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    expect(p.isEX).toBe(false);
  });

  it('can create EX projectile', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'strong', 100, true);
    expect(p.isEX).toBe(true);
    expect(p.level).toBe('strong');
  });

  it('EX projectile has higher damage than weak', () => {
    const weak = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak', 70, false);
    const ex = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'strong', 130, true);
    expect(ex.baseDamage).toBeGreaterThan(weak.baseDamage);
  });

  it('super level projectile has highest damage', () => {
    const weak = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak', 70);
    const super_ = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'DM', 'super', 200);
    expect(super_.baseDamage).toBeGreaterThan(weak.baseDamage);
  });
});

// ── 2. Projectile Clash Resolution ──────────────────────────────
describe('Projectile Clash Resolution', () => {
  it('same-level projectiles destroy each other', () => {
    const p1 = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(500, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    // Move them to overlap
    p1.x = 450; p2.x = 450;
    const result = p1.resolveClash(p2);
    expect(result).toBe('both_destroyed');
  });

  it('strong beats weak', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const result = p1.resolveClash(p2);
    expect(result).toBe('this_survives');
  });

  it('super beats strong', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'DM', 'super');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    const result = p1.resolveClash(p2);
    expect(result).toBe('this_survives');
  });

  it('super beats weak', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'DM', 'super');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const result = p1.resolveClash(p2);
    expect(result).toBe('this_survives');
  });

  it('strong destroys weak from other side', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    const result = p1.resolveClash(p2);
    expect(result).toBe('other_survives');
  });

  it('same-owner projectiles do not clash', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const result = p1.resolveClash(p2);
    expect(result).toBeNull();
  });

  it('non-overlapping projectiles do not clash', () => {
    const p1 = new Projectile(100, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(800, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const result = p1.resolveClash(p2);
    expect(result).toBeNull();
  });

  it('destroyed projectiles become inactive', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    p1.resolveClash(p2);
    // After resolving, both should be destroyable
    p1.destroy();
    p2.destroy();
    expect(p1.active).toBe(false);
    expect(p2.active).toBe(false);
  });
});

// ── 3. Clash Event Resolution (Multi-projectile) ────────────────
describe('Multi-Projectile Clash Events', () => {
  it('resolves clash between two opposing projectiles', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const events = resolveProjectileClashes([p1, p2]);
    expect(events).toHaveLength(1);
    expect(events[0].destroyedProjectiles).toHaveLength(2);
    expect(events[0].survivor).toBeNull();
  });

  it('higher level survives clash', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const events = resolveProjectileClashes([p1, p2]);
    expect(events).toHaveLength(1);
    expect(events[0].survivor).toBe(p1);
    expect(events[0].destroyedProjectiles).toHaveLength(1);
    expect(events[0].destroyedProjectiles[0]).toBe(p2);
  });

  it('super projectile survives clash with strong', () => {
    const p1 = new Projectile(450, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'DM', 'super');
    const p2 = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'C', 'strong');
    const events = resolveProjectileClashes([p1, p2]);
    expect(events).toHaveLength(1);
    expect(events[0].survivor).toBe(p1);
    expect(p2.active).toBe(false);
  });

  it('no clash events when no projectiles overlap', () => {
    const p1 = new Projectile(100, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(800, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const events = resolveProjectileClashes([p1, p2]);
    expect(events).toHaveLength(0);
  });

  it('collision point is midpoint between projectiles', () => {
    const p1 = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const p2 = new Projectile(500, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    // Move to overlap
    p1.x = 450; p2.x = 460;
    const point = p1.getCollisionPoint(p2);
    expect(point.x).toBeCloseTo(455);
    expect(point.y).toBe(300);
  });

  it('handles empty projectile list', () => {
    const events = resolveProjectileClashes([]);
    expect(events).toHaveLength(0);
  });
});

// ── 4. EX Projectile Properties ─────────────────────────────────
describe('EX Projectile (MAX Mode)', () => {
  it('EX projectile is faster than weak version', () => {
    const weak = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, 6, 'A', 'weak', 75, false);
    const ex = new Projectile(400, 300, 1, 70, 0, 'ryo', 30, 22, 10, 'A', 'strong', 130, true);
    expect(Math.abs(ex.vx)).toBeGreaterThan(Math.abs(weak.vx));
  });

  it('EX projectile has larger hitbox', () => {
    const weak = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, 6, 'A', 'weak', 75, false);
    const ex = new Projectile(400, 300, 1, 70, 0, 'ryo', 30, 22, 10, 'A', 'strong', 130, true);
    expect(ex.hitboxW).toBeGreaterThan(weak.hitboxW);
    expect(ex.hitboxH).toBeGreaterThan(weak.hitboxH);
  });

  it('EX projectile deals more damage', () => {
    const weak = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, 6, 'A', 'weak', 75, false);
    const ex = new Projectile(400, 300, 1, 70, 0, 'ryo', 30, 22, 10, 'A', 'strong', 130, true);
    expect(ex.baseDamage).toBeGreaterThan(weak.baseDamage);
  });

  it('EX projectile survives clash with weak', () => {
    const ex = new Projectile(450, 300, 1, 70, 0, 'ryo', 30, 22, 10, 'A', 'strong', 130, true);
    const weak = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, 6, 'A', 'weak', 70);
    const result = ex.resolveClash(weak);
    expect(result).toBe('this_survives');
  });

  it('EX projectile has longer active frames', () => {
    const weak = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, 6, 'A', 'weak', 75, false);
    const ex = new Projectile(400, 300, 1, 70, 0, 'ryo', 30, 22, 10, 'A', 'strong', 130, true);
    expect(ex.activeFrames).toBeGreaterThan(weak.activeFrames);
  });
});

// ── 5. Trail Data ───────────────────────────────────────────────
describe('Projectile Trail', () => {
  it('trail starts empty', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    expect(p.trail).toHaveLength(0);
  });

  it('trail accumulates positions on update', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    p.update();
    expect(p.trail).toHaveLength(1);
    expect(p.trail[0].x).toBe(400);
    expect(p.trail[0].y).toBe(300);
  });

  it('trail caps at 6 positions', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    for (let i = 0; i < 10; i++) p.update();
    expect(p.trail.length).toBeLessThanOrEqual(6);
  });

  it('trail stores frame number for age-based effects', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    p.update();
    expect(p.trail[0].frame).toBe(0); // frame at time of recording
  });

  it('inactive projectile does not update trail', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo');
    for (let i = 0; i < 30; i++) p.update(); // expires after 30 frames
    const trailLen = p.trail.length;
    p.update(); // extra update while inactive
    expect(p.trail.length).toBe(trailLen); // no new entries
  });
});

// ── 6. Super-Level DM Projectile ────────────────────────────────
describe('Super-Level DM Projectile', () => {
  it('super level goes through weak projectiles', () => {
    const dm = new Projectile(450, 300, 1, 80, 0, 'ryo', 35, 25, 10, 'DM', 'super', 200);
    const weak = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'A', 'weak', 70);
    const result = dm.resolveClash(weak);
    expect(result).toBe('this_survives');
  });

  it('super level goes through strong projectiles', () => {
    const dm = new Projectile(450, 300, 1, 80, 0, 'ryo', 35, 25, 10, 'DM', 'super', 200);
    const strong = new Projectile(450, 300, -1, 60, 1, 'kyo', 15, 15, PROJECTILE_SPEED, 'C', 'strong', 100);
    const result = dm.resolveClash(strong);
    expect(result).toBe('this_survives');
  });

  it('two super-level projectiles destroy each other', () => {
    const dm1 = new Projectile(450, 300, 1, 80, 0, 'ryo', 35, 25, 10, 'DM', 'super', 200);
    const dm2 = new Projectile(450, 300, -1, 80, 1, 'kyo', 35, 25, 10, 'DM', 'super', 200);
    const result = dm1.resolveClash(dm2);
    expect(result).toBe('both_destroyed');
  });

  it('DM projectile has larger hitbox than normal', () => {
    const normal = new Projectile(400, 300, 1, 60, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak');
    const dm = new Projectile(400, 300, 1, 80, 0, 'ryo', 35, 25, 10, 'DM', 'super', 200);
    expect(dm.hitboxW).toBeGreaterThan(normal.hitboxW);
    expect(dm.hitboxH).toBeGreaterThan(normal.hitboxH);
  });
});

// ── 7. Projectile Lifecycle ─────────────────────────────────────
describe('Projectile Lifecycle', () => {
  it('hitbox returns null when inactive', () => {
    const p = new Projectile(400, 300, 1, 1, 0, 'ryo');
    p.update(); // activates for 1 frame, then inactive
    expect(p.active).toBe(false);
    expect(p.getHitbox()).toBeNull();
  });

  it('version tag is stored correctly', () => {
    const a = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A');
    const c = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'C');
    expect(a.version).toBe('A');
    expect(c.version).toBe('C');
  });

  it('baseDamage is stored correctly', () => {
    const p = new Projectile(400, 300, 1, 30, 0, 'ryo', 15, 15, PROJECTILE_SPEED, 'A', 'weak', 85);
    expect(p.baseDamage).toBe(85);
  });
});
