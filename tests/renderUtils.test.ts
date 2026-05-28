/**
 * Rendering Utils Regression Test
 * Verifies shiftColor, parseColor handle hex and rgba formats correctly.
 */
import { describe, it, expect } from 'vitest';
import { parseColor, shiftColor } from '../src/rendering/utils.js';

describe('parseColor', () => {
  it('parses #rrggbb', () => {
    const c = parseColor('#ff8800');
    expect(c.r).toBe(255);
    expect(c.g).toBe(136);
    expect(c.b).toBe(0);
  });

  it('parses #000000', () => {
    const c = parseColor('#000000');
    expect(c).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses #ffffff', () => {
    const c = parseColor('#ffffff');
    expect(c).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses rgba format', () => {
    const c = parseColor('rgba(100, 200, 50, 0.5)');
    expect(c.r).toBe(100);
    expect(c.g).toBe(200);
    expect(c.b).toBe(50);
  });

  it('parses rgb format', () => {
    const c = parseColor('rgb(10, 20, 30)');
    expect(c).toEqual({ r: 10, g: 20, b: 30 });
  });

  it('returns gray for unknown format', () => {
    const c = parseColor('red');
    expect(c).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe('shiftColor', () => {
  it('positive shifts brighter', () => {
    const result = shiftColor('#808080', 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('negative shifts darker', () => {
    const result = shiftColor('#808080', -50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('clamps at 255', () => {
    const result = shiftColor('#ffffff', 100);
    expect(result).toBe('#ffffff');
  });

  it('clamps at 0', () => {
    const result = shiftColor('#000000', -100);
    expect(result).toBe('#000000');
  });

  it('zero shift returns same color', () => {
    expect(shiftColor('#aabbcc', 0)).toBe('#aabbcc');
  });

  it('shifts from middle gray', () => {
    const result = shiftColor('#808080', 40);
    const { r, g, b } = parseColor(result);
    expect(r).toBe(168);
    expect(g).toBe(168);
    expect(b).toBe(168);
  });

  it('round-trip: shift + inverse shift', () => {
    const original = '#4488cc';
    const brightened = shiftColor(original, 30);
    const restored = shiftColor(brightened, -30);
    expect(restored).toBe(original);
  });

  it('handles pure red', () => {
    expect(shiftColor('#ff0000', -55)).toBe('#c80000');
  });

  it('handles pure green', () => {
    expect(shiftColor('#00ff00', 0)).toBe('#00ff00');
  });

  it('handles pure blue', () => {
    // 255 - 200 = 55 = 0x37
    expect(shiftColor('#0000ff', -200)).toBe('#000037');
  });

  it('brightens a specific color', () => {
    const result = shiftColor('#804020', 50);
    const { r, g, b } = parseColor(result);
    expect(r).toBe(178);
    expect(g).toBe(114);
    expect(b).toBe(82);
  });

  it('darkens white by -100', () => {
    const result = shiftColor('#ffffff', -100);
    expect(result).toBe('#9b9b9b');
  });
});
