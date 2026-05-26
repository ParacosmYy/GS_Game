import { describe, it, expect } from 'vitest';
import { robertPortrait } from '../src/rendering/portraits/robertPortrait.js';
import { shermiePortrait } from '../src/rendering/portraits/shermiePortrait.js';
import { vicePortrait } from '../src/rendering/portraits/vicePortrait.js';
import { xiangfeiPortrait } from '../src/rendering/portraits/xiangfeiPortrait.js';
import { yamazakiPortrait } from '../src/rendering/portraits/yamazakiPortrait.js';
import { yashiroPortrait } from '../src/rendering/portraits/yashiroPortrait.js';
import { ryoHudPortrait, ryoSelectPortrait, ryoVsPortrait, RYO_SIZED_PORTRAITS } from '../src/rendering/portraits/ryoPortraits.js';

describe('portraits batch5', () => {
  it('robertPortrait has width/height/palette', () => {
    expect(robertPortrait.width).toBeGreaterThan(0);
    expect(robertPortrait.height).toBeGreaterThan(0);
    expect(robertPortrait.palette).toBeDefined();
  });
  it('shermiePortrait has width/height/palette', () => {
    expect(shermiePortrait.width).toBeGreaterThan(0);
    expect(shermiePortrait.height).toBeGreaterThan(0);
    expect(shermiePortrait.palette).toBeDefined();
  });
  it('vicePortrait has width/height/palette', () => {
    expect(vicePortrait.width).toBeGreaterThan(0);
    expect(vicePortrait.height).toBeGreaterThan(0);
    expect(vicePortrait.palette).toBeDefined();
  });
  it('xiangfeiPortrait has width/height/palette', () => {
    expect(xiangfeiPortrait.width).toBeGreaterThan(0);
    expect(xiangfeiPortrait.height).toBeGreaterThan(0);
    expect(xiangfeiPortrait.palette).toBeDefined();
  });
  it('yamazakiPortrait has width/height/palette', () => {
    expect(yamazakiPortrait.width).toBeGreaterThan(0);
    expect(yamazakiPortrait.height).toBeGreaterThan(0);
    expect(yamazakiPortrait.palette).toBeDefined();
  });
  it('yashiroPortrait has width/height/palette', () => {
    expect(yashiroPortrait.width).toBeGreaterThan(0);
    expect(yashiroPortrait.height).toBeGreaterThan(0);
    expect(yashiroPortrait.palette).toBeDefined();
  });
  it('ryoPortraits has hud/select/vs variants', () => {
    expect(ryoHudPortrait.width).toBeGreaterThan(0);
    expect(ryoSelectPortrait.width).toBeGreaterThan(0);
    expect(ryoVsPortrait.width).toBeGreaterThan(0);
  });
  it('RYO_SIZED_PORTRAITS has entries', () => {
    expect(Object.keys(RYO_SIZED_PORTRAITS).length).toBeGreaterThan(0);
  });
});
