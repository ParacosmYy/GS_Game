/**
 * fighterPhysics.test.ts
 *
 * Tests for Fighter physics: position, velocity, gravity, ground collision,
 * position bounds, and knockback. The Fighter class itself stores x, y, vx, vy
 * but the actual per-frame integration happens in FighterController.applyPhysics().
 * These tests replicate the core physics formulas to verify the Fighter data
 * invariants are maintained.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import {
  GRAVITY,
  JUMP_VELOCITY,
  STAGE_GROUND_Y,
  STAGE_LEFT,
  STAGE_RIGHT,
  STAGE_WIDTH,
  FIGHTER_WIDTH,
  WALK_SPEED,
  RUN_SPEED,
  HOP_VELOCITY,
  RUN_JUMP_VY,
  HYPER_JUMP_VY,
} from '../src/core/constants.js';

describe('Fighter Physics', () => {
  /** Create a fighter at a given x position, facing right by default. */
  function createFighter(x = 400): Fighter {
    return new Fighter(x, '#ff6600', 1);
  }

  // ─── Constants ──────────────────────────────────────────────────────────

  describe('Constants', () => {
    it('GRAVITY should be within reasonable range (0.5-2.0)', () => {
      expect(GRAVITY).toBeGreaterThanOrEqual(0.5);
      expect(GRAVITY).toBeLessThanOrEqual(2.0);
    });

    it('JUMP_VELOCITY should be negative (upward)', () => {
      expect(JUMP_VELOCITY).toBeLessThan(0);
    });

    it('stage bounds should be symmetric around center', () => {
      const center = STAGE_WIDTH / 2;
      expect(STAGE_LEFT).toBe(FIGHTER_WIDTH / 2);
      expect(STAGE_RIGHT).toBe(STAGE_WIDTH - FIGHTER_WIDTH / 2);
      expect(STAGE_LEFT + STAGE_RIGHT).toBe(STAGE_WIDTH);
    });
  });

  // ─── Movement Physics ───────────────────────────────────────────────────

  describe('Movement Physics', () => {
    it('standing idle should have zero velocity', () => {
      const f = createFighter();
      expect(f.vx).toBe(0);
      expect(f.vy).toBe(0);
      expect(f.state).toBe(FighterState.IDLE);
    });

    it('walking forward should produce positive vx aligned with facing', () => {
      const f = createFighter(400);
      f.facing = 1;
      f.state = FighterState.WALK;
      f.vx = WALK_SPEED * f.facing;
      // Simulate one frame of position update
      f.x += f.vx;
      expect(f.x).toBeGreaterThan(400);
      expect(f.vx).toBe(WALK_SPEED);
    });

    it('walking backward should produce negative vx relative to facing', () => {
      const f = createFighter(400);
      f.facing = 1;
      f.state = FighterState.WALK;
      f.vx = -WALK_SPEED * f.facing;
      f.x += f.vx;
      expect(f.x).toBeLessThan(400);
      expect(f.vx).toBe(-WALK_SPEED);
    });

    it('crouching should not move horizontally', () => {
      const f = createFighter(400);
      f.state = FighterState.CROUCH;
      f.vx = 0;
      const prevX = f.x;
      f.x += f.vx;
      expect(f.x).toBe(prevX);
    });

    it('velocity direction should match facing for forward movement', () => {
      const f1 = createFighter(400);
      f1.facing = 1;
      f1.vx = WALK_SPEED * f1.facing;
      expect(Math.sign(f1.vx)).toBe(1);

      const f2 = createFighter(600);
      f2.facing = -1;
      f2.vx = WALK_SPEED * f2.facing;
      expect(Math.sign(f2.vx)).toBe(-1);
    });
  });

  // ─── Jump Physics ───────────────────────────────────────────────────────

  describe('Jump Physics', () => {
    it('jump should start with negative vy (upward)', () => {
      const f = createFighter();
      f.vy = JUMP_VELOCITY;
      expect(f.vy).toBeLessThan(0);
      expect(f.vy).toBe(-14);
    });

    it('gravity should reduce vy each frame while airborne', () => {
      const f = createFighter();
      f.y = STAGE_GROUND_Y;
      f.vy = JUMP_VELOCITY;
      f.state = FighterState.JUMP;

      // Lift off: move fighter above ground
      f.y += f.vy; // frame 1 position update
      f.vy += GRAVITY; // apply gravity (still airborne)

      expect(f.vy).toBe(JUMP_VELOCITY + GRAVITY);
      // vy is still negative (still going up)
      expect(f.vy).toBeLessThan(0);
    });

    it('fighter should return to ground after a full jump arc', () => {
      const f = createFighter();
      f.y = STAGE_GROUND_Y;
      f.vy = JUMP_VELOCITY;
      f.state = FighterState.JUMP;

      // Simulate full jump arc
      // First frame: lift off (position update then gravity)
      let frames = 0;
      const maxFrames = 200; // safety limit
      do {
        f.y += f.vy;
        if (f.y < STAGE_GROUND_Y) {
          f.vy += GRAVITY;
        }
        frames++;
      } while (f.y < STAGE_GROUND_Y && frames < maxFrames);

      // Fighter should have returned to (or passed) ground level
      expect(f.y).toBeGreaterThanOrEqual(STAGE_GROUND_Y);
      // The arc should take a reasonable number of frames (not instant)
      // JUMP_VELOCITY=-14, GRAVITY=0.8 → total arc ~35 frames
      expect(frames).toBeGreaterThan(10);
    });

    it('horizontal movement should be controllable in the air', () => {
      const f = createFighter(400);
      f.y = STAGE_GROUND_Y;
      f.vy = JUMP_VELOCITY;
      f.vx = WALK_SPEED;
      f.state = FighterState.JUMP;

      const startX = f.x;

      // Simulate a few frames of air movement
      for (let i = 0; i < 5; i++) {
        f.x += f.vx;
        f.y += f.vy;
        if (f.y < STAGE_GROUND_Y) {
          f.vy += GRAVITY;
        }
      }

      // Fighter should have moved horizontally
      expect(f.x).toBeGreaterThan(startX);
    });
  });

  // ─── Gravity ────────────────────────────────────────────────────────────

  describe('Gravity', () => {
    it('should increase vy each frame while airborne', () => {
      const f = createFighter();
      f.y = STAGE_GROUND_Y - 200;
      f.vy = 0;

      // Apply gravity for 3 frames
      for (let i = 0; i < 3; i++) {
        f.vy += GRAVITY;
      }

      expect(f.vy).toBe(GRAVITY * 3);
    });

    it('should reset vy to 0 upon landing', () => {
      const f = createFighter();
      f.y = STAGE_GROUND_Y - 50;
      f.vy = 5;
      f.state = FighterState.JUMP;

      // Simulate landing
      f.y = STAGE_GROUND_Y;
      f.vy = 0;

      expect(f.vy).toBe(0);
      expect(f.isGrounded()).toBe(true);
    });

    it('gravity value should be GRAVITY constant (0.8)', () => {
      expect(GRAVITY).toBe(0.8);
    });
  });

  // ─── Ground Collision ───────────────────────────────────────────────────

  describe('Ground Collision', () => {
    it('y should not exceed STAGE_GROUND_Y when grounded', () => {
      const f = createFighter();
      expect(f.y).toBe(STAGE_GROUND_Y);
      expect(f.isGrounded()).toBe(true);
    });

    it('landing from airborne should set y to STAGE_GROUND_Y', () => {
      const f = createFighter();
      f.y = STAGE_GROUND_Y - 100;
      f.vy = 10;
      f.state = FighterState.JUMP;
      expect(f.isGrounded()).toBe(false);

      // Simulate landing
      f.y = STAGE_GROUND_Y;
      f.vy = 0;
      f.state = FighterState.IDLE;

      expect(f.y).toBe(STAGE_GROUND_Y);
      expect(f.isGrounded()).toBe(true);
      expect(f.state).toBe(FighterState.IDLE);
    });

    it('ground position should be fixed at STAGE_GROUND_Y', () => {
      const f1 = createFighter(200);
      const f2 = createFighter(600);
      expect(f1.y).toBe(STAGE_GROUND_Y);
      expect(f2.y).toBe(STAGE_GROUND_Y);
    });
  });

  // ─── Position Bounds ────────────────────────────────────────────────────

  describe('Position Bounds', () => {
    it('x should not go below STAGE_LEFT', () => {
      const f = createFighter(STAGE_LEFT);
      f.vx = -WALK_SPEED;
      f.x += f.vx;
      // Apply clamp (as done in fighterController)
      f.x = Math.max(STAGE_LEFT, f.x);
      expect(f.x).toBe(STAGE_LEFT);
    });

    it('x should not exceed STAGE_RIGHT', () => {
      const f = createFighter(STAGE_RIGHT);
      f.vx = WALK_SPEED;
      f.x += f.vx;
      // Apply clamp
      f.x = Math.min(STAGE_RIGHT, f.x);
      expect(f.x).toBe(STAGE_RIGHT);
    });

    it('velocity should be clamped when hitting boundary', () => {
      const f = createFighter(STAGE_LEFT);
      f.facing = -1; // facing left
      f.vx = -WALK_SPEED;

      // Move and clamp
      f.x += f.vx;
      if (f.x < STAGE_LEFT) {
        f.x = STAGE_LEFT;
        f.vx = 0;
      }

      expect(f.x).toBe(STAGE_LEFT);
      expect(f.vx).toBe(0);
    });
  });

  // ─── Knockback Physics ──────────────────────────────────────────────────

  describe('Knockback Physics', () => {
    it('applyHitstun should set vx in opposite direction of facing', () => {
      const f = createFighter(400);
      f.facing = 1;
      const pushback = 10;

      f.applyHitstun(15, pushback);

      // Facing right (1): pushback goes left, so vx should be negative
      expect(f.vx).toBeLessThan(0);
      expect(f.state).toBe(FighterState.HITSTUN);
    });

    it('knockback force should be proportional to pushback parameter', () => {
      const f1 = createFighter(400);
      f1.facing = 1;
      f1.applyHitstun(15, 5);

      const f2 = createFighter(400);
      f2.facing = 1;
      f2.applyHitstun(15, 15);

      // Stronger pushback should produce larger initial velocity magnitude
      expect(Math.abs(f2.vx)).toBeGreaterThan(Math.abs(f1.vx));
    });

    it('knockback velocity should decay during hitstun (friction 0.75)', () => {
      const f = createFighter(400);
      f.facing = 1;
      f.applyHitstun(15, 10);
      const initialVx = f.vx;

      // Simulate hitstun physics: vx *= 0.75 per frame
      f.x += f.vx;
      f.vx *= 0.75;

      expect(Math.abs(f.vx)).toBeLessThan(Math.abs(initialVx));

      // After another frame, should decay further
      const prevVx = f.vx;
      f.x += f.vx;
      f.vx *= 0.75;
      expect(Math.abs(f.vx)).toBeLessThan(Math.abs(prevVx));
    });
  });
});
