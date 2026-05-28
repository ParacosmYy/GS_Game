/**
 * Screens — aggregation re-export layer
 * Split into screens_split/ subdirectory; all consumers still import from here.
 */
// Character Select
export {
  drawCharacterSelect,
} from './screens_split/characterSelect.js';

// VS Splash
export {
  drawVSSplash,
} from './screens_split/vsSplash.js';

// Intro overlay + KO screen
export {
  drawIntro,
  drawIntroCeremonyBackground,
  drawKO,
} from './screens_split/introKo.js';

// Win Quote + Announce Sequence
export {
  WIN_QUOTE_DURATION,
  drawWinQuote,
  drawAnnounceSequence,
} from './screens_split/winQuoteAnnounce.js';

// Stage Select + Team Order Select
export {
  drawStageSelect,
  drawTeamOrderSelect,
} from './screens_split/stageTeamSelect.js';

// Screen transition animations
export {
  drawTransition,
} from './screens_split/transition.js';
