import { describe, it, expect } from 'vitest';
import { RYO_ROLL_FRAMES, RYO_BACK_ROLL_FRAMES, RYO_GUARD_CRUSH_FRAMES, RYO_MAX_MODE_FRAMES, RYO_TAUNT_FRAMES, RYO_COUNTER_STANCE_FRAMES, RYO_RYUKO_RANBU_FRAMES } from '../src/rendering/sprites/ryoMovementFrames.js';

describe('ryoMovementFrames extended', () => {
  it('RYO_ROLL_FRAMES is non-empty', () => {
    expect(RYO_ROLL_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_BACK_ROLL_FRAMES is non-empty', () => {
    expect(RYO_BACK_ROLL_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_GUARD_CRUSH_FRAMES is non-empty', () => {
    expect(RYO_GUARD_CRUSH_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_MAX_MODE_FRAMES is non-empty', () => {
    expect(RYO_MAX_MODE_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_TAUNT_FRAMES is non-empty', () => {
    expect(RYO_TAUNT_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_COUNTER_STANCE_FRAMES is non-empty', () => {
    expect(RYO_COUNTER_STANCE_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_RYUKO_RANBU_FRAMES is non-empty', () => {
    expect(RYO_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(0);
  });
});
