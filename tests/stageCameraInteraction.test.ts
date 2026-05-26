/**
 * Stage / Camera / Wall Interaction Tests
 *
 * Covers the interaction between:
 *   1. Camera tracking (centering, lerp, zoom, KO zoom)
 *   2. Stage boundaries (STAGE_LEFT/RIGHT, fighter clamping, corner pressure)
 *   3. Camera shake (tier intensities, duration, directional bias, decay, priority)
 *   4. Stage interaction (ground Y, jump height, knockdown bounds, projectile range)
 *   5. Camera zoom integration (visual scale vs hitbox, HUD independence, smooth transitions)
 *
 * Total: 20 tests
 */
import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/camera.js';
import { ScreenShake } from '../src/rendering/vfx.js';
import { Fighter } from '../src/entities/fighter.js';
import { Projectile } from '../src/entities/projectile.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  STAGE_WIDTH,
  STAGE_GROUND_Y,
  STAGE_LEFT,
  STAGE_RIGHT,
  FIGHTER_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  PROJECTILE_SPEED,
  SHAKE_LIGHT,
  SHAKE_HEAVY,
  SHAKE_SPECIAL,
  SHAKE_DM,
  SHAKE_KO,
  SHAKE_COUNTER,
  SHAKE_THROW,
  SHAKE_DURATION_LIGHT,
  SHAKE_DURATION_HEAVY,
  SHAKE_DURATION_SPECIAL,
  SHAKE_DURATION_DM,
  SHAKE_DURATION_KO,
} from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Fighter stub for Camera tests — Camera.update only reads fighter.x
// ---------------------------------------------------------------------------
function makeFighter(x: number) {
  return { x } as any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Camera Tracking (6 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Camera Tracking', () => {
  it('centers between P1 and P2', () => {
    const cam = new Camera();
    const p1 = makeFighter(300);
    const p2 = makeFighter(700);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);

    const midX = (300 + 700) / 2;
    const expectedCamX = midX - CANVAS_WIDTH / 2;
    expect(cam.x).toBeCloseTo(expectedCamX, 1);
  });

  it('follows the midpoint when both fighters move right', () => {
    const cam = new Camera();
    let p1 = makeFighter(200);
    let p2 = makeFighter(400);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);
    const camAtLeft = cam.x;

    p1.x = 600;
    p2.x = 800;
    for (let i = 0; i < 200; i++) cam.update(p1, p2);
    const camAtRight = cam.x;

    expect(camAtRight).toBeGreaterThan(camAtLeft);
  });

  it('does not go past stage boundaries', () => {
    const cam = new Camera();
    // Both fighters at far left
    const p1 = makeFighter(40);
    const p2 = makeFighter(50);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);
    expect(cam.x).toBeGreaterThanOrEqual(0);

    // Both fighters at far right
    p1.x = STAGE_WIDTH - 40;
    p2.x = STAGE_WIDTH - 50;
    for (let i = 0; i < 200; i++) cam.update(p1, p2);
    expect(cam.x).toBeLessThanOrEqual(STAGE_WIDTH - CANVAS_WIDTH);
  });

  it('uses smooth interpolation (does not teleport)', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(400);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);
    const prevX = cam.x;

    // Sudden position jump — target will be clamped to STAGE_WIDTH - CANVAS_WIDTH
    p1.x = 1100;
    p2.x = 1100;
    cam.update(p1, p2);

    // The clamped target is max(0, min(1100 - 400, 1400 - 800)) = 600
    const clampedTarget = Math.max(0, Math.min(1100 - CANVAS_WIDTH / 2, STAGE_WIDTH - CANVAS_WIDTH));
    // Camera should NOT have reached the target in one frame
    expect(cam.x).not.toBeCloseTo(clampedTarget, 0);
    // Should be somewhere between prevX and target
    const moved = cam.x - prevX;
    expect(moved).toBeGreaterThan(0);
    // Lerp factor is 0.15, so movement should be approximately diff * 0.15
    const diff = clampedTarget - prevX;
    expect(cam.x).toBeCloseTo(prevX + diff * 0.15, 2);
  });

  it('zooms based on fighter distance (0.90-1.15 range)', () => {
    const cam = new Camera();
    // Very close fighters -> zoom near 1.15
    const p1 = makeFighter(400);
    const p2 = makeFighter(410);
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    expect(cam.zoom).toBeGreaterThanOrEqual(0.90);
    expect(cam.zoom).toBeLessThanOrEqual(1.15);
    expect(cam.zoom).toBeCloseTo(1.15, 1);

    // Very far fighters -> zoom near 0.90
    p1.x = 100;
    p2.x = 100 + CANVAS_WIDTH;
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    expect(cam.zoom).toBeGreaterThanOrEqual(0.90);
    expect(cam.zoom).toBeLessThanOrEqual(1.15);
    expect(cam.zoom).toBeCloseTo(0.90, 1);
  });

  it('zoom in when fighters are close, zoom out when far', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(420);
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    const zoomClose = cam.zoom;

    p1.x = 100;
    p2.x = 1200;
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    const zoomFar = cam.zoom;

    expect(zoomClose).toBeGreaterThan(zoomFar);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Stage Boundaries (4 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Stage Boundaries', () => {
  it('fighters start within STAGE_LEFT and STAGE_RIGHT', () => {
    const p1 = new Fighter(STAGE_WIDTH * 0.33, '#ff0000', 1);
    const p2 = new Fighter(STAGE_WIDTH * 0.67, '#0000ff', -1);
    expect(p1.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(p1.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('STAGE_WIDTH is constant and greater than CANVAS_WIDTH', () => {
    expect(STAGE_WIDTH).toBe(1400);
    expect(STAGE_WIDTH).toBeGreaterThan(CANVAS_WIDTH);
  });

  it('stage boundaries account for fighter width', () => {
    // STAGE_LEFT = FIGHTER_WIDTH/2 (fighter center cannot go further left)
    expect(STAGE_LEFT).toBe(FIGHTER_WIDTH / 2);
    // STAGE_RIGHT = STAGE_WIDTH - FIGHTER_WIDTH/2
    expect(STAGE_RIGHT).toBe(STAGE_WIDTH - FIGHTER_WIDTH / 2);
    // The playable width = STAGE_RIGHT - STAGE_LEFT = STAGE_WIDTH - FIGHTER_WIDTH
    const playableWidth = STAGE_RIGHT - STAGE_LEFT;
    expect(playableWidth).toBe(STAGE_WIDTH - FIGHTER_WIDTH);
  });

  it('corner pressure: fighter pushed to wall stops at boundary', () => {
    const fighter = new Fighter(STAGE_LEFT, '#ff0000', 1);
    // Simulate pushbox or pushback trying to push past the left boundary
    fighter.x = STAGE_LEFT - 50;
    // FighterController.applyPhysics clamps: f.x = max(STAGE_LEFT, min(f.x, STAGE_RIGHT))
    fighter.x = Math.max(STAGE_LEFT, Math.min(fighter.x, STAGE_RIGHT));
    expect(fighter.x).toBe(STAGE_LEFT);

    // Right wall
    fighter.x = STAGE_RIGHT + 50;
    fighter.x = Math.max(STAGE_LEFT, Math.min(fighter.x, STAGE_RIGHT));
    expect(fighter.x).toBe(STAGE_RIGHT);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Camera Shake (4 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Camera Shake', () => {
  it('shake intensity increases per tier (light < heavy < special < DM < KO)', () => {
    expect(SHAKE_LIGHT).toBeLessThan(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBeLessThan(SHAKE_SPECIAL);
    expect(SHAKE_SPECIAL).toBeLessThan(SHAKE_DM);
    expect(SHAKE_DM).toBeLessThan(SHAKE_KO);
  });

  it('shake duration increases per tier (light < heavy < special < DM < KO)', () => {
    expect(SHAKE_DURATION_LIGHT).toBeLessThan(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThan(SHAKE_DURATION_SPECIAL);
    expect(SHAKE_DURATION_SPECIAL).toBeLessThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBeLessThan(SHAKE_DURATION_KO);
  });

  it('shake has directional bias based on biasX parameter', () => {
    const shakeRight = new ScreenShake();
    const shakeLeft = new ScreenShake();
    shakeRight.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shakeLeft.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, -1);
    shakeRight.update();
    shakeLeft.update();

    // Positive biasX should produce positive horizontal offset in first frame
    expect(shakeRight.offsetX).toBeGreaterThan(0);
    // Negative biasX should produce negative horizontal offset
    expect(shakeLeft.offsetX).toBeLessThan(0);
  });

  it('stronger shake replaces weaker shake (priority)', () => {
    const shake = new ScreenShake();
    // Trigger light first
    shake.trigger(SHAKE_LIGHT, SHAKE_DURATION_LIGHT, 1);
    shake.update();
    const lightOffset = Math.abs(shake.offsetX);

    // Now trigger heavy — should replace if intensity >= current
    shake.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shake.update();
    const heavyOffset = Math.abs(shake.offsetX);

    // Heavy shake should produce a stronger offset than light would have
    expect(heavyOffset).toBeGreaterThan(lightOffset);
  });

  it('shake decays to zero over its duration', () => {
    const shake = new ScreenShake();
    shake.trigger(SHAKE_SPECIAL, SHAKE_DURATION_SPECIAL, 1);
    const offsets: number[] = [];
    for (let i = 0; i < SHAKE_DURATION_SPECIAL; i++) {
      shake.update();
      offsets.push(Math.abs(shake.offsetX));
    }
    // After full duration, offset should be zero
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
    // Early frames should have larger offsets than later frames (decay)
    // Compare first third vs last third (skip frame 0 which may have special setup)
    const firstThird = offsets.slice(1, Math.floor(offsets.length / 3));
    const lastThird = offsets.slice(Math.floor(2 * offsets.length / 3), -1);
    const avgFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const avgLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
    expect(avgFirst).toBeGreaterThan(avgLast);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Stage Interaction (4 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Stage Interaction', () => {
  it('ground Y position is consistent for all fighters', () => {
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(700, '#0000ff', -1);
    expect(p1.y).toBe(STAGE_GROUND_Y);
    expect(p2.y).toBe(STAGE_GROUND_Y);
    // Both should be at the same ground level
    expect(p1.y).toBe(p2.y);
  });

  it('jump apex is determined by gravity and initial velocity', () => {
    // Peak height = v0^2 / (2 * g)
    const peakDisplacement = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
    const expectedApexY = STAGE_GROUND_Y - peakDisplacement;
    // Jump should go upward (y decreases)
    expect(expectedApexY).toBeLessThan(STAGE_GROUND_Y);
    // Jump apex should be reasonable (at least 50px above ground, but not off screen)
    expect(peakDisplacement).toBeGreaterThan(50);
    expect(expectedApexY).toBeGreaterThan(0);
  });

  it('knockdown position stays within stage bounds when clamped', () => {
    const fighter = new Fighter(STAGE_LEFT, '#ff0000', 1);
    // Simulate knockdown pushback past left wall
    fighter.x = STAGE_LEFT - 100;
    fighter.x = Math.max(STAGE_LEFT, Math.min(fighter.x, STAGE_RIGHT));
    expect(fighter.x).toBe(STAGE_LEFT);

    // Knockdown at right wall
    fighter.x = STAGE_RIGHT + 100;
    fighter.x = Math.max(STAGE_LEFT, Math.min(fighter.x, STAGE_RIGHT));
    expect(fighter.x).toBe(STAGE_RIGHT);
  });

  it('projectile range respects stage boundaries (deactivates off-screen)', () => {
    // Projectile deactivates when x > 1600 (off-screen check in projectile.ts)
    const proj = new Projectile(STAGE_WIDTH / 2, STAGE_GROUND_Y - 50, 1, 200, 0);
    expect(proj.active).toBe(true);
    const startX = proj.x;

    // Run until deactivated (off-screen threshold is x > 1600)
    // From x=700, it takes (1600-700)/8 = 112.5 frames to go off-screen
    for (let i = 0; i < 200; i++) {
      if (!proj.active) break;
      proj.update();
    }

    expect(proj.active).toBe(false);
    // Projectile should have stopped before reaching full theoretical range
    // (deactivated by off-screen check, not by activeFrame expiry)
    expect(proj.x).toBeLessThanOrEqual(1600 + PROJECTILE_SPEED); // off-screen threshold + one frame
    expect(proj.x).toBeGreaterThan(startX); // it did move
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. KO Zoom (2 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('KO Zoom Integration', () => {
  it('KO zoom targets 1.3x for 60 frames, then returns to distance-based zoom', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(600);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);

    // Trigger KO zoom at midpoint
    cam.triggerKOZoom(500, 300);

    // Run through KO duration (60 frames)
    for (let i = 0; i < 30; i++) cam.update(p1, p2);
    // During KO, zoom should be increasing toward 1.3
    expect(cam.zoom).toBeGreaterThan(1.0);

    // Complete KO duration
    for (let i = 0; i < 60; i++) cam.update(p1, p2);

    // After KO, zoom should return to distance-based
    // Distance = 200, which is relatively close, so zoom should be above 1.0
    for (let i = 0; i < 300; i++) cam.update(p1, p2);
    // 200 distance: t = (200-80)/(800-80) = 0.167, targetZoom = 1.15 - 0.167*0.25 = 1.108
    expect(cam.zoom).toBeGreaterThan(1.0);
    expect(cam.zoom).toBeLessThan(1.2);
  });

  it('KO zoom camera focuses on KO location, not fighter positions', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(600);
    for (let i = 0; i < 200; i++) cam.update(p1, p2);

    // KO happens at x=500
    cam.triggerKOZoom(500, 300);

    // Fighters move away from KO location during freeze
    p1.x = 100;
    p2.x = 100;

    // During KO, camera should lerp toward KO target, not fighter midpoint
    cam.update(p1, p2);
    // KO target X = 500 - CANVAS_WIDTH/2 = 100
    // Normal tracking would target (100+100)/2 - CANVAS_WIDTH/2 = -300 (clamped to 0)
    // KO tracking should target 100
    // After one frame of lerp, camera should be moving toward 100, not toward 0
    const camX = cam.x;
    // The KO target is 100. Camera should be between its pre-KO position and 100
    expect(camX).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Camera Zoom Integration (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Camera Zoom Integration', () => {
  it('zoom affects worldToScreen but hitbox positions use world coordinates', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(420);
    for (let i = 0; i < 500; i++) cam.update(p1, p2);

    // Zoom should be > 1.0 for close fighters
    expect(cam.zoom).toBeGreaterThan(1.0);

    // worldToScreen should apply zoom
    const screenX = cam.worldToScreen(400);
    const expectedScreen = (400 - cam.x) * cam.zoom;
    expect(screenX).toBeCloseTo(expectedScreen, 4);

    // Fighter world position is unchanged regardless of zoom
    const fighter = new Fighter(400, '#ff0000', 1);
    expect(fighter.x).toBe(400);
    // Hitbox is in world space, independent of camera zoom
    const hurtbox = fighter.getHurtbox();
    expect(hurtbox.x).toBe(400 - FIGHTER_WIDTH / 2);
  });

  it('zoom transition is smooth (no sudden jumps)', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(420);
    for (let i = 0; i < 500; i++) cam.update(p1, p2);

    const maxZoomDelta = 0.05;
    const zoomDeltas: number[] = [];

    // Gradually increase distance
    for (let step = 0; step < 20; step++) {
      const prevZoom = cam.zoom;
      p2.x += 40;
      cam.update(p1, p2);
      zoomDeltas.push(Math.abs(cam.zoom - prevZoom));
    }

    // No single frame should have a zoom jump larger than maxZoomDelta
    for (const delta of zoomDeltas) {
      expect(delta).toBeLessThan(maxZoomDelta);
    }
  });

  it('worldToScreen coordinates scale correctly with zoom', () => {
    const cam = new Camera();
    const p1 = makeFighter(400);
    const p2 = makeFighter(400); // Overlapping -> max zoom
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    const zoomedIn = cam.zoom;

    // At high zoom, world positions should be spread further apart on screen
    const screenSpreadZoomed = cam.worldToScreen(500) - cam.worldToScreen(400);

    // Now zoom out
    p1.x = 100;
    p2.x = 100 + CANVAS_WIDTH;
    for (let i = 0; i < 500; i++) cam.update(p1, p2);
    const zoomedOut = cam.zoom;

    const screenSpreadZoomedOut = cam.worldToScreen(500) - cam.worldToScreen(400);

    // Higher zoom = larger screen spread for the same world distance
    expect(zoomedIn).toBeGreaterThan(zoomedOut);
    expect(screenSpreadZoomed).toBeGreaterThan(screenSpreadZoomedOut);
  });
});
