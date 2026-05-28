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

// Athena content package — prefixed to avoid type name collisions
export {
  ATHENA_MOVE_LIST,
  ATHENA_WIN_QUOTES,
  ATHENA_AVAILABLE_ACTIONS,
  type AthenaMoveEntry,
} from './athena/commands/athenaCommands.js';

export {
  ATHENA_MOVES,
  getMoveByKey as getAthenaMoveByKey,
  getMoveByAttackType as getAthenaMoveByAttackType,
  getMovesByCategory as getAthenaMovesByCategory,
  getProjectileMoves as getAthenaProjectileMoves,
  getInvincibleMoves as getAthenaInvincibleMoves,
  getMoveStats as getAthenaMoveStats,
} from './athena/moves/athenaMoves.js';

export {
  ATHENA_CANCEL_PATHS,
  findCancelRoute as findAthenaCancelRoute,
  getCancelTargets as getAthenaCancelTargets,
  validateCancel as validateAthenaCancel,
  getCancelRoutesByType as getAthenaCancelRoutesByType,
  isCancelSource as isAthenaCancelSource,
  getBestCancelRoute as getAthenaBestCancelRoute,
  type CancelType as AthenaCancelType,
  type CancelRoute as AthenaCancelRoute,
} from './athena/cancelPaths.js';

export {
  ATHENA_ATTACK_KEYS,
  getAthenaFrameData,
  getAthenaAttackFrameData,
} from './athena/attacks/athenaAttacks.js';

export { ATHENA_FRAME_DATA } from './athena/frameData/athenaFrameData.js';

export {
  getAthenaFeedbackTiers,
  getAthenaFeedback,
  ATHENA_FEEDBACK_SUMMARY,
} from './athena/feedback/athenaFeedback.js';

export {
  ATHENA_HITBOX_KEYS,
  getAthenaHitboxOffsets,
  ATHENA_ATTACK_FRAME_KEYS,
  getAthenaAttackFrames,
} from './athena/hitboxes/athenaHitboxes.js';

export {
  ATHENA_ANIMATION_META,
  getAthenaAnimationNames,
  getAthenaAnimMeta,
  getAthenaAttackAnimations,
  getAthenaLoopAnimations,
  type AnimationMeta as AthenaAnimationMeta,
} from './athena/animations/athenaAnimations.js';

export {
  ATHENA_PORTRAIT_META,
  getAthenaPortraitMeta,
  getAthenaAvailablePortraitSizes,
  type PortraitMeta as AthenaPortraitMeta,
} from './athena/portraits/athenaPortraits.js';

export { ATHENA_HIT_EFFECTS } from './athena/hitEffects/athenaHitEffects.js';
export { registerAthenaAudio } from './athena/audio/athenaSampler.js';

// Vice content package — prefixed to avoid type name collisions
export {
  VICE_MOVE_LIST,
  VICE_WIN_QUOTES,
  VICE_AVAILABLE_ACTIONS,
  type ViceMoveEntry,
} from './vice/commands/viceCommands.js';

export {
  VICE_MOVES,
  getMoveByKey as getViceMoveByKey,
  getMoveByAttackType as getViceMoveByAttackType,
  getMovesByCategory as getViceMovesByCategory,
  getProjectileMoves as getViceProjectileMoves,
  getInvincibleMoves as getViceInvincibleMoves,
  getGrabMoves as getViceGrabMoves,
  getMoveStats as getViceMoveStats,
} from './vice/moves/viceMoves.js';

export {
  VICE_CANCEL_PATHS,
  findCancelRoute as findViceCancelRoute,
  getCancelTargets as getViceCancelTargets,
  validateCancel as validateViceCancel,
  getCancelRoutesByType as getViceCancelRoutesByType,
  isCancelSource as isViceCancelSource,
  getBestCancelRoute as getViceBestCancelRoute,
  type CancelType as ViceCancelType,
  type CancelRoute as ViceCancelRoute,
} from './vice/cancelPaths.js';

export {
  VICE_ATTACK_KEYS,
  getViceFrameData,
  getViceAttackFrameData,
} from './vice/attacks/viceAttacks.js';

export { VICE_FRAME_DATA } from './vice/frameData/viceFrameData.js';

export {
  getViceFeedbackTiers,
  getViceFeedback,
  VICE_FEEDBACK_SUMMARY,
} from './vice/feedback/viceFeedback.js';

export {
  VICE_HITBOX_KEYS,
  getViceHitboxOffsets,
  VICE_ATTACK_FRAME_KEYS,
  getViceAttackFrames,
} from './vice/hitboxes/viceHitboxes.js';

export {
  VICE_ANIMATION_META,
  getViceAnimationNames,
  getViceAnimMeta,
  getViceAttackAnimations,
  getViceLoopAnimations,
  type AnimationMeta as ViceAnimationMeta,
} from './vice/animations/viceAnimations.js';

export {
  VICE_PORTRAIT_META,
  getVicePortraitMeta,
  getViceAvailablePortraitSizes,
  type PortraitMeta as VicePortraitMeta,
} from './vice/portraits/vicePortraits.js';

export { VICE_HIT_EFFECTS } from './vice/hitEffects/viceHitEffects.js';
export { registerViceAudio } from './vice/audio/viceSampler.js';
