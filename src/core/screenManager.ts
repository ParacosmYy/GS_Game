/**
 * Screen Manager — Screen State Machine
 *
 * Manages the game screen state machine, tracking the current screen,
 * handling transitions, and providing query methods.
 *
 * This class is a focused state machine that complements GameStateManager.
 * GameStateManager owns the full game state (phases, timers, etc.).
 * ScreenManager provides a clean API for screen flow validation and queries.
 *
 * Usage:
 *   const sm = new ScreenManager();
 *   sm.transitionTo('mode_select');  // validates and transitions
 *   sm.tick();                        // advance transition animation
 *   sm.isTransitioning();             // check if mid-transition
 *   sm.getTransitionProgress();       // 0..1 progress
 */

import {
  type GameScreen,
  type TransitionType,
  type ScreenTransition,
  TRANSITION_DURATIONS,
  isValidTransition,
  getTransition,
} from './gameScreens.js';

/** Transition state: not transitioning, fading out, or fading in */
export type TransitionPhase = 'none' | 'fade_out' | 'fade_in';

export class ScreenManager {
  /** Current active screen */
  private currentScreen: GameScreen = 'title';

  /** Previous screen (for transition rendering) */
  private previousScreen: GameScreen | null = null;

  /** Current transition phase */
  private phase: TransitionPhase = 'none';

  /** Timer within current transition phase (in ticks) */
  private timer = 0;

  /** Total duration of current transition (in ticks) */
  private duration = 0;

  /** The transition type being used */
  private transitionType: TransitionType = 'fade';

  /** Pending target screen (set during fade_out, applied at fade_in) */
  private pendingScreen: GameScreen | null = null;

  // ===== Read State =====

  /** Get the current active screen */
  getCurrentScreen(): GameScreen {
    return this.currentScreen;
  }

  /** Get the previous screen (null if not transitioning) */
  getPreviousScreen(): GameScreen | null {
    return this.previousScreen;
  }

  /** Is a transition currently in progress? */
  isTransitioning(): boolean {
    return this.phase !== 'none';
  }

  /** Get the current transition phase */
  getTransitionPhase(): TransitionPhase {
    return this.phase;
  }

  /** Get the current transition progress (0..1) */
  getTransitionProgress(): number {
    if (this.phase === 'none') return 0;
    if (this.duration === 0) return 1;
    return Math.min(1, this.timer / this.duration);
  }

  /** Get the transition type currently in use */
  getTransitionType(): TransitionType {
    return this.transitionType;
  }

  // ===== State Changes =====

  /**
   * Start a transition to a new screen.
   * Returns false if the transition is not valid.
   * Returns false if already transitioning.
   */
  transitionTo(target: GameScreen, forceType?: TransitionType): boolean {
    // Cannot start a new transition while one is in progress
    if (this.phase !== 'none') return false;

    // Validate the transition
    if (!isValidTransition(this.currentScreen, target)) return false;

    // Get transition definition
    const def = getTransition(this.currentScreen, target);
    const type = forceType ?? def?.type ?? 'fade';
    const dur = def?.duration ?? TRANSITION_DURATIONS[type];

    this.pendingScreen = target;
    this.previousScreen = this.currentScreen;
    this.transitionType = type;

    if (dur === 0) {
      // Instant transition (no animation)
      this.currentScreen = target;
      this.previousScreen = null;
      this.pendingScreen = null;
      return true;
    }

    // Start fade-out phase: old screen fades to black
    this.phase = 'fade_out';
    this.timer = 0;
    this.duration = Math.ceil(dur / 2); // half for fade out
    return true;
  }

  /**
   * Force-set the current screen without transition.
   * Use sparingly (e.g., for restart/reset).
   */
  forceSetScreen(screen: GameScreen): void {
    this.currentScreen = screen;
    this.previousScreen = null;
    this.pendingScreen = null;
    this.phase = 'none';
    this.timer = 0;
    this.duration = 0;
  }

  /**
   * Advance the transition by one tick.
   * Returns true if the transition completed this tick.
   */
  tick(): boolean {
    if (this.phase === 'none') return false;

    this.timer++;

    if (this.timer >= this.duration) {
      if (this.phase === 'fade_out') {
        // Switch to fade_in phase
        this.phase = 'fade_in';
        this.timer = 0;
        if (this.pendingScreen) {
          this.currentScreen = this.pendingScreen;
          this.pendingScreen = null;
        }
        return false;
      } else {
        // Transition complete
        this.phase = 'none';
        this.timer = 0;
        this.duration = 0;
        this.previousScreen = null;
        return true;
      }
    }

    return false;
  }

  // ===== Query Methods =====

  /** Is the current screen the given screen? */
  isScreen(screen: GameScreen): boolean {
    return this.currentScreen === screen;
  }

  /** Is the game in a battle-related screen? */
  isBattleScreen(): boolean {
    return this.currentScreen === 'battle'
      || this.currentScreen === 'battle_intro'
      || this.currentScreen === 'ko';
  }

  /** Is the game in a menu/selection screen? */
  isMenuScreen(): boolean {
    return this.currentScreen === 'title'
      || this.currentScreen === 'mode_select'
      || this.currentScreen === 'character_select'
      || this.currentScreen === 'team_order'
      || this.currentScreen === 'stage_select';
  }

  /** Get the alpha value for overlay rendering during transitions */
  getTransitionAlpha(): number {
    if (this.phase === 'none') return 0;
    const progress = this.getTransitionProgress();
    if (this.phase === 'fade_out') {
      // Fade out: alpha goes from 0 to 1 (screen darkens)
      return progress;
    } else {
      // Fade in: alpha goes from 1 to 0 (screen brightens)
      return 1 - progress;
    }
  }

  /** Reset to initial state */
  reset(): void {
    this.currentScreen = 'title';
    this.previousScreen = null;
    this.pendingScreen = null;
    this.phase = 'none';
    this.timer = 0;
    this.duration = 0;
  }
}
