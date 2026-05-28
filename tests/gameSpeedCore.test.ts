/**
 * Game Speed Controller Regression Tests
 *
 * Validates speed control, slow-motion, and preset configurations.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameSpeedController,
  SLOWMO_SUPER_FLASH,
  SLOWMO_KO,
} from '../src/core/gameSpeed.js';

describe('GameSpeedController', () => {
  let ctrl: GameSpeedController;

  beforeEach(() => {
    ctrl = new GameSpeedController();
  });

  it('defaults to speed 1.0', () => {
    expect(ctrl.getBaseSpeed()).toBe(1.0);
    expect(ctrl.getSpeed()).toBe(1.0);
  });

  it('setSpeed changes base speed', () => {
    ctrl.setSpeed(0.5);
    expect(ctrl.getBaseSpeed()).toBe(0.5);
  });

  it('setSpeed ignores non-positive values', () => {
    ctrl.setSpeed(0);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
    ctrl.setSpeed(-1);
    expect(ctrl.getBaseSpeed()).toBe(1.0);
  });

  it('update returns base speed when no slow-mo', () => {
    expect(ctrl.update()).toBe(1.0);
  });

  it('triggerSlowMo activates slow motion', () => {
    ctrl.triggerSlowMo(5, 0.3);
    expect(ctrl.isSlowMo()).toBe(true);
    const speed = ctrl.update();
    expect(speed).toBeLessThan(1.0);
  });

  it('slow-mo expires after duration ticks', () => {
    ctrl.triggerSlowMo(3, 0.5);
    expect(ctrl.isSlowMo()).toBe(true);
    ctrl.update(); // tick 1
    expect(ctrl.isSlowMo()).toBe(true);
    ctrl.update(); // tick 2
    expect(ctrl.isSlowMo()).toBe(true);
    ctrl.update(); // tick 3 (expires)
    expect(ctrl.isSlowMo()).toBe(false);
    expect(ctrl.getSpeed()).toBe(1.0);
  });

  it('getSlowMoProgress goes from 0 to 1', () => {
    ctrl.triggerSlowMo(4, 0.3);
    expect(ctrl.getSlowMoProgress()).toBe(0);
    ctrl.update(); // 1/4
    expect(ctrl.getSlowMoProgress()).toBeGreaterThan(0);
    expect(ctrl.getSlowMoProgress()).toBeLessThan(1);
    ctrl.update(); ctrl.update(); ctrl.update(); // 4/4
    expect(ctrl.getSlowMoProgress()).toBe(1);
  });

  it('cancelSlowMo stops immediately', () => {
    ctrl.triggerSlowMo(10, 0.2);
    expect(ctrl.isSlowMo()).toBe(true);
    ctrl.cancelSlowMo();
    expect(ctrl.isSlowMo()).toBe(false);
    expect(ctrl.getSpeed()).toBe(1.0);
  });

  it('slow-mo speed is clamped to [0.01, 1.0]', () => {
    ctrl.triggerSlowMo(5, 0.0);
    const speed = ctrl.update();
    expect(speed).toBeGreaterThan(0);
    ctrl.cancelSlowMo();
    ctrl.triggerSlowMo(5, 2.0);
    const speed2 = ctrl.update();
    expect(speed2).toBeLessThanOrEqual(ctrl.getBaseSpeed());
  });

  it('slow-mo respects custom base speed', () => {
    ctrl.setSpeed(2.0);
    ctrl.triggerSlowMo(3, 0.5);
    const speed = ctrl.update();
    expect(speed).toBe(1.0); // 2.0 * 0.5
  });

  it('reset clears everything', () => {
    ctrl.setSpeed(1.5);
    ctrl.triggerSlowMo(10, 0.2);
    ctrl.reset();
    expect(ctrl.getBaseSpeed()).toBe(1.0);
    expect(ctrl.getSpeed()).toBe(1.0);
    expect(ctrl.isSlowMo()).toBe(false);
  });

  it('triggerSlowMo ignores zero/negative duration', () => {
    ctrl.triggerSlowMo(0, 0.3);
    expect(ctrl.isSlowMo()).toBe(false);
    ctrl.triggerSlowMo(-5, 0.3);
    expect(ctrl.isSlowMo()).toBe(false);
  });
});

describe('SLOWMO presets', () => {
  it('SLOWMO_SUPER_FLASH has correct values', () => {
    expect(SLOWMO_SUPER_FLASH.speed).toBe(1.0);
    expect(SLOWMO_SUPER_FLASH.slowMoTrigger).toBe('super_flash');
    expect(SLOWMO_SUPER_FLASH.slowMoDuration).toBeGreaterThan(0);
    expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBeGreaterThan(0);
    expect(SLOWMO_SUPER_FLASH.slowMoSpeed).toBeLessThan(1.0);
  });

  it('SLOWMO_KO has correct values', () => {
    expect(SLOWMO_KO.speed).toBe(1.0);
    expect(SLOWMO_KO.slowMoTrigger).toBe('ko');
    expect(SLOWMO_KO.slowMoDuration).toBeGreaterThan(SLOWMO_SUPER_FLASH.slowMoDuration);
    expect(SLOWMO_KO.slowMoSpeed).toBeLessThan(SLOWMO_SUPER_FLASH.slowMoSpeed);
  });
});
