import { describe, it, expect } from 'vitest';
import { toggleDebugOverlay, isDebugOverlayVisible, toggleInputDisplay, isInputDisplayVisible, getCurrentFPS } from '../src/rendering/hudInfo.js';

describe('hudInfo', () => {
  describe('debug overlay', () => {
    it('starts hidden', () => {
      expect(isDebugOverlayVisible()).toBe(false);
    });
    it('toggle returns boolean', () => {
      const result = toggleDebugOverlay();
      expect(typeof result).toBe('boolean');
    });
    it('toggle switches state', () => {
      const before = isDebugOverlayVisible();
      toggleDebugOverlay();
      expect(isDebugOverlayVisible()).toBe(!before);
      toggleDebugOverlay();
      expect(isDebugOverlayVisible()).toBe(before);
    });
  });

  describe('input display', () => {
    it('starts hidden', () => {
      expect(isInputDisplayVisible()).toBe(false);
    });
    it('toggle returns boolean', () => {
      const result = toggleInputDisplay();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('FPS tracker', () => {
    it('getCurrentFPS returns number', () => {
      const fps = getCurrentFPS();
      expect(typeof fps).toBe('number');
    });
  });
});
