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
  getFrameTickRange,
  getAnimStats,
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

  describe('MUGEN -1 normalization', () => {
    it('replaces -1 with previous frame duration', () => {
      registerAnimDurations('norm', '0', [5, -1, -1, 10, -1], true);
      const info = getAnimInfo('norm', '0');
      expect(info!.frameDurations).toEqual([5, 5, 5, 10, 10]);
      expect(info!.totalDuration).toBe(35);
    });

    it('replaces leading -1 with default 4', () => {
      registerAnimDurations('norm', '1', [-1, -1, 8], true);
      const info = getAnimInfo('norm', '1');
      expect(info!.frameDurations).toEqual([4, 4, 8]);
    });

    it('handles all -1 array', () => {
      registerAnimDurations('norm', '2', [-1, -1, -1, -1], true);
      const info = getAnimInfo('norm', '2');
      expect(info!.frameDurations).toEqual([4, 4, 4, 4]);
    });

    it('handles empty array', () => {
      registerAnimDurations('norm', '3', [], true);
      const info = getAnimInfo('norm', '3');
      expect(info!.frameDurations).toEqual([]);
      expect(info!.totalDuration).toBe(0);
    });

    it('no-op for already valid durations', () => {
      registerAnimDurations('norm', '4', [3, 5, 7, 4], true);
      const info = getAnimInfo('norm', '4');
      expect(info!.frameDurations).toEqual([3, 5, 7, 4]);
    });
  });

  describe('getFrameTickRange', () => {
    beforeEach(() => {
      registerAnimDurations('range', '0', [5, 10, 15], true);
    });

    it('returns correct range for frame 0', () => {
      const range = getFrameTickRange('range', '0', 0);
      expect(range).toEqual({ start: 0, end: 5 });
    });

    it('returns correct range for frame 1', () => {
      const range = getFrameTickRange('range', '0', 1);
      expect(range).toEqual({ start: 5, end: 15 });
    });

    it('returns correct range for last frame', () => {
      const range = getFrameTickRange('range', '0', 2);
      expect(range).toEqual({ start: 15, end: 30 });
    });

    it('returns null for out-of-range', () => {
      expect(getFrameTickRange('range', '0', 3)).toBeNull();
      expect(getFrameTickRange('range', '0', -1)).toBeNull();
    });

    it('returns null for unknown action', () => {
      expect(getFrameTickRange('range', '999', 0)).toBeNull();
    });
  });

  describe('getAnimStats', () => {
    it('computes stats for registered character', () => {
      clearAnimCache();
      registerAnimDurations('stat', '0', [9, 9, 9], true);
      registerAnimDurations('stat', '20', [6, 6, 6, 6], true);
      registerAnimDurations('stat', '200', [3, 3, 3, 2, 2], false);

      const stats = getAnimStats('stat');
      expect(stats.totalActions).toBe(3);
      expect(stats.totalFrames).toBe(12);
      expect(stats.totalDuration).toBe(64); // 27+24+13
      expect(stats.avgFrameDuration).toBeCloseTo(64 / 12);
      expect(stats.loopingActions).toBe(2);
      expect(stats.nonLoopingActions).toBe(1);
    });

    it('returns zeros for unknown character', () => {
      const stats = getAnimStats('unknown_stat');
      expect(stats.totalActions).toBe(0);
      expect(stats.totalFrames).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.avgFrameDuration).toBe(0);
      expect(stats.loopingActions).toBe(0);
      expect(stats.nonLoopingActions).toBe(0);
    });
  });
});
