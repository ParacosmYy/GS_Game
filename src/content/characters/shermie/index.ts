/**
 * Shermie Content Package — Barrel export
 *
 * Single entry point for all Shermie content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  SHERMIE_MOVE_LIST,
  SHERMIE_WIN_QUOTES,
  SHERMIE_AVAILABLE_ACTIONS,
  type ShermieMoveEntry,
} from './commands/shermieCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  SHERMIE_MOVES,
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
} from './moves/shermieMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  SHERMIE_CANCEL_PATHS,
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
  SHERMIE_ATTACK_KEYS,
  getShermieFrameData,
  getShermieAttackFrameData,
} from './attacks/shermieAttacks.js';

// Frame data (Shermie-specific specials + DM + SDM)
export { SHERMIE_FRAME_DATA } from './frameData/shermieFrameData.js';

// Feedback tier mappings
export {
  getShermieFeedbackTiers,
  getShermieFeedback,
  SHERMIE_FEEDBACK_SUMMARY,
} from './feedback/shermieFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  SHERMIE_HITBOX_KEYS,
  getShermieHitboxOffsets,
  SHERMIE_ATTACK_FRAME_KEYS,
  getShermieAttackFrames,
  SHERMIE_MUGEN_ACTION_MAP,
  hasShermieMugenData,
  getShermieMugenTiming,
  getShermieMugenActionSummary,
  getShermieAttackTiming,
} from './hitboxes/shermieHitboxes.js';

// Animation metadata
export {
  SHERMIE_ANIMATION_META,
  getShermieAnimationNames,
  getShermieAnimMeta,
  getShermieAttackAnimations,
  getShermieLoopAnimations,
  type AnimationMeta,
} from './animations/shermieAnimations.js';

// Portrait metadata
export {
  SHERMIE_PORTRAIT_META,
  getShermiePortraitMeta,
  getShermieAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/shermiePortraits.js';

// Hit Effects (VFX/SFX plugin)
export { SHERMIE_HIT_EFFECTS } from './hitEffects/shermieHitEffects.js';

// Audio sampler registration
export { registerShermieAudio } from './audio/shermieSampler.js';
