/**
 * Clark Content Package — Barrel export
 *
 * Single entry point for all Clark content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  CLARK_MOVE_LIST,
  CLARK_WIN_QUOTES,
  CLARK_AVAILABLE_ACTIONS,
  type ClarkMoveEntry,
} from './commands/clarkCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  CLARK_MOVES,
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
} from './moves/clarkMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  CLARK_CANCEL_PATHS,
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
  CLARK_ATTACK_KEYS,
  getClarkFrameData,
  getClarkAttackFrameData,
} from './attacks/clarkAttacks.js';

// Frame data (Clark-specific specials + DM + SDM)
export { CLARK_FRAME_DATA } from './frameData/clarkFrameData.js';

// Feedback tier mappings
export {
  getClarkFeedbackTiers,
  getClarkFeedback,
  CLARK_FEEDBACK_SUMMARY,
} from './feedback/clarkFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  CLARK_HITBOX_KEYS,
  getClarkHitboxOffsets,
  CLARK_ATTACK_FRAME_KEYS,
  getClarkAttackFrames,
  CLARK_MUGEN_ACTION_MAP,
  hasClarkMugenData,
  getClarkMugenTiming,
  getClarkMugenActionSummary,
  getClarkAttackTiming,
} from './hitboxes/clarkHitboxes.js';

// Animation metadata
export {
  CLARK_ANIMATION_META,
  getClarkAnimationNames,
  getClarkAnimMeta,
  getClarkAttackAnimations,
  getClarkLoopAnimations,
  type AnimationMeta,
} from './animations/clarkAnimations.js';

// Portrait metadata
export {
  CLARK_PORTRAIT_META,
  getClarkPortraitMeta,
  getClarkAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/clarkPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { CLARK_HIT_EFFECTS } from './hitEffects/clarkHitEffects.js';

// Audio sampler registration
export { registerClarkAudio } from './audio/clarkSampler.js';
