/**
 * Yamazaki Content Package — Feedback Tier Mappings
 *
 * Maps Yamazaki's attack types to their feedback tiers (light/heavy/special/dm/sdm/hsdm).
 * Re-exports from the canonical feedback manifest, filtered to Yamazaki-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { YAMAZAKI_ATTACK_KEYS } from '../attacks/yamazakiAttacks.js';

/** Yamazaki's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getYamazakiFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of YAMAZAKI_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Yamazaki attack */
export function getYamazakiFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Yamazaki */
export const YAMAZAKI_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
    'YAMAZAKI_SNAKE_ARM', 'YAMAZAKI_SNAKE_ARM_C',
    'YAMAZAKI_SANDSTORM', 'YAMAZAKI_BAI_GA_SE',
    'YAMAZAKI_SNAKE_ARM_QCF', 'YAMAZAKI_DRILL',
  ],
  dm: [
    'DM_GUILLOTINE',
  ],
  sdm: [
    'SDM_GUILLOTINE',
  ],
  hsdm: ['HSDM_DRILL'],
};
