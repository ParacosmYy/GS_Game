import { describe, it, expect } from 'vitest';
import { getIdlePoses, getRunPoses, getJumpPoses, getHitPoses, getBlockPoses } from '../src/rendering/spritePoseData.js';

describe('spritePoseData functions', () => {
  it('getIdlePoses returns non-empty array', () => {
    const poses = getIdlePoses('default');
    expect(Array.isArray(poses)).toBe(true);
    expect(poses.length).toBeGreaterThan(0);
  });
  it('getRunPoses returns non-empty array', () => {
    const poses = getRunPoses('default');
    expect(Array.isArray(poses)).toBe(true);
    expect(poses.length).toBeGreaterThan(0);
  });
  it('getJumpPoses returns non-empty array', () => {
    const poses = getJumpPoses('default');
    expect(Array.isArray(poses)).toBe(true);
    expect(poses.length).toBeGreaterThan(0);
  });
  it('getHitPoses returns non-empty array', () => {
    const poses = getHitPoses('default');
    expect(Array.isArray(poses)).toBe(true);
    expect(poses.length).toBeGreaterThan(0);
  });
  it('getBlockPoses returns non-empty array', () => {
    const poses = getBlockPoses('default');
    expect(Array.isArray(poses)).toBe(true);
    expect(poses.length).toBeGreaterThan(0);
  });
});
