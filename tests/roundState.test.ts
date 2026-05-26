import { describe, it, expect } from 'vitest';
import { RoundState, RoundTransitionPhase } from '../src/state/roundState.js';

function makeDeps(): any {
  return {
    p1: {}, p2: {},
    p1Cmd: {}, p2Cmd: {},
    combatSystem: {},
    projectiles: [],
    vfx: {},
    cinematic: {},
    gauges: [{}, {}],
    maxmodes: [{}, {}],
    tickRef: { tick: 0 },
  };
}

describe('roundState', () => {
  describe('RoundTransitionPhase', () => {
    it('has NONE value', () => {
      expect(RoundTransitionPhase.NONE).toBe('none');
    });
    it('has HOLD_BLACK value', () => {
      expect(RoundTransitionPhase.HOLD_BLACK).toBe('hold_black');
    });
    it('has FADE_IN value', () => {
      expect(RoundTransitionPhase.FADE_IN).toBe('fade_in');
    });
  });

  describe('RoundState', () => {
    it('can be instantiated', () => {
      const rs = new RoundState(makeDeps());
      expect(rs).toBeDefined();
    });
    it('initializes p1Wins=0', () => {
      const rs = new RoundState(makeDeps());
      expect(rs.p1Wins).toBe(0);
    });
    it('initializes p2Wins=0', () => {
      const rs = new RoundState(makeDeps());
      expect(rs.p2Wins).toBe(0);
    });
    it('initializes currentRound=1', () => {
      const rs = new RoundState(makeDeps());
      expect(rs.currentRound).toBe(1);
    });
    it('winsNeeded=2', () => {
      const rs = new RoundState(makeDeps());
      expect(rs.winsNeeded).toBe(2);
    });
    it('transitionPhase starts NONE', () => {
      const rs = new RoundState(makeDeps());
      expect(rs.transitionPhase).toBe(RoundTransitionPhase.NONE);
    });
  });
});
