import { describe, it, expect } from 'vitest';
import { getSequence, getSequenceNames, hasSequence, getSequenceFrameCount } from '../src/core/animationManifest.js';

describe('animationManifest', () => {
  const mockManifest = {
    characters: {
      ryo: {
        charId: 'ryo',
        sequences: {
          idle: { name: 'idle', frames: [{ index: 0, duration: 4, offsetX: 0, offsetY: 0 }, { index: 1, duration: 4, offsetX: 0, offsetY: 0 }], loop: true, cancelFrames: [], invincibleFrames: [] },
          walk: { name: 'walk', frames: [{ index: 2, duration: 3, offsetX: 0, offsetY: 0 }, { index: 3, duration: 3, offsetX: 0, offsetY: 0 }], loop: true, cancelFrames: [], invincibleFrames: [] },
        },
      },
    },
  } as any;

  describe('getSequence', () => {
    it('returns sequence for valid character and animation', () => {
      const seq = getSequence(mockManifest, 'ryo', 'idle');
      expect(seq).toBeDefined();
      expect(seq!.frames.length).toBeGreaterThan(0);
    });
    it('returns undefined for unknown character', () => {
      const seq = getSequence(mockManifest, 'unknown', 'idle');
      expect(seq).toBeUndefined();
    });
    it('returns undefined for unknown animation', () => {
      const seq = getSequence(mockManifest, 'ryo', 'unknown');
      expect(seq).toBeUndefined();
    });
  });

  describe('getSequenceNames', () => {
    it('returns animation names for character', () => {
      const names = getSequenceNames(mockManifest, 'ryo');
      expect(names).toContain('idle');
      expect(names).toContain('walk');
    });
    it('returns empty for unknown character', () => {
      const names = getSequenceNames(mockManifest, 'unknown');
      expect(names).toEqual([]);
    });
  });

  describe('hasSequence', () => {
    it('returns true for existing sequence', () => {
      expect(hasSequence(mockManifest, 'ryo', 'idle')).toBe(true);
    });
    it('returns false for missing sequence', () => {
      expect(hasSequence(mockManifest, 'ryo', 'nonexist')).toBe(false);
    });
  });

  describe('getSequenceFrameCount', () => {
    it('returns frame count', () => {
      const count = getSequenceFrameCount(mockManifest, 'ryo', 'idle');
      expect(count).toBe(2);
    });
    it('returns 0 for unknown', () => {
      const count = getSequenceFrameCount(mockManifest, 'unknown', 'idle');
      expect(count).toBe(0);
    });
  });
});
