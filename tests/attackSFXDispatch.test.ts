/**
 * Tests for per-frame SFX dispatch system (attackSFX.ts)
 *
 * Verifies:
 * - SFX table has entries for all Ryo special moves
 * - tickAttackSFX plays SFX at correct startup frame
 * - tickAttackSFX plays SFX at correct active frame
 * - SFX does NOT replay on same frame (once-only)
 * - SFX resets when new attack starts
 * - Universal SFX entries work for any attack type
 * - Priority system works (higher priority SFX overwrites lower)
 * - Empty fighter (no attack) produces no SFX
 * - Ryo Ko'ou Ken has both startup and active SFX
 * - Ryo Ko Hou has startup whoosh and active impact
 * - Ryo DM has multiple SFX across startup frames
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType } from '../src/core/types.js';
import {
  ATTACK_SFX_TABLE,
  tickAttackSFX,
  resetAttackSFXTracking,
  resetAllAttackSFXTracking,
  hasBeenPlayed,
} from '../src/audio/attackSFX.js';
import type { AttackPhase } from '../src/core/types.js';

// ── Helpers ──

/** Create a mock sampler that records which functions were called */
function createMockSampler(): Record<string, (...args: any[]) => void> & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    playHit: () => { calls.push('playHit'); },
    playSpecialLight: () => { calls.push('playSpecialLight'); },
    playSpecialHeavy: () => { calls.push('playSpecialHeavy'); },
    playDM: () => { calls.push('playDM'); },
  };
}

/** Create a fighter at default position */
function createFighter(): Fighter {
  return new Fighter(400, '#ff6600', 1);
}

/** Manually set fighter attack state for testing */
function setAttackState(
  fighter: Fighter,
  attackType: AttackType,
  phase: AttackPhase,
  frame: number,
): void {
  fighter.startAttack(attackType);
  // Manually override phase/frame for test control
  (fighter as any).attackPhase = phase;
  (fighter as any).attackFrame = frame;
}

// ── Tests ──

describe('AttackSFX Dispatch', () => {
  let sampler: ReturnType<typeof createMockSampler>;
  let fighter: Fighter;

  beforeEach(() => {
    sampler = createMockSampler();
    fighter = createFighter();
    resetAllAttackSFXTracking();
  });

  describe('SFX table completeness', () => {
    it('should have entries for Ryo Koou (weak)', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'RYO_KOOU');
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries.some(e => e.phase === 'startup')).toBe(true);
      expect(entries.some(e => e.phase === 'active')).toBe(true);
    });

    it('should have entries for Ryo Ko Hou (weak)', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'RYO_KO_HOU');
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries.some(e => e.phase === 'startup')).toBe(true);
      expect(entries.some(e => e.phase === 'active')).toBe(true);
    });

    it('should have entries for Ryo Ko Hou (strong)', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'RYO_KO_HOU_C');
      expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    it('should have entries for all Ryo specials', () => {
      const ryoSpecials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU'];
      for (const sp of ryoSpecials) {
        const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === sp);
        expect(entries.length, `No SFX entries for ${sp}`).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have entries for Ryo DM (DM_TEN_HA_OU)', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'DM_TEN_HA_OU');
      expect(entries.length).toBeGreaterThanOrEqual(3); // startup x2 + active
    });
  });

  describe('Startup SFX dispatch', () => {
    it('should play startup SFX for Ryo Koou at frame 0', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playSpecialLight');
    });

    it('should play startup SFX for Ryo Ko Hou at frame 0', () => {
      setAttackState(fighter, AttackType.RYO_KO_HOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playSpecialLight');
    });
  });

  describe('Active SFX dispatch', () => {
    it('should play active SFX for Ryo Koou at frame 0', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playSpecialHeavy');
    });

    it('should play active SFX for Ryo Ko Hou at frame 0', () => {
      setAttackState(fighter, AttackType.RYO_KO_HOU, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      // Ryo Ko Hou active has priority 3 (playSpecialHeavy) which is higher than universal (*) priority 1
      expect(sampler.calls).toContain('playSpecialHeavy');
    });
  });

  describe('Once-only playback', () => {
    it('should NOT replay SFX on the same frame', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual(['playSpecialLight']);

      // Tick again with same state — should not play again
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual(['playSpecialLight']);
    });

    it('should NOT replay active SFX on the same frame', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls.length).toBe(1);

      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls.length).toBe(1);
    });
  });

  describe('SFX reset on new attack', () => {
    it('should reset played tracking when a new attack starts', () => {
      // First attack: Ryo Koou startup
      setAttackState(fighter, AttackType.RYO_KOOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual(['playSpecialLight']);

      // New attack: Ryo Ko Hou startup — should play again
      setAttackState(fighter, AttackType.RYO_KO_HOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual(['playSpecialLight', 'playSpecialLight']);
    });
  });

  describe('Universal SFX entries', () => {
    it('should play universal playHit for attack types without specific entries', () => {
      // STAND_A has no specific entry, so the wildcard '*' at active frame 0 should fire
      setAttackState(fighter, AttackType.STAND_A, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playHit');
    });

    it('should play universal SFX for CROUCH_D active frame', () => {
      setAttackState(fighter, AttackType.CROUCH_D, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playHit');
    });
  });

  describe('Priority system', () => {
    it('should play higher-priority SFX instead of universal for specials', () => {
      // Ryo Koou active has priority 2 (playSpecialHeavy) vs universal '*' priority 1 (playHit)
      setAttackState(fighter, AttackType.RYO_KOOU, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playSpecialHeavy');
      expect(sampler.calls).not.toContain('playHit');
    });
  });

  describe('Empty fighter', () => {
    it('should produce no SFX when fighter has no attack', () => {
      // Default fighter state: no attack
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual([]);
    });

    it('should produce no SFX when attack phase is none', () => {
      fighter.currentAttack = null;
      fighter.attackPhase = 'none';
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toEqual([]);
    });
  });

  describe('Ryo Ko\'ou Ken full cycle', () => {
    it('should have both startup and active SFX', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'RYO_KOOU');
      const startupEntry = entries.find(e => e.phase === 'startup');
      const activeEntry = entries.find(e => e.phase === 'active');
      expect(startupEntry).toBeDefined();
      expect(activeEntry).toBeDefined();
      expect(startupEntry!.sfx).toBe('playSpecialLight');
      expect(activeEntry!.sfx).toBe('playSpecialHeavy');
    });
  });

  describe('Ryo DM multiple SFX', () => {
    it('should have multiple SFX entries across startup frames for DM_TEN_HA_OU', () => {
      const entries = ATTACK_SFX_TABLE.filter(e => e.attackType === 'DM_TEN_HA_OU');
      const startupEntries = entries.filter(e => e.phase === 'startup');
      expect(startupEntries.length).toBeGreaterThanOrEqual(2);

      // Should have frame 0 and frame 6
      expect(startupEntries.some(e => e.frame === 0)).toBe(true);
      expect(startupEntries.some(e => e.frame === 6)).toBe(true);
    });

    it('should play DM SFX at active frame 0', () => {
      setAttackState(fighter, AttackType.DM_TEN_HA_OU, 'active', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(sampler.calls).toContain('playDM');
    });
  });

  describe('hasBeenPlayed helper', () => {
    it('should correctly report played state', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(hasBeenPlayed(0, 'RYO_KOOU', 'startup', 0)).toBe(true);
      expect(hasBeenPlayed(0, 'RYO_KOOU', 'active', 0)).toBe(false);
    });
  });

  describe('resetAttackSFXTracking', () => {
    it('should clear tracking for a specific fighter', () => {
      setAttackState(fighter, AttackType.RYO_KOOU, 'startup', 0);
      tickAttackSFX(fighter, sampler, 0);
      expect(hasBeenPlayed(0, 'RYO_KOOU', 'startup', 0)).toBe(true);

      resetAttackSFXTracking(0);
      expect(hasBeenPlayed(0, 'RYO_KOOU', 'startup', 0)).toBe(false);
    });
  });
});
