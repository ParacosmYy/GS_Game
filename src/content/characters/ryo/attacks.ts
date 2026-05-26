/**
 * Ryo Content Package — Attack Definitions
 *
 * Re-exports Ryo-specific frame data from the canonical source.
 * Includes all Ryo normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../core/frameDataConstants.js';
import type { AttackType } from '../../../core/types.js';

/** All Ryo-specific attack type keys */
export const RYO_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'RYO_TSURIZAO',   // ->+A (overhead)
  'RYO_ORISHI',     // \_/+B (low)
  // Specials
  'RYO_KOOU',       // qcf+A (Ko'ou Ken, projectile)
  'RYO_KOOU_C',     // qcf+C (strong projectile)
  'RYO_KO_HOU',     // dp+A (Kohou, upper)
  'RYO_KO_HOU_C',   // dp+C (strong upper)
  'RYO_HIEN',       // qcb+K (Hien Shippu Kyaku, flying kick)
  'RYO_HAOU',       // hcb+P (Haou Shoukou Ken, counter)
  'RYO_KOOUKEN_D',  // qcf+D (heavy projectile)
  'RYO_HIO_HACKER', // f+A (dash strike)
  'RYO_ZANRETSU_KEN', // qcb+P (multi-punch)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_TEN_HA_OU',      // Haoh Shoukou Ken DM
  'DM_RYUKO_RANBU',    // Ryuko Ranbu DM
  'SDM_TEN_HA_OU',     // SDM version
  'SDM_RYUKO_RANBU',   // SDM version
  'HSDM_RYUKO_RANBU',  // HSDM version
];

/** Ryo's frame data, keyed by AttackType string */
export function getRyoFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of RYO_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Ryo attack */
export function getRyoAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
