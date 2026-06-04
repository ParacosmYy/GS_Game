/**
 * K' Content Package — Feedback Tier Mappings
 *
 * Maps K''s attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to K'-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { KDASH_ATTACK_KEYS } from '../attacks/kdashAttacks.js';

/** K''s attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getKdashFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of KDASH_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific K' attack */
export function getKdashFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for K' */
export const KDASH_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KDASH_EINS', 'KDASH_EINS_C',
    'KDASH_CROW', 'KDASH_CROW_C',
    'KDASH_MINUTE', 'KDASH_NARROW',
  ],
  dm: [
    'DM_CHAIN_SHOT',
  ],
  sdm: [
    'SDM_CHAIN_SHOT',
  ],
  hsdm: [],
};
