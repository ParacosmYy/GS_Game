import { Direction, DirectionInput } from '../core/types.js';

interface ResolvedInput {
  up: boolean;
  down: boolean;
  forward: boolean;
  back: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  throwAttack: boolean;
  lightAttackPressed: boolean;
  heavyAttackPressed: boolean;
  throwAttackPressed: boolean;
}

interface RawInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  throwAttack: boolean;
}

interface PrevAttack {
  light: boolean;
  heavy: boolean;
  throwAtk: boolean;
}

export type { ResolvedInput, RawInput, PrevAttack };

export function resolveInput(raw: RawInput, facing: Direction, prev: PrevAttack): ResolvedInput {
  return {
    up: raw.up,
    down: raw.down,
    forward: facing === 1 ? raw.right : raw.left,
    back: facing === 1 ? raw.left : raw.right,
    lightAttack: raw.lightAttack,
    heavyAttack: raw.heavyAttack,
    throwAttack: raw.throwAttack,
    lightAttackPressed: raw.lightAttack && !prev.light,
    heavyAttackPressed: raw.heavyAttack && !prev.heavy,
    throwAttackPressed: raw.throwAttack && !prev.throwAtk,
  };
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
