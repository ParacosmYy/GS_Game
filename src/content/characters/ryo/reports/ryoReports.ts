/**
 * Ryo Content Package — Reports
 *
 * Re-exports completeness and alignment report tools for Ryo's vertical slice.
 * Provides convenience functions that filter to Ryo-specific data.
 */
import {
  generateRyoDimensionReport,
  type RyoDimensionReport,
  type DimensionResult,
} from '../../../../tools/ryoCompletenessReport.js';
import { RYO_ACTION_CONTRACTS } from '../../../../core/ryoFrameContract.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { FEEDBACK_MANIFEST } from '../../../../core/feedbackManifest.js';
import { FRAME_DATA } from '../../../../core/constants.js';
import { RYO_ATTACK_KEYS } from '../attacks/ryoAttacks.js';

/** Full 7-dimension completeness report */
export function getRyoCompletenessReport(): RyoDimensionReport {
  return generateRyoDimensionReport();
}

/** Check which Ryo attacks have complete hitbox data chains */
export interface HitboxChainStatus {
  attackKey: string;
  hasFrameData: boolean;
  hasAttackFrames: boolean;
  hasHitboxOffset: boolean;
  hasFeedback: boolean;
  hasFrameContract: boolean;
  complete: boolean;
}

export function getRyoHitboxChainReport(): HitboxChainStatus[] {
  return RYO_ATTACK_KEYS.map(key => {
    const hasFrameData = key in FRAME_DATA;
    const hasAttackFrames = key in ATTACK_FRAMES;
    const hasHitboxOffset = key in HITBOX_OFFSETS;
    const hasFeedback = key in FEEDBACK_MANIFEST.attackTierMap;
    const hasFrameContract = Array.from(RYO_ACTION_CONTRACTS.keys())
      .some(actionId => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        return contract?.attackType === key;
      });
    const complete = hasFrameData && hasAttackFrames && hasHitboxOffset && hasFeedback;
    return { attackKey: key, hasFrameData, hasAttackFrames, hasHitboxOffset, hasFeedback, hasFrameContract, complete };
  });
}

/** Summary: count of complete vs incomplete hitbox chains */
export interface HitboxChainSummary {
  total: number;
  complete: number;
  incomplete: string[];
}

export function getRyoHitboxChainSummary(): HitboxChainSummary {
  const report = getRyoHitboxChainReport();
  const incomplete = report.filter(r => !r.complete).map(r => r.attackKey);
  return { total: report.length, complete: report.length - incomplete.length, incomplete };
}
