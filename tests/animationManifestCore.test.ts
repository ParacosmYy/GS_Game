/**
 * Animation Manifest Query Functions Regression Tests
 *
 * Validates animation manifest types and pure query functions.
 */
import { describe, it, expect } from 'vitest';
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
  type AnimationManifest,
} from '../src/core/animationManifest.js';

const mockManifest: AnimationManifest = {
  version: 1,
  characters: {
    ryo: {
      charId: 'ryo',
      sequences: {
        idle: {
          name: 'idle',
          frames: [
            { index: 0, duration: 8, offsetX: 0, offsetY: 0 },
            { index: 1, duration: 8, offsetX: 0, offsetY: 0 },
            { index: 2, duration: 8, offsetX: 0, offsetY: 0 },
          ],
          loop: true,
          cancelFrames: [],
          invincibleFrames: [],
        },
        stand_a: {
          name: 'stand_a',
          frames: [
            { index: 10, duration: 3, offsetX: 0, offsetY: 0 },
            { index: 11, duration: 4, offsetX: 5, offsetY: 0, hitboxKey: 'STAND_A' },
            { index: 12, duration: 6, offsetX: 2, offsetY: 0 },
          ],
          loop: false,
          cancelFrames: [2],
          invincibleFrames: [],
        },
        ko_hou: {
          name: 'ko_hou',
          frames: [
            { index: 20, duration: 4, offsetX: 0, offsetY: 0, hitboxKey: 'RYO_KO_HOU' },
            { index: 21, duration: 3, offsetX: 5, offsetY: -10, hitboxKey: 'RYO_KO_HOU' },
            { index: 22, duration: 8, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          cancelFrames: [1, 2],
          invincibleFrames: [0],
        },
      },
    },
  },
};

describe('getSequence', () => {
  it('returns sequence for valid char and name', () => {
    const seq = getSequence(mockManifest, 'ryo', 'idle');
    expect(seq).toBeDefined();
    expect(seq!.name).toBe('idle');
    expect(seq!.frames.length).toBe(3);
  });

  it('returns undefined for invalid char', () => {
    expect(getSequence(mockManifest, 'kyo', 'idle')).toBeUndefined();
  });

  it('returns undefined for invalid sequence', () => {
    expect(getSequence(mockManifest, 'ryo', 'nonexistent')).toBeUndefined();
  });
});

describe('getSequenceNames', () => {
  it('returns all sequence names', () => {
    const names = getSequenceNames(mockManifest, 'ryo');
    expect(names).toContain('idle');
    expect(names).toContain('stand_a');
    expect(names).toContain('ko_hou');
    expect(names.length).toBe(3);
  });

  it('returns empty for non-existent character', () => {
    expect(getSequenceNames(mockManifest, 'nonexistent')).toEqual([]);
  });
});

describe('hasSequence', () => {
  it('returns true for existing', () => {
    expect(hasSequence(mockManifest, 'ryo', 'idle')).toBe(true);
  });

  it('returns false for non-existent', () => {
    expect(hasSequence(mockManifest, 'ryo', 'nonexistent')).toBe(false);
  });
});

describe('getSequenceFrameCount', () => {
  it('returns correct count', () => {
    expect(getSequenceFrameCount(mockManifest, 'ryo', 'idle')).toBe(3);
    expect(getSequenceFrameCount(mockManifest, 'ryo', 'stand_a')).toBe(3);
  });

  it('returns 0 for non-existent', () => {
    expect(getSequenceFrameCount(mockManifest, 'nonexistent', 'idle')).toBe(0);
  });
});

describe('getSequenceTotalDuration', () => {
  it('calculates correct total duration', () => {
    expect(getSequenceTotalDuration(mockManifest, 'ryo', 'idle')).toBe(24);
    expect(getSequenceTotalDuration(mockManifest, 'ryo', 'stand_a')).toBe(13);
  });

  it('returns 0 for non-existent', () => {
    expect(getSequenceTotalDuration(mockManifest, 'ryo', 'nonexistent')).toBe(0);
  });
});

describe('getAnimCharacterIds', () => {
  it('returns character IDs', () => {
    expect(getAnimCharacterIds(mockManifest)).toEqual(['ryo']);
  });
});

describe('isCancelFrame', () => {
  it('returns true for cancel frame', () => {
    expect(isCancelFrame(mockManifest, 'ryo', 'stand_a', 2)).toBe(true);
  });

  it('returns false for non-cancel frame', () => {
    expect(isCancelFrame(mockManifest, 'ryo', 'stand_a', 0)).toBe(false);
    expect(isCancelFrame(mockManifest, 'ryo', 'stand_a', 1)).toBe(false);
  });

  it('ko_hou has multiple cancel frames', () => {
    expect(isCancelFrame(mockManifest, 'ryo', 'ko_hou', 1)).toBe(true);
    expect(isCancelFrame(mockManifest, 'ryo', 'ko_hou', 2)).toBe(true);
  });
});

describe('isInvincibleFrame', () => {
  it('returns true for invincible frame', () => {
    expect(isInvincibleFrame(mockManifest, 'ryo', 'ko_hou', 0)).toBe(true);
  });

  it('returns false for non-invincible frame', () => {
    expect(isInvincibleFrame(mockManifest, 'ryo', 'ko_hou', 1)).toBe(false);
    expect(isInvincibleFrame(mockManifest, 'ryo', 'idle', 0)).toBe(false);
  });
});

describe('getActiveFrames', () => {
  it('returns frames with hitbox keys', () => {
    const active = getActiveFrames(mockManifest, 'ryo', 'stand_a');
    expect(active.length).toBe(1);
    expect(active[0].hitboxKey).toBe('STAND_A');
  });

  it('returns multiple active frames for specials', () => {
    const active = getActiveFrames(mockManifest, 'ryo', 'ko_hou');
    expect(active.length).toBe(2);
  });

  it('returns empty for idle (no hitboxes)', () => {
    expect(getActiveFrames(mockManifest, 'ryo', 'idle')).toEqual([]);
  });
});

describe('Animation structure validation', () => {
  it('idle loops, attacks do not', () => {
    expect(getSequence(mockManifest, 'ryo', 'idle')!.loop).toBe(true);
    expect(getSequence(mockManifest, 'ryo', 'stand_a')!.loop).toBe(false);
    expect(getSequence(mockManifest, 'ryo', 'ko_hou')!.loop).toBe(false);
  });

  it('all frames have valid durations', () => {
    for (const char of Object.values(mockManifest.characters)) {
      for (const seq of Object.values(char.sequences)) {
        for (const frame of seq.frames) {
          expect(frame.duration, `${char.charId}/${seq.name} frame ${frame.index} duration`).toBeGreaterThan(0);
        }
      }
    }
  });
});
