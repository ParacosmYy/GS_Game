/**
 * Ryo Damage Animation Tests
 *
 * Verifies hitstun, knockdown, dizzy, and guard crush animations:
 *   - Correct frame counts
 *   - Impact progression (impact → stagger → recovery)
 *   - Body going from vertical to horizontal for knockdown
 *   - Head oscillation for dizzy
 *   - Arms going from guard to wide open for guard crush
 *   - Smooth frame transitions (no sudden jumps)
 *   - All bone values are valid (finite numbers, scale > 0)
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

// ── HITSTUN Tests ──

describe('Ryo HITSTUN animation', () => {
  const poses = getPoses(FighterState.HITSTUN);

  it('has 5 frames showing impact progression', () => {
    expect(poses).toHaveLength(5);
  });

  it('first frame shows body leaning back (body.ox negative)', () => {
    expect(poses[0].body.ox).toBeLessThan(0);
  });

  it('first frame differs from last frame (impact vs recovery)', () => {
    const first = poses[0];
    const last = poses[poses.length - 1];
    // body.ox should be more negative on first frame (more lean)
    expect(first.body.ox).toBeLessThan(last.body.ox);
  });

  it('peak stagger frame has maximum body rotation magnitude', () => {
    const bodyRots = poses.map(p => Math.abs(p.body.rot));
    const peakFrame = bodyRots.indexOf(Math.max(...bodyRots));
    // Peak should be at frame 1 or 2 (the recoil/peak stagger phase), not at frame 0 or 4
    expect(peakFrame).toBeGreaterThanOrEqual(1);
    expect(peakFrame).toBeLessThanOrEqual(2);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth (no sudden jumps in body values)', () => {
    const bodyFrames = getBoneFrames(FighterState.HITSTUN, 'body');
    const maxOxJump = maxConsecutiveJump(bodyFrames, 'ox');
    const maxOyJump = maxConsecutiveJump(bodyFrames, 'oy');
    const maxRotJump = maxConsecutiveJump(bodyFrames, 'rot');
    // Reasonable thresholds: no single-frame jump > 8 for ox/oy, > 0.2 for rot
    expect(maxOxJump).toBeLessThanOrEqual(8);
    expect(maxOyJump).toBeLessThanOrEqual(8);
    expect(maxRotJump).toBeLessThanOrEqual(0.2);
  });
});

// ── KNOCKDOWN Tests ──

describe('Ryo KNOCKDOWN animation', () => {
  const poses = getPoses(FighterState.KNOCKDOWN);

  it('has 6 frames', () => {
    expect(poses).toHaveLength(6);
  });

  it('shows body going from vertical to horizontal (body.rot increases)', () => {
    const firstRot = poses[0].body.rot;
    const lastRot = poses[poses.length - 1].body.rot;
    // body.rot should increase (character tilts from upright to horizontal)
    expect(lastRot).toBeGreaterThan(firstRot);
    // Last frame should have significant rotation (near-horizontal)
    expect(lastRot).toBeGreaterThanOrEqual(1.0);
  });

  it('body drops downward as character falls (body.oy increases)', () => {
    const firstOy = poses[0].body.oy;
    const lastOy = poses[poses.length - 1].body.oy;
    expect(lastOy).toBeGreaterThan(firstOy);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth', () => {
    const bodyFrames = getBoneFrames(FighterState.KNOCKDOWN, 'body');
    const maxOxJump = maxConsecutiveJump(bodyFrames, 'ox');
    const maxOyJump = maxConsecutiveJump(bodyFrames, 'oy');
    const maxRotJump = maxConsecutiveJump(bodyFrames, 'rot');
    expect(maxOxJump).toBeLessThanOrEqual(8);
    expect(maxOyJump).toBeLessThanOrEqual(10);
    expect(maxRotJump).toBeLessThanOrEqual(0.45);
  });
});

// ── DIZZY Tests ──

describe('Ryo DIZZY animation', () => {
  const poses = getPoses(FighterState.DIZZY);

  it('exists and has 4 frames of wobble', () => {
    expect(poses).toHaveLength(4);
  });

  it('shows head oscillation (head.ox varies between left and right)', () => {
    const headOx = poses.map(p => p.head.ox);
    const hasLeftLean = headOx.some(v => v < -2);
    const hasRightLean = headOx.some(v => v > 2);
    expect(hasLeftLean).toBe(true);
    expect(hasRightLean).toBe(true);
  });

  it('head rotation oscillates (negative and positive values)', () => {
    const headRot = poses.map(p => p.head.rot);
    const hasNegativeRot = headRot.some(v => v < -0.1);
    const hasPositiveRot = headRot.some(v => v > 0.1);
    expect(hasNegativeRot).toBe(true);
    expect(hasPositiveRot).toBe(true);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth', () => {
    const headFrames = getBoneFrames(FighterState.DIZZY, 'head');
    const maxOxJump = maxConsecutiveJump(headFrames, 'ox');
    const maxRotJump = maxConsecutiveJump(headFrames, 'rot');
    expect(maxOxJump).toBeLessThanOrEqual(10);
    expect(maxRotJump).toBeLessThanOrEqual(0.4);
  });
});

// ── GUARD_CRUSH Tests ──

describe('Ryo GUARD_CRUSH animation', () => {
  const poses = getPoses(FighterState.GUARD_CRUSH);

  it('has 4 frames', () => {
    expect(poses).toHaveLength(4);
  });

  it('shows arms going from wide open to less wide (recovery)', () => {
    // armFront.ox: first frame should be more negative (flung wide/back) than last frame
    const firstArmFrontOx = poses[0].armFront.ox;
    const lastArmFrontOx = poses[poses.length - 1].armFront.ox;
    // Recovery should bring arms back toward guard position (less negative ox)
    expect(firstArmFrontOx).toBeLessThan(lastArmFrontOx);
  });

  it('peak vulnerability at frame 1 (maximum body lean backward)', () => {
    const bodyOxValues = poses.map(p => p.body.ox);
    const minOxIndex = bodyOxValues.indexOf(Math.min(...bodyOxValues));
    // Maximum backward lean should be at frame 0 or 1
    expect(minOxIndex).toBeLessThanOrEqual(1);
  });

  it('all bone values are valid', () => {
    assertValidBoneValues(poses);
  });

  it('frame progression is smooth', () => {
    const bodyFrames = getBoneFrames(FighterState.GUARD_CRUSH, 'body');
    const maxOxJump = maxConsecutiveJump(bodyFrames, 'ox');
    const maxOyJump = maxConsecutiveJump(bodyFrames, 'oy');
    expect(maxOxJump).toBeLessThanOrEqual(6);
    expect(maxOyJump).toBeLessThanOrEqual(6);
  });
});
