/**
 * Vice Content Package — Attack Definitions
 *
 * Re-exports Vice-specific frame data from the canonical source.
 * Includes all Vice normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Vice-specific attack type keys */
export const VICE_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'VICE_MONSTROSITY',    // ->+A (upper attack)
  'VICE_OVERKILL',       // ->+B (low attack)
  // Specials
  'VICE_OUTRAGE',        // qcf+A (weak rush punch)
  'VICE_OUTRAGE_C',      // qcf+C (strong rush punch)
  'VICE_BLACK_END',      // qcb+P (grab slam)
  'VICE_MAYHEM',         // hcf+K (low rush)
  'VICE_GORE_FEST',      // hcb,f+P (command grab)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM
  'DM_WITHERING_SURFACE',    // Withering Surface DM
  'DM_NEGATIVE_GAIN',        // Negative Gain DM
  // SDM
  'SDM_WITHERING_SURFACE',   // Withering Surface SDM
  'SDM_NEGATIVE_GAIN',       // Negative Gain SDM
];

/** Vice's frame data, keyed by AttackType string */
export function getViceFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of VICE_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Vice attack */
export function getViceAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
