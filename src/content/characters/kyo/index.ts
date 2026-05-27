/**
 * Kyo Content Package — Barrel export
 *
 * Single entry point for all Kyo content: attacks,
 * commands, animations, hitboxes, feedback, moves, portraits, and cancel paths.
 */

// Attack definitions (frame data)
export {
  KYO_ATTACK_KEYS,
  getKyoFrameData,
  getKyoAttackFrameData,
} from './attacks.js';

// Commands / move list
export {
  KYO_MOVE_LIST,
  KYO_WIN_QUOTES,
  KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from './commands.js';

// Hitbox / hurtbox data
export {
  KYO_HITBOX_KEYS,
  getKyoHitboxOffsets,
  KYO_ATTACK_FRAME_KEYS,
  getKyoAttackFrames,
} from './hitboxes.js';

// Feedback tier mappings
export {
  getKyoFeedbackTiers,
  getKyoFeedback,
  KYO_FEEDBACK_SUMMARY,
} from './feedback.js';

// Move / skill definitions (A/C/MAX versions)
export {
  KYO_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/kyoMoves.js';

// Animation metadata
export {
  KYO_ANIMATION_META,
  getKyoAnimationNames,
  getKyoAnimMeta,
  getKyoAttackAnimations,
  getKyoLoopAnimations,
  type AnimationMeta,
} from './animations.js';

// Portrait metadata
export {
  KYO_PORTRAIT_META,
  getKyoPortraitMeta,
  getKyoAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/kyoPortraits.js';

// Cancel paths (normal -> special -> DM routes)
export {
  KYO_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';
