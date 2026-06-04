/**
 * Yashiro Content Package — Attack Definitions
 *
 * Re-exports Yashiro-specific frame data from the canonical source.
 * Includes all Yashiro normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Yashiro-specific attack type keys */
export const YASHIRO_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'YASHIRO_SHUU_WANI',     // ->+A (upper strike)
  'YASHIRO_JUU_ZUTSU',     // ->+B (overhead)
  // Specials
  'YASHIRO_UPPER_DU',      // qcf+A (hook punch, fast)
  'YASHIRO_UPPER_DU_C',    // qcf+C (hook punch, multi-hit)
  'YASHIRO_NIRAAI',        // qcb+A/C (palm strike)
  'YASHIRO_NIRAAI_C',      // qcb+C (strong palm strike)
  'YASHIRO_MUSATSU',       // qcf+B (dash attack)
  'YASHIRO_MUSATSU_D',     // qcf+D (strong dash attack, KD)
  'YASHIRO_SLEDGEHAMMER',  // dp+A (anti-air)
  'YASHIRO_SLEDGEHAMMER_C', // dp+C (strong anti-air)
  'YASHIRO_MISSED',        // hcf+K (fake)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_MILLION_BASH_STREAM',      // Million Bash Stream DM
  'SDM_MILLION_BASH_STREAM',     // Million Bash Stream SDM
  'DM_ORE_MAJI_MAMIRE',          // Ore Maji Mamire DM (command throw)
  'SDM_ORE_MAJI_MAMIRE',         // Ore Maji Mamire SDM (command throw)
];

/** Yashiro's frame data, keyed by AttackType string */
export function getYashiroFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of YASHIRO_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Yashiro attack */
export function getYashiroAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
