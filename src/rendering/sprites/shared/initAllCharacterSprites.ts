/**
 * initAllCharacterSprites.ts
 *
 * Single entry point to load all registered character sprites at startup.
 * Import this file and call initAllCharacterSprites() before the game loop.
 *
 * Strategy: load priority characters (kyo, ryo) first, then load the rest
 * in small batches to avoid overwhelming the browser with concurrent fetches.
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

const PRIORITY_CHARS = ['kyo', 'ryo'];

/**
 * Load sprites for all registered characters.
 * Priority characters load first, then the rest in background batches.
 */
export async function initAllCharacterSprites(): Promise<void> {
  const configs = getAllRegisteredCharacters();
  console.log(`[Sprites] Loading sprites for ${configs.length} characters...`);

  // Phase 1: Load priority characters immediately
  const priorityConfigs = configs.filter(c => PRIORITY_CHARS.includes(c.charId));
  const restConfigs = configs.filter(c => !PRIORITY_CHARS.includes(c.charId));

  await loadBatch(priorityConfigs);

  // Phase 2: Load remaining characters in background batches of 4
  loadBackground(restConfigs);
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
        return { charId: config.charId, spriteCount: sprites.size, hasHitboxes: !!hitboxes, mugenDir: config.mugenDir };
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
      // Register hurtbox manifest in background (reuse browser cache)
      fetch(`/sprites/${mugenDir}/manifest.json`).then(r => r.ok ? r.json() : null).then(d => { if (d) registerManifestData(mugenDir, d); }).catch(() => {});
    }
  }
}

function loadBackground(configs: import('./characterSpriteRegistry.js').CharacterSpriteConfig[]): void {
  const BATCH_SIZE = 4;
  let idx = 0;
  const next = async () => {
    const batch = configs.slice(idx, idx + BATCH_SIZE);
    if (batch.length === 0) {
      console.log(`[Sprites] ${initializedCharacters.size} total characters loaded`);
      return;
    }
    idx += BATCH_SIZE;
    await loadBatch(batch);
    setTimeout(next, 100);
  };
  setTimeout(next, 500);
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
