/**
 * Vice Content Package — Feedback Tier Mappings
 *
 * Maps Vice's attack types to their feedback tiers (light/heavy/special/dm/sdm/hsdm).
 * Re-exports from the canonical feedback manifest, filtered to Vice-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { VICE_ATTACK_KEYS } from '../attacks/viceAttacks.js';

/** Vice's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getViceFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of VICE_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Vice attack */
export function getViceFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Vice */
export const VICE_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'VICE_MONSTROSITY', 'VICE_OVERKILL',
    'VICE_OUTRAGE', 'VICE_OUTRAGE_C',
    'VICE_BLACK_END', 'VICE_MAYHEM', 'VICE_GORE_FEST',
  ],
  dm: [
    'DM_WITHERING_SURFACE', 'DM_NEGATIVE_GAIN',
  ],
  sdm: [
    'SDM_WITHERING_SURFACE', 'SDM_NEGATIVE_GAIN',
  ],
  hsdm: [],
};
