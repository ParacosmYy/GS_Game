import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';

describe('Ryo Poses Frame Coverage', () => {
  const MINIMUM_POSES: { state: string; minFrames: number }[] = [
    { state: FighterState.IDLE, minFrames: 4 },
    { state: FighterState.WALK, minFrames: 4 },
    { state: FighterState.RUN, minFrames: 2 },
    { state: FighterState.CROUCH, minFrames: 1 },
    { state: FighterState.JUMP, minFrames: 4 },
    { state: FighterState.HITSTUN, minFrames: 2 },
    { state: FighterState.BLOCK, minFrames: 2 },
    { state: FighterState.KNOCKDOWN, minFrames: 3 },
  ];

  describe('minimum poses exist and have sufficient frames', () => {
    for (const { state, minFrames } of MINIMUM_POSES) {
      it(`${state} exists with >= ${minFrames} frames`, () => {
        const pose = RyoDef.poses[state];
        expect(pose).toBeDefined();
        if (Array.isArray(pose)) {
          expect(pose.length).toBeGreaterThanOrEqual(minFrames);
        } else {
          // Single pose = 1 frame
          expect(minFrames).toBeLessThanOrEqual(1);
        }
      });
    }
  });

  describe('attack poses exist', () => {
    const attackStates = [FighterState.STAND_ATTACK, FighterState.CROUCH_ATTACK, FighterState.AIR_ATTACK];
    for (const state of attackStates) {
      it(`${state} exists`, () => {
        const pose = RyoDef.poses[state];
        expect(pose).toBeDefined();
      });
    }
  });

  describe('total unique pose states', () => {
    it('ryo has at least 15 pose states', () => {
      const poseKeys = Object.keys(RyoDef.poses);
      expect(poseKeys.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('idle has the most detailed animation', () => {
    it('idle has >= 8 frames', () => {
      const idle = RyoDef.poses[FighterState.IDLE];
      if (Array.isArray(idle)) {
        expect(idle.length).toBeGreaterThanOrEqual(8);
      }
    });
  });
});
