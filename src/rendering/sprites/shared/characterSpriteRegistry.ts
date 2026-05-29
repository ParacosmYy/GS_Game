/**
 * characterSpriteRegistry.ts
 *
 * Generic character sprite loading system.
 * One config object per character → zero code to add a new character.
 * Just add a CharacterSpriteConfig entry and call initCharacterSprites().
 */

import type { SpriteImageFrame } from './baseHighResRenderer.js';
import { FighterState, AttackType } from '../../../core/types.js';
import { loadRealSprites } from './realSpriteLoader.js';

export interface CharacterSpriteConfig {
  /** Game-internal character ID (e.g., 'ryo', 'kyo', 'terry') */
  charId: string;
  /** MUGEN directory name (e.g., 'cvsryo', 'cvskyo') */
  mugenDir: string;
  /** Display height for sprite scaling */
  targetDisplayHeight: number;
  /** MUGEN action mapping overrides for specials/DMs */
  specialMap: Partial<Record<AttackType, string>>;
  /** Optional WIN pose action override (default: '181') */
  winAction?: string;
  /** Optional fallback tint color */
  defaultTint: string;
}

// ===== MUGEN standard action numbers (same for all characters) =====
const STANDARD_ACTIONS: Partial<Record<FighterState, string>> = {
  [FighterState.IDLE]: '0',
  [FighterState.CROUCH]: '11',
  [FighterState.HITSTUN]: '5000',
  [FighterState.KNOCKDOWN]: '5050',
  [FighterState.GETUP]: '5050',
  [FighterState.BLOCK]: '120',
  [FighterState.AIR_BLOCK]: '120',
  [FighterState.RUN]: '100',
  [FighterState.BACKDASH]: '105',
  [FighterState.ROLL]: '100',
  [FighterState.BACK_ROLL]: '105',
  [FighterState.THROW]: '800',
  [FighterState.DIZZY]: '5300',
  [FighterState.TAUNT]: '195',
  [FighterState.COUNTER_STANCE]: '300',
  [FighterState.MAX_MODE]: '0',
  [FighterState.GUARD_CRUSH]: '120',
};

// ===== Walk / Jump (need vx/facing) =====
function resolveDirectionalAction(state: FighterState, vx: number, facing: number): string | null {
  if (state === FighterState.WALK) return (vx * facing > 0) ? '20' : '21';
  if (state === FighterState.JUMP || state === FighterState.RUN_JUMP ||
      state === FighterState.HOP || state === FighterState.HYPER_JUMP) {
    return (vx * facing > 0) ? '42' : '43';
  }
  return null;
}

// ===== Normal attack mapping (same MUGEN numbers for all chars) =====
const NORMAL_ATTACK_MAP: Partial<Record<AttackType, string>> = {
  [AttackType.CLOSE_A]: '200',
  [AttackType.CLOSE_C]: '210',
  [AttackType.STAND_C]: '211',
  [AttackType.CLOSE_B]: '230',
  [AttackType.STAND_B]: '231',
  [AttackType.STAND_D]: '241',
  [AttackType.CLOSE_D]: '240',
  [AttackType.STAND_A]: '201',
  [AttackType.CROUCH_A]: '400',
  [AttackType.CROUCH_C]: '410',
  [AttackType.CROUCH_B]: '430',
  [AttackType.CROUCH_D]: '440',
  [AttackType.JUMP_A]: '600',
  [AttackType.JUMP_C]: '610',
  [AttackType.JUMP_B]: '630',
  [AttackType.JUMP_D]: '640',
  [AttackType.STAND_CD]: '300',
  [AttackType.JUMP_CD]: '600',
};

/**
 * Generic MUGEN action resolver for any character.
 * Uses standard MUGEN action numbers + per-character specialMap override.
 */
export function resolveGenericMugenAction(
  config: CharacterSpriteConfig,
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
): string | null {
  // WIN is special
  if (state === FighterState.WIN) return config.winAction ?? '181';

  // Standard state → action
  const standardAction = STANDARD_ACTIONS[state];
  if (standardAction) return standardAction;

  // Directional states
  const dirAction = resolveDirectionalAction(state, vx, facing);
  if (dirAction) return dirAction;

  // Attack states
  if (state === FighterState.STAND_ATTACK || state === FighterState.CROUCH_ATTACK ||
      state === FighterState.AIR_ATTACK) {
    if (attack) {
      // Check character-specific special/DM mapping first
      const special = config.specialMap[attack];
      if (special) return special;
      // Then standard normal attack mapping
      const normal = NORMAL_ATTACK_MAP[attack];
      if (normal) return normal;
    }
    // Fallback by state type
    if (state === FighterState.STAND_ATTACK) return '201';
    if (state === FighterState.CROUCH_ATTACK) return '400';
    if (state === FighterState.AIR_ATTACK) return '600';
  }

  return null;
}

// ===== Sprite loading =====
const loadedSprites = new Map<string, Map<string, SpriteImageFrame[]>>();

export function getLoadedSprites(charId: string): Map<string, SpriteImageFrame[]> | undefined {
  return loadedSprites.get(charId);
}

export async function loadCharacterSprites(config: CharacterSpriteConfig): Promise<Map<string, SpriteImageFrame[]>> {
  const existing = loadedSprites.get(config.charId);
  if (existing) return existing;

  const sprites = await loadRealSprites(
    `/sprites/${config.mugenDir}/manifest.json`,
    `/sprites/${config.mugenDir}`,
    config.charId,
  );

  loadedSprites.set(config.charId, sprites);
  return sprites;
}

// ===== Character Registry =====
const characterConfigs = new Map<string, CharacterSpriteConfig>();

export function registerCharacterSprites(config: CharacterSpriteConfig): void {
  characterConfigs.set(config.charId, config);
}

export function getCharacterConfig(charId: string): CharacterSpriteConfig | undefined {
  return characterConfigs.get(charId);
}

export function getAllRegisteredCharacters(): CharacterSpriteConfig[] {
  return Array.from(characterConfigs.values());
}
