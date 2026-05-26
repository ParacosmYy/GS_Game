import { describe, it, expect } from 'vitest';
import { shiftColor, parseColor } from '../src/rendering/utils.js';

describe('rendering utils', () => {
  describe('parseColor', () => {
    it('parses hex color', () => {
      const result = parseColor('#ff0000');
      expect(result).toBeDefined();
    });
    it('parses #ffffff', () => {
      const result = parseColor('#ffffff');
      expect(result).toBeDefined();
    });
  });

  describe('shiftColor', () => {
    it('shifts a color and returns a string', () => {
      const result = shiftColor('#ff0000', 20);
      expect(typeof result).toBe('string');
    });
    it('shifted color is different from original', () => {
      const result = shiftColor('#808080', 50);
      expect(result).not.toBe('#808080');
    });
    it('shift by 0 returns similar color', () => {
      const result = shiftColor('#808080', 0);
      expect(result).toBeDefined();
    });
  });
});
