import { describe, it, expect } from 'vitest';
import { kulaPortrait } from '../src/rendering/portraits/kulaPortrait.js';
import { leonaPortrait } from '../src/rendering/portraits/leonaPortrait.js';
import { maiPortrait } from '../src/rendering/portraits/maiPortrait.js';
import { maryPortrait } from '../src/rendering/portraits/maryPortrait.js';
import { maturePortrait } from '../src/rendering/portraits/maturePortrait.js';

describe('portraits batch4', () => {
  it('kulaPortrait has width/height/palette', () => {
    expect(kulaPortrait.width).toBeGreaterThan(0);
    expect(kulaPortrait.height).toBeGreaterThan(0);
    expect(kulaPortrait.palette).toBeDefined();
  });
  it('leonaPortrait has width/height/palette', () => {
    expect(leonaPortrait.width).toBeGreaterThan(0);
    expect(leonaPortrait.height).toBeGreaterThan(0);
    expect(leonaPortrait.palette).toBeDefined();
  });
  it('maiPortrait has width/height/palette', () => {
    expect(maiPortrait.width).toBeGreaterThan(0);
    expect(maiPortrait.height).toBeGreaterThan(0);
    expect(maiPortrait.palette).toBeDefined();
  });
  it('maryPortrait has width/height/palette', () => {
    expect(maryPortrait.width).toBeGreaterThan(0);
    expect(maryPortrait.height).toBeGreaterThan(0);
    expect(maryPortrait.palette).toBeDefined();
  });
  it('maturePortrait has width/height/palette', () => {
    expect(maturePortrait.width).toBeGreaterThan(0);
    expect(maturePortrait.height).toBeGreaterThan(0);
    expect(maturePortrait.palette).toBeDefined();
  });
});
