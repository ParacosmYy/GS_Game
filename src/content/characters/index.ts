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

// Kyo Frame Contract
export {
  KYO_ACTION_CONTRACTS,
  getKyoFrameContractManifest,
} from '../../core/kyoFrameContract.js';

// Kyo Hit Effects
export { KYO_HIT_EFFECTS } from './kyo/hitEffects/kyoHitEffects.js';

// Kyo Audio
export { registerKyoAudio } from './kyo/audio/kyoSampler.js';

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

// Iori Frame Contract
export {
  IORI_ACTION_CONTRACTS,
  getIoriFrameContractManifest,
} from '../../core/ioriFrameContract.js';

// Iori Hit Effects
export { IORI_HIT_EFFECTS } from './iori/hitEffects/ioriHitEffects.js';

// Iori Audio
export { registerIoriAudio } from './iori/audio/ioriSampler.js';

// Terry content package — prefixed to avoid type name collisions
export {
  TERRY_MOVE_LIST,
  TERRY_WIN_QUOTES,
  TERRY_AVAILABLE_ACTIONS,
  type TerryMoveEntry,
} from './terry/commands/terryCommands.js';

export {
  TERRY_MOVES,
  getMoveByKey as getTerryMoveByKey,
  getMoveByAttackType as getTerryMoveByAttackType,
  getMovesByCategory as getTerryMovesByCategory,
  getProjectileMoves as getTerryProjectileMoves,
  getInvincibleMoves as getTerryInvincibleMoves,
  getMoveStats as getTerryMoveStats,
} from './terry/moves/terryMoves.js';

export {
  TERRY_CANCEL_PATHS,
  findCancelRoute as findTerryCancelRoute,
  getCancelTargets as getTerryCancelTargets,
  validateCancel as validateTerryCancel,
  getCancelRoutesByType as getTerryCancelRoutesByType,
  isCancelSource as isTerryCancelSource,
  getBestCancelRoute as getTerryBestCancelRoute,
  type CancelType as TerryCancelType,
  type CancelRoute as TerryCancelRoute,
} from './terry/cancelPaths.js';

export { TERRY_HIT_EFFECTS } from './terry/hitEffects/terryHitEffects.js';
export { registerTerryAudio } from './terry/audio/terrySampler.js';

// Kim content package — prefixed to avoid type name collisions
export {
  KIM_MOVE_LIST,
  KIM_WIN_QUOTES,
  KIM_AVAILABLE_ACTIONS,
  type KimMoveEntry,
} from './kim/commands/kimCommands.js';

export {
  KIM_MOVES,
  getMoveByKey as getKimMoveByKey,
  getMoveByAttackType as getKimMoveByAttackType,
  getMovesByCategory as getKimMovesByCategory,
  getProjectileMoves as getKimProjectileMoves,
  getInvincibleMoves as getKimInvincibleMoves,
  getMoveStats as getKimMoveStats,
} from './kim/moves/kimMoves.js';

export {
  KIM_CANCEL_PATHS,
  findCancelRoute as findKimCancelRoute,
  getCancelTargets as getKimCancelTargets,
  validateCancel as validateKimCancel,
  getCancelRoutesByType as getKimCancelRoutesByType,
  isCancelSource as isKimCancelSource,
  getBestCancelRoute as getKimBestCancelRoute,
  type CancelType as KimCancelType,
  type CancelRoute as KimCancelRoute,
} from './kim/cancelPaths.js';

export { KIM_HIT_EFFECTS } from './kim/hitEffects/kimHitEffects.js';
export { registerKimAudio } from './kim/audio/kimSampler.js';
