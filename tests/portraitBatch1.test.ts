import { describe, it, expect } from 'vitest';
import { kyoPortrait } from '../src/rendering/portraits/kyoPortrait.js';
import { ioriPortrait } from '../src/rendering/portraits/ioriPortrait.js';
import { terryPortrait } from '../src/rendering/portraits/terryPortrait.js';
import { ralfPortrait } from '../src/rendering/portraits/ralfPortrait.js';
import { clarkPortrait } from '../src/rendering/portraits/clarkPortrait.js';

describe('portraits batch1', () => {
  it('kyoPortrait has width/height/palette', () => {
    expect(kyoPortrait.width).toBeGreaterThan(0);
    expect(kyoPortrait.height).toBeGreaterThan(0);
    expect(kyoPortrait.palette).toBeDefined();
  });
  it('ioriPortrait has width/height/palette', () => {
    expect(ioriPortrait.width).toBeGreaterThan(0);
    expect(ioriPortrait.height).toBeGreaterThan(0);
    expect(ioriPortrait.palette).toBeDefined();
  });
  it('terryPortrait has width/height/palette', () => {
    expect(terryPortrait.width).toBeGreaterThan(0);
    expect(terryPortrait.height).toBeGreaterThan(0);
    expect(terryPortrait.palette).toBeDefined();
  });
  it('ralfPortrait has width/height/palette', () => {
    expect(ralfPortrait.width).toBeGreaterThan(0);
    expect(ralfPortrait.height).toBeGreaterThan(0);
    expect(ralfPortrait.palette).toBeDefined();
  });
  it('clarkPortrait has width/height/palette', () => {
    expect(clarkPortrait.width).toBeGreaterThan(0);
    expect(clarkPortrait.height).toBeGreaterThan(0);
    expect(clarkPortrait.palette).toBeDefined();
  });
});
