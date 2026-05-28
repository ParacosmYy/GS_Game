import { describe, it, expect } from 'vitest';
import { GamePhase } from '../src/core/types.js';
import { GameStateManager } from '../src/state/gameStateManager.js';

describe('GamePhase enum completeness', () => {
  const phases = Object.values(GamePhase);

  it('has all required arcade flow phases', () => {
    const required = ['TITLE', 'MODE_SELECT', 'SELECT', 'INTRO', 'FIGHTING', 'KO', 'WIN_QUOTE', 'MATCH_END', 'NEXT_MATCH', 'CONTINUE', 'GAME_OVER'];
    for (const name of required) {
      expect(phases, `Missing phase: ${name}`).toContain(name);
    }
  });

  it('has training and options phases', () => {
    expect(phases).toContain('TRAINING');
    expect(phases).toContain('OPTIONS');
  });

  it('has stage intro and stage select phases', () => {
    expect(phases).toContain('STAGE_INTRO');
    expect(phases).toContain('STAGE_SELECT');
  });

  it('has team order phase', () => {
    expect(phases).toContain('TEAM_ORDER');
  });

  it('has at least 15 distinct phases', () => {
    expect(phases.length).toBeGreaterThanOrEqual(15);
  });
});

describe('GameStateManager state transitions', () => {
  it('starts at TITLE phase', () => {
    const gs = new GameStateManager();
    expect(gs.phase).toBe(GamePhase.TITLE);
  });

  it('setPhase transitions cleanly', () => {
    const gs = new GameStateManager();
    gs.setPhase(GamePhase.MODE_SELECT);
    expect(gs.phase).toBe(GamePhase.MODE_SELECT);
    gs.setPhase(GamePhase.SELECT);
    expect(gs.phase).toBe(GamePhase.SELECT);
  });

  it('resetForNewGame returns to TITLE', () => {
    const gs = new GameStateManager();
    gs.setPhase(GamePhase.FIGHTING);
    gs.winner = 0;
    gs.koTimer = 100;
    gs.debugMode = true;
    gs.resetForNewGame();
    expect(gs.phase).toBe(GamePhase.TITLE);
    expect(gs.winner).toBeNull();
    expect(gs.koTimer).toBe(0);
    expect(gs.debugMode).toBe(false);
  });

  it('resetForNextRound clears round-specific state', () => {
    const gs = new GameStateManager();
    gs.phaseTimer = 50;
    gs.koTimer = 30;
    gs.isTimeOver = true;
    gs.firstAttacker = 0;
    gs.resetForNextRound();
    expect(gs.phaseTimer).toBe(0);
    expect(gs.koTimer).toBe(0);
    expect(gs.isTimeOver).toBe(false);
    expect(gs.firstAttacker).toBeNull();
  });

  it('resetForNextRound does NOT change phase', () => {
    const gs = new GameStateManager();
    gs.setPhase(GamePhase.FIGHTING);
    gs.resetForNextRound();
    expect(gs.phase).toBe(GamePhase.FIGHTING);
  });

  it('togglePause toggles paused state', () => {
    const gs = new GameStateManager();
    expect(gs.isPaused).toBe(false);
    gs.togglePause();
    expect(gs.isPaused).toBe(true);
    expect(gs.pauseMenuCursor).toBe(0);
    gs.togglePause();
    expect(gs.isPaused).toBe(false);
  });

  it('unpause forces paused off', () => {
    const gs = new GameStateManager();
    gs.togglePause();
    expect(gs.isPaused).toBe(true);
    gs.unpause();
    expect(gs.isPaused).toBe(false);
  });

  it('startTransition sets transition state', () => {
    const gs = new GameStateManager();
    gs.startTransition('wipe', GamePhase.KO, GamePhase.WIN_QUOTE);
    expect(gs.transitionType).toBe('wipe');
    expect(gs.transitionFrom).toBe(GamePhase.KO);
    expect(gs.transitionTo).toBe(GamePhase.WIN_QUOTE);
    expect(gs.isTransitioning()).toBe(true);
  });

  it('isTransitioning returns false when no transition active', () => {
    const gs = new GameStateManager();
    expect(gs.isTransitioning()).toBe(false);
  });

  it('resetForNewGame clears transition state', () => {
    const gs = new GameStateManager();
    gs.startTransition('fade', GamePhase.MATCH_END, GamePhase.NEXT_MATCH);
    gs.resetForNewGame();
    expect(gs.transitionType).toBe('none');
    expect(gs.isTransitioning()).toBe(false);
  });

  it('resetStageSelect clears stage selection state', () => {
    const gs = new GameStateManager();
    gs.stageSelectCursor = 3;
    gs.stageSelectReady = true;
    gs.stageSelectConfirmed = 'temple';
    gs.resetStageSelect();
    expect(gs.stageSelectCursor).toBe(0);
    expect(gs.stageSelectReady).toBe(false);
    expect(gs.stageSelectConfirmed).toBeNull();
  });

  it('resetTeamOrder clears team order state', () => {
    const gs = new GameStateManager();
    gs.teamOrderCursor = 2;
    gs.teamOrderSwapMode = true;
    gs.teamOrderReady = [true, true];
    gs.resetTeamOrder();
    expect(gs.teamOrderCursor).toBe(0);
    expect(gs.teamOrderSwapMode).toBe(false);
    expect(gs.teamOrderReady).toEqual([false, false]);
  });

  it('recordDamage accumulates per-player damage', () => {
    const gs = new GameStateManager();
    gs.recordDamage(0, 100);
    gs.recordDamage(0, 50);
    gs.recordDamage(1, 80);
    expect(gs.matchStats.p1TotalDamage).toBe(150);
    expect(gs.matchStats.p2TotalDamage).toBe(80);
  });

  it('recordCombo keeps longest combo', () => {
    const gs = new GameStateManager();
    gs.recordCombo(0, 5);
    gs.recordCombo(0, 3);
    gs.recordCombo(0, 8);
    expect(gs.matchStats.p1LongestCombo).toBe(8);
  });

  it('resetForNewGame clears match stats', () => {
    const gs = new GameStateManager();
    gs.recordDamage(0, 200);
    gs.recordCombo(1, 10);
    gs.resetForNewGame();
    expect(gs.matchStats.p1TotalDamage).toBe(0);
    expect(gs.matchStats.p2LongestCombo).toBe(0);
  });
});
