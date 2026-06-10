/**
 * Kensou Content Package — Barrel export
 *
 * Minimal MUGEN-backed content package. It exposes existing manifest/hitbox
 * mappings without changing roster, runtime registry, or combat rules.
 */

export {
  KENSOU_MOVE_LIST,
  KENSOU_WIN_QUOTES,
  KENSOU_AVAILABLE_ACTIONS,
  type KensouMoveEntry,
} from './commands/kensouCommands.js';

export {
  KENSOU_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/kensouMoves.js';

export {
  KENSOU_ATTACK_KEYS,
  getKensouFrameData,
  getKensouAttackFrameData,
} from './attacks/kensouAttacks.js';

export {
  getKensouFeedbackTiers,
  getKensouFeedback,
  KENSOU_FEEDBACK_SUMMARY,
} from './feedback/kensouFeedback.js';

export {
  KENSOU_HITBOX_KEYS,
  getKensouHitboxOffsets,
  KENSOU_ATTACK_FRAME_KEYS,
  getKensouAttackFrames,
  KENSOU_MUGEN_ACTION_MAP,
  hasKensouMugenData,
  getKensouMugenTiming,
  getKensouMugenActionSummary,
  getKensouMugenActions,
  getKensouAttackTiming,
  type KensouMugenHitboxRef,
} from './hitboxes/kensouHitboxes.js';

export {
  KENSOU_ANIMATION_META,
  getKensouAnimationNames,
  getKensouAnimMeta,
  getKensouAttackAnimations,
  getKensouLoopAnimations,
  type AnimationMeta,
} from './animations/kensouAnimations.js';

export {
  KENSOU_PORTRAIT_META,
  getKensouPortraitMeta,
  getKensouAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/kensouPortraits.js';
