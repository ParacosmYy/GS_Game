/**
 * Ryo Command Normal & Iori Win Frame Structural Tests
 *
 * Validates Ryo's tsurizao/orishi command normal frames and
 * Iori's win pose/laugh single frames — small data sets
 * that were not covered by the main pixel frame test.
 */
import { describe, it, expect } from 'vitest';
import { RYO_TSURIZAO_FRAMES, RYO_ORISHI_FRAMES } from '../src/rendering/sprites/ryo/ryoCommandNormalFrames.js';
import { IORI_WIN_POSE, IORI_WIN_LAUGH } from '../src/rendering/sprites/iori/ioriWinFrames.js';
import type { PixelFrame } from '../src/rendering/sprites/shared/baseHighResRenderer.js';

function validateFrames(frames: PixelFrame[], label: string) {
  expect(frames.length, `${label} count`).toBeGreaterThan(0);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    expect(f.width, `${label}[${i}].width`).toBeGreaterThan(0);
    expect(f.height, `${label}[${i}].height`).toBeGreaterThan(0);
    expect(f.pixels.length, `${label}[${i}].pixels rows`).toBeGreaterThan(0);
    expect(Object.keys(f.palette).length, `${label}[${i}].palette`).toBeGreaterThan(0);
  }
}

function validateSingleFrame(f: PixelFrame, label: string) {
  expect(f.width, `${label}.width`).toBeGreaterThan(0);
  expect(f.height, `${label}.height`).toBeGreaterThan(0);
  expect(f.pixels.length, `${label}.pixels rows`).toBeGreaterThan(0);
  expect(Object.keys(f.palette).length, `${label}.palette`).toBeGreaterThan(0);
}

// ===== Ryo Command Normals =====

describe('RYO_TSURIZAO_FRAMES', () => {
  it('has 4 frames', () => {
    expect(RYO_TSURIZAO_FRAMES.length).toBe(4);
  });

  it('all frames have valid structure', () => {
    validateFrames(RYO_TSURIZAO_FRAMES, 'TSURIZAO');
  });

  it('all frames have consistent width (96)', () => {
    for (const f of RYO_TSURIZAO_FRAMES) {
      expect(f.width).toBe(96);
    }
  });

  it('all frames have consistent height (144)', () => {
    for (const f of RYO_TSURIZAO_FRAMES) {
      expect(f.height).toBe(144);
    }
  });

  it('palette has 24 colors', () => {
    const keys = Object.keys(RYO_TSURIZAO_FRAMES[0].palette);
    expect(keys.length).toBe(24);
  });

  it('palette index 0 is transparent', () => {
    expect(RYO_TSURIZAO_FRAMES[0].palette[0]).toBe('transparent');
  });
});

describe('RYO_ORISHI_FRAMES', () => {
  it('has 4 frames', () => {
    expect(RYO_ORISHI_FRAMES.length).toBe(4);
  });

  it('all frames have valid structure', () => {
    validateFrames(RYO_ORISHI_FRAMES, 'ORISHI');
  });

  it('all frames have consistent width (96)', () => {
    for (const f of RYO_ORISHI_FRAMES) {
      expect(f.width).toBe(96);
    }
  });

  it('all frames have consistent height (144)', () => {
    for (const f of RYO_ORISHI_FRAMES) {
      expect(f.height).toBe(144);
    }
  });

  it('palette has 24 colors', () => {
    const keys = Object.keys(RYO_ORISHI_FRAMES[0].palette);
    expect(keys.length).toBe(24);
  });
});

// ===== Iori Win Frames =====

describe('IORI_WIN_POSE', () => {
  it('has valid structure', () => {
    validateSingleFrame(IORI_WIN_POSE, 'IORI_WIN_POSE');
  });

  it('has positive dimensions', () => {
    expect(IORI_WIN_POSE.width).toBeGreaterThan(0);
    expect(IORI_WIN_POSE.height).toBeGreaterThan(0);
  });

  it('has palette entries', () => {
    expect(Object.keys(IORI_WIN_POSE.palette).length).toBeGreaterThan(5);
  });

  it('palette index 0 is transparent', () => {
    expect(IORI_WIN_POSE.palette[0]).toBe('transparent');
  });
});

describe('IORI_WIN_LAUGH', () => {
  it('has valid structure', () => {
    validateSingleFrame(IORI_WIN_LAUGH, 'IORI_WIN_LAUGH');
  });

  it('has positive dimensions', () => {
    expect(IORI_WIN_LAUGH.width).toBeGreaterThan(0);
    expect(IORI_WIN_LAUGH.height).toBeGreaterThan(0);
  });

  it('has palette entries', () => {
    expect(Object.keys(IORI_WIN_LAUGH.palette).length).toBeGreaterThan(5);
  });
});

// ===== Cross-validation =====

describe('Ryo command normals consistency', () => {
  it('tsurizao and orishi have same canvas size', () => {
    expect(RYO_TSURIZAO_FRAMES[0].width).toBe(RYO_ORISHI_FRAMES[0].width);
    expect(RYO_TSURIZAO_FRAMES[0].height).toBe(RYO_ORISHI_FRAMES[0].height);
  });

  it('tsurizao and orishi have same frame count', () => {
    expect(RYO_TSURIZAO_FRAMES.length).toBe(RYO_ORISHI_FRAMES.length);
  });
});

describe('Iori win frames consistency', () => {
  it('win pose and laugh have same width', () => {
    expect(IORI_WIN_POSE.width).toBe(IORI_WIN_LAUGH.width);
  });
});
