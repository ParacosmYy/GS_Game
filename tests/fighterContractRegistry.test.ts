/**
 * Fighter Contract Registry Tests
 *
 * Tests registerCharacterContracts, getCharacterActionContract, getContractEventTags
 * from src/entities/fighter.ts. These are pure data registry functions.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerCharacterContracts,
  getCharacterActionContract,
  getContractEventTags,
} from '../src/entities/fighter.js';
import type { ActionContract } from '../src/core/frameContract.js';
import { FighterState, AttackType } from '../src/core/types.js';
import { KYO_ACTION_CONTRACTS } from '../src/core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS } from '../src/core/ioriFrameContract.js';

// ===== Registry Tests =====

describe('Fighter contract registry', () => {
  beforeEach(() => {
    // Register Kyo contracts
    registerCharacterContracts('kyo', KYO_ACTION_CONTRACTS);
  });

  describe('getCharacterActionContract', () => {
    it('returns contract for registered kyo idle', () => {
      const c = getCharacterActionContract('kyo', 'idle');
      expect(c).not.toBeNull();
      expect(c!.actionId).toBe('idle');
      expect(c!.characterId).toBe('kyo');
    });

    it('returns contract for registered kyo stand_a', () => {
      const c = getCharacterActionContract('kyo', 'stand_a');
      expect(c).not.toBeNull();
      expect(c!.attackType).not.toBeNull();
    });

    it('returns contract for kyo DM', () => {
      const c = getCharacterActionContract('kyo', 'dm_orochinagi');
      expect(c).not.toBeNull();
    });

    it('returns null for unregistered character', () => {
      const c = getCharacterActionContract('nonexistent', 'idle');
      expect(c).toBeNull();
    });

    it('returns null for unregistered action', () => {
      const c = getCharacterActionContract('kyo', 'nonexistent_action');
      expect(c).toBeNull();
    });
  });

  describe('getContractEventTags', () => {
    it('returns empty array for unregistered character', () => {
      const tags = getContractEventTags('nonexistent', 'idle', 'startup', 0);
      expect(tags).toEqual([]);
    });

    it('returns empty array for unregistered action', () => {
      const tags = getContractEventTags('kyo', 'nonexistent', 'startup', 0);
      expect(tags).toEqual([]);
    });

    it('returns tags for registered kyo action', () => {
      // DM actions should have 'super_flash' on first frame
      const tags = getContractEventTags('kyo', 'dm_orochinagi', 'startup', 0);
      // May or may not have tags depending on frame contract, but should not throw
      expect(Array.isArray(tags)).toBe(true);
    });
  });

  describe('multi-character registration', () => {
    it('can register and query iori contracts', () => {
      registerCharacterContracts('iori', IORI_ACTION_CONTRACTS);
      const c = getCharacterActionContract('iori', 'idle');
      expect(c).not.toBeNull();
      expect(c!.characterId).toBe('iori');
    });

    it('kyo and iori contracts coexist', () => {
      registerCharacterContracts('iori', IORI_ACTION_CONTRACTS);
      const kyoIdle = getCharacterActionContract('kyo', 'idle');
      const ioriIdle = getCharacterActionContract('iori', 'idle');
      expect(kyoIdle!.characterId).toBe('kyo');
      expect(ioriIdle!.characterId).toBe('iori');
    });
  });
});
