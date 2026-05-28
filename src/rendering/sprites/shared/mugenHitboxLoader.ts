/**
 * mugenHitboxLoader.ts
 *
 * Runtime loader for MUGEN AIR collision (Clsn) data.
 * Loads hitboxes.json files from public/sprites/<mugenDir>/ and provides
 * per-frame hitbox lookup for the combat system.
 *
 * Coordinate system: MUGEN pixel space (origin at feet, Y negative = up).
 * Use scaleToGameCoords() to convert to game display coordinates.
 */

import { resolveGenericMugenAction } from './characterSpriteRegistry.js';
import type { CharacterSpriteConfig } from './characterSpriteRegistry.js';
import type { AttackType, FighterState } from '../../../core/types.js';

// ===== Types =====

export interface FrameBox {
  ox: number;
  oy: number;
  w: number;
  h: number;
}

export interface MugenHitboxFrame {
  attack: FrameBox[];
  bodyOverride: FrameBox | null;
}

export interface MugenHitboxAction {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  frames: MugenHitboxFrame[];
}

export interface MugenHitboxData {
  characterId: string;
  actions: Record<string, MugenHitboxAction>;
}

/** Scaled hitbox frame ready for combat consumption */
export interface ScaledHitboxFrame {
  attack: Array<{ offsetX: number; offsetY: number; width: number; height: number }>;
  bodyOverride: { offsetX: number; offsetY: number; width: number; height: number } | null;
}

// ===== Cache =====

const hitboxCache = new Map<string, MugenHitboxData>();
const loadingPromises = new Map<string, Promise<MugenHitboxData | null>>();

/**
 * Register pre-loaded hitbox data (for testing or bundled data).
 */
export function registerHitboxData(charId: string, data: MugenHitboxData): void {
  hitboxCache.set(charId, data);
}

// ===== Loading =====

/**
 * Load hitboxes.json for a character's MUGEN directory.
 * Returns null if the file doesn't exist or fails to parse.
 */
export async function loadMugenHitboxes(mugenDir: string): Promise<MugenHitboxData | null> {
  try {
    const response = await fetch(`/sprites/${mugenDir}/hitboxes.json`);
    if (!response.ok) {
      console.warn(`[Hitboxes] No hitbox data for ${mugenDir}: ${response.status}`);
      return null;
    }
    const data: MugenHitboxData = await response.json();
    const actionCount = Object.keys(data.actions).length;
    console.log(`[Hitboxes] ${mugenDir}: ${actionCount} actions loaded`);
    return data;
  } catch (e) {
    console.warn(`[Hitboxes] Failed to load ${mugenDir}:`, e);
    return null;
  }
}

/**
 * Load and cache hitbox data for a registered character.
 * Safe to call multiple times — returns cached data on subsequent calls.
 */
export async function loadCharacterHitboxes(config: CharacterSpriteConfig): Promise<MugenHitboxData | null> {
  const existing = hitboxCache.get(config.charId);
  if (existing) return existing;

  const pending = loadingPromises.get(config.charId);
  if (pending) return pending;

  const promise = loadMugenHitboxes(config.mugenDir).then(data => {
    if (data) hitboxCache.set(config.charId, data);
    loadingPromises.delete(config.charId);
    return data;
  });
  loadingPromises.set(config.charId, promise);
  return promise;
}

// ===== Lookup =====

/**
 * Get raw MUGEN hitbox action data for a character + action number.
 */
export function getHitboxAction(charId: string, actionNumber: string): MugenHitboxAction | null {
  const data = hitboxCache.get(charId);
  if (!data) return null;
  return data.actions[actionNumber] ?? null;
}

/**
 * Get attack boxes during the active phase (0-based index within active).
 * This matches the game's attackFrame which resets to 0 at phase boundaries.
 */
export function getActivePhaseBoxes(
  charId: string,
  actionNumber: string,
  activeFrameIndex: number,
): FrameBox[] | null {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return null;
  if (activeFrameIndex < 0 || activeFrameIndex >= action.frames.length) return null;
  const boxes = action.frames[activeFrameIndex].attack;
  return boxes.length > 0 ? boxes : null;
}

/**
 * Get body override during the active phase (0-based index within active).
 */
export function getActivePhaseBodyOverride(
  charId: string,
  actionNumber: string,
  activeFrameIndex: number,
): FrameBox | null {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return null;
  if (activeFrameIndex < 0 || activeFrameIndex >= action.frames.length) return null;
  return action.frames[activeFrameIndex].bodyOverride;
}

/**
 * Get the full MUGEN hitbox data for a character.
 */
export function getCharacterHitboxData(charId: string): MugenHitboxData | null {
  return hitboxCache.get(charId) ?? null;
}

/**
 * Check if a character has loaded MUGEN hitbox data.
 */
export function hasMugenHitboxes(charId: string): boolean {
  return hitboxCache.has(charId);
}

/**
 * Get the total frame count for an action (startup + active + recovery).
 */
export function getActionTotalFrames(action: MugenHitboxAction): number {
  return action.startup + action.active + action.recovery;
}

// ===== Per-frame lookup (game-integrated) =====

/**
 * Get attack hitboxes for a specific frame of an action.
 * frameIndex is 0-based from the start of the attack (including startup).
 * Returns null if the frame is in startup/recovery (no attack boxes).
 * Returns the attack boxes if the frame is in the active phase.
 */
export function getAttackBoxesAtFrame(
  charId: string,
  actionNumber: string,
  frameIndex: number,
): FrameBox[] | null {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return null;

  if (frameIndex < action.startup) return null;
  const activeIndex = frameIndex - action.startup;
  if (activeIndex >= action.active) return null;
  if (activeIndex >= action.frames.length) return null;

  const boxes = action.frames[activeIndex].attack;
  return boxes.length > 0 ? boxes : null;
}

/**
 * Get body override for a specific frame of an action.
 * Returns null if no override or frame is not in active phase.
 */
export function getBodyOverrideAtFrame(
  charId: string,
  actionNumber: string,
  frameIndex: number,
): FrameBox | null {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return null;

  if (frameIndex < action.startup) return null;
  const activeIndex = frameIndex - action.startup;
  if (activeIndex >= action.active) return null;
  if (activeIndex >= action.frames.length) return null;

  return action.frames[activeIndex].bodyOverride;
}

/**
 * Resolve the MUGEN action number for a character's current state/attack.
 * Uses the same resolution logic as sprite rendering.
 */
export function resolveHitboxAction(
  config: CharacterSpriteConfig,
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
): string | null {
  return resolveGenericMugenAction(config, state, attack, vx, facing);
}

// ===== Coordinate Scaling =====

/**
 * Scale MUGEN pixel-space hitbox to game display coordinates.
 * MUGEN coords are in original sprite pixel space; game uses a larger display space.
 */
export function scaleFrameBox(
  box: FrameBox,
  scaleFactor: number,
): { offsetX: number; offsetY: number; width: number; height: number } {
  return {
    offsetX: Math.round(box.ox * scaleFactor),
    offsetY: Math.round(box.oy * scaleFactor),
    width: Math.round(box.w * scaleFactor),
    height: Math.round(box.h * scaleFactor),
  };
}

/**
 * Scale all attack boxes in a MUGEN hitbox frame to game coordinates.
 */
export function scaleHitboxFrame(
  frame: MugenHitboxFrame,
  scaleFactor: number,
): ScaledHitboxFrame {
  return {
    attack: frame.attack.map(box => scaleFrameBox(box, scaleFactor)),
    bodyOverride: frame.bodyOverride ? scaleFrameBox(frame.bodyOverride, scaleFactor) : null,
  };
}

/**
 * Calculate scale factor for a character.
 * Compares MUGEN original sprite height to game display height.
 */
export function calculateScaleFactor(
  mugenSpriteHeight: number,
  gameDisplayHeight: number,
): number {
  if (mugenSpriteHeight <= 0) return 1;
  return gameDisplayHeight / mugenSpriteHeight;
}

// ===== Convenience: full attack lookup =====

/**
 * Get scaled attack hitboxes for a character at a given combat frame.
 * Combines action resolution + frame lookup + coordinate scaling.
 * Returns null if no MUGEN data available for this attack.
 */
export function getScaledAttackAtFrame(
  charId: string,
  config: CharacterSpriteConfig,
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
  frameIndex: number,
  scaleFactor: number,
): Array<{ offsetX: number; offsetY: number; width: number; height: number }> | null {
  const actionNumber = resolveHitboxAction(config, state, attack, vx, facing);
  if (!actionNumber) return null;

  const boxes = getAttackBoxesAtFrame(charId, actionNumber, frameIndex);
  if (!boxes) return null;

  return boxes.map(box => scaleFrameBox(box, scaleFactor));
}

// ===== Debug =====

/**
 * Get summary of loaded hitbox data for all characters.
 */
export function getHitboxLoadSummary(): Array<{ charId: string; actions: number; totalActiveFrames: number }> {
  const summary: Array<{ charId: string; actions: number; totalActiveFrames: number }> = [];
  for (const [charId, data] of hitboxCache) {
    let totalActiveFrames = 0;
    const actionCount = Object.keys(data.actions).length;
    for (const action of Object.values(data.actions)) {
      totalActiveFrames += action.frames.length;
    }
    summary.push({ charId, actions: actionCount, totalActiveFrames });
  }
  return summary;
}

/**
 * Get all MUGEN action numbers that have hitbox data for a character.
 */
export function getAvailableActions(charId: string): string[] {
  const data = hitboxCache.get(charId);
  if (!data) return [];
  return Object.keys(data.actions);
}

/**
 * Get startup/active/recovery timing for a MUGEN action.
 * Useful for comparing with hand-tuned FRAME_DATA.
 */
export function getActionTiming(
  charId: string,
  actionNumber: string,
): { startup: number; active: number; recovery: number } | null {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return null;
  return { startup: action.startup, active: action.active, recovery: action.recovery };
}

/**
 * Compare MUGEN timing with game FRAME_DATA timing for an attack.
 * Returns the differences or null if no MUGEN data available.
 */
export function compareTimingWithFrameData(
  charId: string,
  actionNumber: string,
  frameDataStartup: number,
  frameDataActive: number,
  frameDataRecovery: number,
): { startupDiff: number; activeDiff: number; recoveryDiff: number; totalDiff: number } | null {
  const timing = getActionTiming(charId, actionNumber);
  if (!timing) return null;
  return {
    startupDiff: timing.startup - frameDataStartup,
    activeDiff: timing.active - frameDataActive,
    recoveryDiff: timing.recovery - frameDataRecovery,
    totalDiff: (timing.startup + timing.active + timing.recovery) -
               (frameDataStartup + frameDataActive + frameDataRecovery),
  };
}

/**
 * Get all attack boxes for every frame of a MUGEN action.
 * Returns a flat array of all attack boxes across all active frames.
 */
export function getAllAttackBoxes(
  charId: string,
  actionNumber: string,
): FrameBox[] {
  const action = getHitboxAction(charId, actionNumber);
  if (!action) return [];
  const allBoxes: FrameBox[] = [];
  for (const frame of action.frames) {
    allBoxes.push(...frame.attack);
  }
  return allBoxes;
}

/**
 * Get the bounding box that encompasses all attack boxes for an action.
 * Useful for understanding the total reach of an attack.
 */
export function getAttackBoundingBox(
  charId: string,
  actionNumber: string,
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } | null {
  const boxes = getAllAttackBoxes(charId, actionNumber);
  if (boxes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const box of boxes) {
    const x2 = box.ox + box.w;
    const y2 = box.oy + box.h;
    if (box.ox < minX) minX = box.ox;
    if (box.oy < minY) minY = box.oy;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  }
  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
