/**
 * Benimaru Content Package — Feedback Tier Mappings
 *
 * Maps Benimaru's attack types to their feedback tiers (light/heavy/special/dm/sdm/hsdm).
 * Re-exports from the canonical feedback manifest, filtered to Benimaru-relevant entries.
 */
import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { BENIMARU_ATTACK_KEYS } from '../attacks/benimaruAttacks.js';

/** Benimaru's attack-to-feedback-tier mapping (explicit entries from manifest) */
export function getBenimaruFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of BENIMARU_ATTACK_KEYS) {
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

/** Get feedback parameters for a specific Benimaru attack */
export function getBenimaruFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

/** Feedback tier summary for Benimaru */
export const BENIMARU_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: [
    'STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B',
    'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B',
  ],
  heavy: [
    'STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_C', 'CROUCH_D', 'STAND_CD', 'JUMP_C', 'JUMP_D', 'JUMP_CD',
  ],
  special: [
    'BENIMARU_JACKKNIFE_KICK', 'BENIMARU_FLYING_DRILL',
    'BENIMARU_RAIJINKEN', 'BENIMARU_RAIJINKEN_C',
    'BENIMARU_IAI_GERI', 'BENIMARU_IAI_GERI_D',
    'BENIMARU_HANDOU_SANDAN_GERI',
    'BENIMARU_SHINKUU_KATATEGOMA', 'BENIMARU_SHINKUU_KATATEGOMA_C',
    'BENIMARU_COLLIDER',
    'BENIMARU_SUPER_INAZUMA_KICK', 'BENIMARU_SUPER_INAZUMA_KICK_D',
  ],
  dm: [
    'DM_RAIKOUKEN', 'DM_RAIKOUKEN_A', 'DM_RAIKOUKEN_C',
    'DM_GENEI_HURRICANE', 'DM_GENEI_HURRICANE_B', 'DM_GENEI_HURRICANE_D',
  ],
  sdm: [
    'SDM_RAIKOUKEN',
  ],
  hsdm: ['HSDM_RAIKOUKEN'],
};
