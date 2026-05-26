import { describe, it, expect } from 'vitest';
import { andyPortrait } from '../src/rendering/portraits/andyPortrait.js';
import { athenaPortrait } from '../src/rendering/portraits/athenaPortrait.js';
import { billyPortrait } from '../src/rendering/portraits/billyPortrait.js';
import { changPortrait } from '../src/rendering/portraits/changPortrait.js';
import { choiPortrait } from '../src/rendering/portraits/choiPortrait.js';

describe('portraits batch2', () => {
  it('andyPortrait has width/height/palette', () => {
    expect(andyPortrait.width).toBeGreaterThan(0);
    expect(andyPortrait.height).toBeGreaterThan(0);
    expect(andyPortrait.palette).toBeDefined();
  });
  it('athenaPortrait has width/height/palette', () => {
    expect(athenaPortrait.width).toBeGreaterThan(0);
    expect(athenaPortrait.height).toBeGreaterThan(0);
    expect(athenaPortrait.palette).toBeDefined();
  });
  it('billyPortrait has width/height/palette', () => {
    expect(billyPortrait.width).toBeGreaterThan(0);
    expect(billyPortrait.height).toBeGreaterThan(0);
    expect(billyPortrait.palette).toBeDefined();
  });
  it('changPortrait has width/height/palette', () => {
    expect(changPortrait.width).toBeGreaterThan(0);
    expect(changPortrait.height).toBeGreaterThan(0);
    expect(changPortrait.palette).toBeDefined();
  });
  it('choiPortrait has width/height/palette', () => {
    expect(choiPortrait.width).toBeGreaterThan(0);
    expect(choiPortrait.height).toBeGreaterThan(0);
    expect(choiPortrait.palette).toBeDefined();
  });
});
