/**
 * Shermie Content Package — Attack Definitions
 *
 * Re-exports Shermie-specific frame data from the canonical source.
 * Includes all Shermie normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Shermie-specific attack type keys */
export const SHERMIE_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'SHERMIE_STAND',       // ->+A (overhead upper)
  'SHERMIE_CLASH',       // ->+B (low)
  // Specials
  'SHERMIE_SHOOT',       // qcf+A (weak spinning kick)
  'SHERMIE_SHOOT_C',     // qcf+C (strong spinning kick, KD)
  'SHERMIE_CARNIVAL',    // qcb+A/C (multi-hit spinning attack)
  'SHERMIE_SPIRAL',      // hcb,f+A (near, command grab)
  'SHERMIE_SPIRAL_C',    // hcb,f+C (near, strong command grab)
  'SHERMIE_WHIP',        // qcf+B (whip kick)
  'SHERMIE_WHIP_C',      // qcf+D (strong whip kick, KD)
  'SHERMIE_SUPLEX',      // hcb+B/D (near, command grab)
  'SHERMIE_AXLE_SPIN',   // qcb+B/D (low sweep spin)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_SHERMIE_CARNIVAL',     // Shermie Carnival DM
  'SDM_SHERMIE_CARNIVAL',    // Shermie Carnival SDM
  'DM_SHERMIE_FLASH',        // Shermie Flash DM (command grab)
  'SDM_SHERMIE_FLASH',       // Shermie Flash SDM (command grab)
];

/** Shermie's frame data, keyed by AttackType string */
export function getShermieFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of SHERMIE_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Shermie attack */
export function getShermieAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
