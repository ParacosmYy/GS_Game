/**
 * Projectile System Consolidated Tests
 *
 * Merged from: projectileSystem, projectileEntity
 *
 * Covers: projectile construction, movement, active frame lifecycle.
 */
import { describe, it, expect } from 'vitest';
import { Projectile } from '../src/entities/projectile.js';
import { PROJECTILE_SPEED } from '../src/core/constants.js';

// ── 1. Projectile Construction ──────────────────────────────
describe('Projectile Construction', () => {
  it('initializes with correct properties', () => {
    const p = new Projectile(400, 300, 1, 30, 1, 'kyo');
    expect(p.x).toBe(400);
    expect(p.facing).toBe(1);
    expect(p.active).toBe(true);
  });

  it('velocity direction matches facing', () => {
    const pRight = new Projectile(400, 300, 1, 30, 1, 'kyo');
    const pLeft = new Projectile(400, 300, -1, 30, 1, 'kyo');
    expect(Math.sign(pRight.vx)).toBe(1);
    expect(Math.sign(pLeft.vx)).toBe(-1);
  });
});

// ── 2. Projectile Movement ─────────────────────────────────
describe('Projectile Movement', () => {
  it('moves by velocity each frame', () => {
    const p = new Projectile(400, 300, 1, 30, 1, 'kyo');
    const xBefore = p.x;
    p.update();
    expect(p.x).not.toBe(xBefore);
  });

  it('becomes inactive after activeFrames expire', () => {
    const p = new Projectile(400, 300, 1, 3, 1, 'kyo');
    for (let i = 0; i < 3; i++) p.update();
    expect(p.active).toBe(false);
  });

  it('becomes inactive when out of screen bounds', () => {
    const p = new Projectile(1599, 300, 1, 100, 1, 'kyo');
    p.update(); // x becomes 1599 + 8 = 1607, > 1600
    expect(p.active).toBe(false);
  });
});

// ── 3. Projectile Speed ─────────────────────────────────────
describe('Projectile Speed', () => {
  it('PROJECTILE_SPEED is positive and reasonable', () => {
    expect(PROJECTILE_SPEED).toBeGreaterThan(0);
    expect(PROJECTILE_SPEED).toBeLessThanOrEqual(20);
  });
});
