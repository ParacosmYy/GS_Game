/**
 * Heidern Content Package — Attack Definitions
 *
 * Re-exports Heidern-specific frame data from the canonical source.
 * Includes all Heidern normals, command normals, specials, DMs, and SDMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Heidern-specific attack type keys */
export const HEIDERN_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'HEIDERN_SLIDING',            // ↘+B (low sliding attack)
  'HEIDERN_COMMAND_A',          // →+A (overhead/command normal)
  // Specials
  'HEIDERN_CROSS_CUTTER',       // charge b,f+A (weak projectile)
  'HEIDERN_CROSS_CUTTER_C',     // charge b,f+C (strong projectile)
  'HEIDERN_MOON_SLASHER',       // charge d,u+A (weak anti-air slash)
  'HEIDERN_MOON_SLASHER_C',     // charge d,u+C (strong anti-air slash)
  'HEIDERN_NECK_ROLLER',        // qcb+A (weak neck grab)
  'HEIDERN_NECK_ROLLER_C',      // qcb+C (strong neck grab)
  'HEIDERN_STORMBRINGER',       // hcf+A (weak command grab)
  'HEIDERN_STORMBRINGER_C',     // hcf+C (strong command grab)
  'HEIDERN_KILLING_BRINGER',    // hcf+B (counter grab)
  'HEIDERN_KILLING_BRINGER_D',  // hcf+D (strong counter grab)
  'HEIDERN_LEIDEN_REITTER',     // qcb+B (spinning kick)
  'HEIDERN_LEIDEN_REITTER_D',   // qcb+D (strong spinning kick)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_HEIDERN_CRITICAL_DRIVER',     // Critical Driver DM (command grab)
  'DM_HEIDERN_END',                 // Heidern End DM (rush slash)
  'SDM_HEIDERN_CRITICAL_DRIVER',    // Critical Driver SDM
  'SDM_HEIDERN_END',                // Heidern End SDM
  'HSDM_HEIDERN_EXECUTION',         // Heidern Execution HSDM
];

/** Heidern's frame data, keyed by AttackType string */
export function getHeidernFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of HEIDERN_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Heidern attack */
export function getHeidernAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
