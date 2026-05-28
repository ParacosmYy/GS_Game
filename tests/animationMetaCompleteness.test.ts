import { describe, it, expect } from 'vitest';
import { RYO_ANIMATION_META } from '../src/content/characters/ryo/animations/ryoAnimations.js';
import { KYO_ANIMATION_META } from '../src/content/characters/kyo/animations/kyoAnimations.js';
import { IORI_ANIMATION_META } from '../src/content/characters/iori/animations/ioriAnimations.js';

/** Core gameplay states that MUST have animation metadata */
const REQUIRED_STATES = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward',
  'backdash', 'hop', 'hyper_jump', 'run_jump',
  'roll', 'back_roll', 'air_block', 'throw_anim',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'hitstun', 'blockstun', 'knockdown', 'wakeup',
  'dizzy', 'guard_crush', 'win', 'taunt', 'max_mode',
];

describe('Animation metadata completeness — all 3 characters', () => {
  const chars = [
    { name: 'Ryo', meta: RYO_ANIMATION_META },
    { name: 'Kyo', meta: KYO_ANIMATION_META },
    { name: 'Iori', meta: IORI_ANIMATION_META },
  ];

  for (const c of chars) {
    describe(`${c.name}`, () => {
      it('has all required animation states', () => {
        const missing: string[] = [];
        for (const key of REQUIRED_STATES) {
          if (!c.meta[key]) missing.push(key);
        }
        expect(missing, `${c.name} missing animation metadata`).toEqual([]);
      });

      it('all entries have valid totalFrames > 0', () => {
        for (const [key, m] of Object.entries(c.meta)) {
          expect(m.totalFrames, `${c.name}.${key}.totalFrames`).toBeGreaterThan(0);
        }
      });

      it('all entries have valid ticksPerFrame > 0', () => {
        for (const [key, m] of Object.entries(c.meta)) {
          expect(m.ticksPerFrame, `${c.name}.${key}.ticksPerFrame`).toBeGreaterThan(0);
        }
      });

      it('loop type matches loop boolean', () => {
        for (const [key, m] of Object.entries(c.meta)) {
          if (m.type === 'loop') {
            expect(m.loop, `${c.name}.${key} loop type should have loop=true`).toBe(true);
          }
        }
      });

      it('attack type has loop=false', () => {
        for (const [key, m] of Object.entries(c.meta)) {
          if (m.type === 'attack') {
            expect(m.loop, `${c.name}.${key} attack type should have loop=false`).toBe(false);
          }
        }
      });

      it('has valid transition type', () => {
        const validTransitions = ['snap', 'ease_in', 'ease_out', 'blend'];
        for (const [key, m] of Object.entries(c.meta)) {
          expect(validTransitions, `${c.name}.${key} transition`).toContain(m.transition);
        }
      });

      it('air attack entries exist', () => {
        for (const key of ['jump_a', 'jump_b', 'jump_c', 'jump_d']) {
          expect(c.meta[key], `${c.name}.${key}`).toBeDefined();
          expect(c.meta[key].type, `${c.name}.${key} type`).toBe('attack');
        }
      });

      it('movement entries have correct type', () => {
        const onceStates = ['backdash', 'hop', 'hyper_jump', 'run_jump', 'roll', 'back_roll', 'throw_anim'];
        for (const key of onceStates) {
          expect(c.meta[key], `${c.name}.${key}`).toBeDefined();
          expect(c.meta[key].type, `${c.name}.${key} type`).toBe('once');
        }
      });

      it('has more than 40 animation entries', () => {
        expect(Object.keys(c.meta).length, `${c.name} animation count`).toBeGreaterThan(40);
      });
    });
  }

  describe('cross-character consistency', () => {
    it('all 3 characters share the same required state set', () => {
      for (const key of REQUIRED_STATES) {
        expect(RYO_ANIMATION_META[key], `Ryo.${key}`).toBeDefined();
        expect(KYO_ANIMATION_META[key], `Kyo.${key}`).toBeDefined();
        expect(IORI_ANIMATION_META[key], `Iori.${key}`).toBeDefined();
      }
    });

    it('special attack entries differ per character', () => {
      const ryoSpecials = Object.keys(RYO_ANIMATION_META).filter(k => k.startsWith('ryo_'));
      const kyoSpecials = Object.keys(KYO_ANIMATION_META).filter(k => k.startsWith('kyo_'));
      const ioriSpecials = Object.keys(IORI_ANIMATION_META).filter(k => k.startsWith('iori_'));
      expect(ryoSpecials.length, 'Ryo specials').toBeGreaterThan(0);
      expect(kyoSpecials.length, 'Kyo specials').toBeGreaterThan(0);
      expect(ioriSpecials.length, 'Iori specials').toBeGreaterThan(0);
    });
  });
});
