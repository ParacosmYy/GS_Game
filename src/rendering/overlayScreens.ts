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
  DEFAULT_OPTIONS,
} from './overlays/overlayMenuScreens.js';
export type { GameOptions } from './overlays/overlayMenuScreens.js';

// Continue / Game Over
export {
  drawContinue,
  drawGameOver,
  GAME_OVER_DURATION,
} from './overlays/overlayContinueGameOver.js';

// Arcade flow (Arcade Complete, Next Match, Round Score Breakdown)
export {
  drawArcadeComplete,
  drawNextMatch,
  drawRoundScoreBreakdown,
} from './overlays/overlayArcadeFlow.js';
export type { ArcadeStats, RoundScoreBreakdown } from './overlays/overlayArcadeFlow.js';

// Stage intro ceremony
export {
  drawStageIntro,
  STAGE_INTRO_DURATION,
  getStageAccent,
} from './overlays/overlayStageIntro.js';

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
