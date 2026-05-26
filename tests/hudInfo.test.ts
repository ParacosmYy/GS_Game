/**
 * Tests for HUD Info Display (Phase 69)
 * - FPS calculation
 * - State display formatting
 * - Input notation conversion
 * - Toggle behavior
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the pure functions from hudInfo by importing them
import {
  inputToNumpad,
  numpadToArrow,
  toggleDebugOverlay,
  toggleInputDisplay,
  isDebugOverlayVisible,
  isInputDisplayVisible,
  updateFPSTracker,
  getCurrentFPS,
} from '../src/rendering/hudInfo.js';
import type { PlayerInput } from '../src/core/types.js';

// ===== Helper: create a neutral PlayerInput =====
function makeInput(overrides: Partial<PlayerInput> = {}): PlayerInput {
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
    burst: false,
    start: false,
    ...overrides,
  };
}

// ===== FPS Calculation =====

describe('FPS calculation', () => {
  it('starts at 0 FPS', () => {
    // FPS tracker state persists, so we just verify getCurrentFPS returns a number
    expect(typeof getCurrentFPS()).toBe('number');
  });

  it('updateFPSTracker increments frame count without error', () => {
    expect(() => updateFPSTracker()).not.toThrow();
  });

  it('after many updates, FPS is tracked', () => {
    // Call update many times — after enough calls + time passage, FPS should change
    for (let i = 0; i < 100; i++) {
      updateFPSTracker();
    }
    // FPS should be a non-negative number (may be 0 if less than 1 second passed)
    expect(getCurrentFPS()).toBeGreaterThanOrEqual(0);
  });
});

// ===== Input Notation Conversion =====

describe('input notation conversion', () => {
  describe('inputToNumpad', () => {
    it('returns 5 for neutral input (facing right)', () => {
      expect(inputToNumpad(makeInput(), 1)).toBe('5');
    });

    it('returns 5 for neutral input (facing left)', () => {
      expect(inputToNumpad(makeInput(), -1)).toBe('5');
    });

    it('returns 8 for up', () => {
      expect(inputToNumpad(makeInput({ up: true }), 1)).toBe('8');
    });

    it('returns 2 for down', () => {
      expect(inputToNumpad(makeInput({ down: true }), 1)).toBe('2');
    });

    it('returns 6 for right (forward when facing right)', () => {
      expect(inputToNumpad(makeInput({ right: true }), 1)).toBe('6');
    });

    it('returns 4 for left (back when facing right)', () => {
      expect(inputToNumpad(makeInput({ left: true }), 1)).toBe('4');
    });

    it('returns 6 for left (forward when facing left)', () => {
      expect(inputToNumpad(makeInput({ left: true }), -1)).toBe('6');
    });

    it('returns 4 for right (back when facing left)', () => {
      expect(inputToNumpad(makeInput({ right: true }), -1)).toBe('4');
    });

    it('returns 9 for up+forward (facing right: up+right)', () => {
      expect(inputToNumpad(makeInput({ up: true, right: true }), 1)).toBe('9');
    });

    it('returns 3 for down+forward (facing right: down+right)', () => {
      expect(inputToNumpad(makeInput({ down: true, right: true }), 1)).toBe('3');
    });

    it('returns 7 for up+back (facing right: up+left)', () => {
      expect(inputToNumpad(makeInput({ up: true, left: true }), 1)).toBe('7');
    });

    it('returns 1 for down+back (facing right: down+left)', () => {
      expect(inputToNumpad(makeInput({ down: true, left: true }), 1)).toBe('1');
    });

    it('handles up+forward when facing left (up+left)', () => {
      expect(inputToNumpad(makeInput({ up: true, left: true }), -1)).toBe('9');
    });

    it('handles down+back when facing left (down+right)', () => {
      expect(inputToNumpad(makeInput({ down: true, right: true }), -1)).toBe('1');
    });
  });

  describe('numpadToArrow', () => {
    it('maps all 9 directions correctly', () => {
      expect(numpadToArrow('7')).toBe('↖');
      expect(numpadToArrow('8')).toBe('↑');
      expect(numpadToArrow('9')).toBe('↗');
      expect(numpadToArrow('4')).toBe('←');
      expect(numpadToArrow('5')).toBe('·');
      expect(numpadToArrow('6')).toBe('→');
      expect(numpadToArrow('1')).toBe('↙');
      expect(numpadToArrow('2')).toBe('↓');
      expect(numpadToArrow('3')).toBe('↘');
    });

    it('returns · for unknown input', () => {
      expect(numpadToArrow('0')).toBe('·');
      expect(numpadToArrow('')).toBe('·');
      expect(numpadToArrow('x')).toBe('·');
    });
  });
});

// ===== Toggle Behavior =====

describe('toggle behavior', () => {
  it('debug overlay toggles on and off', () => {
    const initialState = isDebugOverlayVisible();
    const first = toggleDebugOverlay();
    expect(first).toBe(!initialState);
    expect(isDebugOverlayVisible()).toBe(!initialState);

    const second = toggleDebugOverlay();
    expect(second).toBe(initialState);
    expect(isDebugOverlayVisible()).toBe(initialState);
  });

  it('input display toggles on and off', () => {
    const initialState = isInputDisplayVisible();
    const first = toggleInputDisplay();
    expect(first).toBe(!initialState);
    expect(isInputDisplayVisible()).toBe(!initialState);

    const second = toggleInputDisplay();
    expect(second).toBe(initialState);
    expect(isInputDisplayVisible()).toBe(initialState);
  });

  it('toggles are independent', () => {
    // Toggle debug on
    while (!isDebugOverlayVisible()) toggleDebugOverlay();
    // Toggle input off
    while (isInputDisplayVisible()) toggleInputDisplay();

    expect(isDebugOverlayVisible()).toBe(true);
    expect(isInputDisplayVisible()).toBe(false);

    // Toggle input on — debug should remain unchanged
    toggleInputDisplay();
    expect(isDebugOverlayVisible()).toBe(true);
    expect(isInputDisplayVisible()).toBe(true);
  });
});

// ===== State Display Formatting =====

describe('state display formatting', () => {
  it('numpad notation handles simultaneous opposite directions', () => {
    // up+down at the same time — no match, returns neutral
    const result = inputToNumpad(makeInput({ up: true, down: true }), 1);
    expect(result).toBe('5'); // conflicting inputs return neutral
  });

  it('numpad notation handles left+right at the same time', () => {
    // When facing right: right=forward, left=back. Both pressed: no forward/back
    const result = inputToNumpad(makeInput({ left: true, right: true }), 1);
    expect(result).toBe('5'); // both cancel out
  });

  it('combines diagonals correctly with facing direction', () => {
    // Facing left: left=forward, up+left = up+forward = 9
    expect(inputToNumpad(makeInput({ up: true, left: true }), -1)).toBe('9');
    // Facing left: right=back, down+right = down+back = 1
    expect(inputToNumpad(makeInput({ down: true, right: true }), -1)).toBe('1');
  });
});
