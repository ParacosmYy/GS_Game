/**
 * Close Attack Frame Registration Regression Test
 */
import { describe, it, expect } from 'vitest';
import { hasHighResFrame as hasRyoFrame } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { FighterState, AttackType } from '../src/core/types.js';

const S = FighterState.STAND_ATTACK;

describe('Close attack frame registration', () => {
  it('Ryo CLOSE_A', () => expect(hasRyoFrame('ryo', S, AttackType.CLOSE_A)).toBe(true));
  it('Ryo CLOSE_C', () => expect(hasRyoFrame('ryo', S, AttackType.CLOSE_C)).toBe(true));
  it('Ryo CLOSE_B', () => expect(hasRyoFrame('ryo', S, AttackType.CLOSE_B)).toBe(true));
  it('Ryo CLOSE_D', () => expect(hasRyoFrame('ryo', S, AttackType.CLOSE_D)).toBe(true));
  it('Kyo CLOSE_A', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_A)).toBe(true));
  it('Kyo CLOSE_C', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_C)).toBe(true));
  it('Kyo CLOSE_B', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_B)).toBe(true));
  it('Kyo CLOSE_D', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_D)).toBe(true));
  it('Iori CLOSE_A', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_A)).toBe(true));
  it('Iori CLOSE_C', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_C)).toBe(true));
  it('Iori CLOSE_B', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_B)).toBe(true));
  it('Iori CLOSE_D', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_D)).toBe(true));
});
