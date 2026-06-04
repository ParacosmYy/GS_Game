/**
 * Mai Content Package — Barrel export
 *
 * Single entry point for all Mai content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  MAI_MOVE_LIST,
  MAI_WIN_QUOTES,
  MAI_AVAILABLE_ACTIONS,
  type MaiMoveEntry,
} from './commands/maiCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  MAI_MOVES,
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
} from './moves/maiMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  MAI_CANCEL_PATHS,
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
  MAI_ATTACK_KEYS,
  getMaiFrameData,
  getMaiAttackFrameData,
} from './attacks/maiAttacks.js';

// Frame data (Mai-specific specials + DM + SDM)
export { MAI_FRAME_DATA } from './frameData/maiFrameData.js';

// Feedback tier mappings
export {
  getMaiFeedbackTiers,
  getMaiFeedback,
  MAI_FEEDBACK_SUMMARY,
} from './feedback/maiFeedback.js';

// Hitbox / hurtbox data + MUGEN queries
export {
  MAI_HITBOX_KEYS,
  getMaiHitboxOffsets,
  MAI_ATTACK_FRAME_KEYS,
  getMaiAttackFrames,
  MAI_MUGEN_ACTION_MAP,
  hasMaiMugenData,
  getMaiMugenTiming,
  getMaiMugenActionSummary,
  getMaiAttackTiming,
} from './hitboxes/maiHitboxes.js';

// Animation metadata
export {
  MAI_ANIMATION_META,
  getMaiAnimationNames,
  getMaiAnimMeta,
  getMaiAttackAnimations,
  getMaiLoopAnimations,
  type AnimationMeta,
} from './animations/maiAnimations.js';

// Portrait metadata
export {
  MAI_PORTRAIT_META,
  getMaiPortraitMeta,
  getMaiAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/maiPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { MAI_HIT_EFFECTS } from './hitEffects/maiHitEffects.js';

// Audio sampler registration
export { registerMaiAudio } from './audio/maiSampler.js';
