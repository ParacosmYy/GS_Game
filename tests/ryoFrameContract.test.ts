import { describe, it, expect } from 'vitest';
import { RYO_ACTION_CONTRACTS, getRyoFrameContractManifest } from '../src/core/ryoFrameContract.js';

describe('ryoFrameContract', () => {
  describe('RYO_ACTION_CONTRACTS', () => {
    it('is a Map', () => {
      expect(RYO_ACTION_CONTRACTS).toBeInstanceOf(Map);
    });
    it('has idle action', () => {
      expect(RYO_ACTION_CONTRACTS.has('idle')).toBe(true);
    });
    it('has stand_a action', () => {
      expect(RYO_ACTION_CONTRACTS.has('stand_a')).toBe(true);
    });
    it('has stand_c action', () => {
      expect(RYO_ACTION_CONTRACTS.has('stand_c')).toBe(true);
    });
    it('has walk_forward action', () => {
      expect(RYO_ACTION_CONTRACTS.has('walk_forward')).toBe(true);
    });
    it('has hurt action', () => {
      expect(RYO_ACTION_CONTRACTS.has('hurt')).toBe(true);
    });
    it('has at least 10 actions', () => {
      expect(RYO_ACTION_CONTRACTS.size).toBeGreaterThanOrEqual(10);
    });
    it('stand_a has frames', () => {
      const action = RYO_ACTION_CONTRACTS.get('stand_a');
      expect(action).toBeDefined();
      expect(action!.frames.length).toBeGreaterThan(0);
    });
    it('idle has frames', () => {
      const action = RYO_ACTION_CONTRACTS.get('idle');
      expect(action).toBeDefined();
      expect(action!.frames.length).toBeGreaterThan(0);
    });
    it('stand_a has startup or active phase', () => {
      const action = RYO_ACTION_CONTRACTS.get('stand_a')!;
      const phases = action.frames.map(f => f.phase);
      expect(phases.length).toBeGreaterThan(0);
    });
  });

  describe('getRyoFrameContractManifest', () => {
    it('returns the manifest', () => {
      const manifest = getRyoFrameContractManifest();
      expect(manifest).toBeDefined();
    });
    it('manifest has characterId ryo', () => {
      const manifest = getRyoFrameContractManifest() as any;
      expect(manifest.characterId).toBe('ryo');
    });
  });
});
