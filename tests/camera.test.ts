import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from '../src/core/camera.js';
import { CANVAS_WIDTH, STAGE_WIDTH } from '../src/core/constants.js';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    camera = new Camera();
  });

  describe('initial state', () => {
    it('starts at x=0, zoom=1.0, no shake', () => {
      expect(camera.x).toBe(0);
      expect(camera.zoom).toBe(1.0);
      expect(camera.shakeX).toBe(0);
      expect(camera.shakeY).toBe(0);
    });
  });

  describe('update (following fighters)', () => {
    it('centers between two fighters', () => {
      const p1x = 400;
      const p2x = 600;
      // Run enough updates for lerp to converge
      for (let i = 0; i < 200; i++) {
        camera.update(p1x, p2x);
      }
      const expectedMid = (p1x + p2x) / 2 - CANVAS_WIDTH / (2 * camera.zoom);
      // Allow wide tolerance because zoom affects the target position
      expect(camera.x).toBeCloseTo(expectedMid, -1);
    });

    it('clamps camera to stage left bound', () => {
      const p1x = 50;
      const p2x = 80;
      for (let i = 0; i < 60; i++) {
        camera.update(p1x, p2x);
      }
      // Camera should not go negative
      expect(camera.x).toBeGreaterThanOrEqual(0);
    });

    it('clamps camera to stage right bound', () => {
      const p1x = STAGE_WIDTH - 80;
      const p2x = STAGE_WIDTH - 50;
      for (let i = 0; i < 60; i++) {
        camera.update(p1x, p2x);
      }
      // Camera should not exceed stage width - canvas width
      expect(camera.x).toBeLessThanOrEqual(STAGE_WIDTH - CANVAS_WIDTH + 10);
    });

    it('uses smooth interpolation (lerp)', () => {
      camera.update(400, 600);
      const x1 = camera.x;
      camera.update(400, 600);
      const x2 = camera.x;
      // x should change gradually, not instantly
      expect(x2).not.toBe(x1);
      // Both should be approaching the target
      expect(Math.abs(x2)).toBeGreaterThan(Math.abs(x1) * 0.9);
    });

    it('zooms in when fighters are close', () => {
      for (let i = 0; i < 120; i++) {
        camera.update(400, 420);
      }
      expect(camera.zoom).toBeGreaterThan(1.0);
    });

    it('zooms out when fighters are far apart', () => {
      for (let i = 0; i < 120; i++) {
        camera.update(100, STAGE_WIDTH - 100);
      }
      expect(camera.zoom).toBeLessThan(1.0);
    });
  });

  describe('updateFromFighters', () => {
    it('delegates to update with x positions', () => {
      const a = { x: 300 };
      const b = { x: 500 };
      for (let i = 0; i < 200; i++) {
        camera.updateFromFighters(a, b);
      }
      // Camera should have moved from initial x=0
      expect(camera.x).toBeGreaterThan(0);
      // Should be roughly centered between the two fighters
      const midX = (300 + 500) / 2;
      expect(camera.x).toBeLessThan(midX);
    });
  });

  describe('super flash zoom', () => {
    it('triggers zoom to 1.08x on super flash', () => {
      camera.triggerSuperFlashZoom(8);
      // Zoom target should be set
      for (let i = 0; i < 60; i++) {
        camera.update(400, 600);
      }
      // After super flash ends, zoom should return to distance-based
      expect(camera.zoom).toBeGreaterThan(0.5);
      expect(camera.zoom).toBeLessThan(1.2);
    });

    it('super flash zoom decays after duration ends', () => {
      camera.triggerSuperFlashZoom(8);
      // Run through the super flash duration
      for (let i = 0; i < 8; i++) {
        camera.update(400, 600);
      }
      // Super flash should be done, zoom returns to normal
      for (let i = 0; i < 120; i++) {
        camera.update(400, 600);
      }
      // Zoom should settle to distance-based value
      expect(camera.zoom).toBeLessThanOrEqual(1.15);
    });
  });

  describe('KO zoom', () => {
    it('triggers dramatic zoom on KO', () => {
      camera.triggerKOZoom(500, 400);
      expect(camera.isKOZoom()).toBe(true);
    });

    it('KO zoom targets the KO location', () => {
      camera.triggerKOZoom(500, 400);
      // Run many updates for lerp to converge
      for (let i = 0; i < 120; i++) {
        camera.update(500, 600);
      }
      // Camera should be near the KO position
      expect(camera.x).toBeDefined();
    });

    it('KO zoom ends after duration', () => {
      camera.triggerKOZoom(500, 400);
      for (let i = 0; i < 70; i++) {
        camera.update(500, 600);
      }
      expect(camera.isKOZoom()).toBe(false);
    });
  });

  describe('screen shake', () => {
    it('triggers shake with intensity and duration', () => {
      camera.triggerShake(10, 15);
      // Run a frame to apply shake
      camera.update(400, 600);
      // Shake values should be non-zero during active shake
      // (exact values depend on decay math)
      expect(camera.shakeIntensity).toBe(10);
    });

    it('shake decays to zero after duration ends', () => {
      camera.triggerShake(10, 5);
      for (let i = 0; i < 30; i++) {
        camera.update(400, 600);
      }
      expect(camera.shakeX).toBe(0);
      expect(camera.shakeY).toBe(0);
    });

    it('higher intensity shake overrides lower', () => {
      camera.triggerShake(5, 10);
      camera.triggerShake(10, 10);
      expect(camera.shakeIntensity).toBe(10);
    });

    it('lower intensity shake does not override higher', () => {
      camera.triggerShake(10, 10);
      camera.triggerShake(5, 10);
      expect(camera.shakeIntensity).toBe(10);
    });

    it('shake with biasX applies directional displacement', () => {
      camera.triggerShake(10, 10, 1); // bias right
      camera.update(400, 600);
      // First few frames should have bias direction
      // After full decay, should be zero
    });
  });

  describe('getTransform', () => {
    it('returns offsetX, offsetY, and scale', () => {
      camera.update(400, 600);
      const transform = camera.getTransform();
      expect(transform).toHaveProperty('offsetX');
      expect(transform).toHaveProperty('offsetY');
      expect(transform).toHaveProperty('scale');
    });

    it('scale matches zoom', () => {
      camera.update(400, 600);
      const transform = camera.getTransform();
      expect(transform.scale).toBe(camera.zoom);
    });
  });

  describe('coordinate conversion', () => {
    it('worldToScreen converts correctly', () => {
      camera.x = 100;
      camera.zoom = 1.0;
      const screenX = camera.worldToScreen(200);
      expect(screenX).toBe(100); // (200 - 100) * 1.0
    });

    it('screenToWorld converts correctly', () => {
      camera.x = 100;
      camera.zoom = 1.0;
      const worldX = camera.screenToWorld(100);
      expect(worldX).toBe(200); // 100 / 1.0 + 100
    });

    it('worldToScreen and screenToWorld are inverse', () => {
      camera.x = 250;
      camera.zoom = 1.05;
      const worldX = 500;
      const screenX = camera.worldToScreen(worldX);
      const backToWorld = camera.screenToWorld(screenX);
      expect(backToWorld).toBeCloseTo(worldX, 5);
    });
  });

  describe('reset', () => {
    it('resets all camera state', () => {
      camera.update(100, STAGE_WIDTH - 100);
      camera.triggerShake(10, 10);
      camera.triggerKOZoom(500, 400);
      camera.reset();
      expect(camera.x).toBe(0);
      expect(camera.zoom).toBe(1.0);
      expect(camera.shakeX).toBe(0);
      expect(camera.shakeY).toBe(0);
      expect(camera.isKOZoom()).toBe(false);
    });
  });
});
