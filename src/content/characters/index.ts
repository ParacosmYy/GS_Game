/**
 * Character Content Packages — Barrel export
 */
export * from './ryo/index.js';

// Kyo content package — use named re-exports to avoid type name collisions with Ryo
export {
  KYO_ATTACK_KEYS,
  getKyoFrameData,
  getKyoAttackFrameData,
} from './kyo/attacks.js';

export {
  KYO_MOVE_LIST,
  KYO_WIN_QUOTES,
  KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from './kyo/commands.js';

export {
  KYO_HITBOX_KEYS,
  getKyoHitboxOffsets,
  KYO_ATTACK_FRAME_KEYS,
  getKyoAttackFrames,
} from './kyo/hitboxes.js';

export {
  getKyoFeedbackTiers,
  getKyoFeedback,
  KYO_FEEDBACK_SUMMARY,
} from './kyo/feedback.js';

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
} from './kyo/moves/kyoMoves.js';

export {
  KYO_ANIMATION_META,
  getKyoAnimationNames,
  getKyoAnimMeta,
  getKyoAttackAnimations,
  getKyoLoopAnimations,
  type AnimationMeta,
} from './kyo/animations.js';

export {
  KYO_PORTRAIT_META,
  getKyoPortraitMeta,
  getKyoAvailablePortraitSizes,
  type PortraitMeta,
} from './kyo/portraits/kyoPortraits.js';

// Kyo cancel paths — prefixed to avoid name collision with Ryo's cancelPaths
export {
  KYO_CANCEL_PATHS,
  findCancelRoute as findKyoCancelRoute,
  getCancelTargets as getKyoCancelTargets,
  validateCancel as validateKyoCancel,
  getCancelRoutesByType as getKyoCancelRoutesByType,
  isCancelSource as isKyoCancelSource,
  getBestCancelRoute as getKyoBestCancelRoute,
  type CancelType as KyoCancelType,
  type CancelRoute as KyoCancelRoute,
} from './kyo/cancelPaths.js';
