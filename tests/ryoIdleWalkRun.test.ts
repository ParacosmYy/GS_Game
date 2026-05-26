/**
 * Ryo IDLE / WALK / RUN animation pose tests
 *
 * Verifies frame counts, breathing cycle, leg alternation,
 * karate guard stance, forward lean, and bone value validity.
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';
import type { Pose, BonePose } from '../src/characters/types.js';

// ── Helpers ──

function getPoses(state: FighterState): Pose[] {
  const p = RyoDef.poses[state];
  if (Array.isArray(p)) return p;
  if (p) return [p];
  return [];
}

function isValidBone(b: BonePose): boolean {
  return (
    Number.isFinite(b.ox) &&
    Number.isFinite(b.oy) &&
    Number.isFinite(b.rot) &&
    Number.isFinite(b.scale)
  );
}

function allBonesValid(pose: Pose): boolean {
  return (
    isValidBone(pose.head) &&
    isValidBone(pose.body) &&
    isValidBone(pose.armFront) &&
    isValidBone(pose.armBack) &&
    isValidBone(pose.legFront) &&
    isValidBone(pose.legBack)
  );
}

// ─────────────────────────────────────────────────────
// IDLE tests
// ─────────────────────────────────────────────────────
describe('Ryo IDLE animation', () => {
  const idle = getPoses(FighterState.IDLE);

  it('has 8 frames', () => {
    expect(idle.length).toBe(8);
  });

  it('breathing cycle shows body.oy oscillation (rises then sinks)', () => {
    const bodyOys = idle.map((p) => p.body.oy);
    // Peak inhale (frame 2-3) should be lower oy than neutral (frame 0)
    const peakInhale = Math.min(...bodyOys.slice(0, 4));
    const neutral = bodyOys[0];
    expect(peakInhale).toBeLessThan(neutral);
    // Max exhale (frame 5-6) should be higher oy than neutral
    const maxExhale = Math.max(...bodyOys.slice(4));
    expect(maxExhale).toBeGreaterThan(neutral);
  });

  it('arms are in karate guard position (front arm forward, back arm near chin)', () => {
    // Kyokushin stance: front arm extended forward (positive ox, higher oy),
    // back arm near chin (negative ox, lower oy)
    for (let i = 0; i < idle.length; i++) {
      // Front arm extends forward
      expect(
        idle[i].armFront.ox,
        `Frame ${i}: front arm ox should be positive (extended forward)`,
      ).toBeGreaterThan(0);
      // Back arm stays back
      expect(
        idle[i].armBack.ox,
        `Frame ${i}: back arm ox should be negative (guard position)`,
      ).toBeLessThan(0);
    }
  });

  it('legs are in wide stance (legFront.ox > 0, legBack.ox < 0)', () => {
    for (let i = 0; i < idle.length; i++) {
      expect(
        idle[i].legFront.ox,
        `Frame ${i}: front leg ox should be positive`,
      ).toBeGreaterThan(0);
      expect(
        idle[i].legBack.ox,
        `Frame ${i}: back leg ox should be negative`,
      ).toBeLessThan(0);
    }
  });

  it('all frames have valid bone values', () => {
    for (let i = 0; i < idle.length; i++) {
      expect(
        allBonesValid(idle[i]),
        `Frame ${i} has invalid bone values`,
      ).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────
// WALK tests
// ─────────────────────────────────────────────────────
describe('Ryo WALK animation', () => {
  const walk = getPoses(FighterState.WALK);

  it('has 6 frames', () => {
    expect(walk.length).toBe(6);
  });

  it('shows leg alternation (frame 0 legFront differs from frame 2 legFront)', () => {
    // Frame 0 has left foot forward (positive legFront.ox),
    // frame 2 has right foot forward (different leg position)
    const legFront0 = walk[0].legFront;
    const legFront2 = walk[2].legFront;
    // At minimum, the ox or rot should differ
    const differs =
      legFront0.ox !== legFront2.ox || legFront0.rot !== legFront2.rot;
    expect(differs).toBe(true);
  });

  it('shows body bob (body.oy varies between frames)', () => {
    const oys = walk.map((p) => p.body.oy);
    const uniqueOys = new Set(oys);
    // Walk cycle should have at least 2 distinct body.oy values
    expect(uniqueOys.size, 'Body bob should produce at least 2 distinct oy values').toBeGreaterThanOrEqual(2);
  });

  it('arms counter-swing with legs', () => {
    // Frame 0: front arm moves forward, back arm stays back
    // Frame 2: arms swap (opposite swing)
    const armFrontOx0 = walk[0].armFront.ox;
    const armFrontOx2 = walk[2].armFront.ox;
    // The arm positions should not be identical between opposite walk phases
    expect(armFrontOx0).not.toBe(armFrontOx2);
  });

  it('all frames have valid bone values', () => {
    for (let i = 0; i < walk.length; i++) {
      expect(
        allBonesValid(walk[i]),
        `Frame ${i} has invalid bone values`,
      ).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────
// RUN tests
// ─────────────────────────────────────────────────────
describe('Ryo RUN animation', () => {
  const run = getPoses(FighterState.RUN);

  it('has 4 frames', () => {
    expect(run.length).toBe(4);
  });

  it('shows forward lean (body.rot is negative on stride frames)', () => {
    // Running should lean forward — body.rot < 0
    for (let i = 0; i < run.length; i++) {
      expect(
        run[i].body.rot,
        `Frame ${i}: body.rot (${run[i].body.rot}) should be negative for forward lean`,
      ).toBeLessThan(0);
    }
  });

  it('shows alternating arm/leg positions between stride frames', () => {
    // Frame 0 and frame 2 are opposite strides — arms and legs should swap
    const f0 = run[0];
    const f2 = run[2];
    // armFront.ox of frame 0 should differ from frame 2 (swapped)
    expect(f0.armFront.ox).not.toBe(f2.armFront.ox);
    // legFront.ox should differ (opposite stride)
    expect(f0.legFront.ox).not.toBe(f2.legFront.ox);
  });

  it('shows body bob (body.oy varies between stride and transition frames)', () => {
    // Stride frames (0, 2) should have different body.oy than transition frames (1, 3)
    const strideOy = run[0].body.oy;
    const transitionOy = run[1].body.oy;
    expect(strideOy).not.toBe(transitionOy);
  });

  it('all frames have valid bone values', () => {
    for (let i = 0; i < run.length; i++) {
      expect(
        allBonesValid(run[i]),
        `Frame ${i} has invalid bone values`,
      ).toBe(true);
    }
  });
});
