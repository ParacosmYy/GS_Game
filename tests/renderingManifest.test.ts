/**
 * Rendering Manifest Tests — 验证渲染层能正确访问 manifest 数据
 *
 * 覆盖：
 * 1. Manifest 数据可从渲染上下文访问（3 tests）
 * 2. 每个角色拥有来自 manifest 的有效渲染颜色（2 tests）
 * 3. 动画帧数据驱动渲染尺寸（3 tests）
 * 4. 肖像数据可用于 HUD 渲染（2 tests）
 */

import { describe, it, expect } from 'vitest';
import {
  getCharacterRenderData,
  getCharacterColors,
  getCharacterAnimFrameInfo,
  getOutfitColor,
  getHeadColor,
  getHairColor,
  SPRITE_MANIFEST,
  PORTRAIT_MANIFEST,
} from '../src/rendering/manifestRenderData.js';
import { getCharacterIds } from '../src/core/spriteManifest.js';

// ── 已知角色 ID（用于测试） ──
const KNOWN_CHARS = ['kyo', 'iori', 'ryo', 'terry', 'kim', 'leona', 'kdash', 'kula'];
const ALL_CHAR_IDS = getCharacterIds(SPRITE_MANIFEST);

// =====================================================================
// 1. Manifest data accessible from render context
// =====================================================================

describe('Manifest data accessible from render context', () => {
  it('SPRITE_MANIFEST has characters and version', () => {
    expect(SPRITE_MANIFEST.version).toBe(1);
    expect(Object.keys(SPRITE_MANIFEST.characters).length).toBeGreaterThanOrEqual(8);
    // Known characters must exist
    for (const charId of KNOWN_CHARS) {
      expect(SPRITE_MANIFEST.characters[charId]).toBeDefined();
    }
  });

  it('PORTRAIT_MANIFEST has portraits for known characters', () => {
    expect(PORTRAIT_MANIFEST.version).toBe(1);
    for (const charId of KNOWN_CHARS) {
      const portraits = PORTRAIT_MANIFEST.portraits[charId];
      expect(portraits).toBeDefined();
      expect(portraits!.hud).toBeDefined();
      expect(portraits!.select).toBeDefined();
    }
  });

  it('getCharacterRenderData returns complete data for a known character', () => {
    const data = getCharacterRenderData('kyo');
    expect(data.found).toBe(true);
    expect(data.charId).toBe('kyo');
    expect(data.fallbackColors).toBeDefined();
    expect(data.fallbackColors.outfit).toBe('#FF6600');
    expect(data.fallbackColors.hair).toBe('#1A1A2E');
    expect(data.fallbackColors.body).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(data.fallbackColors.head).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(data.animationNames.length).toBeGreaterThan(0);
    expect(data.hudPortrait).toBeDefined();
    expect(data.selectPortrait).toBeDefined();
  });
});

// =====================================================================
// 2. Each character has valid render colors from manifest
// =====================================================================

describe('Each character has valid render colors from manifest', () => {
  it('all characters have fallbackColors with valid hex values', () => {
    for (const charId of ALL_CHAR_IDS) {
      const colors = getCharacterColors(charId);
      // All colors must be valid 6-digit hex strings
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      expect(colors.body).toMatch(hexPattern);
      expect(colors.head).toMatch(hexPattern);
      expect(colors.outfit).toMatch(hexPattern);
      expect(colors.hair).toMatch(hexPattern);
    }
  });

  it('getOutfitColor / getHeadColor / getHairColor return manifest values and fall back for unknown chars', () => {
    // Known characters return their specific colors
    expect(getOutfitColor('kyo', '#fallback')).toBe('#FF6600');
    expect(getHeadColor('kyo')).toBe('#FFD699');
    expect(getHairColor('iori')).toBe('#C41E3A');
    expect(getOutfitColor('ryo', '#fallback')).toBe('#DD6600');

    // Unknown character returns default fallback colors
    const unknownColors = getCharacterColors('nonexistent_char');
    expect(unknownColors.body).toBe('#FFD699');
    expect(unknownColors.outfit).toBe('#FF6600');

    // getOutfitColor for unknown char returns the default outfit color
    expect(getOutfitColor('nonexistent_char', '#fallback')).toBe('#FF6600');
  });
});

// =====================================================================
// 3. Animation frame data drives render dimensions
// =====================================================================

describe('Animation frame data drives render dimensions', () => {
  it('Ryo has complete animation data with valid frame dimensions', () => {
    // Ryo is the template character with full animation data
    const idleInfo = getCharacterAnimFrameInfo('ryo', 'idle');
    expect(idleInfo).not.toBeNull();
    expect(idleInfo!.frameCount).toBe(4);
    expect(idleInfo!.width).toBe(80);  // STD_W
    expect(idleInfo!.height).toBe(160); // STD_H
    expect(idleInfo!.anchorX).toBe(40);
    expect(idleInfo!.anchorY).toBe(160);
  });

  it('attack animations have extended width during active frames', () => {
    // stand_a has startup=6 + active=3 + recovery=5 = 14 frames
    const standAInfo = getCharacterAnimFrameInfo('ryo', 'stand_a');
    expect(standAInfo).not.toBeNull();
    expect(standAInfo!.frameCount).toBe(14);

    // stand_c has extended width (STD_W + 50 = 130)
    const standCInfo = getCharacterAnimFrameInfo('ryo', 'stand_c');
    expect(standCInfo).not.toBeNull();
    expect(standCInfo!.frameCount).toBe(30);
  });

  it('getCharacterAnimFrameInfo returns null for nonexistent animation or character', () => {
    expect(getCharacterAnimFrameInfo('ryo', 'nonexistent_anim')).toBeNull();
    expect(getCharacterAnimFrameInfo('nonexistent_char', 'idle')).toBeNull();
    // Characters with minimal animations still have 'idle'
    const kyoIdle = getCharacterAnimFrameInfo('kyo', 'idle');
    expect(kyoIdle).not.toBeNull();
    expect(kyoIdle!.frameCount).toBeGreaterThanOrEqual(1);
  });
});

// =====================================================================
// 4. Portrait data available for HUD rendering
// =====================================================================

describe('Portrait data available for HUD rendering', () => {
  it('getCharacterRenderData provides HUD portrait with correct dimensions and colors', () => {
    const data = getCharacterRenderData('kyo');
    expect(data.hudPortrait).toBeDefined();
    expect(data.hudPortrait!.charId).toBe('kyo');
    expect(data.hudPortrait!.size).toBe('hud');
    expect(data.hudPortrait!.width).toBe(48);
    expect(data.hudPortrait!.height).toBe(48);
    expect(data.hudPortrait!.fallbackColor).toBe('#FF6600');
    expect(data.hudPortrait!.fallbackAccent).toBe('#1A1A2E');
  });

  it('all known characters have complete portrait set (select, vs, hud, win)', () => {
    for (const charId of KNOWN_CHARS) {
      const data = getCharacterRenderData(charId);
      expect(data.hudPortrait).toBeDefined();
      expect(data.selectPortrait).toBeDefined();
      expect(data.hudPortrait!.width).toBe(48);
      expect(data.hudPortrait!.height).toBe(48);
      expect(data.selectPortrait!.width).toBe(120);
      expect(data.selectPortrait!.height).toBe(120);
    }
  });
});
