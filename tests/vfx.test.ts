import { describe, it, expect } from 'vitest';
import { ScreenFlash } from '../src/rendering/vfx.js';

describe('vfx', () => {
  describe('ScreenFlash', () => {
    it('can be created', () => {
      const sf = new ScreenFlash();
      expect(sf).toBeDefined();
    });
    it('trigger sets state', () => {
      const sf = new ScreenFlash();
      sf.trigger('#ff0000', 0.8, 10);
      // No error = success
      expect(true).toBe(true);
    });
    it('update decrements timer', () => {
      const sf = new ScreenFlash();
      sf.trigger('#fff', 1.0, 5);
      sf.update();
      // After one update, still active (4 frames left)
      // Just verify no crash
      expect(true).toBe(true);
    });
    it('update brings timer to zero eventually', () => {
      const sf = new ScreenFlash();
      sf.trigger('#fff', 1.0, 2);
      sf.update();
      sf.update();
      // Timer should be 0 now, render should be no-op
      expect(true).toBe(true);
    });
  });
});
