/**
 * Multi-Character Pixel Frame Coverage Tests
 *
 * Validates that Ryo, Kyo, and Iori all have pixel frames registered
 * for every FighterState and common AttackType.
 * This is a regression test to prevent frame registration gaps.
 */
import { describe, it, expect } from 'vitest';
import { FighterState, AttackType } from '../src/core/types.js';
import { hasHighResFrame as hasRyoFrame } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';

// ===== Basic State Coverage =====

const BASIC_STATES: FighterState[] = [
  FighterState.IDLE,
  FighterState.WALK,
  FighterState.RUN,
  FighterState.BACKDASH,
  FighterState.ROLL,
  FighterState.BACK_ROLL,
  FighterState.JUMP,
  FighterState.CROUCH,
  FighterState.BLOCK,
  FighterState.AIR_BLOCK,
  FighterState.HITSTUN,
  FighterState.KNOCKDOWN,
  FighterState.GETUP,
  FighterState.DIZZY,
  FighterState.THROW,
  FighterState.GUARD_CRUSH,
  FighterState.MAX_MODE,
  FighterState.TAUNT,
  FighterState.COUNTER_STANCE,
];

// ===== Attack States =====

const STAND_ATTACKS: AttackType[] = [
  AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
  AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
];

const CROUCH_ATTACKS: AttackType[] = [
  AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
];

const AIR_ATTACKS: AttackType[] = [
  AttackType.JUMP_A, AttackType.JUMP_C, AttackType.JUMP_D,
];

// ===== Test Suite =====

describe('Multi-character pixel frame coverage', () => {
  const chars = [
    { name: 'Ryo', check: (s: FighterState, a: AttackType | null, vx: number, f: number) => hasRyoFrame('ryo', s, a, vx, f) },
    { name: 'Kyo', check: hasKyoHighResFrame },
    { name: 'Iori', check: hasIoriHighResFrame },
  ] as const;

  for (const char of chars) {
    describe(`${char.name} basic states`, () => {
      for (const state of BASIC_STATES) {
        it(`has pixel frame for ${FighterState[state]}`, () => {
          expect(char.check(state, null, 0, 1)).toBe(true);
        });
      }
    });

    describe(`${char.name} stand attacks`, () => {
      for (const attack of STAND_ATTACKS) {
        it(`has pixel frame for ${attack}`, () => {
          expect(char.check(FighterState.STAND_ATTACK, attack, 0, 1)).toBe(true);
        });
      }
    });

    describe(`${char.name} crouch attacks`, () => {
      for (const attack of CROUCH_ATTACKS) {
        it(`has pixel frame for ${attack}`, () => {
          expect(char.check(FighterState.CROUCH_ATTACK, attack, 0, 1)).toBe(true);
        });
      }
    });

    describe(`${char.name} air attacks`, () => {
      for (const attack of AIR_ATTACKS) {
        it(`has pixel frame for ${attack}`, () => {
          expect(char.check(FighterState.AIR_ATTACK, attack, 0, 1)).toBe(true);
        });
      }
    });

    describe(`${char.name} walk direction`, () => {
      it('has walk forward frame', () => {
        expect(char.check(FighterState.WALK, null, 1, 1)).toBe(true);
      });
      it('has walk backward frame', () => {
        expect(char.check(FighterState.WALK, null, -1, 1)).toBe(true);
      });
    });
  }
});
