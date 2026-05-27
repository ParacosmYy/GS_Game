/**
 * Kyo Content Package — Feedback Tier Mappings
 *
 * Maps Kyo's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Kyo-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { KYO_ATTACK_KEYS } from '../attacks/kyoAttacks.js';

/** Kyo's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getKyoFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of KYO_ATTACK_KEYS) {
    const explicit = FEEDBACK_MANIFEST.attackTierMap[key as AttackType];
    if (explicit) {
      result[key] = explicit;
    } else {
      // Fall back to inference
      result[key] = inferTier(key as AttackType);
    }
  }
  return result;
}

/** Get feedback parameters for a specific Kyo attack */
export function getKyoFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Kyo */
export const KYO_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
    'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
    'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
    'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
    'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
    'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
    'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  ],
  dm: ['DM_OROCHINAGI'],
  sdm: ['SDM_OROCHINAGI'],
  hsdm: ['HSDM_OROCHINAGI'],
};
