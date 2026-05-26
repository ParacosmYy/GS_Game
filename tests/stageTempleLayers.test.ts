import { describe, it, expect } from 'vitest';
import { shiftHex, hexToRgb } from '../src/rendering/stageTempleLayers.js';

describe('stageTempleLayers', () => {
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
