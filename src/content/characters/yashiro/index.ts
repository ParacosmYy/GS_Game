/**
 * Yashiro Content Package — Barrel export
 *
 * Single entry point for all Yashiro content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  YASHIRO_MOVE_LIST,
  YASHIRO_WIN_QUOTES,
  YASHIRO_AVAILABLE_ACTIONS,
  type YashiroMoveEntry,
} from './commands/yashiroCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  YASHIRO_MOVES,
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
} from './moves/yashiroMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  YASHIRO_CANCEL_PATHS,
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
  YASHIRO_ATTACK_KEYS,
  getYashiroFrameData,
  getYashiroAttackFrameData,
} from './attacks/yashiroAttacks.js';

// Frame data (Yashiro-specific specials + DM + SDM)
export { YASHIRO_FRAME_DATA } from './frameData/yashiroFrameData.js';

// Feedback tier mappings
export {
  getYashiroFeedbackTiers,
  getYashiroFeedback,
  YASHIRO_FEEDBACK_SUMMARY,
} from './feedback/yashiroFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  YASHIRO_HITBOX_KEYS,
  getYashiroHitboxOffsets,
  YASHIRO_ATTACK_FRAME_KEYS,
  getYashiroAttackFrames,
  YASHIRO_MUGEN_ACTION_MAP,
  hasYashiroMugenData,
  getYashiroMugenTiming,
  getYashiroMugenActionSummary,
  getYashiroMugenActions,
  getYashiroAttackTiming,
} from './hitboxes/yashiroHitboxes.js';

// Animation metadata
export {
  YASHIRO_ANIMATION_META,
  getYashiroAnimationNames,
  getYashiroAnimMeta,
  getYashiroAttackAnimations,
  getYashiroLoopAnimations,
  type AnimationMeta,
} from './animations/yashiroAnimations.js';

// Portrait metadata
export {
  YASHIRO_PORTRAIT_META,
  getYashiroPortraitMeta,
  getYashiroAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/yashiroPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { YASHIRO_HIT_EFFECTS } from './hitEffects/yashiroHitEffects.js';

// Audio sampler registration
export { registerYashiroAudio } from './audio/yashiroSampler.js';
