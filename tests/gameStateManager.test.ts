import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';

describe('gameStateManager', () => {
  it('can be instantiated', () => {
    const gsm = new GameStateManager();
    expect(gsm).toBeDefined();
  });
  it('initial phase is TITLE', () => {
    const gsm = new GameStateManager();
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });
  it('phaseTimer starts at 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.phaseTimer).toBe(0);
  });
  it('winner starts null', () => {
    const gsm = new GameStateManager();
    expect(gsm.winner).toBeNull();
  });
  it('isTrainingMode starts false', () => {
    const gsm = new GameStateManager();
    expect(gsm.isTrainingMode).toBe(false);
  });
  it('continueCursorYes starts true', () => {
    const gsm = new GameStateManager();
    expect(gsm.continueCursorYes).toBe(true);
  });
  it('stageSelectCursor starts at 0', () => {
    const gsm = new GameStateManager();
    expect(gsm.stageSelectCursor).toBe(0);
  });
  it('firstAttacker starts null', () => {
    const gsm = new GameStateManager();
    expect(gsm.firstAttacker).toBeNull();
  });
});
