/**
 * Andy Content Package — Feedback Tier Mappings
 *
 * Maps Andy's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Andy-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { ANDY_ATTACK_KEYS } from '../attacks/andyAttacks.js';

/** Andy's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getAndyFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of ANDY_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Andy attack */
export function getAndyFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Andy */
export const ANDY_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
    'ANDY_HISHOU_KEN', 'ANDY_HISHOU_KEN_C',
    'ANDY_SHOURYUU_DAN', 'ANDY_SHOURYUU_DAN_C',
    'ANDY_ZANEI_RYUSEI_KEN', 'ANDY_ZANEI_RYUSEI_KEN_D',
    'ANDY_GEKI_HISHOU_KEN',
  ],
  dm: [
    'DM_CHO_REPPA_DAN',
  ],
  sdm: [],
  hsdm: [],
};
