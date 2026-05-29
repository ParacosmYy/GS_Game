/**
 * Yuri Content Package — Feedback Tier Mappings
 */

import { FEEDBACK_MANIFEST, getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackTier, FeedbackParams } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { YURI_ATTACK_KEYS } from '../attacks/yuriAttacks.js';

export function getYuriFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of YURI_ATTACK_KEYS) {
    const explicit = FEEDBACK_MANIFEST.attackTierMap[key as AttackType];
    if (explicit) {
      result[key] = explicit;
    } else {
      result[key] = inferTier(key as AttackType);
    }
  }
  return result;
}

export function getYuriFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

export const YURI_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'],
  heavy: ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D', 'YURI_UPPER_BLOCK', 'YURI_LOWER_BLOCK', 'BLOWBACK', 'JUMP_BLOWBACK'],
  special: ['YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER', 'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU', 'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN'],
  dm: ['DM_YURI_HAOH_SHO_KO_KEN', 'DM_YURI_HIEN_HOU_OU_KYAKU'],
  sdm: ['SDM_YURI_HAOH_SHO_KO_KEN', 'SDM_YURI_HIEN_HOU_OU_KYAKU'],
  hsdm: ['HSDM_YURI_HISHOU_KUURETSU_ZAN'],
};
