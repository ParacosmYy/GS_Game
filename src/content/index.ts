/**
 * Content Package — Top-level barrel export
 *
 * The content package provides typed access to character data, manifests,
 * and completeness reports. Structure follows workspace-architecture-target.md.
 */
export * from './characters/index.js';
export {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
  type CharacterContent,
} from './contentLoader.js';
export {
  dispatchHitVFX,
  dispatchHitSFX,
  registerHitEffects,
  type HitEffectContext,
  type CharacterHitEffects,
} from './characterHitEffects.js';
export { initCharacterHitEffects } from './registerHitEffects.js';
