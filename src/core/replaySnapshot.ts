/**
 * Frame State Snapshot & Integrity Verification for Replay Determinism
 *
 * This module provides periodic state hashing during live play and replay,
 * enabling detection of nondeterministic divergence between record and playback.
 *
 * Design constraints:
 * - Snapshots are checksums (FNV-1a hash), not full state, to minimize memory.
 * - Snapshot interval defaults to 60 frames (1 second at 60 FPS).
 * - During replay, recorded snapshots are compared against recomputed ones.
 * - Mismatches are logged with frame number and field-level detail for debugging.
 * - This module is read-only w.r.t. game state: it only captures and compares.
 */

// ---------------------------------------------------------------------------
// FNV-1a hash — fast, deterministic, no external dependency
// ---------------------------------------------------------------------------

const FNV_OFFSET = 0x811c9dc5 >>> 0;
const FNV_PRIME  = 0x01000193 >>> 0;

function fnv1aBegin(): number {
  return FNV_OFFSET;
}

function fnv1aUpdate(hash: number, data: string): number {
  let h = hash;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h;
}

function fnv1aFinal(hash: number): number {
  return hash >>> 0;
}

/**
 * Hash a set of scalar values into a single uint32 checksum.
 * Each value is converted to string and separated by '|' to prevent collisions.
 */
function hashValues(...values: (number | string | boolean | null | undefined)[]): number {
  let h = fnv1aBegin();
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (i > 0) h = fnv1aUpdate(h, '|');
    h = fnv1aUpdate(h, String(v));
  }
  return fnv1aFinal(h);
}

// ---------------------------------------------------------------------------
// Snapshot types
// ---------------------------------------------------------------------------

/** Lightweight per-fighter fields captured into a snapshot checksum. */
export interface FighterSnapshotData {
  x: number;
  y: number;
  health: number;
  state: string;
  facing: number;
  stunGauge: number;
  currentAttack: string | null;
  attackPhase: string;
  hitstunTimer: number;
  blockstunTimer: number;
  knockdownTimer: number;
  juggleState: string;
  airHitCount: number;
  jugglePoints: number;
  guardGauge: number;
}

/** Power gauge fields captured into a snapshot checksum. */
export interface GaugeSnapshotData {
  meter: number;
  stocks: number;
}

/** MAX mode state fields captured into a snapshot checksum. */
export interface MaxModeSnapshotData {
  active: boolean;
  timer: number;
}

/** Full frame state captured for hashing. */
export interface FrameStateData {
  frameNumber: number;
  rngState: number;
  gamePhase: string;
  timer: number;
  fighters: [FighterSnapshotData, FighterSnapshotData];
  gauges: [GaugeSnapshotData, GaugeSnapshotData];
  maxModes: [MaxModeSnapshotData, MaxModeSnapshotData];
}

/** A single recorded checkpoint: frame number + checksum. */
export interface FrameCheckpoint {
  frame: number;
  checksum: number;
}

/** Result of comparing recorded vs replayed checkpoints. */
export interface CheckpointMismatch {
  frame: number;
  recordedChecksum: number;
  replayedChecksum: number;
}

/** Full integrity verification result. */
export interface IntegrityReport {
  passed: boolean;
  totalCheckpoints: number;
  mismatches: CheckpointMismatch[];
  /** First frame where divergence was detected, or null if all matched. */
  firstDivergenceFrame: number | null;
}

// ---------------------------------------------------------------------------
// Snapshot computation
// ---------------------------------------------------------------------------

/**
 * Compute a deterministic checksum from frame state data.
 *
 * The hash incorporates every field that affects determinism:
 * positions, health, state, RNG, timer, gauges, MAX mode.
 * The order of hashing is fixed and must not change between sessions.
 */
export function computeFrameChecksum(data: FrameStateData): number {
  const parts: (number | string | boolean | null)[] = [];

  // Frame identity
  parts.push(data.frameNumber);
  parts.push(data.rngState);
  parts.push(data.gamePhase);
  parts.push(data.timer);

  // Both fighters — order is P1 then P2
  for (const f of data.fighters) {
    parts.push(f.x, f.y, f.health, f.state, f.facing);
    parts.push(f.stunGauge, f.currentAttack, f.attackPhase);
    parts.push(f.hitstunTimer, f.blockstunTimer, f.knockdownTimer);
    parts.push(f.juggleState, f.airHitCount, f.jugglePoints);
    parts.push(f.guardGauge);
  }

  // Both gauges — order is P1 then P2
  for (const g of data.gauges) {
    parts.push(g.meter, g.stocks);
  }

  // Both MAX modes — order is P1 then P2
  for (const m of data.maxModes) {
    parts.push(m.active, m.timer);
  }

  return hashValues(...parts);
}

// ---------------------------------------------------------------------------
// Snapshot recorder — used during live play
// ---------------------------------------------------------------------------

/**
 * Records periodic frame checkpoints during a live match.
 * Designed to be embedded in the replay bundle for later verification.
 */
export class SnapshotRecorder {
  private checkpoints: FrameCheckpoint[] = [];
  private readonly interval: number;

  /**
   * @param interval Number of frames between checkpoints. Default 60.
   */
  constructor(interval: number = 60) {
    this.interval = interval;
  }

  /**
   * Called every frame. Captures a checkpoint every `interval` frames.
   * Returns true if a checkpoint was captured this frame.
   */
  tick(frameNumber: number, data: FrameStateData): boolean {
    if (frameNumber > 0 && frameNumber % this.interval === 0) {
      const checksum = computeFrameChecksum(data);
      this.checkpoints.push({ frame: frameNumber, checksum });
      return true;
    }
    return false;
  }

  /** Get all recorded checkpoints (for embedding in replay bundle). */
  getCheckpoints(): FrameCheckpoint[] {
    return this.checkpoints;
  }

  /** Reset the recorder for a new match. */
  reset(): void {
    this.checkpoints = [];
  }

  /** Export checkpoints to a JSON-serializable format. */
  export(): FrameCheckpoint[] {
    return this.checkpoints.map(cp => ({ frame: cp.frame, checksum: cp.checksum }));
  }

  /** Import checkpoints from a previously exported array. */
  static import(data: FrameCheckpoint[]): SnapshotRecorder {
    const recorder = new SnapshotRecorder();
    recorder.checkpoints = data.map(cp => ({ frame: cp.frame, checksum: cp.checksum }));
    return recorder;
  }
}

// ---------------------------------------------------------------------------
// Snapshot verifier — used during replay
// ---------------------------------------------------------------------------

export interface VerificationOptions {
  /** Log each mismatch to console.warn with details. Default true. */
  logMismatches?: boolean;
  /** Stop verification after first mismatch. Default false. */
  stopOnFirstMismatch?: boolean;
}

/**
 * Verifies replay integrity by comparing recorded checkpoints against
 * recomputed checksums during replay playback.
 */
export class SnapshotVerifier {
  private readonly recorded: FrameCheckpoint[];
  private currentIndex = 0;
  private mismatches: CheckpointMismatch[] = [];
  private options: Required<VerificationOptions>;

  constructor(recorded: FrameCheckpoint[], options?: VerificationOptions) {
    this.recorded = recorded;
    this.options = {
      logMismatches: options?.logMismatches ?? true,
      stopOnFirstMismatch: options?.stopOnFirstMismatch ?? false,
    };
  }

  /**
   * Called every frame during replay. When the frame matches a recorded
   * checkpoint, recomputes the checksum and compares.
   */
  tick(frameNumber: number, data: FrameStateData): void {
    if (this.currentIndex >= this.recorded.length) return;

    const expected = this.recorded[this.currentIndex];
    if (frameNumber !== expected.frame) return;

    const actual = computeFrameChecksum(data);
    this.currentIndex++;

    if (actual !== expected.checksum) {
      const mismatch: CheckpointMismatch = {
        frame: frameNumber,
        recordedChecksum: expected.checksum,
        replayedChecksum: actual,
      };
      this.mismatches.push(mismatch);

      if (this.options.logMismatches) {
        console.warn(
          `[Replay Integrity] Divergence at frame ${frameNumber}: ` +
          `recorded=0x${expected.checksum.toString(16)}, ` +
          `replayed=0x${actual.toString(16)}`
        );
      }

      if (this.options.stopOnFirstMismatch) {
        // Skip remaining checkpoints
        this.currentIndex = this.recorded.length;
      }
    }
  }

  /** Generate the final integrity report. */
  getReport(): IntegrityReport {
    const firstMismatch = this.mismatches.length > 0
      ? this.mismatches[0].frame
      : null;

    return {
      passed: this.mismatches.length === 0,
      totalCheckpoints: this.recorded.length,
      mismatches: [...this.mismatches],
      firstDivergenceFrame: firstMismatch,
    };
  }

  /** Get number of checkpoints verified so far. */
  getVerifiedCount(): number {
    return this.currentIndex;
  }

  /** Get number of mismatches found so far. */
  getMismatchCount(): number {
    return this.mismatches.length;
  }
}

// ---------------------------------------------------------------------------
// Utility: extract FighterSnapshotData from a Fighter-like object
// ---------------------------------------------------------------------------

/**
 * Extract snapshot-relevant fields from a Fighter instance.
 * Accepts any object with the expected properties to avoid
 * coupling to the Fighter class directly.
 */
export function extractFighterSnapshot(fighter: {
  x: number;
  y: number;
  health: number;
  state: string;
  facing: number;
  stunGauge: number;
  currentAttack: string | null;
  attackPhase: string;
  hitstunTimer: number;
  blockstunTimer: number;
  knockdownTimer: number;
  juggleState: string;
  airHitCount: number;
  jugglePoints: number;
  guardGauge: number;
}): FighterSnapshotData {
  return {
    x: fighter.x,
    y: fighter.y,
    health: fighter.health,
    state: fighter.state,
    facing: fighter.facing,
    stunGauge: fighter.stunGauge,
    currentAttack: fighter.currentAttack,
    attackPhase: fighter.attackPhase,
    hitstunTimer: fighter.hitstunTimer,
    blockstunTimer: fighter.blockstunTimer,
    knockdownTimer: fighter.knockdownTimer,
    juggleState: fighter.juggleState,
    airHitCount: fighter.airHitCount,
    jugglePoints: fighter.jugglePoints,
    guardGauge: fighter.guardGauge,
  };
}

/**
 * Extract snapshot-relevant fields from a PowerGauge.
 */
export function extractGaugeSnapshot(gauge: {
  meter: number;
  stocks: number;
}): GaugeSnapshotData {
  return { meter: gauge.meter, stocks: gauge.stocks };
}

/**
 * Extract snapshot-relevant fields from a MaxModeState.
 */
export function extractMaxModeSnapshot(maxMode: {
  active: boolean;
  timer: number;
}): MaxModeSnapshotData {
  return { active: maxMode.active, timer: maxMode.timer };
}
