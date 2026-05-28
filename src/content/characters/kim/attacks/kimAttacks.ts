/**
 * Kim Content Package — Attack Definitions
 *
 * Re-exports Kim-specific frame data from the canonical source.
 * Includes all Kim normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Kim-specific attack type keys */
export const KIM_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'KIM_HISHOU_KICK',    // ->+B (overhead kick)
  'KIM_HANSEN',         // df+D (half spin kick, 2-hit)
  'KIM_HISHOU',         // air qcf+K (air dive kick)
  // Specials
  'KIM_HIENZAN',        // charge d,u+B (flash kick)
  'KIM_HIENZAN_D',      // charge d,u+D (strong flash kick)
  'KIM_HANGETSU',       // qcb+B (half-moon kick)
  'KIM_HANGETSU_D',     // qcb+D (strong half-moon kick)
  'KIM_HAKI',           // dd+B/D (overpower kick)
  'KIM_SANREN',         // qcb+P (triple strike 1st)
  'KIM_SANREN_2',       // qcb+P (triple strike follow-up)
  // Additional specials
  'KIM_KUZUSHI_GERI',   // overhead kick
  'KIM_NERICHAGI',      // low slide kick
  'KIM_KAITEN_HIEN_ZAN',// anti-air flash kick
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_PHOENIX_KICK',      // Houou Kyaku DM
  'DM_PHOENIX_HITEN',     // Houou Tendou Kyaku DM
  'SDM_PHOENIX_HITEN',    // SDM version
  'SDM_PHOENIX_HITEN_EX', // SDM EX version
  'HSDM_PHOENIX_HITEN',   // HSDM version (MAX + red health)
];

/** Kim's frame data, keyed by AttackType string */
export function getKimFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of KIM_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Kim attack */
export function getKimAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
