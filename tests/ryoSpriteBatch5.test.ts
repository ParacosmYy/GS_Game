import { describe, it, expect } from 'vitest';
import { RYO_BACKDASH_FRAMES } from '../src/rendering/sprites/ryo/ryoMovementFrames.js';
import { RYO_CROUCH_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchKickFrames.js';
import { RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryo/ryoKickFrames.js';
import { RYO_AIR_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAirAttackFrames.js';
import { RYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/ryo/ryoWalkFrames.js';

describe('ryoSpriteFrames batch5', () => {
  it('RYO_BACKDASH_FRAMES is non-empty', () => {
    expect(RYO_BACKDASH_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CROUCH_D_FRAMES is non-empty', () => {
    expect(RYO_CROUCH_D_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_STAND_D_FRAMES is non-empty', () => {
    expect(RYO_STAND_D_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_AIR_C_FRAMES is non-empty', () => {
    expect(RYO_AIR_C_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_WALK_BACKWARD_FRAMES is non-empty', () => {
    expect(RYO_WALK_BACKWARD_FRAMES.length).toBeGreaterThan(0);
  });
});
