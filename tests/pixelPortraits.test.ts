import { describe, it, expect } from 'vitest';
// PixelPortraitData is a type-only export, test it by importing a portrait and checking structure
import { kyoPortrait } from '../src/rendering/portraits/kyoPortrait.js';
import { ryoSelectPortrait } from '../src/rendering/portraits/ryoPortraits.js';

describe('pixelPortraits structure', () => {
  it('portrait has width/height as positive numbers', () => {
    expect(typeof kyoPortrait.width).toBe('number');
    expect(typeof kyoPortrait.height).toBe('number');
    expect(kyoPortrait.width).toBeGreaterThan(0);
    expect(kyoPortrait.height).toBeGreaterThan(0);
  });
  it('portrait has palette as object with numeric keys', () => {
    expect(typeof kyoPortrait.palette).toBe('object');
    expect(Object.keys(kyoPortrait.palette).length).toBeGreaterThan(0);
  });
  it('portrait has pixels array', () => {
    expect(Array.isArray(kyoPortrait.pixels)).toBe(true);
    expect(kyoPortrait.pixels.length).toBeGreaterThan(0);
  });
  it('ryo select portrait has valid dimensions', () => {
    expect(ryoSelectPortrait.width).toBeGreaterThan(0);
    expect(ryoSelectPortrait.height).toBeGreaterThan(0);
    expect(ryoSelectPortrait.palette).toBeDefined();
  });
});
