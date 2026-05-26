import { describe, it, expect } from 'vitest';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, ROUND_TIME, STAGE_WIDTH,
  GRAVITY, MAX_HEALTH, FIGHTER_WIDTH, FIGHTER_HEIGHT,
  MAX_STOCKS, METER_PER_STOCK, THROW_RANGE,
  HITSTOP_LIGHT, HITSTOP_DM, SHAKE_KO, KO_DISPLAY_TIME
} from '../src/core/constants.js';

describe('core constants', () => {
  it('canvas is 800x600', () => {
    expect(CANVAS_WIDTH).toBe(800);
    expect(CANVAS_HEIGHT).toBe(600);
  });
  it('round time is 99', () => {
    expect(ROUND_TIME).toBe(99);
  });
  it('stage and fighter dimensions are positive', () => {
    expect(STAGE_WIDTH).toBeGreaterThan(0);
    expect(FIGHTER_WIDTH).toBeGreaterThan(0);
    expect(FIGHTER_HEIGHT).toBeGreaterThan(0);
  });
  it('physics constants are valid', () => {
    expect(GRAVITY).toBeGreaterThan(0);
    expect(MAX_HEALTH).toBeGreaterThan(0);
    expect(THROW_RANGE).toBeGreaterThan(0);
  });
  it('meter system is consistent', () => {
    expect(MAX_STOCKS).toBeGreaterThan(0);
    expect(METER_PER_STOCK).toBeGreaterThan(0);
  });
  it('hitstop values increase by tier', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_DM);
    expect(HITSTOP_DM).toBeGreaterThan(0);
  });
  it('shake values increase by tier', () => {
    expect(SHAKE_KO).toBeGreaterThan(0);
    expect(KO_DISPLAY_TIME).toBeGreaterThan(0);
  });
});
