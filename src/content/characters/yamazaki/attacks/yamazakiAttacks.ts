/**
 * Yamazaki Content Package — Attack Definitions
 *
 * Re-exports Yamazaki-specific frame data from the canonical source.
 * Includes all Yamazaki normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Yamazaki-specific attack type keys */
export const YAMAZAKI_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'YAMAZAKI_SASHI',       // ->+A (overhead)
  'YAMAZAKI_BOKKAI',      // ->+B (low)
  // Specials
  'YAMAZAKI_SNAKE_ARM',     // qcf+A (snake arm weak)
  'YAMAZAKI_SNAKE_ARM_C',   // qcf+C (snake arm strong)
  'YAMAZAKI_SANDSTORM',     // qcb+P (sandstorm / hebi tsukai)
  'YAMAZAKI_BAI_GA_SE',     // hcf+K (bai gaeshi low sweep)
  'YAMAZAKI_SNAKE_ARM_QCF', // qcf follow-up variant
  'YAMAZAKI_DRILL',         // drill (HSDM-level special)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_GUILLOTINE',          // Guillotine DM
  'SDM_GUILLOTINE',         // Guillotine SDM
  'HSDM_DRILL',             // Drill HSDM
];

/** Yamazaki's frame data, keyed by AttackType string */
export function getYamazakiFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of YAMAZAKI_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Yamazaki attack */
export function getYamazakiAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
