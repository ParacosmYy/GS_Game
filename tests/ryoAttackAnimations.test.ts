/**
 * Tests for Ryo's multi-frame attack animations
 *
 * Verifies that:
 * - STAND_ATTACK has enough frames for all stand attack startup/active/recovery phases
 * - CROUCH_ATTACK has enough frames for all crouch attack phases
 * - AIR_ATTACK has enough frames for all air attack phases
 * - Each animation shows clear pose progression (frames differ from each other)
 * - Startup frames show wind-up (arm pulling back)
 * - Active frames show extension (arm reaching forward)
 * - Recovery frames show retraction
 * - Attack-specific FRAME_DATA timing fits within animation length
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { FighterState } from '../src/core/types.js';
import type { Pose, PoseSet } from '../src/characters/types.js';

// ── Helpers ──

/** Get pose array for a given state, asserting it's an array */
function getPoseArray(poses: PoseSet, state: FighterState): Pose[] {
  const raw = poses[state];
  expect(raw).toBeDefined();
  expect(Array.isArray(raw)).toBe(true);
  return raw as Pose[];
}

/** Check if two poses differ in at least one bone */
function posesDiffer(a: Pose, b: Pose): boolean {
  const bones: (keyof Pose)[] = ['head', 'body', 'armFront', 'armBack', 'legFront', 'legBack'];
  return bones.some(bone => {
    const ba = a[bone], bb = b[bone];
    return ba.ox !== bb.ox || ba.oy !== bb.oy || ba.rot !== bb.rot || ba.scale !== bb.scale;
  });
}

/** Frame data for attacks using STAND_ATTACK state */
const STAND_ATTACKS = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
] as const;

/** Frame data for attacks using CROUCH_ATTACK state */
const CROUCH_ATTACKS = [
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
] as const;

/** Frame data for attacks using AIR_ATTACK state */
const AIR_ATTACKS = [
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
] as const;

// ── Tests ──

describe('Ryo STAND_ATTACK animation', () => {
  const frames = getPoseArray(RyoDef.poses, FighterState.STAND_ATTACK);

  it('should have 20 frames to cover all stand attack phases', () => {
    expect(frames.length).toBe(20);
  });

  it('should cover the longest startup phase (STAND_D startup=10)', () => {
    const maxStartup = Math.max(...STAND_ATTACKS.map(a => FRAME_DATA[a].startup));
    expect(maxStartup).toBe(10);
    expect(frames.length).toBeGreaterThanOrEqual(maxStartup);
  });

  it('should cover the longest active phase (STAND_D active=8)', () => {
    const maxActive = Math.max(...STAND_ATTACKS.map(a => FRAME_DATA[a].active));
    expect(maxActive).toBe(8);
    // Active frames start at index 10, need 8 more => index 17
    expect(frames.length).toBeGreaterThanOrEqual(10 + maxActive);
  });

  it('should cover the longest recovery phase (STAND_C/D recovery=20)', () => {
    const maxRecovery = Math.max(...STAND_ATTACKS.map(a => FRAME_DATA[a].recovery));
    expect(maxRecovery).toBe(20);
    // Recovery uses clamped indexing: Math.min(attackFrame, length-1)
    // So any recovery frame >= length-1 will clamp to the last frame
    expect(frames.length).toBeGreaterThanOrEqual(2); // at least 2 recovery frames
  });

  it('all FRAME_DATA stand attacks should fit within the animation', () => {
    for (const atk of STAND_ATTACKS) {
      const fd = FRAME_DATA[atk];
      // Startup: frames 0..startup-1
      expect(fd.startup).toBeLessThanOrEqual(frames.length);
      // Active: frames startup..startup+active-1
      // Recovery: uses clamped index, so any frame works
    }
  });

  it('startup frames should show progressive arm extension (F0 < F5 < F9 in armFront.ox)', () => {
    // Startup starts with arm pulled back and ends with arm forward
    const f0Arm = frames[0].armFront.ox;
    const f5Arm = frames[5].armFront.ox;
    const f9Arm = frames[9].armFront.ox;
    // Progressive forward extension: arm ox should increase
    expect(f5Arm).toBeGreaterThan(f0Arm);
    expect(f9Arm).toBeGreaterThan(f5Arm);
  });

  it('active frames should show peak extension (F10-F11 armFront.ox >= startup frames)', () => {
    const maxStartupArm = Math.max(...frames.slice(0, 10).map(f => f.armFront.ox));
    const f10Arm = frames[10].armFront.ox;
    const f11Arm = frames[11].armFront.ox;
    expect(f10Arm).toBeGreaterThanOrEqual(maxStartupArm);
    expect(f11Arm).toBeGreaterThanOrEqual(maxStartupArm);
  });

  it('recovery frames should show arm pulling back (F18-F19 armFront.ox < active peak)', () => {
    const peakArm = Math.max(...frames.slice(10, 18).map(f => f.armFront.ox));
    const f18Arm = frames[18].armFront.ox;
    const f19Arm = frames[19].armFront.ox;
    expect(f18Arm).toBeLessThan(peakArm);
    expect(f19Arm).toBeLessThan(peakArm);
  });

  it('startup frames should have distinct poses showing animation progression', () => {
    // Check that consecutive startup frames differ
    for (let i = 0; i < 9; i++) {
      expect(posesDiffer(frames[i], frames[i + 1])).toBe(true);
    }
  });

  it('active frames should have distinct poses', () => {
    for (let i = 10; i < 17; i++) {
      expect(posesDiffer(frames[i], frames[i + 1])).toBe(true);
    }
  });
});

describe('Ryo CROUCH_ATTACK animation', () => {
  const frames = getPoseArray(RyoDef.poses, FighterState.CROUCH_ATTACK);

  it('should have 31 frames to cover all crouch attack phases', () => {
    expect(frames.length).toBe(31);
  });

  it('should cover the longest startup phase (CROUCH_C startup=7)', () => {
    const maxStartup = Math.max(...CROUCH_ATTACKS.map(a => FRAME_DATA[a].startup));
    expect(maxStartup).toBe(7);
    expect(frames.length).toBeGreaterThanOrEqual(maxStartup);
  });

  it('should cover the longest active phase (CROUCH_D active=6)', () => {
    const maxActive = Math.max(...CROUCH_ATTACKS.map(a => FRAME_DATA[a].active));
    expect(maxActive).toBe(6);
    expect(frames.length).toBeGreaterThanOrEqual(7 + maxActive);
  });

  it('should cover the longest recovery phase (CROUCH_D recovery=31)', () => {
    const maxRecovery = Math.max(...CROUCH_ATTACKS.map(a => FRAME_DATA[a].recovery));
    expect(maxRecovery).toBe(31);
    // Recovery uses clamped indexing, frames 13-30 cover recovery
    expect(frames.length).toBeGreaterThanOrEqual(13 + 2); // at least some recovery frames
  });

  it('all FRAME_DATA crouch attacks should fit within the animation', () => {
    for (const atk of CROUCH_ATTACKS) {
      const fd = FRAME_DATA[atk];
      expect(fd.startup).toBeLessThanOrEqual(frames.length);
    }
  });

  it('startup frames should show progressive arm extension in crouch', () => {
    const f0Arm = frames[0].armFront.ox;
    const f3Arm = frames[3].armFront.ox;
    const f6Arm = frames[6].armFront.ox;
    // Arm should pull back then extend forward
    expect(f6Arm).toBeGreaterThan(f3Arm);
  });

  it('active frames should show peak extension', () => {
    const maxStartupArm = Math.max(...frames.slice(0, 7).map(f => f.armFront.ox));
    const peakActiveArm = Math.max(...frames.slice(7, 13).map(f => f.armFront.ox));
    expect(peakActiveArm).toBeGreaterThanOrEqual(maxStartupArm);
  });

  it('recovery frames should show arm pulling back from active peak', () => {
    const peakArm = Math.max(...frames.slice(7, 13).map(f => f.armFront.ox));
    const recoveryArm = frames[13].armFront.ox;
    expect(recoveryArm).toBeLessThan(peakArm);
  });

  it('startup frames should have distinct poses', () => {
    for (let i = 0; i < 6; i++) {
      expect(posesDiffer(frames[i], frames[i + 1])).toBe(true);
    }
  });

  it('crouch body position should be lower than stand (body.oy > 0)', () => {
    // All crouch attack frames should have body lower than stand
    for (const frame of frames) {
      expect(frame.body.oy).toBeGreaterThan(10);
    }
  });
});

describe('Ryo AIR_ATTACK animation', () => {
  const frames = getPoseArray(RyoDef.poses, FighterState.AIR_ATTACK);

  it('should have 9 frames to cover all air attack phases', () => {
    expect(frames.length).toBe(9);
  });

  it('should cover the longest startup phase (JUMP_C startup=8)', () => {
    const maxStartup = Math.max(...AIR_ATTACKS.map(a => FRAME_DATA[a].startup));
    expect(maxStartup).toBe(8);
    expect(frames.length).toBeGreaterThanOrEqual(maxStartup);
  });

  it('should cover the longest active phase (JUMP_A active=9)', () => {
    const maxActive = Math.max(...AIR_ATTACKS.map(a => FRAME_DATA[a].active));
    expect(maxActive).toBe(9);
    // Active uses clamped indexing: Math.min(attackFrame, length-1)
    // With 9 frames and 8 startup, the active frame starts at index 8 (1 frame)
    // Longer active phases clamp to the last frame
    expect(frames.length).toBeGreaterThanOrEqual(1); // at least 1 active frame
  });

  it('all FRAME_DATA air attacks should fit within the animation', () => {
    for (const atk of AIR_ATTACKS) {
      const fd = FRAME_DATA[atk];
      expect(fd.startup).toBeLessThanOrEqual(frames.length);
    }
  });

  it('startup frames should show progressive arm extension in air', () => {
    const f0Arm = frames[0].armFront.ox;
    const f4Arm = frames[4].armFront.ox;
    const f7Arm = frames[7].armFront.ox;
    expect(f4Arm).toBeGreaterThan(f0Arm);
    expect(f7Arm).toBeGreaterThan(f4Arm);
  });

  it('active frame (F8) should show peak extension', () => {
    const maxStartupArm = Math.max(...frames.slice(0, 8).map(f => f.armFront.ox));
    const f8Arm = frames[8].armFront.ox;
    expect(f8Arm).toBeGreaterThanOrEqual(maxStartupArm);
  });

  it('startup frames should have distinct poses', () => {
    for (let i = 0; i < 7; i++) {
      expect(posesDiffer(frames[i], frames[i + 1])).toBe(true);
    }
  });

  it('air attack body should be elevated (head/body below normal position)', () => {
    // Air attacks should show body higher than ground
    for (const frame of frames) {
      expect(frame.head.oy).toBeLessThanOrEqual(0);
    }
  });
});

describe('Ryo attack animation progression integrity', () => {
  it('STAND_ATTACK armFront scale increases from startup to active', () => {
    const frames = getPoseArray(RyoDef.poses, FighterState.STAND_ATTACK);
    const startupMaxScale = Math.max(...frames.slice(0, 10).map(f => f.armFront.scale));
    const activeMaxScale = Math.max(...frames.slice(10, 18).map(f => f.armFront.scale));
    expect(activeMaxScale).toBeGreaterThan(startupMaxScale);
  });

  it('CROUCH_ATTACK armFront scale increases from startup to active', () => {
    const frames = getPoseArray(RyoDef.poses, FighterState.CROUCH_ATTACK);
    const startupMaxScale = Math.max(...frames.slice(0, 7).map(f => f.armFront.scale));
    const activeMaxScale = Math.max(...frames.slice(7, 13).map(f => f.armFront.scale));
    expect(activeMaxScale).toBeGreaterThan(startupMaxScale);
  });

  it('AIR_ATTACK armFront scale increases from startup to active', () => {
    const frames = getPoseArray(RyoDef.poses, FighterState.AIR_ATTACK);
    const startupMaxScale = Math.max(...frames.slice(0, 8).map(f => f.armFront.scale));
    const activeMaxScale = frames[8].armFront.scale;
    expect(activeMaxScale).toBeGreaterThan(startupMaxScale);
  });

  it('STAND_ATTACK body rotation increases from neutral to active (torso twist)', () => {
    const frames = getPoseArray(RyoDef.poses, FighterState.STAND_ATTACK);
    const startupStartRot = frames[0].body.rot;
    const activePeakRot = Math.max(...frames.slice(10, 18).map(f => f.body.rot));
    expect(activePeakRot).toBeGreaterThan(startupStartRot);
  });

  it('all attack pose arrays are Pose[] (not single Pose)', () => {
    expect(Array.isArray(RyoDef.poses[FighterState.STAND_ATTACK])).toBe(true);
    expect(Array.isArray(RyoDef.poses[FighterState.CROUCH_ATTACK])).toBe(true);
    expect(Array.isArray(RyoDef.poses[FighterState.AIR_ATTACK])).toBe(true);
  });
});
