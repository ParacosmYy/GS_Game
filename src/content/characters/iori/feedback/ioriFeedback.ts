/**
 * Iori Content Package — Feedback Tier Mappings
 *
 * Maps Iori's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Iori-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { IORI_ATTACK_KEYS } from '../attacks/ioriAttacks.js';

/** Iori's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getIoriFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of IORI_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Iori attack */
export function getIoriFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Iori */
export const IORI_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
    'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
    'IORI_KOTOTSUKI', 'IORI_KUZUKAZE',
    'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  ],
  dm: ['DM_YAOTOME'],
  sdm: ['SDM_YAOTOME'],
  hsdm: [],
};
