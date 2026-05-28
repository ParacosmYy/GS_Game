/**
 * Athena Content Package — Attack Definitions
 *
 * Re-exports Athena-specific frame data from the canonical source.
 * Includes all Athena normals, command normals, specials, DMs, and SDMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Athena-specific attack type keys */
export const ATHENA_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'ATHENA_PHOENIX_REFLECT',   // →+B Psycho Reflect (overhead)
  'ATHENA_LOW_B',             // ↘+B (low)
  'ATHENA_AIR_B',             // 空中↓+B (air crossup)
  // Specials
  'ATHENA_PSYCHO_BALL',       // qcb+A (weak projectile)
  'ATHENA_PSYCHO_BALL_C',     // qcb+C (strong projectile)
  'ATHENA_PSYCHO_SWORD',      // dp+A (weak upper)
  'ATHENA_PSYCHO_SWORD_C',    // dp+C (strong upper)
  'ATHENA_PHOENIX_ARROW',     // air qcf+K (air dive)
  'ATHENA_PSYCHO_TELEPORT',   // qcb+B (teleport)
  'ATHENA_PSYCHO_TELEPORT_C', // qcb+D (long-range teleport)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_SHINING_CRYSTAL_BIT',      // Shining Crystal Bit DM
  'DM_PHOENIX_FANG_ARROW',       // Phoenix Fang Arrow DM (air)
  'SDM_SHINING_CRYSTAL_BIT',     // Shining Crystal Bit SDM
  'SDM_PHOENIX_FANG_ARROW',      // Phoenix Fang Arrow SDM (air)
];

/** Athena's frame data, keyed by AttackType string */
export function getAthenaFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of ATHENA_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Athena attack */
export function getAthenaAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
