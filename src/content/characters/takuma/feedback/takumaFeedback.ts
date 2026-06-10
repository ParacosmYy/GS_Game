/**
 * Takuma Content Package — Feedback Tier Mappings
 *
 * 归属: content/characters/takuma/feedback/ — 只放攻击键到反馈档位的内容数据。
 */
import { getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackParams, FeedbackTier } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { TAKUMA_ATTACK_KEYS } from '../attacks/takumaAttacks.js';

export function getTakumaFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of TAKUMA_ATTACK_KEYS) {
    if (key === 'TAKUMA_KO_OU_KEN' || key === 'TAKUMA_KO_OU_KEN_C'
      || key === 'TAKUMA_HAOH_SHOU_KOU_KEN' || key === 'TAKUMA_HIEN_SHIPPUU'
      || key === 'TAKUMA_FUU_GA' || key === 'TAKUMA_GOUSOU') {
      result[key] = 'special';
    } else {
      result[key] = inferTier(key as AttackType);
    }
  }
  return result;
}

export function getTakumaFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

export const TAKUMA_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'],
  heavy: ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'],
  special: [
    'TAKUMA_FUU_GA',
    'TAKUMA_GOUSOU',
    'TAKUMA_KO_OU_KEN',
    'TAKUMA_KO_OU_KEN_C',
    'TAKUMA_HAOH_SHOU_KOU_KEN',
    'TAKUMA_HIEN_SHIPPUU',
  ],
  dm: ['DM_RYUKO_RANBU_TAKUMA'],
  sdm: ['SDM_RYUKO_RANBU_TAKUMA'],
  hsdm: [],
};
