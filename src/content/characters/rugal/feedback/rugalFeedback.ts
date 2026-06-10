/**
 * Rugal Content Package — Feedback Tier Mappings
 *
 * 归属: content/characters/rugal/feedback/ — Rugal 专属键使用内容包显式档位。
 */
import { getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackParams, FeedbackTier } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { RUGAL_ATTACK_KEYS } from '../attacks/rugalAttacks.js';

export function getRugalFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of RUGAL_ATTACK_KEYS) {
    if (key.startsWith('DM_RUGAL_')) result[key] = 'dm';
    else if (key.startsWith('RUGAL_')) result[key] = 'special';
    else result[key] = inferTier(key as AttackType);
  }
  return result;
}

export function getRugalFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

export const RUGAL_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'],
  heavy: ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'],
  special: [
    'RUGAL_DARK_SMASH',
    'RUGAL_KAISER_WAVE',
    'RUGAL_KAISER_WAVE_C',
    'RUGAL_REPPU_KEN',
    'RUGAL_REPPU_KEN_C',
    'RUGAL_GENOCIDE_CUTTER',
    'RUGAL_GENOCIDE_CUTTER_D',
    'RUGAL_DARK_BARRIER',
  ],
  dm: ['DM_RUGAL_GIGANTIC_PRESSURE', 'DM_RUGAL_DEAD_END_SCREAMER'],
  sdm: [],
  hsdm: [],
};
