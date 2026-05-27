/**
 * Character Hit Effects Registry — Plugin system for character-specific VFX/SFX
 *
 * Each character content package registers hit effect handlers.
 * hitCallback dispatches through this registry instead of hard-coding branches.
 * New characters only need to register — no changes to hitCallback required.
 */

import type { AttackType } from '../core/types.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { Fighter } from '../entities/fighter.js';
import type { CinematicState } from '../state/cinematicState.js';

/** Dependencies passed to each hit effect handler */
export interface HitEffectContext {
  vfx: VFXSystem;
  screenShake: ScreenShake;
  screenFlash: ScreenFlash;
  cinematic: CinematicState;
  attacker: Fighter;
  defender: Fighter;
  attackType: AttackType;
  hitX: number;
  hitY: number;
  counterHit: boolean;
  combo: number;
  /** Direction bias helper */
  attackDirectionBias: number;
  /** Defender player index (0 or 1) for cinematic.addHitStop */
  defIdx: number;
}

/** A single hit effect handler — returns true if it handled the attack */
export type HitEffectHandler = (ctx: HitEffectContext) => boolean;

/** Character hit effect plugin */
export interface CharacterHitEffects {
  /** Character ID this plugin handles */
  charId: string;
  /** Attack name prefixes this plugin handles (e.g. ['RYO_', 'DM_TEN']) */
  prefixes: string[];
  /** Main VFX dispatch handler */
  onHitVFX: HitEffectHandler;
  /** SFX dispatch handler */
  onHitSFX: HitEffectHandler;
}

// ===== Registry =====

const registry: CharacterHitEffects[] = [];

/** Register a character's hit effects plugin */
export function registerHitEffects(effects: CharacterHitEffects): void {
  const existing = registry.findIndex(e => e.charId === effects.charId);
  if (existing >= 0) registry[existing] = effects;
  else registry.push(effects);
}

/** Find the hit effects plugin for a given attack name */
function findPlugin(atkName: string): CharacterHitEffects | undefined {
  return registry.find(p => p.prefixes.some(pre => atkName.startsWith(pre)));
}

/** Dispatch VFX for a given hit — returns true if a plugin handled it */
export function dispatchHitVFX(ctx: HitEffectContext): boolean {
  const plugin = findPlugin(ctx.attackType as string);
  if (plugin) return plugin.onHitVFX(ctx);
  return false;
}

/** Dispatch SFX for a given hit — returns true if a plugin handled it */
export function dispatchHitSFX(ctx: HitEffectContext): boolean {
  const plugin = findPlugin(ctx.attackType as string);
  if (plugin) return plugin.onHitSFX(ctx);
  return false;
}

/** Get all registered character IDs */
export function getRegisteredEffectIds(): string[] {
  return registry.map(e => e.charId);
}
