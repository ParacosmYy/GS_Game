/**
 * Ryo Frame Alignment Tests
 *
 * Validates that Ryo's visual pose arrays are long enough to cover all FRAME_DATA
 * phase durations. The renderer indexes pose arrays by attackFrame within each phase
 * (startup/active/recovery), resetting attackFrame to 0 at each phase transition.
 * Therefore the pose array must have at least max(startup, active, recovery) entries
 * to avoid visual clamping (where the renderer falls back to the last pose).
 *
 * These tests are strict: they enforce that pose array length >= the maximum
 * single-phase frame count across all attacks sharing that FighterState.
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { FighterState, AttackType } from '../src/core/types.js';

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
};

function getFrameData(key: string): FrameDataEntry {
  const data = FRAME_DATA[key as keyof typeof FRAME_DATA];
  if (!data) throw new Error(`Missing FRAME_DATA entry: ${key}`);
  return data as unknown as FrameDataEntry;
}

/**
 * All attack types that map to STAND_ATTACK state for Ryo.
 * See Fighter.startAttack() for the state mapping logic:
 *   - STAND_*, CLOSE_*, CMD_*, RYO_*, SPECIAL_*, DM_*, STAND_CD → STAND_ATTACK
 *   - CROUCH_* → CROUCH_ATTACK
 *   - JUMP_* → AIR_ATTACK
 *   - THROW* → THROW
 */
const RYO_STAND_ATTACK_TYPES = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'STAND_CD',
  'RYO_KOOU', 'RYO_KOOU_C',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
] as const;

const RYO_CROUCH_ATTACK_TYPES = [
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
] as const;

const RYO_AIR_ATTACK_TYPES = [
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'JUMP_CD',
] as const;

/**
 * Compute the maximum single-phase frame count across a set of attack types.
 * The pose array must be at least this long to avoid clamping in any phase.
 */
function maxPhaseFrame(attackTypes: readonly string[]): { startup: number; active: number; recovery: number; max: number } {
  let maxStartup = 0;
  let maxActive = 0;
  let maxRecovery = 0;
  for (const key of attackTypes) {
    const fd = getFrameData(key);
    if (fd.startup > maxStartup) maxStartup = fd.startup;
    if (fd.active > maxActive) maxActive = fd.active;
    if (fd.recovery > maxRecovery) maxRecovery = fd.recovery;
  }
  return { startup: maxStartup, active: maxActive, recovery: maxRecovery, max: Math.max(maxStartup, maxActive, maxRecovery) };
}

function getPoseCount(state: FighterState): number {
  const poses = RyoDef.poses[state];
  if (Array.isArray(poses)) return poses.length;
  return 1; // single pose
}

// ═══════════════════════════════════════════════════════════════
// STAND_ATTACK alignment
// ═══════════════════════════════════════════════════════════════

describe('Ryo STAND_ATTACK frame alignment', () => {
  it('STAND_A pose array covers startup frames (startup=6)', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    expect(Array.isArray(poses)).toBe(true);
    const fd = getFrameData('STAND_A');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.startup);
  });

  it('STAND_A pose array covers active frames (active=3)', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('STAND_A');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.active);
  });

  it('STAND_A pose array covers recovery frames (recovery=5)', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('STAND_A');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('STAND_C pose array covers recovery frames (recovery=20)', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('STAND_C');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('STAND_ATTACK pose array covers all stand attack specials', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const poseCount = (poses as unknown[]).length;
    const maxPhase = maxPhaseFrame(RYO_STAND_ATTACK_TYPES);

    expect(
      poseCount,
      `STAND_ATTACK poses=${poseCount} must cover max single-phase frame count=${maxPhase.max} ` +
      `(max startup=${maxPhase.startup}, max active=${maxPhase.active}, max recovery=${maxPhase.recovery})`,
    ).toBeGreaterThanOrEqual(maxPhase.max);
  });
});

// ═══════════════════════════════════════════════════════════════
// Special move frame alignment
// ═══════════════════════════════════════════════════════════════

describe('Ryo special move frame alignment', () => {
  it('RYO_KOOU (weak projectile) pose array covers recovery=34', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('RYO_KOOU');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('RYO_KOOU_C (strong projectile) pose array covers active=20 and recovery=32', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('RYO_KOOU_C');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.active);
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('RYO_KO_HOU (weak upper) pose array covers recovery=25', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('RYO_KO_HOU');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('RYO_HIEN (overhead kick) pose array covers all phases', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('RYO_HIEN');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.startup);
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.active);
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });

  it('DM_TEN_HA_OU (DM) pose array covers startup=18 and recovery=35', () => {
    const poses = RyoDef.poses[FighterState.STAND_ATTACK];
    const fd = getFrameData('DM_TEN_HA_OU');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.startup);
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });
});

// ═══════════════════════════════════════════════════════════════
// CROUCH_ATTACK alignment
// ═══════════════════════════════════════════════════════════════

describe('Ryo CROUCH_ATTACK frame alignment', () => {
  it('CROUCH_ATTACK pose array covers all crouch attack phases', () => {
    const poses = RyoDef.poses[FighterState.CROUCH_ATTACK];
    const poseCount = (poses as unknown[]).length;
    const maxPhase = maxPhaseFrame(RYO_CROUCH_ATTACK_TYPES);

    expect(
      poseCount,
      `CROUCH_ATTACK poses=${poseCount} must cover max single-phase frame count=${maxPhase.max}`,
    ).toBeGreaterThanOrEqual(maxPhase.max);
  });

  it('CROUCH_D (sweep) pose array covers recovery=31', () => {
    const poses = RyoDef.poses[FighterState.CROUCH_ATTACK];
    const fd = getFrameData('CROUCH_D');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.recovery);
  });
});

// ═══════════════════════════════════════════════════════════════
// AIR_ATTACK alignment
// ═══════════════════════════════════════════════════════════════

describe('Ryo AIR_ATTACK frame alignment', () => {
  it('AIR_ATTACK pose array covers all air attack phases', () => {
    const poses = RyoDef.poses[FighterState.AIR_ATTACK];
    const poseCount = (poses as unknown[]).length;
    const maxPhase = maxPhaseFrame(RYO_AIR_ATTACK_TYPES);

    expect(
      poseCount,
      `AIR_ATTACK poses=${poseCount} must cover max single-phase frame count=${maxPhase.max}`,
    ).toBeGreaterThanOrEqual(maxPhase.max);
  });

  it('JUMP_A pose array covers active=9', () => {
    const poses = RyoDef.poses[FighterState.AIR_ATTACK];
    const fd = getFrameData('JUMP_A');
    expect((poses as unknown[]).length).toBeGreaterThanOrEqual(fd.active);
  });
});
