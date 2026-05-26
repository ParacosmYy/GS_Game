import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { AttackType, FighterState } from '../src/core/types.js';
import type { Pose } from '../src/characters/types.js';

/** Helper: get the pose array for an attack type key, following string aliases */
function getAttackPose(key: string): Pose[] | undefined {
  const raw = RyoDef.poses[key];
  if (!raw) return undefined;
  // String alias — follow the reference (one level)
  if (typeof raw === 'string') {
    const resolved = RyoDef.poses[raw];
    if (Array.isArray(resolved)) return resolved;
    return undefined;
  }
  if (Array.isArray(raw)) return raw;
  return undefined;
}

/** Helper: total frame count from FRAME_DATA */
function totalFrames(attackType: string): number {
  const fd = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
  if (!fd) return 0;
  return fd.startup + fd.active + fd.recovery;
}

describe('Ryo special move poses', () => {
  // ── Pose array existence ──

  it('RYO_KOOU has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_KOOU);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('RYO_KO_HOU has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_KO_HOU);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('RYO_HIEN has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_HIEN);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('RYO_HAOU has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_HAOU);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('DM_TEN_HA_OU has a pose array', () => {
    const poses = getAttackPose(AttackType.DM_TEN_HA_OU);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('RYO_TSURIZAO has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_TSURIZAO);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  it('RYO_ORISHI has a pose array', () => {
    const poses = getAttackPose(AttackType.RYO_ORISHI);
    expect(poses).toBeDefined();
    expect(Array.isArray(poses)).toBe(true);
    expect(poses!.length).toBeGreaterThan(0);
  });

  // ── Strong variants alias to weak versions ──

  it('RYO_KOOU_C is defined as a string alias', () => {
    const weak = getAttackPose(AttackType.RYO_KOOU);
    expect(weak).toBeDefined();
    const rawC = RyoDef.poses[AttackType.RYO_KOOU_C];
    expect(rawC).toBeDefined();
    // The raw entry for KOOU_C is a string alias
    expect(typeof rawC).toBe('string');
    // Resolving through the alias should give the same poses
    const strong = getAttackPose(AttackType.RYO_KOOU_C);
    expect(strong).toBeDefined();
    expect(strong!.length).toBe(weak!.length);
  });

  it('RYO_KO_HOU_C is defined as a string alias', () => {
    const weak = getAttackPose(AttackType.RYO_KO_HOU);
    expect(weak).toBeDefined();
    const rawC = RyoDef.poses[AttackType.RYO_KO_HOU_C];
    expect(rawC).toBeDefined();
    expect(typeof rawC).toBe('string');
    const strong = getAttackPose(AttackType.RYO_KO_HOU_C);
    expect(strong).toBeDefined();
    expect(strong!.length).toBe(weak!.length);
  });

  // ── Pose array covers startup phase ──
  // The renderer uses Math.min(f.attackFrame, frames.length - 1) so poses just
  // need enough key frames to represent the animation; they don't need 1:1 with FRAME_DATA.

  it('RYO_KOOU has frames covering the startup phase', () => {
    const fd = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    const poses = getAttackPose(AttackType.RYO_KOOU)!;
    // Must have at least enough frames for startup visual
    expect(poses.length).toBeGreaterThanOrEqual(fd.startup);
  });

  it('RYO_KO_HOU has frames covering the startup phase', () => {
    const fd = FRAME_DATA[AttackType.RYO_KO_HOU as keyof typeof FRAME_DATA];
    const poses = getAttackPose(AttackType.RYO_KO_HOU)!;
    expect(poses.length).toBeGreaterThanOrEqual(fd.startup);
  });

  it('RYO_HIEN has frames covering the startup phase', () => {
    const fd = FRAME_DATA[AttackType.RYO_HIEN as keyof typeof FRAME_DATA];
    const poses = getAttackPose(AttackType.RYO_HIEN)!;
    expect(poses.length).toBeGreaterThanOrEqual(fd.startup);
  });

  // ── DM has the highest damage of all Ryo specials ──

  it('DM_TEN_HA_OU has the highest damage of all Ryo specials', () => {
    const dmFd = FRAME_DATA[AttackType.DM_TEN_HA_OU as keyof typeof FRAME_DATA];
    const koouFd = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    const koHouFd = FRAME_DATA[AttackType.RYO_KO_HOU as keyof typeof FRAME_DATA];
    const hienFd = FRAME_DATA[AttackType.RYO_HIEN as keyof typeof FRAME_DATA];
    const haouFd = FRAME_DATA[AttackType.RYO_HAOU as keyof typeof FRAME_DATA];
    expect(dmFd.damage).toBeGreaterThan(koouFd.damage);
    expect(dmFd.damage).toBeGreaterThan(koHouFd.damage);
    expect(dmFd.damage).toBeGreaterThan(hienFd.damage);
    expect(dmFd.damage).toBeGreaterThan(haouFd.damage);
  });

  it('DM_TEN_HA_OU has the longest startup of all Ryo specials', () => {
    const dmFd = FRAME_DATA[AttackType.DM_TEN_HA_OU as keyof typeof FRAME_DATA];
    const koouFd = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    const koHouFd = FRAME_DATA[AttackType.RYO_KO_HOU as keyof typeof FRAME_DATA];
    const hienFd = FRAME_DATA[AttackType.RYO_HIEN as keyof typeof FRAME_DATA];
    const haouFd = FRAME_DATA[AttackType.RYO_HAOU as keyof typeof FRAME_DATA];
    expect(dmFd.startup).toBeGreaterThan(koouFd.startup);
    expect(dmFd.startup).toBeGreaterThan(koHouFd.startup);
    expect(dmFd.startup).toBeGreaterThan(hienFd.startup);
    expect(dmFd.startup).toBeGreaterThan(haouFd.startup);
  });

  // ── Startup frames show preparation pose ──

  it('RYO_KOOU startup frames show arms chambering (armFront pulls back)', () => {
    const poses = getAttackPose(AttackType.RYO_KOOU)!;
    const fd = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    // During startup, the front arm should be pulled back (lower ox, more negative rot)
    const startupFirst = poses[0].armFront;
    const activeFirst = poses[Math.min(fd.startup, poses.length - 1)].armFront;
    // Startup arm should be closer to body than active arm (lower ox value)
    expect(startupFirst.ox).toBeLessThan(activeFirst.ox);
  });

  it('RYO_KO_HOU startup frames show crouching (body oy increases)', () => {
    const poses = getAttackPose(AttackType.RYO_KO_HOU)!;
    const fd = FRAME_DATA[AttackType.RYO_KO_HOU as keyof typeof FRAME_DATA];
    const startupLast = poses[Math.min(fd.startup - 1, poses.length - 1)];
    // The last startup frame should have a high body oy (crouched down)
    expect(startupLast.body.oy).toBeGreaterThan(0);
  });

  it('RYO_KO_HOU active frames show rising (body oy goes negative)', () => {
    const poses = getAttackPose(AttackType.RYO_KO_HOU)!;
    const fd = FRAME_DATA[AttackType.RYO_KO_HOU as keyof typeof FRAME_DATA];
    const firstActive = poses[Math.min(fd.startup, poses.length - 1)];
    // Active frames (rising uppercut) should have negative body oy (airborne)
    expect(firstActive.body.oy).toBeLessThan(0);
  });

  it('RYO_HIEN active frames show extended front arm and leg for kick', () => {
    const poses = getAttackPose(AttackType.RYO_HIEN)!;
    // The active pose (frame at startup offset) should show a kick pose
    // Look for the frame with the largest legFront.ox (extended kick)
    let maxLegOx = 0;
    for (const p of poses) {
      if (p.legFront.ox > maxLegOx) maxLegOx = p.legFront.ox;
    }
    // Flying kick should have at least one frame with front leg extended forward
    expect(maxLegOx).toBeGreaterThan(15);
  });

  // ── All poses are valid Pose objects with required bone properties ──

  it('all special move poses have valid bone properties', () => {
    const attackKeys = [
      AttackType.RYO_KOOU, AttackType.RYO_KO_HOU, AttackType.RYO_HIEN,
      AttackType.RYO_HAOU, AttackType.DM_TEN_HA_OU, AttackType.RYO_TSURIZAO,
      AttackType.RYO_ORISHI,
    ];
    const boneNames = ['head', 'body', 'armFront', 'armBack', 'legFront', 'legBack'] as const;
    for (const key of attackKeys) {
      const poses = getAttackPose(key)!;
      for (let i = 0; i < poses.length; i++) {
        for (const bn of boneNames) {
          const b = poses[i][bn];
          expect(b, `${key} frame ${i} bone ${bn}`).toBeDefined();
          expect(typeof b.ox, `${key} frame ${i} ${bn}.ox`).toBe('number');
          expect(typeof b.oy, `${key} frame ${i} ${bn}.oy`).toBe('number');
          expect(typeof b.rot, `${key} frame ${i} ${bn}.rot`).toBe('number');
          expect(typeof b.scale, `${key} frame ${i} ${bn}.scale`).toBe('number');
          expect(b.scale, `${key} frame ${i} ${bn}.scale > 0`).toBeGreaterThan(0);
        }
      }
    }
  });

  // ── Attack-specific poses don't break state-based poses ──

  it('state-based poses (IDLE, WALK, etc.) still exist after adding attack poses', () => {
    expect(RyoDef.poses[FighterState.IDLE]).toBeDefined();
    expect(RyoDef.poses[FighterState.WALK]).toBeDefined();
    expect(RyoDef.poses[FighterState.STAND_ATTACK]).toBeDefined();
    expect(RyoDef.poses[FighterState.CROUCH_ATTACK]).toBeDefined();
    expect(RyoDef.poses[FighterState.HITSTUN]).toBeDefined();
    expect(RyoDef.poses[FighterState.KNOCKDOWN]).toBeDefined();
  });
});
