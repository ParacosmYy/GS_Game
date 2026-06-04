/**
 * Yashiro Content Package — Feedback Tier Mappings
 *
 * Maps Yashiro's attack types to their feedback tiers (light/heavy/special/dm/sdm).
 * Re-exports from the canonical feedback manifest, filtered to Yashiro-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { YASHIRO_ATTACK_KEYS } from '../attacks/yashiroAttacks.js';

/** Yashiro's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getYashiroFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of YASHIRO_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Yashiro attack */
export function getYashiroFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Yashiro */
export const YASHIRO_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
    'YASHIRO_UPPER_DU', 'YASHIRO_UPPER_DU_C',
    'YASHIRO_NIRAAI', 'YASHIRO_NIRAAI_C',
    'YASHIRO_MUSATSU', 'YASHIRO_MUSATSU_D',
    'YASHIRO_SLEDGEHAMMER', 'YASHIRO_SLEDGEHAMMER_C',
    'YASHIRO_MISSED',
  ],
  dm: [
    'DM_MILLION_BASH_STREAM', 'DM_ORE_MAJI_MAMIRE',
  ],
  sdm: [
    'SDM_MILLION_BASH_STREAM', 'SDM_ORE_MAJI_MAMIRE',
  ],
  hsdm: [],
};
