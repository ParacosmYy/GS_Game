/**
 * Sprite Manifest Pure Function Tests
 *
 * Tests all query functions from src/core/spriteManifest.ts:
 * getAnimation, getFallbackColors, getAnimationNames, getAnimationDuration,
 * getAnimationFrameCount, hasAnimation, getCharacterIds,
 * attackTypeToAnimName, getAttackAnimation.
 */
import { describe, it, expect } from 'vitest';
import type { SpriteManifest, SpriteAnimation, SpriteFrame } from '../src/core/spriteManifest.js';
import { AttackType } from '../src/core/types.js';
import {
  getAnimation,
  getFallbackColors,
  getAnimationNames,
  getAnimationDuration,
  getAnimationFrameCount,
  hasAnimation,
  getCharacterIds,
  attackTypeToAnimName,
  getAttackAnimation,
} from '../src/core/spriteManifest.js';

// ── Test fixture manifest ──

function makeSpriteFrame(overrides: Partial<SpriteFrame> & { atlasX: number; atlasY: number; width: number; height: number }): SpriteFrame {
  return { anchor: { x: 48, y: 144 }, ...overrides };
}

const IDLE_ANIM: SpriteAnimation = {
  name: 'idle',
  frames: [
    makeSpriteFrame({ atlasX: 0, atlasY: 0, width: 96, height: 144, duration: 150 }),
    makeSpriteFrame({ atlasX: 96, atlasY: 0, width: 96, height: 144, duration: 150 }),
  ],
  loop: true,
};

const STAND_A_ANIM: SpriteAnimation = {
  name: 'stand_a',
  frames: [
    makeSpriteFrame({ atlasX: 0, atlasY: 144, width: 96, height: 144, duration: 50 }),
    makeSpriteFrame({ atlasX: 96, atlasY: 144, width: 96, height: 144, duration: 100 }),
    makeSpriteFrame({ atlasX: 192, atlasY: 144, width: 96, height: 144, duration: 80 }),
  ],
  loop: false,
  cancelStartFrame: 2,
};

const TEST_MANIFEST: SpriteManifest = {
  version: 1,
  characters: {
    kyo: {
      charId: 'kyo',
      atlasPath: 'kyo.atlas.png',
      animations: { idle: IDLE_ANIM, stand_a: STAND_A_ANIM },
      fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#FF6600', hair: '#333333' },
    },
    ryo: {
      charId: 'ryo',
      atlasPath: 'ryo.atlas.png',
      animations: { idle: IDLE_ANIM },
      fallbackColors: { body: '#E8C090', head: '#E8C090', outfit: '#AA0000', hair: '#554433' },
    },
  },
};

// ===== getAnimation =====

describe('spriteManifest — getAnimation', () => {
  it('returns animation for existing char+name', () => {
    expect(getAnimation(TEST_MANIFEST, 'kyo', 'idle')).toBe(IDLE_ANIM);
  });
  it('returns undefined for missing char', () => {
    expect(getAnimation(TEST_MANIFEST, 'iori', 'idle')).toBeUndefined();
  });
  it('returns undefined for missing animation', () => {
    expect(getAnimation(TEST_MANIFEST, 'kyo', 'special_upper')).toBeUndefined();
  });
});

// ===== getFallbackColors =====

describe('spriteManifest — getFallbackColors', () => {
  it('returns kyo fallback colors', () => {
    const colors = getFallbackColors(TEST_MANIFEST, 'kyo');
    expect(colors.body).toBe('#FFD699');
    expect(colors.outfit).toBe('#FF6600');
    expect(colors.hair).toBe('#333333');
  });
  it('returns default colors for missing char', () => {
    const colors = getFallbackColors(TEST_MANIFEST, 'unknown');
    expect(colors.body).toBe('#FFD699');
    expect(colors.outfit).toBe('#FF6600');
  });
});

// ===== getAnimationNames =====

describe('spriteManifest — getAnimationNames', () => {
  it('returns kyo animation names', () => {
    const names = getAnimationNames(TEST_MANIFEST, 'kyo');
    expect(names).toContain('idle');
    expect(names).toContain('stand_a');
    expect(names.length).toBe(2);
  });
  it('returns ryo animation names (only idle)', () => {
    const names = getAnimationNames(TEST_MANIFEST, 'ryo');
    expect(names).toEqual(['idle']);
  });
  it('returns empty for missing char', () => {
    expect(getAnimationNames(TEST_MANIFEST, 'iori')).toEqual([]);
  });
});

// ===== getAnimationDuration =====

describe('spriteManifest — getAnimationDuration', () => {
  it('sums frame durations for idle', () => {
    expect(getAnimationDuration(TEST_MANIFEST, 'kyo', 'idle')).toBe(300);
  });
  it('sums frame durations for stand_a', () => {
    expect(getAnimationDuration(TEST_MANIFEST, 'kyo', 'stand_a')).toBe(230);
  });
  it('returns 0 for missing', () => {
    expect(getAnimationDuration(TEST_MANIFEST, 'kyo', 'nonexistent')).toBe(0);
  });
});

// ===== getAnimationFrameCount =====

describe('spriteManifest — getAnimationFrameCount', () => {
  it('returns idle frame count', () => {
    expect(getAnimationFrameCount(TEST_MANIFEST, 'kyo', 'idle')).toBe(2);
  });
  it('returns stand_a frame count', () => {
    expect(getAnimationFrameCount(TEST_MANIFEST, 'kyo', 'stand_a')).toBe(3);
  });
  it('returns 0 for missing', () => {
    expect(getAnimationFrameCount(TEST_MANIFEST, 'iori', 'idle')).toBe(0);
  });
});

// ===== hasAnimation =====

describe('spriteManifest — hasAnimation', () => {
  it('returns true for existing', () => {
    expect(hasAnimation(TEST_MANIFEST, 'kyo', 'idle')).toBe(true);
  });
  it('returns false for missing', () => {
    expect(hasAnimation(TEST_MANIFEST, 'kyo', 'special_upper')).toBe(false);
  });
  it('returns false for missing char', () => {
    expect(hasAnimation(TEST_MANIFEST, 'iori', 'idle')).toBe(false);
  });
});

// ===== getCharacterIds =====

describe('spriteManifest — getCharacterIds', () => {
  it('returns all character IDs', () => {
    const ids = getCharacterIds(TEST_MANIFEST);
    expect(ids).toContain('kyo');
    expect(ids).toContain('ryo');
    expect(ids.length).toBe(2);
  });
});

// ===== attackTypeToAnimName =====

describe('spriteManifest — attackTypeToAnimName', () => {
  it('converts STAND_A to lowercase', () => {
    expect(attackTypeToAnimName(AttackType.STAND_A)).toBe('stand_a');
  });
  it('converts STAND_C to lowercase', () => {
    expect(attackTypeToAnimName(AttackType.STAND_C)).toBe('stand_c');
  });
  it('converts SPECIAL_UPPER to lowercase', () => {
    expect(attackTypeToAnimName(AttackType.SPECIAL_UPPER)).toBe('special_upper');
  });
  it('converts DM_OROCHINAGI to lowercase', () => {
    expect(attackTypeToAnimName(AttackType.DM_OROCHINAGI)).toBe('dm_orochinagi');
  });
});

// ===== getAttackAnimation =====

describe('spriteManifest — getAttackAnimation', () => {
  it('returns stand_a via AttackType', () => {
    const anim = getAttackAnimation(TEST_MANIFEST, 'kyo', AttackType.STAND_A);
    expect(anim).toBe(STAND_A_ANIM);
  });
  it('returns undefined for unmapped attack', () => {
    expect(getAttackAnimation(TEST_MANIFEST, 'kyo', AttackType.SPECIAL_UPPER)).toBeUndefined();
  });
  it('returns undefined for missing char', () => {
    expect(getAttackAnimation(TEST_MANIFEST, 'iori', AttackType.STAND_A)).toBeUndefined();
  });
});
