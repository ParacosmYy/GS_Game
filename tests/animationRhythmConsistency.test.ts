/**
 * Animation Rhythm Consistency Tests
 *
 * Validates that Ryo, Kyo, and Iori all share consistent
 * animation rhythm patterns: light attacks faster than heavy,
 * walk loops consistent, hitstun shorter than knockdown, etc.
 * This protects the KOF2002 "feel" across character content packages.
 */
import { describe, it, expect } from 'vitest';
import { RYO_ANIMATION_META, type AnimationMeta } from '../src/content/characters/ryo/animations/ryoAnimations.js';
import { KYO_ANIMATION_META } from '../src/content/characters/kyo/animations/kyoAnimations.js';
import { IORI_ANIMATION_META } from '../src/content/characters/iori/animations/ioriAnimations.js';

type AnimMap = Record<string, AnimationMeta>;

const REQUIRED_ANIMATIONS = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'block',
  'stand_a', 'stand_c', 'crouch_a', 'crouch_d',
  'hitstun', 'knockdown', 'dizzy', 'win',
];

const chars: { name: string; anims: AnimMap }[] = [
  { name: 'Ryo', anims: RYO_ANIMATION_META },
  { name: 'Kyo', anims: KYO_ANIMATION_META },
  { name: 'Iori', anims: IORI_ANIMATION_META },
];

function totalDuration(anim: AnimationMeta): number {
  return anim.totalFrames * anim.ticksPerFrame;
}

describe('Animation rhythm consistency', () => {
  for (const char of chars) {
    describe(`${char.name} animation completeness`, () => {
      for (const key of REQUIRED_ANIMATIONS) {
        it(`has "${key}" animation`, () => {
          expect(char.anims[key], `${char.name} missing "${key}"`).toBeDefined();
        });
      }
    });

    describe(`${char.name} rhythm rules`, () => {
      it('light attacks are shorter than heavy attacks', () => {
        const standA = char.anims.stand_a;
        const standC = char.anims.stand_c;
        if (standA && standC) {
          expect(totalDuration(standA)).toBeLessThan(totalDuration(standC));
        }
      });

      it('crouch light is shorter than crouch heavy', () => {
        const crA = char.anims.crouch_a;
        const crD = char.anims.crouch_d;
        if (crA && crD) {
          expect(totalDuration(crA)).toBeLessThan(totalDuration(crD));
        }
      });

      it('hitstun is shorter than knockdown', () => {
        const hitstun = char.anims.hitstun;
        const knockdown = char.anims.knockdown;
        if (hitstun && knockdown) {
          expect(totalDuration(hitstun)).toBeLessThan(totalDuration(knockdown));
        }
      });

      it('idle ticksPerFrame is slower than walk_forward (more deliberate stance)', () => {
        const idle = char.anims.idle;
        const walk = char.anims.walk_forward;
        if (idle && walk) {
          expect(idle.ticksPerFrame).toBeGreaterThanOrEqual(walk.ticksPerFrame);
        }
      });

      it('attack animations are non-looping', () => {
        const attacks = ['stand_a', 'stand_c', 'crouch_a', 'crouch_d'];
        for (const key of attacks) {
          const anim = char.anims[key];
          if (anim) {
            expect(anim.loop, `${key} should not loop`).toBe(false);
          }
        }
      });

      it('idle and walk animations are looping', () => {
        const loops = ['idle', 'walk_forward', 'walk_backward'];
        for (const key of loops) {
          const anim = char.anims[key];
          if (anim) {
            expect(anim.loop, `${key} should loop`).toBe(true);
          }
        }
      });

      it('all animations have positive totalFrames and ticksPerFrame', () => {
        for (const [key, anim] of Object.entries(char.anims)) {
          expect(anim.totalFrames, `${key} totalFrames`).toBeGreaterThan(0);
          expect(anim.ticksPerFrame, `${key} ticksPerFrame`).toBeGreaterThan(0);
        }
      });

      it('all animations have valid type', () => {
        const validTypes = ['loop', 'once', 'attack'];
        for (const [key, anim] of Object.entries(char.anims)) {
          expect(validTypes, `${key} has invalid type`).toContain(anim.type);
        }
      });
    });
  }
});
