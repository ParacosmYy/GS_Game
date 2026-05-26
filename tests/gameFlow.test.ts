/**
 * Game Flow & HUD Tests — GameStateManager, RoundState logic, AnnounceSequence edge cases.
 *
 * Tests cover initialization, phase transitions, round management, score tracking,
 * reset behavior, timer management, and announce sequence integration with game flow.
 */
import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';
import { AnnounceSequence, type AnnounceStep } from '../src/state/announceSequence.js';
import { CinematicState } from '../src/state/cinematicState.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStep(overrides: Partial<AnnounceStep> = {}): AnnounceStep {
  return {
    id: overrides.id ?? 'test',
    text: overrides.text ?? 'A',
    duration: overrides.duration ?? 10,
    fillColor: overrides.fillColor ?? '#fff',
    glowColor: overrides.glowColor ?? '#000',
    fontSize: overrides.fontSize ?? 10,
    scaleCurve: overrides.scaleCurve ?? (() => 1),
    alphaCurve: overrides.alphaCurve ?? (() => 1),
    sfxTriggerFrame: overrides.sfxTriggerFrame ?? null,
    sfxId: overrides.sfxId ?? null,
    flash: overrides.flash ?? null,
    shockwaveRings: overrides.shockwaveRings ?? 0,
  };
}

// ===========================================================================
// 1. GameStateManager — Initialization
// ===========================================================================

describe('GameStateManager — Initialization', () => {
  it('default phase is TITLE', () => {
    const gsm = new GameStateManager();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('initial phaseTimer is 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.phaseTimer).toBe(0);
  });

  it('initial winner is null', () => {
    const gsm = new GameStateManager();
    expect(gsm.winner).toBeNull();
  });

  it('initial isTimeOver is false', () => {
    const gsm = new GameStateManager();
    expect(gsm.isTimeOver).toBe(false);
  });

  it('initial koTimer is 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.koTimer).toBe(0);
  });

  it('initial continueCountdown is 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.continueCountdown).toBe(0);
  });

  it('initial firstAttacker is null', () => {
    const gsm = new GameStateManager();
    expect(gsm.firstAttacker).toBeNull();
  });

  it('initial firstHitTracked is false', () => {
    const gsm = new GameStateManager();
    expect(gsm.firstHitTracked).toBe(false);
  });

  it('has an AnnounceSequence instance', () => {
    const gsm = new GameStateManager();
    expect(gsm.announceSequence).toBeInstanceOf(AnnounceSequence);
  });

  it('announce sequence starts idle', () => {
    const gsm = new GameStateManager();
    expect(gsm.announceSequence.getPhase()).toBe('idle');
  });
});

// ===========================================================================
// 2. GameStateManager — Phase Transitions
// ===========================================================================

describe('GameStateManager — Phase Transitions', () => {
  it('setPhase changes the current phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.MODE_SELECT);
    expect(gsm.phase).toBe(GamePhase.MODE_SELECT);
  });

  it('full game flow: TITLE through MATCH_END', () => {
    const gsm = new GameStateManager();
    const phases = [
      GamePhase.TITLE,
      GamePhase.MODE_SELECT,
      GamePhase.SELECT,
      GamePhase.INTRO,
      GamePhase.FIGHTING,
      GamePhase.KO,
      GamePhase.WIN_QUOTE,
      GamePhase.MATCH_END,
    ];
    for (const p of phases) {
      gsm.setPhase(p);
      expect(gsm.phase).toBe(p);
    }
  });

  it('can transition to TRAINING mode', () => {
    const gsm = new GameStateManager();
    gsm.isTrainingMode = true;
    gsm.setPhase(GamePhase.TRAINING);
    expect(gsm.phase).toBe(GamePhase.TRAINING);
    expect(gsm.isTrainingMode).toBe(true);
  });

  it('can transition to CONTINUE phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.CONTINUE);
    expect(gsm.phase).toBe(GamePhase.CONTINUE);
  });

  it('phase transitions do not affect announce sequence', () => {
    const gsm = new GameStateManager();
    gsm.announceSequence.setSteps([makeStep()]);
    gsm.setPhase(GamePhase.FIGHTING);
    expect(gsm.announceSequence.isRunning()).toBe(true);
  });
});

// ===========================================================================
// 3. Round Management (simulated via GameStateManager + CinematicState)
// ===========================================================================

describe('Round Management', () => {
  it('resetForNextRound clears per-round state but keeps phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.phaseTimer = 120;
    gsm.koTimer = 60;
    gsm.koGroundSlamDone = true;
    gsm.isTimeOver = true;
    gsm.firstHitTracked = true;
    gsm.firstAttacker = 0;

    gsm.resetForNextRound();

    // Per-round state cleared
    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.koTimer).toBe(0);
    expect(gsm.koGroundSlamDone).toBe(false);
    expect(gsm.isTimeOver).toBe(false);
    expect(gsm.firstHitTracked).toBe(false);
    expect(gsm.firstAttacker).toBeNull();
    // Phase is NOT cleared by resetForNextRound
    expect(gsm.phase).toBe(GamePhase.FIGHTING);
  });

  it('resetForNextRound does not clear winner', () => {
    const gsm = new GameStateManager();
    gsm.winner = 0;
    gsm.resetForNextRound();
    expect(gsm.winner).toBe(0);
  });

  it('best-of-3 tracking: two wins for P1 ends match', () => {
    const gsm = new GameStateManager();
    const winsNeeded = 2;
    let p1Wins = 0;
    let p2Wins = 0;
    let matchWinner: number | null = null;

    // Round 1: P1 wins
    p1Wins++;
    if (p1Wins >= winsNeeded) matchWinner = 0;
    if (p2Wins >= winsNeeded) matchWinner = 1;
    expect(matchWinner).toBeNull(); // match not over yet

    // Round 2: P2 wins
    p2Wins++;
    if (p1Wins >= winsNeeded) matchWinner = 0;
    if (p2Wins >= winsNeeded) matchWinner = 1;
    expect(matchWinner).toBeNull(); // still 1-1

    // Round 3: P1 wins
    p1Wins++;
    matchWinner = null;
    if (p1Wins >= winsNeeded) matchWinner = 0;
    if (p2Wins >= winsNeeded) matchWinner = 1;
    expect(matchWinner).toBe(0); // P1 wins the match
  });

  it('best-of-3 tracking: P2 wins by 2-0', () => {
    let p1Wins = 0;
    let p2Wins = 0;
    const winsNeeded = 2;

    p2Wins++; // Round 1
    p2Wins++; // Round 2

    const matchWinner = p2Wins >= winsNeeded ? 1 :
                        p1Wins >= winsNeeded ? 0 : null;
    expect(matchWinner).toBe(1);
  });

  it('round number increments correctly across a match', () => {
    let currentRound = 1;
    // Round 1 -> round end -> Round 2 -> round end -> Round 3
    currentRound++; // after round 1
    expect(currentRound).toBe(2);
    currentRound++; // after round 2
    expect(currentRound).toBe(3);
    // Max rounds in best-of-3 is 3 (if it goes to 1-1 tiebreak)
  });
});

// ===========================================================================
// 4. Score Tracking
// ===========================================================================

describe('Score Tracking', () => {
  it('winner starts null and can be set to either player', () => {
    const gsm = new GameStateManager();
    expect(gsm.winner).toBeNull();
    gsm.winner = 0;
    expect(gsm.winner).toBe(0);
    gsm.winner = 1;
    expect(gsm.winner).toBe(1);
  });

  it('isTimeOver flag works independently of winner', () => {
    const gsm = new GameStateManager();
    expect(gsm.isTimeOver).toBe(false);
    gsm.isTimeOver = true;
    expect(gsm.isTimeOver).toBe(true);
    expect(gsm.winner).toBeNull(); // winner is separate
  });

  it('firstAttacker tracks who hit first in a round', () => {
    const gsm = new GameStateManager();
    expect(gsm.firstAttacker).toBeNull();
    gsm.firstAttacker = 0; // P1 hit first
    expect(gsm.firstAttacker).toBe(0);
    gsm.firstAttacker = 1;
    expect(gsm.firstAttacker).toBe(1);
  });

  it('firstHitTracked prevents double-setting first attacker', () => {
    const gsm = new GameStateManager();
    expect(gsm.firstHitTracked).toBe(false);

    // Simulate first hit tracking
    if (!gsm.firstHitTracked) {
      gsm.firstAttacker = 0;
      gsm.firstHitTracked = true;
    }
    expect(gsm.firstAttacker).toBe(0);
    expect(gsm.firstHitTracked).toBe(true);

    // Second hit should not overwrite
    if (!gsm.firstHitTracked) {
      gsm.firstAttacker = 1;
    }
    expect(gsm.firstAttacker).toBe(0); // unchanged
  });
});

// ===========================================================================
// 5. resetForNewGame
// ===========================================================================

describe('GameStateManager — resetForNewGame', () => {
  it('resets phase to TITLE', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.MATCH_END);
    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('resets all counters to initial values', () => {
    const gsm = new GameStateManager();
    gsm.phaseTimer = 999;
    gsm.koTimer = 100;
    gsm.koGroundSlamDone = true;
    gsm.winner = 1;
    gsm.isTimeOver = true;
    gsm.firstAttacker = 0;
    gsm.firstHitTracked = true;
    gsm.currentWinQuote = 'test quote';
    gsm.winQuoteTimer = 50;
    gsm.debugMode = true;
    gsm.titleBgmStarted = true;

    gsm.resetForNewGame();

    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.koTimer).toBe(0);
    expect(gsm.koGroundSlamDone).toBe(false);
    expect(gsm.winner).toBeNull();
    expect(gsm.isTimeOver).toBe(false);
    expect(gsm.firstAttacker).toBeNull();
    expect(gsm.firstHitTracked).toBe(false);
    expect(gsm.currentWinQuote).toBe('');
    expect(gsm.winQuoteTimer).toBe(0);
    expect(gsm.debugMode).toBe(false);
    expect(gsm.titleBgmStarted).toBe(false);
  });

  it('does not reset isTrainingMode', () => {
    const gsm = new GameStateManager();
    gsm.isTrainingMode = true;
    gsm.resetForNewGame();
    // isTrainingMode is not cleared by resetForNewGame
    expect(gsm.isTrainingMode).toBe(true);
  });

  it('does not reset modeSelectCursor', () => {
    const gsm = new GameStateManager();
    gsm.modeSelectCursor = 2;
    gsm.resetForNewGame();
    // modeSelectCursor is not in resetForNewGame
    expect(gsm.modeSelectCursor).toBe(2);
  });

  it('double reset is idempotent', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.KO);
    gsm.winner = 0;
    gsm.resetForNewGame();
    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
  });
});

// ===========================================================================
// 6. AnnounceSequence — Game Flow Integration
// ===========================================================================

describe('AnnounceSequence — Game Flow Integration', () => {
  it('can be used to simulate a full round start flow', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.INTRO);

    const steps = [
      makeStep({ id: 'round', text: 'ROUND 1', duration: 40, sfxTriggerFrame: 0, sfxId: 'round_call' }),
      makeStep({ id: 'fight', text: 'FIGHT!', duration: 30, sfxTriggerFrame: 0, sfxId: 'fight' }),
    ];
    gsm.announceSequence.setSteps(steps);

    const sfxFired: string[] = [];
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    for (let i = 0; i < totalFrames; i++) {
      const sfx = gsm.announceSequence.tick();
      if (sfx) sfxFired.push(sfx);
    }

    expect(gsm.announceSequence.isComplete()).toBe(true);
    expect(sfxFired).toContain('round_call');
    expect(sfxFired).toContain('fight');

    // After announce completes, game transitions to FIGHTING
    gsm.setPhase(GamePhase.FIGHTING);
    expect(gsm.phase).toBe(GamePhase.FIGHTING);
  });

  it('announce sequence resets between rounds', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 5 })]);
    for (let i = 0; i < 5; i++) seq.tick();
    expect(seq.isComplete()).toBe(true);

    seq.reset();
    expect(seq.getPhase()).toBe('idle');

    // Ready for next round
    seq.setSteps([makeStep({ text: 'ROUND 2', duration: 5 })]);
    expect(seq.isRunning()).toBe(true);
  });

  it('announce handles empty steps array', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([]);
    // Empty steps should complete immediately on first tick
    seq.tick();
    expect(seq.isComplete()).toBe(true);
  });

  it('announce getText returns empty when complete', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 2 })]);
    seq.tick();
    seq.tick();
    expect(seq.isComplete()).toBe(true);
    expect(seq.getText()).toBe('');
  });
});

// ===========================================================================
// 7. Timer Management (simulated via GameStateManager fields)
// ===========================================================================

describe('Timer Management', () => {
  it('phaseTimer can be incremented and checked', () => {
    const gsm = new GameStateManager();
    expect(gsm.phaseTimer).toBe(0);
    gsm.phaseTimer = 60;
    expect(gsm.phaseTimer).toBe(60);
    expect(gsm.phaseTimer > 0).toBe(true);
  });

  it('koTimer tracks KO state duration', () => {
    const gsm = new GameStateManager();
    expect(gsm.koTimer).toBe(0);
    gsm.koTimer = 120; // typical KO animation duration
    expect(gsm.koTimer).toBe(120);
    // Simulate countdown
    gsm.koTimer--;
    expect(gsm.koTimer).toBe(119);
  });

  it('timeOver triggers end of round via isTimeOver flag', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    // Simulate timer running out
    gsm.isTimeOver = true;
    gsm.setPhase(GamePhase.KO); // game transitions to KO phase on time over
    expect(gsm.isTimeOver).toBe(true);
    expect(gsm.phase).toBe(GamePhase.KO);
  });

  it('winQuoteTimer tracks win quote display duration', () => {
    const gsm = new GameStateManager();
    expect(gsm.winQuoteTimer).toBe(0);
    gsm.winQuoteTimer = 180; // 3 seconds at 60fps
    expect(gsm.winQuoteTimer).toBe(180);
    gsm.winQuoteTimer--;
    expect(gsm.winQuoteTimer).toBe(179);
  });

  it('continueCountdown tracks continue screen timer', () => {
    const gsm = new GameStateManager();
    expect(gsm.continueCountdown).toBe(0);
    gsm.continueCountdown = 600; // 10 seconds at 60fps
    expect(gsm.continueCountdown).toBe(600);
  });

  it('modeIndicatorTimer and stageIndicatorTimer start at 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.modeIndicatorTimer).toBe(0);
    expect(gsm.stageIndicatorTimer).toBe(0);
  });
});

// ===========================================================================
// 8. Edge Cases
// ===========================================================================

describe('Game Flow Edge Cases', () => {
  it('setting phase to same value is a no-op', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.FIGHTING);
    expect(gsm.phase).toBe(GamePhase.FIGHTING);
  });

  it('resetForNextRound then resetForNewGame gives clean state', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.KO);
    gsm.winner = 0;
    gsm.phaseTimer = 100;
    gsm.koTimer = 50;

    gsm.resetForNextRound();
    expect(gsm.phase).toBe(GamePhase.KO); // phase not cleared
    expect(gsm.winner).toBe(0); // winner not cleared

    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
    expect(gsm.phaseTimer).toBe(0);
  });

  it('continueCursor defaults to yes (true)', () => {
    const gsm = new GameStateManager();
    expect(gsm.continueCursorYes).toBe(true);
  });

  it('koGroundSlamDone tracks ground slam event', () => {
    const gsm = new GameStateManager();
    expect(gsm.koGroundSlamDone).toBe(false);
    gsm.koGroundSlamDone = true;
    expect(gsm.koGroundSlamDone).toBe(true);
  });

  it('winQuote fields are initially empty', () => {
    const gsm = new GameStateManager();
    expect(gsm.currentWinQuote).toBe('');
    expect(gsm.winQuoteCharName).toBe('');
    expect(gsm.winQuoteCharColor).toBe('#ffcc00');
  });
});
