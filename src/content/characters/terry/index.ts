/**
 * Terry Content Package — Barrel export
 *
 * Single entry point for all Terry content: commands,
 * moves, cancel paths, hit effects, and audio sampler.
 */

// Commands / move list
export {
  TERRY_MOVE_LIST,
  TERRY_WIN_QUOTES,
  TERRY_AVAILABLE_ACTIONS,
  type TerryMoveEntry,
} from './commands/terryCommands.js';

// Move / skill definitions (A/C/D/MAX versions)
export {
  TERRY_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
  type MoveDefinition,
  type MoveVersionEntry,
  type MoveVersion,
} from './moves/terryMoves.js';

// Cancel paths (normal -> special -> DM routes)
export {
  TERRY_CANCEL_PATHS,
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
export { TERRY_HIT_EFFECTS } from './hitEffects/terryHitEffects.js';

// Audio sampler registration
export { registerTerryAudio } from './audio/terrySampler.js';
