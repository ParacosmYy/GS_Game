/**
 * Kim Content Package — Barrel export
 *
 * Single entry point for all Kim content: commands,
 * moves, cancel paths, hit effects, audio sampler,
 * attacks, frame data, feedback, hitboxes, animations, and portraits.
 */

// Commands / move list
export {
  KIM_MOVE_LIST,
  KIM_WIN_QUOTES,
  KIM_AVAILABLE_ACTIONS,
  type KimMoveEntry,
} from './commands/kimCommands.js';

// Move / skill definitions (B/D/MAX versions)
export {
  KIM_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/kimMoves.js';

// Cancel paths (normal -> special -> DM routes, Sanren rekka)
export {
  KIM_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Hit Effects (VFX/SFX plugin)
export { KIM_HIT_EFFECTS } from './hitEffects/kimHitEffects.js';

// Audio sampler registration
export { registerKimAudio } from './audio/kimSampler.js';

// Attack definitions (attack key list + frame data lookup)
export {
  KIM_ATTACK_KEYS,
  getKimFrameData,
  getKimAttackFrameData,
} from './attacks/kimAttacks.js';

// Frame data (Kim-specific special/DM frame data)
export { KIM_FRAME_DATA } from './frameData/kimFrameData.js';

// Feedback tier mappings (light/heavy/special/dm/sdm/hsdm)
export {
  getKimFeedbackTiers,
  getKimFeedback,
  KIM_FEEDBACK_SUMMARY,
} from './feedback/kimFeedback.js';

// Hitbox / hurtbox data (offsets + per-frame attack boxes + MUGEN queries)
export {
  KIM_HITBOX_KEYS,
  getKimHitboxOffsets,
  KIM_ATTACK_FRAME_KEYS,
  getKimAttackFrames,
  KIM_MUGEN_ACTION_MAP,
  hasKimMugenData,
  getKimMugenTiming,
  getKimMugenActionSummary,
  getKimAttackTiming,
} from './hitboxes/kimHitboxes.js';

// Animation metadata (action list, frame counts, loops, transitions)
export {
  KIM_ANIMATION_META,
  getKimAnimationNames,
  getKimAnimMeta,
  getKimAttackAnimations,
  getKimLoopAnimations,
  type AnimationMeta,
} from './animations/kimAnimations.js';

// Portrait metadata (sizes, colors, poses)
export {
  KIM_PORTRAIT_META,
  getKimPortraitMeta,
  getKimAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/kimPortraits.js';
