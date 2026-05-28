/**
 * animStateSync.test.ts
 *
 * Tests for animation state synchronization between combat and rendering.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAnimDurations,
  getAnimInfo,
  resolveFrameIndex,
  getFrameDuration,
  getTotalAnimDuration,
  isAnimLooping,
  getRegisteredActions,
  clearAnimCache,
} from '../src/rendering/sprites/shared/animStateSync.js';
import { FighterState, AttackType } from '../src/core/types.js';

// Ensure character configs are registered
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

describe('animStateSync', () => {
  beforeEach(() => {
    clearAnimCache();
    // Register test animation data
    registerAnimDurations('kyo', '0', [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]); // idle: 15 frames × 9 ticks
    registerAnimDurations('kyo', '20', [6, 6, 6, 6, 6, 6, 6, 6, 6, 6]); // walk: 10 frames × 6 ticks
    registerAnimDurations('kyo', '200', [3, 3, 3, 2, 2]); // stand A: 5 frames
    registerAnimDurations('kyo', '1000', [4, 4, 4, 4, 4, 3, 3, 3, 3, 3]); // special: 10 frames
    registerAnimDurations('kyo', '5000', [5, 5]); // hitstun: 2 frames
    registerAnimDurations('ryo', '0', [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]); // idle: 15 frames
  });

  describe('registerAnimDurations', () => {
    it('stores frame duration data', () => {
      const info = getAnimInfo('kyo', '0');
      expect(info).not.toBeNull();
      expect(info!.frameDurations).toHaveLength(15);
      expect(info!.totalDuration).toBe(135);
    });

    it('overwrites existing data', () => {
      registerAnimDurations('kyo', '0', [5, 5, 5]);
      const info = getAnimInfo('kyo', '0');
      expect(info!.frameDurations).toHaveLength(3);
    });
  });

  describe('getAnimInfo', () => {
    it('returns null for unknown character', () => {
      expect(getAnimInfo('nonexistent', '0')).toBeNull();
    });

    it('returns null for unknown action', () => {
      expect(getAnimInfo('kyo', '99999')).toBeNull();
    });
  });

  describe('resolveFrameIndex', () => {
    it('resolves idle action for IDLE state', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('0');
      expect(result.frameIndex).toBe(0);
      expect(result.totalFrames).toBe(15);
    });

    it('advances frame with stateAge', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 9, 0, 'none');
      expect(result.actionNumber).toBe('0');
      // At tick 9, frame should be 1 (frame 0 covers ticks 0-8)
      expect(result.frameIndex).toBe(1);
    });

    it('wraps around for looping animations', () => {
      // idle total duration = 135, so tick 135 should wrap to frame 0
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 135, 0, 'none');
      expect(result.frameIndex).toBe(0);
    });

    it('resolves walk action for WALK state', () => {
      const result = resolveFrameIndex('kyo', FighterState.WALK, null, 1, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('20');
    });

    it('resolves walk_back for backward walk', () => {
      const result = resolveFrameIndex('kyo', FighterState.WALK, null, -1, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('21');
    });

    it('resolves stand attack action', () => {
      const result = resolveFrameIndex(
        'kyo', FighterState.STAND_ATTACK, AttackType.CLOSE_A, 0, 1, 0, 0, 'startup',
      );
      expect(result.actionNumber).toBe('200');
    });

    it('returns empty result for unregistered character', () => {
      const result = resolveFrameIndex('nonexistent', FighterState.IDLE, null, 0, 1, 0, 0, 'none');
      expect(result.actionNumber).toBeNull();
    });
  });

  describe('getFrameDuration', () => {
    it('returns duration for registered frame', () => {
      expect(getFrameDuration('kyo', '0', 0)).toBe(9);
    });

    it('returns default for unregistered action', () => {
      expect(getFrameDuration('kyo', '99999', 0)).toBe(4);
    });
  });

  describe('getTotalAnimDuration', () => {
    it('sums all frame durations', () => {
      expect(getTotalAnimDuration('kyo', '0')).toBe(135);
    });

    it('returns 0 for unknown action', () => {
      expect(getTotalAnimDuration('kyo', '99999')).toBe(0);
    });
  });

  describe('isAnimLooping', () => {
    it('returns true by default', () => {
      expect(isAnimLooping('kyo', '0')).toBe(true);
    });

    it('returns false for non-looping animation', () => {
      registerAnimDurations('kyo', '999', [5, 5], false);
      expect(isAnimLooping('kyo', '999')).toBe(false);
    });
  });

  describe('getRegisteredActions', () => {
    it('lists all registered actions', () => {
      const actions = getRegisteredActions('kyo');
      expect(actions).toContain('0');
      expect(actions).toContain('20');
      expect(actions).toContain('200');
      expect(actions.length).toBeGreaterThanOrEqual(5);
    });

    it('returns empty for unknown character', () => {
      expect(getRegisteredActions('nonexistent')).toEqual([]);
    });
  });

  describe('tickToFrameIndex (via resolveFrameIndex)', () => {
    it('maps tick 0 to frame 0', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 0, 0, 'none');
      expect(result.frameIndex).toBe(0);
    });

    it('maps tick 8 to frame 0 (last tick of frame 0)', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 8, 0, 'none');
      expect(result.frameIndex).toBe(0);
    });

    it('maps tick 9 to frame 1', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 9, 0, 'none');
      expect(result.frameIndex).toBe(1);
    });

    it('maps tick 134 to last frame', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 134, 0, 'none');
      expect(result.frameIndex).toBe(14);
    });

    it('wraps at total duration', () => {
      const result = resolveFrameIndex('kyo', FighterState.IDLE, null, 0, 1, 135, 0, 'none');
      expect(result.frameIndex).toBe(0);
    });

    it('walk animation at tick 6 = frame 1', () => {
      const result = resolveFrameIndex('kyo', FighterState.WALK, null, 1, 1, 6, 0, 'none');
      expect(result.actionNumber).toBe('20');
      expect(result.frameIndex).toBe(1);
    });
  });
});
