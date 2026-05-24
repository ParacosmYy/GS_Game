/**
 * Simplified input mode — one-button special moves for casual players
 * U = Special 1 (projectile / horizontal)  I = Special 2 (anti-air)  O = MAX activation
 */
import { AttackType } from '../core/types.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';

export interface SimplifiedResult {
  attack: AttackType | null;
  activateMax: boolean;
}

/** Per-character special move mapping for simplified U/I buttons */
const SPECIAL1: Record<string, AttackType> = {
  kyo: AttackType.KYO_ARAGAMI,
  iori: AttackType.IORI_YAMIBARAI,
  terry: AttackType.TERRY_POWER_WAVE,
  kim: AttackType.KIM_HANGETSU,
};

const SPECIAL2: Record<string, AttackType> = {
  kyo: AttackType.KYO_ONIYAKI_C,
  iori: AttackType.IORI_ONIYAKI_C,
  terry: AttackType.TERRY_BURN_KNUCKLE,
  kim: AttackType.KIM_HIENZAN,
};

/** Resolve simplified U/I/O input to a character-specific action */
export function resolveSimplified(
  uPressed: boolean,
  iPressed: boolean,
  oPressed: boolean,
  char: CharacterDefinition,
  gauges: PowerGauge,
  maxModes: MaxModeState,
): SimplifiedResult {
  if (oPressed && !maxModes.active && gauges.stocks >= 1) {
    return { attack: null, activateMax: true };
  }
  if (uPressed) {
    return { attack: SPECIAL1[char.id] || AttackType.SPECIAL_PROJECTILE, activateMax: false };
  }
  if (iPressed) {
    return { attack: SPECIAL2[char.id] || AttackType.SPECIAL_UPPER, activateMax: false };
  }
  return { attack: null, activateMax: false };
}
