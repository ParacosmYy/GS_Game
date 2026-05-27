/**
 * Ryo Content Package — Barrel export
 *
 * Single entry point for all Ryo content: definition, stats, attacks,
 * commands, animations, hitboxes, feedback, and completeness reports.
 */
// Character definition (re-export from canonical source)
export { RyoDef } from './definition.js';

// Character data (typed metadata)
export { RYO_CHARACTER_DATA } from './data.js';

// Character stats (typed physics parameters)
export { RYO_STATS, type RyoStats } from './stats.js';

// Attack definitions (frame data)
export {
  RYO_ATTACK_KEYS,
  getRyoFrameData,
  getRyoAttackFrameData,
} from './attacks.js';

// Commands / move list
export {
  RYO_MOVE_LIST,
  RYO_WIN_QUOTES,
  RYO_AVAILABLE_ACTIONS,
  type RyoMoveEntry,
} from './commands.js';

// Animation sequences
export {
  getRyoAnimations,
  getRyoAnimSequence,
  getRyoAnimSequenceNames,
  RYO_REQUIRED_ANIMATIONS,
} from './animations.js';

// Hitbox / hurtbox data
export {
  RYO_HITBOX_KEYS,
  getRyoHitboxOffsets,
  RYO_ATTACK_FRAME_KEYS,
  getRyoAttackFrames,
} from './hitboxes.js';

// Feedback tier mappings
export {
  getRyoFeedbackTiers,
  getRyoFeedback,
  RYO_FEEDBACK_SUMMARY,
} from './feedback.js';

// Cancel paths (normal -> special -> DM routes)
export {
  RYO_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Frame Contract (populated data with real spriteRefs and hitbox data)
export {
  RYO_ACTION_CONTRACTS,
  getRyoFrameContractManifest,
} from '../../../core/ryoFrameContract.js';

// Completeness reporting
export {
  generateRyoReport,
  generateRyoExtendedReport,
  printRyoReport,
  type RyoCompletenessReport,
  type ActionStatus,
} from './completeness.js';

// Reports (dimension report + hitbox chain verification)
export {
  getRyoCompletenessReport,
  getRyoHitboxChainReport,
  getRyoHitboxChainSummary,
  type HitboxChainStatus,
  type HitboxChainSummary,
} from './reports/ryoReports.js';
