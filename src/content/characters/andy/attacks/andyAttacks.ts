/**
 * Andy Content Package — Attack Definitions
 *
 * Re-exports Andy-specific frame data from the canonical source.
 * Includes all Andy normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Andy-specific attack type keys */
export const ANDY_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'ANDY_UWA_AGITO',          // ->+A (overhead)
  'ANDY_GEDAN_AGITO',        // ->+B (low)
  // Specials
  'ANDY_HISHOU_KEN',         // qcf+A (weak projectile)
  'ANDY_HISHOU_KEN_C',       // qcf+C (strong projectile)
  'ANDY_SHOURYUU_DAN',       // dp+A (weak uppercut)
  'ANDY_SHOURYUU_DAN_C',     // dp+C (strong uppercut, 2-hit)
  'ANDY_ZANEI_RYUSEI_KEN',   // hcf+B (short dash punch)
  'ANDY_ZANEI_RYUSEI_KEN_D', // hcf+D (long dash punch)
  'ANDY_GEKI_HISHOU_KEN',    // qcb+K (air dive)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM
  'DM_CHO_REPPA_DAN',        // Cho Reppa Dan DM
];

/** Andy's frame data, keyed by AttackType string */
export function getAndyFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of ANDY_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Andy attack */
export function getAndyAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
