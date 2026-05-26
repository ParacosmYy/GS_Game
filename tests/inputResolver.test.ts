import { describe, it, expect } from 'vitest';
import { resolveInput, createPrevAttack } from '../src/input/inputResolver.js';

describe('inputResolver', () => {
  describe('createPrevAttack', () => {
    it('creates default prev attack state', () => {
      const prev = createPrevAttack();
      expect(prev.a).toBe(false);
      expect(prev.c).toBe(false);
    });
  });

  describe('resolveInput', () => {
    const noInput = { up: false, down: false, left: false, right: false, buttonA: false, buttonB: false, buttonC: false, buttonD: false, burst: false, start: false, select: false, throwAttack: false };
    const prev = createPrevAttack();

    it('returns resolved input object', () => {
      const result = resolveInput(noInput, 1, prev);
      expect(result).toBeDefined();
      expect(typeof result.up).toBe('boolean');
    });
    it('detects up press', () => {
      const result = resolveInput({ ...noInput, up: true }, 1, prev);
      expect(result.up).toBe(true);
    });
    it('detects buttonAPressed', () => {
      const result = resolveInput({ ...noInput, buttonA: true }, 1, prev);
      expect(result.buttonAPressed).toBe(true);
    });
    it('detects buttonCPressed', () => {
      const result = resolveInput({ ...noInput, buttonC: true }, 1, prev);
      expect(result.buttonCPressed).toBe(true);
    });
    it('no press when button held', () => {
      const heldPrev = { ...prev, a: true };
      const result = resolveInput({ ...noInput, buttonA: true }, 1, heldPrev);
      expect(result.buttonAPressed).toBe(false);
    });
    it('detects forward when facing right', () => {
      const result = resolveInput({ ...noInput, right: true }, 1, prev);
      expect(result.forward).toBe(true);
    });
    it('facing -1 swaps forward/back', () => {
      const result = resolveInput({ ...noInput, left: true }, -1, prev);
      expect(result.forward).toBe(true);
    });
    it('punchPressed = A or C pressed', () => {
      const result = resolveInput({ ...noInput, buttonA: true }, 1, prev);
      expect(result.punchPressed).toBe(true);
    });
  });
});
