import { describe, it, expect } from 'vitest';
import { parseColor, shiftColor } from '../src/rendering/utils.js';

describe('rendering utils', () => {
  it('parseColor parses #rrggbb', () => {
    const c = parseColor('#ff8800');
    expect(c.r).toBe(255);
    expect(c.g).toBe(136);
    expect(c.b).toBe(0);
  });
  it('parseColor parses #000000', () => {
    const c = parseColor('#000000');
    expect(c.r).toBe(0);
    expect(c.g).toBe(0);
    expect(c.b).toBe(0);
  });
  it('shiftColor positive shifts brighter', () => {
    const result = shiftColor('#808080', 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('shiftColor negative shifts darker', () => {
    const result = shiftColor('#808080', -50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('shiftColor clamps at 255', () => {
    const result = shiftColor('#ffffff', 100);
    expect(result).toBe('#ffffff');
  });
  it('shiftColor clamps at 0', () => {
    const result = shiftColor('#000000', -100);
    expect(result).toBe('#000000');
  });
});
