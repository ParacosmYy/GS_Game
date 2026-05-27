import { describe, it, expect } from 'vitest';
import { RYO_CROUCH_A_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchFrames.js';
import { RYO_CROUCH_B_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchKickFrames.js';
import { RYO_BLOCK_FRAMES } from '../src/rendering/sprites/ryo/ryoBlockFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from '../src/rendering/sprites/ryo/ryoDamageFrames.js';
import { RYO_KO_HOU_FRAMES, RYO_KOOU_FRAMES } from '../src/rendering/sprites/ryo/ryoSpecialFrames.js';
import { RYO_DM_TEN_HA_OU_FRAMES } from '../src/rendering/sprites/ryo/ryoSuperFrames.js';
import { RYO_THROW_FRAMES } from '../src/rendering/sprites/ryo/ryoThrowFrames.js';
import { RYO_WIN_FRAMES } from '../src/rendering/sprites/ryo/ryoWinFrames.js';
import { RYO_DIZZY_FRAMES } from '../src/rendering/sprites/ryo/ryoDizzyFrames.js';

describe('ryoSpriteFrames batch3', () => {
  it('RYO_CROUCH_A_FRAMES is non-empty', () => {
    expect(RYO_CROUCH_A_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_CROUCH_B_FRAMES is non-empty', () => {
    expect(RYO_CROUCH_B_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_BLOCK_FRAMES is non-empty', () => {
    expect(RYO_BLOCK_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_HURT_FRAMES is non-empty', () => {
    expect(RYO_HURT_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_KNOCKDOWN_FRAMES is non-empty', () => {
    expect(RYO_KNOCKDOWN_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_KO_HOU_FRAMES is non-empty', () => {
    expect(RYO_KO_HOU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_KOOU_FRAMES is non-empty', () => {
    expect(RYO_KOOU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_DM_TEN_HA_OU_FRAMES is non-empty', () => {
    expect(RYO_DM_TEN_HA_OU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_THROW_FRAMES is non-empty', () => {
    expect(RYO_THROW_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_WIN_FRAMES is non-empty', () => {
    expect(RYO_WIN_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_DIZZY_FRAMES is non-empty', () => {
    expect(RYO_DIZZY_FRAMES.length).toBeGreaterThan(0);
  });
});
