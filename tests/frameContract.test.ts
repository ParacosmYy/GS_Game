import { describe, it, expect } from 'vitest';
import {
  getActionContract, getActionIds, isCancelPoint,
  getFrameEvents, getFrameCollision,
} from '../src/core/frameContract.js';
import type { ActionContract, FrameContractManifest } from '../src/core/frameContract.js';

describe('frameContract', () => {
  const mockContract: ActionContract = {
    characterId: 'ryo',
    actionId: 'stand_a',
    totalFrames: 14,
    frames: [
      { frameIndex: 0, duration: 1, spriteRef: 'ryo_stand_a_0', anchor: { x: 24, y: 72 }, offset: { x: 0, y: 0 }, hurtboxes: [], hitboxes: [], eventTags: [] },
      { frameIndex: 1, duration: 1, spriteRef: 'ryo_stand_a_1', anchor: { x: 24, y: 72 }, offset: { x: 0, y: 0 }, hurtboxes: [], hitboxes: [], eventTags: [] },
      { frameIndex: 2, duration: 1, spriteRef: 'ryo_stand_a_2', anchor: { x: 24, y: 72 }, offset: { x: 0, y: 0 }, hurtboxes: [], hitboxes: [], eventTags: ['swing'] },
      { frameIndex: 3, duration: 1, spriteRef: 'ryo_stand_a_3', anchor: { x: 24, y: 72 }, offset: { x: 0, y: 0 }, hurtboxes: [], hitboxes: [], eventTags: ['swing'] },
    ],
    cancelWindows: [{ frames: [2, 3] as [number, number], targetTypes: ['special'], requiresHit: true, maxOnly: false }],
  };

  const mockManifest: FrameContractManifest = {
    characters: new Map([
      ['ryo', { actions: new Map([['stand_a', mockContract]]) }],
    ]),
  };

  describe('getActionIds', () => {
    it('returns action IDs from a manifest', () => {
      const ids = getActionIds(mockManifest, 'ryo');
      expect(ids).toContain('stand_a');
    });
    it('returns empty for unknown character', () => {
      const ids = getActionIds(mockManifest, 'unknown');
      expect(ids).toEqual([]);
    });
  });

  describe('getActionContract', () => {
    it('returns contract for known action', () => {
      const result = getActionContract(mockManifest, 'ryo', 'stand_a');
      expect(result).toBeDefined();
      expect(result?.actionId).toBe('stand_a');
    });
    it('returns null for unknown action', () => {
      const result = getActionContract(mockManifest, 'ryo', 'unknown');
      expect(result).toBeNull();
    });
    it('returns null for unknown character', () => {
      const result = getActionContract(mockManifest, 'unknown', 'stand_a');
      expect(result).toBeNull();
    });
  });

  describe('isCancelPoint', () => {
    it('returns CancelWindow when in range and conditions met', () => {
      const result = isCancelPoint(mockContract, 2, true, false);
      expect(result).not.toBeNull();
    });
    it('returns null when frame out of range', () => {
      const result = isCancelPoint(mockContract, 0, true, false);
      expect(result).toBeNull();
    });
    it('returns null when requiresHit but not confirmed', () => {
      const result = isCancelPoint(mockContract, 2, false, false);
      expect(result).toBeNull();
    });
  });

  describe('getFrameEvents', () => {
    it('returns events for valid frame', () => {
      const events = getFrameEvents(mockContract, 2);
      expect(events).toContain('swing');
    });
    it('returns empty for out-of-range frame', () => {
      const events = getFrameEvents(mockContract, 99);
      expect(events).toEqual([]);
    });
  });

  describe('getFrameCollision', () => {
    it('returns undefined for frame without collision', () => {
      const result = getFrameCollision(mockContract, 0);
      expect(result).toBeUndefined();
    });
  });
});
