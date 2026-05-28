/**
 * Cross-Character Portrait Metadata Regression Tests
 *
 * Validates portrait metadata completeness and consistency for Kyo, Iori, and Ryo.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_PORTRAIT_META,
  getKyoPortraitMeta,
  getKyoAvailablePortraitSizes,
  type PortraitMeta,
} from '../src/content/characters/kyo/portraits/kyoPortraits.js';
import {
  IORI_PORTRAIT_META,
  getIoriPortraitMeta,
  getIoriAvailablePortraitSizes,
} from '../src/content/characters/iori/portraits/ioriPortraits.js';
import {
  RYO_PORTRAIT_META,
  getRyoPortraitMeta,
  getRyoAvailablePortraitSizes,
} from '../src/content/characters/ryo/portraits/ryoPortraits.js';

const SIZES = ['select', 'vs', 'hud', 'win'] as const;
const hexPattern = /^#[0-9a-fA-F]{6}$/;

function validatePortrait(meta: PortraitMeta, context: string) {
  expect(meta.size, `${context} size`).toBeTruthy();
  expect(meta.width, `${context} width`).toBeGreaterThan(0);
  expect(meta.height, `${context} height`).toBeGreaterThan(0);
  expect(meta.pose, `${context} pose`).toBeTruthy();
  expect(meta.primaryColor, `${context} primaryColor`).toMatch(hexPattern);
  expect(meta.accentColor, `${context} accentColor`).toMatch(hexPattern);
  expect(meta.style, `${context} style`).toBeTruthy();
  expect(typeof meta.hasPixelData, `${context} hasPixelData`).toBe('boolean');
}

// ===== Kyo Portraits =====

describe('KYO_PORTRAIT_META', () => {
  it('has all 4 sizes', () => {
    for (const size of SIZES) {
      expect(KYO_PORTRAIT_META[size], `Kyo ${size}`).toBeDefined();
    }
  });

  it('all sizes have valid metadata', () => {
    for (const size of SIZES) {
      validatePortrait(KYO_PORTRAIT_META[size], `Kyo ${size}`);
    }
  });

  it('select portrait is 120x120', () => {
    expect(KYO_PORTRAIT_META.select.width).toBe(120);
    expect(KYO_PORTRAIT_META.select.height).toBe(120);
  });

  it('hud portrait is 48x48', () => {
    expect(KYO_PORTRAIT_META.hud.width).toBe(48);
    expect(KYO_PORTRAIT_META.hud.height).toBe(48);
  });

  it('has pixel data for all sizes', () => {
    for (const size of SIZES) {
      expect(KYO_PORTRAIT_META[size].hasPixelData, `Kyo ${size}`).toBe(true);
    }
  });

  it('getKyoPortraitMeta works', () => {
    expect(getKyoPortraitMeta('select').width).toBe(120);
    expect(getKyoPortraitMeta('hud').width).toBe(48);
  });

  it('getKyoAvailablePortraitSizes returns all 4', () => {
    const sizes = getKyoAvailablePortraitSizes();
    expect(sizes.length).toBe(4);
  });
});

// ===== Iori Portraits =====

describe('IORI_PORTRAIT_META', () => {
  it('has all 4 sizes', () => {
    for (const size of SIZES) {
      expect(IORI_PORTRAIT_META[size], `Iori ${size}`).toBeDefined();
    }
  });

  it('all sizes have valid metadata', () => {
    for (const size of SIZES) {
      validatePortrait(IORI_PORTRAIT_META[size], `Iori ${size}`);
    }
  });

  it('select portrait is 120x120', () => {
    expect(IORI_PORTRAIT_META.select.width).toBe(120);
    expect(IORI_PORTRAIT_META.select.height).toBe(120);
  });

  it('hud portrait is 48x48', () => {
    expect(IORI_PORTRAIT_META.hud.width).toBe(48);
    expect(IORI_PORTRAIT_META.hud.height).toBe(48);
  });

  it('has pixel data for all sizes', () => {
    for (const size of SIZES) {
      expect(IORI_PORTRAIT_META[size].hasPixelData, `Iori ${size}`).toBe(true);
    }
  });

  it('getIoriPortraitMeta works', () => {
    expect(getIoriPortraitMeta('select').width).toBe(120);
  });

  it('getIoriAvailablePortraitSizes returns all 4', () => {
    expect(getIoriAvailablePortraitSizes().length).toBe(4);
  });
});

// ===== Ryo Portraits =====

describe('RYO_PORTRAIT_META', () => {
  it('has all 4 sizes', () => {
    for (const size of SIZES) {
      expect(RYO_PORTRAIT_META[size], `Ryo ${size}`).toBeDefined();
    }
  });

  it('all sizes have valid metadata', () => {
    for (const size of SIZES) {
      validatePortrait(RYO_PORTRAIT_META[size], `Ryo ${size}`);
    }
  });

  it('select portrait is 120x120', () => {
    expect(RYO_PORTRAIT_META.select.width).toBe(120);
    expect(RYO_PORTRAIT_META.select.height).toBe(120);
  });

  it('hud portrait is 48x48', () => {
    expect(RYO_PORTRAIT_META.hud.width).toBe(48);
    expect(RYO_PORTRAIT_META.hud.height).toBe(48);
  });

  it('has pixel data for all sizes', () => {
    for (const size of SIZES) {
      expect(RYO_PORTRAIT_META[size].hasPixelData, `Ryo ${size}`).toBe(true);
    }
  });

  it('getRyoPortraitMeta works', () => {
    expect(getRyoPortraitMeta('select').width).toBe(120);
  });

  it('getRyoAvailablePortraitSizes returns all 4', () => {
    expect(getRyoAvailablePortraitSizes().length).toBe(4);
  });
});

// ===== Cross-Character Consistency =====

describe('Cross-character portrait consistency', () => {
  it('all characters have same select size (120x120)', () => {
    expect(KYO_PORTRAIT_META.select.width).toBe(IORI_PORTRAIT_META.select.width);
    expect(KYO_PORTRAIT_META.select.width).toBe(RYO_PORTRAIT_META.select.width);
    expect(KYO_PORTRAIT_META.select.height).toBe(IORI_PORTRAIT_META.select.height);
    expect(KYO_PORTRAIT_META.select.height).toBe(RYO_PORTRAIT_META.select.height);
  });

  it('all characters have same hud size (48x48)', () => {
    expect(KYO_PORTRAIT_META.hud.width).toBe(IORI_PORTRAIT_META.hud.width);
    expect(KYO_PORTRAIT_META.hud.width).toBe(RYO_PORTRAIT_META.hud.width);
  });

  it('characters have different primary colors', () => {
    const colors = [
      KYO_PORTRAIT_META.select.primaryColor,
      IORI_PORTRAIT_META.select.primaryColor,
      RYO_PORTRAIT_META.select.primaryColor,
    ];
    const unique = new Set(colors);
    expect(unique.size).toBe(3);
  });

  it('vs portrait is larger than select portrait', () => {
    expect(KYO_PORTRAIT_META.vs.width).toBeGreaterThan(KYO_PORTRAIT_META.select.width);
    expect(IORI_PORTRAIT_META.vs.width).toBeGreaterThan(IORI_PORTRAIT_META.select.width);
    expect(RYO_PORTRAIT_META.vs.width).toBeGreaterThan(RYO_PORTRAIT_META.select.width);
  });

  it('hud portrait is smallest', () => {
    expect(KYO_PORTRAIT_META.hud.width).toBeLessThan(KYO_PORTRAIT_META.select.width);
    expect(IORI_PORTRAIT_META.hud.width).toBeLessThan(IORI_PORTRAIT_META.select.width);
    expect(RYO_PORTRAIT_META.hud.width).toBeLessThan(RYO_PORTRAIT_META.select.width);
  });
});
