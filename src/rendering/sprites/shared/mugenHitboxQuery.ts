/**
 * mugenHitboxQuery.ts
 *
 * Content-package-facing query layer for MUGEN hitbox/hurtbox data.
 * Provides a unified API that content packages can use to query
 * MUGEN Clsn data for their character, with fallback to legacy data.
 *
 * Usage in content packages:
 *   import { getMugenAttackData, getMugenHurtboxData } from '../../rendering/sprites/shared/mugenHitboxQuery.js';
 *   const timing = getMugenAttackData('cvsryo', '1000');
 *   // timing = { startup: 5, active: 3, recovery: 12, total: 20, attackFrames: [...] }
 */

import {
  getHitboxAction,
  getAttackBoxesAtFrame,
  getAvailableActions,
  hasMugenHitboxes,
  type MugenHitboxAction,
} from './mugenHitboxLoader.js';
import {
  getHurtboxesAtFrame,
  getAttackBoxesAtFrame as getManifestAttackBoxes,
  getHurtboxCoverage,
  hasManifestHurtboxes,
} from './mugenHurtboxLoader.js';

// ===== Types =====

export interface MugenAttackTiming {
  actionNumber: string;
  startup: number;
  active: number;
  recovery: number;
  total: number;
}

export interface MugenAttackBox {
  ox: number;
  oy: number;
  w: number;
  h: number;
}

export interface MugenAttackFrame {
  frameIndex: number;
  attackBoxes: MugenAttackBox[];
  bodyOverride: { ox: number; oy: number; w: number; h: number } | null;
}

export interface MugenHurtboxFrame {
  frameIndex: number;
  hurtboxes: MugenAttackBox[];
}

export interface MugenActionSummary {
  actionNumber: string;
  timing: MugenAttackTiming;
  activeFrames: MugenAttackFrame[];
}

// ===== Query Functions =====

/**
 * Get attack timing data (startup/active/recovery) for a MUGEN action.
 */
export function getMugenAttackTiming(mugenDir: string, actionNumber: string): MugenAttackTiming | null {
  const action = getHitboxAction(mugenDir, actionNumber);
  if (!action) return null;
  return {
    actionNumber,
    startup: action.startup,
    active: action.active,
    recovery: action.recovery,
    total: action.startup + action.active + action.recovery,
  };
}

/**
 * Get per-frame attack box data for a MUGEN action.
 */
export function getMugenAttackFrameData(mugenDir: string, actionNumber: string): MugenAttackFrame[] | null {
  const action = getHitboxAction(mugenDir, actionNumber);
  if (!action || !action.frames) return null;

  return action.frames.map((frame, i) => ({
    frameIndex: i,
    attackBoxes: (frame.attack ?? []).map((ab: { ox: number; oy: number; w: number; h: number }) => ({
      ox: ab.ox,
      oy: ab.oy,
      w: ab.w,
      h: ab.h,
    })),
    bodyOverride: frame.bodyOverride ?? null,
  }));
}

/**
 * Get a complete summary of a MUGEN action's attack data.
 */
export function getMugenActionSummary(mugenDir: string, actionNumber: string): MugenActionSummary | null {
  const timing = getMugenAttackTiming(mugenDir, actionNumber);
  if (!timing) return null;
  const activeFrames = getMugenAttackFrameData(mugenDir, actionNumber);
  if (!activeFrames) return null;
  return { actionNumber, timing, activeFrames };
}

/**
 * Get hurtbox data for a specific frame of a MUGEN action.
 */
export function getMugenHurtboxFrameData(mugenDir: string, actionNumber: string, frameIndex: number): MugenHurtboxFrame | null {
  const hurtboxes = getHurtboxesAtFrame(mugenDir, actionNumber, frameIndex);
  if (!hurtboxes) return null;
  return {
    frameIndex,
    hurtboxes: hurtboxes.map(hb => ({ ox: hb.left, oy: hb.top, w: hb.right - hb.left, h: hb.bottom - hb.top })),
  };
}

/**
 * Check if MUGEN hitbox data is available for a character.
 */
export function hasCharacterMugenData(mugenDir: string): boolean {
  return hasMugenHitboxes(mugenDir);
}

/**
 * Get all available MUGEN action numbers for a character.
 */
export function getCharacterMugenActions(mugenDir: string): string[] {
  return getAvailableActions(mugenDir);
}

/**
 * Get hurtbox coverage statistics for a character's manifest.
 */
export function getCharacterHurtboxStats(mugenDir: string): {
  hasData: boolean;
  totalActions: number;
  actionsWithHurtboxes: number;
} {
  if (!hasManifestHurtboxes(mugenDir)) {
    return { hasData: false, totalActions: 0, actionsWithHurtboxes: 0 };
  }
  const coverage = getHurtboxCoverage(mugenDir);
  if (!coverage) {
    return { hasData: false, totalActions: 0, actionsWithHurtboxes: 0 };
  }
  return {
    hasData: true,
    totalActions: coverage.totalFrames,
    actionsWithHurtboxes: coverage.framesWithHurtboxes,
  };
}
