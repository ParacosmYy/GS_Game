import { describe, it, expect } from 'vitest';
import { generateStars } from '../src/rendering/stage.js';

describe('stage', () => {
  describe('generateStars', () => {
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
});
