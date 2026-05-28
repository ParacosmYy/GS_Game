/**
 * Benimaru Content Package — Attack Definitions
 *
 * Re-exports Benimaru-specific frame data from the canonical source.
 * Includes all Benimaru normals, command normals, specials, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Benimaru-specific attack type keys */
export const BENIMARU_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'BENIMARU_JACKKNIFE_KICK',    // ->+B (overhead kick)
  'BENIMARU_FLYING_DRILL',      // air d+D (multi-hit drill)
  // Specials
  'BENIMARU_RAIJINKEN',              // qcf+A (lightning punch, anti-air)
  'BENIMARU_RAIJINKEN_C',            // qcf+C (strong lightning punch)
  'BENIMARU_IAI_GERI',               // qcb+B (lightning kick)
  'BENIMARU_IAI_GERI_D',             // qcb+D (strong lightning kick)
  'BENIMARU_HANDOU_SANDAN_GERI',     // Iai Geri follow-up qcf+B/D (3-stage kick)
  'BENIMARU_SHINKUU_KATATEGOMA',     // dp+A (vacuum palm spin)
  'BENIMARU_SHINKUU_KATATEGOMA_C',   // dp+C (strong vacuum palm spin)
  'BENIMARU_COLLIDER',               // hcf,f+A/C (command grab)
  'BENIMARU_SUPER_INAZUMA_KICK',     // charge d,u+B (rising lightning kick)
  'BENIMARU_SUPER_INAZUMA_KICK_D',   // charge d,u+D (strong rising lightning kick)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM / HSDM
  'DM_RAIKOUKEN_A',            // Raikouken DM A version
  'DM_RAIKOUKEN_C',            // Raikouken DM C version
  'DM_RAIKOUKEN',              // Raikouken DM default
  'DM_GENEI_HURRICANE_B',      // Genei Hurricane DM B version
  'DM_GENEI_HURRICANE_D',      // Genei Hurricane DM D version
  'DM_GENEI_HURRICANE',        // Genei Hurricane DM default
  'SDM_RAIKOUKEN',             // Raikouken SDM
  'HSDM_RAIKOUKEN',            // Raikouken HSDM
];

/** Benimaru's frame data, keyed by AttackType string */
export function getBenimaruFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of BENIMARU_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Benimaru attack */
export function getBenimaruAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
