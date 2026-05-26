import { describe, it, expect } from 'vitest';
import { generateStars } from '../src/rendering/stageTemple.js';

describe('stageTemple generateStars', () => {
  it('returns requested number of stars', () => {
    const stars = generateStars(10);
    expect(stars.length).toBe(10);
  });
  it('returns empty array for count 0', () => {
    expect(generateStars(0).length).toBe(0);
  });
  it('each star has x, y, brightness, speed', () => {
    const stars = generateStars(5);
    for (const s of stars) {
      expect(typeof s.x).toBe('number');
      expect(typeof s.y).toBe('number');
      expect(typeof s.brightness).toBe('number');
      expect(typeof s.speed).toBe('number');
    }
  });
  it('star brightness is between 0.3 and 1.0', () => {
    const stars = generateStars(20);
    for (const s of stars) {
      expect(s.brightness).toBeGreaterThanOrEqual(0.3);
      expect(s.brightness).toBeLessThanOrEqual(1.0);
    }
  });
  it('star speed is between 0.3 and 1.0', () => {
    const stars = generateStars(20);
    for (const s of stars) {
      expect(s.speed).toBeGreaterThanOrEqual(0.3);
      expect(s.speed).toBeLessThanOrEqual(1.0);
    }
  });
});
