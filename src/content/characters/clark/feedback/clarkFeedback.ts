/**
 * Clark Content Package — Feedback Tier Mappings
 *
 * Maps Clark's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Clark-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { CLARK_ATTACK_KEYS } from '../attacks/clarkAttacks.js';

/** Clark's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getClarkFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of CLARK_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Clark attack */
export function getClarkFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Clark */
export const CLARK_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'CLARK_DEATH_LAKE', 'CLARK_STOMP',
    'CLARK_ARGENTINE', 'CLARK_ARGENTINE_C',
    'CLARK_NAPALM', 'CLARK_FLASH_ELBOW',
    'CLARK_MOUNT_TACKLE', 'CLARK_VULCAN',
  ],
  dm: [
    'DM_ARGENTINE_DM', 'DM_ROLLING_CRADLE',
  ],
  sdm: [
    'SDM_ARGENTINE_DM', 'SDM_ROLLING_CRADLE',
  ],
  hsdm: [],
};
