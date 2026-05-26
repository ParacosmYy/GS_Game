import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// GameStateManager — unit tests
// ---------------------------------------------------------------------------

describe('GameStateManager', () => {

  // =========================================================================
  // 1. Initial State
  // =========================================================================

  describe('initial state', () => {
    it('starts at TITLE phase', () => {
      const gsm = new GameStateManager();
      expect(gsm.phase).toBe(GamePhase.TITLE);
    });

    it('has zeroed timers and null references', () => {
      const gsm = new GameStateManager();
      expect(gsm.phaseTimer).toBe(0);
      expect(gsm.koTimer).toBe(0);
      expect(gsm.winner).toBeNull();
      expect(gsm.isTimeOver).toBe(false);
      expect(gsm.firstAttacker).toBeNull();
      expect(gsm.continueCountdown).toBe(0);
      expect(gsm.gameOverTimer).toBe(0);
    });

    it('has default select and team order state', () => {
      const gsm = new GameStateManager();
      expect(gsm.stageSelectCursor).toBe(0);
      expect(gsm.stageSelectReady).toBe(false);
      expect(gsm.stageSelectConfirmed).toBeNull();
      expect(gsm.teamOrderSlots).toEqual([[0, 1, 2], [0, 1, 2]]);
      expect(gsm.teamOrderReady).toEqual([false, false]);
    });
  });

  // =========================================================================
  // 2. State Machine Transitions
  // =========================================================================

  describe('state machine transitions', () => {
    it('transitions TITLE → MODE_SELECT', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.MODE_SELECT);
      expect(gsm.phase).toBe(GamePhase.MODE_SELECT);
    });

    it('transitions MODE_SELECT → SELECT', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.MODE_SELECT);
      gsm.setPhase(GamePhase.SELECT);
      expect(gsm.phase).toBe(GamePhase.SELECT);
    });

    it('transitions SELECT → STAGE_SELECT → INTRO → FIGHTING', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.SELECT);
      gsm.setPhase(GamePhase.STAGE_SELECT);
      gsm.setPhase(GamePhase.INTRO);
      gsm.setPhase(GamePhase.FIGHTING);
      expect(gsm.phase).toBe(GamePhase.FIGHTING);
    });

    it('transitions FIGHTING → KO → WIN_QUOTE', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.FIGHTING);
      gsm.winner = 0;
      gsm.setPhase(GamePhase.KO);
      expect(gsm.phase).toBe(GamePhase.KO);
      gsm.setPhase(GamePhase.WIN_QUOTE);
      expect(gsm.phase).toBe(GamePhase.WIN_QUOTE);
    });

    it('transitions full arcade flow: TITLE → ... → GAME_OVER', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.MODE_SELECT);
      gsm.setPhase(GamePhase.SELECT);
      gsm.setPhase(GamePhase.STAGE_SELECT);
      gsm.setPhase(GamePhase.INTRO);
      gsm.setPhase(GamePhase.FIGHTING);
      gsm.setPhase(GamePhase.KO);
      gsm.setPhase(GamePhase.WIN_QUOTE);
      gsm.setPhase(GamePhase.MATCH_END);
      gsm.setPhase(GamePhase.CONTINUE);
      gsm.setPhase(GamePhase.GAME_OVER);
      expect(gsm.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  // =========================================================================
  // 3. Game Mode Selection
  // =========================================================================

  describe('game mode selection', () => {
    it('supports Arcade / single mode via modeSelectCursor', () => {
      const gsm = new GameStateManager();
      gsm.modeSelectCursor = 0; // Arcade
      gsm.teamMode = false;
      gsm.isTrainingMode = false;
      expect(gsm.teamMode).toBe(false);
      expect(gsm.isTrainingMode).toBe(false);
    });

    it('supports VS / team mode', () => {
      const gsm = new GameStateManager();
      gsm.modeSelectCursor = 1; // VS / Team
      gsm.teamMode = true;
      gsm.isTrainingMode = false;
      expect(gsm.teamMode).toBe(true);
      expect(gsm.isTrainingMode).toBe(false);
    });

    it('supports Training mode with dedicated TRAINING phase', () => {
      const gsm = new GameStateManager();
      gsm.isTrainingMode = true;
      gsm.teamMode = false;
      gsm.setPhase(GamePhase.TRAINING);
      expect(gsm.phase).toBe(GamePhase.TRAINING);
      expect(gsm.isTrainingMode).toBe(true);
    });
  });

  // =========================================================================
  // 4. Match Flow
  // =========================================================================

  describe('match flow', () => {
    it('complete single round: select → fight → KO → result', () => {
      const gsm = new GameStateManager();
      // Select
      gsm.setPhase(GamePhase.SELECT);
      gsm.setPhase(GamePhase.STAGE_SELECT);
      gsm.setPhase(GamePhase.INTRO);
      // Fight
      gsm.setPhase(GamePhase.FIGHTING);
      expect(gsm.phase).toBe(GamePhase.FIGHTING);
      // KO
      gsm.winner = 0;
      gsm.setPhase(GamePhase.KO);
      expect(gsm.phase).toBe(GamePhase.KO);
      // Result
      gsm.setPhase(GamePhase.WIN_QUOTE);
      expect(gsm.phase).toBe(GamePhase.WIN_QUOTE);
    });

    it('3v3 team mode sets team order slots', () => {
      const gsm = new GameStateManager();
      gsm.teamMode = true;
      gsm.setPhase(GamePhase.TEAM_ORDER);
      // Default order: [0,1,2] for both players
      expect(gsm.teamOrderSlots).toEqual([[0, 1, 2], [0, 1, 2]]);
      // Swap P1 slot 0 and slot 2
      gsm.teamOrderSlots[0] = [2, 1, 0];
      expect(gsm.teamOrderSlots[0]).toEqual([2, 1, 0]);
      expect(gsm.teamOrderSlots[1]).toEqual([0, 1, 2]); // P2 unchanged
    });

    it('match end goes to continue screen', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.MATCH_END);
      gsm.setPhase(GamePhase.CONTINUE);
      gsm.continueCountdown = 10;
      expect(gsm.phase).toBe(GamePhase.CONTINUE);
      expect(gsm.continueCountdown).toBe(10);
    });

    it('continue YES goes back to select; continue NO goes to game over', () => {
      const gsm = new GameStateManager();
      // Continue YES path
      gsm.setPhase(GamePhase.CONTINUE);
      gsm.continueCursorYes = true;
      gsm.setPhase(GamePhase.SELECT);
      expect(gsm.phase).toBe(GamePhase.SELECT);

      // Continue NO path (new manager)
      const gsm2 = new GameStateManager();
      gsm2.setPhase(GamePhase.CONTINUE);
      gsm2.continueCursorYes = false;
      gsm2.setPhase(GamePhase.GAME_OVER);
      expect(gsm2.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  // =========================================================================
  // 5. State Reset
  // =========================================================================

  describe('state reset', () => {
    it('resetForNewGame returns to TITLE phase', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.FIGHTING);
      gsm.winner = 1;
      gsm.koTimer = 60;
      gsm.phaseTimer = 100;
      gsm.firstAttacker = 0;
      gsm.resetForNewGame();
      expect(gsm.phase).toBe(GamePhase.TITLE);
      expect(gsm.winner).toBeNull();
      expect(gsm.koTimer).toBe(0);
      expect(gsm.phaseTimer).toBe(0);
      expect(gsm.firstAttacker).toBeNull();
    });

    it('resetForNewGame clears all sub-states', () => {
      const gsm = new GameStateManager();
      // Dirty up everything
      gsm.isTimeOver = true;
      gsm.koGroundSlamDone = true;
      gsm.firstHitTracked = true;
      gsm.currentWinQuote = 'test quote';
      gsm.winQuoteTimer = 50;
      gsm.debugMode = true;
      gsm.titleBgmStarted = true;
      gsm.gameOverTimer = 99;
      gsm.transitionType = 'wipe';
      gsm.transitionTimer = 30;
      gsm.stageSelectCursor = 5;
      gsm.stageSelectReady = true;
      gsm.stageSelectConfirmed = 'stage_01';
      gsm.teamOrderSlots = [[2, 0, 1], [1, 2, 0]];
      gsm.teamOrderReady = [true, true];

      gsm.resetForNewGame();

      expect(gsm.isTimeOver).toBe(false);
      expect(gsm.koGroundSlamDone).toBe(false);
      expect(gsm.firstHitTracked).toBe(false);
      expect(gsm.currentWinQuote).toBe('');
      expect(gsm.winQuoteTimer).toBe(0);
      expect(gsm.debugMode).toBe(false);
      expect(gsm.titleBgmStarted).toBe(false);
      expect(gsm.gameOverTimer).toBe(0);
      expect(gsm.transitionType).toBe('none');
      expect(gsm.transitionTimer).toBe(0);
      // Stage select reset
      expect(gsm.stageSelectCursor).toBe(0);
      expect(gsm.stageSelectReady).toBe(false);
      expect(gsm.stageSelectConfirmed).toBeNull();
      // Team order reset
      expect(gsm.teamOrderSlots).toEqual([[0, 1, 2], [0, 1, 2]]);
      expect(gsm.teamOrderReady).toEqual([false, false]);
    });

    it('resetForNewGame allows starting a new match cycle', () => {
      const gsm = new GameStateManager();
      // Simulate a full game completed
      gsm.setPhase(GamePhase.GAME_OVER);
      gsm.gameOverTimer = 120;
      // Reset
      gsm.resetForNewGame();
      // Start new game
      gsm.setPhase(GamePhase.MODE_SELECT);
      gsm.setPhase(GamePhase.SELECT);
      gsm.setPhase(GamePhase.INTRO);
      gsm.setPhase(GamePhase.FIGHTING);
      expect(gsm.phase).toBe(GamePhase.FIGHTING);
    });

    it('resetForNextRound clears round-specific state only', () => {
      const gsm = new GameStateManager();
      gsm.phase = GamePhase.FIGHTING;
      gsm.phaseTimer = 300;
      gsm.koTimer = 45;
      gsm.isTimeOver = true;
      gsm.firstHitTracked = true;
      gsm.firstAttacker = 0;
      gsm.koGroundSlamDone = true;
      // Set some match-level state that should survive
      gsm.winner = 1;
      gsm.teamMode = true;
      gsm.isTrainingMode = false;

      gsm.resetForNextRound();

      expect(gsm.phaseTimer).toBe(0);
      expect(gsm.koTimer).toBe(0);
      expect(gsm.isTimeOver).toBe(false);
      expect(gsm.firstHitTracked).toBe(false);
      expect(gsm.firstAttacker).toBeNull();
      expect(gsm.koGroundSlamDone).toBe(false);
      // Match-level state preserved
      expect(gsm.phase).toBe(GamePhase.FIGHTING);
      expect(gsm.winner).toBe(1);
      expect(gsm.teamMode).toBe(true);
    });
  });

  // =========================================================================
  // 6. Transition Animation
  // =========================================================================

  describe('transition animation', () => {
    it('starts a transition with type, from, and to phases', () => {
      const gsm = new GameStateManager();
      gsm.startTransition('wipe', GamePhase.SELECT, GamePhase.INTRO);
      expect(gsm.transitionType).toBe('wipe');
      expect(gsm.transitionFrom).toBe(GamePhase.SELECT);
      expect(gsm.transitionTo).toBe(GamePhase.INTRO);
      expect(gsm.transitionTimer).toBe(0);
    });

    it('isTransitioning reports correctly', () => {
      const gsm = new GameStateManager();
      expect(gsm.isTransitioning()).toBe(false);
      gsm.startTransition('fade', GamePhase.KO, GamePhase.WIN_QUOTE);
      expect(gsm.isTransitioning()).toBe(true);
    });

    it('resetForNewGame clears transition state', () => {
      const gsm = new GameStateManager();
      gsm.startTransition('zoom', GamePhase.INTRO, GamePhase.FIGHTING);
      gsm.transitionTimer = 50;
      gsm.resetForNewGame();
      expect(gsm.isTransitioning()).toBe(false);
      expect(gsm.transitionType).toBe('none');
      expect(gsm.transitionTimer).toBe(0);
    });
  });

  // =========================================================================
  // 7. Stage Select Reset
  // =========================================================================

  describe('stage select reset', () => {
    it('resetStageSelect clears cursor, ready flag, and confirmed stage', () => {
      const gsm = new GameStateManager();
      gsm.stageSelectCursor = 4;
      gsm.stageSelectReady = true;
      gsm.stageSelectConfirmed = 'stage_fire';
      gsm.resetStageSelect();
      expect(gsm.stageSelectCursor).toBe(0);
      expect(gsm.stageSelectReady).toBe(false);
      expect(gsm.stageSelectConfirmed).toBeNull();
    });
  });

  // =========================================================================
  // 8. Team Order Reset
  // =========================================================================

  describe('team order reset', () => {
    it('resetTeamOrder restores default slots and ready flags', () => {
      const gsm = new GameStateManager();
      gsm.teamOrderSlots = [[2, 0, 1], [1, 2, 0]];
      gsm.teamOrderCursor = 2;
      gsm.teamOrderSwapMode = true;
      gsm.teamOrderSwapCursor = 1;
      gsm.teamOrderReady = [true, false];
      gsm.resetTeamOrder();
      expect(gsm.teamOrderSlots).toEqual([[0, 1, 2], [0, 1, 2]]);
      expect(gsm.teamOrderCursor).toBe(0);
      expect(gsm.teamOrderSwapMode).toBe(false);
      expect(gsm.teamOrderSwapCursor).toBe(0);
      expect(gsm.teamOrderReady).toEqual([false, false]);
    });
  });

  // =========================================================================
  // 9. Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('rapid phase switching does not throw', () => {
      const gsm = new GameStateManager();
      const phases = Object.values(GamePhase);
      // Cycle through all phases rapidly 50 times
      for (let cycle = 0; cycle < 50; cycle++) {
        for (const p of phases) {
          gsm.setPhase(p);
        }
      }
      expect(gsm.phase).toBe(phases[phases.length - 1]);
    });

    it('setPhase to the same phase is idempotent', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.FIGHTING);
      const before = gsm.phase;
      gsm.setPhase(GamePhase.FIGHTING);
      expect(gsm.phase).toBe(before);
    });

    it('winner can be set to player 0, 1, or null', () => {
      const gsm = new GameStateManager();
      gsm.winner = 0;
      expect(gsm.winner).toBe(0);
      gsm.winner = 1;
      expect(gsm.winner).toBe(1);
      gsm.winner = null;
      expect(gsm.winner).toBeNull();
    });

    it('multiple resets do not corrupt state', () => {
      const gsm = new GameStateManager();
      gsm.setPhase(GamePhase.FIGHTING);
      gsm.winner = 0;
      gsm.koTimer = 99;
      // Double reset
      gsm.resetForNewGame();
      gsm.resetForNewGame();
      expect(gsm.phase).toBe(GamePhase.TITLE);
      expect(gsm.winner).toBeNull();
      expect(gsm.koTimer).toBe(0);
    });

    it('announceSequence is initialized and usable', () => {
      const gsm = new GameStateManager();
      expect(gsm.announceSequence).toBeDefined();
      expect(gsm.announceSequence.getPhase()).toBe('idle');
    });
  });
});
