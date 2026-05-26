/**
 * Rendering Consolidated Tests
 *
 * Merged from: rendering, attackLimbSystem
 *
 * Covers: fighter rendering, stage rendering, color resolution.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { shiftColor, parseColor } from '../src/rendering/utils.js';
import { getAllStages, setStage, getStage } from '../src/rendering/stage.js';

// ── 1. Color Utilities ──────────────────────────────────────
describe('Color Utilities', () => {
  it('shiftColor produces valid hex color', () => {
    const result = shiftColor('#ff6600', 20);
    expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('parseColor extracts RGB components', () => {
    const { r, g, b } = parseColor('#ff6600');
    expect(r).toBe(255);
    expect(g).toBe(102);
    expect(b).toBe(0);
  });
});

// ── 2. Stage System ─────────────────────────────────────────
describe('Stage System', () => {
  it('getAllStages returns non-empty array', () => {
    const stages = getAllStages();
    expect(stages.length).toBeGreaterThan(0);
  });

  it('setStage and getStage work correctly', () => {
    const stages = getAllStages();
    setStage(stages[0]);
    expect(getStage()).toBe(stages[0]);
  });
});

// ── 3. Fighter Rendering ────────────────────────────────────
describe('Fighter Rendering', () => {
  it('different characters have different color accents', () => {
    const f1 = new Fighter(300, '#ff0000', 1);
    const f2 = new Fighter(500, '#0000ff', -1);
    expect(f1.color).not.toBe(f2.color);
  });
});
