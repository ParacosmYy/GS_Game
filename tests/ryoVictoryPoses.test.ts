/**
 * Ryo Victory Poses Tests
 *
 * Verifies Ryo's win pose, taunt, and MAX mode activation animations:
 *   - Win pose exists with 8 frames showing recovery-to-confident progression
 *   - Taunt exists with 6 frames showing beckoning gesture
 *   - MAX mode activation exists with 4 frames showing energy gathering
 *   - All poses use valid bone values
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';
import type { Pose, BonePose } from '../src/characters/types.js';

// ── Helpers ──

/** Extract a Pose[] from the character's pose set for a given key */
function getPoseArray(key: string): Pose[] | null {
  const raw = RyoDef.poses[key];
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as Pose[];
  return null;
}

/** Check that all bone values in a pose are finite numbers */
function allBonesFinite(p: Pose): boolean {
  const bones: BonePose[] = [p.head, p.body, p.armFront, p.armBack, p.legFront, p.legBack];
  return bones.every(b =>
    Number.isFinite(b.ox) && Number.isFinite(b.oy) &&
    Number.isFinite(b.rot) && Number.isFinite(b.scale),
  );
}

/** Get all BonePose values from a Pose as a flat array */
function allBones(p: Pose): BonePose[] {
  return [p.head, p.body, p.armFront, p.armBack, p.legFront, p.legBack];
}

// ── Tests ──

describe('Ryo WIN_POSE', () => {
  const winPose = getPoseArray('WIN_POSE');

  it('exists and has 8 frames', () => {
    expect(winPose).not.toBeNull();
    expect(winPose!.length).toBe(8);
  });

  it('shows progression from recovery to confident stance', () => {
    expect(winPose).not.toBeNull();
    const frames = winPose!;

    // Frame 0: recovery — head tilted down (positive oy = lower)
    expect(frames[0].head.oy).toBeGreaterThan(frames[5].head.oy);

    // Frame 0: body elevated (positive oy = lower stance)
    expect(frames[0].body.oy).toBeGreaterThan(frames[5].body.oy);

    // Frame 5+: confident stance — body straightens (negative or zero rot)
    expect(frames[5].body.rot).toBeLessThanOrEqual(0);
    expect(frames[6].body.rot).toBeLessThanOrEqual(0);
  });

  it('last frames are suitable for looping (minimal change between frames 6 and 7)', () => {
    expect(winPose).not.toBeNull();
    const frames = winPose!;
    const f6 = frames[6];
    const f7 = frames[7];

    // The loop frames should have very similar values — the difference should be small
    // to create a smooth breathing loop
    const bodyOyDiff = Math.abs(f6.body.oy - f7.body.oy);
    const armFrontOxDiff = Math.abs(f6.armFront.ox - f7.armFront.ox);
    const headOyDiff = Math.abs(f6.head.oy - f7.head.oy);

    // Loop frames should differ by at most 1-2 units for smooth looping
    expect(bodyOyDiff).toBeLessThanOrEqual(2);
    expect(armFrontOxDiff).toBeLessThanOrEqual(1);
    expect(headOyDiff).toBeLessThanOrEqual(2);
  });

  it('shows gi adjustment in middle frames (frames 3-4)', () => {
    expect(winPose).not.toBeNull();
    const frames = winPose!;

    // Frame 3 (gi adjustment): armFront should be lower (higher oy) than frame 2
    // because Ryo pulls down on his gi
    expect(frames[3].armFront.oy).toBeGreaterThan(frames[2].armFront.oy);

    // Frame 3: head tilted slightly for adjustment (positive rot = looking down)
    expect(frames[3].head.rot).toBeGreaterThan(frames[5].head.rot);
  });
});

describe('Ryo TAUNT', () => {
  const taunt = getPoseArray(FighterState.TAUNT);

  it('exists and has 6 frames', () => {
    expect(taunt).not.toBeNull();
    expect(taunt!.length).toBe(6);
  });

  it('shows beckoning gesture with armFront changes', () => {
    expect(taunt).not.toBeNull();
    const frames = taunt!;

    // Frame 0-1: armFront moves forward (ox increases) and rotates outward
    expect(frames[1].armFront.ox).toBeGreaterThan(frames[0].armFront.ox);
    expect(frames[1].armFront.rot).toBeGreaterThan(frames[0].armFront.rot);

    // Peak beckoning: armFront.ox should be at maximum in frame 1
    expect(frames[1].armFront.ox).toBeGreaterThanOrEqual(frames[2].armFront.ox);
  });

  it('returns to fighting stance by the last frame', () => {
    expect(taunt).not.toBeNull();
    const frames = taunt!;
    const lastFrame = frames[5];

    // Final frame should have head facing forward (small rot)
    expect(Math.abs(lastFrame.head.rot)).toBeLessThanOrEqual(0.1);

    // Final frame armFront should be close to guard position
    expect(lastFrame.armFront.ox).toBeLessThan(frames[1].armFront.ox);
  });
});

describe('Ryo MAX_MODE activation', () => {
  const maxMode = getPoseArray(FighterState.MAX_MODE);

  it('exists and has 4 frames', () => {
    expect(maxMode).not.toBeNull();
    expect(maxMode!.length).toBe(4);
  });

  it('shows energy gathering (body.oy decreases then increases)', () => {
    expect(maxMode).not.toBeNull();
    const frames = maxMode!;

    // Frame 0: crouch/gather — body.oy should be positive (low stance)
    expect(frames[0].body.oy).toBeGreaterThan(0);

    // Frame 1: explode upward — body.oy should decrease (rise up)
    expect(frames[1].body.oy).toBeLessThan(frames[0].body.oy);

    // Frame 1: body.oy should be negative (elevated above neutral)
    expect(frames[1].body.oy).toBeLessThan(0);
  });

  it('shows arm expansion during power burst (frame 1 arms spread wider)', () => {
    expect(maxMode).not.toBeNull();
    const frames = maxMode!;

    // Frame 1 (explosion): arms should be more spread than frame 0 (crouch)
    expect(frames[1].armFront.ox).toBeGreaterThan(frames[0].armFront.ox);
    expect(frames[1].armBack.ox).toBeLessThan(frames[0].armBack.ox);

    // Arms should have scale > 1 during power burst
    expect(frames[1].armFront.scale).toBeGreaterThan(1);
    expect(frames[1].armBack.scale).toBeGreaterThan(1);
  });

  it('settles into MAX fighting stance by final frame', () => {
    expect(maxMode).not.toBeNull();
    const frames = maxMode!;
    const final = frames[3];

    // Final frame: body should be near neutral (small oy)
    expect(Math.abs(final.body.oy)).toBeLessThanOrEqual(5);

    // Final frame: arms in guard position (armFront forward, armBack back)
    expect(final.armFront.ox).toBeGreaterThan(0);
    expect(final.armBack.ox).toBeLessThan(0);

    // Final frame: legs should be stable (near zero rotation)
    expect(Math.abs(final.legFront.rot)).toBeLessThanOrEqual(0.1);
  });
});

describe('Ryo victory poses — bone validity', () => {
  const allPoseKeys = ['WIN_POSE', FighterState.TAUNT, FighterState.MAX_MODE];

  it('all poses use finite bone values', () => {
    for (const key of allPoseKeys) {
      const frames = getPoseArray(key);
      expect(frames, `Pose "${key}" should exist`).not.toBeNull();
      for (let i = 0; i < frames!.length; i++) {
        expect(
          allBonesFinite(frames![i]),
          `Frame ${i} of "${key}" should have all finite bone values`,
        ).toBe(true);
      }
    }
  });

  it('all bone scales are positive', () => {
    for (const key of allPoseKeys) {
      const frames = getPoseArray(key)!;
      for (let i = 0; i < frames.length; i++) {
        const bones = allBones(frames[i]);
        for (const b of bones) {
          expect(
            b.scale,
            `Frame ${i} of "${key}" bone scale should be positive`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});
