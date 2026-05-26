import { describe, it, expect } from 'vitest';
import { chrisPortrait } from '../src/rendering/portraits/chrisPortrait.js';
import { joePortrait } from '../src/rendering/portraits/joePortrait.js';
import { kasumiPortrait } from '../src/rendering/portraits/kasumiPortrait.js';
import { kdashPortrait } from '../src/rendering/portraits/kdashPortrait.js';
import { kimPortrait } from '../src/rendering/portraits/kimPortrait.js';

describe('portraits batch3', () => {
  it('chrisPortrait has width/height/palette', () => {
    expect(chrisPortrait.width).toBeGreaterThan(0);
    expect(chrisPortrait.height).toBeGreaterThan(0);
    expect(chrisPortrait.palette).toBeDefined();
  });
  it('joePortrait has width/height/palette', () => {
    expect(joePortrait.width).toBeGreaterThan(0);
    expect(joePortrait.height).toBeGreaterThan(0);
    expect(joePortrait.palette).toBeDefined();
  });
  it('kasumiPortrait has width/height/palette', () => {
    expect(kasumiPortrait.width).toBeGreaterThan(0);
    expect(kasumiPortrait.height).toBeGreaterThan(0);
    expect(kasumiPortrait.palette).toBeDefined();
  });
  it('kdashPortrait has width/height/palette', () => {
    expect(kdashPortrait.width).toBeGreaterThan(0);
    expect(kdashPortrait.height).toBeGreaterThan(0);
    expect(kdashPortrait.palette).toBeDefined();
  });
  it('kimPortrait has width/height/palette', () => {
    expect(kimPortrait.width).toBeGreaterThan(0);
    expect(kimPortrait.height).toBeGreaterThan(0);
    expect(kimPortrait.palette).toBeDefined();
  });
});
