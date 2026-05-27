/**
 * Kyo Content Package — Attack Definitions
 *
 * Re-exports Kyo-specific frame data from the canonical source.
 * Includes all Kyo normals, command normals, specials, rekka chain, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Kyo-specific attack type keys */
export const KYO_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'CMD_GOFU_YOU',    // →+B (overhead)
  'CMD_88SHIKI',     // ↘+D (low 2-hit)
  'CMD_NARAKU',      // air ↓+C (KD)
  // Specials
  'KYO_75KAI',       // ↓↘→+K (75 Shiki Kai, two-kick)
  'KYO_75KAI_2',     // 75 Shiki Kai second kick
  'KYO_RED_KICK',    // ←↓↙+K (R.E.D. Kick)
  'KYO_ONIYAKI',     // →↓↘+A (weak upper)
  'KYO_ONIYAKI_C',   // →↓↘+C (strong upper, invincible)
  'KYO_YAMIBARAI',   // ↓↘→+A (weak projectile)
  'KYO_YAMIBARAI_C', // ↓↘→+C (strong projectile, faster)
  // Rekka chain — Aragami (114 Shiki)
  'KYO_ARAGAMI',             // ↓↘→+A (rekka starter)
  'KYO_ARAGAMI_KONOKIZU',    // 128 Shiki Kono Kizu (follow-up)
  'KYO_ARAGAMI_YANOSABI',    // 127 Shiki Yano Sabi (follow-up)
  'KYO_NANASE',              // Nanase (kick follow-up)
  'KYO_KOTO_TSUKI',          // Gekio (palm follow-up)
  'KYO_YAKISOGI',            // Yaki Sogi (follow-up)
  // Rekka chain — Dokugami (115 Shiki)
  'KYO_DOKUGAMI',            // ↓↘→+C (rekka starter)
  'KYO_TSUMIYOMI',           // 401 Shiki Tsumiyomi (follow-up)
  'KYO_BATSUYOMI',           // 402 Shiki Batsuyomi (follow-up)
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_OROCHINAGI',   // Saishu no Kamae DM (Orochinagi)
  'SDM_OROCHINAGI',  // SDM version
];

/** Kyo's frame data, keyed by AttackType string */
export function getKyoFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of KYO_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Kyo attack */
export function getKyoAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
