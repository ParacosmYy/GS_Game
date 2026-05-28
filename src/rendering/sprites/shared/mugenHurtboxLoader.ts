/**
 * mugenHurtboxLoader.ts
 *
 * Runtime loader for MUGEN hurtbox (Clsn2) data from manifest animations.
 * Provides per-frame hurtbox lookup for combat system and debug visualization.
 *
 * Data source: manifest.json animations[].frames[].hurtboxes
 * Format: { left, top, right, bottom } in MUGEN pixel space
 */

import type { CharacterSpriteConfig } from './characterSpriteRegistry.js';
import { getCharacterConfig, resolveGenericMugenAction } from './characterSpriteRegistry.js';
import type { FighterState, AttackType } from '../../../core/types.js';

// ===== Types =====

export interface MugenHurtbox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MugenAttackBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface FrameCollisionData {
  hurtboxes: MugenHurtbox[];
  attackBoxes: MugenAttackBox[];
}

export interface ActionCollisionData {
  frames: FrameCollisionData[];
  totalFrames: number;
  framesWithHurtboxes: number;
  framesWithAttack: number;
}

// ===== Cache =====

interface ManifestAnim {
  frames: Array<{
    group: number;
    index: number;
    duration: number;
    hurtboxes: MugenHurtbox[] | null;
    attackBoxes: MugenAttackBox[] | null;
  }>;
}

interface Manifest {
  animations: Record<string, ManifestAnim>;
}

const manifestCache = new Map<string, Manifest>();

// ===== Loading =====

async function loadManifest(mugenDir: string): Promise<Manifest | null> {
  const existing = manifestCache.get(mugenDir);
  if (existing) return existing;

  try {
    const resp = await fetch(`/sprites/${mugenDir}/manifest.json`);
    if (!resp.ok) return null;
    const data: Manifest = await resp.json();
    manifestCache.set(mugenDir, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Register pre-loaded manifest data (for testing).
 */
export function registerManifestData(mugenDir: string, data: Manifest): void {
  manifestCache.set(mugenDir, data);
}

// ===== Lookup =====

/**
 * Get hurtbox data for a specific action at a specific frame.
 * Returns null if no data available.
 */
export function getHurtboxesAtFrame(
  mugenDir: string,
  actionNumber: string,
  frameIndex: number,
): MugenHurtbox[] | null {
  const manifest = manifestCache.get(mugenDir);
  if (!manifest) return null;

  const anim = manifest.animations[actionNumber];
  if (!anim || frameIndex >= anim.frames.length) return null;

  const frame = anim.frames[frameIndex];
  if (!frame.hurtboxes || frame.hurtboxes.length === 0) return null;

  return frame.hurtboxes;
}

/**
 * Get attack box data for a specific action at a specific frame.
 */
export function getAttackBoxesAtFrame(
  mugenDir: string,
  actionNumber: string,
  frameIndex: number,
): MugenAttackBox[] | null {
  const manifest = manifestCache.get(mugenDir);
  if (!manifest) return null;

  const anim = manifest.animations[actionNumber];
  if (!anim || frameIndex >= anim.frames.length) return null;

  const frame = anim.frames[frameIndex];
  if (!frame.attackBoxes || frame.attackBoxes.length === 0) return null;

  return frame.attackBoxes;
}

/**
 * Get full collision data for an action.
 */
export function getActionCollisionData(
  mugenDir: string,
  actionNumber: string,
): ActionCollisionData | null {
  const manifest = manifestCache.get(mugenDir);
  if (!manifest) return null;

  const anim = manifest.animations[actionNumber];
  if (!anim) return null;

  let framesWithHurtboxes = 0;
  let framesWithAttack = 0;

  const frames: FrameCollisionData[] = anim.frames.map(f => {
    const hb = f.hurtboxes || [];
    const ab = f.attackBoxes || [];
    if (hb.length > 0) framesWithHurtboxes++;
    if (ab.length > 0) framesWithAttack++;
    return { hurtboxes: hb, attackBoxes: ab };
  });

  return {
    frames,
    totalFrames: frames.length,
    framesWithHurtboxes,
    framesWithAttack,
  };
}

/**
 * Resolve the MUGEN action number and get hurtboxes for a fighter's current state.
 * Returns null if no manifest data available.
 */
export function resolveAndGetHurtboxes(
  charId: string,
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
  frameIndex: number,
): MugenHurtbox[] | null {
  const config = getCharacterConfig(charId);
  if (!config) return null;

  const actionNumber = resolveGenericMugenAction(config, state, attack, vx, facing);
  if (!actionNumber) return null;

  return getHurtboxesAtFrame(config.mugenDir, actionNumber, frameIndex);
}

/**
 * Convert MUGEN hurtbox to game display coordinates.
 * MUGEN: left/top/right/bottom, origin at feet, Y negative = up.
 */
export function hurtboxToGameRect(
  hurtbox: MugenHurtbox,
  x: number,
  y: number,
  facing: number,
  scale: number,
): { x: number; y: number; width: number; height: number } {
  const ox = hurtbox.left * scale;
  const oy = hurtbox.top * scale;
  const w = (hurtbox.right - hurtbox.left) * scale;
  const h = (hurtbox.bottom - hurtbox.top) * scale;

  return {
    x: x + ox * facing,
    y: y + oy,
    width: w,
    height: h,
  };
}

/**
 * Check if a character has manifest hurtbox data loaded.
 */
export function hasManifestHurtboxes(mugenDir: string): boolean {
  return manifestCache.has(mugenDir);
}

/**
 * Get summary of hurtbox coverage for a character.
 */
export function getHurtboxCoverage(mugenDir: string): {
  totalActions: number;
  totalFrames: number;
  framesWithHurtboxes: number;
  coverage: number;
} | null {
  const manifest = manifestCache.get(mugenDir);
  if (!manifest) return null;

  let totalFrames = 0;
  let hurtboxFrames = 0;

  for (const anim of Object.values(manifest.animations)) {
    for (const f of anim.frames) {
      totalFrames++;
      if (f.hurtboxes && f.hurtboxes.length > 0) hurtboxFrames++;
    }
  }

  return {
    totalActions: Object.keys(manifest.animations).length,
    totalFrames,
    framesWithHurtboxes: hurtboxFrames,
    coverage: totalFrames > 0 ? hurtboxFrames / totalFrames : 0,
  };
}
