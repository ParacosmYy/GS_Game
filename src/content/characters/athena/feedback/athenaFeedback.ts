/**
 * Athena Content Package — Feedback Tier Mappings
 *
 * Maps Athena's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Athena-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { ATHENA_ATTACK_KEYS } from '../attacks/athenaAttacks.js';

/** Athena's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getAthenaFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of ATHENA_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Athena attack */
export function getAthenaFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Athena */
export const ATHENA_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
    'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_BALL_C',
    'ATHENA_PSYCHO_SWORD', 'ATHENA_PSYCHO_SWORD_C',
    'ATHENA_PHOENIX_ARROW',
    'ATHENA_PSYCHO_TELEPORT', 'ATHENA_PSYCHO_TELEPORT_C',
  ],
  dm: [
    'DM_SHINING_CRYSTAL_BIT', 'DM_PHOENIX_FANG_ARROW',
  ],
  sdm: [
    'SDM_SHINING_CRYSTAL_BIT', 'SDM_PHOENIX_FANG_ARROW',
  ],
  hsdm: [],
};
