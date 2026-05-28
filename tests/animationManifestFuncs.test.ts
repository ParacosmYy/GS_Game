/**
 * Animation Manifest Pure Function Tests
 *
 * Tests all query functions from src/core/animationManifest.ts:
 * getSequence, getSequenceNames, hasSequence, getSequenceFrameCount,
 * getSequenceTotalDuration, getAnimCharacterIds,
 * isCancelFrame, isInvincibleFrame, getActiveFrames.
 */
import { describe, it, expect } from 'vitest';
import type { AnimationManifest, AnimSequence, AnimFrame } from '../src/core/animationManifest.js';
import {
  getSequence,
  getSequenceNames,
  hasSequence,
  getSequenceFrameCount,
  getSequenceTotalDuration,
  getAnimCharacterIds,
  isCancelFrame,
  isInvincibleFrame,
  getActiveFrames,
} from '../src/core/animationManifest.js';

// ── Test fixture manifest ──

function makeFrame(overrides: Partial<AnimFrame> & { index: number; duration: number }): AnimFrame {
  return { offsetX: 0, offsetY: 0, ...overrides };
}

const STAND_A: AnimSequence = {
  name: 'stand_a',
  frames: [
    makeFrame({ index: 0, duration: 3 }),
    makeFrame({ index: 1, duration: 4, hitboxKey: 'stand_a_active' }),
    makeFrame({ index: 2, duration: 5 }),
    makeFrame({ index: 3, duration: 6 }),
  ],
  loop: false,
  cancelFrames: [2, 3],
  invincibleFrames: [0],
};

const IDLE: AnimSequence = {
  name: 'idle',
  frames: [
    makeFrame({ index: 0, duration: 9 }),
    makeFrame({ index: 1, duration: 9 }),
    makeFrame({ index: 2, duration: 9 }),
  ],
  loop: true,
  cancelFrames: [],
  invincibleFrames: [],
};

const TEST_MANIFEST: AnimationManifest = {
  version: 1,
  characters: {
    kyo: { charId: 'kyo', sequences: { idle: IDLE, stand_a: STAND_A } },
    ryo: { charId: 'ryo', sequences: { idle: IDLE } },
  },
};

describe('animationManifest — getSequence', () => {
  it('returns sequence for existing char+name', () => {
    expect(getSequence(TEST_MANIFEST, 'kyo', 'stand_a')).toBe(STAND_A);
  });
  it('returns idle for existing char', () => {
    expect(getSequence(TEST_MANIFEST, 'kyo', 'idle')).toBe(IDLE);
  });
  it('returns undefined for missing char', () => {
    expect(getSequence(TEST_MANIFEST, 'iori', 'idle')).toBeUndefined();
  });
  it('returns undefined for missing sequence', () => {
    expect(getSequence(TEST_MANIFEST, 'kyo', 'nonexistent')).toBeUndefined();
  });
});

describe('animationManifest — getSequenceNames', () => {
  it('returns all sequence names for kyo', () => {
    const names = getSequenceNames(TEST_MANIFEST, 'kyo');
    expect(names).toContain('idle');
    expect(names).toContain('stand_a');
    expect(names.length).toBe(2);
  });
  it('returns empty for missing char', () => {
    expect(getSequenceNames(TEST_MANIFEST, 'iori')).toEqual([]);
  });
});

describe('animationManifest — hasSequence', () => {
  it('returns true for existing', () => {
    expect(hasSequence(TEST_MANIFEST, 'kyo', 'idle')).toBe(true);
  });
  it('returns false for missing sequence', () => {
    expect(hasSequence(TEST_MANIFEST, 'kyo', 'special_upper')).toBe(false);
  });
  it('returns false for missing char', () => {
    expect(hasSequence(TEST_MANIFEST, 'iori', 'idle')).toBe(false);
  });
});

describe('animationManifest — getSequenceFrameCount', () => {
  it('returns correct frame count', () => {
    expect(getSequenceFrameCount(TEST_MANIFEST, 'kyo', 'stand_a')).toBe(4);
  });
  it('returns 0 for missing', () => {
    expect(getSequenceFrameCount(TEST_MANIFEST, 'iori', 'idle')).toBe(0);
  });
});

describe('animationManifest — getSequenceTotalDuration', () => {
  it('sums all frame durations', () => {
    // stand_a: 3+4+5+6 = 18
    expect(getSequenceTotalDuration(TEST_MANIFEST, 'kyo', 'stand_a')).toBe(18);
  });
  it('sums idle durations', () => {
    // idle: 9+9+9 = 27
    expect(getSequenceTotalDuration(TEST_MANIFEST, 'kyo', 'idle')).toBe(27);
  });
  it('returns 0 for missing', () => {
    expect(getSequenceTotalDuration(TEST_MANIFEST, 'iori', 'idle')).toBe(0);
  });
});

describe('animationManifest — getAnimCharacterIds', () => {
  it('returns all character IDs', () => {
    const ids = getAnimCharacterIds(TEST_MANIFEST);
    expect(ids).toContain('kyo');
    expect(ids).toContain('ryo');
    expect(ids.length).toBe(2);
  });
});

describe('animationManifest — isCancelFrame', () => {
  it('returns true for cancel frame 2', () => {
    expect(isCancelFrame(TEST_MANIFEST, 'kyo', 'stand_a', 2)).toBe(true);
  });
  it('returns true for cancel frame 3', () => {
    expect(isCancelFrame(TEST_MANIFEST, 'kyo', 'stand_a', 3)).toBe(true);
  });
  it('returns false for non-cancel frame 1', () => {
    expect(isCancelFrame(TEST_MANIFEST, 'kyo', 'stand_a', 1)).toBe(false);
  });
  it('returns false for idle (no cancel frames)', () => {
    expect(isCancelFrame(TEST_MANIFEST, 'kyo', 'idle', 0)).toBe(false);
  });
  it('returns false for missing', () => {
    expect(isCancelFrame(TEST_MANIFEST, 'iori', 'idle', 0)).toBe(false);
  });
});

describe('animationManifest — isInvincibleFrame', () => {
  it('returns true for invincible frame 0 of stand_a', () => {
    expect(isInvincibleFrame(TEST_MANIFEST, 'kyo', 'stand_a', 0)).toBe(true);
  });
  it('returns false for non-invincible frame 1', () => {
    expect(isInvincibleFrame(TEST_MANIFEST, 'kyo', 'stand_a', 1)).toBe(false);
  });
  it('returns false for missing', () => {
    expect(isInvincibleFrame(TEST_MANIFEST, 'iori', 'idle', 0)).toBe(false);
  });
});

describe('animationManifest — getActiveFrames', () => {
  it('returns frames with hitboxKey', () => {
    const active = getActiveFrames(TEST_MANIFEST, 'kyo', 'stand_a');
    expect(active.length).toBe(1);
    expect(active[0].hitboxKey).toBe('stand_a_active');
    expect(active[0].index).toBe(1);
  });
  it('returns empty for sequence with no hitbox frames', () => {
    expect(getActiveFrames(TEST_MANIFEST, 'kyo', 'idle')).toEqual([]);
  });
  it('returns empty for missing', () => {
    expect(getActiveFrames(TEST_MANIFEST, 'iori', 'idle')).toEqual([]);
  });
});
