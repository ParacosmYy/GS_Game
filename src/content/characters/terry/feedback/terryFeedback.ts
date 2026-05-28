/**
 * Terry Content Package — Feedback Tier Mappings
 *
 * Maps Terry's attack types to their feedback tiers (light/heavy/special/dm/sdm/hsdm).
 * Re-exports from the canonical feedback manifest, filtered to Terry-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { TERRY_ATTACK_KEYS } from '../attacks/terryAttacks.js';

/** Terry's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getTerryFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of TERRY_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Terry attack */
export function getTerryFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Terry */
export const TERRY_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
    'TERRY_POWER_WAVE', 'TERRY_ROUND_WAVE',
    'TERRY_BURN_KNUCKLE', 'TERRY_BURN_KNUCKLE_C', 'TERRY_BURN_KNUCKLE_D',
    'TERRY_CRACK_SHOT', 'TERRY_CRACK_SHOT_D',
    'TERRY_POWER_DUNK', 'TERRY_POWER_DUNK_D',
    'TERRY_RISING_TACKLE', 'TERRY_RISING_TACKLE_C',
    'TERRY_POWER_CHARGE', 'TERRY_HAMMER_PUNCH',
  ],
  dm: [
    'DM_POWER_GEYSER', 'DM_POWER_GEYSER_A', 'DM_POWER_GEYSER_C',
    'DM_HIGH_ANGLE_GEYSER', 'DM_HIGH_ANGLE_GEYSER_B', 'DM_HIGH_ANGLE_GEYSER_D',
  ],
  sdm: [
    'SDM_TRIPLE_GEYSER', 'SDM_POWER_GEYSER_EX', 'SDM_HIGH_ANGLE_GEYSER',
  ],
  hsdm: ['HSDM_POWER_GEYSER'],
};
