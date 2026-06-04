/**
 * Mai Content Package — Attack Definitions
 *
 * Re-exports Mai-specific frame data from the canonical source.
 * Includes all Mai normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Mai-specific attack type keys */
export const MAI_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'MAI_HISSATSU_SHINOBIBACHI',  // ->+B (overhead)
  'MAI_YUSURA_UMA',             // ↘+B (low)
  // Specials
  'MAI_KA_CHO_SEN',             // qcf+A (weak fan projectile)
  'MAI_KA_CHO_SEN_C',           // qcf+C (strong fan projectile)
  'MAI_RYU_EN_BU',              // qcb+K (flame kick)
  'MAI_HISHO_RYU_EN_JIN',       // dp+K (fan lift upper)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_HAKA_OTOSHI',             // Housenka (QCFx2+K) DM
  'SDM_HAKA_OTOSHI',            // Housenka SDM
];

/** Mai's frame data, keyed by AttackType string */
export function getMaiFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of MAI_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Mai attack */
export function getMaiAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
