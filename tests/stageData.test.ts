/**
 * Stage Data & Star Generation Regression Tests
 *
 * Validates generateStars() pure data function, Star type structure,
 * and stage-related constants and query functions.
 */
import { describe, it, expect } from 'vitest';
import { generateStars, getAllStages, type Star, type StageId } from '../src/rendering/stage.js';

// ===== generateStars =====

describe('generateStars', () => {
  it('returns requested number of stars', () => {
    for (const count of [0, 1, 5, 50, 100]) {
      const stars = generateStars(count);
      expect(stars.length, `count=${count}`).toBe(count);
    }
  });

  it('each star has all required properties', () => {
    const stars = generateStars(20);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      expect(typeof s.x, `star[${i}].x`).toBe('number');
      expect(typeof s.y, `star[${i}].y`).toBe('number');
      expect(typeof s.brightness, `star[${i}].brightness`).toBe('number');
      expect(typeof s.speed, `star[${i}].speed`).toBe('number');
    }
  });

  it('star x is within canvas width range (0-800)', () => {
    const stars = generateStars(100);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(800);
    }
  });

  it('star y is within sky range (0-250)', () => {
    const stars = generateStars(100);
    for (const s of stars) {
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(250);
    }
  });

  it('star brightness is between 0.3 and 1.0', () => {
    const stars = generateStars(100);
    for (const s of stars) {
      expect(s.brightness).toBeGreaterThanOrEqual(0.3);
      expect(s.brightness).toBeLessThanOrEqual(1.0);
    }
  });

  it('star speed is between 0.3 and 1.0', () => {
    const stars = generateStars(100);
    for (const s of stars) {
      expect(s.speed).toBeGreaterThanOrEqual(0.3);
      expect(s.speed).toBeLessThanOrEqual(1.0);
    }
  });

  it('returns empty array for count=0', () => {
    expect(generateStars(0)).toEqual([]);
  });

  it('all values are finite', () => {
    const stars = generateStars(50);
    for (const s of stars) {
      expect(isFinite(s.x)).toBe(true);
      expect(isFinite(s.y)).toBe(true);
      expect(isFinite(s.brightness)).toBe(true);
      expect(isFinite(s.speed)).toBe(true);
    }
  });
});

// ===== getAllStages =====

describe('getAllStages', () => {
  it('returns an array of stage IDs', () => {
    const stages = getAllStages();
    expect(Array.isArray(stages)).toBe(true);
    expect(stages.length).toBeGreaterThan(0);
  });

  it('includes all expected stage IDs', () => {
    const stages = getAllStages();
    expect(stages).toContain('temple');
    expect(stages).toContain('china');
    expect(stages).toContain('factory');
    expect(stages).toContain('orochi');
    expect(stages).toContain('street');
    expect(stages).toContain('rooftop');
  });

  it('has at least 6 stages', () => {
    expect(getAllStages().length).toBeGreaterThanOrEqual(6);
  });

  it('all stage IDs are strings', () => {
    const stages = getAllStages();
    for (const s of stages) {
      expect(typeof s).toBe('string');
    }
  });

  it('no duplicate stage IDs', () => {
    const stages = getAllStages();
    expect(new Set(stages).size).toBe(stages.length);
  });
});
