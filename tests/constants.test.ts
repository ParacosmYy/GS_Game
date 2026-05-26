import { describe, it, expect } from 'vitest';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, ROUND_TIME, STAGE_WIDTH, STAGE_GROUND_Y,
  GRAVITY, JUMP_VELOCITY, FIGHTER_WIDTH, FIGHTER_HEIGHT,
  STAGE_LEFT, STAGE_RIGHT,
  MAX_HEALTH, MAX_STOCKS, METER_PER_STOCK,
  isInLeftCorner, isInRightCorner, isInCorner, clampToStage,
  WALK_SPEED, RUN_SPEED, THROW_RANGE,
  TICK_RATE, COMMAND_WINDOW,
  getHitstopFrames, getSparkType, getSparkSizeScale, getSparkCount,
  getShakeIntensity, getShakeDuration
} from '../src/core/constants.js';

describe('constants', () => {
  describe('canvas & stage', () => {
    it('CANVAS dimensions positive', () => {
      expect(CANVAS_WIDTH).toBeGreaterThan(0);
      expect(CANVAS_HEIGHT).toBeGreaterThan(0);
    });
    it('STAGE_WIDTH >= CANVAS_WIDTH', () => expect(STAGE_WIDTH).toBeGreaterThanOrEqual(CANVAS_WIDTH));
    it('STAGE_GROUND_Y within canvas', () => expect(STAGE_GROUND_Y).toBeGreaterThan(0));
    it('ROUND_TIME positive', () => expect(ROUND_TIME).toBeGreaterThan(0));
  });

  describe('fighter physics', () => {
    it('GRAVITY positive', () => expect(GRAVITY).toBeGreaterThan(0));
    it('JUMP_VELOCITY negative (upward)', () => expect(JUMP_VELOCITY).toBeLessThan(0));
    it('FIGHTER dimensions positive', () => {
      expect(FIGHTER_WIDTH).toBeGreaterThan(0);
      expect(FIGHTER_HEIGHT).toBeGreaterThan(0);
    });
    it('WALK_SPEED < RUN_SPEED', () => expect(WALK_SPEED).toBeLessThan(RUN_SPEED));
    it('THROW_RANGE positive', () => expect(THROW_RANGE).toBeGreaterThan(0));
  });

  describe('combat values', () => {
    it('MAX_HEALTH positive', () => expect(MAX_HEALTH).toBeGreaterThan(0));
    it('MAX_STOCKS positive', () => expect(MAX_STOCKS).toBeGreaterThan(0));
    it('METER_PER_STOCK positive', () => expect(METER_PER_STOCK).toBeGreaterThan(0));
  });

  describe('timing', () => {
    it('TICK_RATE positive', () => expect(TICK_RATE).toBeGreaterThan(0));
    it('COMMAND_WINDOW positive', () => expect(COMMAND_WINDOW).toBeGreaterThan(0));
  });

  describe('stage bounds functions', () => {
    it('isInLeftCorner detects left edge', () => {
      expect(isInLeftCorner(STAGE_LEFT)).toBe(true);
      expect(isInLeftCorner(STAGE_RIGHT)).toBe(false);
    });
    it('isInRightCorner detects right edge', () => {
      expect(isInRightCorner(STAGE_RIGHT)).toBe(true);
      expect(isInRightCorner(STAGE_LEFT)).toBe(false);
    });
    it('isInCorner detects either', () => {
      expect(isInCorner(STAGE_LEFT)).toBe(true);
      expect(isInCorner(STAGE_RIGHT)).toBe(true);
    });
    it('clampToStage keeps within bounds', () => {
      expect(clampToStage(STAGE_LEFT - 100)).toBeGreaterThanOrEqual(STAGE_LEFT);
      expect(clampToStage(STAGE_RIGHT + 100)).toBeLessThanOrEqual(STAGE_RIGHT);
    });
  });

  describe('hitstop/spark/shake getters', () => {
    it('getHitstopFrames returns number', () => {
      expect(typeof getHitstopFrames('light')).toBe('number');
      expect(getHitstopFrames('light')).toBeGreaterThan(0);
    });
    it('getSparkType returns string', () => {
      expect(typeof getSparkType('light')).toBe('string');
    });
    it('getSparkSizeScale returns number', () => {
      expect(typeof getSparkSizeScale('light')).toBe('number');
    });
    it('getSparkCount returns number', () => {
      expect(typeof getSparkCount('light')).toBe('number');
    });
    it('getShakeIntensity returns number', () => {
      expect(typeof getShakeIntensity('light')).toBe('number');
    });
    it('getShakeDuration returns number', () => {
      expect(typeof getShakeDuration('light')).toBe('number');
    });
  });
});
