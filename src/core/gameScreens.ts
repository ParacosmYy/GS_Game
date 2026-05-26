/**
 * Game Screen Types and Transition Definitions
 *
 * Defines the screen state machine types used for navigating between
 * game screens (title, mode select, character select, battle, etc.).
 *
 * The actual screen state tracking lives in GameStateManager.
 * This file provides the type definitions and transition metadata.
 */

// ===== Screen States =====

/** All possible game screens/phases */
export type GameScreen =
  | 'title'
  | 'mode_select'
  | 'character_select'
  | 'team_order'
  | 'stage_select'
  | 'battle_intro'
  | 'battle'
  | 'ko'
  | 'win_quote'
  | 'victory'
  | 'continue'
  | 'game_over';

/** Transition animation types between screens */
export type TransitionType = 'fade' | 'wipe_left' | 'wipe_right' | 'zoom';

/** A single screen transition definition */
export interface ScreenTransition {
  /** The screen transitioning from */
  from: GameScreen;
  /** The screen transitioning to */
  to: GameScreen;
  /** Duration in ticks */
  duration: number;
  /** Type of transition animation */
  type: TransitionType;
}

// ===== Transition Durations (in ticks at 60fps) =====

/** Default transition durations */
export const TRANSITION_DURATIONS = {
  /** Fade to black: 20 ticks (~0.33s) */
  fade: 20,
  /** Wipe left: 40 ticks (~0.67s) */
  wipe_left: 40,
  /** Wipe right: 40 ticks (~0.67s) */
  wipe_right: 40,
  /** Zoom: 50 ticks (~0.83s) */
  zoom: 50,
} as const;

// ===== Valid Screen Flow =====

/**
 * Valid screen transitions defining the game flow.
 * Each entry describes a valid from -> to transition.
 */
export const VALID_TRANSITIONS: ScreenTransition[] = [
  // Title -> Mode Select (Enter key)
  { from: 'title', to: 'mode_select', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Title -> Character Select (J key = quick select)
  { from: 'title', to: 'character_select', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Mode Select -> Character Select
  { from: 'mode_select', to: 'character_select', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Character Select -> Team Order (team mode only)
  { from: 'character_select', to: 'team_order', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Character Select -> Stage Select (single mode)
  { from: 'character_select', to: 'stage_select', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Team Order -> Stage Select
  { from: 'team_order', to: 'stage_select', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Stage Select -> Battle Intro
  { from: 'stage_select', to: 'battle_intro', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Battle Intro -> Battle
  { from: 'battle_intro', to: 'battle', duration: 0, type: 'fade' },
  // Battle -> KO
  { from: 'battle', to: 'ko', duration: 0, type: 'fade' },
  // KO -> Win Quote
  { from: 'ko', to: 'win_quote', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Win Quote -> Victory (match winner decided)
  { from: 'win_quote', to: 'victory', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Win Quote -> Battle Intro (next round, no match winner yet)
  { from: 'win_quote', to: 'battle_intro', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Victory -> Continue
  { from: 'victory', to: 'continue', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Continue -> Battle Intro (player continues)
  { from: 'continue', to: 'battle_intro', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Continue -> Game Over (player does not continue)
  { from: 'continue', to: 'game_over', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
  // Game Over -> Title
  { from: 'game_over', to: 'title', duration: TRANSITION_DURATIONS.fade, type: 'fade' },
];

/**
 * Check if a transition from one screen to another is valid.
 */
export function isValidTransition(from: GameScreen, to: GameScreen): boolean {
  return VALID_TRANSITIONS.some(t => t.from === from && t.to === to);
}

/**
 * Get the transition definition for a from -> to pair.
 * Returns undefined if the transition is not valid.
 */
export function getTransition(from: GameScreen, to: GameScreen): ScreenTransition | undefined {
  return VALID_TRANSITIONS.find(t => t.from === from && t.to === to);
}
