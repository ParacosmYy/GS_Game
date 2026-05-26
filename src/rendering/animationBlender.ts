/**
 * AnimationBlender — position/offset blending for state transitions
 *
 * Manages smooth interpolation between fighter positions/offsets when
 * transitioning between animations. This is separate from the pose-level
 * blending in skeletalFighter.ts — the blender handles the spatial offset
 * (x, y displacement) that makes transitions feel fluid.
 *
 * Design:
 *   - Opt-in per transition type: blend durations are configured by (from, to) pair
 *   - Simple lerp: result = from * (1-t) + to * t
 *   - Short blends for responsive feel (2-5 ticks)
 *   - Instant transitions for attacks and hit reactions (KOF requirement)
 */

/** Current state of an active blend between two actions */
export interface BlendState {
  /** Action/state transitioning from */
  fromAction: string;
  /** Frame index in the source action at blend start */
  fromFrame: number;
  /** Action/state transitioning to */
  toAction: string;
  /** Frame index in the target action (typically 0 for blend start) */
  toFrame: number;
  /** Current blend progress: 0 = fully source, 1 = fully target */
  blendProgress: number;
  /** Total blend duration in ticks */
  blendDuration: number;
}

/** Configuration for which transitions blend and for how long */
export interface BlendProfile {
  /** Duration in ticks (0 = instant, no blend) */
  duration: number;
}

/** Position/offset pair for interpolation */
export interface BlendablePosition {
  offsetX: number;
  offsetY: number;
}

// === Transition blend rules ===
// Returns the blend duration (in ticks) for a given state transition.
// 0 means instant (no blend), matching KOF gameplay requirements.

function getBlendDuration(from: string, to: string): number {
  // ── Instant transitions (KOF: attacks must respond immediately) ──
  if (to === 'HITSTUN' || to === 'KNOCKDOWN') return 0;
  if (to === 'STAND_ATTACK' || to === 'CROUCH_ATTACK' || to === 'AIR_ATTACK') return 0;
  if (to === 'COUNTER_STANCE' || to === 'THROW') return 0;
  if (from === 'HITSTUN' && to === 'KNOCKDOWN') return 0;

  // ── Idle <-> Walk: smooth weight shift ──
  if (from === 'IDLE' && to === 'WALK') return 4;
  if (from === 'WALK' && to === 'IDLE') return 4;
  if (from === 'WALK' && to === 'WALK') return 0; // same state, no blend

  // ── Idle <-> Run ──
  if (from === 'IDLE' && to === 'RUN') return 3;
  if (from === 'RUN' && to === 'IDLE') return 3;
  if (from === 'WALK' && to === 'RUN') return 3;
  if (from === 'RUN' && to === 'WALK') return 3;

  // ── Jump transitions ──
  if (from === 'IDLE' && (to === 'JUMP' || to === 'HOP' || to === 'HYPER_JUMP' || to === 'RUN_JUMP')) return 3;
  // Landing
  if ((from === 'JUMP' || from === 'HOP' || from === 'HYPER_JUMP' || from === 'RUN_JUMP') && to === 'IDLE') return 4;
  if ((from === 'JUMP' || from === 'HOP' || from === 'HYPER_JUMP' || from === 'RUN_JUMP') && to === 'CROUCH') return 3;

  // ── Walk -> Crouch ──
  if (from === 'WALK' && to === 'CROUCH') return 3;
  if (from === 'IDLE' && to === 'CROUCH') return 3;
  if (from === 'CROUCH' && to === 'IDLE') return 3;
  if (from === 'CROUCH' && to === 'WALK') return 3;

  // ── Getup -> Idle: instant ──
  if (from === 'KNOCKDOWN' && to === 'IDLE') return 0;

  // ── Block transitions: quick ──
  if (to === 'BLOCK' || to === 'AIR_BLOCK') return 2;
  if (from === 'BLOCK' && to === 'IDLE') return 2;

  // ── Roll/backdash: instant commitment ──
  if (to === 'ROLL' || to === 'BACK_ROLL' || to === 'BACKDASH') return 0;

  // ── Default: no blend ──
  return 0;
}

export class AnimationBlender {
  private activeBlend: BlendState | null = null;

  /**
   * Start a new blend transition.
   * If a blend is already active, the current blend is discarded.
   * If duration is 0, no blend is started (instant transition).
   */
  startBlend(from: string, fromFrame: number, to: string, duration: number): void {
    if (duration <= 0) {
      this.activeBlend = null;
      return;
    }
    this.activeBlend = {
      fromAction: from,
      fromFrame,
      toAction: to,
      toFrame: 0,
      blendProgress: 0,
      blendDuration: duration,
    };
  }

  /**
   * Start a blend by looking up the transition profile.
   * Returns true if a blend was started, false if instant.
   */
  startBlendFromProfile(from: string, fromFrame: number, to: string): boolean {
    const duration = getBlendDuration(from, to);
    if (duration <= 0) {
      this.activeBlend = null;
      return false;
    }
    this.startBlend(from, fromFrame, to, duration);
    return true;
  }

  /** Advance the blend by one tick */
  update(): void {
    if (!this.activeBlend) return;
    this.activeBlend.blendProgress += 1 / this.activeBlend.blendDuration;
    if (this.activeBlend.blendProgress >= 1) {
      this.activeBlend = null;
    }
  }

  /** Get the current blend state, or null if not blending */
  getBlendState(): BlendState | null {
    return this.activeBlend;
  }

  /** Whether a blend is currently active */
  isBlending(): boolean {
    return this.activeBlend !== null;
  }

  /** Cancel any active blend (for attacks that need instant transition) */
  cancel(): void {
    this.activeBlend = null;
  }

  /**
   * Interpolate between two positions using the current blend factor.
   * If not blending, returns the target position unchanged.
   */
  interpolate(from: BlendablePosition, to: BlendablePosition): BlendablePosition {
    if (!this.activeBlend) return to;
    const t = this.activeBlend.blendProgress;
    return {
      offsetX: from.offsetX + (to.offsetX - from.offsetX) * t,
      offsetY: from.offsetY + (to.offsetY - from.offsetY) * t,
    };
  }
}

/**
 * Per-fighter blend manager.
 * Uses a Map keyed by fighter index to track blend state.
 * This avoids mutating the Fighter entity itself.
 */
const fighterBlenders = new Map<number, AnimationBlender>();

/** Get or create an AnimationBlender for a fighter index */
export function getFighterBlender(fighterIndex: number): AnimationBlender {
  let blender = fighterBlenders.get(fighterIndex);
  if (!blender) {
    blender = new AnimationBlender();
    fighterBlenders.set(fighterIndex, blender);
  }
  return blender;
}

/** Clear all per-fighter blenders (e.g., on round reset) */
export function resetAllBlenders(): void {
  fighterBlenders.clear();
}

// Export the profile lookup for testing
export { getBlendDuration };
