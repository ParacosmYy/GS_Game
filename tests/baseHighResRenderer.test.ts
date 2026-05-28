/**
 * Base High-Res Renderer Pure Function Regression Tests
 *
 * Validates convertFrame, getVariableFrameIndex, registerFrames,
 * and registerVariableFrames — all pure data/math functions.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  convertFrame,
  getVariableFrameIndex,
  registerFrames,
  registerVariableFrames,
  type SourcePixelFrame,
  type FrameEntry,
} from '../src/rendering/sprites/shared/baseHighResRenderer.js';

// ===== convertFrame =====

describe('convertFrame', () => {
  const sampleFrame: SourcePixelFrame = {
    width: 4,
    height: 6,
    palette: { 0: 'transparent', 1: '#ff0000', 2: '#00ff00', 3: '#0000ff' },
    pixels: [
      [0, 1, 1, 0],
      [1, 2, 2, 1],
      [1, 2, 2, 1],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
  };

  it('returns frame with correct dimensions', () => {
    const result = convertFrame(sampleFrame);
    expect(result.frame.width).toBe(4);
    expect(result.frame.height).toBe(6);
  });

  it('preserves pixel data', () => {
    const result = convertFrame(sampleFrame);
    expect(result.frame.pixels).toEqual(sampleFrame.pixels);
  });

  it('anchor is center-bottom (width/2, height)', () => {
    const result = convertFrame(sampleFrame);
    expect(result.frame.anchor.x).toBe(2);
    expect(result.frame.anchor.y).toBe(6);
  });

  it('removes transparent (index 0) from palette', () => {
    const result = convertFrame(sampleFrame);
    expect(result.palette[0]).toBeUndefined();
  });

  it('removes "transparent" color values from palette', () => {
    const frame: SourcePixelFrame = {
      width: 2, height: 2,
      palette: { 0: 'transparent', 1: '#ff0000', 2: 'transparent' },
      pixels: [[0, 1], [1, 0]],
    };
    const result = convertFrame(frame);
    expect(result.palette[0]).toBeUndefined();
    expect(result.palette[1]).toBe('#ff0000');
    expect(result.palette[2]).toBeUndefined();
  });

  it('keeps non-zero palette entries with actual colors', () => {
    const result = convertFrame(sampleFrame);
    expect(result.palette[1]).toBe('#ff0000');
    expect(result.palette[2]).toBe('#00ff00');
    expect(result.palette[3]).toBe('#0000ff');
  });

  it('handles frame with odd width (anchor rounds down)', () => {
    const frame: SourcePixelFrame = {
      width: 5, height: 3,
      palette: { 1: '#aaa' },
      pixels: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
    };
    const result = convertFrame(frame);
    expect(result.frame.anchor.x).toBe(2);
  });

  it('handles single-pixel frame', () => {
    const frame: SourcePixelFrame = {
      width: 1, height: 1,
      palette: { 1: '#fff' },
      pixels: [[1]],
    };
    const result = convertFrame(frame);
    expect(result.frame.width).toBe(1);
    expect(result.frame.height).toBe(1);
    expect(result.palette[1]).toBe('#fff');
  });
});

// ===== getVariableFrameIndex =====

describe('getVariableFrameIndex', () => {
  it('returns 0 for stateAge=0', () => {
    expect(getVariableFrameIndex(0, [4, 6, 3])).toBe(0);
  });

  it('returns 0 during first frame duration', () => {
    expect(getVariableFrameIndex(0, [4, 6, 3])).toBe(0);
    expect(getVariableFrameIndex(1, [4, 6, 3])).toBe(0);
    expect(getVariableFrameIndex(3, [4, 6, 3])).toBe(0);
  });

  it('returns 1 during second frame duration', () => {
    expect(getVariableFrameIndex(4, [4, 6, 3])).toBe(1);
    expect(getVariableFrameIndex(6, [4, 6, 3])).toBe(1);
    expect(getVariableFrameIndex(9, [4, 6, 3])).toBe(1);
  });

  it('returns 2 during third frame duration', () => {
    expect(getVariableFrameIndex(10, [4, 6, 3])).toBe(2);
    expect(getVariableFrameIndex(11, [4, 6, 3])).toBe(2);
    expect(getVariableFrameIndex(12, [4, 6, 3])).toBe(2);
  });

  it('wraps around after total cycle (4+6+3=13)', () => {
    expect(getVariableFrameIndex(13, [4, 6, 3])).toBe(0);
    expect(getVariableFrameIndex(14, [4, 6, 3])).toBe(0);
    expect(getVariableFrameIndex(17, [4, 6, 3])).toBe(1);
    expect(getVariableFrameIndex(23, [4, 6, 3])).toBe(2);
    expect(getVariableFrameIndex(26, [4, 6, 3])).toBe(0);
  });

  it('returns last index for exactly-at-boundary age', () => {
    expect(getVariableFrameIndex(12, [4, 6, 3])).toBe(2);
  });

  it('handles uniform durations', () => {
    expect(getVariableFrameIndex(0, [5, 5, 5, 5])).toBe(0);
    expect(getVariableFrameIndex(5, [5, 5, 5, 5])).toBe(1);
    expect(getVariableFrameIndex(10, [5, 5, 5, 5])).toBe(2);
    expect(getVariableFrameIndex(15, [5, 5, 5, 5])).toBe(3);
    expect(getVariableFrameIndex(20, [5, 5, 5, 5])).toBe(0);
  });

  it('handles single frame duration', () => {
    expect(getVariableFrameIndex(0, [8])).toBe(0);
    expect(getVariableFrameIndex(7, [8])).toBe(0);
    expect(getVariableFrameIndex(8, [8])).toBe(0); // wraps
  });

  it('handles two frames', () => {
    expect(getVariableFrameIndex(0, [3, 7])).toBe(0);
    expect(getVariableFrameIndex(3, [3, 7])).toBe(1);
    expect(getVariableFrameIndex(9, [3, 7])).toBe(1);
    expect(getVariableFrameIndex(10, [3, 7])).toBe(0);
  });
});

// ===== registerFrames =====

describe('registerFrames', () => {
  let registry: Map<string, FrameEntry>;

  const sampleFrames: SourcePixelFrame[] = [
    {
      width: 3, height: 4,
      palette: { 1: '#ff0000', 2: '#00ff00' },
      pixels: [[1, 2, 1], [2, 1, 2], [1, 2, 1], [0, 1, 0]],
    },
    {
      width: 3, height: 4,
      palette: { 1: '#ff0000', 2: '#0000ff' },
      pixels: [[2, 1, 2], [1, 2, 1], [2, 1, 2], [1, 0, 1]],
    },
  ];

  beforeEach(() => {
    registry = new Map();
  });

  it('adds entry to registry', () => {
    registerFrames(registry, 'idle', sampleFrames, 6);
    expect(registry.has('idle')).toBe(true);
  });

  it('sets correct ticksPerFrame', () => {
    registerFrames(registry, 'idle', sampleFrames, 8);
    expect(registry.get('idle')!.ticksPerFrame).toBe(8);
  });

  it('converts all frames', () => {
    registerFrames(registry, 'idle', sampleFrames, 6);
    const entry = registry.get('idle')!;
    expect(entry.frames.length).toBe(2);
  });

  it('uses first frame palette', () => {
    registerFrames(registry, 'idle', sampleFrames, 6);
    const entry = registry.get('idle')!;
    expect(entry.palette[1]).toBe('#ff0000');
    expect(entry.palette[2]).toBe('#00ff00');
  });

  it('does not overwrite existing key', () => {
    registerFrames(registry, 'idle', sampleFrames, 6);
    const first = registry.get('idle');
    registerFrames(registry, 'idle', sampleFrames, 10);
    expect(registry.get('idle')).toBe(first);
    expect(registry.get('idle')!.ticksPerFrame).toBe(6);
  });

  it('skips empty frames array', () => {
    registerFrames(registry, 'idle', [], 6);
    expect(registry.has('idle')).toBe(false);
  });

  it('no frameDurations property set', () => {
    registerFrames(registry, 'idle', sampleFrames, 6);
    expect(registry.get('idle')!.frameDurations).toBeUndefined();
  });
});

// ===== registerVariableFrames =====

describe('registerVariableFrames', () => {
  let registry: Map<string, FrameEntry>;

  const sampleFrames: SourcePixelFrame[] = [
    {
      width: 2, height: 2,
      palette: { 1: '#aaa' },
      pixels: [[1, 0], [0, 1]],
    },
  ];

  beforeEach(() => {
    registry = new Map();
  });

  it('adds entry with frameDurations', () => {
    registerVariableFrames(registry, 'walk', sampleFrames, [4, 6, 3]);
    const entry = registry.get('walk')!;
    expect(entry.frameDurations).toEqual([4, 6, 3]);
  });

  it('ticksPerFrame uses first duration', () => {
    registerVariableFrames(registry, 'walk', sampleFrames, [4, 6, 3]);
    expect(registry.get('walk')!.ticksPerFrame).toBe(4);
  });

  it('ticksPerFrame defaults to 8 for empty durations', () => {
    registerVariableFrames(registry, 'walk', sampleFrames, []);
    expect(registry.get('walk')!.ticksPerFrame).toBe(8);
  });

  it('does not overwrite existing key', () => {
    registerVariableFrames(registry, 'walk', sampleFrames, [4, 6]);
    const first = registry.get('walk');
    registerVariableFrames(registry, 'walk', sampleFrames, [8, 8]);
    expect(registry.get('walk')).toBe(first);
  });
});
