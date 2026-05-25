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

  setPhase(p: GamePhase): void {
    this.phase = p;
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
