/**
 * initAllCharacterSprites.ts
 *
 * Single entry point to load all registered character sprites at startup.
 * Import this file and call initAllCharacterSprites() before the game loop.
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
import type { FighterState, AttackType } from '../../../core/types.js';

const initializedCharacters = new Set<string>();

/**
 * Load sprites for all registered characters.
 * Each character loads independently — failures don't block others.
 */
export async function initAllCharacterSprites(): Promise<void> {
  const configs = getAllRegisteredCharacters();
  console.log(`[Sprites] Loading sprites for ${configs.length} characters...`);

  const results = await Promise.allSettled(
    configs.map(async (config) => {
      try {
        const [sprites, hitboxes] = await Promise.all([
          loadCharacterSprites(config),
          loadCharacterHitboxes(config),
        ]);
        initializedCharacters.add(config.charId);
        return { charId: config.charId, spriteCount: sprites.size, hasHitboxes: !!hitboxes };
      } catch (e) {
        console.warn(`[Sprites] Failed to load ${config.charId}:`, e);
        return null;
      }
    }),
  );

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      const { charId, spriteCount, hasHitboxes } = r.value;
      const hitboxTag = hasHitboxes ? '+hitboxes' : '';
      console.log(`[Sprites] ${charId}: ${spriteCount} actions${hitboxTag} loaded`);
    }
  }

  console.log(`[Sprites] ${initializedCharacters.size}/${configs.length} characters loaded`);

  // Hitbox summary
  const hitboxSummary = getHitboxLoadSummary();
  if (hitboxSummary.length > 0) {
    console.log(`[Hitboxes] ${hitboxSummary.length} characters with MUGEN hitbox data`);
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
