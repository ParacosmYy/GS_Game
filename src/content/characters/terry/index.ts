/**
 * Terry Content Package — Barrel export
 *
 * Single entry point for all Terry content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  TERRY_MOVE_LIST,
  TERRY_WIN_QUOTES,
  TERRY_AVAILABLE_ACTIONS,
  type TerryMoveEntry,
} from './commands/terryCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  TERRY_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/terryMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  TERRY_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Attack definitions (frame data lookup)
export {
  TERRY_ATTACK_KEYS,
  getTerryFrameData,
  getTerryAttackFrameData,
} from './attacks/terryAttacks.js';

// Frame data (Terry-specific specials + DM + SDM)
export { TERRY_FRAME_DATA } from './frameData/terryFrameData.js';

// Feedback tier mappings
export {
  getTerryFeedbackTiers,
  getTerryFeedback,
  TERRY_FEEDBACK_SUMMARY,
} from './feedback/terryFeedback.js';

// Hitbox / hurtbox data
export {
  TERRY_HITBOX_KEYS,
  getTerryHitboxOffsets,
  TERRY_ATTACK_FRAME_KEYS,
  getTerryAttackFrames,
} from './hitboxes/terryHitboxes.js';

// Animation metadata
export {
  TERRY_ANIMATION_META,
  getTerryAnimationNames,
  getTerryAnimMeta,
  getTerryAttackAnimations,
  getTerryLoopAnimations,
  type AnimationMeta,
} from './animations/terryAnimations.js';

// Portrait metadata
export {
  TERRY_PORTRAIT_META,
  getTerryPortraitMeta,
  getTerryAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/terryPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { TERRY_HIT_EFFECTS } from './hitEffects/terryHitEffects.js';

// Audio sampler registration
export { registerTerryAudio } from './audio/terrySampler.js';
