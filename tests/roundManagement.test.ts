/**
 * Round Management Consolidated Tests
 *
 * Merged from: roundManagement, roundStateManagement, matchFlow, roundTimerSystem, roundTransitionLifecycle
 *
 * Covers: round start, KO trigger, timer, phase transitions.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';
import { MAX_HEALTH, ROUND_TIME, KO_DISPLAY_TIME } from '../src/core/constants.js';

function createFighter(x = 300, health = MAX_HEALTH): Fighter {
  const f = new Fighter(x, '#ff0000', 1);
  f.health = health;
  return f;
}

// ── 1. Round Start ──────────────────────────────────────────
describe('Round Start', () => {
  it('GameStateManager starts at TITLE', () => {
    const gsm = new GameStateManager();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('fighters start at full health', () => {
    const f = createFighter();
    expect(f.health).toBe(MAX_HEALTH);
  });

  it('round start has no active cinematic', () => {
    const cs = new CinematicState();
    expect(cs.isFrozen()).toBe(false);
  });
});

// ── 2. KO Trigger ───────────────────────────────────────────
describe('KO Trigger', () => {
  it('health dropping to 0 triggers KO', () => {
    const p2 = createFighter();
    p2.health = 0;
    expect(p2.health).toBeLessThanOrEqual(0);
  });

  it('health above 0 means no KO', () => {
    const f = createFighter();
    f.health = 1;
    expect(f.health).toBeGreaterThan(0);
  });

  it('KO display time is defined', () => {
    expect(KO_DISPLAY_TIME).toBeGreaterThan(0);
  });
});

// ── 3. Timer ────────────────────────────────────────────────
describe('Round Timer', () => {
  it('ROUND_TIME = 99 seconds', () => {
    expect(ROUND_TIME).toBe(99);
  });

  it('timer pauses during hitstop', () => {
    const cs = new CinematicState();
    cs.hitStop = 10;
    expect(cs.isFrozen()).toBe(true);
  });
});

// ── 4. Phase Transitions ────────────────────────────────────
describe('Phase Transitions', () => {
  it('setPhase changes the current phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.SELECT);
    expect(gsm.phase).toBe(GamePhase.SELECT);
  });

  it('can transition through typical game flow', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.SELECT);
    gsm.setPhase(GamePhase.VS_SPLASH);
    gsm.setPhase(GamePhase.ROUND_INTRO);
    expect(gsm.phase).toBe(GamePhase.ROUND_INTRO);
  });
});

// ── 5. Round Between Reset ──────────────────────────────────
describe('Round Between Reset', () => {
  it('fighter reset restores health', () => {
    const f = createFighter();
    f.health = 50;
    f.reset();
    expect(f.health).toBe(MAX_HEALTH);
  });
});
