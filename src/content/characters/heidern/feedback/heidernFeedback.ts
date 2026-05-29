/**
 * Heidern Content Package — Feedback Tier Mappings
 *
 * Maps Heidern's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Heidern-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { HEIDERN_ATTACK_KEYS } from '../attacks/heidernAttacks.js';

/** Heidern's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getHeidernFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of HEIDERN_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Heidern attack */
export function getHeidernFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Heidern */
export const HEIDERN_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'HEIDERN_SLIDING', 'HEIDERN_COMMAND_A',
    'HEIDERN_CROSS_CUTTER', 'HEIDERN_CROSS_CUTTER_C',
    'HEIDERN_MOON_SLASHER', 'HEIDERN_MOON_SLASHER_C',
    'HEIDERN_NECK_ROLLER', 'HEIDERN_NECK_ROLLER_C',
    'HEIDERN_STORMBRINGER', 'HEIDERN_STORMBRINGER_C',
    'HEIDERN_KILLING_BRINGER', 'HEIDERN_KILLING_BRINGER_D',
    'HEIDERN_LEIDEN_REITTER', 'HEIDERN_LEIDEN_REITTER_D',
  ],
  dm: [
    'DM_HEIDERN_CRITICAL_DRIVER', 'DM_HEIDERN_END',
  ],
  sdm: [
    'SDM_HEIDERN_CRITICAL_DRIVER', 'SDM_HEIDERN_END',
    'HSDM_HEIDERN_EXECUTION',
  ],
  hsdm: [
    'HSDM_HEIDERN_EXECUTION',
  ],
};
