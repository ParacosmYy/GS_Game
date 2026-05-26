/**
 * InputResolver tests — direction resolution, attack resolution, special move
 * recognition, input priority, and edge cases.
 */
import { describe, it, expect } from 'vitest';
import {
  resolveInput,
  updatePrevAttack,
  getDirectionInput,
  getDirectionSymbol,
  getButtonDisplayString,
  getPressedButtonString,
  getCommandName,
  createPrevAttack,
} from '../src/input/inputResolver.js';
import type { RawInput, PrevAttack, ResolvedInput } from '../src/input/inputResolver.js';
import type { Direction } from '../src/core/types.js';

// ===== Helpers =====

/** Create a raw input with all directions/buttons released by default. */
function raw(overrides: Partial<RawInput> = {}): RawInput {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    start: false,
    ...overrides,
  };
}

// ===== 1. Direction Resolution =====

describe('Direction Resolution', () => {
  it('empty input yields neutral direction', () => {
    const input = resolveInput(raw(), 1 as Direction, createPrevAttack());
    expect(getDirectionInput(input)).toBe('neutral');
  });

  it('left+down with facing=1 yields downback', () => {
    // facing=1 means right=forward, left=back
    const input = resolveInput(raw({ left: true, down: true }), 1 as Direction, createPrevAttack());
    expect(getDirectionInput(input)).toBe('downback');
  });

  it('right+up with facing=1 yields upforward', () => {
    const input = resolveInput(raw({ right: true, up: true }), 1 as Direction, createPrevAttack());
    expect(getDirectionInput(input)).toBe('upforward');
  });

  it('respects facing direction: right+up with facing=-1 yields upback', () => {
    // facing=-1 means left=forward, right=back
    const input = resolveInput(raw({ right: true, up: true }), -1 as Direction, createPrevAttack());
    expect(getDirectionInput(input)).toBe('upback');
  });
});

// ===== 2. Attack Resolution =====

describe('Attack Resolution', () => {
  it('buttonA press yields buttonAPressed=true (light attack)', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    expect(input.buttonAPressed).toBe(true);
    expect(input.buttonA).toBe(true);
  });

  it('buttonC press yields buttonCPressed=true (heavy attack)', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonC: true }), 1 as Direction, prev);
    expect(input.buttonCPressed).toBe(true);
    expect(input.buttonC).toBe(true);
  });

  it('buttonA+buttonC held simultaneously — both are active but punchPressed fires only on edge', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true, buttonC: true }), 1 as Direction, prev);
    // Both buttons held
    expect(input.buttonA).toBe(true);
    expect(input.buttonC).toBe(true);
    // Both just pressed (first frame)
    expect(input.punchPressed).toBe(true);
    expect(input.buttonAPressed).toBe(true);
    expect(input.buttonCPressed).toBe(true);
  });

  it('buttonA held from previous frame — buttonAPressed=false (no re-trigger)', () => {
    const prev = createPrevAttack();
    prev.a = true; // was already held
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    expect(input.buttonA).toBe(true);
    expect(input.buttonAPressed).toBe(false);
  });
});

// ===== 3. Special Move Resolution (via getCommandName) =====

describe('Special Move Resolution', () => {
  it('QCF+punch yields QCF+P command name (projectile motion)', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    const cmd = getCommandName('forward', input, true, false, false, false, false);
    expect(cmd).toBe('QCF+P');
  });

  it('DP+punch yields DP+P command name (anti-air motion)', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonC: true }), 1 as Direction, prev);
    const cmd = getCommandName('downforward', input, false, false, false, true, false);
    expect(cmd).toBe('DP+P');
  });

  it('no motion flag + button yields null (normal attack, no special)', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    const cmd = getCommandName('neutral', input, false, false, false, false, false);
    expect(cmd).toBeNull();
  });

  it('QCB+kick yields QCB+K command name', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonB: true }), 1 as Direction, prev);
    const cmd = getCommandName('back', input, false, true, false, false, false);
    expect(cmd).toBe('QCB+K');
  });
});

// ===== 4. Input Priority =====

describe('Input Priority', () => {
  it('DP takes priority over QCF when both flags are set', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    const cmd = getCommandName('downforward', input, true, false, false, true, false);
    // DP is checked first in getCommandName
    expect(cmd).toBe('DP+P');
  });

  it('QCF takes priority over QCB when both flags are set', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    const cmd = getCommandName('forward', input, true, true, false, false, false);
    // QCF is checked before QCB
    expect(cmd).toBe('QCF+P');
  });

  it('HCB+punch yields HCB+P when no higher-priority motion is set', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonC: true }), 1 as Direction, prev);
    const cmd = getCommandName('back', input, false, false, true, false, false);
    expect(cmd).toBe('HCB+P');
  });

  it('rollPressed (A+B) is detected correctly regardless of other motions', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw({ buttonA: true, buttonB: true }), 1 as Direction, prev);
    // A+B just pressed => roll
    expect(input.rollPressed).toBe(true);
    expect(input.buttonAPressed).toBe(true);
    expect(input.buttonBPressed).toBe(true);
  });
});

// ===== 5. Edge Cases =====

describe('Edge Cases', () => {
  it('all buttons pressed simultaneously — all held flags true, all pressed flags true', () => {
    const prev = createPrevAttack();
    const input = resolveInput(
      raw({ buttonA: true, buttonB: true, buttonC: true, buttonD: true }),
      1 as Direction,
      prev,
    );
    expect(input.buttonA).toBe(true);
    expect(input.buttonB).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.buttonD).toBe(true);
    expect(input.rollPressed).toBe(true);
    expect(input.blowbackPressed).toBe(true);
  });

  it('left+right conflict — both forwarded to resolved input, direction resolution uses facing', () => {
    // Simultaneous left+right is ambiguous at raw level but resolveInput
    // passes them through; direction resolution picks based on facing.
    const prev = createPrevAttack();
    const input = resolveInput(raw({ left: true, right: true }), 1 as Direction, prev);
    // facing=1: forward=right, back=left — both true simultaneously.
    // getDirectionInput checks upforward/upback combos first.
    // Since up is false and down is false, neither upforward/upback/downforward/downback match.
    // Then it checks up/down/forward/back — forward (right) matches first.
    expect(input.forward).toBe(true);
    expect(input.back).toBe(true);
    // With up=false, down=false, forward=true => returns 'forward'
    expect(getDirectionInput(input)).toBe('forward');
  });

  it('rapid input: pressing and releasing between frames updates prev correctly', () => {
    const prev = createPrevAttack();
    // Frame 1: press A
    const input1 = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    expect(input1.buttonAPressed).toBe(true);
    updatePrevAttack(prev, raw({ buttonA: true }));

    // Frame 2: still held — no re-trigger
    const input2 = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    expect(input2.buttonAPressed).toBe(false);
    updatePrevAttack(prev, raw({ buttonA: true }));

    // Frame 3: release — detect negative edge
    const input3 = resolveInput(raw({ buttonA: false }), 1 as Direction, prev);
    expect(input3.buttonAPressed).toBe(false);
    expect(input3.punchJustReleased).toBe(true);
    updatePrevAttack(prev, raw({ buttonA: false }));

    // Frame 4: press again — re-triggers
    const input4 = resolveInput(raw({ buttonA: true }), 1 as Direction, prev);
    expect(input4.buttonAPressed).toBe(true);
  });
});

// ===== 6. Display Helpers =====

describe('Display Helpers', () => {
  it('getDirectionSymbol returns correct symbols for all directions', () => {
    expect(getDirectionSymbol('neutral')).toBe('·');
    expect(getDirectionSymbol('up')).toBe('↑');
    expect(getDirectionSymbol('down')).toBe('↓');
    expect(getDirectionSymbol('forward')).toBe('→');
    expect(getDirectionSymbol('back')).toBe('←');
    expect(getDirectionSymbol('upforward')).toBe('↗');
    expect(getDirectionSymbol('upback')).toBe('↖');
    expect(getDirectionSymbol('downforward')).toBe('↘');
    expect(getDirectionSymbol('downback')).toBe('↙');
  });

  it('getButtonDisplayString returns active buttons', () => {
    const input = resolveInput(raw({ buttonA: true, buttonC: true }), 1 as Direction, createPrevAttack());
    expect(getButtonDisplayString(input)).toBe('A C');
  });

  it('getPressedButtonString includes A+B and C+D composite labels', () => {
    const prev = createPrevAttack();
    const input = resolveInput(
      raw({ buttonA: true, buttonB: true, buttonC: true, buttonD: true }),
      1 as Direction,
      prev,
    );
    const pressed = getPressedButtonString(input);
    expect(pressed).toContain('A');
    expect(pressed).toContain('A+B');
    expect(pressed).toContain('C+D');
  });

  it('chargeReady displays CHARGE READY', () => {
    const prev = createPrevAttack();
    const input = resolveInput(raw(), 1 as Direction, prev);
    const cmd = getCommandName('neutral', input, false, false, false, false, true);
    expect(cmd).toBe('CHARGE READY');
  });
});
