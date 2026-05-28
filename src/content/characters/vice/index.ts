/**
 * Vice Content Package — Barrel export
 *
 * Single entry point for all Vice content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  VICE_MOVE_LIST,
  VICE_WIN_QUOTES,
  VICE_AVAILABLE_ACTIONS,
  type ViceMoveEntry,
} from './commands/viceCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  VICE_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getGrabMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/viceMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  VICE_CANCEL_PATHS,
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
  VICE_ATTACK_KEYS,
  getViceFrameData,
  getViceAttackFrameData,
} from './attacks/viceAttacks.js';

// Frame data (Vice-specific specials + DM + SDM)
export { VICE_FRAME_DATA } from './frameData/viceFrameData.js';

// Feedback tier mappings
export {
  getViceFeedbackTiers,
  getViceFeedback,
  VICE_FEEDBACK_SUMMARY,
} from './feedback/viceFeedback.js';

// Hitbox / hurtbox data
export {
  VICE_HITBOX_KEYS,
  getViceHitboxOffsets,
  VICE_ATTACK_FRAME_KEYS,
  getViceAttackFrames,
} from './hitboxes/viceHitboxes.js';

// Animation metadata
export {
  VICE_ANIMATION_META,
  getViceAnimationNames,
  getViceAnimMeta,
  getViceAttackAnimations,
  getViceLoopAnimations,
  type AnimationMeta,
} from './animations/viceAnimations.js';

// Portrait metadata
export {
  VICE_PORTRAIT_META,
  getVicePortraitMeta,
  getViceAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/vicePortraits.js';

// Hit Effects (VFX/SFX plugin)
export { VICE_HIT_EFFECTS } from './hitEffects/viceHitEffects.js';

// Audio sampler registration
export { registerViceAudio } from './audio/viceSampler.js';
