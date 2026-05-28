/** Round State — round tracking, win counts, fade transitions, fighter resets.
 *  Owns all round/match state; main loop calls into this for round lifecycle. */
import { Fighter } from '../entities/fighter.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { CombatSystem } from '../combat/combatSystem.js';
import { Projectile } from '../entities/projectile.js';
import type { VFXSystem } from '../rendering/vfx.js';
import type { CinematicState } from './cinematicState.js';
import { resetMeterSystem } from '../combat/meter.js';
import { STAGE_WIDTH } from '../core/constants.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';

/** Dependencies injected from main.ts — avoids global coupling */
interface RoundDeps {
  p1: Fighter; p2: Fighter;
  p1Cmd: CommandBuffer; p2Cmd: CommandBuffer;
  combatSystem: CombatSystem;
  projectiles: Projectile[];
  vfx: VFXSystem;
  cinematic: CinematicState;
  gauges: [PowerGauge, PowerGauge];
  maxModes: [MaxModeState, MaxModeState];
  tickRef: { value: number };
}

/** Round transition phase — controls visual fade between rounds */
export enum RoundTransitionPhase {
  /** No transition active */
  NONE = 'none',
  /** Waiting in black before revealing next round */
  HOLD_BLACK = 'hold_black',
  /** Fading back in from black to reveal the new round */
  FADE_IN = 'fade_in',
}

export class RoundState {
  p1Wins = 0;
  p2Wins = 0;
  currentRound = 1;
  readonly winsNeeded = 2;

  // Fade transition (0=none active)
  fadeAlpha = 0;
  fadeDirection = 0;  // 0=idle, 1=out(to black), -1=in(from black)
  fadeCallback: (() => void) | null = null;

  // Wipe transition support
  transitionType: 'fade' | 'wipe' | 'curtain' | 'zoom' = 'fade';
  transitionTick = 0;

  // Round transition state machine
  transitionPhase: RoundTransitionPhase = RoundTransitionPhase.NONE;
  /** Frames to hold black screen between fade-out and fade-in */
  private holdBlackFrames = 0;
  private readonly HOLD_BLACK_DURATION = 30;
  /** Callback to invoke once the transition fully completes (fade-in done) */
  private transitionCompleteCallback: (() => void) | null = null;

  // Injected system refs
  private p1: Fighter;
  private p2: Fighter;
  private p1Cmd: CommandBuffer;
  private p2Cmd: CommandBuffer;
  private combatSystem: CombatSystem;
  private projectiles: Projectile[];
  private vfx: VFXSystem;
  private cinematic: CinematicState;
  private gauges: [PowerGauge, PowerGauge];
  private maxModes: [MaxModeState, MaxModeState];
  private tickRef: { value: number };

  constructor(d: RoundDeps) {
    this.p1 = d.p1; this.p2 = d.p2;
    this.p1Cmd = d.p1Cmd; this.p2Cmd = d.p2Cmd;
    this.combatSystem = d.combatSystem;
    this.projectiles = d.projectiles;
    this.vfx = d.vfx;
    this.cinematic = d.cinematic;
    this.gauges = d.gauges;
    this.maxModes = d.maxModes;
    this.tickRef = d.tickRef;
  }

  /** Whether a round transition animation is currently active */
  isTransitioning(): boolean {
    return this.transitionPhase !== RoundTransitionPhase.NONE;
  }

  /** Add a win. Returns match winner (0 or 1), or null if match continues. */
  addWin(winner: number | null): number | null {
    if (winner === 0) this.p1Wins++;
    else if (winner === 1) this.p2Wins++;
    if (this.p1Wins >= this.winsNeeded) return 0;
    if (this.p2Wins >= this.winsNeeded) return 1;
    return null;
  }

  /** Determine round winner from health. 0=P1, 1=P2, null=draw */
  determineWinner(): number | null {
    const h1 = this.p1.health, h2 = this.p2.health;
    if (h1 <= 0 && h2 <= 0) return null;
    if (h1 <= 0) return 1;
    if (h2 <= 0) return 0;
    return h1 > h2 ? 0 : h2 > h1 ? 1 : null;
  }

  /** Start fade-to-black transition for next round */
  startRoundTransition(): void {
    this.fadeDirection = 1;
    this.fadeCallback = () => {
      this.currentRound++;
      this.resetForNewRound();
      this.fadeDirection = -1; // fade back in
    };
  }

  /**
   * Start a cinematic round transition with three phases:
   *  1. Fade to black (fadeDirection=1)
   *  2. Hold black for HOLD_BLACK_DURATION frames
   *  3. Fade in from black (fadeDirection=-1)
   * On fade-out peak: round increments, fighters reset, onPeakCallback fires.
   * On transition complete: onCompleteCallback fires.
   */
  startCinematicTransition(
    onPeakCallback: (() => void) | null = null,
    onCompleteCallback: (() => void) | null = null,
    transitionStyle: 'wipe' | 'curtain' | 'zoom' = 'wipe',
  ): void {
    this.transitionPhase = RoundTransitionPhase.NONE; // will enter hold after fade-out
    this.fadeDirection = 1;
    this.fadeAlpha = 0;
    this.holdBlackFrames = 0;
    this.transitionType = transitionStyle;
    this.transitionTick = 0;
    // Store the peak callback — fires when fade reaches full black
    this.fadeCallback = () => {
      // Reset round state at peak of fade-out
      this.currentRound++;
      this.resetForNewRound();
      onPeakCallback?.();
      // Transition to hold-black phase
      this.transitionPhase = RoundTransitionPhase.HOLD_BLACK;
      this.holdBlackFrames = 0;
      this.fadeDirection = 0; // pause fade during hold
    };
    this.transitionCompleteCallback = onCompleteCallback;
  }

  /** Tick fade alpha and transition state machine. Returns true while fade/transition is active. */
  tickFade(): boolean {
    // Advance wipe/curtain tick counter when a transition is active
    if ((this.transitionType === 'wipe' || this.transitionType === 'curtain' || this.transitionType === 'zoom') && this.isTransitioning()) {
      this.transitionTick++;
    }

    // Phase: hold black — count frames, then start fade-in
    if (this.transitionPhase === RoundTransitionPhase.HOLD_BLACK) {
      this.holdBlackFrames++;
      if (this.holdBlackFrames >= this.HOLD_BLACK_DURATION) {
        this.transitionPhase = RoundTransitionPhase.FADE_IN;
        this.fadeDirection = -1; // start fading back in
      }
      return true;
    }

    // Phase: fade-in from black
    if (this.transitionPhase === RoundTransitionPhase.FADE_IN) {
      this.fadeAlpha -= 0.05; // slightly faster fade-in for snappy feel
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.fadeDirection = 0;
        this.transitionPhase = RoundTransitionPhase.NONE;
        this.transitionCompleteCallback?.();
        this.transitionCompleteCallback = null;
      }
      return true;
    }

    // Normal fade (legacy path)
    if (this.fadeDirection === 0) return false;
    this.fadeAlpha += this.fadeDirection * 0.04;
    if (this.fadeAlpha >= 1 && this.fadeDirection === 1) {
      this.fadeAlpha = 1;
      this.fadeCallback?.();
      this.fadeCallback = null;
    }
    if (this.fadeAlpha <= 0 && this.fadeDirection === -1) {
      this.fadeAlpha = 0;
      this.fadeDirection = 0;
    }
    return true;
  }

  /** Reset fighters + subsystems for a new round (keeps power gauge — authentic KOF) */
  private resetForNewRound(): void {
    this.p1.reset(STAGE_WIDTH * 0.30);
    this.p2.reset(STAGE_WIDTH * 0.70);
    this.tickRef.value = 0;
    this.p1Cmd.reset();
    this.p2Cmd.reset();
    this.combatSystem.reset();
    this.projectiles.length = 0;
    this.vfx.reset();
    this.cinematic.resetForNewRound();
  }

  /** Full match restart (back to select screen) */
  fullReset(): void {
    this.p1.reset(STAGE_WIDTH * 0.30);
    this.p2.reset(STAGE_WIDTH * 0.70);
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.currentRound = 1;
    this.tickRef.value = 0;
    this.p1Cmd.reset();
    this.p2Cmd.reset();
    this.combatSystem.reset();
    this.projectiles.length = 0;
    this.vfx.reset();
    this.cinematic.reset();
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.fadeCallback = null;
    this.transitionPhase = RoundTransitionPhase.NONE;
    this.holdBlackFrames = 0;
    this.transitionCompleteCallback = null;
    this.transitionType = 'fade';
    this.transitionTick = 0;
    resetMeterSystem(this.gauges[0], this.maxModes[0]);
    resetMeterSystem(this.gauges[1], this.maxModes[1]);
  }

  /** Reset fighters for next round (called externally after currentRound++). */
  resetForNextRound(): void {
    this.p1.reset(STAGE_WIDTH * 0.30);
    this.p2.reset(STAGE_WIDTH * 0.70);
    this.tickRef.value = 0;
    this.p1Cmd.reset();
    this.p2Cmd.reset();
    this.combatSystem.reset();
    this.projectiles.length = 0;
    this.vfx.reset();
    this.cinematic.resetForNewRound();
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.fadeCallback = null;
    this.transitionPhase = RoundTransitionPhase.NONE;
    this.holdBlackFrames = 0;
    this.transitionCompleteCallback = null;
    this.transitionType = 'fade';
    this.transitionTick = 0;
  }
}
