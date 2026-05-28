/**
 * animStateSync.ts
 *
 * Synchronizes animation frame state between the combat system and
 * the MUGEN sprite renderer. Handles the mapping between:
 *   - stateAge (rendering tick counter)
 *   - attackFrame (combat phase-local frame counter)
 *   - MUGEN frame index (per-action animation frame index)
 *
 * The combat system resets attackFrame to 0 at each phase transition
 * (startup→active→recovery), while the renderer's stateAge increments
 * continuously. This module bridges the gap for MUGEN sprite playback.
 */

import { FighterState } from '../../../core/types.js';
import type { AttackType } from '../../../core/types.js';
import { getCharacterConfig, resolveGenericMugenAction } from './characterSpriteRegistry.js';

// ===== Types =====

export interface AnimSyncState {
  /** MUGEN action number for current state */
  actionNumber: string | null;
  /** Current frame index within the MUGEN animation */
  frameIndex: number;
  /** Total frames in this MUGEN animation */
  totalFrames: number;
  /** Whether the animation should loop */
  looping: boolean;
  /** Per-frame durations for this action */
  frameDurations: number[];
  /** Cumulative duration tick for frame boundary detection */
  currentTick: number;
}

// ===== Frame Duration Cache =====

interface CachedAnimInfo {
  frameDurations: number[];
  totalDuration: number;
  looping: boolean;
}

const animInfoCache = new Map<string, Map<string, CachedAnimInfo>>();

/**
 * Register frame duration info for a character's action.
 * Called during sprite loading to populate the cache.
 */
export function registerAnimDurations(
  charId: string,
  actionNumber: string,
  durations: number[],
  looping: boolean = true,
): void {
  let charMap = animInfoCache.get(charId);
  if (!charMap) {
    charMap = new Map();
    animInfoCache.set(charId, charMap);
  }
  charMap.set(actionNumber, {
    frameDurations: durations,
    totalDuration: durations.reduce((a, b) => a + b, 0),
    looping,
  });
}

/**
 * Get cached animation info for a character + action.
 */
export function getAnimInfo(charId: string, actionNumber: string): CachedAnimInfo | null {
  const charMap = animInfoCache.get(charId);
  if (!charMap) return null;
  return charMap.get(actionNumber) ?? null;
}

// ===== Frame Index Resolution =====

/**
 * Resolve the MUGEN frame index for a character's current state.
 * Uses stateAge for non-attack states and attackFrame for attack states.
 */
export function resolveFrameIndex(
  charId: string,
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
  stateAge: number,
  attackFrame: number,
  attackPhase: string,
): AnimSyncState {
  const config = getCharacterConfig(charId);
  const emptyResult: AnimSyncState = {
    actionNumber: null,
    frameIndex: 0,
    totalFrames: 0,
    looping: true,
    frameDurations: [],
    currentTick: 0,
  };

  if (!config) return emptyResult;

  const actionNumber = resolveGenericMugenAction(config, state, attack, vx, facing);
  if (!actionNumber) return emptyResult;

  const info = getAnimInfo(charId, actionNumber);
  if (!info || info.frameDurations.length === 0) {
    return {
      ...emptyResult,
      actionNumber,
    };
  }

  // Determine which tick counter to use
  const isAttack = state === FighterState.STAND_ATTACK ||
                   state === FighterState.CROUCH_ATTACK ||
                   state === FighterState.AIR_ATTACK;

  let tick: number;
  if (isAttack && attackPhase !== 'none') {
    // For attacks, use attackFrame (reset at phase transitions)
    // Map to absolute position: phase_offset + attackFrame
    const phaseOffset = getPhaseOffset(info, attackPhase);
    tick = phaseOffset + attackFrame;
  } else {
    // For non-attack states, use stateAge
    tick = stateAge;
  }

  // Convert tick to frame index using durations
  const frameIndex = tickToFrameIndex(tick, info.frameDurations, info.looping);

  return {
    actionNumber,
    frameIndex,
    totalFrames: info.frameDurations.length,
    looping: info.looping,
    frameDurations: info.frameDurations,
    currentTick: tick,
  };
}

/**
 * Estimate the phase offset for an attack based on frame durations.
 * Startup frames come first, then active frames (with attack boxes).
 */
function getPhaseOffset(info: CachedAnimInfo, phase: string): number {
  if (phase === 'startup' || phase === 'none') return 0;
  // For active/recovery, we can't easily determine the offset without
  // knowing which frames have attack boxes. Return 0 and let the
  // attackFrame handle it within the phase.
  return 0;
}

/**
 * Convert an absolute tick to a frame index using per-frame durations.
 */
function tickToFrameIndex(tick: number, durations: number[], looping: boolean): number {
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  if (totalDuration === 0) return 0;

  let t = looping ? tick % totalDuration : Math.min(tick, totalDuration - 1);

  let accum = 0;
  for (let i = 0; i < durations.length; i++) {
    accum += durations[i];
    if (t < accum) return i;
  }

  return durations.length - 1;
}

/**
 * Get the duration of a specific frame in a MUGEN action.
 */
export function getFrameDuration(charId: string, actionNumber: string, frameIndex: number): number {
  const info = getAnimInfo(charId, actionNumber);
  if (!info || frameIndex >= info.frameDurations.length) return 4; // default
  return info.frameDurations[frameIndex];
}

/**
 * Get the total animation duration (sum of all frame durations) for an action.
 */
export function getTotalAnimDuration(charId: string, actionNumber: string): number {
  const info = getAnimInfo(charId, actionNumber);
  return info ? info.totalDuration : 0;
}

/**
 * Check if an action loops based on its animation data.
 */
export function isAnimLooping(charId: string, actionNumber: string): boolean {
  const info = getAnimInfo(charId, actionNumber);
  return info ? info.looping : true;
}

/**
 * Get all registered action numbers for a character.
 */
export function getRegisteredActions(charId: string): string[] {
  const charMap = animInfoCache.get(charId);
  if (!charMap) return [];
  return Array.from(charMap.keys());
}

/**
 * Clear all cached animation info (for testing).
 */
export function clearAnimCache(): void {
  animInfoCache.clear();
}
