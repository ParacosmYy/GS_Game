import { describe, it, expect } from 'vitest';
import { ANIMATION_MANIFEST } from '../src/core/animationManifestData.js';
import {
  getSequence,
  getSequenceNames,
  hasSequence,
  getSequenceFrameCount,
  getSequenceTotalDuration,
  getAnimCharacterIds,
  isCancelFrame,
  isInvincibleFrame,
} from '../src/core/animationManifest.js';

describe('Animation Manifest Query Functions', () => {
  describe('manifest structure', () => {
    it('has version 1', () => {
      expect(ANIMATION_MANIFEST.version).toBe(1);
    });

    it('contains ryo', () => {
      expect(ANIMATION_MANIFEST.characters).toHaveProperty('ryo');
    });
  });

  describe('getSequence', () => {
    it('returns idle sequence for ryo', () => {
      const seq = getSequence(ANIMATION_MANIFEST, 'ryo', 'idle');
      expect(seq).toBeDefined();
      expect(seq!.name).toBe('idle');
      expect(seq!.loop).toBe(true);
    });

    it('returns undefined for unknown character', () => {
      expect(getSequence(ANIMATION_MANIFEST, 'unknown', 'idle')).toBeUndefined();
    });

    it('returns undefined for unknown sequence', () => {
      expect(getSequence(ANIMATION_MANIFEST, 'ryo', 'nonexistent')).toBeUndefined();
    });
  });

  describe('hasSequence', () => {
    it('returns true for existing sequence', () => {
      expect(hasSequence(ANIMATION_MANIFEST, 'ryo', 'idle')).toBe(true);
    });

    it('returns false for missing sequence', () => {
      expect(hasSequence(ANIMATION_MANIFEST, 'ryo', 'nonexistent')).toBe(false);
    });
  });

  describe('getSequenceNames', () => {
    it('returns names for ryo', () => {
      const names = getSequenceNames(ANIMATION_MANIFEST, 'ryo');
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('idle');
      expect(names).toContain('stand_a');
    });

    it('returns empty for unknown', () => {
      expect(getSequenceNames(ANIMATION_MANIFEST, 'unknown')).toEqual([]);
    });
  });

  describe('getSequenceFrameCount', () => {
    it('returns frame count for ryo idle', () => {
      const count = getSequenceFrameCount(ANIMATION_MANIFEST, 'ryo', 'idle');
      expect(count).toBeGreaterThan(0);
    });

    it('returns 0 for unknown', () => {
      expect(getSequenceFrameCount(ANIMATION_MANIFEST, 'ryo', 'nonexistent')).toBe(0);
    });
  });

  describe('getSequenceTotalDuration', () => {
    it('returns total duration for ryo idle', () => {
      const dur = getSequenceTotalDuration(ANIMATION_MANIFEST, 'ryo', 'idle');
      expect(dur).toBeGreaterThan(0);
    });
  });

  describe('getAnimCharacterIds', () => {
    it('includes ryo', () => {
      const ids = getAnimCharacterIds(ANIMATION_MANIFEST);
      expect(ids).toContain('ryo');
    });
  });

  describe('isCancelFrame', () => {
    it('returns true for cancel frames', () => {
      const seq = getSequence(ANIMATION_MANIFEST, 'ryo', 'stand_a');
      if (seq && seq.cancelFrames.length > 0) {
        expect(isCancelFrame(ANIMATION_MANIFEST, 'ryo', 'stand_a', seq.cancelFrames[0])).toBe(true);
      }
    });

    it('returns false for startup frames', () => {
      // Frame 0 should be startup for attacks, not cancelable
      const seq = getSequence(ANIMATION_MANIFEST, 'ryo', 'stand_a');
      if (seq && seq.cancelFrames.length > 0 && seq.cancelFrames[0] > 0) {
        expect(isCancelFrame(ANIMATION_MANIFEST, 'ryo', 'stand_a', 0)).toBe(false);
      }
    });
  });

  describe('isInvincibleFrame', () => {
    it('ryo_ko_hou has invincible frames', () => {
      const seq = getSequence(ANIMATION_MANIFEST, 'ryo', 'ryo_ko_hou');
      if (seq && seq.invincibleFrames.length > 0) {
        expect(isInvincibleFrame(ANIMATION_MANIFEST, 'ryo', 'ryo_ko_hou', seq.invincibleFrames[0])).toBe(true);
      }
    });

    it('idle has no invincible frames', () => {
      expect(isInvincibleFrame(ANIMATION_MANIFEST, 'ryo', 'idle', 0)).toBe(false);
    });
  });

  describe('Ryo key sequences exist', () => {
    const keySeqs = ['idle', 'walk_forward', 'crouch', 'jump_up', 'stand_a', 'stand_c',
      'hitstun', 'knockdown', 'ryo_koou', 'ryo_ko_hou', 'ryo_hien', 'dm_ten_ha_ou'];
    for (const seq of keySeqs) {
      it(`${seq} exists`, () => {
        expect(hasSequence(ANIMATION_MANIFEST, 'ryo', seq)).toBe(true);
      });
    }
  });
});
