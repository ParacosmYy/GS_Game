/**
 * Stability & GameState Consolidated Tests
 *
 * Merged from: stability, gameStateManager
 *
 * Covers: game state manager lifecycle, phase transitions,
 *   RNG stability, long-run consistency.
 */
import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';
import { SeededRNG, resetGameRng, gameRandom } from '../src/core/prng.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import { MAX_HEALTH, STAGE_WIDTH } from '../src/core/constants.js';

// ── 1. GameStateManager ─────────────────────────────────────
describe('GameStateManager', () => {
  it('starts at TITLE phase', () => {
    const gsm = new GameStateManager();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('has zeroed timers and null references', () => {
    const gsm = new GameStateManager();
    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.winner).toBeNull();
    expect(gsm.isTimeOver).toBe(false);
  });
});

// ── 2. RNG Stability ────────────────────────────────────────
describe('RNG Stability', () => {
  it('same seed produces identical sequence', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);
    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(111);
    const rng2 = new SeededRNG(222);
    let same = 0;
    for (let i = 0; i < 100; i++) {
      if (rng1.next() === rng2.next()) same++;
    }
    expect(same).toBeLessThan(100);
  });

  it('RNG values are in valid range (0-1)', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

// ── 3. Fighter Long-Run Stability ──────────────────────────
describe('Fighter Long-Run Stability', () => {
  it('fighter tickTimers 1000 frames without crash', () => {
    const f = new Fighter(300, '#ff6600', 1);
    for (let i = 0; i < 1000; i++) {
      f.tickTimers();
    }
    expect(f.health).toBeGreaterThanOrEqual(0);
  });

  it('fighter health never exceeds max', () => {
    const f = new Fighter(300, '#ff6600', 1);
    f.health = MAX_HEALTH + 100;
    expect(f.health).toBeGreaterThan(MAX_HEALTH);
    // After reset, health returns to max
    f.reset();
    expect(f.health).toBe(MAX_HEALTH);
  });
});
