import { describe, it, expect } from 'vitest';
import { getVictoryPose } from '../src/rendering/victoryPose.js';

describe('victoryPose', () => {
  it('returns pose for kyo', () => {
    const pose = getVictoryPose('kyo', 0);
    expect(pose).toBeDefined();
    expect(pose.head).toBeDefined();
    expect(pose.body).toBeDefined();
  });
  it('returns pose for iori', () => {
    const pose = getVictoryPose('iori', 0);
    expect(pose).toBeDefined();
    expect(pose.armFront).toBeDefined();
  });
  it('returns pose for ryo', () => {
    const pose = getVictoryPose('ryo', 0);
    expect(pose).toBeDefined();
    expect(pose.legFront).toBeDefined();
  });
  it('pose changes with tick', () => {
    const p0 = getVictoryPose('kyo', 0);
    const p10 = getVictoryPose('kyo', 10);
    expect(p0.head.oy).not.toBe(p10.head.oy);
  });
  it('unknown char returns default pose', () => {
    const pose = getVictoryPose('unknown_char', 0);
    expect(pose).toBeDefined();
  });
});
