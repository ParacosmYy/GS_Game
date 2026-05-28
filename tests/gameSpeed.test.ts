/**
 * Game Speed Controller Regression Test
 * Verifies speed presets, slow-mo lifecycle, and edge cases.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SLOWMO_SUPER_FLASH,
  SLOWMO_KO,
  GameSpeedController,
} from '../src/core/gameSpeed.js';

describe('SLOWMO presets', () => {
  it('SUPER_FLASH preset has correct values', () => {
    expect(SLOWMO_SUPER_FLASH.speed).toBe(1.0);
    expect(SLOWMO_SUPER_FLASH.slowMoTrigger).toBe('super_flash');
    expect(SLOWMO_SUPER_FLASH.slowMoDuration).toBe(8);
    expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBeLessThan(1);
  });

  it('KO preset has correct values', () => {
    expect(SLOWMO_KO.speed).toBe(1.0);
    expect(SLOWMO_KO.slowMoTrigger).toBe('ko');
    expect(SLOWMO_KO.slowMoDuration).toBe(15);
    expect(SLOWMO_KO.slowMoSpeed).toBeLessThan(1);
  });

  it('KO duration is longer than super flash', () => {
    expect(SLOWMO_KO.slowMoDuration).toBeGreaterThan(SLOWMO_SUPER_FLASH.slowMoDuration);
  });

  it('KO speed is slower than super flash', () => {
    expect(SLOWMO_KO.slowMoSpeed).toBeLessThan(SLOWMO_SUPER_FLASH.slowMoSpeed);
  });
});

describe('GameSpeedController', () => {
  let ctrl: GameSpeedController;

  beforeEach(() => {
    ctrl = new GameSpeedController();
  });

  it('defaults to speed 1.0', () => {
    expect(ctrl.getSpeed()).toBe(1.0);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
  });

  it('is not in slow-mo by default', () => {
    expect(ctrl.isSlowMo()).toBe(false);
  });

  it('setSpeed changes base speed', () => {
    ctrl.setSpeed(1.5);
    expect(ctrl.getBaseSpeed()).toBe(1.5);
  });

  it('setSpeed ignores zero', () => {
    ctrl.setSpeed(0);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
  });

  it('setSpeed ignores negative', () => {
    ctrl.setSpeed(-1);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
  });

  it('triggerSlowMo activates slow-mo', () => {
    ctrl.triggerSlowMo(5, 0.3);
    expect(ctrl.isSlowMo()).toBe(true);
  });

  it('update returns slow speed during slow-mo', () => {
    ctrl.triggerSlowMo(5, 0.5);
    const speed = ctrl.update();
    expect(speed).toBe(0.5);
  });

  it('slow-mo expires after duration', () => {
    ctrl.triggerSlowMo(3, 0.3);
    ctrl.update(); // tick 1 → remaining 2
    ctrl.update(); // tick 2 → remaining 1
    ctrl.update(); // tick 3 → remaining 0, restore
    expect(ctrl.isSlowMo()).toBe(false);
    expect(ctrl.getSpeed()).toBe(1.0);
  });

  it('slow-mo respects base speed', () => {
    ctrl.setSpeed(2.0);
    ctrl.triggerSlowMo(3, 0.5);
    expect(ctrl.update()).toBe(1.0); // 2.0 * 0.5
  });

  it('getSlowMoProgress advances from 0 to 1', () => {
    ctrl.triggerSlowMo(4, 0.3);
    expect(ctrl.getSlowMoProgress()).toBe(0);
    ctrl.update(); // 1/4 done
    expect(ctrl.getSlowMoProgress()).toBeGreaterThan(0);
    ctrl.update();
    ctrl.update();
    ctrl.update(); // 4/4 → expires
    expect(ctrl.getSlowMoProgress()).toBe(1);
  });

  it('cancelSlowMo stops slow-mo immediately', () => {
    ctrl.triggerSlowMo(100, 0.2);
    ctrl.cancelSlowMo();
    expect(ctrl.isSlowMo()).toBe(false);
    expect(ctrl.getSpeed()).toBe(1.0);
  });

  it('reset clears everything', () => {
    ctrl.setSpeed(2.0);
    ctrl.triggerSlowMo(10);
    ctrl.reset();
    expect(ctrl.getSpeed()).toBe(1.0);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
    expect(ctrl.isSlowMo()).toBe(false);
  });

  it('triggerSlowMo with duration 0 is ignored', () => {
    ctrl.triggerSlowMo(0);
    expect(ctrl.isSlowMo()).toBe(false);
  });

  it('triggerSlowMo with negative duration is ignored', () => {
    ctrl.triggerSlowMo(-5);
    expect(ctrl.isSlowMo()).toBe(false);
  });

  it('triggerSlowMo clamps speed to [0.01, 1.0]', () => {
    ctrl.triggerSlowMo(5, 0);
    ctrl.update();
    expect(ctrl.getSpeed()).toBeGreaterThan(0);
    ctrl.cancelSlowMo();

    ctrl.triggerSlowMo(5, 5);
    ctrl.update();
    expect(ctrl.getSpeed()).toBeLessThanOrEqual(1.0);
  });

  it('multiple slow-mo triggers override previous', () => {
    ctrl.triggerSlowMo(100, 0.2);
    ctrl.triggerSlowMo(3, 0.5);
    expect(ctrl.getSlowMoProgress()).toBe(0);
  });

  it('update without slow-mo returns base speed', () => {
    ctrl.setSpeed(1.5);
    expect(ctrl.update()).toBe(1.5);
  });
});
