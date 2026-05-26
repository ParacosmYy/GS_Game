/**
 * Sprite Manifest 测试 — 查询函数、数据完整性、AttackType 映射
 *
 * 覆盖：
 * 1. Manifest structure (5 tests)
 * 2. Query functions (8 tests)
 * 3. Fallback colors (4 tests)
 * 4. AttackType mapping (5 tests)
 * 5. Animation data integrity (5 tests)
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
import { AttackType } from '../src/core/types.js';
import { SPRITE_MANIFEST } from '../src/core/spriteManifestData.js';

// ===== 常量 =====

const EXPECTED_CHAR_COUNT = 27;

/** HEX 颜色正则：#RRGGBB */
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/** 构造一个带动画的测试用 manifest */
function createTestManifest(): SpriteManifest {
  const frame = (dur: number, w = 64, h = 96): SpriteFrame => ({
    atlasX: 0, atlasY: 0,
    width: w, height: h,
    anchor: { x: 32, y: 96 },
    duration: dur,
  });

  const testChar: SpriteManifest['characters']['testchar'] = {
    charId: 'testchar',
    atlasPath: 'assets/sprites/testchar.png',
    animations: {
      idle: { name: 'idle', frames: [frame(100), frame(100), frame(100)], loop: true },
      walk: { name: 'walk', frames: [frame(80), frame(80)], loop: true },
      stand_a: { name: 'stand_a', frames: [frame(50), frame(50), frame(50), frame(50)], loop: false, cancelStartFrame: 3 },
      ryo_ko_hou: { name: 'ryo_ko_hou', frames: [frame(40), frame(40), frame(60)], loop: false },
      dm_orochinagi: { name: 'dm_orochinagi', frames: [frame(60), frame(80), frame(80), frame(60), frame(40)], loop: false },
    },
    fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#DD6600', hair: '#8B4513' },
  };

  const otherChar: SpriteManifest['characters']['other'] = {
    charId: 'other',
    atlasPath: 'assets/sprites/other.png',
    animations: {
      idle: { name: 'idle', frames: [frame(120), frame(120)], loop: true },
    },
    fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#2266BB', hair: '#C0C0C0' },
  };

  return { version: 2, characters: { testchar: testChar, other: otherChar } };
}

// =====================================================================
// 1. Manifest structure
// =====================================================================

describe('Manifest structure', () => {
  it('manifest has version', () => {
    expect(typeof SPRITE_MANIFEST.version).toBe('number');
    expect(SPRITE_MANIFEST.version).toBeGreaterThan(0);
    expect(Number.isInteger(SPRITE_MANIFEST.version)).toBe(true);
  });

  it('manifest has expected character count (27+)', () => {
    const count = Object.keys(SPRITE_MANIFEST.characters).length;
    expect(count).toBeGreaterThanOrEqual(EXPECTED_CHAR_COUNT);
  });

  it('every character has charId matching key', () => {
    for (const [key, char] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(char.charId).toBe(key);
    }
  });

  it('every character has fallbackColors with all 4 fields', () => {
    for (const [charId, char] of Object.entries(SPRITE_MANIFEST.characters)) {
      const { fallbackColors } = char;
      expect(fallbackColors).toHaveProperty('body');
      expect(fallbackColors).toHaveProperty('head');
      expect(fallbackColors).toHaveProperty('outfit');
      expect(fallbackColors).toHaveProperty('hair');
      expect(typeof fallbackColors.body).toBe('string');
      expect(typeof fallbackColors.head).toBe('string');
      expect(typeof fallbackColors.outfit).toBe('string');
      expect(typeof fallbackColors.hair).toBe('string');
    }
  });

  it('every character has animations record', () => {
    for (const [charId, char] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(typeof char.animations).toBe('object');
      expect(char.animations).not.toBeNull();
    }
  });
});

// =====================================================================
// 2. Query functions
// =====================================================================

describe('Query functions', () => {
  const testManifest = createTestManifest();

  it('getAnimation returns correct animation', () => {
    const anim = getAnimation(testManifest, 'testchar', 'idle');
    expect(anim).toBeDefined();
    expect(anim!.name).toBe('idle');
    expect(anim!.frames).toHaveLength(3);
    expect(anim!.loop).toBe(true);
  });

  it('getAnimation returns undefined for missing character', () => {
    const result = getAnimation(testManifest, 'nonexistent', 'idle');
    expect(result).toBeUndefined();
  });

  it('getAnimation returns undefined for missing animation', () => {
    const result = getAnimation(testManifest, 'testchar', 'nonexistent_anim');
    expect(result).toBeUndefined();
  });

  it('getAnimationNames returns all animation names', () => {
    const names = getAnimationNames(testManifest, 'testchar');
    expect(names).toEqual(
      expect.arrayContaining(['idle', 'walk', 'stand_a', 'ryo_ko_hou', 'dm_orochinagi']),
    );
    expect(names).toHaveLength(5);
  });

  it('getAnimationDuration returns correct total duration', () => {
    // idle: 3 frames x 100ms = 300ms
    const dur = getAnimationDuration(testManifest, 'testchar', 'idle');
    expect(dur).toBe(300);
  });

  it('getAnimationFrameCount returns correct count', () => {
    // dm_orochinagi: 5 frames
    const count = getAnimationFrameCount(testManifest, 'testchar', 'dm_orochinagi');
    expect(count).toBe(5);
  });

  it('hasAnimation returns true/false correctly', () => {
    expect(hasAnimation(testManifest, 'testchar', 'idle')).toBe(true);
    expect(hasAnimation(testManifest, 'testchar', 'nonexistent')).toBe(false);
    expect(hasAnimation(testManifest, 'nonexistent', 'idle')).toBe(false);
  });

  it('getCharacterIds returns all character IDs', () => {
    const ids = getCharacterIds(testManifest);
    expect(ids).toEqual(expect.arrayContaining(['testchar', 'other']));
    expect(ids).toHaveLength(2);
  });
});

// =====================================================================
// 3. Fallback colors
// =====================================================================

describe('Fallback colors', () => {
  it('getFallbackColors returns character-specific colors', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'kyo');
    expect(colors.outfit).toBe('#FF6600');
    expect(colors.hair).toBe('#1A1A2E');
  });

  it('getFallbackColors returns default for missing character', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'nonexistent');
    expect(colors).toEqual({
      body: '#FFD699',
      head: '#FFD699',
      outfit: '#FF6600',
      hair: '#333333',
    });
  });

  it('all fallback colors are valid hex strings', () => {
    for (const [charId, char] of Object.entries(SPRITE_MANIFEST.characters)) {
      const { fallbackColors } = char;
      for (const [field, value] of Object.entries(fallbackColors)) {
        expect(
          HEX_COLOR_RE.test(value),
          `${charId}.fallbackColors.${field} = "${value}" is not valid #RRGGBB`,
        ).toBe(true);
      }
    }
  });

  it('all characters have distinct body/head vs outfit/hair separation', () => {
    for (const [charId, char] of Object.entries(SPRITE_MANIFEST.characters)) {
      const { fallbackColors } = char;
      // outfit color should differ from body skin tone
      expect(
        fallbackColors.outfit,
        `${charId} outfit color should differ from body`,
      ).not.toBe(fallbackColors.body);
      // hair color should differ from body skin tone
      expect(
        fallbackColors.hair,
        `${charId} hair color should differ from body`,
      ).not.toBe(fallbackColors.body);
    }
  });
});

// =====================================================================
// 4. AttackType mapping
// =====================================================================

describe('AttackType mapping', () => {
  const testManifest = createTestManifest();

  it('attackTypeToAnimName maps STAND_A -> "stand_a"', () => {
    expect(attackTypeToAnimName(AttackType.STAND_A)).toBe('stand_a');
  });

  it('attackTypeToAnimName maps RYO_KO_HOU -> "ryo_ko_hou"', () => {
    expect(attackTypeToAnimName(AttackType.RYO_KO_HOU)).toBe('ryo_ko_hou');
  });

  it('attackTypeToAnimName maps DM_OROCHINAGI -> "dm_orochinagi"', () => {
    expect(attackTypeToAnimName(AttackType.DM_OROCHINAGI)).toBe('dm_orochinagi');
  });

  it('getAttackAnimation returns animation for mapped attack', () => {
    const anim = getAttackAnimation(testManifest, 'testchar', AttackType.STAND_A);
    expect(anim).toBeDefined();
    expect(anim!.name).toBe('stand_a');
    expect(anim!.frames).toHaveLength(4);
  });

  it('getAttackAnimation returns undefined for unmapped attack', () => {
    // testchar does not have a JUMP_C animation
    const anim = getAttackAnimation(testManifest, 'testchar', AttackType.JUMP_C);
    expect(anim).toBeUndefined();
  });
});

// =====================================================================
// 5. Animation data integrity
// =====================================================================

describe('Animation data integrity', () => {
  const testManifest = createTestManifest();
  // Collect all animations across all characters in the test manifest
  const allAnimations: { charId: string; anim: SpriteAnimation }[] = [];
  for (const [charId, char] of Object.entries(testManifest.characters)) {
    for (const anim of Object.values(char.animations)) {
      allAnimations.push({ charId, anim });
    }
  }

  it('every animation has at least 1 frame', () => {
    for (const { charId, anim } of allAnimations) {
      expect(
        anim.frames.length,
        `${charId}/${anim.name} has 0 frames`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('every frame has valid dimensions (width > 0, height > 0)', () => {
    for (const { charId, anim } of allAnimations) {
      for (let i = 0; i < anim.frames.length; i++) {
        const f = anim.frames[i];
        expect(
          f.width,
          `${charId}/${anim.name} frame[${i}].width must be > 0`,
        ).toBeGreaterThan(0);
        expect(
          f.height,
          `${charId}/${anim.name} frame[${i}].height must be > 0`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('every frame has valid anchor (x >= 0, y >= 0)', () => {
    for (const { charId, anim } of allAnimations) {
      for (let i = 0; i < anim.frames.length; i++) {
        const f = anim.frames[i];
        expect(
          f.anchor.x,
          `${charId}/${anim.name} frame[${i}].anchor.x must be >= 0`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          f.anchor.y,
          `${charId}/${anim.name} frame[${i}].anchor.y must be >= 0`,
        ).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('looping animations have >= 2 frames', () => {
    for (const { charId, anim } of allAnimations) {
      if (anim.loop) {
        expect(
          anim.frames.length,
          `${charId}/${anim.name} is looping but has only ${anim.frames.length} frame(s) (needs >= 2)`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('every frame duration is > 0', () => {
    for (const { charId, anim } of allAnimations) {
      for (let i = 0; i < anim.frames.length; i++) {
        const f = anim.frames[i];
        if (f.duration !== undefined) {
          expect(
            f.duration,
            `${charId}/${anim.name} frame[${i}].duration must be > 0`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});
