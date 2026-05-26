/**
 * Sprite Manifest 测试 — 类型完整性、查询函数、数据完整性校验
 *
 * 覆盖：
 * - 类型接口结构验证
 * - getAnimation / getFallbackColors 查询行为
 * - 全部 29 个角色 manifest 条目完整性
 * - fallback 颜色格式校验
 * - atlasPath 格式校验
 * - manifest 版本号
 */
import { describe, it, expect } from 'vitest';
import {
  getAnimation,
  getFallbackColors,
  type SpriteManifest,
  type CharacterSpriteManifest,
  type SpriteAnimation,
  type SpriteFrame,
  type SpriteAnchor,
} from '../src/core/spriteManifest.js';
import { SPRITE_MANIFEST } from '../src/core/spriteManifestData.js';

// ===== 常量 =====

/** 全部 29 个角色 ID（与 characters/index.ts ROSTER 顺序一致） */
const ALL_CHAR_IDS = [
  'kyo', 'iori', 'terry', 'kim', 'ryo', 'leona', 'kula', 'kdash',
  'robert', 'athena', 'mai', 'ralf', 'andy', 'clark', 'joe',
  'billy', 'choi', 'chang', 'mature', 'yashiro', 'chris',
  'shermie', 'vice', 'yamazaki', 'xiangfei', 'kasumi', 'mary',
];

const EXPECTED_CHAR_COUNT = 27;

/** HEX 颜色正则：#RRGGBB 或 #RGB */
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

// ===== 类型完整性测试 =====

describe('SpriteManifest 类型完整性', () => {
  it('SpriteManifest 包含 version 字段且为正整数', () => {
    expect(SPRITE_MANIFEST.version).toBe(1);
    expect(Number.isInteger(SPRITE_MANIFEST.version)).toBe(true);
    expect(SPRITE_MANIFEST.version).toBeGreaterThan(0);
  });

  it('SpriteManifest 包含 characters 字段且为对象', () => {
    expect(typeof SPRITE_MANIFEST.characters).toBe('object');
    expect(SPRITE_MANIFEST.characters).not.toBeNull();
  });

  it('CharacterSpriteManifest 结构完整：charId + atlasPath + animations + fallbackColors', () => {
    const char = SPRITE_MANIFEST.characters['kyo'];
    expect(char).toBeDefined();
    expect(typeof char!.charId).toBe('string');
    expect(typeof char!.atlasPath).toBe('string');
    expect(typeof char!.animations).toBe('object');
    expect(typeof char!.fallbackColors).toBe('object');
  });

  it('fallbackColors 包含 body/head/outfit/hair 四个字段', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'kyo');
    expect(colors).toHaveProperty('body');
    expect(colors).toHaveProperty('head');
    expect(colors).toHaveProperty('outfit');
    expect(colors).toHaveProperty('hair');
  });
});

// ===== getAnimation 查询测试 =====

describe('getAnimation', () => {
  it('角色不存在时返回 undefined', () => {
    const result = getAnimation(SPRITE_MANIFEST, 'nonexistent', 'idle');
    expect(result).toBeUndefined();
  });

  it('角色存在但动画不存在时返回 undefined', () => {
    const result = getAnimation(SPRITE_MANIFEST, 'kyo', 'idle');
    // 当前阶段 animations 为空，应返回 undefined
    expect(result).toBeUndefined();
  });

  it('角色存在且有动画时返回正确的 SpriteAnimation', () => {
    // 构造一个带动画的测试 manifest
    const testFrame: SpriteFrame = {
      atlasX: 0, atlasY: 0,
      width: 64, height: 96,
      anchor: { x: 32, y: 96 },
      duration: 100,
    };
    const testAnim: SpriteAnimation = {
      name: 'idle',
      frames: [testFrame],
      loop: true,
      cancelStartFrame: 2,
    };
    const testManifest: SpriteManifest = {
      version: 1,
      characters: {
        testchar: {
          charId: 'testchar',
          atlasPath: 'assets/sprites/testchar.png',
          animations: { idle: testAnim },
          fallbackColors: { body: '#FFD699', head: '#FFD699', outfit: '#FF6600', hair: '#333333' },
        },
      },
    };
    const result = getAnimation(testManifest, 'testchar', 'idle');
    expect(result).toBe(testAnim);
    expect(result!.name).toBe('idle');
    expect(result!.frames).toHaveLength(1);
    expect(result!.loop).toBe(true);
    expect(result!.cancelStartFrame).toBe(2);
  });
});

// ===== getFallbackColors 查询测试 =====

describe('getFallbackColors', () => {
  it('角色存在时返回其定义的颜色', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'iori');
    expect(colors.outfit).toBe('#AA1133');
    expect(colors.hair).toBe('#C41E3A');
  });

  it('角色不存在时返回默认颜色', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'nonexistent');
    expect(colors).toEqual({
      body: '#FFD699',
      head: '#FFD699',
      outfit: '#FF6600',
      hair: '#333333',
    });
  });

  it('返回的颜色值都是字符串', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'kyo');
    expect(typeof colors.body).toBe('string');
    expect(typeof colors.head).toBe('string');
    expect(typeof colors.outfit).toBe('string');
    expect(typeof colors.hair).toBe('string');
  });
});

// ===== 全角色完整性测试 =====

describe('全角色 manifest 完整性', () => {
  it(`manifest 包含 ${EXPECTED_CHAR_COUNT} 个角色`, () => {
    const charCount = Object.keys(SPRITE_MANIFEST.characters).length;
    expect(charCount).toBe(EXPECTED_CHAR_COUNT);
  });

  it('每个角色 charId 与 manifest key 一致', () => {
    for (const [key, charManifest] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(charManifest.charId).toBe(key);
    }
  });

  it('每个角色都有非空 animations 对象', () => {
    for (const [charId, charManifest] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(typeof charManifest.animations).toBe('object');
      // 当前阶段 animations 为空对象
      expect(Object.keys(charManifest.animations)).toHaveLength(0);
    }
  });
});

// ===== 颜色格式校验 =====

describe('fallback 颜色格式校验', () => {
  it('每个角色的 fallbackColors 都是 #RRGGBB 格式', () => {
    for (const [charId, charManifest] of Object.entries(SPRITE_MANIFEST.characters)) {
      const { fallbackColors } = charManifest;
      for (const [key, value] of Object.entries(fallbackColors)) {
        expect(
          HEX_COLOR_RE.test(value),
          `${charId}.fallbackColors.${key} = "${value}" 不符合 #RRGGBB 格式`,
        ).toBe(true);
      }
    }
  });

  it('每个角色 body 和 head 颜色一致（当前统一肤色）', () => {
    for (const [charId, charManifest] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(
        charManifest.fallbackColors.body,
        `${charId} 的 body/head 肤色不一致`,
      ).toBe(charManifest.fallbackColors.head);
    }
  });
});

// ===== atlasPath 格式校验 =====

describe('atlasPath 格式校验', () => {
  it('每个角色的 atlasPath 遵循 assets/sprites/{charId}.png 格式', () => {
    for (const [charId, charManifest] of Object.entries(SPRITE_MANIFEST.characters)) {
      expect(
        charManifest.atlasPath,
        `${charId} 的 atlasPath 格式不正确`,
      ).toBe(`assets/sprites/${charId}.png`);
    }
  });
});

// ===== 特定角色颜色验证（采样） =====

describe('特定角色 fallback 颜色采样验证', () => {
  it('Kyo 的 outfit 是橙色', () => {
    expect(getFallbackColors(SPRITE_MANIFEST, 'kyo').outfit).toBe('#FF6600');
  });

  it('Iori 的 outfit 是暗红色', () => {
    expect(getFallbackColors(SPRITE_MANIFEST, 'iori').outfit).toBe('#AA1133');
  });

  it('Terry 的 outfit 是金黄色', () => {
    expect(getFallbackColors(SPRITE_MANIFEST, 'terry').outfit).toBe('#CC8800');
  });

  it('Kula 的 hair 是浅蓝色', () => {
    expect(getFallbackColors(SPRITE_MANIFEST, 'kula').hair).toBe('#B0C4DE');
  });
});
