/**
 * Sprite Manifest Render 测试 — 验证 manifestRenderData + spriteManifest 渲染数据查询
 *
 * 覆盖：
 * 1. Character Render Data (4 tests) — getCharacterRenderData 完整性
 * 2. Color Functions (3 tests) — getOutfitColor/getHeadColor/getHairColor
 * 3. Animation Queries (4 tests) — getAnimationNames/hasAnimation/getAttackAnimation
 * 4. Fallback Behavior (2 tests) — 未知角色ID的回退数据
 * 5. Consistency (2 tests) — ROSTER 全角色覆盖 + portrait 一致性
 */
import { describe, it, expect } from 'vitest';
import {
  getCharacterRenderData,
  getCharacterColors,
  getOutfitColor,
  getHeadColor,
  getHairColor,
  SPRITE_MANIFEST,
  PORTRAIT_MANIFEST,
} from '../src/rendering/manifestRenderData.js';
import {
  getAnimationNames,
  hasAnimation,
  getAttackAnimation,
  getCharacterIds,
} from '../src/core/spriteManifest.js';
import { AttackType } from '../src/core/types.js';
import { ROSTER } from '../src/characters/index.js';

// ===== 常量 =====

/** HEX 颜色正则：#RRGGBB */
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/** 已知角色样本 — 覆盖不同队伍 */
const SAMPLE_CHARS = ['kyo', 'iori', 'ryo', 'terry', 'kim', 'leona', 'kdash', 'kula', 'mai', 'athena'];

// =====================================================================
// 1. Character Render Data
// =====================================================================

describe('Character Render Data', () => {
  it('每个角色有渲染数据且 found=true', () => {
    for (const charId of SAMPLE_CHARS) {
      const data = getCharacterRenderData(charId);
      expect(data.charId).toBe(charId);
      expect(data.found).toBe(true);
    }
  });

  it('渲染数据包含 fallbackColors 四个字段且均为有效 HEX', () => {
    for (const charId of SAMPLE_CHARS) {
      const data = getCharacterRenderData(charId);
      expect(data.fallbackColors).toBeDefined();
      expect(HEX_COLOR_RE.test(data.fallbackColors.body)).toBe(true);
      expect(HEX_COLOR_RE.test(data.fallbackColors.head)).toBe(true);
      expect(HEX_COLOR_RE.test(data.fallbackColors.outfit)).toBe(true);
      expect(HEX_COLOR_RE.test(data.fallbackColors.hair)).toBe(true);
    }
  });

  it('渲染数据包含 animationNames 非空数组', () => {
    for (const charId of SAMPLE_CHARS) {
      const data = getCharacterRenderData(charId);
      expect(Array.isArray(data.animationNames)).toBe(true);
      expect(data.animationNames.length).toBeGreaterThan(0);
    }
  });

  it('渲染数据包含 portrait（hud 和 select）', () => {
    for (const charId of SAMPLE_CHARS) {
      const data = getCharacterRenderData(charId);
      expect(data.hudPortrait).toBeDefined();
      expect(data.hudPortrait!.charId).toBe(charId);
      expect(data.hudPortrait!.size).toBe('hud');
      expect(data.selectPortrait).toBeDefined();
      expect(data.selectPortrait!.charId).toBe(charId);
      expect(data.selectPortrait!.size).toBe('select');
    }
  });
});

// =====================================================================
// 2. Color Functions
// =====================================================================

describe('Color Functions', () => {
  it('getOutfitColor 返回有效颜色字符串', () => {
    for (const charId of SAMPLE_CHARS) {
      const color = getOutfitColor(charId, '#000000');
      expect(typeof color).toBe('string');
      expect(HEX_COLOR_RE.test(color), `getOutfitColor('${charId}') = '${color}' is not valid hex`).toBe(true);
    }
    // 已知值验证
    expect(getOutfitColor('kyo', '#000000')).toBe('#FF6600');
    expect(getOutfitColor('iori', '#000000')).toBe('#AA1133');
    expect(getOutfitColor('ryo', '#000000')).toBe('#DD6600');
  });

  it('getHeadColor 返回有效颜色字符串', () => {
    for (const charId of SAMPLE_CHARS) {
      const color = getHeadColor(charId);
      expect(typeof color).toBe('string');
      expect(HEX_COLOR_RE.test(color), `getHeadColor('${charId}') = '${color}' is not valid hex`).toBe(true);
    }
    // head 一律是肤色
    expect(getHeadColor('kyo')).toBe('#FFD699');
    expect(getHeadColor('iori')).toBe('#FFD699');
  });

  it('getHairColor 返回有效颜色字符串', () => {
    for (const charId of SAMPLE_CHARS) {
      const color = getHairColor(charId);
      expect(typeof color).toBe('string');
      expect(HEX_COLOR_RE.test(color), `getHairColor('${charId}') = '${color}' is not valid hex`).toBe(true);
    }
    // 已知值验证
    expect(getHairColor('iori')).toBe('#C41E3A');
    expect(getHairColor('leona')).toBe('#C0C0C0');
    expect(getHairColor('kdash')).toBe('#C0C0C0');
  });
});

// =====================================================================
// 3. Animation Queries
// =====================================================================

describe('Animation Queries', () => {
  it('每个角色至少有 idle 动画', () => {
    const allIds = getCharacterIds(SPRITE_MANIFEST);
    for (const charId of allIds) {
      expect(
        hasAnimation(SPRITE_MANIFEST, charId, 'idle'),
        `${charId} should have 'idle' animation`,
      ).toBe(true);
    }
  });

  it('getAnimationNames 返回字符串数组', () => {
    for (const charId of SAMPLE_CHARS) {
      const names = getAnimationNames(SPRITE_MANIFEST, charId);
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      }
    }
  });

  it('hasAnimation 对存在的动画返回 true，不存在的返回 false', () => {
    // 所有角色都有 idle
    expect(hasAnimation(SPRITE_MANIFEST, 'kyo', 'idle')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'idle')).toBe(true);
    // Ryo 样板角色有完整攻击动画
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'stand_a')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'stand_c')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'koouken')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'dm_haou')).toBe(true);
    // 不存在的动画
    expect(hasAnimation(SPRITE_MANIFEST, 'kyo', 'nonexistent_anim')).toBe(false);
    expect(hasAnimation(SPRITE_MANIFEST, 'nonexistent_char', 'idle')).toBe(false);
  });

  it('getAttackAnimation 将 AttackType 映射到正确动画', () => {
    // Ryo 样板角色：STAND_A -> 'stand_a' 存在
    const standA = getAttackAnimation(SPRITE_MANIFEST, 'ryo', AttackType.STAND_A);
    expect(standA).toBeDefined();
    expect(standA!.name).toBe('stand_a');

    // Ryo: STAND_C -> 'stand_c' 存在
    const standC = getAttackAnimation(SPRITE_MANIFEST, 'ryo', AttackType.STAND_C);
    expect(standC).toBeDefined();
    expect(standC!.name).toBe('stand_c');

    // Kyo 有 stand_a（最小动画集包含）
    const kyoStandA = getAttackAnimation(SPRITE_MANIFEST, 'kyo', AttackType.STAND_A);
    expect(kyoStandA).toBeDefined();

    // 不存在的角色返回 undefined
    const missing = getAttackAnimation(SPRITE_MANIFEST, 'nonexistent_char', AttackType.STAND_A);
    expect(missing).toBeUndefined();
  });
});

// =====================================================================
// 4. Fallback Behavior
// =====================================================================

describe('Fallback Behavior', () => {
  it('未知角色 ID 返回 fallback 数据且 found=false', () => {
    const data = getCharacterRenderData('nonexistent_char_xyz');
    expect(data.charId).toBe('nonexistent_char_xyz');
    expect(data.found).toBe(false);
    // fallbackColors 应该是默认值
    expect(data.fallbackColors.body).toBe('#FFD699');
    expect(data.fallbackColors.head).toBe('#FFD699');
    expect(data.fallbackColors.outfit).toBe('#FF6600');
    expect(data.fallbackColors.hair).toBe('#333333');
    // 没有动画
    expect(data.animationNames).toEqual([]);
    // 没有肖像
    expect(data.hudPortrait).toBeUndefined();
    expect(data.selectPortrait).toBeUndefined();
  });

  it('fallback 数据仍然有效（颜色、结构完整）', () => {
    const data = getCharacterRenderData('totally_fake_id');
    // 结构完整性
    expect(data).toHaveProperty('charId');
    expect(data).toHaveProperty('fallbackColors');
    expect(data).toHaveProperty('animationNames');
    expect(data).toHaveProperty('found');
    expect(data).toHaveProperty('hudPortrait');
    expect(data).toHaveProperty('selectPortrait');
    // fallbackColors 各字段有效
    for (const color of Object.values(data.fallbackColors)) {
      expect(HEX_COLOR_RE.test(color)).toBe(true);
    }
    // getCharacterColors 对未知角色也返回 fallback
    const colors = getCharacterColors('another_fake');
    expect(colors.outfit).toBe('#FF6600');
    expect(colors.hair).toBe('#333333');
  });
});

// =====================================================================
// 5. Consistency
// =====================================================================

describe('Consistency', () => {
  it('所有 ROSTER 角色都有渲染数据', () => {
    for (const charDef of ROSTER) {
      const data = getCharacterRenderData(charDef.id);
      expect(data.found, `ROSTER character '${charDef.id}' not found in SPRITE_MANIFEST`).toBe(true);
      expect(data.fallbackColors).toBeDefined();
      expect(data.animationNames.length, `ROSTER character '${charDef.id}' has no animations`).toBeGreaterThan(0);
    }
  });

  it('渲染数据与 portrait manifest 一致（outfit=fallbackColor, hair=fallbackAccent）', () => {
    const allIds = getCharacterIds(SPRITE_MANIFEST);
    for (const charId of allIds) {
      const renderData = getCharacterRenderData(charId);
      if (!renderData.hudPortrait) continue;
      // portrait 的 fallbackColor 应来自 sprite manifest 的 outfit
      expect(renderData.hudPortrait.fallbackColor).toBe(renderData.fallbackColors.outfit);
      // portrait 的 fallbackAccent 应来自 sprite manifest 的 hair
      expect(renderData.hudPortrait.fallbackAccent).toBe(renderData.fallbackColors.hair);
    }
  });
});
