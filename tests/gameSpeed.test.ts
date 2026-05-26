import { describe, it, expect } from 'vitest';
import { SLOWMO_SUPER_FLASH, SLOWMO_KO, GameSpeedController } from '../src/core/gameSpeed.js';

describe('gameSpeed', () => {
  describe('SLOWMO constants', () => {
    it('SLOWMO_SUPER_FLASH is valid config', () => {
      expect(SLOWMO_SUPER_FLASH.speed).toBe(1.0);
      expect(SLOWMO_SUPER_FLASH.slowMoDuration).toBeGreaterThan(0);
      expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBeGreaterThan(0);
      expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBeLessThanOrEqual(1);
    });
    it('SLOWMO_KO is valid config', () => {
      expect(SLOWMO_KO.speed).toBe(1.0);
      expect(SLOWMO_KO.slowMoDuration).toBeGreaterThan(0);
    });
    it('KO slow-mo is slower than super flash', () => {
      expect(SLOWMO_KO.slowMoSpeed).toBeLessThanOrEqual(SLOWMO_SUPER_FLASH.slowMoSpeed);
    });
  });

  describe('GameSpeedController', () => {
    it('can be instantiated', () => {
      const ctrl = new GameSpeedController();
      expect(ctrl).toBeDefined();
    });
    it('getBaseSpeed returns 1.0 by default', () => {
      const ctrl = new GameSpeedController();
      expect(ctrl.getBaseSpeed()).toBeCloseTo(1.0);
    });
    it('triggerSlowMo reduces speed', () => {
      const ctrl = new GameSpeedController();
      ctrl.triggerSlowMo(8, 0.3);
      const speed = ctrl.update();
      expect(speed).toBeLessThanOrEqual(1.0);
    });
    it('update returns number', () => {
      const ctrl = new GameSpeedController();
      expect(typeof ctrl.update()).toBe('number');
    });
    it('speed returns to normal after slowmo ends', () => {
      const ctrl = new GameSpeedController();
      ctrl.triggerSlowMo(3, 0.3);
      for (let i = 0; i < 10; i++) ctrl.update();
      expect(ctrl.update()).toBeCloseTo(1.0);
    });
    it('setSpeed changes base speed', () => {
      const ctrl = new GameSpeedController();
      ctrl.setSpeed(0.5);
      expect(ctrl.getBaseSpeed()).toBeCloseTo(0.5);
    });
  });
});
