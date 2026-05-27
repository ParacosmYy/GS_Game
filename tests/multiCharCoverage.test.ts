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

  // Special move coverage per character
  describe('Ryo special moves', () => {
    const check = (s: FighterState, a: AttackType | null) => hasRyoFrame('ryo', s, a, 0, 1);
    it('KOOU (light)', () => expect(check(FighterState.STAND_ATTACK, AttackType.RYO_KOOU)).toBe(true));
    it('KOOU (heavy)', () => expect(check(FighterState.STAND_ATTACK, AttackType.RYO_KOOU_C)).toBe(true));
    it('KO_HOU', () => expect(check(FighterState.STAND_ATTACK, AttackType.RYO_KO_HOU)).toBe(true));
    it('HIEN', () => expect(check(FighterState.STAND_ATTACK, AttackType.RYO_HIEN)).toBe(true));
    it('DM_TEN_HA_OU', () => expect(check(FighterState.STAND_ATTACK, AttackType.DM_TEN_HA_OU)).toBe(true));
    it('SDM_TEN_HA_OU', () => expect(check(FighterState.STAND_ATTACK, AttackType.SDM_TEN_HA_OU)).toBe(true));
    it('DM_RYUKO_RANBU', () => expect(check(FighterState.STAND_ATTACK, AttackType.DM_RYUKO_RANBU)).toBe(true));
    it('HSDM_RYUKO_RANBU', () => expect(check(FighterState.STAND_ATTACK, AttackType.HSDM_RYUKO_RANBU)).toBe(true));
  });

  describe('Kyo special moves', () => {
    const check = hasKyoHighResFrame;
    it('ONIYAKI (light)', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_ONIYAKI)).toBe(true));
    it('YAMIBARAI', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_YAMIBARAI)).toBe(true));
    it('RED_KICK', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_RED_KICK)).toBe(true));
    it('75KAI', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_75KAI)).toBe(true));
    it('ARAGAMI', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_ARAGAMI)).toBe(true));
    it('DOKUGAMI', () => expect(check(FighterState.STAND_ATTACK, AttackType.KYO_DOKUGAMI)).toBe(true));
    it('DM_OROCHINAGI', () => expect(check(FighterState.STAND_ATTACK, AttackType.DM_OROCHINAGI)).toBe(true));
    it('SDM_OROCHINAGI', () => expect(check(FighterState.STAND_ATTACK, AttackType.SDM_OROCHINAGI)).toBe(true));
    it('HSDM_OROCHINAGI', () => expect(check(FighterState.STAND_ATTACK, AttackType.HSDM_OROCHINAGI)).toBe(true));
    it('CMD_GOFU_YOU', () => expect(check(FighterState.STAND_ATTACK, AttackType.CMD_GOFU_YOU)).toBe(true));
    it('CMD_88SHIKI', () => expect(check(FighterState.STAND_ATTACK, AttackType.CMD_88SHIKI)).toBe(true));
  });

  describe('Iori special moves', () => {
    const check = hasIoriHighResFrame;
    it('ONIYAKI', () => expect(check(FighterState.STAND_ATTACK, AttackType.IORI_ONIYAKI)).toBe(true));
    it('YAMIBARAI', () => expect(check(FighterState.STAND_ATTACK, AttackType.IORI_YAMIBARAI)).toBe(true));
    it('KOTOTSUKI', () => expect(check(FighterState.STAND_ATTACK, AttackType.IORI_KOTOTSUKI)).toBe(true));
    it('AOIHANA', () => expect(check(FighterState.STAND_ATTACK, AttackType.IORI_AOIHANA)).toBe(true));
    it('DM_YATAGARASU', () => expect(check(FighterState.STAND_ATTACK, AttackType.DM_YATAGARASU)).toBe(true));
    it('SDM_YATAGARASU', () => expect(check(FighterState.STAND_ATTACK, AttackType.SDM_YATAGARASU)).toBe(true));
    it('HSDM_YAOTOME', () => expect(check(FighterState.STAND_ATTACK, AttackType.HSDM_YAOTOME)).toBe(true));
  });
});
