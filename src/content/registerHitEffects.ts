/**
 * Auto-register all character hit effects plugins
 *
 * Call once at app startup. After this, hitCallback can dispatch
 * through the registry without knowing individual characters.
 */

import { registerHitEffects } from './characterHitEffects.js';
import { RYO_HIT_EFFECTS } from './characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from './characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from './characters/iori/hitEffects/ioriHitEffects.js';
import { TERRY_HIT_EFFECTS } from './characters/terry/hitEffects/terryHitEffects.js';
import { KIM_HIT_EFFECTS } from './characters/kim/hitEffects/kimHitEffects.js';

export function initCharacterHitEffects(): void {
  registerHitEffects(RYO_HIT_EFFECTS);
  registerHitEffects(KYO_HIT_EFFECTS);
  registerHitEffects(IORI_HIT_EFFECTS);
  registerHitEffects(TERRY_HIT_EFFECTS);
  registerHitEffects(KIM_HIT_EFFECTS);
}
