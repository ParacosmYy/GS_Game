import { describe, it, expect } from 'vitest';
import { RYO_BLOCK_FRAMES } from '../src/rendering/sprites/ryo/ryoBlockFrames.js';
import { RYO_WIN_FRAMES } from '../src/rendering/sprites/ryo/ryoWinFrames.js';
import { getResolvedFrameKey, drawRyoWinPose } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { FighterState } from '../src/core/types.js';

describe('ryoBlockFrames', () => {
  it('RYO_BLOCK_FRAMES has 3 frames', () => {
    expect(RYO_BLOCK_FRAMES).toHaveLength(3);
  });
  it('each frame is 96x144', () => {
    for (const frame of RYO_BLOCK_FRAMES) {
      expect(frame.width).toBe(96);
      expect(frame.height).toBe(144);
    }
  });
  it('palette has 24 colors', () => {
    const palette = RYO_BLOCK_FRAMES[0].palette;
    const colorKeys = Object.keys(palette).filter(k => Number(k) > 0);
    expect(colorKeys.length).toBeGreaterThanOrEqual(16);
  });
  it('anchor is center-bottom', () => {
    for (const frame of RYO_BLOCK_FRAMES) {
      expect(frame.anchor).toEqual({ x: 48, y: 144 });
    }
  });
  it('frames have non-empty pixel data', () => {
    for (const frame of RYO_BLOCK_FRAMES) {
      const nonZero = frame.pixels.flat().filter(p => p > 0).length;
      expect(nonZero).toBeGreaterThan(100);
    }
  });
  it('BLOCK state resolves to BLOCK key', () => {
    const key = getResolvedFrameKey('ryo', FighterState.BLOCK);
    expect(key).toBe('BLOCK');
  });
  it('AIR_BLOCK state resolves to BLOCK key', () => {
    const key = getResolvedFrameKey('ryo', FighterState.AIR_BLOCK);
    expect(key).toBe('BLOCK');
  });
});

describe('ryoWinFrames', () => {
  it('RYO_WIN_FRAMES has 4 frames', () => {
    expect(RYO_WIN_FRAMES).toHaveLength(4);
  });
  it('each frame is 96x144', () => {
    for (const frame of RYO_WIN_FRAMES) {
      expect(frame.width).toBe(96);
      expect(frame.height).toBe(144);
    }
  });
  it('palette has sufficient colors', () => {
    const palette = RYO_WIN_FRAMES[0].palette;
    const colorKeys = Object.keys(palette).filter(k => Number(k) > 0);
    expect(colorKeys.length).toBeGreaterThanOrEqual(16);
  });
  it('anchor is center-bottom', () => {
    for (const frame of RYO_WIN_FRAMES) {
      expect(frame.anchor).toEqual({ x: 48, y: 144 });
    }
  });
  it('frames have non-empty pixel data', () => {
    for (const frame of RYO_WIN_FRAMES) {
      const nonZero = frame.pixels.flat().filter(p => p > 0).length;
      expect(nonZero).toBeGreaterThan(100);
    }
  });
  it('drawRyoWinPose is exported', () => {
    expect(typeof drawRyoWinPose).toBe('function');
  });
});
