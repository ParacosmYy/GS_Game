/**
 * Character Definitions Consolidated Tests
 *
 * Merged from: iori, athenaDef, andyDef, roster, kyo, ryo, kyoIoriPortraits
 *
 * Covers: individual character definition structure, roster registry integrity,
 *   Kyo/Iori multi-size portrait pixel visibility.
 */
import { describe, it, expect } from 'vitest';
import { IoriDef } from '../src/characters/iori.js';
import { KyoDef } from '../src/characters/kyo.js';
import { RyoDef } from '../src/characters/ryo.js';
import { AthenaDef } from '../src/characters/athena.js';
import { AndyDef } from '../src/characters/andy.js';
import { ROSTER } from '../src/characters/index.js';
import { getPortraitForSize } from '../src/rendering/manifestRenderData.js';
import type { PixelPortraitData } from '../src/rendering/pixelPortraits.js';

// ── Iori ──────────────────────────────────────────────────────
describe('Iori character definition', () => {
  it('has id iori', () => { expect(IoriDef.id).toBe('iori'); });
  it('has name', () => { expect(typeof IoriDef.name).toBe('string'); });
  it('has nameCn', () => { expect(typeof IoriDef.nameCn).toBe('string'); });
  it('has color string', () => { expect(typeof IoriDef.color).toBe('string'); });
  it('has winQuotes array', () => {
    expect(Array.isArray(IoriDef.winQuotes)).toBe(true);
    expect(IoriDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => { expect(IoriDef.stats).toBeDefined(); });
  it('has poses', () => { expect(IoriDef.poses).toBeDefined(); });
  it('has moveList', () => { expect(Array.isArray(IoriDef.moveList)).toBe(true); });
  it('has proportions', () => { expect(IoriDef.proportions).toBeDefined(); });
});

// ── Athena ────────────────────────────────────────────────────
describe('Athena character definition', () => {
  it('has correct id', () => {
    expect(AthenaDef.id).toBe('athena');
  });
  it('has name and nameCn', () => {
    expect(AthenaDef.name).toBeDefined();
    expect(AthenaDef.nameCn).toBeDefined();
  });
  it('has valid hex colors', () => {
    expect(AthenaDef.color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(AthenaDef.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('has stats with positive values', () => {
    expect(AthenaDef.stats.walkSpeed).toBeGreaterThan(0);
    expect(AthenaDef.stats.maxHealth).toBeGreaterThan(0);
  });
  it('has poses with idle state', () => {
    expect(AthenaDef.poses).toBeDefined();
    expect(Object.keys(AthenaDef.poses).length).toBeGreaterThan(0);
  });
});

// ── Andy ──────────────────────────────────────────────────────
describe('Andy character definition', () => {
  it('has correct id', () => {
    expect(AndyDef.id).toBe('andy');
  });
  it('has name and nameCn', () => {
    expect(AndyDef.name).toBe('ANDY BOGARD');
    expect(AndyDef.nameCn).toBe('安迪');
  });
  it('has color and accentColor', () => {
    expect(AndyDef.color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(AndyDef.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('has stats with walkSpeed and maxHealth', () => {
    expect(AndyDef.stats).toBeDefined();
    expect(AndyDef.stats.walkSpeed).toBeGreaterThan(0);
    expect(AndyDef.stats.maxHealth).toBeGreaterThan(0);
  });
  it('has poses defined', () => {
    expect(AndyDef.poses).toBeDefined();
    expect(Object.keys(AndyDef.poses).length).toBeGreaterThan(0);
  });
});

// ── Roster Registry ───────────────────────────────────────────
describe('ROSTER registry', () => {
  it('has 26+ characters', () => {
    expect(ROSTER.length).toBeGreaterThanOrEqual(26);
  });
  it('all entries have unique ids', () => {
    const ids = ROSTER.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
  it('contains ryo', () => {
    expect(ROSTER.some(c => c.id === 'ryo')).toBe(true);
  });
  it('contains kyo', () => {
    expect(ROSTER.some(c => c.id === 'kyo')).toBe(true);
  });
  it('all entries have valid stats', () => {
    for (const c of ROSTER) {
      expect(c.stats.walkSpeed).toBeGreaterThan(0);
      expect(c.stats.maxHealth).toBeGreaterThan(0);
    }
  });
});

// ── Kyo ───────────────────────────────────────────────────────
describe('Kyo character definition', () => {
  it('has id kyo', () => {
    expect(KyoDef.id).toBe('kyo');
  });
  it('has name', () => {
    expect(KyoDef.name).toBeDefined();
    expect(typeof KyoDef.name).toBe('string');
  });
  it('has color string', () => {
    expect(typeof KyoDef.color).toBe('string');
  });
  it('has winQuotes array', () => {
    expect(Array.isArray(KyoDef.winQuotes)).toBe(true);
    expect(KyoDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => {
    expect(KyoDef.stats).toBeDefined();
  });
  it('has poses', () => {
    expect(KyoDef.poses).toBeDefined();
  });
  it('has moveList', () => {
    expect(Array.isArray(KyoDef.moveList)).toBe(true);
  });
  it('has proportions', () => {
    expect(KyoDef.proportions).toBeDefined();
  });
});

// ── Ryo ───────────────────────────────────────────────────────
describe('Ryo character definition', () => {
  it('has id ryo', () => {
    expect(RyoDef.id).toBe('ryo');
  });
  it('has name', () => {
    expect(RyoDef.name).toBe('Ryo Sakazaki');
  });
  it('has nameCn', () => {
    expect(RyoDef.nameCn).toBe('坂崎亮');
  });
  it('has color string', () => {
    expect(typeof RyoDef.color).toBe('string');
    expect(RyoDef.color.length).toBeGreaterThan(0);
  });
  it('has winQuotes array', () => {
    expect(Array.isArray(RyoDef.winQuotes)).toBe(true);
    expect(RyoDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => {
    expect(RyoDef.stats).toBeDefined();
    expect(typeof RyoDef.stats).toBe('object');
  });
  it('has poses', () => {
    expect(RyoDef.poses).toBeDefined();
    expect(typeof RyoDef.poses).toBe('object');
  });
  it('has moveList', () => {
    expect(Array.isArray(RyoDef.moveList)).toBe(true);
  });
  it('has proportions', () => {
    expect(RyoDef.proportions).toBeDefined();
  });
});

// ── Kyo/Iori Portrait Pixels ──────────────────────────────────
function countVisiblePixels(portrait: PixelPortraitData): number {
  let visible = 0;
  for (const row of portrait.pixels) {
    for (const idx of row) {
      if ((idx ?? 0) > 0) visible++;
    }
  }
  return visible;
}

describe('Kyo and Iori portrait pixels', () => {
  const cases: Array<[string, 'select' | 'hud' | 'win']> = [
    ['kyo', 'select'],
    ['kyo', 'hud'],
    ['kyo', 'win'],
    ['iori', 'select'],
    ['iori', 'hud'],
    ['iori', 'win'],
  ];

  it.each(cases)('has visible pixels for %s %s portrait', (charId, size) => {
    const portrait = getPortraitForSize(charId, size);
    expect(portrait).toBeDefined();
    expect(countVisiblePixels(portrait!)).toBeGreaterThan(0);
  });
});
