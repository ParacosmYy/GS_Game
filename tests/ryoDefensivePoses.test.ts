/**
 * Ryo Defensive Poses Tests
 *
 * Verifies BLOCK, AIR_BLOCK, THROW, and COUNTER_STANCE animations:
 *   - Correct frame counts
 *   - Arms in protective positions for blocking
 *   - Grab → turn → throw progression for throws
 *   - Body rotation increases during throw execution
 *   - Defensive ready position for counter stance
 *   - All bone values are valid (finite numbers, scale > 0)
 *   - Smooth frame transitions (no sudden jumps)
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';
import type { Pose, BonePose } from '../src/characters/types.js';

// ── Helpers ──

/** Get poses array for a given fighter state, asserting it's an array */
function getPoses(state: FighterState): Pose[] {
  const poses = RyoDef.poses[state];
  expect(poses).toBeDefined();
  expect(Array.isArray(poses)).toBe(true);
  return poses as Pose[];
}

/** Extract a specific bone from all frames of a state */
function getBoneFrames(state: FighterState, boneName: keyof Pose): BonePose[] {
  return getPoses(state).map(p => p[boneName]);
}

/** Check that all bone values in a pose are valid (finite numbers, scale > 0) */
function assertValidBoneValues(poses: Pose[]): void {
  for (let i = 0; i < poses.length; i++) {
    const p = poses[i];
    const bones: (keyof Pose)[] = ['head', 'body', 'armFront', 'armBack', 'legFront', 'legBack'];
    for (const boneName of bones) {
      const b = p[boneName];
      expect(Number.isFinite(b.ox)).toBe(true);
      expect(Number.isFinite(b.oy)).toBe(true);
      expect(Number.isFinite(b.rot)).toBe(true);
      expect(Number.isFinite(b.scale)).toBe(true);
      expect(b.scale).toBeGreaterThan(0);
    }
  }
}

/** Compute max absolute difference between consecutive frames for a bone property */
function maxConsecutiveJump(frames: BonePose[], prop: 'ox' | 'oy' | 'rot'): number {
  let maxJump = 0;
  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i][prop] - frames[i - 1][prop]);
    if (diff > maxJump) maxJump = diff;
  }
  return maxJump;
}

// ── BLOCK Tests ──

describe('Ryo BLOCK animation', () => {
  const poses = getPoses(FighterState.BLOCK);

  it('has 4 frames showing guard progression', () => {
    expect(poses).toHaveLength(4);
  });

  it('shows arms in protective position (armFront.rot positive = arm across body)', () => {
    // In guard position, armFront should be across the body (positive rotation)
    for (const p of poses) {
      expect(p.armFront.rot).toBeGreaterThan(0);
    }
  });

  it('armBack has negative rotation (support arm behind, guarding)', () => {
    for (const p of poses) {
      expect(p.armBack.rot).toBeLessThan(0);
    }
  });

  it('body has slight backward lean for bracing (body.rot >= 0)', () => {
    for (const p of poses) {
      expect(p.body.rot).toBeGreaterThanOrEqual(0);
    }
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth (no sudden jumps in body values)', () => {
    const bodyFrames = getBoneFrames(FighterState.BLOCK, 'body');
    const maxOxJump = maxConsecutiveJump(bodyFrames, 'ox');
    const maxOyJump = maxConsecutiveJump(bodyFrames, 'oy');
    const maxRotJump = maxConsecutiveJump(bodyFrames, 'rot');
    expect(maxOxJump).toBeLessThanOrEqual(6);
    expect(maxOyJump).toBeLessThanOrEqual(6);
    expect(maxRotJump).toBeLessThanOrEqual(0.15);
  });
});

// ── AIR_BLOCK Tests ──

describe('Ryo AIR_BLOCK animation', () => {
  const poses = getPoses(FighterState.AIR_BLOCK);

  it('has 3 frames', () => {
    expect(poses).toHaveLength(3);
  });

  it('shows raised arms for overhead protection (armFront.rot negative = arms up)', () => {
    // Arms raised to block overhead means negative rotation (pointing upward)
    for (const p of poses) {
      expect(p.armFront.rot).toBeLessThan(0);
    }
  });

  it('armBack also raised for overhead block (armBack.rot negative)', () => {
    for (const p of poses) {
      expect(p.armBack.rot).toBeLessThan(0);
    }
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });
});

// ── THROW Tests ──

describe('Ryo THROW animation', () => {
  const poses = getPoses(FighterState.THROW);

  it('has 6 frames', () => {
    expect(poses).toHaveLength(6);
  });

  it('shows grab progression (armFront.ox starts large then decreases)', () => {
    // Frame 0: arms extended forward (large ox), then pull back during throw
    const firstOx = poses[0].armFront.ox;
    const midOx = poses[2].armFront.ox;
    // Arms extend far at grab, then pull back during turn
    expect(firstOx).toBeGreaterThan(midOx);
  });

  it('body.rot increases during throw execution (body rotates)', () => {
    // body.rot should increase from grab to throw execution (frame 0 → frame 3)
    const grabRot = poses[0].body.rot;
    const throwExecRot = poses[3].body.rot;
    expect(throwExecRot).toBeGreaterThan(grabRot);
  });

  it('throw execution frame has maximum body rotation', () => {
    const bodyRots = poses.map(p => p.body.rot);
    const maxRotIndex = bodyRots.indexOf(Math.max(...bodyRots));
    // Maximum rotation should be during execution (frames 2-4)
    expect(maxRotIndex).toBeGreaterThanOrEqual(2);
    expect(maxRotIndex).toBeLessThanOrEqual(4);
  });

  it('recovery frame returns toward neutral (body.rot decreases from peak)', () => {
    const peakRot = Math.max(...poses.map(p => p.body.rot));
    const recoveryRot = poses[5].body.rot;
    expect(recoveryRot).toBeLessThan(peakRot);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });
});

// ── COUNTER_STANCE Tests ──

describe('Ryo COUNTER_STANCE animation', () => {
  const poses = getPoses(FighterState.COUNTER_STANCE);

  it('has 4 frames', () => {
    expect(poses).toHaveLength(4);
  });

  it('shows defensive ready position (body.oy > 0 = body lowered)', () => {
    // Counter stance has lowered body for frames 0-2 (ready position)
    for (let i = 0; i < 3; i++) {
      expect(poses[i].body.oy).toBeGreaterThan(0);
    }
  });

  it('counter activation frame (frame 3) has armFront thrust forward (large ox)', () => {
    // Frame 3 is the explosive counter response
    const activationOx = poses[3].armFront.ox;
    const readyOx = poses[1].armFront.ox;
    expect(activationOx).toBeGreaterThan(readyOx);
    // Should be significantly forward
    expect(activationOx).toBeGreaterThan(10);
  });

  it('counter activation has arm scale > 1 (power emphasis)', () => {
    // Frame 3 armFront should have scale > 1 to show power
    expect(poses[3].armFront.scale).toBeGreaterThan(1);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth', () => {
    const bodyFrames = getBoneFrames(FighterState.COUNTER_STANCE, 'body');
    const maxOxJump = maxConsecutiveJump(bodyFrames, 'ox');
    const maxOyJump = maxConsecutiveJump(bodyFrames, 'oy');
    expect(maxOxJump).toBeLessThanOrEqual(8);
    expect(maxOyJump).toBeLessThanOrEqual(6);
  });
});
