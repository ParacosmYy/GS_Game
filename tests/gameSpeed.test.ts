import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameSpeedController,
  SLOWMO_SUPER_FLASH,
  SLOWMO_KO,
  type GameSpeedConfig,
} from '../src/core/gameSpeed.js';

describe('GameSpeedController', () => {
  let controller: GameSpeedController;

  beforeEach(() => {
    controller = new GameSpeedController();
  });

  describe('initial state', () => {
    it('starts at base speed 1.0', () => {
      expect(controller.getBaseSpeed()).toBe(1.0);
      expect(controller.getSpeed()).toBe(1.0);
    });

    it('is not in slow-mo initially', () => {
      expect(controller.isSlowMo()).toBe(false);
    });
  });

  describe('setSpeed', () => {
    it('sets base speed to valid value', () => {
      controller.setSpeed(0.5);
      expect(controller.getBaseSpeed()).toBe(0.5);
    });

    it('ignores zero speed', () => {
      controller.setSpeed(0);
      expect(controller.getBaseSpeed()).toBe(1.0);
    });

    it('ignores negative speed', () => {
      controller.setSpeed(-1);
      expect(controller.getBaseSpeed()).toBe(1.0);
    });

    it('accepts speed > 1.0', () => {
      controller.setSpeed(2.0);
      expect(controller.getBaseSpeed()).toBe(2.0);
    });
  });

  describe('triggerSlowMo', () => {
    it('activates slow-mo with default speed 0.3', () => {
      controller.triggerSlowMo(8);
      expect(controller.isSlowMo()).toBe(true);
      expect(controller.getSpeed()).toBe(1.0); // Not yet applied until update
    });

    it('activates slow-mo with custom speed', () => {
      controller.triggerSlowMo(15, 0.2);
      expect(controller.isSlowMo()).toBe(true);
    });

    it('ignores zero duration', () => {
      controller.triggerSlowMo(0);
      expect(controller.isSlowMo()).toBe(false);
    });

    it('ignores negative duration', () => {
      controller.triggerSlowMo(-5);
      expect(controller.isSlowMo()).toBe(false);
    });
  });

  describe('update', () => {
    it('returns base speed when no slow-mo active', () => {
      controller.setSpeed(1.5);
      const speed = controller.update();
      expect(speed).toBe(1.5);
    });

    it('returns reduced speed during slow-mo', () => {
      controller.triggerSlowMo(8, 0.3);
      const speed = controller.update();
      expect(speed).toBeCloseTo(0.3, 2);
    });

    it('returns base speed * slow-mo speed', () => {
      controller.setSpeed(0.5);
      controller.triggerSlowMo(10, 0.2);
      const speed = controller.update();
      expect(speed).toBeCloseTo(0.1, 2); // 0.5 * 0.2
    });

    it('decrements remaining ticks each update', () => {
      controller.triggerSlowMo(3, 0.3);
      expect(controller.isSlowMo()).toBe(true);
      controller.update(); // remaining = 2
      expect(controller.isSlowMo()).toBe(true);
      controller.update(); // remaining = 1
      expect(controller.isSlowMo()).toBe(true);
      controller.update(); // remaining = 0, ends
      expect(controller.isSlowMo()).toBe(false);
      expect(controller.getSpeed()).toBe(1.0);
    });

    it('returns to base speed after slow-mo ends', () => {
      controller.triggerSlowMo(2, 0.3);
      controller.update();
      controller.update();
      controller.update(); // slow-mo ends
      const speed = controller.update();
      expect(speed).toBe(1.0);
    });
  });

  describe('getSlowMoProgress', () => {
    it('returns 1 when no slow-mo active', () => {
      expect(controller.getSlowMoProgress()).toBe(1);
    });

    it('returns 0 at start of slow-mo', () => {
      controller.triggerSlowMo(10);
      expect(controller.getSlowMoProgress()).toBeCloseTo(0, 2);
    });

    it('returns increasing progress as slow-mo runs', () => {
      controller.triggerSlowMo(10);
      controller.update(); // 1 tick elapsed
      expect(controller.getSlowMoProgress()).toBeCloseTo(0.1, 2);
    });

    it('returns close to 1 near end of slow-mo', () => {
      controller.triggerSlowMo(10);
      for (let i = 0; i < 9; i++) controller.update();
      expect(controller.getSlowMoProgress()).toBeCloseTo(0.9, 2);
    });
  });

  describe('cancelSlowMo', () => {
    it('immediately ends slow-mo', () => {
      controller.triggerSlowMo(30, 0.2);
      expect(controller.isSlowMo()).toBe(true);
      controller.cancelSlowMo();
      expect(controller.isSlowMo()).toBe(false);
      expect(controller.getSpeed()).toBe(1.0);
    });
  });

  describe('reset', () => {
    it('resets all state to defaults', () => {
      controller.setSpeed(2.0);
      controller.triggerSlowMo(30, 0.2);
      controller.reset();
      expect(controller.getBaseSpeed()).toBe(1.0);
      expect(controller.getSpeed()).toBe(1.0);
      expect(controller.isSlowMo()).toBe(false);
    });
  });

  describe('SLOWMO presets', () => {
    it('SLOWMO_SUPER_FLASH has correct duration and speed', () => {
      expect(SLOWMO_SUPER_FLASH.slowMoDuration).toBe(8);
      expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBe(0.3);
      expect(SLOWMO_SUPER_FLASH.slowMoTrigger).toBe('super_flash');
    });

    it('SLOWMO_KO has correct duration and speed', () => {
      expect(SLOWMO_KO.slowMoDuration).toBe(15);
      expect(SLOWMO_KO.slowMoSpeed).toBe(0.2);
      expect(SLOWMO_KO.slowMoTrigger).toBe('ko');
    });

    it('presets can be used directly with triggerSlowMo', () => {
      controller.triggerSlowMo(SLOWMO_SUPER_FLASH.slowMoDuration, SLOWMO_SUPER_FLASH.slowMoSpeed);
      expect(controller.isSlowMo()).toBe(true);
      // Verify the speed factor
      const speed = controller.update();
      expect(speed).toBeCloseTo(0.3, 2);
    });
  });

  describe('full slow-mo cycle', () => {
    it('KO slow-mo runs for 15 ticks at 0.2x speed', () => {
      controller.triggerSlowMo(SLOWMO_KO.slowMoDuration, SLOWMO_KO.slowMoSpeed);
      let slowMoTicks = 0;
      while (controller.isSlowMo()) {
        const speed = controller.update();
        if (controller.isSlowMo()) {
          expect(speed).toBeCloseTo(0.2, 2);
        }
        slowMoTicks++;
      }
      expect(slowMoTicks).toBe(15);
      expect(controller.getSpeed()).toBe(1.0);
    });

    it('super flash slow-mo runs for 8 ticks at 0.3x speed', () => {
      controller.triggerSlowMo(SLOWMO_SUPER_FLASH.slowMoDuration, SLOWMO_SUPER_FLASH.slowMoSpeed);
      let slowMoTicks = 0;
      while (controller.isSlowMo()) {
        const speed = controller.update();
        if (controller.isSlowMo()) {
          expect(speed).toBeCloseTo(0.3, 2);
        }
        slowMoTicks++;
      }
      expect(slowMoTicks).toBe(8);
      expect(controller.getSpeed()).toBe(1.0);
    });
  });
});
