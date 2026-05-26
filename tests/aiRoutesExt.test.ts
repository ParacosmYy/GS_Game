import { describe, it, expect } from 'vitest';
import { AIR_COMBO_ROUTES, applyComboStep } from '../src/ai/aiRoutes.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';
import { createPrevAttack } from '../src/input/inputResolver.js';

function makeInput(): ResolvedInput {
  return {
    up: false, down: false, left: false, right: false,
    forward: false, back: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    buttonAPressed: false, buttonBPressed: false, buttonCPressed: false, buttonDPressed: false,
    punchPressed: false, kickPressed: false,
    start: false, select: false,
  };
}

describe('aiRoutes extended', () => {
  it('AIR_COMBO_ROUTES is object', () => {
    expect(AIR_COMBO_ROUTES).toBeDefined();
    expect(typeof AIR_COMBO_ROUTES).toBe('object');
  });
  it('AIR_COMBO_ROUTES has entries', () => {
    expect(Object.keys(AIR_COMBO_ROUTES).length).toBeGreaterThan(0);
  });
  it('applyComboStep sets button for closeC', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'closeC', delay: 0 }, input);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });
  it('applyComboStep sets button for standA', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'standA', delay: 0 }, input);
    expect(input.buttonA).toBe(true);
  });
  it('applyComboStep sets button for standB', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'standB', delay: 0 }, input);
    expect(input.buttonB).toBe(true);
    expect(input.kickPressed).toBe(true);
  });
});
