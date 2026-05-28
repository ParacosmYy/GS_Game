/**
 * hitboxDebugMugen.test.ts
 *
 * Tests for the MUGEN hitbox debug visualization module.
 * Validates display mode cycling, mode state, and API surface.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setHitboxDisplayMode,
  getHitboxDisplayMode,
  cycleHitboxDisplayMode,
  type HitboxDisplayMode,
} from '../src/rendering/hitboxDebugMugen.js';

describe('hitboxDebugMugen', () => {
  beforeEach(() => {
    setHitboxDisplayMode('game');
  });

  describe('display mode state', () => {
    it('defaults to game mode', () => {
      expect(getHitboxDisplayMode()).toBe('game');
    });

    it('can set mode to both', () => {
      setHitboxDisplayMode('both');
      expect(getHitboxDisplayMode()).toBe('both');
    });

    it('can set mode to mugen', () => {
      setHitboxDisplayMode('mugen');
      expect(getHitboxDisplayMode()).toBe('mugen');
    });

    it('can set mode back to game', () => {
      setHitboxDisplayMode('mugen');
      setHitboxDisplayMode('game');
      expect(getHitboxDisplayMode()).toBe('game');
    });
  });

  describe('cycleHitboxDisplayMode', () => {
    it('cycles game → both', () => {
      const result = cycleHitboxDisplayMode();
      expect(result).toBe('both');
      expect(getHitboxDisplayMode()).toBe('both');
    });

    it('cycles both → mugen', () => {
      setHitboxDisplayMode('both');
      const result = cycleHitboxDisplayMode();
      expect(result).toBe('mugen');
      expect(getHitboxDisplayMode()).toBe('mugen');
    });

    it('cycles mugen → game', () => {
      setHitboxDisplayMode('mugen');
      const result = cycleHitboxDisplayMode();
      expect(result).toBe('game');
      expect(getHitboxDisplayMode()).toBe('game');
    });

    it('full cycle returns to game', () => {
      expect(getHitboxDisplayMode()).toBe('game');
      cycleHitboxDisplayMode(); // → both
      cycleHitboxDisplayMode(); // → mugen
      const result = cycleHitboxDisplayMode(); // → game
      expect(result).toBe('game');
    });

    it('multiple full cycles work correctly', () => {
      for (let i = 0; i < 10; i++) {
        cycleHitboxDisplayMode();
      }
      // 10 cycles = 3 full rotations + 1 extra → 'both'
      expect(getHitboxDisplayMode()).toBe('both');
    });
  });

  describe('type safety', () => {
    it('accepts valid mode strings', () => {
      const modes: HitboxDisplayMode[] = ['game', 'both', 'mugen'];
      for (const mode of modes) {
        setHitboxDisplayMode(mode);
        expect(getHitboxDisplayMode()).toBe(mode);
      }
    });
  });
});
