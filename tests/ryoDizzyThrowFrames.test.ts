import { describe, it, expect } from 'vitest';
import { RYO_DIZZY_FRAMES } from '../src/rendering/sprites/ryoDizzyFrames.js';
import { RYO_THROW_FRAMES } from '../src/rendering/sprites/ryoThrowFrames.js';
import { getResolvedFrameKey } from '../src/rendering/sprites/ryoHighResRender.js';
import { FighterState } from '../src/core/types.js';

describe('ryoDizzyFrames', () => {
  it('RYO_DIZZY_FRAMES has 4 frames', () => {
    expect(RYO_DIZZY_FRAMES).toHaveLength(4);
  });
  it('each frame is 96x144', () => {
    for (const frame of RYO_DIZZY_FRAMES) {
      expect(frame.width).toBe(96);
      expect(frame.height).toBe(144);
    }
  });
  it('palette has sufficient colors', () => {
    const palette = RYO_DIZZY_FRAMES[0].palette;
    const colorKeys = Object.keys(palette).filter(k => Number(k) > 0);
    expect(colorKeys.length).toBeGreaterThanOrEqual(16);
  });
  it('anchor is center-bottom', () => {
    for (const frame of RYO_DIZZY_FRAMES) {
      expect(frame.anchor).toEqual({ x: 48, y: 144 });
    }
  });
  it('frames have non-empty pixel data', () => {
    for (const frame of RYO_DIZZY_FRAMES) {
      const nonZero = frame.pixels.flat().filter(p => p > 0).length;
      expect(nonZero).toBeGreaterThan(100);
    }
  });
  it('DIZZY state resolves to DIZZY key', () => {
    const key = getResolvedFrameKey('ryo', FighterState.DIZZY);
    expect(key).toBe('DIZZY');
  });
  it('each frame has distinct pixel data (sway animation)', () => {
    const f0sum = RYO_DIZZY_FRAMES[0].pixels.flat().reduce((a, b) => a + b, 0);
    const f2sum = RYO_DIZZY_FRAMES[2].pixels.flat().reduce((a, b) => a + b, 0);
    // F0 (sway right) and F2 (sway left) should have different pixel sums
    expect(f0sum).not.toBe(f2sum);
  });
});

describe('ryoThrowFrames', () => {
  it('RYO_THROW_FRAMES has 4 frames', () => {
    expect(RYO_THROW_FRAMES).toHaveLength(4);
  });
  it('each frame is 96x144', () => {
    for (const frame of RYO_THROW_FRAMES) {
      expect(frame.width).toBe(96);
      expect(frame.height).toBe(144);
    }
  });
  it('palette has sufficient colors', () => {
    const palette = RYO_THROW_FRAMES[0].palette;
    const colorKeys = Object.keys(palette).filter(k => Number(k) > 0);
    expect(colorKeys.length).toBeGreaterThanOrEqual(16);
  });
  it('anchor is center-bottom', () => {
    for (const frame of RYO_THROW_FRAMES) {
      expect(frame.anchor).toEqual({ x: 48, y: 144 });
    }
  });
  it('frames have non-empty pixel data', () => {
    for (const frame of RYO_THROW_FRAMES) {
      const nonZero = frame.pixels.flat().filter(p => p > 0).length;
      expect(nonZero).toBeGreaterThan(100);
    }
  });
  it('THROW state resolves to THROW key', () => {
    const key = getResolvedFrameKey('ryo', FighterState.THROW);
    expect(key).toBe('THROW');
  });
  it('grab frame has extended arm reach', () => {
    // Frame 0 (grab reach) should have pixels further right than idle
    const grabFrame = RYO_THROW_FRAMES[0].pixels;
    let maxRightPixel = 0;
    for (const row of grabFrame) {
      for (let x = 70; x < 96; x++) {
        if (row[x] > 0 && x > maxRightPixel) maxRightPixel = x;
      }
    }
    expect(maxRightPixel).toBeGreaterThan(75);
  });
});
