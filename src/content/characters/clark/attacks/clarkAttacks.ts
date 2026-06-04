/**
 * Clark Content Package — Attack Definitions
 *
 * Re-exports Clark-specific frame data from the canonical source.
 * Includes all Clark normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

/** All Clark-specific attack type keys */
export const CLARK_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'CLARK_DEATH_LAKE',    // ->+A (overhead)
  'CLARK_STOMP',         // ->+B (low stomp)
  // Specials
  'CLARK_ARGENTINE',     // qcb+A (command throw, weak)
  'CLARK_ARGENTINE_C',   // qcb+C (command throw, strong)
  'CLARK_NAPALM',        // qcf+P (anti-air grab)
  'CLARK_FLASH_ELBOW',   // qcf+P (follow-up after throw)
  'CLARK_MOUNT_TACKLE',  // hcb+P (near, command throw)
  'CLARK_VULCAN',        // qcf+K (multi-hit)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_ARGENTINE_DM',       // Super Argentine Backbreaker DM
  'SDM_ARGENTINE_DM',      // Super Argentine Backbreaker SDM
  'DM_ROLLING_CRADLE',     // Rolling Cradle DM
  'SDM_ROLLING_CRADLE',    // Rolling Cradle SDM
];

/** Clark's frame data, keyed by AttackType string */
export function getClarkFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of CLARK_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Clark attack */
export function getClarkAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
