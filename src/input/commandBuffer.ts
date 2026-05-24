import { DirectionInput, AttackType } from '../core/types.js';
import { COMMAND_WINDOW, HCF_WINDOW, DOUBLE_QCF_WINDOW } from '../core/constants.js';

/** DM motion types detected from command buffer — characters map these to their own DM */
export type DMMotion = 'QCFx2_P' | 'QCFx2_K' | 'QCBx2_K' | null;

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
    // Dragon Punch: forward → down → downforward + attack
    if (this.matchSequence(recent, ['forward', 'down', 'downforward'])) {
      return AttackType.SPECIAL_UPPER;
    }

    // Quarter-Circle Forward: down → downforward → forward + attack
    // 宽容模式：接受 down→forward 跳过 downforward
    if (this.matchSequence(recent, ['down', 'downforward', 'forward'])
      || this.matchSequence(recent, ['down', 'forward'])) {
      return AttackType.SPECIAL_PROJECTILE;
    }

    return null;
  }

  /**
   * Detect DM input motions. Returns motion type, not specific DM.
   * Characters map the motion to their own DM in routeSpecial().
   */
  checkDMMotion(currentFrame: number, punchPressed: boolean, kickPressed: boolean): DMMotion {
    if (!punchPressed && !kickPressed) return null;

    const wideRecent = this.history.filter(
      (r) => currentFrame - r.frame <= DOUBLE_QCF_WINDOW,
    );

    // QCF×2 (↓↘→↓↘→): multiple shortcut patterns
    const hasDoubleQCF = this.matchSequence(wideRecent, ['down', 'downforward', 'forward', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'forward', 'down', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'downforward', 'forward', 'down', 'forward'])
      || this.matchSequence(wideRecent, ['down', 'forward', 'down', 'downforward', 'forward'])
      || this.matchSequence(wideRecent, ['downforward', 'forward', 'downforward', 'forward']);

    if (hasDoubleQCF && punchPressed) return 'QCFx2_P';
    if (hasDoubleQCF && kickPressed) return 'QCFx2_K';

    // QCB×2 (↓↙←↓↙←): multiple shortcut patterns
    const hasDoubleQCB = this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'downback', 'back'])
      || this.matchSequence(wideRecent, ['down', 'back', 'down', 'back'])
      || this.matchSequence(wideRecent, ['down', 'downback', 'back', 'down', 'back'])
      || this.matchSequence(wideRecent, ['down', 'back', 'down', 'downback', 'back']);

    if (hasDoubleQCB && kickPressed) return 'QCBx2_K';

    return null;
  }

  /** Check kick special moves (75改, R.E.D. Kick) */
  checkKickSpecial(currentFrame: number, kickPressed: boolean): AttackType | null {
    if (!kickPressed) return null;

    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= COMMAND_WINDOW,
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

  /** Check rekka followup: QCF+P during recovery */
  checkRekkaFollowQCF(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed) return null;
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= COMMAND_WINDOW,
    );
    if (this.matchSequence(recent, ['down', 'forward'])
      || this.matchSequence(recent, ['down', 'downforward', 'forward'])) {
      return AttackType.KYO_ARAGAMI_KONOKIZU;  // 九傷
    }
    return null;
  }

  /** Check rekka followup: HCB+P during recovery */
  checkRekkaFollowHCB(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed) return null;
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= HCF_WINDOW,
    );
    if (this.matchSequence(recent, ['forward', 'down', 'back'])
      || this.matchSequence(recent, ['forward', 'downforward', 'down', 'downback', 'back'])) {
      return AttackType.KYO_ARAGAMI_YANOSABI;  // 八錆
    }
    return null;
  }

  /** Check dokugami chain followup: HCB+P after 毒咬み */
  checkDokugamiFollow(currentFrame: number, punchPressed: boolean): AttackType | null {
    if (!punchPressed) return null;
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= HCF_WINDOW,
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
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= COMMAND_WINDOW,
    );
    return this.matchSequence(recent, ['down', 'downforward', 'forward'])
      || this.matchSequence(recent, ['down', 'forward']);
  }

  /** Check if QCB motion is present in recent history */
  hasQCB(currentFrame: number): boolean {
    const recent = this.history.filter(
      (r) => currentFrame - r.frame <= COMMAND_WINDOW,
    );
    return this.matchSequence(recent, ['down', 'downback', 'back'])
      || this.matchSequence(recent, ['down', 'back']);
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
