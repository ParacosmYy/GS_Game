/**
 * Portrait Manifest 测试 — manifest 结构、查询函数、数据完整性、尺寸常量
 *
 * 覆盖：
 * - Manifest 结构验证（版本、角色数、尺寸、条目完整性）
 * - 查询函数行为（getPortrait、getSelectPortrait、getHUDPortrait、缺失场景）
 * - 数据完整性（尺寸有效、颜色格式、唯一 charId、坐标非负）
 * - PORTRAIT_SIZES 常量验证
 */
import { describe, it, expect } from 'vitest';
import {
  PORTRAIT_MANIFEST,
  PORTRAIT_SIZES,
  getPortrait,
  getSelectPortrait,
  getHUDPortrait,
  type PortraitEntry,
  type PortraitManifest,
  type PortraitSize,
} from '../src/core/portraitManifest.js';

/** HEX 颜色正则：#RRGGBB */
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/** 全部 27 个角色 ID（与 ROSTER 注册顺序一致） */
const ALL_CHAR_IDS = [
  'kyo', 'iori', 'terry', 'andy', 'joe',
  'kim', 'chang', 'choi',
  'ryo', 'robert',
  'leona', 'ralf', 'clark',
  'athena',
  'mai',
  'kdash', 'kula',
  'yashiro', 'shermie', 'chris',
  'mature', 'vice',
  'billy', 'yamazaki', 'mary', 'xiangfei', 'kasumi',
];

const EXPECTED_CHAR_COUNT = 27;

// ===== Manifest 结构测试 =====

describe('Manifest 结构', () => {
  it('manifest 包含 version 字段且为正整数', () => {
    expect(PORTRAIT_MANIFEST.version).toBe(1);
    expect(Number.isInteger(PORTRAIT_MANIFEST.version)).toBe(true);
    expect(PORTRAIT_MANIFEST.version).toBeGreaterThan(0);
  });

  it(`manifest 包含 ${EXPECTED_CHAR_COUNT} 个角色`, () => {
    const charCount = Object.keys(PORTRAIT_MANIFEST.portraits).length;
    expect(charCount).toBe(EXPECTED_CHAR_COUNT);
  });

  it('每个角色包含全部 4 种尺寸变体', () => {
    const sizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
    for (const charId of Object.keys(PORTRAIT_MANIFEST.portraits)) {
      const charPortraits = PORTRAIT_MANIFEST.portraits[charId];
      for (const size of sizes) {
        expect(charPortraits[size], `${charId} 缺少 ${size} 尺寸`).toBeDefined();
      }
    }
  });

  it('每个 PortraitEntry 结构完整', () => {
    for (const [charId, charPortraits] of Object.entries(PORTRAIT_MANIFEST.portraits)) {
      for (const [size, entry] of Object.entries(charPortraits)) {
        const e = entry as PortraitEntry;
        expect(e.charId, `${charId}/${size} charId 缺失`).toBe(charId);
        expect(e.size, `${charId}/${size} size 缺失`).toBe(size);
        expect(typeof e.atlasX, `${charId}/${size} atlasX 类型错误`).toBe('number');
        expect(typeof e.atlasY, `${charId}/${size} atlasY 类型错误`).toBe('number');
        expect(typeof e.width, `${charId}/${size} width 类型错误`).toBe('number');
        expect(typeof e.height, `${charId}/${size} height 类型错误`).toBe('number');
        expect(typeof e.fallbackColor, `${charId}/${size} fallbackColor 类型错误`).toBe('string');
        expect(typeof e.fallbackAccent, `${charId}/${size} fallbackAccent 类型错误`).toBe('string');
      }
    }
  });
});

// ===== 查询函数测试 =====

describe('查询函数', () => {
  it('getPortrait 返回存在的角色尺寸', () => {
    const entry = getPortrait(PORTRAIT_MANIFEST, 'kyo', 'select');
    expect(entry).toBeDefined();
    expect(entry!.charId).toBe('kyo');
    expect(entry!.size).toBe('select');
  });

  it('getSelectPortrait 返回选人尺寸', () => {
    const entry = getSelectPortrait(PORTRAIT_MANIFEST, 'iori');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('select');
    expect(entry!.width).toBe(PORTRAIT_SIZES.select.width);
    expect(entry!.height).toBe(PORTRAIT_SIZES.select.height);
  });

  it('getHUDPortrait 返回 HUD 尺寸', () => {
    const entry = getHUDPortrait(PORTRAIT_MANIFEST, 'terry');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('hud');
    expect(entry!.width).toBe(PORTRAIT_SIZES.hud.width);
    expect(entry!.height).toBe(PORTRAIT_SIZES.hud.height);
  });

  it('getPortrait 对不存在的角色返回 undefined', () => {
    const entry = getPortrait(PORTRAIT_MANIFEST, 'nonexistent', 'select');
    expect(entry).toBeUndefined();
  });

  it('getPortrait 对不存在的尺寸返回 undefined（当角色也不存在时）', () => {
    // 角色不存在时无论尺寸如何都应返回 undefined
    expect(getPortrait(PORTRAIT_MANIFEST, 'nobody', 'vs')).toBeUndefined();
    // 存在的角色、存在的尺寸
    expect(getPortrait(PORTRAIT_MANIFEST, 'kyo', 'vs')).toBeDefined();
  });
});

// ===== 数据完整性测试 =====

describe('数据完整性', () => {
  it('所有肖像条目的 width/height 与 PORTRAIT_SIZES 一致', () => {
    for (const [charId, charPortraits] of Object.entries(PORTRAIT_MANIFEST.portraits)) {
      for (const [size, entry] of Object.entries(charPortraits)) {
        const e = entry as PortraitEntry;
        const dims = PORTRAIT_SIZES[size as PortraitSize];
        expect(e.width, `${charId}/${size} width 不匹配`).toBe(dims.width);
        expect(e.height, `${charId}/${size} height 不匹配`).toBe(dims.height);
      }
    }
  });

  it('所有 fallbackColor 和 fallbackAccent 都是 #RRGGBB 格式', () => {
    for (const [charId, charPortraits] of Object.entries(PORTRAIT_MANIFEST.portraits)) {
      for (const [size, entry] of Object.entries(charPortraits)) {
        const e = entry as PortraitEntry;
        expect(
          HEX_COLOR_RE.test(e.fallbackColor),
          `${charId}/${size} fallbackColor="${e.fallbackColor}" 不符合 #RRGGBB`,
        ).toBe(true);
        expect(
          HEX_COLOR_RE.test(e.fallbackAccent),
          `${charId}/${size} fallbackAccent="${e.fallbackAccent}" 不符合 #RRGGBB`,
        ).toBe(true);
      }
    }
  });

  it('所有 charId 唯一且覆盖全部 27 个角色', () => {
    const charIds = Object.keys(PORTRAIT_MANIFEST.portraits);
    const uniqueIds = new Set(charIds);
    expect(uniqueIds.size).toBe(EXPECTED_CHAR_COUNT);
    for (const id of ALL_CHAR_IDS) {
      expect(uniqueIds.has(id), `缺少角色 ${id}`).toBe(true);
    }
  });

  it('所有 atlas 坐标为非负数', () => {
    for (const [charId, charPortraits] of Object.entries(PORTRAIT_MANIFEST.portraits)) {
      for (const [size, entry] of Object.entries(charPortraits)) {
        const e = entry as PortraitEntry;
        expect(e.atlasX, `${charId}/${size} atlasX 不应为负`).toBeGreaterThanOrEqual(0);
        expect(e.atlasY, `${charId}/${size} atlasY 不应为负`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ===== PORTRAIT_SIZES 常量测试 =====

describe('PORTRAIT_SIZES 常量', () => {
  it('包含 select/vs/hud/win 四种尺寸', () => {
    const sizes = Object.keys(PORTRAIT_SIZES);
    expect(sizes).toHaveLength(4);
    expect(sizes).toContain('select');
    expect(sizes).toContain('vs');
    expect(sizes).toContain('hud');
    expect(sizes).toContain('win');
  });

  it('所有尺寸都是正方形（width === height）', () => {
    for (const [name, dims] of Object.entries(PORTRAIT_SIZES)) {
      expect(dims.width, `${name} width 应等于 height`).toBe(dims.height);
    }
  });

  it('所有尺寸满足最小值要求（width >= 32, height >= 32）', () => {
    for (const [name, dims] of Object.entries(PORTRAIT_SIZES)) {
      expect(dims.width, `${name} width 应 >= 32`).toBeGreaterThanOrEqual(32);
      expect(dims.height, `${name} height 应 >= 32`).toBeGreaterThanOrEqual(32);
    }
  });
});
