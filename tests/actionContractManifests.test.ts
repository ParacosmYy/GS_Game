/**
 * Action Contract Manifest Structural Tests
 *
 * Validates RYO/KYO/IORI_ACTION_CONTRACTS Maps:
 * each ActionContract has required fields, consistent frame counts,
 * and valid startup/active/recovery partitioning.
 */
import { describe, it, expect } from 'vitest';
import type { ActionContract } from '../src/core/frameContract.js';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { KYO_ACTION_CONTRACTS } from '../src/core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS } from '../src/core/ioriFrameContract.js';

function validateContract(contract: ActionContract, label: string) {
  expect(contract.characterId, `${label}.characterId`).toBeTruthy();
  expect(contract.actionId, `${label}.actionId`).toBeTruthy();
  expect(contract.startup, `${label}.startup >= 0`).toBeGreaterThanOrEqual(0);
  expect(contract.active, `${label}.active >= 0`).toBeGreaterThanOrEqual(0);
  expect(contract.recovery, `${label}.recovery >= 0`).toBeGreaterThanOrEqual(0);
  expect(contract.totalFrames, `${label}.totalFrames > 0`).toBeGreaterThan(0);
  expect(contract.frames.length, `${label}.frames > 0`).toBeGreaterThan(0);
  expect(Array.isArray(contract.cancelWindows), `${label}.cancelWindows`).toBe(true);
}

function validateContractMap(contracts: Map<string, ActionContract>, charId: string) {
  describe(`${charId} ACTION_CONTRACTS`, () => {
    it('is a Map', () => {
      expect(contracts instanceof Map).toBe(true);
    });

    it('has entries', () => {
      expect(contracts.size).toBeGreaterThan(0);
    });

    it('all contracts have valid structure', () => {
      for (const [id, contract] of contracts) {
        validateContract(contract, `${charId}.${id}`);
      }
    });

    it('characterId matches on all contracts', () => {
      for (const [id, contract] of contracts) {
        expect(contract.characterId, `${id}.characterId`).toBe(charId);
      }
    });

    it('actionId matches map key', () => {
      for (const [id, contract] of contracts) {
        expect(contract.actionId, `${id}.actionId`).toBe(id);
      }
    });

    it('all frames have valid frameIndex', () => {
      for (const [id, contract] of contracts) {
        for (let i = 0; i < contract.frames.length; i++) {
          expect(contract.frames[i].frameIndex, `${id}.frames[${i}].frameIndex`).toBe(i);
        }
      }
    });

    it('attack contracts have attackType', () => {
      let attackCount = 0;
      for (const [id, contract] of contracts) {
        if (contract.attackType !== null) {
          expect(contract.attackType, `${id}.attackType`).toBeTruthy();
          attackCount++;
        }
      }
      expect(attackCount, `${charId} has attack contracts`).toBeGreaterThan(0);
    });
  });
}

// ===== All 3 characters =====

validateContractMap(RYO_ACTION_CONTRACTS, 'ryo');
validateContractMap(KYO_ACTION_CONTRACTS, 'kyo');
validateContractMap(IORI_ACTION_CONTRACTS, 'iori');

// ===== Cross-character =====

describe('Action Contract Manifests — cross-character', () => {
  it('all 3 manifests are non-empty', () => {
    expect(RYO_ACTION_CONTRACTS.size).toBeGreaterThan(0);
    expect(KYO_ACTION_CONTRACTS.size).toBeGreaterThan(0);
    expect(IORI_ACTION_CONTRACTS.size).toBeGreaterThan(0);
  });

  it('ryo has idle contract', () => {
    expect(RYO_ACTION_CONTRACTS.has('idle')).toBe(true);
  });

  it('kyo has idle contract', () => {
    expect(KYO_ACTION_CONTRACTS.has('idle')).toBe(true);
  });

  it('iori has idle contract', () => {
    expect(IORI_ACTION_CONTRACTS.has('idle')).toBe(true);
  });
});
