import { Direction, DirectionInput } from '../core/types.js';

export interface ResolvedInput {
  up: boolean;
  down: boolean;
  forward: boolean;
  back: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonC: boolean;
  buttonD: boolean;
  throwAttack: boolean;
  burst: boolean;
  buttonAPressed: boolean;
  buttonBPressed: boolean;
  buttonCPressed: boolean;
  buttonDPressed: boolean;
  throwAttackPressed: boolean;
  burstPressed: boolean;
  /** Any punch button just pressed (A or C) */
  punchPressed: boolean;
  /** Any kick button just pressed (B or D) */
  kickPressed: boolean;
  /** A+B just pressed (Roll紧急回避) */
  rollPressed: boolean;
  /** C+D just pressed (Blowback Attack) */
  blowbackPressed: boolean;
  /** Negative Edge: punch just released (A or C) */
  punchJustReleased: boolean;
  /** Negative Edge: kick just released (B or D) */
  kickJustReleased: boolean;
  /** Start键按下 (嘲讽) */
  startPressed: boolean;
}

export interface RawInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonC: boolean;
  buttonD: boolean;
  throwAttack: boolean;
  burst: boolean;
  start: boolean;
}

export interface PrevAttack {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  throwAtk: boolean;
  burst: boolean;
}

export function createPrevAttack(): PrevAttack {
  return { a: false, b: false, c: false, d: false, throwAtk: false, burst: false };
}

export function resolveInput(raw: RawInput, facing: Direction, prev: PrevAttack): ResolvedInput {
  const aPressed = raw.buttonA && !prev.a;
  const cPressed = raw.buttonC && !prev.c;
  const bPressed = raw.buttonB && !prev.b;
  const dPressed = raw.buttonD && !prev.d;
  const burstPressed = raw.burst && !prev.burst;
  // Negative Edge: 松键检测
  const aReleased = !raw.buttonA && prev.a;
  const cReleased = !raw.buttonC && prev.c;
  const bReleased = !raw.buttonB && prev.b;
  const dReleased = !raw.buttonD && prev.d;

  return {
    up: raw.up,
    down: raw.down,
    forward: facing === 1 ? raw.right : raw.left,
    back: facing === 1 ? raw.left : raw.right,
    buttonA: raw.buttonA,
    buttonB: raw.buttonB,
    buttonC: raw.buttonC,
    buttonD: raw.buttonD,
    throwAttack: raw.throwAttack,
    burst: raw.burst,
    buttonAPressed: aPressed,
    buttonBPressed: bPressed,
    buttonCPressed: cPressed,
    buttonDPressed: dPressed,
    throwAttackPressed: raw.throwAttack && !prev.throwAtk,
    burstPressed,
    punchPressed: aPressed || cPressed,
    kickPressed: bPressed || dPressed,
    rollPressed: raw.buttonA && raw.buttonB && (aPressed || bPressed),
    blowbackPressed: raw.buttonC && raw.buttonD && (cPressed || dPressed),
    punchJustReleased: aReleased || cReleased,
    kickJustReleased: bReleased || dReleased,
    startPressed: raw.start,
  };
}

export function updatePrevAttack(prev: PrevAttack, raw: RawInput): void {
  prev.a = raw.buttonA;
  prev.b = raw.buttonB;
  prev.c = raw.buttonC;
  prev.d = raw.buttonD;
  prev.throwAtk = raw.throwAttack;
  prev.burst = raw.burst;
}

export function getDirectionInput(input: ResolvedInput): DirectionInput {
  if (input.up && input.forward) return 'upforward';
  if (input.up && input.back) return 'upback';
  if (input.down && input.forward) return 'downforward';
  if (input.down && input.back) return 'downback';
  if (input.up) return 'up';
  if (input.down) return 'down';
  if (input.forward) return 'forward';
  if (input.back) return 'back';
  return 'neutral';
}

// ===== Training Mode Display Helpers =====

/** Direction input symbol mapping for training mode input display */
const DIRECTION_SYMBOLS: Record<DirectionInput, string> = {
  neutral: '·',       // ·
  up: '↑',            // ↑
  down: '↓',          // ↓
  forward: '→',       // →
  back: '←',          // ←
  upforward: '↗',     // ↗
  upback: '↖',        // ↖
  downforward: '↘',   // ↘
  downback: '↙',      // ↙
};

/** Convert a DirectionInput to its display symbol */
export function getDirectionSymbol(dir: DirectionInput): string {
  return DIRECTION_SYMBOLS[dir] || '?';
}

/** Get active button display string for training mode (e.g., "A C") */
export function getButtonDisplayString(input: ResolvedInput): string {
  const buttons: string[] = [];
  if (input.buttonA) buttons.push('A');
  if (input.buttonB) buttons.push('B');
  if (input.buttonC) buttons.push('C');
  if (input.buttonD) buttons.push('D');
  if (input.burst) buttons.push('O');
  return buttons.join(' ');
}

/** Get just-pressed button display string (for input history) */
export function getPressedButtonString(input: ResolvedInput): string[] {
  const buttons: string[] = [];
  if (input.buttonAPressed) buttons.push('A');
  if (input.buttonBPressed) buttons.push('B');
  if (input.buttonCPressed) buttons.push('C');
  if (input.buttonDPressed) buttons.push('D');
  if (input.burstPressed) buttons.push('O');
  if (input.rollPressed) buttons.push('A+B');
  if (input.blowbackPressed) buttons.push('C+D');
  return buttons;
}

/**
 * Recognize what command the current input history matches.
 * Returns a human-readable command name for training mode display.
 */
export function getCommandName(
  direction: DirectionInput,
  input: ResolvedInput,
  hasQCF: boolean,
  hasQCB: boolean,
  hasHCB: boolean,
  hasDP: boolean,
  chargeReady: boolean,
): string | null {
  // Check DM-level inputs first (highest priority display)
  // These would need to be checked at a higher level; here we just report
  // what motion is detected.

  // Dragon Punch
  if (hasDP && (input.punchPressed || input.punchJustReleased)) {
    return 'DP+P';
  }

  // QCF
  if (hasQCF && (input.punchPressed || input.punchJustReleased)) {
    return 'QCF+P';
  }
  if (hasQCF && (input.kickPressed || input.kickJustReleased)) {
    return 'QCF+K';
  }

  // QCB
  if (hasQCB && (input.punchPressed || input.punchJustReleased)) {
    return 'QCB+P';
  }
  if (hasQCB && (input.kickPressed || input.kickJustReleased)) {
    return 'QCB+K';
  }

  // HCB
  if (hasHCB && (input.punchPressed || input.punchJustReleased)) {
    return 'HCB+P';
  }

  // Charge ready indicator
  if (chargeReady) {
    return 'CHARGE READY';
  }

  // Negative Edge display
  if (input.punchJustReleased) return '~P';
  if (input.kickJustReleased) return '~K';

  return null;
}
