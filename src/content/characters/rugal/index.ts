/**
 * Rugal Content Package — Barrel export
 *
 * Minimal MUGEN-backed content package. Rugal-specific keys remain content
 * strings until core combat definitions are intentionally added.
 */

export {
  RUGAL_MOVE_LIST,
  RUGAL_WIN_QUOTES,
  RUGAL_AVAILABLE_ACTIONS,
  type RugalMoveEntry,
} from './commands/rugalCommands.js';

export {
  RUGAL_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/rugalMoves.js';

export {
  RUGAL_ATTACK_KEYS,
  getRugalFrameData,
  getRugalAttackFrameData,
} from './attacks/rugalAttacks.js';

export {
  getRugalFeedbackTiers,
  getRugalFeedback,
  RUGAL_FEEDBACK_SUMMARY,
} from './feedback/rugalFeedback.js';

export {
  RUGAL_HITBOX_KEYS,
  getRugalHitboxOffsets,
  RUGAL_ATTACK_FRAME_KEYS,
  getRugalAttackFrames,
  RUGAL_MUGEN_ACTION_MAP,
  hasRugalMugenData,
  getRugalMugenTiming,
  getRugalMugenActionSummary,
  getRugalMugenActions,
  getRugalAttackTiming,
  type RugalMugenHitboxRef,
} from './hitboxes/rugalHitboxes.js';

export {
  RUGAL_ANIMATION_META,
  getRugalAnimationNames,
  getRugalAnimMeta,
  getRugalAttackAnimations,
  getRugalLoopAnimations,
  type AnimationMeta,
} from './animations/rugalAnimations.js';

export {
  RUGAL_PORTRAIT_META,
  getRugalPortraitMeta,
  getRugalAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/rugalPortraits.js';
