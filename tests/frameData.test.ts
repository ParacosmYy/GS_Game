import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('FRAME_DATA', () => {
  const keys = Object.keys(FRAME_DATA);
  it('has 10+ entries', () => {
    expect(keys.length).toBeGreaterThanOrEqual(10);
  });
  it('has STAND_A entry', () => {
    expect(FRAME_DATA['STAND_A']).toBeDefined();
    expect(FRAME_DATA['STAND_A'].startup).toBeGreaterThan(0);
  });
  it('has STAND_C entry with damage', () => {
    expect(FRAME_DATA['STAND_C']).toBeDefined();
    expect(FRAME_DATA['STAND_C'].damage).toBeGreaterThan(0);
  });
  it('has CROUCH_A entry', () => {
    expect(FRAME_DATA['CROUCH_A']).toBeDefined();
  });
  it('has JUMP_C entry', () => {
    expect(FRAME_DATA['JUMP_C']).toBeDefined();
  });
  it('all entries have startup > 0', () => {
    for (const key of keys) {
      expect(FRAME_DATA[key].startup).toBeGreaterThan(0);
    }
  });
});
