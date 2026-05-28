/**
 * FighterState Enum Coverage Test
 * Verifies all expected combat states exist in the FighterState enum.
 */
import { describe, it, expect } from 'vitest';
import { FighterState } from '../src/core/types.js';

const REQUIRED_STATES = [
  'IDLE', 'WALK', 'RUN', 'BACKDASH',
  'JUMP', 'RUN_JUMP', 'HOP', 'HYPER_JUMP',
  'CROUCH', 'ROLL', 'BACK_ROLL',
  'STAND_ATTACK', 'CROUCH_ATTACK', 'AIR_ATTACK',
  'COUNTER_STANCE', 'THROW',
  'BLOCK', 'AIR_BLOCK', 'GUARD_CRUSH',
  'HITSTUN', 'KNOCKDOWN', 'GETUP', 'DIZZY',
  'MAX_MODE', 'TAUNT', 'WIN',
] as const;

describe('FighterState enum coverage', () => {
  it('has all required combat states', () => {
    for (const state of REQUIRED_STATES) {
      expect((FighterState as any)[state], `FighterState.${state}`).toBeDefined();
    }
  });

  it('each state value equals its name', () => {
    for (const state of REQUIRED_STATES) {
      expect((FighterState as any)[state], `FighterState.${state} === '${state}'`).toBe(state);
    }
  });

  it('has at least 25 states', () => {
    const count = Object.keys(FighterState).length;
    expect(count, 'FighterState count').toBeGreaterThanOrEqual(25);
  });

  it('movement states: IDLE, WALK, RUN, JUMP, HOP, CROUCH exist', () => {
    expect(FighterState.IDLE).toBeDefined();
    expect(FighterState.WALK).toBeDefined();
    expect(FighterState.RUN).toBeDefined();
    expect(FighterState.JUMP).toBeDefined();
    expect(FighterState.HOP).toBeDefined();
    expect(FighterState.CROUCH).toBeDefined();
  });

  it('attack states: STAND_ATTACK, CROUCH_ATTACK, AIR_ATTACK exist', () => {
    expect(FighterState.STAND_ATTACK).toBeDefined();
    expect(FighterState.CROUCH_ATTACK).toBeDefined();
    expect(FighterState.AIR_ATTACK).toBeDefined();
  });

  it('defense states: BLOCK, AIR_BLOCK, GUARD_CRUSH exist', () => {
    expect(FighterState.BLOCK).toBeDefined();
    expect(FighterState.AIR_BLOCK).toBeDefined();
    expect(FighterState.GUARD_CRUSH).toBeDefined();
  });

  it('hit states: HITSTUN, KNOCKDOWN, GETUP, DIZZY exist', () => {
    expect(FighterState.HITSTUN).toBeDefined();
    expect(FighterState.KNOCKDOWN).toBeDefined();
    expect(FighterState.GETUP).toBeDefined();
    expect(FighterState.DIZZY).toBeDefined();
  });

  it('special states: MAX_MODE, TAUNT, WIN exist', () => {
    expect(FighterState.MAX_MODE).toBeDefined();
    expect(FighterState.TAUNT).toBeDefined();
    expect(FighterState.WIN).toBeDefined();
  });

  it('evasion states: ROLL, BACK_ROLL, BACKDASH exist', () => {
    expect(FighterState.ROLL).toBeDefined();
    expect(FighterState.BACK_ROLL).toBeDefined();
    expect(FighterState.BACKDASH).toBeDefined();
  });
});
