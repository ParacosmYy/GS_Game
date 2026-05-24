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
  buttonAPressed: boolean;
  buttonBPressed: boolean;
  buttonCPressed: boolean;
  buttonDPressed: boolean;
  throwAttackPressed: boolean;
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
}

export interface PrevAttack {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  throwAtk: boolean;
}

export function createPrevAttack(): PrevAttack {
  return { a: false, b: false, c: false, d: false, throwAtk: false };
}

export function resolveInput(raw: RawInput, facing: Direction, prev: PrevAttack): ResolvedInput {
  const aPressed = raw.buttonA && !prev.a;
  const cPressed = raw.buttonC && !prev.c;
  const bPressed = raw.buttonB && !prev.b;
  const dPressed = raw.buttonD && !prev.d;
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
    buttonAPressed: aPressed,
    buttonBPressed: bPressed,
    buttonCPressed: cPressed,
    buttonDPressed: dPressed,
    throwAttackPressed: raw.throwAttack && !prev.throwAtk,
    punchPressed: aPressed || cPressed,
    kickPressed: bPressed || dPressed,
    rollPressed: raw.buttonA && raw.buttonB && (aPressed || bPressed),
    blowbackPressed: raw.buttonC && raw.buttonD && (cPressed || dPressed),
    punchJustReleased: aReleased || cReleased,
    kickJustReleased: bReleased || dReleased,
  };
}

export function updatePrevAttack(prev: PrevAttack, raw: RawInput): void {
  prev.a = raw.buttonA;
  prev.b = raw.buttonB;
  prev.c = raw.buttonC;
  prev.d = raw.buttonD;
  prev.throwAtk = raw.throwAttack;
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
