/**
 * Terry Content Package — Attack Definitions
 *
 * Re-exports Terry-specific frame data from the canonical source.
 * Includes all Terry normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Terry-specific attack type keys */
export const TERRY_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'TERRY_BACK_KNCKLE',   // ->+A (overhead)
  'TERRY_COMBO_BLOW',    // ->+B (low)
  // Specials
  'TERRY_POWER_WAVE',       // qcf+A (ground wave projectile)
  'TERRY_ROUND_WAVE',       // qcf+C (short-range ground burst)
  'TERRY_BURN_KNUCKLE',     // qcb+A (weak dash punch)
  'TERRY_BURN_KNUCKLE_C',   // qcb+C (strong dash punch)
  'TERRY_BURN_KNUCKLE_D',   // qcb+D (heavy dash punch)
  'TERRY_CRACK_SHOT',       // qcb+B (overhead kick)
  'TERRY_CRACK_SHOT_D',     // qcb+D (strong overhead kick)
  'TERRY_POWER_DUNK',       // dp+B (2-hit dunk, KD)
  'TERRY_POWER_DUNK_D',     // dp+D (strong 2-hit dunk, KD)
  'TERRY_RISING_TACKLE',    // charge d,u+A (multi-hit rising)
  'TERRY_RISING_TACKLE_C',  // charge d,u+C (strong multi-hit rising)
  'TERRY_POWER_CHARGE',     // hcf+B/D (dash attack)
  'TERRY_HAMMER_PUNCH',     // f+C (overhead KD)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_POWER_GEYSER_A',          // Power Geyser DM A version
  'DM_POWER_GEYSER_C',          // Power Geyser DM C version
  'DM_POWER_GEYSER',            // Power Geyser DM default
  'DM_HIGH_ANGLE_GEYSER_B',     // High Angle Geyser DM B version
  'DM_HIGH_ANGLE_GEYSER_D',     // High Angle Geyser DM D version
  'DM_HIGH_ANGLE_GEYSER',       // High Angle Geyser DM default
  'SDM_TRIPLE_GEYSER',          // Triple Geyser SDM
  'SDM_POWER_GEYSER_EX',        // Power Geyser EX SDM
  'SDM_HIGH_ANGLE_GEYSER',      // High Angle Geyser SDM
  'HSDM_POWER_GEYSER',          // Power Geyser HSDM
];

/** Terry's frame data, keyed by AttackType string */
export function getTerryFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of TERRY_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Terry attack */
export function getTerryAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
