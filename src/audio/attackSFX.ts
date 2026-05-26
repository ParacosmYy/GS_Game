/**
 * Per-frame SFX dispatch system — KOF2002 authentic attack sound layering
 *
 * In KOF2002, sounds play at specific frames within each attack phase:
 * - whoosh/swish on startup frame 0 (wind-up)
 * - impact on active frame 0 (hit frame)
 * - landing/finish on recovery frame 0 or later
 *
 * This module tracks the fighter's (phase, frame) tuple and fires the
 * correct SFX exactly once per (attackType, phase, frame) combination.
 */
import type { Fighter } from '../entities/fighter.js';
import type { AttackPhase } from '../core/types.js';

// ===== SFX Table Entry =====

export interface AttackSFXEntry {
  /** AttackType value, or '*' for universal (matches any attack) */
  attackType: string;
  /** Which attack phase this SFX triggers in */
  phase: AttackPhase;
  /** 0-based frame index within that phase */
  frame: number;
  /** Sampler function name (must exist on the sampler object) */
  sfx: string;
  /** Higher priority = plays instead of lower-priority entries at same frame */
  priority: number;
}

// ===== SFX Table =====
// Order: specific entries first, universal wildcard '*' last.
// At dispatch time, the most specific match wins (exact type > prefix > '*').

export const ATTACK_SFX_TABLE: AttackSFXEntry[] = [
  // ── Ryo specials ──
  { attackType: 'RYO_KOOU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_KOOU', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'RYO_KOOU_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_KOOU_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'RYO_KO_HOU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_KO_HOU', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'RYO_KO_HOU_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_KO_HOU_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'RYO_HIEN', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_HIEN', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'RYO_HAOU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'RYO_HAOU', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },

  // ── Ryo DM ──
  { attackType: 'DM_TEN_HA_OU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'DM_TEN_HA_OU', phase: 'startup', frame: 6, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'DM_TEN_HA_OU', phase: 'active', frame: 0, sfx: 'playDM', priority: 4 },

  // ── Kyo specials ──
  { attackType: 'KYO_ONIYAKI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_ONIYAKI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_ONIYAKI_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_ONIYAKI_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'KYO_YAMIBARAI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_YAMIBARAI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_YAMIBARAI_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_YAMIBARAI_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_RED_KICK', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_RED_KICK', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_75KAI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_75KAI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_ARAGAMI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_ARAGAMI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KYO_DOKUGAMI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KYO_DOKUGAMI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },

  // ── Kyo DM ──
  { attackType: 'DM_OROCHINAGI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'DM_OROCHINAGI', phase: 'startup', frame: 8, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'DM_OROCHINAGI', phase: 'active', frame: 0, sfx: 'playDM', priority: 4 },

  // ── Iori specials ──
  { attackType: 'IORI_AOIHANA', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_AOIHANA', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'IORI_ONIYAKI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_ONIYAKI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'IORI_ONIYAKI_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_ONIYAKI_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'IORI_YAMIBARAI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_YAMIBARAI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'IORI_YAMIBARAI_C', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_YAMIBARAI_C', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'IORI_KOTOTSUKI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_KOTOTSUKI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'IORI_KUZUKAZE', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'IORI_KUZUKAZE', phase: 'active', frame: 0, sfx: 'playThrow', priority: 3 },

  // ── Iori DM ──
  { attackType: 'DM_YATAGARASU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'DM_YATAGARASU', phase: 'startup', frame: 8, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'DM_YATAGARASU', phase: 'active', frame: 0, sfx: 'playDM', priority: 4 },

  // ── Terry specials ──
  { attackType: 'TERRY_POWER_WAVE', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'TERRY_POWER_WAVE', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'TERRY_BURN_KNUCKLE', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'TERRY_BURN_KNUCKLE', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'TERRY_CRACK_SHOT', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'TERRY_CRACK_SHOT', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'TERRY_POWER_DUNK', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'TERRY_POWER_DUNK', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'TERRY_RISING_TACKLE', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'TERRY_RISING_TACKLE', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },

  // ── Terry DM ──
  { attackType: 'DM_POWER_GEYSER', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'DM_POWER_GEYSER', phase: 'startup', frame: 6, sfx: 'playSpecialHeavy', priority: 3 },
  { attackType: 'DM_POWER_GEYSER', phase: 'active', frame: 0, sfx: 'playDM', priority: 4 },

  // ── Kim specials ──
  { attackType: 'KIM_HIENZAN', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KIM_HIENZAN', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KIM_HANGETSU', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KIM_HANGETSU', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },
  { attackType: 'KIM_HAKI', phase: 'startup', frame: 0, sfx: 'playSpecialLight', priority: 2 },
  { attackType: 'KIM_HAKI', phase: 'active', frame: 0, sfx: 'playSpecialHeavy', priority: 2 },

  // ── Universal wildcard (lowest priority, matches any attack) ──
  { attackType: '*', phase: 'active', frame: 0, sfx: 'playHit', priority: 1 },
];

// ===== Played tracker =====
// Maps "attackType:phase:frame" -> true, to ensure once-only playback.
// Reset when a new attack starts.

const playedSet = new Map<number, Set<string>>();
const lastAttackType = new Map<number, string | null>();

/** Get or create the played set for a given fighter (by identity index) */
function getPlayedSet(fighterId: number): Set<string> {
  if (!playedSet.has(fighterId)) {
    playedSet.set(fighterId, new Set());
  }
  return playedSet.get(fighterId)!;
}

/** Build the dispatch key for deduplication */
function dispatchKey(attackType: string, phase: AttackPhase, frame: number): string {
  return `${attackType}:${phase}:${frame}`;
}

// ===== Main dispatch function =====

/**
 * Tick the per-frame SFX dispatch for a single fighter.
 * Call AFTER fighter.tickAttack() in the game loop so attackFrame is current.
 *
 * @param fighter   The fighter to check
 * @param sampler   An object with sampler play functions (e.g., { playHit, playSpecialLight, ... })
 * @param fighterId Unique identity index for this fighter (0 = P1, 1 = P2)
 */
export function tickAttackSFX(fighter: Fighter, sampler: Record<string, (...args: any[]) => void>, fighterId: number): void {
  // No attack active — nothing to dispatch
  if (!fighter.currentAttack) return;
  if (fighter.attackPhase === 'none') return;

  const attackType = fighter.currentAttack as string;
  const phase = fighter.attackPhase;
  const frame = fighter.attackFrame;

  const played = getPlayedSet(fighterId);

  // Detect new attack: track the last attackType per fighter.
  // When it changes (including null -> attack), clear the played set.
  const prev = lastAttackType.get(fighterId) ?? null;
  if (attackType !== prev) {
    played.clear();
    lastAttackType.set(fighterId, attackType);
  }

  // Find matching entries: exact match > wildcard
  const candidates: AttackSFXEntry[] = [];

  for (const entry of ATTACK_SFX_TABLE) {
    // Phase and frame must match exactly
    if (entry.phase !== phase || entry.frame !== frame) continue;

    // AttackType matching: exact string or wildcard '*'
    if (entry.attackType === attackType || entry.attackType === '*') {
      candidates.push(entry);
    }
  }

  // Among candidates, pick the highest-priority entry.
  // Only one SFX fires per (phase, frame) — specific entries suppress wildcards.
  if (candidates.length === 0) return;

  // Sort by priority descending
  candidates.sort((a, b) => b.priority - a.priority);

  // Use phase:frame as the dedup key (not attackType-specific) so that
  // specific entries suppress wildcard entries at the same frame.
  const frameKey = `${phase}:${frame}`;
  if (played.has(frameKey)) return;

  // Mark this (phase, frame) as played
  played.add(frameKey);

  // Dispatch the highest-priority SFX
  const entry = candidates[0];
  const fn = sampler[entry.sfx];
  if (typeof fn === 'function') {
    fn();
  }
}

/** Reset the played tracking for a fighter (useful on round reset, etc.) */
export function resetAttackSFXTracking(fighterId: number): void {
  const set = playedSet.get(fighterId);
  if (set) set.clear();
}

/** Reset all played tracking */
export function resetAllAttackSFXTracking(): void {
  playedSet.clear();
  lastAttackType.clear();
}

// ===== Testing helpers =====

/** Check if a specific (phase, frame) has been played (for test assertions) */
export function hasBeenPlayed(fighterId: number, _attackType: string, phase: AttackPhase, frame: number): boolean {
  const set = playedSet.get(fighterId);
  if (!set) return false;
  return set.has(`${phase}:${frame}`);
}
