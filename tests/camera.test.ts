import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/camera.js';

describe('camera', () => {
  describe('Camera', () => {
    it('can be instantiated with defaults', () => {
      const cam = new Camera();
      expect(cam.x).toBe(0);
      expect(cam.y).toBe(0);
      expect(cam.zoom).toBeCloseTo(1.0);
    });
    it('update adjusts position', () => {
      const cam = new Camera();
      cam.update(100, 300);
      expect(typeof cam.x).toBe('number');
    });
    it('update does not throw', () => {
      const cam = new Camera();
      expect(() => cam.update(0, 0)).not.toThrow();
    });
    it('shakeX starts at 0', () => {
      const cam = new Camera();
      expect(cam.shakeX).toBe(0);
    });
    it('shakeY starts at 0', () => {
      const cam = new Camera();
      expect(cam.shakeY).toBe(0);
    });
  });
});
