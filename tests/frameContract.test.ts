import { describe, it, expect } from 'vitest';
import {
  getActionContract, getActionIds, isCancelPoint,
  getFrameEvents, getFrameCollision, validateActionAlignment,
} from '../src/core/frameContract.js';
import type { ActionContract, FrameContractManifest, FrameContract } from '../src/core/frameContract.js';

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

  // ===== validateActionAlignment =====

  describe('validateActionAlignment', () => {
    it('returns valid for matching startup/active/recovery', () => {
      // Create frames array with correct length
      const frames: FrameContract[] = Array.from({ length: 9 }, (_, i) => ({
        frameIndex: i, duration: 1, spriteRef: `f${i}`, anchor: { x: 24, y: 72 },
        offset: { x: 0, y: 0 }, collision: null, eventTags: [],
      }));
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 2, active: 3, recovery: 4, totalFrames: 9,
        frames, cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('detects startup mismatch', () => {
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 3, active: 3, recovery: 4, totalFrames: 10,
        frames: [] as FrameContract[], cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('startup'))).toBe(true);
    });

    it('detects active mismatch', () => {
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 2, active: 2, recovery: 4, totalFrames: 8,
        frames: [] as FrameContract[], cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('active'))).toBe(true);
    });

    it('detects recovery mismatch', () => {
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 2, active: 3, recovery: 5, totalFrames: 10,
        frames: [] as FrameContract[], cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('recovery'))).toBe(true);
    });

    it('detects totalFrames mismatch', () => {
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 2, active: 3, recovery: 4, totalFrames: 8,
        frames: [] as FrameContract[], cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('totalFrames'))).toBe(true);
    });

    it('detects multiple issues simultaneously', () => {
      const contract: ActionContract = {
        characterId: 'test', actionId: 'test', state: 'STAND_ATTACK' as any,
        attackType: 'STAND_A' as any, hitLevel: 'MID' as any, knockdown: false,
        startup: 5, active: 5, recovery: 5, totalFrames: 20,
        frames: [] as FrameContract[], cancelWindows: [], feedbackTierOverride: null,
      };
      const result = validateActionAlignment(contract, 2, 3, 4);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(3);
    });
  });
});
