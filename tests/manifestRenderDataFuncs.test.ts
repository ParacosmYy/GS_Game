/**
 * Manifest Render Data Function Tests
 *
 * Tests pure query functions from manifestRenderData.ts:
 * getCharacterRenderData, getCharacterColors, getOutfitColor, getHeadColor,
 * getHairColor, getPortraitForSize, getCharacterAnimFrameInfo.
 */
import { describe, it, expect } from 'vitest';
import {
  getCharacterRenderData,
  getCharacterColors,
  getOutfitColor,
  getHeadColor,
  getHairColor,
  getPortraitForSize,
  getCharacterAnimFrameInfo,
  hasPortraitForSize,
} from '../src/rendering/manifestRenderData.js';

// ===== getCharacterRenderData =====

describe('getCharacterRenderData', () => {
  it('returns found=true for ryo', () => {
    const data = getCharacterRenderData('ryo');
    expect(data.found).toBe(true);
    expect(data.charId).toBe('ryo');
  });

  it('returns found=false for unknown', () => {
    const data = getCharacterRenderData('nonexistent');
    expect(data.found).toBe(false);
    expect(data.charId).toBe('nonexistent');
  });

  it('returns fallbackColors with all fields', () => {
    const data = getCharacterRenderData('ryo');
    expect(data.fallbackColors.body).toBeDefined();
    expect(data.fallbackColors.head).toBeDefined();
    expect(data.fallbackColors.outfit).toBeDefined();
    expect(data.fallbackColors.hair).toBeDefined();
  });

  it('returns animationNames array', () => {
    const data = getCharacterRenderData('ryo');
    expect(Array.isArray(data.animationNames)).toBe(true);
  });
});

// ===== getCharacterColors =====

describe('getCharacterColors', () => {
  it('returns 4 color fields for ryo', () => {
    const c = getCharacterColors('ryo');
    expect(c.body).toMatch(/^#/);
    expect(c.head).toMatch(/^#/);
    expect(c.outfit).toMatch(/^#/);
    expect(c.hair).toMatch(/^#/);
  });

  it('returns default colors for unknown char', () => {
    const c = getCharacterColors('unknown');
    expect(c.body).toBeDefined();
    expect(c.outfit).toBeDefined();
  });
});

// ===== getOutfitColor / getHeadColor / getHairColor =====

describe('color accessor functions', () => {
  it('getOutfitColor returns hex string', () => {
    const c = getOutfitColor('ryo', '#ff0000');
    expect(c).toMatch(/^#/);
  });

  it('getHeadColor returns hex string', () => {
    const c = getHeadColor('ryo');
    expect(c).toMatch(/^#/);
  });

  it('getHairColor returns hex string', () => {
    const c = getHairColor('ryo');
    expect(c).toMatch(/^#/);
  });

  it('getOutfitColor uses fallback for unknown char', () => {
    const c = getOutfitColor('nonexistent', '#aabbcc');
    expect(c).toBeDefined();
  });
});

// ===== getPortraitForSize =====

describe('getPortraitForSize', () => {
  it('returns undefined for unknown char', () => {
    const p = getPortraitForSize('nonexistent', 'hud');
    expect(p).toBeUndefined();
  });
});

// ===== hasPortraitForSize =====

describe('hasPortraitForSize', () => {
  it('returns boolean', () => {
    const result = hasPortraitForSize('ryo', 'hud');
    expect(typeof result).toBe('boolean');
  });

  it('returns false for unknown char', () => {
    expect(hasPortraitForSize('nonexistent', 'hud')).toBe(false);
  });
});

// ===== getCharacterAnimFrameInfo =====

describe('getCharacterAnimFrameInfo', () => {
  it('returns null for unknown char', () => {
    expect(getCharacterAnimFrameInfo('nonexistent', 'idle')).toBeNull();
  });

  it('returns null for unknown animation', () => {
    expect(getCharacterAnimFrameInfo('ryo', 'nonexistent')).toBeNull();
  });
});
