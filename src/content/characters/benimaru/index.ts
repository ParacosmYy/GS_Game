/**
 * Benimaru Content Package — Barrel export
 *
 * Single entry point for all Benimaru content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 */

// Commands / move list
export {
  BENIMARU_MOVE_LIST,
  BENIMARU_WIN_QUOTES,
  BENIMARU_AVAILABLE_ACTIONS,
  type BenimaruMoveEntry,
} from './commands/benimaruCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  BENIMARU_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/benimaruMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  BENIMARU_CANCEL_PATHS,
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
  BENIMARU_ATTACK_KEYS,
  getBenimaruFrameData,
  getBenimaruAttackFrameData,
} from './attacks/benimaruAttacks.js';

// Frame data (Benimaru-specific specials + DM + SDM)
export { BENIMARU_FRAME_DATA } from './frameData/benimaruFrameData.js';

// Feedback tier mappings
export {
  getBenimaruFeedbackTiers,
  getBenimaruFeedback,
  BENIMARU_FEEDBACK_SUMMARY,
} from './feedback/benimaruFeedback.js';

// Hitbox / hurtbox data
export {
  BENIMARU_HITBOX_KEYS,
  getBenimaruHitboxOffsets,
  BENIMARU_ATTACK_FRAME_KEYS,
  getBenimaruAttackFrames,
  BENIMARU_MUGEN_ACTION_MAP,
  hasBenimaruMugenData,
  getBenimaruMugenTiming,
  getBenimaruMugenActionSummary,
  getBenimaruAttackTiming,
} from './hitboxes/benimaruHitboxes.js';

// Animation metadata
export {
  BENIMARU_ANIMATION_META,
  getBenimaruAnimationNames,
  getBenimaruAnimMeta,
  getBenimaruAttackAnimations,
  getBenimaruLoopAnimations,
  type AnimationMeta,
} from './animations/benimaruAnimations.js';

// Portrait metadata
export {
  BENIMARU_PORTRAIT_META,
  getBenimaruPortraitMeta,
  getBenimaruAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/benimaruPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { BENIMARU_HIT_EFFECTS } from './hitEffects/benimaruHitEffects.js';

// Audio sampler registration
export { registerBenimaruAudio } from './audio/benimaruSampler.js';
