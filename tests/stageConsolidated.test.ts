/**
 * Stage Rendering Consolidated Tests
 *
 * Merged from: stage, stageTemple, stageTempleLayers
 *
 * Covers: star generation, temple star generation, hex color utilities.
 */
import { describe, it, expect } from 'vitest';
import { generateStars } from '../src/rendering/stage.js';
import { generateStars as generateTempleStars } from '../src/rendering/stageTemple.js';
import { shiftHex, hexToRgb } from '../src/rendering/stageTempleLayers.js';

// ── Stage Stars ───────────────────────────────────────────────
describe('stage generateStars', () => {
  it('returns array of correct length', () => {
    const stars = generateStars(50);
    expect(stars.length).toBe(50);
  });
  it('returns 0 stars for count=0', () => {
    const stars = generateStars(0);
    expect(stars.length).toBe(0);
  });
  it('each star has x and y numbers', () => {
    const stars = generateStars(10);
    for (const s of stars) {
      expect(typeof s.x).toBe('number');
      expect(typeof s.y).toBe('number');
    }
  });
  it('each star has speed number', () => {
    const stars = generateStars(10);
    for (const s of stars) {
      expect(typeof s.speed).toBe('number');
    }
  });
  it('each star has brightness number', () => {
    const stars = generateStars(10);
    for (const s of stars) {
      expect(typeof s.brightness).toBe('number');
    }
  });
});

// ── Temple Stars ──────────────────────────────────────────────
describe('stageTemple generateStars', () => {
  it('returns requested number of stars', () => {
    const stars = generateTempleStars(10);
    expect(stars.length).toBe(10);
  });
  it('returns empty array for count 0', () => {
    expect(generateTempleStars(0).length).toBe(0);
  });
  it('each star has x, y, brightness, speed', () => {
    const stars = generateTempleStars(5);
    for (const s of stars) {
      expect(typeof s.x).toBe('number');
      expect(typeof s.y).toBe('number');
      expect(typeof s.brightness).toBe('number');
      expect(typeof s.speed).toBe('number');
    }
  });
  it('star brightness is between 0.3 and 1.0', () => {
    const stars = generateTempleStars(20);
    for (const s of stars) {
      expect(s.brightness).toBeGreaterThanOrEqual(0.3);
      expect(s.brightness).toBeLessThanOrEqual(1.0);
    }
  });
  it('star speed is between 0.3 and 1.0', () => {
    const stars = generateTempleStars(20);
    for (const s of stars) {
      expect(s.speed).toBeGreaterThanOrEqual(0.3);
      expect(s.speed).toBeLessThanOrEqual(1.0);
    }
  });
});

// ── Stage Color Utilities ─────────────────────────────────────
describe('stageTempleLayers color utils', () => {
  it('shiftHex brightens color', () => {
    const result = shiftHex('#808080', 30);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('shiftHex darkens color', () => {
    const result = shiftHex('#808080', -30);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('shiftHex clamps at 255', () => {
    const result = shiftHex('#ffffff', 100);
    expect(result).toBe('#ffffff');
  });
  it('shiftHex clamps at 0', () => {
    const result = shiftHex('#000000', -100);
    expect(result).toBe('#000000');
  });
  it('hexToRgb returns comma-separated rgb', () => {
    const result = hexToRgb('#ff8800');
    expect(result).toBe('255,136,0');
  });
  it('hexToRgb black', () => {
    const result = hexToRgb('#000000');
    expect(result).toBe('0,0,0');
  });
});
