import { AttackType, DirectionInput } from '../core/types.js';
import { COMMAND_WINDOW, HCF_WINDOW, DOUBLE_QCF_WINDOW } from '../core/constants.js';

interface DirectionRecord {
  direction: DirectionInput;
  frame: number;
}

export class CommandBuffer {
  private history: DirectionRecord[] = [];

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
   * Check for special move inputs.
   * Returns the special move type if detected, null otherwise.
   * Must be called when an attack button is pressed.
   */
  checkSpecial(currentFrame: number, attackPressed: boolean): AttackType | null {
    if (!attackPressed) return null;

    // Get recent directions within command window
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= COMMAND_WINDOW,
    );

    // Check Dragon Punch: forward → down → downforward + attack
    // Shortcut: forward → down + attack
    if (this.matchSequence(recent, ['forward', 'down', 'downforward'])) {
      return AttackType.SPECIAL_UPPER;
    }
    if (this.matchSequence(recent, ['forward', 'down'])) {
      return AttackType.SPECIAL_UPPER;
    }

    // Check Quarter-Circle Forward: down → downforward → forward + attack
    // Shortcut: down → forward + attack
    if (this.matchSequence(recent, ['down', 'downforward', 'forward'])) {
      return AttackType.SPECIAL_PROJECTILE;
    }
    if (this.matchSequence(recent, ['down', 'forward'])) {
      return AttackType.SPECIAL_PROJECTILE;
    }

    return null;
  }

  /**
   * Check for DM (Desperation Move) inputs.
   * Uses a wider window for complex motions.
   */
  checkDM(currentFrame: number, attackPressed: boolean): AttackType | null {
    if (!attackPressed) return null;

    // 大蛇薙: ↓↙←↙↓↘→ (HCF-like: back→down→downforward→forward)
    // Simplified as: back → down → forward (half-circle forward shortcut)
    const wideRecent = this.history.filter(
      (r) => currentFrame - r.frame <= HCF_WINDOW,
    );
    if (this.matchSequence(wideRecent, ['back', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['back', 'down', 'forward'])) {
      return AttackType.DM_OROCHINAGI;
    }

    // Also accept: down→back→down→forward (qcb→qcf pattern)
    const dmRecent = this.history.filter(
      (r) => currentFrame - r.frame <= DOUBLE_QCF_WINDOW,
    );
    if (this.matchSequence(dmRecent, ['down', 'downback', 'back', 'down', 'downforward', 'forward'])
      || this.matchSequence(dmRecent, ['down', 'back', 'down', 'forward'])) {
      return AttackType.DM_OROCHINAGI;
    }

    return null;
  }

  /** Reset buffer (e.g., on knockdown) */
  reset(): void {
    this.history = [];
  }

  /** Get recent N direction records for debug visualization */
  getRecentHistory(count: number): DirectionRecord[] {
    return this.history.slice(-count);
  }

  private matchSequence(
    recent: DirectionRecord[],
    sequence: DirectionInput[],
  ): boolean {
    if (recent.length < sequence.length) return false;

    // Try to find the sequence in order within recent history
    let seqIdx = 0;
    for (let i = 0; i < recent.length && seqIdx < sequence.length; i++) {
      if (recent[i].direction === sequence[seqIdx]) {
        seqIdx++;
      }
    }
    return seqIdx === sequence.length;
  }
}
