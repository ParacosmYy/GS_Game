/**
 * Sprite Manifest Query Functions Regression Tests
 *
 * Validates sprite manifest type definitions and pure query functions.
 */
import { describe, it, expect } from 'vitest';
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
  type SpriteManifest,
  type SpriteAnimation,
  type SpriteFrame,
} from '../src/core/spriteManifest.js';

// ===== Test fixture =====

const mockManifest: SpriteManifest = {
  version: 1,
  characters: {
    ryo: {
      charId: 'ryo',
      atlasPath: 'ryo.atlas.png',
      animations: {
        idle: {
          name: 'idle',
          frames: [
            { atlasX: 0, atlasY: 0, width: 80, height: 200, anchor: { x: 40, y: 200 }, duration: 100 },
            { atlasX: 80, atlasY: 0, width: 80, height: 200, anchor: { x: 40, y: 200 }, duration: 100 },
          ],
          loop: true,
        },
        walk: {
          name: 'walk',
          frames: [
            { atlasX: 0, atlasY: 200, width: 80, height: 200, anchor: { x: 40, y: 200 }, duration: 80 },
          ],
          loop: true,
        },
        stand_a: {
          name: 'stand_a',
          frames: [
            { atlasX: 0, atlasY: 400, width: 100, height: 200, anchor: { x: 40, y: 200 }, duration: 50 },
            { atlasX: 100, atlasY: 400, width: 100, height: 200, anchor: { x: 40, y: 200 }, duration: 50 },
            { atlasX: 200, atlasY: 400, width: 100, height: 200, anchor: { x: 40, y: 200 } },
          ],
          loop: false,
          cancelStartFrame: 2,
        },
      },
      fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#DD6600', hair: '#333333' },
    },
    kyo: {
      charId: 'kyo',
      atlasPath: 'kyo.atlas.png',
      animations: {
        idle: {
          name: 'idle',
          frames: [
            { atlasX: 0, atlasY: 0, width: 80, height: 200, anchor: { x: 40, y: 200 }, duration: 100 },
          ],
          loop: true,
        },
      },
      fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#FF6600', hair: '#442200' },
    },
  },
};

// ===== getAnimation =====

describe('getAnimation', () => {
  it('returns animation for valid char and name', () => {
    const anim = getAnimation(mockManifest, 'ryo', 'idle');
    expect(anim).toBeDefined();
    expect(anim!.name).toBe('idle');
    expect(anim!.frames.length).toBe(2);
  });

  it('returns undefined for invalid char', () => {
    expect(getAnimation(mockManifest, 'nonexistent', 'idle')).toBeUndefined();
  });

  it('returns undefined for invalid anim name', () => {
    expect(getAnimation(mockManifest, 'ryo', 'nonexistent')).toBeUndefined();
  });
});

// ===== getFallbackColors =====

describe('getFallbackColors', () => {
  it('returns correct colors for existing character', () => {
    const colors = getFallbackColors(mockManifest, 'ryo');
    expect(colors.body).toBe('#FFD699');
    expect(colors.outfit).toBe('#DD6600');
  });

  it('returns default colors for non-existent character', () => {
    const colors = getFallbackColors(mockManifest, 'nonexistent');
    expect(colors.body).toBe('#FFD699');
    expect(colors.outfit).toBe('#FF6600');
  });
});

// ===== getAnimationNames =====

describe('getAnimationNames', () => {
  it('returns animation names for existing character', () => {
    const names = getAnimationNames(mockManifest, 'ryo');
    expect(names).toContain('idle');
    expect(names).toContain('walk');
    expect(names).toContain('stand_a');
    expect(names.length).toBe(3);
  });

  it('returns empty for non-existent character', () => {
    expect(getAnimationNames(mockManifest, 'nonexistent')).toEqual([]);
  });
});

// ===== getAnimationDuration =====

describe('getAnimationDuration', () => {
  it('calculates correct duration', () => {
    expect(getAnimationDuration(mockManifest, 'ryo', 'idle')).toBe(200);
  });

  it('returns 0 for non-existent animation', () => {
    expect(getAnimationDuration(mockManifest, 'ryo', 'nonexistent')).toBe(0);
  });

  it('skips frames without duration', () => {
    // stand_a has 50+50+undefined = 100
    expect(getAnimationDuration(mockManifest, 'ryo', 'stand_a')).toBe(100);
  });
});

// ===== getAnimationFrameCount =====

describe('getAnimationFrameCount', () => {
  it('returns correct frame count', () => {
    expect(getAnimationFrameCount(mockManifest, 'ryo', 'idle')).toBe(2);
    expect(getAnimationFrameCount(mockManifest, 'ryo', 'walk')).toBe(1);
    expect(getAnimationFrameCount(mockManifest, 'ryo', 'stand_a')).toBe(3);
  });

  it('returns 0 for non-existent', () => {
    expect(getAnimationFrameCount(mockManifest, 'nonexistent', 'idle')).toBe(0);
  });
});

// ===== hasAnimation =====

describe('hasAnimation', () => {
  it('returns true for existing animation', () => {
    expect(hasAnimation(mockManifest, 'ryo', 'idle')).toBe(true);
  });

  it('returns false for non-existent', () => {
    expect(hasAnimation(mockManifest, 'ryo', 'nonexistent')).toBe(false);
    expect(hasAnimation(mockManifest, 'nonexistent', 'idle')).toBe(false);
  });
});

// ===== getCharacterIds =====

describe('getCharacterIds', () => {
  it('returns all character IDs', () => {
    const ids = getCharacterIds(mockManifest);
    expect(ids).toContain('ryo');
    expect(ids).toContain('kyo');
    expect(ids.length).toBe(2);
  });
});

// ===== attackTypeToAnimName =====

describe('attackTypeToAnimName', () => {
  it('converts STAND_A to stand_a', () => {
    expect(attackTypeToAnimName('STAND_A' as any)).toBe('stand_a');
  });

  it('converts CROUCH_C to crouch_c', () => {
    expect(attackTypeToAnimName('CROUCH_C' as any)).toBe('crouch_c');
  });

  it('converts KYO_YAMIBARAI to kyo_yamibarai', () => {
    expect(attackTypeToAnimName('KYO_YAMIBARAI' as any)).toBe('kyo_yamibarai');
  });

  it('converts DM_OROCHINAGI to dm_orochinagi', () => {
    expect(attackTypeToAnimName('DM_OROCHINAGI' as any)).toBe('dm_orochinagi');
  });
});

// ===== getAttackAnimation =====

describe('getAttackAnimation', () => {
  it('returns animation via attack type mapping', () => {
    const anim = getAttackAnimation(mockManifest, 'ryo', 'STAND_A' as any);
    expect(anim).toBeDefined();
    expect(anim!.name).toBe('stand_a');
  });

  it('returns undefined for unmapped attack', () => {
    expect(getAttackAnimation(mockManifest, 'ryo', 'KYO_YAMIBARAI' as any)).toBeUndefined();
  });
});

// ===== SpriteAnimation structure validation =====

describe('SpriteAnimation structure', () => {
  it('idle has loop=true', () => {
    const anim = getAnimation(mockManifest, 'ryo', 'idle');
    expect(anim!.loop).toBe(true);
  });

  it('attack has loop=false', () => {
    const anim = getAnimation(mockManifest, 'ryo', 'stand_a');
    expect(anim!.loop).toBe(false);
  });

  it('attack has cancelStartFrame', () => {
    const anim = getAnimation(mockManifest, 'ryo', 'stand_a');
    expect(anim!.cancelStartFrame).toBe(2);
  });

  it('all frames have valid anchors', () => {
    const anim = getAnimation(mockManifest, 'ryo', 'idle');
    for (const frame of anim!.frames) {
      expect(frame.anchor.x).toBeGreaterThan(0);
      expect(frame.anchor.y).toBeGreaterThan(0);
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
    }
  });
});
