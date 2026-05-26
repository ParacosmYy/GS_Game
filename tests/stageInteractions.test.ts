/**
 * Stage Interactions Tests — Phase 54
 *
 * Covers: wall clamping, corner detection, corner damage bonus,
 * camera offset calculation, ground level consistency.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { Camera } from '../src/core/camera.js';
import {
  STAGE_LEFT, STAGE_RIGHT, STAGE_WIDTH, STAGE_GROUND_Y,
  FIGHTER_WIDTH, CANVAS_WIDTH,
  CORNER_RANGE, CORNER_DAMAGE_BONUS, WALL_SPLAT_SHAKE_DURATION,
  isInLeftCorner, isInRightCorner, isInCorner, clampToStage,
} from '../src/core/constants.js';

// ── 1. Wall Clamping ───────────────────────────────────────
describe('Wall Clamping', () => {
  it('STAGE_LEFT and STAGE_RIGHT are valid boundaries', () => {
    expect(STAGE_LEFT).toBeGreaterThan(0);
    expect(STAGE_RIGHT).toBeGreaterThan(STAGE_LEFT);
    expect(STAGE_RIGHT).toBeLessThanOrEqual(STAGE_WIDTH);
  });

  it('clampToStage keeps x within [STAGE_LEFT, STAGE_RIGHT]', () => {
    expect(clampToStage(0)).toBe(STAGE_LEFT);
    expect(clampToStage(STAGE_WIDTH)).toBe(STAGE_RIGHT);
    expect(clampToStage(STAGE_WIDTH / 2)).toBe(STAGE_WIDTH / 2);
  });

  it('clampToStage clamps negative values to STAGE_LEFT', () => {
    expect(clampToStage(-100)).toBe(STAGE_LEFT);
  });

  it('clampToStage clamps large values to STAGE_RIGHT', () => {
    expect(clampToStage(STAGE_WIDTH + 500)).toBe(STAGE_RIGHT);
  });

  it('fighter starts at ground level', () => {
    const f = new Fighter(400, '#ff0000', 1);
    expect(f.y).toBe(STAGE_GROUND_Y);
    expect(f.isGrounded()).toBe(true);
  });
});

// ── 2. Corner Detection ────────────────────────────────────
describe('Corner Detection', () => {
  it('CORNER_RANGE is positive', () => {
    expect(CORNER_RANGE).toBeGreaterThan(0);
  });

  it('isInLeftCorner returns true near left wall', () => {
    expect(isInLeftCorner(STAGE_LEFT)).toBe(true);
    expect(isInLeftCorner(STAGE_LEFT + CORNER_RANGE)).toBe(true);
    expect(isInLeftCorner(STAGE_LEFT + CORNER_RANGE + 1)).toBe(false);
  });

  it('isInRightCorner returns true near right wall', () => {
    expect(isInRightCorner(STAGE_RIGHT)).toBe(true);
    expect(isInRightCorner(STAGE_RIGHT - CORNER_RANGE)).toBe(true);
    expect(isInRightCorner(STAGE_RIGHT - CORNER_RANGE - 1)).toBe(false);
  });

  it('isInCorner detects both corners', () => {
    expect(isInCorner(STAGE_LEFT)).toBe(true);
    expect(isInCorner(STAGE_RIGHT)).toBe(true);
    expect(isInCorner(STAGE_WIDTH / 2)).toBe(false);
  });

  it('fighter at STAGE_LEFT is in corner', () => {
    const f = new Fighter(STAGE_LEFT, '#ff0000', 1);
    expect(isInCorner(f.x)).toBe(true);
  });

  it('fighter at STAGE_RIGHT is in corner', () => {
    const f = new Fighter(STAGE_RIGHT, '#ff0000', -1);
    expect(isInCorner(f.x)).toBe(true);
  });

  it('fighter at center is NOT in corner', () => {
    const f = new Fighter(STAGE_WIDTH / 2, '#ff0000', 1);
    expect(isInCorner(f.x)).toBe(false);
  });

  it('fighter just outside CORNER_RANGE is NOT in corner', () => {
    const x = STAGE_LEFT + CORNER_RANGE + 10;
    expect(isInCorner(x)).toBe(false);
  });
});

// ── 3. Corner Damage Bonus ─────────────────────────────────
describe('Corner Damage Bonus', () => {
  it('CORNER_DAMAGE_BONUS is 1.05 (5% bonus)', () => {
    expect(CORNER_DAMAGE_BONUS).toBe(1.05);
  });

  it('100 damage in corner becomes 105', () => {
    const baseDamage = 100;
    const cornerDamage = Math.round(baseDamage * CORNER_DAMAGE_BONUS);
    expect(cornerDamage).toBe(105);
  });

  it('WALL_SPLAT_SHAKE_DURATION is 2 ticks', () => {
    expect(WALL_SPLAT_SHAKE_DURATION).toBe(2);
  });
});

// ── 4. Camera Offset Calculation ───────────────────────────
describe('Camera Offset Calculation', () => {
  it('Camera initializes at x=0', () => {
    const cam = new Camera();
    expect(cam.x).toBe(0);
    expect(cam.zoom).toBe(1.0);
  });

  it('Camera centers between two fighters at mid-stage', () => {
    const cam = new Camera();
    const p1x = STAGE_WIDTH * 0.33;
    const p2x = STAGE_WIDTH * 0.67;
    // Run several update frames for lerp to converge
    for (let i = 0; i < 200; i++) cam.update(p1x, p2x);
    const midX = (p1x + p2x) / 2;
    const expectedX = Math.max(0, Math.min(midX - CANVAS_WIDTH / (2 * cam.zoom), STAGE_WIDTH - CANVAS_WIDTH));
    expect(Math.abs(cam.x - expectedX)).toBeLessThan(5);
  });

  it('Camera clamps so stage edges stay within view', () => {
    const cam = new Camera();
    const p1x = STAGE_LEFT;
    const p2x = STAGE_LEFT + 50;
    for (let i = 0; i < 200; i++) cam.update(p1x, p2x);
    expect(cam.x).toBeGreaterThanOrEqual(-1);
    expect(cam.x).toBeLessThanOrEqual(STAGE_WIDTH - CANVAS_WIDTH + 1);
  });

  it('worldToScreen converts world coords to screen coords', () => {
    const cam = new Camera();
    cam.x = 100; // camera offset 100px to the right
    // An object at world x=200 should appear at screen x=100 (at zoom 1.0)
    expect(cam.worldToScreen(200)).toBe(100);
  });

  it('Camera pans when fighters spread apart', () => {
    const cam = new Camera();
    const p1x = STAGE_LEFT + 50;
    const p2x = STAGE_RIGHT - 50;
    for (let i = 0; i < 200; i++) cam.update(p1x, p2x);
    // Camera should be centered between fighters, clamped to stage
    const midX = (p1x + p2x) / 2;
    const expectedX = Math.max(0, Math.min(midX - CANVAS_WIDTH / (2 * cam.zoom), STAGE_WIDTH - CANVAS_WIDTH));
    expect(Math.abs(cam.x - expectedX)).toBeLessThan(5);
  });
});

// ── 5. Ground Level Consistency ─────────────────────────────
describe('Ground Level', () => {
  it('STAGE_GROUND_Y is defined and below canvas midpoint', () => {
    expect(STAGE_GROUND_Y).toBeGreaterThan(0);
    expect(STAGE_GROUND_Y).toBeLessThan(600); // canvas height
  });

  it('fighters created at STAGE_GROUND_Y are grounded', () => {
    const f = new Fighter(400, '#ff0000', 1);
    expect(f.y).toBe(STAGE_GROUND_Y);
    expect(f.isGrounded()).toBe(true);
  });

  it('fighters above STAGE_GROUND_Y are airborne', () => {
    const f = new Fighter(400, '#ff0000', 1);
    f.y = STAGE_GROUND_Y - 50;
    expect(f.isGrounded()).toBe(false);
  });
});
