/**
 * Shermie Content Package — Feedback Tier Mappings
 *
 * Maps Shermie's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Shermie-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { SHERMIE_ATTACK_KEYS } from '../attacks/shermieAttacks.js';

/** Shermie's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getShermieFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of SHERMIE_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Shermie attack */
export function getShermieFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Shermie */
export const SHERMIE_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'SHERMIE_STAND', 'SHERMIE_CLASH',
    'SHERMIE_SHOOT', 'SHERMIE_SHOOT_C',
    'SHERMIE_CARNIVAL', 'SHERMIE_AXLE_SPIN',
    'SHERMIE_SPIRAL', 'SHERMIE_SPIRAL_C',
    'SHERMIE_WHIP', 'SHERMIE_WHIP_C',
    'SHERMIE_SUPLEX',
  ],
  dm: [
    'DM_SHERMIE_CARNIVAL', 'DM_SHERMIE_FLASH',
  ],
  sdm: [
    'SDM_SHERMIE_CARNIVAL', 'SDM_SHERMIE_FLASH',
  ],
  hsdm: [],
};
