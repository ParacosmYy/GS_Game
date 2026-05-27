/**
 * Iori Content Package — Barrel export
 *
 * Single entry point for all Iori content: attacks,
 * commands, animations, hitboxes, feedback, moves, portraits, and cancel paths.
 */

// Attack definitions (frame data)
export {
  IORI_ATTACK_KEYS,
  getIoriFrameData,
  getIoriAttackFrameData,
} from './attacks.js';

// Commands / move list
export {
  IORI_MOVE_LIST,
  IORI_WIN_QUOTES,
  IORI_AVAILABLE_ACTIONS,
  type IoriMoveEntry,
} from './commands.js';

// Hitbox / hurtbox data
export {
  IORI_HITBOX_KEYS,
  getIoriHitboxOffsets,
  IORI_ATTACK_FRAME_KEYS,
  getIoriAttackFrames,
} from './hitboxes.js';

// Feedback tier mappings
export {
  getIoriFeedbackTiers,
  getIoriFeedback,
  IORI_FEEDBACK_SUMMARY,
} from './feedback.js';

// Move / skill definitions (A/C/MAX versions)
export {
  IORI_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/ioriMoves.js';

// Animation metadata
export {
  IORI_ANIMATION_META,
  getIoriAnimationNames,
  getIoriAnimMeta,
  getIoriAttackAnimations,
  getIoriLoopAnimations,
  type AnimationMeta,
} from './animations.js';

// Portrait metadata
export {
  IORI_PORTRAIT_META,
  getIoriPortraitMeta,
  getIoriAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/ioriPortraits.js';

// Cancel paths (normal -> special -> DM routes)
export {
  IORI_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Frame Contract (per-frame collision data + cancel windows)
export {
  IORI_ACTION_CONTRACTS,
  getIoriFrameContractManifest,
} from '../../../core/ioriFrameContract.js';
