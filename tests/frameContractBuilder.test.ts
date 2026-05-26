import { describe, it, expect } from 'vitest';
import { resolveFrameIndex } from '../src/core/frameContractBuilder.js';

describe('frameContractBuilder', () => {
  const mockContract = {
    id: 'stand_A',
    frames: [
      { phase: 'startup', sprite: { ref: 'a', duration: 4 }, events: [] },
      { phase: 'active', sprite: { ref: 'b', duration: 3 }, events: ['hit'], hitboxes: [{ ox: 50, oy: -80, w: 40, h: 25 }] },
      { phase: 'recovery', sprite: { ref: 'c', duration: 6 }, events: [] },
    ],
    cancelWindows: [],
  } as any;

  describe('resolveFrameIndex', () => {
    it('returns 0 for tick 0', () => {
      expect(resolveFrameIndex(mockContract, 0)).toBe(0);
    });
    it('stays in startup for tick 3', () => {
      expect(resolveFrameIndex(mockContract, 3)).toBe(0);
    });
    it('moves to active at tick 4', () => {
      expect(resolveFrameIndex(mockContract, 4)).toBe(1);
    });
    it('stays in active at tick 5', () => {
      expect(resolveFrameIndex(mockContract, 5)).toBe(1);
    });
    it('moves to recovery at tick 7', () => {
      expect(resolveFrameIndex(mockContract, 7)).toBe(2);
    });
    it('clamps to last frame for large tick', () => {
      expect(resolveFrameIndex(mockContract, 100)).toBe(2);
    });
    it('returns 0 for negative tick', () => {
      expect(resolveFrameIndex(mockContract, -1)).toBe(0);
    });
    it('handles single-frame contract', () => {
      const single = { frames: [{ sprite: { duration: 10 } }] } as any;
      expect(resolveFrameIndex(single, 0)).toBe(0);
      expect(resolveFrameIndex(single, 15)).toBe(0);
    });
  });
});
