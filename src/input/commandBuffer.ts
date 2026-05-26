import { DirectionInput, AttackType } from '../core/types.js';
import { COMMAND_WINDOW, HCF_WINDOW, DOUBLE_QCF_WINDOW, CHARGE_FRAMES_REQUIRED, RECOVERY_INPUT_BUFFER } from '../core/constants.js';

/** DM motion types detected from command buffer — characters map these to their own DM */
export type DMMotion = 'QCFx2_P' | 'QCFx2_K' | 'QCBx2_K' | 'QCBx2_P' | 'QCB_HCF_P' | 'QCB_HCF_K' | null;

/** Charge direction type for charge motion detection */
export type ChargeDirection = 'down' | 'back' | 'downback';

/** Charge state tracked by the buffer */
export interface ChargeState {
  direction: ChargeDirection;
  frames: number;
  ready: boolean;
}

interface DirectionRecord {
  direction: DirectionInput;
  frame: number;
}

interface ButtonRecord {
  button: 'punch' | 'kick' | 'blowback';
  frame: number;
  type: 'press' | 'release';
}

/**
 * CommandBuffer — KOF-style input recognition engine
 *
 * v2: 12-frame command window, QCF leniency, priority-based detection,
 *     charge motion support, enhanced negative edge.
 */
export class CommandBuffer {
  private history: DirectionRecord[] = [];
  private buttonHistory: ButtonRecord[] = [];

  // Charge tracking — tracks how many consecutive frames each charge direction is held
  private chargeFrames: Record<ChargeDirection, number> = {
    down: 0,
    back: 0,
    downback: 0,
  };
  private chargeWasReady: Record<ChargeDirection, boolean> = {
    down: false,
    back: false,
    downback: false,
  };

  // Recovery input buffer — tracks hitstun/blockstun state so that
  // direction inputs recorded during recovery can still match special
  // commands for RECOVERY_INPUT_BUFFER frames after recovery ends.
  private recoveryActive = false;
  private recoveryEndFrame = -1;

  /** Record direction input for this frame */
  record(direction: DirectionInput, frame: number): void {
    if (direction !== 'neutral') {
      this.history.push({ direction, frame });
    }
    // Trim old entries
    if (this.history.length > 40) {
      this.history = this.history.slice(-30);
    }
  }

  /**
   * Set whether the character is currently in hitstun/blockstun recovery.
   * When active transitions to false, the recovery end frame is recorded so
   * that direction inputs buffered during recovery remain valid for
   * RECOVERY_INPUT_BUFFER frames.
   *
   * @param active true when entering hitstun/blockstun, false on recovery
   * @param currentFrame the current game frame number
   */
  setRecoveryWindow(active: boolean, currentFrame: number): void {
    if (this.recoveryActive && !active) {
      // Transitioning from recovery to free — record the end frame
      this.recoveryEndFrame = currentFrame;
    }
    this.recoveryActive = active;
  }

  /**
   * Whether we are currently within the recovery input buffer window.
   * Returns true for RECOVERY_INPUT_BUFFER frames after recovery ends.
   */
  private isInRecoveryBuffer(currentFrame: number): boolean {
    if (this.recoveryActive) return true;
    if (this.recoveryEndFrame < 0) return false;
    return currentFrame - this.recoveryEndFrame < RECOVERY_INPUT_BUFFER;
  }

  /**
   * Get the effective command window for the current frame.
   * During and shortly after recovery, direction inputs that were recorded
   * while in recovery are granted an extended window so they can still match.
   */
  private getEffectiveCommandWindow(currentFrame: number): number {
    if (!this.isInRecoveryBuffer(currentFrame)) return COMMAND_WINDOW;
    // Extend the window to cover inputs recorded during recovery.
    // The effective window = COMMAND_WINDOW + time since recovery ended
    // (clamped so inputs before recovery started are not included).
    if (this.recoveryActive) {
      // Still in recovery — inputs are buffered, extend to COMMAND_WINDOW
      // plus enough to cover the full recovery duration up to now.
      // Use a generous window: COMMAND_WINDOW + RECOVERY_INPUT_BUFFER
      return COMMAND_WINDOW + RECOVERY_INPUT_BUFFER;
    }
    // Post-recovery buffer window
    const framesSinceRecovery = currentFrame - this.recoveryEndFrame;
    return COMMAND_WINDOW + RECOVERY_INPUT_BUFFER - framesSinceRecovery;
  }

  /**
   * Get the effective DM command window for the current frame.
   * Same logic as getEffectiveCommandWindow but for DM motions (DOUBLE_QCF_WINDOW).
   */
  private getEffectiveDMWindow(currentFrame: number): number {
    if (!this.isInRecoveryBuffer(currentFrame)) return DOUBLE_QCF_WINDOW;
    if (this.recoveryActive) {
      return DOUBLE_QCF_WINDOW + RECOVERY_INPUT_BUFFER;
    }
    const framesSinceRecovery = currentFrame - this.recoveryEndFrame;
    return DOUBLE_QCF_WINDOW + RECOVERY_INPUT_BUFFER - framesSinceRecovery;
  }

  /**
   * Get the effective HCF window for the current frame.
   * Same logic but for HCF motions (HCF_WINDOW).
   */
  private getEffectiveHCFWindow(currentFrame: number): number {
    if (!this.isInRecoveryBuffer(currentFrame)) return HCF_WINDOW;
    if (this.recoveryActive) {
      return HCF_WINDOW + RECOVERY_INPUT_BUFFER;
    }
    const framesSinceRecovery = currentFrame - this.recoveryEndFrame;
    return HCF_WINDOW + RECOVERY_INPUT_BUFFER - framesSinceRecovery;
  }

  /**
   * Update charge state based on current direction.
   * Must be called once per frame with the raw direction input.
   * Returns the updated ChargeState for each direction.
   */
  updateCharge(direction: DirectionInput): Record<ChargeDirection, ChargeState> {
    // Increment charge for held directions
    const isDown = direction === 'down' || direction === 'downforward' || direction === 'downback';
    const isBack = direction === 'back' || direction === 'upback' || direction === 'downback';
    const isDownBack = direction === 'downback';

    if (isDown) this.chargeFrames.down++;
    else this.chargeFrames.down = 0;

    if (isBack) this.chargeFrames.back++;
    else this.chargeFrames.back = 0;

    if (isDownBack) this.chargeFrames.downback++;
    else this.chargeFrames.downback = 0;

    const result: Record<ChargeDirection, ChargeState> = {
      down: { direction: 'down', frames: this.chargeFrames.down, ready: this.chargeFrames.down >= CHARGE_FRAMES_REQUIRED },
      back: { direction: 'back', frames: this.chargeFrames.back, ready: this.chargeFrames.back >= CHARGE_FRAMES_REQUIRED },
      downback: { direction: 'downback', frames: this.chargeFrames.downback, ready: this.chargeFrames.downback >= CHARGE_FRAMES_REQUIRED },
    };

    // Track when charge transitions to ready (for visual indicator)
    this.chargeWasReady.down = result.down.ready;
    this.chargeWasReady.back = result.back.ready;
    this.chargeWasReady.downback = result.downback.ready;

    return result;
  }

  /** Get current charge state (read-only) */
  getChargeState(direction: ChargeDirection): ChargeState {
    return {
      direction,
      frames: this.chargeFrames[direction],
      ready: this.chargeFrames[direction] >= CHARGE_FRAMES_REQUIRED,
    };
  }

  /**
   * Check if a charge motion was completed: held direction for CHARGE_FRAMES_REQUIRED
   * frames, then released to the opposite direction + button.
   *
   * down-charge-up: hold down 40+ frames, then up/upforward + button
   * back-charge-forward: hold back 40+ frames, then forward/upforward + button
   */
  checkChargeMotion(
    currentDirection: DirectionInput,
    buttonPressed: 'punch' | 'kick',
    currentFrame: number,
  ): 'down_charge_up' | 'back_charge_forward' | null {
    // Negative Edge: check button release too
    const edgeTriggered = buttonPressed === 'punch'
      ? this.wasRecentlyReleased('punch', currentFrame)
      : this.wasRecentlyReleased('kick', currentFrame);

    const hasButton = buttonPressed === 'punch'
      ? true
      : true;

    // We rely on the caller to pass actual press state. For charge, the button press
    // happens when the player presses the button while releasing the charge direction.
    // The chargeFrames still hold the value from BEFORE the direction changed.

    // Down charge → release to up: ↓蓄↑
    // The player was holding down (chargeFrames.down was high), then switched to up
    const downChargeReady = this.chargeWasReady.down;
    if (downChargeReady && (currentDirection === 'up' || currentDirection === 'upforward')) {
      // Charge was ready and direction changed to up — this is a charge release
      this.chargeFrames.down = 0;
      this.chargeWasReady.down = false;
      return 'down_charge_up';
    }

    // Back charge → release to forward: ←蓄→
    const backChargeReady = this.chargeWasReady.back;
    if (backChargeReady && (currentDirection === 'forward' || currentDirection === 'upforward')) {
      this.chargeFrames.back = 0;
      this.chargeWasReady.back = false;
      return 'back_charge_forward';
    }

    return null;
  }

  /** Record button press event */
  recordPress(button: 'punch' | 'kick' | 'blowback', frame: number): void {
    this.buttonHistory.push({ button, frame, type: 'press' });
    this.trimButtons();
  }

  /** Record button release event (Negative Edge) */
  recordRelease(button: 'punch' | 'kick' | 'blowback', frame: number): void {
    this.buttonHistory.push({ button, frame, type: 'release' });
    this.trimButtons();
  }

  private trimButtons(): void {
    if (this.buttonHistory.length > 30) {
      this.buttonHistory = this.buttonHistory.slice(-20);
    }
  }

  /** Check if a button was recently released (Negative Edge detection) */
  wasRecentlyReleased(button: 'punch' | 'kick' | 'blowback', currentFrame: number, window: number = 3): boolean {
    return this.buttonHistory.some(
      (r) => r.button === button && r.type === 'release' && currentFrame - r.frame <= window,
    );
  }

  /**
   * Check for special move inputs with priority system.
   * More complex motions are checked first to prevent simple motions stealing priority.
   * Supports both button press and Negative Edge (button release).
   *
   * Priority order:
   *   1. Dragon Punch (→↓↘) — 3 inputs, highest priority
   *   2. Quarter-Circle Forward (↓↘→) — 3 inputs with leniency
   */
  checkSpecial(currentFrame: number, attackPressed: boolean): AttackType | null {
    // Negative Edge: 松键也能触发必杀技
    const punchReleased = this.wasRecentlyReleased('punch', currentFrame);
    const kickReleased = this.wasRecentlyReleased('kick', currentFrame);
    if (!attackPressed && !punchReleased && !kickReleased) return null;

    // Get recent directions within effective command window
    // (extended during/after recovery for buffered input matching)
    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );

    // Priority 1: Dragon Punch →↓↘+P (3-direction motion)
    // Full: forward → down → downforward + attack
    // Shortcut: forward → down + attack
    if (this.matchSequence(recent, ['forward', 'down', 'downforward'])) {
      return AttackType.SPECIAL_UPPER;
    }
    // DP shortcut: →↓ (2-step)
    if (this.matchSequence(recent, ['forward', 'down'])
      && !this.matchSequence(recent, ['down', 'downforward', 'forward'])
      && !this.matchSequence(recent, ['down', 'forward'])) {
      return AttackType.SPECIAL_UPPER;
    }

    // Priority 2: Quarter-Circle Forward ↓↘→+P
    // Full: down → downforward → forward
    // Lenient: accepts down → forward (skipping downforward)
    if (this.matchSequence(recent, ['down', 'downforward', 'forward'])
      || this.matchSequenceLenient(recent, ['down', 'forward'])) {
      return AttackType.SPECIAL_PROJECTILE;
    }

    return null;
  }

  /**
   * Detect DM input motions. Returns motion type, not specific DM.
   * Characters map the motion to their own DM in routeSpecial().
   */
  checkDMMotion(currentFrame: number, punchPressed: boolean, kickPressed: boolean): DMMotion {
    // Negative Edge for DM
    const punchEdge = punchPressed || this.wasRecentlyReleased('punch', currentFrame);
    const kickEdge = kickPressed || this.wasRecentlyReleased('kick', currentFrame);
    if (!punchEdge && !kickEdge) return null;

    const effectiveDMWindow = this.getEffectiveDMWindow(currentFrame);
    const wideRecent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveDMWindow,
    );

    // QCFx2 (↓↘→↓↘→): multiple shortcut patterns
    const hasDoubleQCF = this.matchSequence(wideRecent, ['down', 'downforward', 'forward', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'forward', 'down', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'downforward', 'forward', 'down', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'forward', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['downforward', 'forward', 'downforward', 'forward']);

    if (hasDoubleQCF && punchEdge) return 'QCFx2_P';
    if (hasDoubleQCF && kickEdge) return 'QCFx2_K';

    // QCBx2 (↓↙←↓↙←): multiple shortcut patterns
    const hasDoubleQCB = this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'downback', 'back'])
      || this.matchSequence(wideRecent, ['down', 'back', 'down', 'back'])
      || this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'back'])
      || this.matchSequence(wideRecent, ['down', 'back', 'down', 'downback', 'back']);

    if (hasDoubleQCB && kickEdge) return 'QCBx2_K';
    if (hasDoubleQCB && punchEdge) return 'QCBx2_P';

    // QCB HCF (↓↙←↙↓↘→): common KOF ultra input (like Orochinagi, Ya Otome)
    const hasQcbHcf = this.matchSequence(wideRecent, ['down', 'back', 'down', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'back', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'forward']);

    if (hasQcbHcf && punchEdge) return 'QCB_HCF_P';
    if (hasQcbHcf && kickEdge) return 'QCB_HCF_K';

    return null;
  }

  /** Check kick special moves (75改, R.E.D. Kick) — supports Negative Edge */
  checkKickSpecial(currentFrame: number, kickPressed: boolean): AttackType | null {
    if (!kickPressed && !this.wasRecentlyReleased('kick', currentFrame)) return null;

    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );

    // QCB ↓↙←+K → R.E.D. Kick
    if (this.matchSequence(recent, ['down', 'downback', 'back'])) {
      return AttackType.KYO_RED_KICK;
    }

    // QCF ↓↘→+K → 75式改
    if (this.matchSequence(recent, ['down', 'downforward', 'forward'])) {
      return AttackType.KYO_75KAI;
    }

    return null;
  }

  /** Check rekka followup: QCF+P during recovery — supports Negative Edge */
  checkRekkaFollowQCF(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed && !this.wasRecentlyReleased('punch', currentFrame)) return null;
    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    if (this.matchSequence(recent, ['down', 'forward'])
      || this.matchSequence(recent, ['down', 'downforward', 'forward'])) {
      return AttackType.KYO_ARAGAMI_KONOKIZU;  // 九傷
    }
    return null;
  }

  /** Check rekka followup: HCB+P during recovery — supports Negative Edge */
  checkRekkaFollowHCB(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed && !this.wasRecentlyReleased('punch', currentFrame)) return null;
    const effectiveWindow = this.getEffectiveHCFWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    if (this.matchSequence(recent, ['forward', 'down', 'back'])
      || this.matchSequence(recent, ['forward', 'downforward', 'down', 'downback', 'back'])) {
      return AttackType.KYO_ARAGAMI_YANOSABI;  // 八錆
    }
    return null;
  }

  /** Check dokugami chain followup: HCB+P after 毒咬み — supports Negative Edge */
  checkDokugamiFollow(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed && !this.wasRecentlyReleased('punch', currentFrame)) return null;
    const effectiveWindow = this.getEffectiveHCFWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    // HCB for 罪詠み
    if (this.matchSequence(recent, ['forward', 'down', 'back'])
      || this.matchSequence(recent, ['forward', 'downforward', 'down', 'downback', 'back'])) {
      return AttackType.KYO_TSUMIYOMI;
    }
    return null;
  }

  /** Check dokugami final: f+P after 罪詠み */
  checkBatsuyomiInput(forward: boolean, punchPressed: boolean): boolean {
    return forward && punchPressed;
  }

  /** Check if QCF motion is present in recent history */
  hasQCF(currentFrame: number): boolean {
    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    return this.matchSequence(recent, ['down', 'downforward', 'forward'])
      || this.matchSequenceLenient(recent, ['down', 'forward']);
  }

  /** Check if QCB motion is present in recent history */
  hasQCB(currentFrame: number): boolean {
    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    return this.matchSequence(recent, ['down', 'downback', 'back'])
      || this.matchSequenceLenient(recent, ['down', 'back']);
  }

  /** Check if HCB motion is present in recent history (→↓←) */
  hasHCB(currentFrame: number): boolean {
    const effectiveWindow = this.getEffectiveHCFWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    return this.matchSequence(recent, ['forward', 'downforward', 'down', 'downback', 'back'])
      || this.matchSequence(recent, ['forward', 'down', 'back']);
  }

  /** Check if ↓↓ motion is present in recent history */
  hasDD(currentFrame: number): boolean {
    const effectiveWindow = this.getEffectiveCommandWindow(currentFrame);
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= effectiveWindow,
    );
    let downCount = 0;
    for (const r of recent) {
      if (r.direction === 'down') downCount++;
      else if (r.direction !== 'downforward' && r.direction !== 'downback') break;
    }
    return downCount >= 2;
  }

  /**
   * Check if charge direction has been held long enough and the player
   * has released to the target direction.
   * Used for characters like Leona, Kim, Terry who have charge moves.
   *
   * @param chargeDir The direction that must be charged (down/back/downback)
   * @param releaseDir The release direction that triggers the move
   * @param currentDirection Current raw direction input
   * @returns true if charge was successfully released
   */
  checkChargeRelease(
    chargeDir: ChargeDirection,
    releaseDir: DirectionInput,
    currentDirection: DirectionInput,
  ): boolean {
    const chargeReady = this.chargeFrames[chargeDir] >= CHARGE_FRAMES_REQUIRED;
    if (!chargeReady) return false;

    // Check if current direction matches the release direction
    const matches = currentDirection === releaseDir
      || (releaseDir === 'up' && (currentDirection === 'up' || currentDirection === 'upforward'))
      || (releaseDir === 'forward' && (currentDirection === 'forward' || currentDirection === 'upforward'));

    if (matches) {
      this.chargeFrames[chargeDir] = 0;
      return true;
    }
    return false;
  }

  /** Reset buffer (e.g., on knockdown) */
  reset(): void {
    this.history = [];
    this.chargeFrames = { down: 0, back: 0, downback: 0 };
    this.chargeWasReady = { down: false, back: false, downback: false };
    this.recoveryActive = false;
    this.recoveryEndFrame = -1;
  }

  /** Get recent N direction records for debug visualization */
  getRecentHistory(count: number): DirectionRecord[] {
    return this.history.slice(-count);
  }

  /**
   * Match an exact direction sequence within the recent history.
   * The sequence must appear in order, but other directions can appear between them.
   */
  private matchSequence(
    recent: DirectionRecord[],
    sequence: DirectionInput[],
  ): boolean {
    if (recent.length < sequence.length) return false;

    let seqIdx = 0;
    for (let i = 0; i < recent.length && seqIdx < sequence.length; i++) {
      if (recent[i].direction === sequence[seqIdx]) {
        seqIdx++;
      }
    }
    return seqIdx === sequence.length;
  }

  /**
   * Lenient sequence matcher for quarter-circle motions.
   * Allows the intermediate diagonal direction to be skipped,
   * but requires that adjacent directions are temporally close
   * (within a leniency window to prevent false positives from
   * unrelated direction changes).
   *
   * For QCF: down → forward is accepted only if the two inputs
   * are within 6 frames of each other (preventing false QCF from
   * crouch→walk forward).
   */
  private matchSequenceLenient(
    recent: DirectionRecord[],
    sequence: DirectionInput[],
  ): boolean {
    if (recent.length < sequence.length) return false;
    const LENIENCY_FRAMES = 10; // 给跳键盘缺对角线的留更多宽限

    let seqIdx = 0;
    let matchStartFrame = -1;
    for (let i = 0; i < recent.length && seqIdx < sequence.length; i++) {
      if (recent[i].direction === sequence[seqIdx]) {
        if (seqIdx === 0) {
          matchStartFrame = recent[i].frame;
        }
        seqIdx++;
      }
    }

    if (seqIdx < sequence.length) return false;

    // For lenient 2-step motions (e.g., down→forward), check temporal proximity
    const lastMatch = recent.find(
      (r, idx) => {
        // Find the last element that matched
        let count = 0;
        for (let j = 0; j <= idx && count < sequence.length; j++) {
          if (recent[j].direction === sequence[count]) count++;
        }
        return count === sequence.length;
      },
    );

    if (lastMatch && matchStartFrame >= 0) {
      return lastMatch.frame - matchStartFrame <= LENIENCY_FRAMES;
    }

    return true;
  }
}
