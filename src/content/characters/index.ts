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
  KYO_MUGEN_ACTION_MAP,
  hasKyoMugenData,
  getKyoMugenTiming,
  getKyoMugenActionSummary,
  getKyoAttackTiming,
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

// Terry hitbox / MUGEN data
export {
  TERRY_HITBOX_KEYS,
  getTerryHitboxOffsets,
  TERRY_ATTACK_FRAME_KEYS,
  getTerryAttackFrames,
  TERRY_MUGEN_ACTION_MAP,
  hasTerryMugenData,
  getTerryMugenTiming,
  getTerryMugenActionSummary,
  getTerryAttackTiming,
} from './terry/hitboxes/terryHitboxes.js';

// Terry frame data
export { TERRY_FRAME_DATA } from './terry/frameData/terryFrameData.js';

// Terry feedback
export {
  getTerryFeedbackTiers,
  getTerryFeedback,
  TERRY_FEEDBACK_SUMMARY,
} from './terry/feedback/terryFeedback.js';

// Terry animations
export {
  TERRY_ANIMATION_META,
  getTerryAnimationNames,
  getTerryAnimMeta,
  getTerryAttackAnimations,
  getTerryLoopAnimations,
  type AnimationMeta as TerryAnimationMeta,
} from './terry/animations/terryAnimations.js';

// Terry portraits
export {
  TERRY_PORTRAIT_META,
  getTerryPortraitMeta,
  getTerryAvailablePortraitSizes,
  type PortraitMeta as TerryPortraitMeta,
} from './terry/portraits/terryPortraits.js';

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

// Kim hitbox / MUGEN data
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
} from './kim/hitboxes/kimHitboxes.js';

// Kim frame data
export { KIM_FRAME_DATA } from './kim/frameData/kimFrameData.js';

// Kim feedback
export {
  getKimFeedbackTiers,
  getKimFeedback,
  KIM_FEEDBACK_SUMMARY,
} from './kim/feedback/kimFeedback.js';

// Kim animations
export {
  KIM_ANIMATION_META,
  getKimAnimationNames,
  getKimAnimMeta,
  getKimAttackAnimations,
  getKimLoopAnimations,
  type AnimationMeta as KimAnimationMeta,
} from './kim/animations/kimAnimations.js';

// Kim portraits
export {
  KIM_PORTRAIT_META,
  getKimPortraitMeta,
  getKimAvailablePortraitSizes,
  type PortraitMeta as KimPortraitMeta,
} from './kim/portraits/kimPortraits.js';

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
  ATHENA_MUGEN_ACTION_MAP,
  hasAthenaMugenData,
  getAthenaMugenTiming,
  getAthenaMugenActionSummary,
  getAthenaMugenActions,
  getAthenaAttackTiming,
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
  VICE_MUGEN_ACTION_MAP,
  hasViceMugenData,
  getViceMugenTiming,
  getViceMugenActionSummary,
  getViceMugenActions,
  getViceAttackTiming,
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

// Yamazaki content package — prefixed to avoid type name collisions
export {
  YAMAZAKI_MOVE_LIST,
  YAMAZAKI_WIN_QUOTES,
  YAMAZAKI_AVAILABLE_ACTIONS,
  type YamazakiMoveEntry,
} from './yamazaki/commands/yamazakiCommands.js';

export {
  YAMAZAKI_MOVES,
  getMoveByKey as getYamazakiMoveByKey,
  getMoveByAttackType as getYamazakiMoveByAttackType,
  getMovesByCategory as getYamazakiMovesByCategory,
  getProjectileMoves as getYamazakiProjectileMoves,
  getInvincibleMoves as getYamazakiInvincibleMoves,
  getMoveStats as getYamazakiMoveStats,
} from './yamazaki/moves/yamazakiMoves.js';

export {
  YAMAZAKI_CANCEL_PATHS,
  findCancelRoute as findYamazakiCancelRoute,
  getCancelTargets as getYamazakiCancelTargets,
  validateCancel as validateYamazakiCancel,
  getCancelRoutesByType as getYamazakiCancelRoutesByType,
  isCancelSource as isYamazakiCancelSource,
  getBestCancelRoute as getYamazakiBestCancelRoute,
  type CancelType as YamazakiCancelType,
  type CancelRoute as YamazakiCancelRoute,
} from './yamazaki/cancelPaths.js';

export {
  YAMAZAKI_ATTACK_KEYS,
  getYamazakiFrameData,
  getYamazakiAttackFrameData,
} from './yamazaki/attacks/yamazakiAttacks.js';

export { YAMAZAKI_FRAME_DATA } from './yamazaki/frameData/yamazakiFrameData.js';

export {
  getYamazakiFeedbackTiers,
  getYamazakiFeedback,
  YAMAZAKI_FEEDBACK_SUMMARY,
} from './yamazaki/feedback/yamazakiFeedback.js';

export {
  YAMAZAKI_HITBOX_KEYS,
  getYamazakiHitboxOffsets,
  YAMAZAKI_ATTACK_FRAME_KEYS,
  getYamazakiAttackFrames,
  YAMAZAKI_MUGEN_ACTION_MAP,
  hasYamazakiMugenData,
  getYamazakiMugenTiming,
  getYamazakiMugenActionSummary,
  getYamazakiAttackTiming,
} from './yamazaki/hitboxes/yamazakiHitboxes.js';

export {
  YAMAZAKI_ANIMATION_META,
  getYamazakiAnimationNames,
  getYamazakiAnimMeta,
  getYamazakiAttackAnimations,
  getYamazakiLoopAnimations,
  type AnimationMeta as YamazakiAnimationMeta,
} from './yamazaki/animations/yamazakiAnimations.js';

export {
  YAMAZAKI_PORTRAIT_META,
  getYamazakiPortraitMeta,
  getYamazakiAvailablePortraitSizes,
  type PortraitMeta as YamazakiPortraitMeta,
} from './yamazaki/portraits/yamazakiPortraits.js';

export { YAMAZAKI_HIT_EFFECTS } from './yamazaki/hitEffects/yamazakiHitEffects.js';
export { registerYamazakiAudio } from './yamazaki/audio/yamazakiSampler.js';

// Benimaru content package — prefixed to avoid type name collisions
export {
  BENIMARU_MOVE_LIST,
  BENIMARU_WIN_QUOTES,
  BENIMARU_AVAILABLE_ACTIONS,
  type BenimaruMoveEntry,
} from './benimaru/commands/benimaruCommands.js';

export {
  BENIMARU_MOVES,
  getMoveByKey as getBenimaruMoveByKey,
  getMoveByAttackType as getBenimaruMoveByAttackType,
  getMovesByCategory as getBenimaruMovesByCategory,
  getProjectileMoves as getBenimaruProjectileMoves,
  getInvincibleMoves as getBenimaruInvincibleMoves,
  getMoveStats as getBenimaruMoveStats,
} from './benimaru/moves/benimaruMoves.js';

export {
  BENIMARU_CANCEL_PATHS,
  findCancelRoute as findBenimaruCancelRoute,
  getCancelTargets as getBenimaruCancelTargets,
  validateCancel as validateBenimaruCancel,
  getCancelRoutesByType as getBenimaruCancelRoutesByType,
  isCancelSource as isBenimaruCancelSource,
  getBestCancelRoute as getBenimaruBestCancelRoute,
  type CancelType as BenimaruCancelType,
  type CancelRoute as BenimaruCancelRoute,
} from './benimaru/cancelPaths.js';

export {
  BENIMARU_ATTACK_KEYS,
  getBenimaruFrameData,
  getBenimaruAttackFrameData,
} from './benimaru/attacks/benimaruAttacks.js';

export { BENIMARU_FRAME_DATA } from './benimaru/frameData/benimaruFrameData.js';

export {
  getBenimaruFeedbackTiers,
  getBenimaruFeedback,
  BENIMARU_FEEDBACK_SUMMARY,
} from './benimaru/feedback/benimaruFeedback.js';

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
} from './benimaru/hitboxes/benimaruHitboxes.js';

export {
  BENIMARU_ANIMATION_META,
  getBenimaruAnimationNames,
  getBenimaruAnimMeta,
  getBenimaruAttackAnimations,
  getBenimaruLoopAnimations,
  type AnimationMeta as BenimaruAnimationMeta,
} from './benimaru/animations/benimaruAnimations.js';

export {
  BENIMARU_PORTRAIT_META,
  getBenimaruPortraitMeta,
  getBenimaruAvailablePortraitSizes,
  type PortraitMeta as BenimaruPortraitMeta,
} from './benimaru/portraits/benimaruPortraits.js';

export { BENIMARU_HIT_EFFECTS } from './benimaru/hitEffects/benimaruHitEffects.js';
export { registerBenimaruAudio } from './benimaru/audio/benimaruSampler.js';

// Shermie content package — prefixed to avoid type name collisions
export {
  SHERMIE_MOVE_LIST,
  SHERMIE_WIN_QUOTES,
  SHERMIE_AVAILABLE_ACTIONS,
  type ShermieMoveEntry,
} from './shermie/commands/shermieCommands.js';

export {
  SHERMIE_MOVES,
  getMoveByKey as getShermieMoveByKey,
  getMoveByAttackType as getShermieMoveByAttackType,
  getMovesByCategory as getShermieMovesByCategory,
  getProjectileMoves as getShermieProjectileMoves,
  getInvincibleMoves as getShermieInvincibleMoves,
  getGrabMoves as getShermieGrabMoves,
  getMoveStats as getShermieMoveStats,
  type MoveDefinition as ShermieMoveDefinition,
  type MoveVersionEntry as ShermieMoveVersionEntry,
  type MoveVersion as ShermieMoveVersion,
} from './shermie/moves/shermieMoves.js';

export {
  SHERMIE_CANCEL_PATHS,
  findCancelRoute as findShermieCancelRoute,
  getCancelTargets as getShermieCancelTargets,
  validateCancel as validateShermieCancel,
  getCancelRoutesByType as getShermieCancelRoutesByType,
  isCancelSource as isShermieCancelSource,
  getBestCancelRoute as getShermieBestCancelRoute,
  type CancelType as ShermieCancelType,
  type CancelRoute as ShermieCancelRoute,
} from './shermie/cancelPaths.js';

export {
  SHERMIE_ATTACK_KEYS,
  getShermieFrameData,
  getShermieAttackFrameData,
} from './shermie/attacks/shermieAttacks.js';

export { SHERMIE_FRAME_DATA } from './shermie/frameData/shermieFrameData.js';

export {
  getShermieFeedbackTiers,
  getShermieFeedback,
  SHERMIE_FEEDBACK_SUMMARY,
} from './shermie/feedback/shermieFeedback.js';

export {
  SHERMIE_HITBOX_KEYS,
  getShermieHitboxOffsets,
  SHERMIE_ATTACK_FRAME_KEYS,
  getShermieAttackFrames,
  SHERMIE_MUGEN_ACTION_MAP,
  hasShermieMugenData,
  getShermieMugenTiming,
  getShermieMugenActionSummary,
  getShermieAttackTiming,
} from './shermie/hitboxes/shermieHitboxes.js';

export {
  SHERMIE_ANIMATION_META,
  getShermieAnimationNames,
  getShermieAnimMeta,
  getShermieAttackAnimations,
  getShermieLoopAnimations,
  type AnimationMeta as ShermieAnimationMeta,
} from './shermie/animations/shermieAnimations.js';

export {
  SHERMIE_PORTRAIT_META,
  getShermiePortraitMeta,
  getShermieAvailablePortraitSizes,
  type PortraitMeta as ShermiePortraitMeta,
} from './shermie/portraits/shermiePortraits.js';

export { SHERMIE_HIT_EFFECTS } from './shermie/hitEffects/shermieHitEffects.js';
export { registerShermieAudio } from './shermie/audio/shermieSampler.js';

// Yuri content package — prefixed to avoid type name collisions
export {
  YURI_MOVE_LIST,
  YURI_WIN_QUOTES,
  YURI_AVAILABLE_ACTIONS,
  type YuriMoveEntry,
} from './yuri/commands/yuriCommands.js';

export {
  YURI_MOVES,
  getMoveByKey as getYuriMoveByKey,
  getMoveByAttackType as getYuriMoveByAttackType,
  getMovesByCategory as getYuriMovesByCategory,
  getProjectileMoves as getYuriProjectileMoves,
  getInvincibleMoves as getYuriInvincibleMoves,
  getMoveStats as getYuriMoveStats,
  type MoveDefinition as YuriMoveDefinition,
  type MoveVersionEntry as YuriMoveVersionEntry,
  type MoveVersion as YuriMoveVersion,
} from './yuri/moves/yuriMoves.js';

export {
  YURI_CANCEL_PATHS,
  findCancelRoute as findYuriCancelRoute,
  getCancelTargets as getYuriCancelTargets,
  validateCancel as validateYuriCancel,
  getCancelRoutesByType as getYuriCancelRoutesByType,
  isCancelSource as isYuriCancelSource,
  getBestCancelRoute as getYuriBestCancelRoute,
  type CancelType as YuriCancelType,
  type CancelRoute as YuriCancelRoute,
} from './yuri/cancelPaths.js';

export {
  YURI_ATTACK_KEYS,
  getYuriFrameData,
  getYuriAttackFrameData,
} from './yuri/attacks/yuriAttacks.js';

export { YURI_FRAME_DATA } from './yuri/frameData/yuriFrameData.js';

export {
  getYuriFeedbackTiers,
  getYuriFeedback,
  YURI_FEEDBACK_SUMMARY,
} from './yuri/feedback/yuriFeedback.js';

export {
  YURI_HITBOX_KEYS,
  getYuriHitboxOffsets,
  YURI_ATTACK_FRAME_KEYS,
  getYuriAttackFrames,
  YURI_MUGEN_ACTION_MAP,
  hasYuriMugenData,
  getYuriMugenTiming,
  getYuriMugenActionSummary,
  getYuriMugenActions,
  getYuriAttackTiming,
} from './yuri/hitboxes/yuriHitboxes.js';

export {
  YURI_ANIMATION_META,
  getYuriAnimationNames,
  getYuriAnimMeta,
  getYuriAttackAnimations,
  getYuriLoopAnimations,
  type AnimationMeta as YuriAnimationMeta,
} from './yuri/animations/yuriAnimations.js';

export {
  YURI_PORTRAIT_META,
  getYuriPortraitMeta,
  getYuriAvailablePortraitSizes,
  type PortraitMeta as YuriPortraitMeta,
} from './yuri/portraits/yuriPortraits.js';

export { YURI_HIT_EFFECTS } from './yuri/hitEffects/yuriHitEffects.js';
export { registerYuriAudio } from './yuri/audio/yuriSampler.js';

// Heidern content package — prefixed to avoid type name collisions
export {
  HEIDERN_MOVE_LIST,
  HEIDERN_WIN_QUOTES,
  HEIDERN_AVAILABLE_ACTIONS,
  type HeidernMoveEntry,
} from './heidern/commands/heidernCommands.js';

export {
  HEIDERN_MOVES,
  getMoveByKey as getHeidernMoveByKey,
  getMoveByAttackType as getHeidernMoveByAttackType,
  getMovesByCategory as getHeidernMovesByCategory,
  getProjectileMoves as getHeidernProjectileMoves,
  getInvincibleMoves as getHeidernInvincibleMoves,
  getGrabMoves as getHeidernGrabMoves,
  getMoveStats as getHeidernMoveStats,
  type MoveDefinition as HeidernMoveDefinition,
  type MoveVersionEntry as HeidernMoveVersionEntry,
  type MoveVersion as HeidernMoveVersion,
} from './heidern/moves/heidernMoves.js';

export {
  HEIDERN_CANCEL_PATHS,
  findCancelRoute as findHeidernCancelRoute,
  getCancelTargets as getHeidernCancelTargets,
  validateCancel as validateHeidernCancel,
  getCancelRoutesByType as getHeidernCancelRoutesByType,
  isCancelSource as isHeidernCancelSource,
  getBestCancelRoute as getHeidernBestCancelRoute,
  type CancelType as HeidernCancelType,
  type CancelRoute as HeidernCancelRoute,
} from './heidern/cancelPaths.js';

export {
  HEIDERN_ATTACK_KEYS,
  getHeidernFrameData,
  getHeidernAttackFrameData,
} from './heidern/attacks/heidernAttacks.js';

export { HEIDERN_FRAME_DATA } from './heidern/frameData/heidernFrameData.js';

export {
  getHeidernFeedbackTiers,
  getHeidernFeedback,
  HEIDERN_FEEDBACK_SUMMARY,
} from './heidern/feedback/heidernFeedback.js';

export {
  HEIDERN_HITBOX_KEYS,
  getHeidernHitboxOffsets,
  HEIDERN_ATTACK_FRAME_KEYS,
  getHeidernAttackFrames,
  HEIDERN_MUGEN_ACTION_MAP,
  hasHeidernMugenData,
  getHeidernMugenTiming,
  getHeidernMugenActionSummary,
  getHeidernMugenActions,
  getHeidernAttackTiming,
} from './heidern/hitboxes/heidernHitboxes.js';

export {
  HEIDERN_ANIMATION_META,
  getHeidernAnimationNames,
  getHeidernAnimMeta,
  getHeidernAttackAnimations,
  getHeidernLoopAnimations,
  type AnimationMeta as HeidernAnimationMeta,
} from './heidern/animations/heidernAnimations.js';

export {
  HEIDERN_PORTRAIT_META,
  getHeidernPortraitMeta,
  getHeidernAvailablePortraitSizes,
  type PortraitMeta as HeidernPortraitMeta,
} from './heidern/portraits/heidernPortraits.js';

export { HEIDERN_HIT_EFFECTS } from './heidern/hitEffects/heidernHitEffects.js';
export { registerHeidernAudio } from './heidern/audio/heidernSampler.js';
