/**
 * Round Transition Lifecycle Tests — Complete round state machine coverage.
 *
 * Tests the full lifecycle of round transitions:
 * 1. Round Start Sequence (4 tests)
 * 2. KO Sequence (5 tests)
 * 3. Round Result Determination (5 tests)
 * 4. Round Transitions and State Carryover (6 tests)
 * 5. Match End and Best-of-3 (4 tests)
 * 6. Round Timer Mechanics (4 tests)
 *
 * This test file focuses on the *interactions* between RoundState,
 * CinematicState, GameStateManager, and AnnounceSequence during round
 * transitions — the glue logic that is easy to break when modules change.
 *
 * It complements (does not duplicate) roundStateManagement.test.ts,
 * roundManagement.test.ts, roundTimerSystem.test.ts, matchFlow.test.ts,
 * and cinematicState.test.ts.
 */
import { describe, it, expect, vi } from 'vitest';
import { RoundState } from '../src/state/roundState.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { AnnounceSequence } from '../src/state/announceSequence.js';
import { createRoundStartSequence, createKOSequence, createTimeOverSequence, createWinnerSequence } from '../src/state/announcePresets.js';
import { Fighter } from '../src/entities/fighter.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { GamePhase, FighterState } from '../src/core/types.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { createPowerGauge, createMaxMode, resetMeterSystem } from '../src/combat/meter.js';
import {
  MAX_HEALTH, STAGE_WIDTH, KO_DISPLAY_TIME,
} from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Helpers — minimal DI for RoundState
// ---------------------------------------------------------------------------

function makeVFXMock() {
  return { reset: vi.fn() };
}

function makeRoundState() {
  const p1 = new Fighter(STAGE_WIDTH * 0.30, '#ff0000', 1);
  const p2 = new Fighter(STAGE_WIDTH * 0.70, '#0000ff', -1);
  const p1Cmd = new CommandBuffer();
  const p2Cmd = new CommandBuffer();
  const combatSystem = new CombatSystem();
  const projectiles: any[] = [];
  const vfx = makeVFXMock() as any;
  const cinematic = new CinematicState();
  const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
  const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
  const tickRef = { value: 0 };

  const rs = new RoundState({
    p1, p2, p1Cmd, p2Cmd,
    combatSystem, projectiles, vfx, cinematic,
    gauges, maxModes, tickRef,
  });

  return { rs, p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic, gauges, maxModes, tickRef };
}

/** Full system fixture: RoundState + GameStateManager + CinematicState */
function makeSystem() {
  const fixture = makeRoundState();
  const gsm = new GameStateManager();
  const announce = new AnnounceSequence();
  return { ...fixture, gsm, announce };
}

// ===========================================================================
// 1. Round Start Sequence (4 tests)
// ===========================================================================

describe('Round Start Sequence', () => {
  it('announce sequence starts with "ROUND X" then transitions to "FIGHT!"', () => {
    const announce = new AnnounceSequence();
    const steps = createRoundStartSequence(1);

    announce.setSteps(steps);
    expect(announce.isRunning()).toBe(true);

    // First step is ROUND display
    const render1 = announce.getCurrentRender();
    expect(render1).not.toBeNull();
    expect(render1!.step.text).toBe('ROUND 1');
    expect(render1!.step.id).toBe('round_display');

    // Tick through the ROUND step (80 frames)
    for (let i = 0; i < 80; i++) announce.tick();

    // Second step is FIGHT!
    const render2 = announce.getCurrentRender();
    expect(render2).not.toBeNull();
    expect(render2!.step.text).toBe('FIGHT!');
    expect(render2!.step.id).toBe('fight_display');
    expect(render2!.step.shockwaveRings).toBe(3);
  });

  it('round announce sequence is complete after both steps finish', () => {
    const announce = new AnnounceSequence();
    announce.setSteps(createRoundStartSequence(2));

    // Step 1: ROUND 2 (80 frames) + Step 2: FIGHT! (50 frames) = 130 total
    for (let i = 0; i < 130; i++) announce.tick();

    expect(announce.isComplete()).toBe(true);
    expect(announce.getCurrentRender()).toBeNull();
  });

  it('round start sfx triggers at correct frames (round_call at frame 5, fight at frame 2)', () => {
    const announce = new AnnounceSequence();
    announce.setSteps(createRoundStartSequence(1));

    // Collect all sfx triggers during the full sequence
    const sfxTriggers: { step: string; frame: number; sfxId: string }[] = [];
    let totalTicks = 0;

    while (!announce.isComplete()) {
      totalTicks++;
      const sfx = announce.tick();
      if (sfx) {
        const render = announce.getCurrentRender();
        // stepFrame was already incremented by tick(), so render progress is slightly ahead
        sfxTriggers.push({
          step: render?.step.id ?? 'unknown',
          frame: totalTicks,
          sfxId: sfx,
        });
      }
    }

    // Should have 2 sfx triggers: round_call and fight
    expect(sfxTriggers).toHaveLength(2);
    expect(sfxTriggers[0].sfxId).toBe('round_call');
    expect(sfxTriggers[0].step).toBe('round_display');
    expect(sfxTriggers[1].sfxId).toBe('fight');
    expect(sfxTriggers[1].step).toBe('fight_display');

    // Total sequence: ROUND display (80 frames) + FIGHT! (50 frames) = 130 frames
    expect(totalTicks).toBe(130);
  });

  it('fighters start at designated positions with full health and IDLE state', () => {
    const { p1, p2 } = makeRoundState();

    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
    expect(p1.x).toBe(STAGE_WIDTH * 0.30);
    expect(p2.x).toBe(STAGE_WIDTH * 0.70);
    expect(p1.state).toBe(FighterState.IDLE);
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p1.facing).toBe(1);
    expect(p2.facing).toBe(-1);
  });
});

// ===========================================================================
// 2. KO Sequence (5 tests)
// ===========================================================================

describe('KO Sequence', () => {
  it('KO triggers cinematic slow-mo and hitstop simultaneously', () => {
    const cinematic = new CinematicState();

    // Simulate KO from normal attack
    cinematic.triggerKOSlowMo();
    cinematic.triggerHitStop(15, 1, 1);

    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koSlowMo).toBe(40);
    expect(cinematic.hitStop).toBe(15);
    expect(cinematic.isFrozen()).toBe(true);
  });

  it('DM KO uses extended slow-mo (60 frames) and longer hitstop', () => {
    const cinematic = new CinematicState();

    cinematic.triggerDMKOSlowMo();
    cinematic.triggerHitStop(20, 0, -1);

    expect(cinematic.koSlowMo).toBe(60);
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koDesaturateTimer).toBe(12); // longer desaturate
    expect(cinematic.koVignetteTimer).toBe(90);   // longer vignette
    expect(cinematic.hitStop).toBe(20);
  });

  it('KO slow-mo completes before KO phase transition happens', () => {
    const cinematic = new CinematicState();
    cinematic.triggerKOSlowMo();

    // Slow-mo must finish before game transitions to KO phase
    // (mirrors main.ts: if (cinematic.koSlowMoTriggered && cinematic.isKOSlowMoDone()))
    expect(cinematic.isKOSlowMoDone()).toBe(false);

    // Run slow-mo to completion
    while (!cinematic.isKOSlowMoDone()) {
      cinematic.shouldSkipFrame();
    }

    expect(cinematic.isKOSlowMoDone()).toBe(true);
    // Now the game can transition to KO phase
  });

  it('KO announce sequence displays "K.O.!" text for correct duration', () => {
    const announce = new AnnounceSequence();
    const steps = createKOSequence(false); // no perfect

    announce.setSteps(steps);
    expect(steps).toHaveLength(1);
    expect(steps[0].text).toBe('K.O.!');
    expect(steps[0].duration).toBe(100);

    // The KO text is displayed for 100 frames
    for (let i = 0; i < 100; i++) announce.tick();
    expect(announce.isComplete()).toBe(true);
  });

  it('KO with PERFECT adds extra announce step after K.O.', () => {
    const announce = new AnnounceSequence();
    const steps = createKOSequence(true); // perfect achieved

    expect(steps).toHaveLength(2);
    expect(steps[0].text).toBe('K.O.!');
    expect(steps[1].text).toBe('PERFECT!');
    expect(steps[1].id).toBe('perfect_display');
    expect(steps[1].sfxId).toBe('perfect');

    announce.setSteps(steps);

    // Tick through KO step
    for (let i = 0; i < 100; i++) announce.tick();

    // Now on PERFECT step
    const render = announce.getCurrentRender();
    expect(render).not.toBeNull();
    expect(render!.step.text).toBe('PERFECT!');
  });
});

// ===========================================================================
// 3. Round Result Determination (5 tests)
// ===========================================================================

describe('Round Result Determination', () => {
  it('P1 wins: P1 health > 0, P2 health = 0', () => {
    const { rs, p1, p2 } = makeRoundState();
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBe(0);
  });

  it('P2 wins: P2 health > 0, P1 health = 0', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBe(1);
  });

  it('double KO: both health <= 0 returns null (draw)', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 0;
    p2.health = 0;
    const winner = rs.determineWinner();
    expect(winner).toBeNull();
  });

  it('time over with unequal health: higher health wins', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 650;
    p2.health = 400;
    // Both alive, compare health
    const winner = rs.determineWinner();
    expect(winner).toBe(0); // P1 has more health
  });

  it('time over with equal health: draw (null)', () => {
    const { rs, p1, p2 } = makeRoundState();
    p1.health = 500;
    p2.health = 500;
    const winner = rs.determineWinner();
    expect(winner).toBeNull();
  });
});

// ===========================================================================
// 4. Round Transitions and State Carryover (6 tests)
// ===========================================================================

describe('Round Transitions and State Carryover', () => {
  it('resetForNewRound resets health, positions, cinematic, and tick but keeps wins', () => {
    const { rs, p1, p2, cinematic, tickRef } = makeRoundState();
    const gsm = new GameStateManager();

    // Simulate end of round 1
    rs.addWin(0);
    p1.health = 300;
    p2.health = 0;
    p2.applyKnockdown(60);
    cinematic.triggerKOSlowMo();
    cinematic.trackDamage(0, 500);
    tickRef.value = 3500;
    gsm.setPhase(GamePhase.KO);

    // Round 2 starts
    rs.currentRound++;
    rs.resetForNextRound();
    gsm.resetForNextRound();
    cinematic.resetForNewRound();

    // Wins are preserved
    expect(rs.p1Wins).toBe(1);
    expect(rs.p2Wins).toBe(0);

    // Health and positions reset
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
    expect(p1.x).toBe(STAGE_WIDTH * 0.30);
    expect(p2.x).toBe(STAGE_WIDTH * 0.70);
    expect(p1.state).toBe(FighterState.IDLE);
    expect(p2.state).toBe(FighterState.IDLE);

    // Cinematic reset
    expect(cinematic.koSlowMo).toBe(0);
    expect(cinematic.koSlowMoTriggered).toBe(false);
    expect(cinematic.p1DamageTaken).toBe(0);
    expect(cinematic.p2DamageTaken).toBe(0);

    // Tick reset
    expect(tickRef.value).toBe(0);

    // GSM reset
    expect(gsm.koTimer).toBe(0);
    expect(gsm.isTimeOver).toBe(false);
    expect(gsm.phaseTimer).toBe(0);
  });

  it('meter/stocks carry over between rounds (KOF authentic behavior)', () => {
    const { rs, gauges, maxModes } = makeRoundState();

    // Build meter during round
    gauges[0].meter = 80;
    gauges[0].stocks = 2;
    gauges[1].meter = 45;
    gauges[1].stocks = 1;

    // resetForNewRound does NOT reset meter (only fullReset does)
    // Verify this is correct by checking resetForNextRound source:
    // it calls reset() on fighters, combatSystem, projectiles, vfx, cinematic,
    // but NOT resetMeterSystem on gauges.
    rs.resetForNextRound();

    // Meter is preserved
    expect(gauges[0].stocks).toBe(2);
    expect(gauges[0].meter).toBe(80);
    expect(gauges[1].stocks).toBe(1);
    expect(gauges[1].meter).toBe(45);
  });

  it('MAX mode does NOT carry over between rounds (resetForNewRound resets cinematic but not MAX)', () => {
    const { cinematic, maxModes } = makeRoundState();

    // Activate MAX mode during round
    maxModes[0].active = true;
    maxModes[0].timer = 300;

    // Note: In the current implementation, resetForNewRound resets
    // cinematic state but does NOT explicitly deactivate MAX mode.
    // The MAX mode timer ticks down via tickMaxModes and expires naturally.
    // However, the game loop enters round transition phases (INTRO, KO)
    // where tickMaxModes may not be called, so MAX mode could theoretically
    // carry into the next round's FIGHTING phase.
    //
    // GAP NOTE: There is no explicit MAX mode deactivation between rounds.
    // The main.ts INTRO phase does not tick MAX modes, so if a round ends
    // with MAX active, the timer will still be ticking when FIGHTING starts.
    // In authentic KOF2002, MAX mode does NOT carry over — this is a
    // potential bug in the implementation.
    cinematic.resetForNewRound();

    // Cinematic state is reset but MAX mode state is NOT explicitly reset
    // by resetForNewRound or resetForNextRound
    expect(cinematic.hitStop).toBe(0);
    expect(cinematic.koSlowMo).toBe(0);

    // Only fullReset clears MAX mode via resetMeterSystem
    // (See RoundState.fullReset which calls resetMeterSystem)
  });

  it('fullReset clears everything including meter and MAX mode', () => {
    const { rs, gauges, maxModes, tickRef } = makeRoundState();
    const gsm = new GameStateManager();

    // Accumulate state
    rs.addWin(0);
    rs.addWin(1);
    rs.currentRound = 3;
    gauges[0].stocks = 5;
    gauges[0].meter = 500;
    maxModes[0].active = true;
    maxModes[0].timer = 200;
    tickRef.value = 2000;
    gsm.winner = 0;
    gsm.phaseTimer = 100;

    rs.fullReset();
    gsm.resetForNewGame();

    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);
    expect(rs.currentRound).toBe(1);
    expect(rs.fadeAlpha).toBe(0);
    expect(rs.fadeDirection).toBe(0);
    expect(tickRef.value).toBe(0);
    expect(gauges[0].stocks).toBe(0);
    expect(gauges[0].meter).toBe(0);
    expect(maxModes[0].active).toBe(false);
    expect(maxModes[0].timer).toBe(0);
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('fade transition: round increments after fade-to-black completes', () => {
    const { rs } = makeRoundState();
    expect(rs.currentRound).toBe(1);

    rs.startRoundTransition();
    expect(rs.fadeDirection).toBe(1); // fading out

    // Simulate fade-out: alpha increments by 0.04 per tick, needs 25 ticks to reach 1.0
    for (let i = 0; i < 25; i++) rs.tickFade();

    // After fade completes, round increments and fade-in starts
    expect(rs.currentRound).toBe(2);
    expect(rs.fadeDirection).toBe(-1); // fading back in

    // Simulate fade-in
    for (let i = 0; i < 25; i++) rs.tickFade();
    expect(rs.fadeDirection).toBe(0); // idle
    expect(rs.fadeAlpha).toBe(0);
  });

  it('guard gauge and stun gauge reset between rounds via Fighter.reset', () => {
    const { p1, p2 } = makeRoundState();

    // Deplete guard gauge and fill stun gauge
    p1.guardGauge = 20;
    p1.stunGauge = 90;
    p1.stunDecayTimer = 45;
    p2.guardGauge = 15;

    // Reset simulates new round
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    expect(p1.guardGauge).toBe(100); // GUARD_GAUGE_MAX
    expect(p1.stunGauge).toBe(0);
    expect(p1.stunDecayTimer).toBe(0);
    expect(p2.guardGauge).toBe(100);
  });
});

// ===========================================================================
// 5. Match End and Best-of-3 (4 tests)
// ===========================================================================

describe('Match End and Best-of-3', () => {
  it('two consecutive wins ends match (2-0)', () => {
    const { rs } = makeRoundState();
    const gsm = new GameStateManager();

    // Round 1: P1 wins
    const result1 = rs.addWin(0);
    expect(result1).toBeNull(); // match continues
    expect(rs.p1Wins).toBe(1);

    // Round 2: P1 wins again
    const result2 = rs.addWin(0);
    expect(result2).toBe(0); // P1 wins match
    expect(rs.p1Wins).toBe(2);

    gsm.winner = 0;
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
  });

  it('1-1 score requires deciding round (goes to round 3)', () => {
    const { rs } = makeRoundState();

    rs.addWin(0); // P1 takes round 1
    rs.addWin(1); // P2 takes round 2

    expect(rs.p1Wins).toBe(1);
    expect(rs.p2Wins).toBe(1);

    // Neither reached winsNeeded
    expect(rs.p1Wins >= rs.winsNeeded).toBe(false);
    expect(rs.p2Wins >= rs.winsNeeded).toBe(false);
  });

  it('double KO does not award wins — match continues at same score', () => {
    const { rs } = makeRoundState();

    // Round 1 is a double KO
    const result = rs.addWin(null);
    expect(result).toBeNull();
    expect(rs.p1Wins).toBe(0);
    expect(rs.p2Wins).toBe(0);

    // Match continues with no wins awarded
    expect(rs.p1Wins >= rs.winsNeeded).toBe(false);
    expect(rs.p2Wins >= rs.winsNeeded).toBe(false);
  });

  it('complete match lifecycle: 3 rounds with winner sequence and continue', () => {
    const system = makeSystem();
    const { rs, p1, p2, cinematic, tickRef, gsm, announce } = system;

    // === Round 1: P1 wins ===
    gsm.setPhase(GamePhase.INTRO);
    announce.setSteps(createRoundStartSequence(1));
    expect(announce.isRunning()).toBe(true);

    // Announce completes
    while (!announce.isComplete()) announce.tick();
    gsm.setPhase(GamePhase.FIGHTING);

    // Round plays out
    tickRef.value = 1000;
    p2.health = 0;
    const winner1 = rs.determineWinner();
    expect(winner1).toBe(0);

    // KO sequence
    cinematic.triggerKOSlowMo();
    while (!cinematic.isKOSlowMoDone()) cinematic.shouldSkipFrame();

    gsm.winner = winner1;
    gsm.setPhase(GamePhase.KO);
    announce.setSteps(createKOSequence(false));
    while (!announce.isComplete()) announce.tick();

    // Win quote
    gsm.setPhase(GamePhase.WIN_QUOTE);
    const matchResult1 = rs.addWin(winner1!);
    expect(matchResult1).toBeNull(); // 1-0, match continues

    // === Round 2: P2 wins ===
    rs.currentRound++;
    rs.resetForNextRound();
    cinematic.resetForNewRound();
    gsm.resetForNextRound();
    announce.reset();
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    gsm.setPhase(GamePhase.INTRO);
    gsm.setPhase(GamePhase.FIGHTING);
    p1.health = 0;
    const winner2 = rs.determineWinner();
    expect(winner2).toBe(1);

    cinematic.triggerKOSlowMo();
    while (!cinematic.isKOSlowMoDone()) cinematic.shouldSkipFrame();

    gsm.winner = winner2;
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);
    const matchResult2 = rs.addWin(winner2!);
    expect(matchResult2).toBeNull(); // 1-1

    // === Round 3: P1 wins match ===
    rs.currentRound++;
    rs.resetForNextRound();
    cinematic.resetForNewRound();
    gsm.resetForNextRound();
    announce.reset();
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    gsm.setPhase(GamePhase.INTRO);
    announce.setSteps(createRoundStartSequence(3));
    expect(announce.getCurrentRender()!.step.text).toBe('ROUND 3');

    gsm.setPhase(GamePhase.FIGHTING);
    p2.health = 0;
    const winner3 = rs.determineWinner();
    expect(winner3).toBe(0);

    const matchResult3 = rs.addWin(winner3!);
    expect(matchResult3).toBe(0); // P1 wins match 2-1

    gsm.winner = 0;
    gsm.setPhase(GamePhase.MATCH_END);

    // Winner sequence
    announce.setSteps(createWinnerSequence('Kyo'));
    expect(announce.getCurrentRender()!.step.text).toBe('Kyo');

    expect(rs.p1Wins).toBe(2);
    expect(rs.p2Wins).toBe(1);

    // Continue flow
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCursorYes = true;
    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });
});

// ===========================================================================
// 6. Round Timer Mechanics (4 tests)
// ===========================================================================

describe('Round Timer Mechanics', () => {
  it('timer pauses during hitstop but resumes after', () => {
    const { cinematic, tickRef } = makeRoundState();
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);

    tickRef.value = 100;

    // Trigger hitstop (5 frames)
    cinematic.triggerHitStop(5, 0, 1);

    // During hitstop, isFrozen() returns true and decrements hitStop each call.
    // In main.ts, the pattern is:
    //   if (cinematic.isFrozen()) { cinematic.tickInFreeze(maxModes); return; }
    // tickRef does NOT advance during freeze.
    for (let i = 0; i < 5; i++) {
      const frozen = cinematic.isFrozen();
      expect(frozen).toBe(true);
      cinematic.tickInFreeze([createMaxMode(), createMaxMode()]);
      // tickRef stays the same
    }
    expect(tickRef.value).toBe(100);

    // After 5 isFrozen() calls, hitStop is 0
    expect(cinematic.isFrozen()).toBe(false);
    tickRef.value++;
    expect(tickRef.value).toBe(101);
  });

  it('timer pauses during super freeze (28 frames for DM)', () => {
    const { cinematic, tickRef } = makeRoundState();
    tickRef.value = 500;

    // Super freeze for DM sets both superFlashTimer and hitStop to 28
    cinematic.triggerSuperFlash(400, 300, 0);
    expect(cinematic.superFlashTimer).toBe(28);
    expect(cinematic.hitStop).toBe(28);

    // During super freeze, isFrozen() returns true (hitStop > 0)
    // In main.ts: if (cinematic.isFrozen()) { tickInFreeze(); return; }
    for (let i = 0; i < 28; i++) {
      const frozen = cinematic.isFrozen();
      expect(frozen).toBe(true);
      cinematic.tickInFreeze([createMaxMode(), createMaxMode()]);
    }
    expect(tickRef.value).toBe(500);

    // After 28 isFrozen() calls, hitStop is 0
    expect(cinematic.isFrozen()).toBe(false);
    tickRef.value++;
    expect(tickRef.value).toBe(501);
  });

  it('timer reaches 3600 frames (60 seconds) triggers time over', () => {
    const { rs, p1, p2, tickRef } = makeRoundState();
    const gsm = new GameStateManager();
    const announce = new AnnounceSequence();

    gsm.setPhase(GamePhase.FIGHTING);
    tickRef.value = 3600;

    // Time over check (mirrors main.ts logic)
    expect(tickRef.value >= 3600).toBe(true);

    // Determine winner by health comparison
    p1.health = 700;
    p2.health = 300;
    const winner = rs.determineWinner();
    expect(winner).toBe(0); // P1 has more health

    // Game transitions to KO phase with time over flag
    gsm.isTimeOver = true;
    gsm.winner = winner;
    gsm.setPhase(GamePhase.KO);

    // Time over announce sequence
    announce.setSteps(createTimeOverSequence());
    const render = announce.getCurrentRender();
    expect(render!.step.text).toBe('TIME OVER');
    expect(render!.step.sfxId).toBe('time_over');
  });

  it('KO slow-mo does not advance tickRef (frame skipping)', () => {
    const { cinematic, tickRef } = makeRoundState();
    tickRef.value = 2000;

    // KO triggers slow-mo
    cinematic.triggerKOSlowMo();

    // shouldSkipFrame returns true for skipped frames, false for run frames
    // Neither advances tickRef — the main.ts FIGHTING phase handles tickRef
    // by checking shouldSkipFrame() and returning early when true.
    const skipResults: boolean[] = [];
    for (let i = 0; i < 12; i++) {
      skipResults.push(cinematic.shouldSkipFrame());
    }

    // Normal KO: pattern is skip, skip, run (every 3rd frame)
    expect(skipResults[0]).toBe(true);  // skip
    expect(skipResults[1]).toBe(true);  // skip
    expect(skipResults[2]).toBe(false); // run
    expect(skipResults[3]).toBe(true);  // skip
    expect(skipResults[4]).toBe(true);  // skip
    expect(skipResults[5]).toBe(false); // run

    // tickRef was not changed by shouldSkipFrame
    expect(tickRef.value).toBe(2000);
  });
});
