/**
 * Omega Rugal Content Package - Feedback Tier Mappings
 *
 * Feedback tiers are explicit here so core feedback inference does not need to
 * learn Omega Rugal's private content keys.
 */
import { getFeedback } from '../../../../core/feedbackManifest.js';
import type { FeedbackParams, FeedbackTier } from '../../../../core/feedbackManifest.js';
import { G_RUGAL_ATTACK_KEYS } from '../attacks/gRugalAttacks.js';

export function getGRugalFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of G_RUGAL_ATTACK_KEYS) {
    if (key.startsWith('DM_G_RUGAL_')) result[key] = 'dm';
    else if (key.startsWith('G_RUGAL_')) result[key] = 'special';
    else if (key.endsWith('_C') || key.endsWith('_D')) result[key] = 'heavy';
    else result[key] = 'light';
  }
  return result;
}

export function getGRugalFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as never);
}

export const G_RUGAL_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'],
  heavy: ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'],
  special: [
    'G_RUGAL_DARK_SMASH',
    'G_RUGAL_KAISER_WAVE',
    'G_RUGAL_REPPU_KEN',
    'G_RUGAL_GENOCIDE_CUTTER',
    'G_RUGAL_DARK_BARRIER',
  ],
  dm: ['DM_G_RUGAL_GIGANTIC_PRESSURE', 'DM_G_RUGAL_DEAD_END_SCREAMER'],
  sdm: [],
  hsdm: [],
};
