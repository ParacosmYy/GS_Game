import { describe, it, expect } from 'vitest';
import { RYO_SDM_TEN_HA_OU_FRAMES, RYO_HSDM_RYUKO_RANBU_FRAMES } from '../src/rendering/sprites/ryoSuperFrames.js';
import { RYO_DM_RYUKO_RANBU_FRAMES } from '../src/rendering/sprites/ryoSuperFrames.js';
import { RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryoKickFrames.js';
import { RYO_CROUCH_D_FRAMES } from '../src/rendering/sprites/ryoCrouchKickFrames.js';
import { RYO_AIR_C_FRAMES } from '../src/rendering/sprites/ryoAirAttackFrames.js';

describe('ryoSpriteFrames batch4', () => {
  it('RYO_SDM_TEN_HA_OU_FRAMES is non-empty', () => {
    expect(RYO_SDM_TEN_HA_OU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_HSDM_RYUKO_RANBU_FRAMES is non-empty', () => {
    expect(RYO_HSDM_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_DM_RYUKO_RANBU_FRAMES is non-empty', () => {
    expect(RYO_DM_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_STAND_D_FRAMES is non-empty', () => {
    expect(RYO_STAND_D_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CROUCH_D_FRAMES is non-empty', () => {
    expect(RYO_CROUCH_D_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_AIR_C_FRAMES is non-empty', () => {
    expect(RYO_AIR_C_FRAMES.length).toBeGreaterThan(0);
  });
});
