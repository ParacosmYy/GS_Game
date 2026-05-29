/**
 * Heidern Content Package — Barrel export
 *
 * Single entry point for all Heidern content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  HEIDERN_MOVE_LIST,
  HEIDERN_WIN_QUOTES,
  HEIDERN_AVAILABLE_ACTIONS,
  type HeidernMoveEntry,
} from './commands/heidernCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  HEIDERN_MOVES,
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
} from './moves/heidernMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  HEIDERN_CANCEL_PATHS,
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
  HEIDERN_ATTACK_KEYS,
  getHeidernFrameData,
  getHeidernAttackFrameData,
} from './attacks/heidernAttacks.js';

// Frame data (Heidern-specific specials + DM + SDM + HSDM)
export { HEIDERN_FRAME_DATA } from './frameData/heidernFrameData.js';

// Feedback tier mappings
export {
  getHeidernFeedbackTiers,
  getHeidernFeedback,
  HEIDERN_FEEDBACK_SUMMARY,
} from './feedback/heidernFeedback.js';

// Hitbox / hurtbox data
export {
  HEIDERN_HITBOX_KEYS,
  getHeidernHitboxOffsets,
  HEIDERN_ATTACK_FRAME_KEYS,
  getHeidernAttackFrames,
  HEIDERN_MUGEN_ACTION_MAP,
  hasHeidernMugenData,
  getHeidernMugenTiming,
  getHeidernMugenActionSummary,
  getHeidernMugenActions,
  getHeidernAttackTiming,
} from './hitboxes/heidernHitboxes.js';

// Animation metadata
export {
  HEIDERN_ANIMATION_META,
  getHeidernAnimationNames,
  getHeidernAnimMeta,
  getHeidernAttackAnimations,
  getHeidernLoopAnimations,
  type AnimationMeta,
} from './animations/heidernAnimations.js';

// Portrait metadata
export {
  HEIDERN_PORTRAIT_META,
  getHeidernPortraitMeta,
  getHeidernAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/heidernPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { HEIDERN_HIT_EFFECTS } from './hitEffects/heidernHitEffects.js';

// Audio sampler registration
export { registerHeidernAudio } from './audio/heidernSampler.js';
