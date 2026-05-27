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

// Iori content package — prefixed to avoid type name collisions
export {
  IORI_ATTACK_KEYS,
  getIoriFrameData,
  getIoriAttackFrameData,
} from './iori/attacks.js';

export {
  IORI_MOVE_LIST,
  IORI_WIN_QUOTES,
  IORI_AVAILABLE_ACTIONS,
  type IoriMoveEntry,
} from './iori/commands.js';

export {
  IORI_HITBOX_KEYS,
  getIoriHitboxOffsets,
  IORI_ATTACK_FRAME_KEYS,
  getIoriAttackFrames,
} from './iori/hitboxes.js';

export {
  getIoriFeedbackTiers,
  getIoriFeedback,
  IORI_FEEDBACK_SUMMARY,
} from './iori/feedback.js';

export {
  IORI_ANIMATION_META,
  getIoriAnimationNames,
  getIoriAnimMeta,
  getIoriAttackAnimations,
  getIoriLoopAnimations,
} from './iori/animations.js';

export {
  IORI_PORTRAIT_META,
  getIoriPortraitMeta,
  getIoriAvailablePortraitSizes,
} from './iori/portraits/ioriPortraits.js';

export {
  IORI_CANCEL_PATHS,
  findCancelRoute as findIoriCancelRoute,
  getCancelTargets as getIoriCancelTargets,
  validateCancel as validateIoriCancel,
  getCancelRoutesByType as getIoriCancelRoutesByType,
  isCancelSource as isIoriCancelSource,
  getBestCancelRoute as getIoriBestCancelRoute,
  type CancelType as IoriCancelType,
  type CancelRoute as IoriCancelRoute,
} from './iori/cancelPaths.js';
