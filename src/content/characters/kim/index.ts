/**
 * Kim Content Package — Barrel export
 *
 * Single entry point for all Kim content: commands,
 * moves, cancel paths, hit effects, and audio sampler.
 */

// Commands / move list
export {
  KIM_MOVE_LIST,
  KIM_WIN_QUOTES,
  KIM_AVAILABLE_ACTIONS,
  type KimMoveEntry,
} from './commands/kimCommands.js';

// Move / skill definitions (B/D/MAX versions)
export {
  KIM_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/kimMoves.js';

// Cancel paths (normal -> special -> DM routes, Sanren rekka)
export {
  KIM_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelType,
  type CancelRoute,
} from './cancelPaths.js';

// Hit Effects (VFX/SFX plugin)
export { KIM_HIT_EFFECTS } from './hitEffects/kimHitEffects.js';

// Audio sampler registration
export { registerKimAudio } from './audio/kimSampler.js';
