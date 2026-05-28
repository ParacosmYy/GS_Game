/**
 * AI Combo Routes Regression Test
 * Verifies COMBO_ROUTES data structure, jump-in routes, air combos, and applyComboStep.
 */
import { describe, it, expect } from 'vitest';
import {
  COMBO_ROUTES,
  JUMP_IN_ROUTE,
  AIR_COMBO_ROUTES,
  applyComboStep,
} from '../src/ai/aiRoutes.js';

describe('COMBO_ROUTES', () => {
  it('has at least 26 character routes plus default', () => {
    expect(Object.keys(COMBO_ROUTES).length).toBeGreaterThanOrEqual(27);
  });

  it('key characters have routes', () => {
    expect(COMBO_ROUTES.kyo).toBeDefined();
    expect(COMBO_ROUTES.iori).toBeDefined();
    expect(COMBO_ROUTES.ryo).toBeDefined();
    expect(COMBO_ROUTES.terry).toBeDefined();
    expect(COMBO_ROUTES.kim).toBeDefined();
  });

  it('every route has at least 1 step', () => {
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      expect(steps.length, `${charId} route length`).toBeGreaterThanOrEqual(1);
    }
  });

  it('every route starts with closeC at delay 0', () => {
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      expect(steps[0].attack, `${charId} first step`).toBe('closeC');
      expect(steps[0].delay, `${charId} first delay`).toBe(0);
    }
  });

  it('all delays are non-negative', () => {
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      for (const step of steps) {
        expect(step.delay, `${charId} step ${step.attack}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('all step types are button or special', () => {
    const validTypes = new Set(['button', 'special']);
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      for (const step of steps) {
        expect(validTypes, `${charId} step ${step.attack} type`).toContain(step.type);
      }
    }
  });

  it('all step attacks are non-empty strings', () => {
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      for (const step of steps) {
        expect(step.attack.length, `${charId} step`).toBeGreaterThan(0);
      }
    }
  });

  it('kyo route has rekka chain', () => {
    const attacks = COMBO_ROUTES.kyo.map(s => s.attack);
    expect(attacks).toContain('aragami');
    expect(attacks).toContain('aragamiFollow');
    expect(attacks).toContain('aragamiEnder');
  });

  it('iori route has aoihana chain', () => {
    const attacks = COMBO_ROUTES.iori.map(s => s.attack);
    expect(attacks).toContain('aoihana1');
    expect(attacks).toContain('aoihana2');
    expect(attacks).toContain('aoihana3');
  });

  it('DM step is last step in most routes', () => {
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      const lastStep = steps[steps.length - 1];
      expect(lastStep.attack.toLowerCase(), `${charId} last step`).toContain('dm');
    }
  });

  it('_default route has no DM', () => {
    const attacks = COMBO_ROUTES._default.map(s => s.attack);
    const hasDM = attacks.some(a => a.toLowerCase().includes('dm'));
    expect(hasDM).toBe(false);
  });

  it('combo routes are non-trivial (most have >= 3 steps)', () => {
    let longRoutes = 0;
    for (const [charId, steps] of Object.entries(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      if (steps.length >= 3) longRoutes++;
    }
    expect(longRoutes).toBeGreaterThanOrEqual(20);
  });
});

describe('JUMP_IN_ROUTE', () => {
  it('has 2 steps', () => {
    expect(JUMP_IN_ROUTE.length).toBe(2);
  });

  it('starts with jumpC', () => {
    expect(JUMP_IN_ROUTE[0].attack).toBe('jumpC');
  });

  it('second step is closeC', () => {
    expect(JUMP_IN_ROUTE[1].attack).toBe('closeC');
  });
});

describe('AIR_COMBO_ROUTES', () => {
  it('ryo has an air combo route', () => {
    expect(AIR_COMBO_ROUTES.ryo).toBeDefined();
    expect(AIR_COMBO_ROUTES.ryo!.length).toBeGreaterThanOrEqual(2);
  });

  it('all routes have valid structure', () => {
    for (const [charId, steps] of Object.entries(AIR_COMBO_ROUTES)) {
      for (const step of steps!) {
        expect(['button', 'special'], `${charId} type`).toContain(step.type);
        expect(step.attack.length, `${charId} attack`).toBeGreaterThan(0);
        expect(step.delay, `${charId} delay`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('applyComboStep', () => {
  function makeInput() {
    return {
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      buttonAPressed: false, buttonBPressed: false, buttonCPressed: false, buttonDPressed: false,
      punchPressed: false, kickPressed: false,
      up: false, down: false, left: false, right: false, forward: false, backward: false,
    };
  }

  it('closeC sets buttonC and punchPressed', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'closeC', delay: 0 }, input as any);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('standA sets buttonA and punchPressed', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'standA', delay: 0 }, input as any);
    expect(input.buttonA).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('standB sets buttonB and kickPressed', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'standB', delay: 0 }, input as any);
    expect(input.buttonB).toBe(true);
    expect(input.kickPressed).toBe(true);
  });

  it('cmdGofuYou sets forward and buttonB', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'cmdGofuYou', delay: 0 }, input as any);
    expect(input.forward).toBe(true);
    expect(input.buttonB).toBe(true);
    expect(input.kickPressed).toBe(true);
  });

  it('jumpC sets buttonC', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'jumpC', delay: 0 }, input as any);
    expect(input.buttonC).toBe(true);
  });

  it('special aragami sets buttonA', () => {
    const input = makeInput();
    applyComboStep({ type: 'special', attack: 'aragami', delay: 0 }, input as any);
    expect(input.buttonA).toBe(true);
  });

  it('special aoihana2 sets buttonC', () => {
    const input = makeInput();
    applyComboStep({ type: 'special', attack: 'aoihana2', delay: 0 }, input as any);
    expect(input.buttonC).toBe(true);
  });

  it('special hiensen sets buttonB', () => {
    const input = makeInput();
    applyComboStep({ type: 'special', attack: 'hiensen', delay: 0 }, input as any);
    expect(input.buttonB).toBe(true);
  });

  it('unknown special defaults to buttonC', () => {
    const input = makeInput();
    applyComboStep({ type: 'special', attack: 'unknownSpecial', delay: 0 }, input as any);
    expect(input.buttonC).toBe(true);
  });

  it('unknown button is a no-op', () => {
    const input = makeInput();
    applyComboStep({ type: 'button', attack: 'nonexistent', delay: 0 }, input as any);
    expect(input.buttonA).toBe(false);
    expect(input.buttonB).toBe(false);
    expect(input.buttonC).toBe(false);
  });
});
