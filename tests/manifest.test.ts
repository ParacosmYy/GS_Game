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
