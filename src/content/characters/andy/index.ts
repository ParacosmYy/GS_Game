/**
 * Andy Content Package — Barrel export
 *
 * Single entry point for all Andy content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  ANDY_MOVE_LIST,
  ANDY_WIN_QUOTES,
  ANDY_AVAILABLE_ACTIONS,
  type AndyMoveEntry,
} from './commands/andyCommands.js';

// Move / skill definitions (A/C/D/B versions)
export {
  ANDY_MOVES,
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
} from './moves/andyMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  ANDY_CANCEL_PATHS,
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
  ANDY_ATTACK_KEYS,
  getAndyFrameData,
  getAndyAttackFrameData,
} from './attacks/andyAttacks.js';

// Frame data (Andy-specific specials + DM)
export { ANDY_FRAME_DATA } from './frameData/andyFrameData.js';

// Feedback tier mappings
export {
  getAndyFeedbackTiers,
  getAndyFeedback,
  ANDY_FEEDBACK_SUMMARY,
} from './feedback/andyFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  ANDY_HITBOX_KEYS,
  getAndyHitboxOffsets,
  ANDY_ATTACK_FRAME_KEYS,
  getAndyAttackFrames,
  ANDY_MUGEN_ACTION_MAP,
  hasAndyMugenData,
  getAndyMugenTiming,
  getAndyMugenActionSummary,
  getAndyAttackTiming,
} from './hitboxes/andyHitboxes.js';

// Animation metadata
export {
  ANDY_ANIMATION_META,
  getAndyAnimationNames,
  getAndyAnimMeta,
  getAndyAttackAnimations,
  getAndyLoopAnimations,
  type AnimationMeta,
} from './animations/andyAnimations.js';

// Portrait metadata
export {
  ANDY_PORTRAIT_META,
  getAndyPortraitMeta,
  getAndyAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/andyPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { ANDY_HIT_EFFECTS } from './hitEffects/andyHitEffects.js';

// Audio sampler registration
export { registerAndyAudio } from './audio/andySampler.js';
