/**
 * Kim Content Package — Feedback Tier Mappings
 *
 * Maps Kim's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Kim-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { KIM_ATTACK_KEYS } from '../attacks/kimAttacks.js';

/** Kim's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getKimFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of KIM_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Kim attack */
export function getKimFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Kim */
export const KIM_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'KIM_HISHOU_KICK', 'KIM_HANSEN', 'KIM_HISHOU',
    'KIM_HIENZAN', 'KIM_HIENZAN_D',
    'KIM_HANGETSU', 'KIM_HANGETSU_D',
    'KIM_HAKI',
    'KIM_SANREN', 'KIM_SANREN_2',
    'KIM_KUZUSHI_GERI', 'KIM_NERICHAGI', 'KIM_KAITEN_HIEN_ZAN',
  ],
  dm: ['DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN'],
  sdm: ['SDM_PHOENIX_HITEN', 'SDM_PHOENIX_HITEN_EX'],
  hsdm: ['HSDM_PHOENIX_HITEN'],
};
