/**
 * GameStateManager — 游戏阶段状态管理
 *
 * 从 main.ts 提取的游戏状态变量容器。
 * 逐步将阶段逻辑提取到独立 handler 中。
 */
import { GamePhase } from '../core/types.js';
import { AnnounceSequence } from './announceSequence.js';

export class GameStateManager {
  phase: GamePhase = GamePhase.TITLE;
  phaseTimer = 0;
  koTimer = 0;
  winner: number | null = null;
  isTimeOver = false;
  continueCountdown = 0;
  continueCursorYes = true;
  modeSelectCursor = 0;
  currentWinQuote = '';
  winQuoteTimer = 0;
  winQuoteCharName = '';
  winQuoteCharColor = '#ffcc00';
  firstAttacker: number | null = null;
  isTrainingMode = false;
  teamMode = false;
  debugMode = false;
  simplifiedMode = false;
  modeIndicatorTimer = 0;
  stageIndicatorTimer = 0;
  koGroundSlamDone = false;
  firstHitTracked = false;
  announceSequence: AnnounceSequence = new AnnounceSequence();
  titleBgmStarted = false;
  gameOverTimer = 0;

  // Pause menu state
  isPaused = false;
  pauseMenuCursor = 0;
  pauseMenuTab: 'moves' | 'controls' | 'settings' = 'moves';

  // Stage select state
  stageSelectCursor = 0;       // 0..5 (5 stages + random)
  stageSelectReady = false;
  stageSelectConfirmed: string | null = null;

  // Team order state
  teamOrderSlots: number[][] = [[0, 1, 2], [0, 1, 2]]; // P1/P2 order indices into team
  teamOrderCursor = 0;
  teamOrderSwapMode = false;
  teamOrderSwapCursor = 0;
  teamOrderReady = [false, false];

  // Transition animation state
  transitionTimer = 0;
  transitionType: 'none' | 'wipe' | 'zoom' | 'fade' = 'none';
  transitionFrom: GamePhase | null = null;
  transitionTo: GamePhase | null = null;

  // Input repeat throttle (for stage/team select cursor movement)
  inputRepeatCooldown = 0;

  // Match stats for victory screen
  matchStats = {
    p1TotalDamage: 0,
    p2TotalDamage: 0,
    p1LongestCombo: 0,
    p2LongestCombo: 0,
  };

  /** Record damage dealt by a player this match */
  recordDamage(playerIndex: number, damage: number): void {
    if (playerIndex === 0) this.matchStats.p1TotalDamage += damage;
    else this.matchStats.p2TotalDamage += damage;
  }

  /** Record combo length for a player (keeps the longest) */
  recordCombo(playerIndex: number, comboCount: number): void {
    if (playerIndex === 0) this.matchStats.p1LongestCombo = Math.max(this.matchStats.p1LongestCombo, comboCount);
    else this.matchStats.p2LongestCombo = Math.max(this.matchStats.p2LongestCombo, comboCount);
  }

  setPhase(p: GamePhase): void {
    this.phase = p;
  }

  startTransition(type: 'wipe' | 'zoom' | 'fade', from: GamePhase, to: GamePhase): void {
    this.transitionType = type;
    this.transitionFrom = from;
    this.transitionTo = to;
    this.transitionTimer = 0;
  }

  isTransitioning(): boolean {
    return this.transitionType !== 'none';
  }

  resetStageSelect(): void {
    this.stageSelectCursor = 0;
    this.stageSelectReady = false;
    this.stageSelectConfirmed = null;
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseMenuCursor = 0;
      this.pauseMenuTab = 'moves';
    }
  }

  unpause(): void {
    this.isPaused = false;
  }

  resetTeamOrder(): void {
    this.teamOrderSlots = [[0, 1, 2], [0, 1, 2]];
    this.teamOrderCursor = 0;
    this.teamOrderSwapMode = false;
    this.teamOrderSwapCursor = 0;
    this.teamOrderReady = [false, false];
  }

  resetForNewGame(): void {
    this.phase = GamePhase.TITLE;
    this.phaseTimer = 0;
    this.koTimer = 0;
    this.koGroundSlamDone = false;
    this.winner = null;
    this.isTimeOver = false;
    this.firstAttacker = null;
    this.firstHitTracked = false;
    this.currentWinQuote = '';
    this.winQuoteTimer = 0;
    this.debugMode = false;
    this.titleBgmStarted = false;
    this.gameOverTimer = 0;
    this.transitionType = 'none';
    this.transitionTimer = 0;
    this.matchStats = { p1TotalDamage: 0, p2TotalDamage: 0, p1LongestCombo: 0, p2LongestCombo: 0 };
    this.resetStageSelect();
    this.resetTeamOrder();
  }

  resetForNextRound(): void {
    this.phaseTimer = 0;
    this.koTimer = 0;
    this.koGroundSlamDone = false;
    this.isTimeOver = false;
    this.firstHitTracked = false;
    this.firstAttacker = null;
  }
}
