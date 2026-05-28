/**
 * Combat Callbacks Regression Test
 * Verifies onThrowEscape, onGuardCrush, onStunWarning callback interfaces exist
 * and combatSystem exposes them correctly.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';

describe('CombatSystem callback interfaces', () => {
  it('has onThrowEscape callback slot', () => {
    const cs = new CombatSystem({ getP1: () => null, getP2: () => null });
    expect(cs.onThrowEscape).toBeNull();
    cs.onThrowEscape = () => {};
    expect(cs.onThrowEscape).toBeDefined();
  });

  it('has onGuardCrush callback slot', () => {
    const cs = new CombatSystem({ getP1: () => null, getP2: () => null });
    expect(cs.onGuardCrush).toBeNull();
    cs.onGuardCrush = () => {};
    expect(cs.onGuardCrush).toBeDefined();
  });

  it('has onStunWarning callback slot', () => {
    const cs = new CombatSystem({ getP1: () => null, getP2: () => null });
    expect(cs.onStunWarning).toBeNull();
    cs.onStunWarning = () => {};
    expect(cs.onStunWarning).toBeDefined();
  });

  it('callbacks are independent (setting one does not affect others)', () => {
    const cs = new CombatSystem({ getP1: () => null, getP2: () => null });
    const throwFn = () => {};
    const guardFn = () => {};
    const stunFn = () => {};
    cs.onThrowEscape = throwFn;
    cs.onGuardCrush = guardFn;
    cs.onStunWarning = stunFn;
    expect(cs.onThrowEscape).toBe(throwFn);
    expect(cs.onGuardCrush).toBe(guardFn);
    expect(cs.onStunWarning).toBe(stunFn);
  });
});
