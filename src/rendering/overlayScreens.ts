/**
 * Overlay screens — aggregation re-export layer
 * Split into overlays/ subdirectory; all consumers still import from here.
 */
// Super Flash (DM/SDM/HSDM cinematic flash + camera zoom)
export {
  getSuperFlashZoom,
  updateSuperFlashZoom,
  drawSuperFlash,
} from './overlays/overlaySuperFlash.js';

// Match End (winner/draw display with portraits)
export {
  drawMatchEnd,
} from './overlays/overlayMatchEnd.js';

// Menu screens (indicators, title, mode select, options)
export {
  drawModeIndicator,
  drawStageIndicator,
  drawTitle,
  drawModeSelect,
  drawOptionsScreen,
  GameOptions,
  DEFAULT_OPTIONS,
} from './overlays/overlayMenuScreens.js';

// Continue / Game Over / Round Score Breakdown
export {
  drawContinue,
  drawGameOver,
  drawRoundScoreBreakdown,
  RoundScoreBreakdown,
  GAME_OVER_DURATION,
} from './overlays/overlayContinueGameOver.js';

// Arcade flow (Arcade Complete, Next Match)
export {
  drawArcadeComplete,
  drawNextMatch,
  ArcadeStats,
} from './overlays/overlayArcadeFlow.js';

// KO overlay + screen transitions (fade/wipe)
export {
  drawCharacterKOOverlay,
  drawScreenFade,
  drawScreenWipe,
} from './overlays/overlayKoTransition.js';

// Training Mode HUD
export {
  drawTrainingHUD,
} from './overlays/overlayTrainingHUD.js';
