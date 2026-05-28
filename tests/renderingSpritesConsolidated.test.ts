/**
 * Rendering & Sprites Consolidated Tests
 *
 * Merged from: kyoHighResRender, ryoHighResRender, closeAttackRegistration,
 *   spriteFrameCache, skeletalParts, pixelPortraits, portraitFallbackGlyphs
 *
 * Covers: high-res frame lookups, close attack registration, sprite cache,
 *   skeletal outfit data, pixel portrait structure, fallback glyphs.
 */
import { describe, it, expect } from 'vitest';
import { FighterState, AttackType } from '../src/core/types.js';
import { hasHighResFrame, getResolvedFrameKey } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { SpriteFrameCache } from '../src/rendering/spriteFrameCache.js';
import { CHAR_OUTFIT, RYO_PALETTES, getOutfit } from '../src/rendering/skeletalParts.js';
import { kyoPortrait } from '../src/rendering/portraits/kyoPortrait.js';
import { ryoSelectPortrait } from '../src/rendering/portraits/ryoPortraits.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';

const S = FighterState.STAND_ATTACK;

// ── Kyo High-Res ──────────────────────────────────────────────
describe('kyoHighResRender', () => {
  it('registers a high-res block frame set for Kyo', () => {
    expect(hasKyoHighResFrame(FighterState.BLOCK)).toBe(true);
  });
});

// ── Ryo High-Res ──────────────────────────────────────────────
describe('ryoHighResRender', () => {
  it('hasHighResFrame returns false for non-ryo', () => {
    expect(hasHighResFrame('kyo', FighterState.IDLE)).toBe(false);
  });
  it('hasHighResFrame returns boolean for ryo idle', () => {
    const result = hasHighResFrame('ryo', FighterState.IDLE);
    expect(typeof result).toBe('boolean');
  });
  it('getResolvedFrameKey returns value', () => {
    const key = getResolvedFrameKey(FighterState.IDLE, null, 0, 1);
    expect(key).toBeDefined();
  });
});

// ── Close Attack Registration ─────────────────────────────────
describe('Close attack frame registration', () => {
  it('Ryo CLOSE_A', () => expect(hasHighResFrame('ryo', S, AttackType.CLOSE_A)).toBe(true));
  it('Ryo CLOSE_C', () => expect(hasHighResFrame('ryo', S, AttackType.CLOSE_C)).toBe(true));
  it('Ryo CLOSE_B', () => expect(hasHighResFrame('ryo', S, AttackType.CLOSE_B)).toBe(true));
  it('Ryo CLOSE_D', () => expect(hasHighResFrame('ryo', S, AttackType.CLOSE_D)).toBe(true));
  it('Kyo CLOSE_A', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_A)).toBe(true));
  it('Kyo CLOSE_C', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_C)).toBe(true));
  it('Kyo CLOSE_B', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_B)).toBe(true));
  it('Kyo CLOSE_D', () => expect(hasKyoHighResFrame(S, AttackType.CLOSE_D)).toBe(true));
  it('Iori CLOSE_A', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_A)).toBe(true));
  it('Iori CLOSE_C', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_C)).toBe(true));
  it('Iori CLOSE_B', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_B)).toBe(true));
  it('Iori CLOSE_D', () => expect(hasIoriHighResFrame(S, AttackType.CLOSE_D)).toBe(true));
});

// ── Sprite Frame Cache ────────────────────────────────────────
describe('SpriteFrameCache', () => {
  it('can be instantiated', () => {
    const cache = new SpriteFrameCache();
    expect(cache).toBeDefined();
  });
  it('has returns false for uncached frame', () => {
    const cache = new SpriteFrameCache();
    expect(cache.has('ryo', 'idle', 0, 0)).toBe(false);
  });
  it('get returns null for uncached frame', () => {
    const cache = new SpriteFrameCache();
    expect(cache.get('ryo', 'idle', 0, 0)).toBeNull();
  });
  it('clear does not throw', () => {
    const cache = new SpriteFrameCache();
    expect(() => cache.clear()).not.toThrow();
  });
  it('size returns 0 for empty cache', () => {
    const cache = new SpriteFrameCache();
    expect(cache.size).toBe(0);
  });
});

// ── Skeletal Parts ────────────────────────────────────────────
describe('skeletalParts', () => {
  it('CHAR_OUTFIT has entries', () => {
    expect(Object.keys(CHAR_OUTFIT).length).toBeGreaterThan(0);
  });
  it('CHAR_OUTFIT ryo has outfit fields', () => {
    const ryo = CHAR_OUTFIT['ryo'];
    expect(ryo).toBeDefined();
    expect(ryo).toHaveProperty('shirt');
    expect(ryo).toHaveProperty('pants');
  });
  it('RYO_PALETTES is non-empty array', () => {
    expect(Array.isArray(RYO_PALETTES)).toBe(true);
    expect(RYO_PALETTES.length).toBeGreaterThan(0);
  });
  it('getOutfit returns outfit for ryo', () => {
    const outfit = getOutfit('ryo');
    expect(outfit).toBeDefined();
    expect(outfit.shirt).toBeDefined();
    expect(outfit.pants).toBeDefined();
  });
  it('getOutfit returns default for unknown', () => {
    const outfit = getOutfit('unknown_char');
    expect(outfit).toBeDefined();
    expect(typeof outfit.shirt).toBe('string');
  });
});

// ── Pixel Portraits ───────────────────────────────────────────
describe('pixelPortraits structure', () => {
  it('portrait has width/height as positive numbers', () => {
    expect(typeof kyoPortrait.width).toBe('number');
    expect(typeof kyoPortrait.height).toBe('number');
    expect(kyoPortrait.width).toBeGreaterThan(0);
    expect(kyoPortrait.height).toBeGreaterThan(0);
  });
  it('portrait has palette as object with numeric keys', () => {
    expect(typeof kyoPortrait.palette).toBe('object');
    expect(Object.keys(kyoPortrait.palette).length).toBeGreaterThan(0);
  });
  it('portrait has pixels array', () => {
    expect(Array.isArray(kyoPortrait.pixels)).toBe(true);
    expect(kyoPortrait.pixels.length).toBeGreaterThan(0);
  });
  it('ryo select portrait has valid dimensions', () => {
    expect(ryoSelectPortrait.width).toBeGreaterThan(0);
    expect(ryoSelectPortrait.height).toBeGreaterThan(0);
    expect(ryoSelectPortrait.palette).toBeDefined();
  });
});

// ── Portrait Fallback Glyphs ──────────────────────────────────
function isEmojiLike(value: string): boolean {
  return /\p{Extended_Pictographic}/u.test(value);
}

describe('portrait fallback glyphs', () => {
  it('Kyo uses a non-emoji fallback glyph', () => {
    expect(isEmojiLike(KyoDef.portrait)).toBe(false);
  });
  it('Iori uses a non-emoji fallback glyph', () => {
    expect(isEmojiLike(IoriDef.portrait)).toBe(false);
  });
});
