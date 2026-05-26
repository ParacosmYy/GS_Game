import { describe, it, expect } from 'vitest';
import { PW, PH, PIXEL, CHAR_VISUALS, getDefaultVisual, darken, lighten } from '../src/rendering/spritePoseData.js';

describe('spritePoseData', () => {
  describe('constants', () => {
    it('PW is positive', () => expect(PW).toBeGreaterThan(0));
    it('PH is positive', () => expect(PH).toBeGreaterThan(0));
    it('PIXEL is positive', () => expect(PIXEL).toBeGreaterThan(0));
    it('portrait aspect ratio', () => expect(PW / PH).toBeLessThan(1));
  });

  describe('CHAR_VISUALS', () => {
    it('is an object with character keys', () => {
      expect(typeof CHAR_VISUALS).toBe('object');
      expect(Object.keys(CHAR_VISUALS).length).toBeGreaterThan(0);
    });
    it('has ryo entry', () => expect(CHAR_VISUALS.ryo).toBeDefined());
    it('ryo has color properties', () => {
      const ryo = CHAR_VISUALS.ryo;
      expect(typeof ryo.hairColor).toBe('string');
      expect(typeof ryo.skinColor).toBe('string');
      expect(typeof ryo.shirtColor).toBe('string');
    });
    it('ryo has proportional dimensions', () => {
      const ryo = CHAR_VISUALS.ryo;
      expect(ryo.headW).toBeGreaterThan(0);
      expect(ryo.bodyW).toBeGreaterThan(0);
      expect(ryo.legLen).toBeGreaterThan(0);
    });
  });

  describe('getDefaultVisual', () => {
    it('returns a visual for unknown char', () => {
      const v = getDefaultVisual('unknown');
      expect(v).toBeDefined();
      expect(v.hairColor).toBeDefined();
    });
    it('returns a visual with all color fields', () => {
      const v = getDefaultVisual('ryo');
      expect(v.hairColor).toBeDefined();
      expect(v.skinColor).toBeDefined();
      expect(v.shirtColor).toBeDefined();
      expect(v.pantsColor).toBeDefined();
    });
  });

  describe('darken', () => {
    it('darkens a hex color', () => {
      expect(darken('#ffffff', 0.5)).not.toBe('#ffffff');
    });
  });

  describe('lighten', () => {
    it('lightens a hex color', () => {
      expect(lighten('#000000', 0.5)).not.toBe('#000000');
    });
  });
});
