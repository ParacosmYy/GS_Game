/**
 * Kyo Content Package — Hitbox / Hurtbox Data
 *
 * Re-exports Kyo-specific hitbox offsets and per-frame attack hitbox data
 * from the canonical hitbox and attack frame sources.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';

/** Kyo-specific hitbox offset keys */
export const KYO_HITBOX_KEYS: string[] = [
  // Command normals
  'CMD_GOFU_YOU',
  'CMD_88SHIKI',
  'CMD_NARAKU',
  // Specials
  'KYO_75KAI', 'KYO_75KAI_2',
  'KYO_RED_KICK',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  // Rekka chain — Aragami
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  // Rekka chain — Dokugami
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  // DM / SDM
  'DM_OROCHINAGI',
  'SDM_OROCHINAGI',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Kyo hitbox offsets */
export function getKyoHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of KYO_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) {
      result[key] = hb;
    }
  }
  return result;
}

/** Kyo-specific attack frame keys (per-frame hitbox data) */
export const KYO_ATTACK_FRAME_KEYS: string[] = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_75KAI', 'KYO_75KAI_2',
  'KYO_RED_KICK',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Kyo per-frame attack hitbox data */
export function getKyoAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KYO_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) {
      result[key] = af;
    }
  }
  return result;
}
