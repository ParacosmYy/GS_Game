import { describe, it, expect } from 'vitest';
import { RYO_IDLE_FRAMES } from '../src/rendering/sprites/ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/ryoWalkFrames.js';
import { RYO_RUN_FRAMES, RYO_BACKDASH_FRAMES } from '../src/rendering/sprites/ryoMovementFrames.js';
import { RYO_JUMP_FRAMES } from '../src/rendering/sprites/ryoJumpFrames.js';
import { RYO_CROUCH_FRAMES } from '../src/rendering/sprites/ryoCrouchFrames.js';

describe('ryoSpriteFrames batch1', () => {
  it('RYO_IDLE_FRAMES is non-empty', () => {
    expect(RYO_IDLE_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_WALK_FORWARD_FRAMES is non-empty', () => {
    expect(RYO_WALK_FORWARD_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_WALK_BACKWARD_FRAMES is non-empty', () => {
    expect(RYO_WALK_BACKWARD_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_RUN_FRAMES is non-empty', () => {
    expect(RYO_RUN_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_JUMP_FRAMES is non-empty', () => {
    expect(RYO_JUMP_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CROUCH_FRAMES is non-empty', () => {
    expect(RYO_CROUCH_FRAMES.length).toBeGreaterThan(0);
  });
});
