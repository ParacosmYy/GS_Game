import { describe, it, expect } from 'vitest';
import {
  getAnimation,
  getFallbackColors,
  getAnimationNames,
  getAnimationFrameCount,
  hasAnimation,
  getCharacterIds,
  attackTypeToAnimName,
  getAttackAnimation,
} from '../src/core/spriteManifest.js';
import { SPRITE_MANIFEST } from '../src/core/spriteManifestData.js';
import { AttackType } from '../src/core/types.js';

describe('Sprite Manifest Query Functions', () => {
  describe('SPRITE_MANIFEST structure', () => {
    it('has version 1', () => {
      expect(SPRITE_MANIFEST.version).toBe(1);
    });

    it('contains ryo character', () => {
      expect(SPRITE_MANIFEST.characters).toHaveProperty('ryo');
    });

    it('ryo has required fields', () => {
      const ryo = SPRITE_MANIFEST.characters.ryo;
      expect(ryo.charId).toBe('ryo');
      expect(ryo.atlasPath).toBeDefined();
      expect(ryo.fallbackColors).toBeDefined();
      expect(ryo.animations).toBeDefined();
    });

    it('ryo fallbackColors have all required keys', () => {
      const colors = SPRITE_MANIFEST.characters.ryo.fallbackColors;
      expect(colors).toHaveProperty('body');
      expect(colors).toHaveProperty('head');
      expect(colors).toHaveProperty('outfit');
      expect(colors).toHaveProperty('hair');
    });
  });

  describe('getAnimation', () => {
    it('returns idle animation for ryo', () => {
      const anim = getAnimation(SPRITE_MANIFEST, 'ryo', 'idle');
      expect(anim).toBeDefined();
      expect(anim!.name).toBe('idle');
    });

    it('returns undefined for unknown character', () => {
      expect(getAnimation(SPRITE_MANIFEST, 'unknown', 'idle')).toBeUndefined();
    });

    it('returns undefined for unknown animation', () => {
      expect(getAnimation(SPRITE_MANIFEST, 'ryo', 'nonexistent')).toBeUndefined();
    });
  });

  describe('getFallbackColors', () => {
    it('returns ryo fallback colors', () => {
      const colors = getFallbackColors(SPRITE_MANIFEST, 'ryo');
      expect(colors.outfit).toBeDefined();
      expect(colors.hair).toBeDefined();
    });

    it('returns default colors for unknown character', () => {
      const colors = getFallbackColors(SPRITE_MANIFEST, 'unknown');
      expect(colors).toHaveProperty('body');
      expect(colors).toHaveProperty('outfit');
    });
  });

  describe('getAnimationNames', () => {
    it('returns animation names for ryo', () => {
      const names = getAnimationNames(SPRITE_MANIFEST, 'ryo');
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('idle');
    });

    it('returns empty array for unknown character', () => {
      expect(getAnimationNames(SPRITE_MANIFEST, 'unknown')).toEqual([]);
    });
  });

  describe('getAnimationFrameCount', () => {
    it('returns frame count for ryo idle', () => {
      const count = getAnimationFrameCount(SPRITE_MANIFEST, 'ryo', 'idle');
      expect(count).toBeGreaterThan(0);
    });

    it('returns 0 for unknown animation', () => {
      expect(getAnimationFrameCount(SPRITE_MANIFEST, 'ryo', 'nonexistent')).toBe(0);
    });
  });

  describe('hasAnimation', () => {
    it('returns true for existing animation', () => {
      expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'idle')).toBe(true);
    });

    it('returns false for missing animation', () => {
      expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'nonexistent')).toBe(false);
    });
  });

  describe('getCharacterIds', () => {
    it('includes ryo', () => {
      const ids = getCharacterIds(SPRITE_MANIFEST);
      expect(ids).toContain('ryo');
    });
  });

  describe('attackTypeToAnimName', () => {
    it('converts STAND_A to stand_a', () => {
      expect(attackTypeToAnimName(AttackType.STAND_A)).toBe('stand_a');
    });

    it('converts RYO_KOOU to ryo_koou', () => {
      expect(attackTypeToAnimName(AttackType.RYO_KOOU)).toBe('ryo_koou');
    });
  });

  describe('getAttackAnimation', () => {
    it('returns animation for known attack type', () => {
      const anim = getAttackAnimation(SPRITE_MANIFEST, 'ryo', AttackType.STAND_A);
      expect(anim).toBeDefined();
      expect(anim!.name).toBe('stand_a');
    });

    it('returns undefined for unknown character', () => {
      expect(getAttackAnimation(SPRITE_MANIFEST, 'unknown', AttackType.STAND_A)).toBeUndefined();
    });
  });

  describe('Ryo key animations exist', () => {
    const keyAnims = ['idle', 'walk_forward', 'crouch_idle', 'jump_up', 'stand_a', 'stand_c'];
    for (const anim of keyAnims) {
      it(`${anim} exists for ryo`, () => {
        expect(hasAnimation(SPRITE_MANIFEST, 'ryo', anim)).toBe(true);
      });
    }
  });
});
