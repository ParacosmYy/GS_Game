/**
 * Manifest Consolidated Tests
 *
 * Merged from: portraitManifest, spriteManifest, spriteManifestRender, renderingManifest, animationManifest
 *
 * Covers: portrait manifest structure, sprite manifest queries,
 *   animation data, render colors, frame timing.
 */
import { describe, it, expect } from 'vitest';
import {
  PORTRAIT_MANIFEST, PORTRAIT_SIZES,
  getPortrait, getSelectPortrait, getHUDPortrait,
  getVSPortrait, getWinPortrait,
  hasPixelPortraitData, getPortraitFallbackColor, getPortraitFallbackAccent,
  type PortraitSize,
} from '../src/core/portraitManifest.js';
import {
  getAnimation, getFallbackColors, getAnimationNames,
  hasAnimation, getCharacterIds, attackTypeToAnimName,
} from '../src/core/spriteManifest.js';
import { SPRITE_MANIFEST } from '../src/core/spriteManifestData.js';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

// ── 1. Portrait Manifest ────────────────────────────────────
describe('Portrait Manifest', () => {
  it('manifest has version field', () => {
    expect(PORTRAIT_MANIFEST.version).toBeGreaterThanOrEqual(1);
  });

  it('manifest has portraits record', () => {
    expect(PORTRAIT_MANIFEST.portraits).toBeDefined();
    expect(Object.keys(PORTRAIT_MANIFEST.portraits).length).toBeGreaterThan(0);
  });

  it('PORTRAIT_SIZES has required size variants', () => {
    expect(PORTRAIT_SIZES.select).toBeDefined();
    expect(PORTRAIT_SIZES.hud).toBeDefined();
  });

  it('getPortrait returns undefined for missing character', () => {
    expect(getPortrait(PORTRAIT_MANIFEST, 'nonexistent', 'hud')).toBeUndefined();
  });

  it('getVSPortrait returns entry for known character', () => {
    const entry = getVSPortrait(PORTRAIT_MANIFEST, 'ryo');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('vs');
    expect(entry!.width).toBe(PORTRAIT_SIZES.vs.width);
    expect(entry!.height).toBe(PORTRAIT_SIZES.vs.height);
  });

  it('getWinPortrait returns entry for known character', () => {
    const entry = getWinPortrait(PORTRAIT_MANIFEST, 'ryo');
    expect(entry).toBeDefined();
    expect(entry!.size).toBe('win');
    expect(entry!.width).toBe(PORTRAIT_SIZES.win.width);
    expect(entry!.height).toBe(PORTRAIT_SIZES.win.height);
  });

  it('getVSPortrait returns undefined for missing character', () => {
    expect(getVSPortrait(PORTRAIT_MANIFEST, 'nonexistent')).toBeUndefined();
  });

  it('getWinPortrait returns undefined for missing character', () => {
    expect(getWinPortrait(PORTRAIT_MANIFEST, 'nonexistent')).toBeUndefined();
  });

  it('hasPixelPortraitData returns true for ryo', () => {
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'ryo')).toBe(true);
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'ryo', 'select')).toBe(true);
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'ryo', 'vs')).toBe(true);
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'ryo', 'win')).toBe(true);
  });

  it('hasPixelPortraitData returns false for missing character', () => {
    expect(hasPixelPortraitData(PORTRAIT_MANIFEST, 'nonexistent')).toBe(false);
  });

  it('getPortraitFallbackColor returns valid hex for ryo', () => {
    const color = getPortraitFallbackColor(PORTRAIT_MANIFEST, 'ryo');
    expect(color).toBeDefined();
    expect(color).toBe('#DD6600');
  });

  it('getPortraitFallbackAccent returns valid hex for ryo', () => {
    const accent = getPortraitFallbackAccent(PORTRAIT_MANIFEST, 'ryo');
    expect(accent).toBeDefined();
    expect(accent).toBe('#8B4513');
  });

  it('all 4 size variants are present for ryo with correct dimensions', () => {
    const sizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
    for (const size of sizes) {
      const entry = getPortrait(PORTRAIT_MANIFEST, 'ryo', size);
      expect(entry, `ryo missing ${size} portrait`).toBeDefined();
      expect(entry!.width).toBe(PORTRAIT_SIZES[size].width);
      expect(entry!.height).toBe(PORTRAIT_SIZES[size].height);
      expect(entry!.hasPixelPortrait).toBe(true);
    }
  });

  it('each portrait entry has required fields', () => {
    const entry = getSelectPortrait(PORTRAIT_MANIFEST, 'ryo');
    expect(entry).toBeDefined();
    expect(entry!.charId).toBe('ryo');
    expect(entry!.size).toBe('select');
    expect(entry!.atlasX).toBeGreaterThanOrEqual(0);
    expect(entry!.atlasY).toBeGreaterThanOrEqual(0);
    expect(typeof entry!.fallbackColor).toBe('string');
    expect(typeof entry!.fallbackAccent).toBe('string');
    expect(HEX_COLOR_RE.test(entry!.fallbackColor)).toBe(true);
    expect(HEX_COLOR_RE.test(entry!.fallbackAccent)).toBe(true);
  });

  it('all 27 characters have all 4 portrait sizes', () => {
    const sizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
    const charCount = Object.keys(PORTRAIT_MANIFEST.portraits).length;
    expect(charCount).toBe(27);
    for (const [charId, charPortraits] of Object.entries(PORTRAIT_MANIFEST.portraits)) {
      for (const size of sizes) {
        expect(charPortraits[size], `${charId} missing ${size}`).toBeDefined();
        expect(charPortraits[size].charId).toBe(charId);
        expect(charPortraits[size].size).toBe(size);
      }
    }
  });
});

// ── 2. Sprite Manifest ─────────────────────────────────────
describe('Sprite Manifest', () => {
  it('SPRITE_MANIFEST has characters', () => {
    expect(SPRITE_MANIFEST.characters).toBeDefined();
  });

  it('getCharacterIds returns known character IDs', () => {
    const ids = getCharacterIds(SPRITE_MANIFEST);
    expect(ids.length).toBeGreaterThanOrEqual(3);
    expect(ids).toContain('ryo');
  });

  it('getFallbackColors returns valid hex colors for known character', () => {
    const colors = getFallbackColors(SPRITE_MANIFEST, 'ryo');
    if (colors) {
      expect(HEX_COLOR_RE.test(colors.outfit)).toBe(true);
      expect(HEX_COLOR_RE.test(colors.head)).toBe(true);
    }
  });

  it('getAnimationNames returns non-empty array for known character', () => {
    const names = getAnimationNames(SPRITE_MANIFEST, 'ryo');
    expect(names.length).toBeGreaterThan(0);
  });

  it('hasAnimation returns true for idle', () => {
    expect(hasAnimation(SPRITE_MANIFEST, 'ryo', 'idle')).toBe(true);
  });

  it('getAnimation returns undefined for missing character', () => {
    expect(getAnimation(SPRITE_MANIFEST, 'nonexistent', 'idle')).toBeUndefined();
  });
});

// ── 3. Animation Timing ─────────────────────────────────────
describe('Animation Timing', () => {
  it('attackTypeToAnimName maps known attacks', () => {
    const name = attackTypeToAnimName('STAND_A');
    expect(name).toBeDefined();
  });
});
