/**
 * Kensou Content Package — Feedback Tier Mappings
 *
 * 归属: content/characters/kensou/feedback/ — 只放攻击键到反馈档位的内容数据。
 */
import { getFeedback, inferTier } from '../../../../core/feedbackManifest.js';
import type { FeedbackParams, FeedbackTier } from '../../../../core/feedbackManifest.js';
import type { AttackType } from '../../../../core/types.js';
import { KENSOU_ATTACK_KEYS } from '../attacks/kensouAttacks.js';

export function getKensouFeedbackTiers(): Record<string, FeedbackTier> {
  const result: Record<string, FeedbackTier> = {};
  for (const key of KENSOU_ATTACK_KEYS) {
    if (key.startsWith('KENSOU_')) result[key] = 'special';
    else result[key] = inferTier(key as AttackType);
  }
  return result;
}

export function getKensouFeedback(attackType: string): FeedbackParams {
  return getFeedback(attackType as AttackType);
}

export const KENSOU_FEEDBACK_SUMMARY: Record<FeedbackTier, string[]> = {
  light: ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'],
  heavy: ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'],
  special: [
    'KENSOU_BAKYAKU',
    'KENSOU_KAKUHI',
    'KENSOU_CHOU_KYUU_DAN',
    'KENSOU_CHOU_KYUU_DAN_C',
    'KENSOU_RYURENGA_TEN',
    'KENSOU_RYURENGA_CHI',
    'KENSOU_RYUSOU_GEKI',
  ],
  dm: ['DM_SHIN_CHOU_KYUU_DAN'],
  sdm: ['SDM_SHIN_CHOU_KYUU_DAN'],
  hsdm: [],
};
