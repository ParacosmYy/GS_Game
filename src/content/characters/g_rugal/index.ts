/**
 * Omega Rugal Content Package - Barrel export
 *
 * Minimal MUGEN-backed content package for cvsg_rugal. Private attack keys
 * remain strings until a later core combat expansion intentionally adopts them.
 */

export {
  G_RUGAL_MOVE_LIST,
  G_RUGAL_WIN_QUOTES,
  G_RUGAL_AVAILABLE_ACTIONS,
  type GRugalMoveEntry,
} from './commands/gRugalCommands.js';

export {
  G_RUGAL_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/gRugalMoves.js';

export {
  G_RUGAL_ATTACK_KEYS,
  getGRugalFrameData,
  getGRugalAttackFrameData,
} from './attacks/gRugalAttacks.js';

export {
  getGRugalFeedbackTiers,
  getGRugalFeedback,
  G_RUGAL_FEEDBACK_SUMMARY,
} from './feedback/gRugalFeedback.js';

export {
  G_RUGAL_HITBOX_KEYS,
  getGRugalHitboxOffsets,
  G_RUGAL_ATTACK_FRAME_KEYS,
  getGRugalAttackFrames,
  G_RUGAL_MUGEN_ACTION_MAP,
  hasGRugalMugenData,
  getGRugalMugenTiming,
  getGRugalMugenActionSummary,
  getGRugalMugenActions,
  getGRugalAttackTiming,
  type GRugalMugenHitboxRef,
} from './hitboxes/gRugalHitboxes.js';

export {
  G_RUGAL_ANIMATION_META,
  getGRugalAnimationNames,
  getGRugalAnimMeta,
  getGRugalAttackAnimations,
  getGRugalLoopAnimations,
  type AnimationMeta,
} from './animations/gRugalAnimations.js';

export {
  G_RUGAL_PORTRAIT_META,
  getGRugalPortraitMeta,
  getGRugalAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/gRugalPortraits.js';
