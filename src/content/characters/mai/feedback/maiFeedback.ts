/**
 * Mai Content Package — Feedback Tier Mappings
 *
 * Maps Mai's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Mai-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { MAI_ATTACK_KEYS } from '../attacks/maiAttacks.js';

/** Mai's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getMaiFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of MAI_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Mai attack */
export function getMaiFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Mai */
export const MAI_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
    'MAI_KA_CHO_SEN', 'MAI_KA_CHO_SEN_C',
    'MAI_RYU_EN_BU', 'MAI_HISHO_RYU_EN_JIN',
  ],
  dm: [
    'DM_HAKA_OTOSHI',
  ],
  sdm: [
    'SDM_HAKA_OTOSHI',
  ],
  hsdm: [],
};
