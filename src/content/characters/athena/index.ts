/**
 * Athena Content Package — Barrel export
 *
 * Single entry point for all Athena content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  ATHENA_MOVE_LIST,
  ATHENA_WIN_QUOTES,
  ATHENA_AVAILABLE_ACTIONS,
  type AthenaMoveEntry,
} from './commands/athenaCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  ATHENA_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/athenaMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  ATHENA_CANCEL_PATHS,
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
  ATHENA_ATTACK_KEYS,
  getAthenaFrameData,
  getAthenaAttackFrameData,
} from './attacks/athenaAttacks.js';

// Frame data (Athena-specific specials + DM + SDM)
export { ATHENA_FRAME_DATA } from './frameData/athenaFrameData.js';

// Feedback tier mappings
export {
  getAthenaFeedbackTiers,
  getAthenaFeedback,
  ATHENA_FEEDBACK_SUMMARY,
} from './feedback/athenaFeedback.js';

// Hitbox / hurtbox data
export {
  ATHENA_HITBOX_KEYS,
  getAthenaHitboxOffsets,
  ATHENA_ATTACK_FRAME_KEYS,
  getAthenaAttackFrames,
  ATHENA_MUGEN_ACTION_MAP,
  hasAthenaMugenData,
  getAthenaMugenTiming,
  getAthenaMugenActionSummary,
  getAthenaMugenActions,
  getAthenaAttackTiming,
} from './hitboxes/athenaHitboxes.js';

// Animation metadata
export {
  ATHENA_ANIMATION_META,
  getAthenaAnimationNames,
  getAthenaAnimMeta,
  getAthenaAttackAnimations,
  getAthenaLoopAnimations,
  type AnimationMeta,
} from './animations/athenaAnimations.js';

// Portrait metadata
export {
  ATHENA_PORTRAIT_META,
  getAthenaPortraitMeta,
  getAthenaAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/athenaPortraits.js';

export {
  generateAthenaMugenActionReport,
  type AthenaMugenActionReport,
} from './reports/athenaReports.js';

// Hit Effects (VFX/SFX plugin)
export { ATHENA_HIT_EFFECTS } from './hitEffects/athenaHitEffects.js';

// Audio sampler registration
export { registerAthenaAudio } from './audio/athenaSampler.js';
