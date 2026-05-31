/**
 * initAllCharacterSprites.ts
 *
 * Single entry point to load all registered character sprites at startup.
 * Import this file and call initAllCharacterSprites() before the game loop.
 *
 * Strategy: load ALL character manifests upfront (fast — just JSON fetches),
 * then preload the first PNG of each character's idle action so they render
 * immediately when a battle starts. Remaining PNGs load lazily on demand.
 */

import './characterSpriteConfigs.js';
import {
  getAllRegisteredCharacters,
  loadCharacterSprites,
  getLoadedSprites,
  resolveGenericMugenAction,
  getCharacterConfig,
} from './characterSpriteRegistry.js';
import { createHighResRenderer, type SpriteImageFrame } from './baseHighResRenderer.js';
import {
  loadCharacterHitboxes,
  hasMugenHitboxes as hasLoadedMugenHitboxes,
  getHitboxLoadSummary,
  type MugenHitboxData,
} from './mugenHitboxLoader.js';
import { registerManifestData } from './mugenHurtboxLoader.js';
import { getRegisteredActions } from './animStateSync.js';
import type { FighterState, AttackType } from '../../../core/types.js';

const initializedCharacters = new Set<string>();

// Key actions whose first frame should be preloaded so the character
// renders immediately (idle, crouch, walk forward, walk back, hitstun).
const PRELOAD_ACTIONS = ['0', '11', '20', '21', '5000'];

/**
 * Load sprites for all registered characters.
 * All manifests load upfront; idle PNGs are preloaded for instant display.
 */
export async function initAllCharacterSprites(): Promise<void> {
  const configs = getAllRegisteredCharacters();
  console.log(`[Sprites] Loading sprites for ${configs.length} characters...`);

  // Load all character manifests in parallel batches of 6
  const BATCH_SIZE = 6;
  for (let i = 0; i < configs.length; i += BATCH_SIZE) {
    await loadBatch(configs.slice(i, i + BATCH_SIZE));
  }

  // Preload idle/crouch/walk PNGs so characters render on first frame
  await preloadKeyFrames();

  console.log(`[Sprites] All ${initializedCharacters.size} characters loaded`);
}

async function loadBatch(configs: import('./characterSpriteRegistry.js').CharacterSpriteConfig[]): Promise<void> {
  const results = await Promise.allSettled(
    configs.map(async (config) => {
      try {
        const [sprites, hitboxes] = await Promise.all([
          loadCharacterSprites(config),
          loadCharacterHitboxes(config),
        ]);
        initializedCharacters.add(config.charId);
        return { charId: config.charId, spriteCount: sprites.size, hasHitboxes: !!hitboxes, mugenDir: config.mugenDir, sprites };
      } catch (e) {
        console.warn(`[Sprites] Failed to load ${config.charId}:`, e);
        return null;
      }
    }),
  );

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      const { charId, spriteCount, hasHitboxes, mugenDir } = r.value;
      const hitboxTag = hasHitboxes ? '+hitboxes' : '';
      console.log(`[Sprites] ${charId}: ${spriteCount} actions${hitboxTag} loaded`);
      fetch(`/sprites/${mugenDir}/manifest.json`).then(r => r.ok ? r.json() : null).then(d => { if (d) registerManifestData(mugenDir, d); }).catch(() => {});
    }
  }
}

/**
 * For every loaded character, trigger browser download of the first PNG
 * for key actions (idle, crouch, walk). This ensures the first render
 * call finds image.complete === true instead of falling back to skeleton.
 */
async function preloadKeyFrames(): Promise<void> {
  const decodePromises: Promise<void>[] = [];

  for (const charId of initializedCharacters) {
    const sprites = getLoadedSprites(charId);
    if (!sprites) continue;

    for (const actionId of PRELOAD_ACTIONS) {
      const frames = sprites.get(actionId);
      if (!frames || frames.length === 0) continue;
      const img = frames[0].image;
      if (img && !img.complete) {
        decodePromises.push(
          img.decode().then(() => {}).catch(() => {})
        );
      }
    }
  }

  if (decodePromises.length > 0) {
    await Promise.all(decodePromises);
    console.log(`[Sprites] Preloaded ${decodePromises.length} key frame images`);
  }
}

/**
 * Check if a character has real sprites loaded.
 */
export function hasCharacterSprites(charId: string): boolean {
  return initializedCharacters.has(charId);
}

/**
 * Check if a character has MUGEN hitbox data loaded.
 */
export function hasCharacterHitboxes(charId: string): boolean {
  return hasLoadedMugenHitboxes(charId);
}

/**
 * Get the generic MUGEN action resolver for a character.
 * Returns null if no config registered.
 */
export function getCharacterMugenResolver(charId: string) {
  const config = getCharacterConfig(charId);
  if (!config) return null;
  return (state: FighterState, attack: AttackType | null, vx: number, facing: number) =>
    resolveGenericMugenAction(config, state, attack, vx, facing);
}

/**
 * Get loaded sprite frames for a character.
 */
export function getCharacterSpriteFrames(charId: string): Map<string, SpriteImageFrame[]> | undefined {
  return getLoadedSprites(charId);
}

/**
 * Get the config for a character.
 */
export function getCharacterSpriteConfig(charId: string) {
  return getCharacterConfig(charId);
}
