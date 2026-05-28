/**
 * Yamazaki Content Package — Barrel export
 *
 * Single entry point for all Yamazaki content: commands,
 * moves, cancel paths, attacks, frame data, feedback,
 * hitboxes, animations, portraits, hit effects, and audio sampler.
 *
 * Ryuji Yamazaki (山崎竜二) — Orochi bloodline, one-handed snake-arm fighter.
 * charId: 'yamazaki', spriteDir: 'cvsyamazaki' (1,958 PNGs)
 */

// Commands / move list
export {
  YAMAZAKI_MOVE_LIST,
  YAMAZAKI_WIN_QUOTES,
  YAMAZAKI_AVAILABLE_ACTIONS,
  type YamazakiMoveEntry,
} from './commands/yamazakiCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  YAMAZAKI_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/yamazakiMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  YAMAZAKI_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Attack definitions (frame data lookup)
export {
  YAMAZAKI_ATTACK_KEYS,
  getYamazakiFrameData,
  getYamazakiAttackFrameData,
} from './attacks/yamazakiAttacks.js';

// Frame data (Yamazaki-specific specials + DM + SDM)
export { YAMAZAKI_FRAME_DATA } from './frameData/yamazakiFrameData.js';

// Feedback tier mappings
export {
  getYamazakiFeedbackTiers,
  getYamazakiFeedback,
  YAMAZAKI_FEEDBACK_SUMMARY,
} from './feedback/yamazakiFeedback.js';

// Hitbox / hurtbox data
export {
  YAMAZAKI_HITBOX_KEYS,
  getYamazakiHitboxOffsets,
  YAMAZAKI_ATTACK_FRAME_KEYS,
  getYamazakiAttackFrames,
} from './hitboxes/yamazakiHitboxes.js';

// Animation metadata
export {
  YAMAZAKI_ANIMATION_META,
  getYamazakiAnimationNames,
  getYamazakiAnimMeta,
  getYamazakiAttackAnimations,
  getYamazakiLoopAnimations,
  type AnimationMeta,
} from './animations/yamazakiAnimations.js';

// Portrait metadata
export {
  YAMAZAKI_PORTRAIT_META,
  getYamazakiPortraitMeta,
  getYamazakiAvailablePortraitSizes,
  type PortraitMeta,
} from './portraits/yamazakiPortraits.js';

// Hit Effects (VFX/SFX plugin)
export { YAMAZAKI_HIT_EFFECTS } from './hitEffects/yamazakiHitEffects.js';

// Audio sampler registration
export { registerYamazakiAudio } from './audio/yamazakiSampler.js';
