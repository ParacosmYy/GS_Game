/**
 * K' Content Package — Attack Definitions
 *
 * Re-exports K'-specific frame data from the canonical source.
 * Includes all K' normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All K'-specific attack type keys */
export const KDASH_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'KDASH_ONE_INCH',      // ->+A (overhead punch)
  'KDASH_TRIGGER',       // ->+D (low kick)
  // Specials
  'KDASH_EINS',          // qcf+A (weak projectile)
  'KDASH_EINS_C',        // qcf+C (strong projectile)
  'KDASH_CROW',          // dp+A (weak upper)
  'KDASH_CROW_C',        // dp+C (strong upper, invincible)
  'KDASH_MINUTE',        // qcb+K (overhead kick)
  'KDASH_NARROW',        // qcf+K (low)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_CHAIN_SHOT',       // Chain Shot DM (qcf x2 + P)
  'SDM_CHAIN_SHOT',      // Chain Shot SDM (MAX qcf x2 + AC)
];

/** K' frame data, keyed by AttackType string */
export function getKdashFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of KDASH_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single K' attack */
export function getKdashAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
