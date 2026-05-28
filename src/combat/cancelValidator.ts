/**
 * Unified Cancel Validator — runtime bridge between cancel path definitions and combat system.
 *
 * Wraps per-character cancel path APIs into a single validateCancel() call
 * that stateHandlers can use without knowing which character's paths to consult.
 */
import { AttackType } from '../core/types.js';
import {
  findCancelRoute as findRyoCancelRoute,
  validateCancel as validateRyoCancel,
} from '../content/characters/ryo/cancelPaths.js';
import {
  findCancelRoute as findKyoCancelRoute,
  validateCancel as validateKyoCancel,
} from '../content/characters/kyo/cancelPaths.js';
import {
  findCancelRoute as findIoriCancelRoute,
  validateCancel as validateIoriCancel,
} from '../content/characters/iori/cancelPaths.js';
import {
  findCancelRoute as findTerryCancelRoute,
  validateCancel as validateTerryCancel,
} from '../content/characters/terry/cancelPaths.js';
import {
  findCancelRoute as findKimCancelRoute,
  validateCancel as validateKimCancel,
} from '../content/characters/kim/cancelPaths.js';

type CharId = 'ryo' | 'kyo' | 'iori' | 'terry' | 'kim';

const VALIDATORS: Record<CharId, {
  find: (source: string, target: string) => unknown;
  validate: (source: string, target: string, hitConfirmed: boolean, stocks: number, maxModeActive: boolean, maxModeTimer: number, maxModeDuration: number, framesSinceHit: number) => { valid: boolean; reason?: string };
}> = {
  ryo: { find: findRyoCancelRoute, validate: validateRyoCancel },
  kyo: { find: findKyoCancelRoute, validate: validateKyoCancel },
  iori: { find: findIoriCancelRoute, validate: validateIoriCancel },
  terry: { find: findTerryCancelRoute, validate: validateTerryCancel },
  kim: { find: findKimCancelRoute, validate: validateKimCancel },
};

/** Detect character from attack type prefix. */
function charFromAttack(atk: string): CharId | null {
  if (atk.startsWith('RYO_')) return 'ryo';
  if (atk.startsWith('KYO_')) return 'kyo';
  if (atk.startsWith('IORI_')) return 'iori';
  if (atk.startsWith('TERRY_')) return 'terry';
  if (atk.startsWith('KIM_')) return 'kim';
  return null;
}

/** Detect character from character definition ID. Falls back to attack prefix. */
function resolveCharId(characterId: string | undefined, fallbackAttack: string): CharId | null {
  if (characterId) {
    const lower = characterId.toLowerCase();
    if (lower in VALIDATORS) return lower as CharId;
  }
  return charFromAttack(fallbackAttack);
}

export interface CancelCheckResult {
  valid: boolean;
  reason?: string;
}

/**
 * Check if a cancel from source to target is valid for the given character.
 *
 * Returns { valid: true } if the cancel path exists and all conditions are met,
 * or { valid: false, reason } explaining why not.
 */
export function checkCancelValid(
  characterId: string | undefined,
  source: AttackType | string,
  target: AttackType | string,
  opts: {
    hitConfirmed: boolean;
    stocks: number;
    maxModeActive: boolean;
    maxModeTimer: number;
    maxModeDuration: number;
    framesSinceHit: number;
  },
): CancelCheckResult {
  const src = typeof source === 'string' ? source : (source as string);
  const tgt = typeof target === 'string' ? target : (target as string);

  const char = resolveCharId(characterId, src);
  if (!char) {
    return { valid: false, reason: `unknown character for attack: ${src}` };
  }
  const v = VALIDATORS[char];
  const route = v.find(src, tgt);
  if (!route) {
    return { valid: false, reason: `no cancel path: ${src} → ${tgt}` };
  }
  return v.validate(
    src, tgt,
    opts.hitConfirmed,
    opts.stocks,
    opts.maxModeActive,
    opts.maxModeTimer,
    opts.maxModeDuration,
    opts.framesSinceHit,
  );
}

/**
 * Quick check: does a cancel path exist from source to target?
 * Lightweight — no game state validation.
 */
export function cancelPathExists(
  characterId: string | undefined,
  source: AttackType | string,
  target: AttackType | string,
): boolean {
  const src = typeof source === 'string' ? source : (source as string);
  const tgt = typeof target === 'string' ? target : (target as string);
  const char = resolveCharId(characterId, src);
  if (!char) return false;
  return VALIDATORS[char].find(src, tgt) != null;
}
