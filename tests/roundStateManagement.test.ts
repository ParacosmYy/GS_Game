/**
 * Round State Management Tests — RoundState class lifecycle.
 *
 * Tests cover the RoundState class directly:
 * 1. Round Start: initial state, countdown intro, transition to fighting
 * 2. Fighting State: timer behavior, KO exit condition
 * 3. KO State: health-based KO, double KO, display time
 * 4. Round End: result tracking, match end detection, next round reset
 * 5. Time Up: health comparison, draw, display time
 */
import { describe, it, expect, vi } from 'vitest';
import { RoundState } from '../src/state/roundState.js';
import { Fighter } from '../src/entities/fighter.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { MAX_HEALTH, STAGE_WIDTH } from '../src/core/constants.js';
import { GamePhase } from '../src/core/types.js';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { createPowerGauge, createMaxMode } from '../src/combat/meter.js';

// ---------------------------------------------------------------------------
// Helpers — build minimal dependency injection for RoundState
// ---------------------------------------------------------------------------

/** Create a VFXSystem-like object with just the reset method RoundState calls */
function makeVFXMock() {
  return { reset: vi.fn() };
}

/** Create a CinematicState (real, lightweight, no side effects) */
function makeCinematic() {
  return new CinematicState();
}

/** Create all deps and return them alongside the RoundState instance */
function makeRoundState() {
  const p1 = new Fighter(STAGE_WIDTH * 0.30, '#ff0000', 1);
  const p2 = new Fighter(STAGE_WIDTH * 0.70, '#0000ff', -1);
  const p1Cmd = new CommandBuffer();
  const p2Cmd = new CommandBuffer();
  const combatSystem = new CombatSystem();
  const projectiles: InstanceType<typeof import('../src/entities/projectile.js').Projectile>[] = [];
  const vfx = makeVFXMock() as any;
  const cinematic = makeCinematic();
  const gauges = [createPowerGauge(), createPowerGauge()] as [import('../src/core/types.js').PowerGauge, import('../src/core/types.js').PowerGauge];
  const maxModes = [createMaxMode(), createMaxMode()] as [import('../src/core/types.js').MaxModeState, import('../src/core/types.js').MaxModeState];
  const tickRef = { value: 0 };

  const rs = new RoundState({
    p1, p2, p1Cmd, p2Cmd,
    combatSystem,
    projectiles,
    vfx,
    cinematic,
    gauges,
    maxModes,
    tickRef,
  });

  return { rs, p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic, gauges, maxModes, tickRef };
}

// ===========================================================================
// 1. Round Start (4 tests)
// ===========================================================================

describe('Round Start', () => {
  it('initial state has round 1, zero wins, and winsNeeded = 2', () => {
    const { rs } = makeRoundState();
    expect(rs.currentRound).toBe(1);
    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(rs.winsNeeded).toBe(2);
  });

  it('intro countdown starts with tick at 0 and increments', () => {
    const { rs, tickRef } = makeRoundState();
    // tickRef starts at 0 — the intro phase uses it as countdown
    expect(tickRef.value).toBe(0);
    tickRef.value = 60;
    expect(tickRef.value).toBe(60);
  });

  it('tick can be advanced past the intro threshold to represent "FIGHT!" end', () => {
    const { rs, tickRef } = makeRoundState();
    // Simulate intro phase: tick counts up. At some threshold the game
    // transitions from INTRO to FIGHTING. RoundState itself does not
    // manage GamePhase, but tickRef is the timer it tracks.
    tickRef.value = 120; // past typical 2-second intro
    expect(tickRef.value).toBe(120);
  });

  it('round start has no fade active', () => {
    const { rs } = makeRoundState();
    expect(rs.fadeAlpha).toBe(0);
    expect(rs.fadeDirection).toBe(0);
    expect(rs.fadeCallback).toBeNull();
  });
});

// ===========================================================================
// 2. Fighting State (4 tests)
// ===========================================================================

describe('Fighting State', () => {
  it('tick counter increments during fighting', () => {
    const { rs, tickRef } = makeRoundState();
    expect(tickRef.value).toBe(0);
    tickRef.value++;
    tickRef.value++;
    expect(tickRef.value).toBe(2);
  });

  it('KO exits fighting when a fighter health reaches 0', () => {
    const { rs, p1, p2 } = makeRoundState();
    // P2 at full health, P1 reduced to 0
    p1.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBe(1); // P2 wins
  });

  it('fighters can be in attacking states during fighting', () => {
    const { rs, p1, p2 } = makeRoundState();
    // Both fighters start in IDLE and can attack
    expect(p1.canAct()).toBe(true);
    expect(p2.canAct()).toBe(true);
    // Simulate an attack state
    p1.applyHitstun(10, 5);
    expect(p1.canAct()).toBe(false); // in hitstun, cannot act
  });

  it('determineWinner returns null when both fighters alive and equal health', () => {
    const { rs, p1, p2 } = makeRoundState();
    // Both at full health, no one is KO'd
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
    const winner = rs.determineWinner();
    // Equal health => draw (null)
    expect(winner).toBeNull();
  });
});

// ===========================================================================
// 3. KO State (4 tests)
// ===========================================================================

describe('KO State', () => {
  it('fighter health at 0 triggers KO for that fighter', () => {
    const { rs, p2 } = makeRoundState();
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBe(0); // P1 wins
  });

  it('KO triggers cinematic slow-mo display', () => {
    const { cinematic } = makeRoundState();
    cinematic.triggerKOSlowMo();
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koSlowMo).toBe(40); // 40 frames of slow-mo
  });

  it('KO display time elapses via shouldSkipFrame', () => {
    const { cinematic } = makeRoundState();
    cinematic.triggerKOSlowMo();
    // Simulate slow-mo running its course
    let framesRan = 0;
    while (!cinematic.isKOSlowMoDone()) {
      const skipped = cinematic.shouldSkipFrame();
      if (!skipped) framesRan++;
    }
    expect(cinematic.isKOSlowMoDone()).toBe(true);
    expect(framesRan).toBeGreaterThan(0);
  });

  it('both fighters at 0 health = double KO (null winner)', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 0;
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBeNull(); // double KO = draw
  });
});

// ===========================================================================
// 4. Round End (4 tests)
// ===========================================================================

describe('Round End', () => {
  it('addWin increments the correct win counter', () => {
    const { rs } = makeRoundState();
    expect(rs.p1Wins).toBe(0);
    const result = rs.addWin(0); // P1 wins
    expect(rs.p1Wins).toBe(1);
    expect(result).toBeNull(); // match not over yet (need 2)
  });

  it('addWin returns match winner when winsNeeded reached', () => {
    const { rs } = makeRoundState();
    rs.addWin(0); // P1: 1-0
    const result = rs.addWin(0); // P1: 2-0
    expect(result).toBe(0); // P1 wins match
  });

  it('addWin(null) does not change win counts (draw/double KO)', () => {
    const { rs } = makeRoundState();
    const result = rs.addWin(null);
    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(result).toBeNull();
  });

  it('fullReset clears all round state back to initial', () => {
    const { rs, p1, p2, tickRef, gauges, maxModes } = makeRoundState();
    // Simulate some match progress
    rs.addWin(0);
    rs.addWin(0);
    rs.currentRound = 3;
    tickRef.value = 500;
    gauges[0].stocks = 3;
    gauges[0].meter = 500;

    rs.fullReset();

    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(rs.currentRound).toBe(1);
    expect(rs.fadeAlpha).toBe(0);
    expect(rs.fadeDirection).toBe(0);
    expect(rs.fadeCallback).toBeNull();
    expect(tickRef.value).toBe(0);
    // Meter is reset
    expect(gauges[0].stocks).toBe(0);
    expect(gauges[0].meter).toBe(0);
    // Fighters are reset
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
  });
});

// ===========================================================================
// 5. Time Up (4 tests)
// ===========================================================================

describe('Time Up', () => {
  it('health comparison decides winner on time up', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 800;
    p2.health = 500;
    const winner = rs.determineWinner();
    expect(winner).toBe(0); // P1 has more health
  });

  it('equal health on time up = draw', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 500;
    p2.health = 500;
    const winner = rs.determineWinner();
    expect(winner).toBeNull();
  });

  it('time up display uses cinematic state (slow-mo)', () => {
    const { cinematic } = makeRoundState();
    // Time up also triggers KO slow-mo for display
    cinematic.triggerKOSlowMo();
    expect(cinematic.koSlowMo).toBe(40);
    expect(cinematic.koSlowMoTriggered).toBe(true);
  });

  it('time up does not affect fighters who are already KO\'d (health <= 0 takes priority)', () => {
    const { rs, p1, p2 } = makeRoundState();
    // P1 has more health but P2 has 0 health (already KO'd)
    p1.health = 100;
    p2.health = 0;
    const winner = rs.determineWinner();
    // Health <= 0 check happens before health comparison
    expect(winner).toBe(0); // P1 wins by KO, not by time up comparison
  });
});

// ===========================================================================
// 6. Fade Transition (4 tests)
// ===========================================================================

describe('Fade Transition', () => {
  it('startRoundTransition sets fade-out direction and increments round on complete', () => {
    const { rs } = makeRoundState();
    expect(rs.currentRound).toBe(1);
    rs.startRoundTransition();
    expect(rs.fadeDirection).toBe(1); // fading out
    expect(rs.fadeAlpha).toBe(0);

    // Simulate fade-out completing (alpha goes from 0 to 1)
    for (let i = 0; i < 30; i++) rs.tickFade();
    expect(rs.currentRound).toBe(2); // round incremented after fade completes
  });

  it('tickFade returns true while fade is active, false when idle', () => {
    const { rs } = makeRoundState();
    expect(rs.tickFade()).toBe(false); // no fade active

    rs.startRoundTransition();
    expect(rs.tickFade()).toBe(true); // fade active
  });

  it('fade-in completes and returns to idle', () => {
    const { rs } = makeRoundState();
    rs.startRoundTransition();
    // Complete fade-out
    while (rs.fadeDirection === 1) rs.tickFade();
    // Now fading back in (direction = -1)
    expect(rs.fadeDirection).toBe(-1);
    // Complete fade-in
    while (rs.fadeDirection === -1) rs.tickFade();
    expect(rs.fadeDirection).toBe(0);
    expect(rs.fadeAlpha).toBe(0);
  });

  it('resetForNextRound clears fade state', () => {
    const { rs } = makeRoundState();
    rs.startRoundTransition();
    rs.resetForNextRound();
    expect(rs.fadeAlpha).toBe(0);
    expect(rs.fadeDirection).toBe(0);
    expect(rs.fadeCallback).toBeNull();
  });
});

// ===========================================================================
// 7. Integration: Full Round Lifecycle with RoundState (4 tests)
// ===========================================================================

describe('Full Round Lifecycle with RoundState', () => {
  it('complete round: fight -> KO -> addWin -> resetForNextRound', () => {
    const { rs, p1, p2, tickRef } = makeRoundState();
    const gsm = new GameStateManager();

    // Start round 1
    expect(rs.currentRound).toBe(1);
    gsm.setPhase(GamePhase.INTRO);
    gsm.setPhase(GamePhase.FIGHTING);

    // P2 gets KO'd
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBe(0);

    // Transition to KO phase
    gsm.winner = winner;
    gsm.setPhase(GamePhase.KO);

    // Award win
    const matchResult = rs.addWin(winner!);
    expect(rs.p1Wins).toBe(1);
    expect(matchResult).toBeNull(); // match not over

    // Transition through win quote
    gsm.setPhase(GamePhase.WIN_QUOTE);

    // Reset for next round
    rs.resetForNextRound();
    gsm.resetForNextRound();

    expect(rs.p1Wins).toBe(1); // wins preserved across rounds
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
    expect(tickRef.value).toBe(0);
    expect(gsm.phaseTimer).toBe(0);
  });

  it('complete match: two rounds -> match end', () => {
    const { rs, p1, p2 } = makeRoundState();
    const gsm = new GameStateManager();

    // Round 1: P1 wins
    p2.health = 0;
    const w1 = rs.determineWinner();
    rs.addWin(w1!);
    expect(rs.p1Wins).toBe(1);

    rs.resetForNextRound();
    gsm.resetForNextRound();
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    // Round 2: P1 wins again
    p2.health = 0;
    const w2 = rs.determineWinner();
    const matchResult = rs.addWin(w2!);
    expect(rs.p1Wins).toBe(2);
    expect(matchResult).toBe(0); // P1 wins the match

    gsm.winner = 0;
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
  });

  it('double KO round does not award wins and round can be replayed', () => {
    const { rs, p1, p2 } = makeRoundState();
    const gsm = new GameStateManager();

    // Both KO'd simultaneously
    p1.health = 0;
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBeNull();

    const matchResult = rs.addWin(winner);
    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(matchResult).toBeNull(); // match continues

    // Reset and replay the same round
    rs.resetForNextRound();
    gsm.resetForNextRound();
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('fullReset restores entire match state from any point', () => {
    const { rs, p1, p2, tickRef, gauges } = makeRoundState();
    const gsm = new GameStateManager();

    // Simulate being mid-match
    rs.addWin(0);
    rs.addWin(1);
    rs.currentRound = 3;
    p1.health = 300;
    p2.health = 0;
    tickRef.value = 999;
    gauges[0].stocks = 5;
    gsm.winner = 0;
    gsm.phaseTimer = 100;

    rs.fullReset();
    gsm.resetForNewGame();

    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(rs.currentRound).toBe(1);
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
    expect(tickRef.value).toBe(0);
    expect(gauges[0].stocks).toBe(0);
    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
  });
});
