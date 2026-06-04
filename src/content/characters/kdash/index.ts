/**
 * K' Content Package — Barrel export
 *
 * Single entry point for all K' content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  KDASH_MOVE_LIST,
  KDASH_WIN_QUOTES,
  KDASH_AVAILABLE_ACTIONS,
  type KdashMoveEntry,
} from './commands/kdashCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  KDASH_MOVES,
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
} from './moves/kdashMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  KDASH_CANCEL_PATHS,
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
  KDASH_ATTACK_KEYS,
  getKdashFrameData,
  getKdashAttackFrameData,
} from './attacks/kdashAttacks.js';

// Frame data (K'-specific specials + DM + SDM)
export { KDASH_FRAME_DATA } from './frameData/kdashFrameData.js';

// Feedback tier mappings
export {
  getKdashFeedbackTiers,
  getKdashFeedback,
  KDASH_FEEDBACK_SUMMARY,
} from './feedback/kdashFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  KDASH_HITBOX_KEYS,
  getKdashHitboxOffsets,
  KDASH_ATTACK_FRAME_KEYS,
  getKdashAttackFrames,
  KDASH_MUGEN_ACTION_MAP,
  hasKdashMugenData,
  getKdashMugenTiming,
  getKdashMugenActionSummary,
  getKdashAttackTiming,
} from './hitboxes/kdashHitboxes.js';

// Animation metadata
export {
  KDASH_ANIMATION_META,
  getKdashAnimationNames,
  getKdashAnimMeta,
  getKdashAttackAnimations,
  getKdashLoopAnimations,
  type AnimationMeta,
} from './animations/kdashAnimations.js';

// Portrait metadata
export {
  KDASH_PORTRAIT_META,
  getKdashPortraitMeta,
  getKdashAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/kdashPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { KDASH_HIT_EFFECTS } from './hitEffects/kdashHitEffects.js';

// Audio sampler registration
export { registerKdashAudio } from './audio/kdashSampler.js';
