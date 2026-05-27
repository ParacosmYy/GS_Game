import { describe, it, expect } from 'vitest';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryo/ryoKickFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAirAttackFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCloseKickFrames.js';

describe('ryoSpriteFrames batch2', () => {
  it('RYO_STAND_A_FRAMES is non-empty', () => {
    expect(RYO_STAND_A_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_STAND_C_FRAMES is non-empty', () => {
    expect(RYO_STAND_C_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_STAND_B_FRAMES is non-empty', () => {
    expect(RYO_STAND_B_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_AIR_A_FRAMES is non-empty', () => {
    expect(RYO_AIR_A_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CLOSE_B_FRAMES is non-empty', () => {
    expect(RYO_CLOSE_B_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CLOSE_D_FRAMES is non-empty', () => {
    expect(RYO_CLOSE_D_FRAMES.length).toBeGreaterThan(0);
  });
});
