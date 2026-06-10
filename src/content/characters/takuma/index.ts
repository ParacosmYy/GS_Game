/**
 * Takuma Content Package — Barrel export
 *
 * Single entry point for Takuma content. This is a minimal MUGEN-backed
 * content package: it exposes existing sprite manifest/hitbox mappings without
 * changing roster, runtime registry, or core combat rules.
 */

export {
  TAKUMA_MOVE_LIST,
  TAKUMA_WIN_QUOTES,
  TAKUMA_AVAILABLE_ACTIONS,
  type TakumaMoveEntry,
} from './commands/takumaCommands.js';

export {
  TAKUMA_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/takumaMoves.js';

export {
  TAKUMA_ATTACK_KEYS,
  getTakumaFrameData,
  getTakumaAttackFrameData,
} from './attacks/takumaAttacks.js';

export {
  getTakumaFeedbackTiers,
  getTakumaFeedback,
  TAKUMA_FEEDBACK_SUMMARY,
} from './feedback/takumaFeedback.js';

export {
  TAKUMA_HITBOX_KEYS,
  getTakumaHitboxOffsets,
  TAKUMA_ATTACK_FRAME_KEYS,
  getTakumaAttackFrames,
  TAKUMA_MUGEN_ACTION_MAP,
  hasTakumaMugenData,
  getTakumaMugenTiming,
  getTakumaMugenActionSummary,
  getTakumaMugenActions,
  getTakumaAttackTiming,
  type TakumaMugenHitboxRef,
} from './hitboxes/takumaHitboxes.js';

export {
  TAKUMA_ANIMATION_META,
  getTakumaAnimationNames,
  getTakumaAnimMeta,
  getTakumaAttackAnimations,
  getTakumaLoopAnimations,
  type AnimationMeta,
} from './animations/takumaAnimations.js';

export {
  TAKUMA_PORTRAIT_META,
  getTakumaPortraitMeta,
  getTakumaAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/takumaPortraits.js';
