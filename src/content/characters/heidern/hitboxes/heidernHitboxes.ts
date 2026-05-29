/**
 * Heidern Content Package — Hitbox / Hurtbox Data
 *
 * Provides Heidern-specific hitbox data from two sources:
 * 1. MUGEN Clsn data (real AIR collision data, preferred)
 * 2. Legacy hardcoded HITBOX_OFFSETS / ATTACK_FRAMES (fallback)
 *
 * MUGEN action mapping derived from Heidern.air:
 *   200 = close A, 210 = close C, 215 = far A, 230 = close B, 235 = far B
 *   240 = close D, 241 = far D, 245 = far C, 250 = crouch A
 *   300 = throw, 400 = crouch A, 410 = crouch C, 430 = crouch B, 440 = crouch D
 *   600 = jump A, 605 = jump A alt, 610 = jump C, 630 = jump B
 *   635 = jump B alt, 640 = jump D, 645/650 = jump D alt
 *   1005 = Cross Cutter, 1100/1101 = Moon Slasher A, 1110/1111 = Moon Slasher C
 *   1202 = Neck Roller, 1300 = Stormbringer, 1400/1401 = Leiden Reitter B
 *   1410/1411 = Leiden Reitter D, 1420 = Killing Bringer
 *   3002 = Critical Driver DM, 3100/3101 = Heidern End DM A
 *   3110/3111 = Heidern End DM C, 3150/3151 = Critical Driver SDM
 *   725 = Sliding, 800/850 = CD attacks
 *   4031/4034 = throw animations, 4100 = command grab sequence
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import {
  getMugenAttackTiming,
  getMugenActionSummary,
  getCharacterMugenActions,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'heidern';

export const HEIDERN_HITBOX_KEYS: string[] = [
  'HEIDERN_SLIDING', 'HEIDERN_COMMAND_A',
  'HEIDERN_CROSS_CUTTER', 'HEIDERN_CROSS_CUTTER_C',
  'HEIDERN_MOON_SLASHER', 'HEIDERN_MOON_SLASHER_C',
  'HEIDERN_NECK_ROLLER', 'HEIDERN_NECK_ROLLER_C',
  'HEIDERN_STORMBRINGER', 'HEIDERN_STORMBRINGER_C',
  'HEIDERN_KILLING_BRINGER', 'HEIDERN_KILLING_BRINGER_D',
  'HEIDERN_LEIDEN_REITTER', 'HEIDERN_LEIDEN_REITTER_D',
  'DM_HEIDERN_CRITICAL_DRIVER', 'DM_HEIDERN_END',
  'SDM_HEIDERN_CRITICAL_DRIVER', 'SDM_HEIDERN_END',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getHeidernHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of HEIDERN_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const HEIDERN_ATTACK_FRAME_KEYS: string[] = [
  'HEIDERN_SLIDING', 'HEIDERN_COMMAND_A',
  'HEIDERN_CROSS_CUTTER', 'HEIDERN_CROSS_CUTTER_C',
  'HEIDERN_MOON_SLASHER', 'HEIDERN_MOON_SLASHER_C',
  'HEIDERN_NECK_ROLLER', 'HEIDERN_NECK_ROLLER_C',
  'HEIDERN_STORMBRINGER', 'HEIDERN_STORMBRINGER_C',
  'HEIDERN_KILLING_BRINGER', 'HEIDERN_KILLING_BRINGER_D',
  'HEIDERN_LEIDEN_REITTER', 'HEIDERN_LEIDEN_REITTER_D',
  'DM_HEIDERN_CRITICAL_DRIVER', 'DM_HEIDERN_END',
  'SDM_HEIDERN_CRITICAL_DRIVER', 'SDM_HEIDERN_END',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getHeidernAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of HEIDERN_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** Maps Heidern attack keys to MUGEN AIR action numbers */
export const HEIDERN_MUGEN_ACTION_MAP: Record<string, string> = {
  // Normals
  CLOSE_A: '200', CLOSE_C: '210', STAND_A: '215',
  CLOSE_B: '230', STAND_B: '235',
  CLOSE_D: '240', STAND_D: '241', STAND_C: '245',
  CROUCH_A: '400', CROUCH_C: '410', CROUCH_B: '430', CROUCH_D: '440',
  JUMP_A: '600', JUMP_C: '610', JUMP_B: '630', JUMP_D: '640',
  // Command normals
  HEIDERN_SLIDING: '725',
  // Throws
  THROW: '300', THROW_FORWARD: '300',
  // Specials
  HEIDERN_CROSS_CUTTER: '1005',
  HEIDERN_MOON_SLASHER: '1100', HEIDERN_MOON_SLASHER_C: '1110',
  HEIDERN_NECK_ROLLER: '1202',
  HEIDERN_STORMBRINGER: '1300',
  HEIDERN_LEIDEN_REITTER: '1400', HEIDERN_LEIDEN_REITTER_D: '1410',
  HEIDERN_KILLING_BRINGER: '1420',
  // DMs
  DM_HEIDERN_CRITICAL_DRIVER: '3002',
  DM_HEIDERN_END: '3100',
  SDM_HEIDERN_CRITICAL_DRIVER: '3150',
  SDM_HEIDERN_END: '3110',
};

export function hasHeidernMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getHeidernMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = HEIDERN_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getHeidernMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = HEIDERN_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getHeidernMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getHeidernAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getHeidernMugenTiming(attackKey);
  if (mugenTiming) return mugenTiming;
  const legacyFrames = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[attackKey];
  if (!legacyFrames) return null;
  let startup = 0, active = 0, recovery = 0;
  for (const frame of legacyFrames) {
    if (frame.attack) active++;
    else if (active > 0) recovery++;
    else startup++;
  }
  return { startup, active, recovery, total: startup + active + recovery };
}
