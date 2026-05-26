import { describe, it, expect } from 'vitest';
import { PW, PH, PIXEL, CHAR_VISUALS, getDefaultVisual, darken, lighten, IDLE_POSES, WALK_POSES, ATTACK_POSES, CROUCH_POSES, JUMP_POSES, HIT_POSES, BLOCK_POSES } from '../src/rendering/spritePoseData.js';

describe('spritePoseData', () => {
  it('PW/PH/PIXEL are positive numbers', () => {
    expect(PW).toBeGreaterThan(0);
    expect(PH).toBeGreaterThan(0);
    expect(PIXEL).toBeGreaterThan(0);
  });
  it('CHAR_VISUALS has entries', () => {
    expect(Object.keys(CHAR_VISUALS).length).toBeGreaterThan(0);
  });
  it('getDefaultVisual returns object with expected fields', () => {
    const v = getDefaultVisual();
    expect(v).toBeDefined();
    expect(typeof v).toBe('object');
  });
  it('darken returns hex string', () => {
    const d = darken('#ffffff');
    expect(typeof d).toBe('string');
    expect(d.startsWith('#')).toBe(true);
  });
  it('lighten returns hex string', () => {
    const l = lighten('#000000');
    expect(typeof l).toBe('string');
    expect(l.startsWith('#')).toBe(true);
  });
  it('pose arrays are non-empty', () => {
    expect(IDLE_POSES.length).toBeGreaterThan(0);
    expect(WALK_POSES.length).toBeGreaterThan(0);
    expect(ATTACK_POSES.length).toBeGreaterThan(0);
  });
  it('more pose arrays are non-empty', () => {
    expect(CROUCH_POSES.length).toBeGreaterThan(0);
    expect(JUMP_POSES.length).toBeGreaterThan(0);
    expect(HIT_POSES.length).toBeGreaterThan(0);
    expect(BLOCK_POSES.length).toBeGreaterThan(0);
  });
});
