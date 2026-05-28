/**
 * MOVE_NAME_MAP + AI Routes Data Structural Tests
 *
 * Validates MOVE_NAME_MAP Chinese move name coverage,
 * COMBO_ROUTES, JUMP_IN_ROUTE, AIR_COMBO_ROUTES structure,
 * and applyComboStep pure function.
 */
import { describe, it, expect } from 'vitest';
import { MOVE_NAME_MAP } from '../src/combat/hitCallback.js';
import { AttackType } from '../src/core/types.js';
import {
  COMBO_ROUTES,
  JUMP_IN_ROUTE,
  AIR_COMBO_ROUTES,
  applyComboStep,
  routeComboSpecial,
  type ComboStep,
} from '../src/ai/aiRoutes.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';

// ===== MOVE_NAME_MAP =====

describe('MOVE_NAME_MAP', () => {
  const keys = Object.keys(MOVE_NAME_MAP);

  it('has entries', () => {
    expect(keys.length).toBeGreaterThan(20);
  });

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(MOVE_NAME_MAP)) {
      expect(value, `MOVE_NAME_MAP[${key}]`).toBeTruthy();
      expect(value!.length, `MOVE_NAME_MAP[${key}] length`).toBeGreaterThan(0);
    }
  });

  it('covers Ryo specials', () => {
    expect(MOVE_NAME_MAP[AttackType.RYO_KOOU]).toBe('虎煌拳');
    expect(MOVE_NAME_MAP[AttackType.RYO_KO_HOU]).toBe('虎咆');
    expect(MOVE_NAME_MAP[AttackType.RYO_HIEN]).toBe('飛燕疾風脚');
    expect(MOVE_NAME_MAP[AttackType.RYO_HAOU]).toBe('霸王翔吼拳');
  });

  it('covers Ryo DM/SDM/HSDM', () => {
    expect(MOVE_NAME_MAP[AttackType.DM_TEN_HA_OU]).toBeDefined();
    expect(MOVE_NAME_MAP[AttackType.SDM_TEN_HA_OU]).toBeDefined();
    expect(MOVE_NAME_MAP[AttackType.HSDM_RYUKO_RANBU]).toBeDefined();
  });

  it('covers Kyo specials', () => {
    expect(MOVE_NAME_MAP[AttackType.KYO_YAMIBARAI]).toBe('闇払い');
    expect(MOVE_NAME_MAP[AttackType.KYO_ONIYAKI]).toBe('鬼焼き');
    expect(MOVE_NAME_MAP[AttackType.KYO_ARAGAMI]).toBe('荒咬み');
  });

  it('covers Iori specials', () => {
    expect(MOVE_NAME_MAP[AttackType.IORI_YAMIBARAI]).toBeDefined();
    expect(MOVE_NAME_MAP[AttackType.IORI_ONIYAKI]).toBeDefined();
    expect(MOVE_NAME_MAP[AttackType.IORI_AOIHANA]).toBeDefined();
    expect(MOVE_NAME_MAP[AttackType.IORI_KUZUKAZE]).toBeDefined();
  });

  it('covers Terry specials', () => {
    expect(MOVE_NAME_MAP[AttackType.TERRY_BURN_KNUCKLE]).toBe('Burn Knuckle');
    expect(MOVE_NAME_MAP[AttackType.TERRY_POWER_WAVE]).toBe('Power Wave');
  });

  it('covers Kim specials', () => {
    expect(MOVE_NAME_MAP[AttackType.KIM_HIENZAN]).toBe('飛燕斬');
    expect(MOVE_NAME_MAP[AttackType.KIM_HANGETSU]).toBeDefined();
  });

  it('DM and SDM share same name', () => {
    expect(MOVE_NAME_MAP[AttackType.DM_TEN_HA_OU]).toBe(MOVE_NAME_MAP[AttackType.SDM_TEN_HA_OU]);
    expect(MOVE_NAME_MAP[AttackType.DM_OROCHINAGI]).toBe(MOVE_NAME_MAP[AttackType.SDM_OROCHINAGI]);
  });
});

// ===== COMBO_ROUTES =====

function validateComboStep(step: ComboStep, label: string) {
  expect(step.type, `${label}.type`).toBeDefined();
  expect(['button', 'special'], `${label}.type value`).toContain(step.type);
  expect(typeof step.attack, `${label}.attack type`).toBe('string');
  expect(step.attack.length, `${label}.attack length`).toBeGreaterThan(0);
  expect(typeof step.delay, `${label}.delay type`).toBe('number');
  expect(step.delay, `${label}.delay >= 0`).toBeGreaterThanOrEqual(0);
}

describe('COMBO_ROUTES', () => {
  const charIds = Object.keys(COMBO_ROUTES);

  it('has entries for multiple characters', () => {
    expect(charIds.length).toBeGreaterThan(3);
  });

  it('all character routes are non-empty arrays', () => {
    for (const charId of charIds) {
      const routes = COMBO_ROUTES[charId];
      expect(routes.length, `${charId} routes`).toBeGreaterThan(0);
    }
  });

  it('all combo steps have valid structure', () => {
    for (const [charId, routes] of Object.entries(COMBO_ROUTES)) {
      for (let i = 0; i < routes.length; i++) {
        validateComboStep(routes[i], `${charId}[${i}]`);
      }
    }
  });

  it('has ryo routes', () => {
    expect(COMBO_ROUTES['ryo']).toBeDefined();
    expect(COMBO_ROUTES['ryo'].length).toBeGreaterThan(0);
  });

  it('has kyo routes', () => {
    expect(COMBO_ROUTES['kyo']).toBeDefined();
  });

  it('has iori routes', () => {
    expect(COMBO_ROUTES['iori']).toBeDefined();
  });

  it('all routes start with a button step', () => {
    for (const [charId, routes] of Object.entries(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      expect(routes[0].type, `${charId} first step type`).toBe('button');
    }
  });

  it('delay is monotonically non-decreasing within each route', () => {
    for (const [charId, routes] of Object.entries(COMBO_ROUTES)) {
      for (let i = 1; i < routes.length; i++) {
        expect(routes[i].delay, `${charId}[${i}].delay >= ${charId}[${i - 1}].delay`).toBeGreaterThanOrEqual(routes[i - 1].delay);
      }
    }
  });
});

// ===== JUMP_IN_ROUTE =====

describe('JUMP_IN_ROUTE', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(JUMP_IN_ROUTE)).toBe(true);
    expect(JUMP_IN_ROUTE.length).toBeGreaterThan(0);
  });

  it('all steps have valid structure', () => {
    for (let i = 0; i < JUMP_IN_ROUTE.length; i++) {
      validateComboStep(JUMP_IN_ROUTE[i], `JUMP_IN[${i}]`);
    }
  });
});

// ===== AIR_COMBO_ROUTES =====

describe('AIR_COMBO_ROUTES', () => {
  it('is an object', () => {
    expect(typeof AIR_COMBO_ROUTES).toBe('object');
  });

  it('has entries for some characters', () => {
    const keys = Object.keys(AIR_COMBO_ROUTES);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('all air combo steps have valid structure', () => {
    for (const [charId, routes] of Object.entries(AIR_COMBO_ROUTES)) {
      if (!routes) continue;
      for (let i = 0; i < routes.length; i++) {
        validateComboStep(routes[i], `AIR_${charId}[${i}]`);
      }
    }
  });
});

// ===== applyComboStep =====

function makeBaseInput(): ResolvedInput {
  return {
    up: false, down: false, forward: false, back: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false,
    buttonAPressed: false, buttonBPressed: false,
    buttonCPressed: false, buttonDPressed: false,
    throwAttackPressed: false, burstPressed: false,
    punchPressed: false, kickPressed: false,
  };
}

describe('applyComboStep', () => {
  it('sets buttonC for closeC attack', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'button', attack: 'closeC', delay: 0 };
    applyComboStep(step, base);
    expect(base.buttonC).toBe(true);
    expect(base.buttonCPressed).toBe(true);
    expect(base.punchPressed).toBe(true);
  });

  it('sets buttonA for standA attack', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'button', attack: 'standA', delay: 2 };
    applyComboStep(step, base);
    expect(base.buttonA).toBe(true);
    expect(base.buttonAPressed).toBe(true);
    expect(base.punchPressed).toBe(true);
  });

  it('sets buttonC for special default case', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'special', attack: 'unknownSpecial', delay: 3 };
    applyComboStep(step, base);
    expect(base.buttonC).toBe(true);
    expect(base.buttonCPressed).toBe(true);
    expect(base.punchPressed).toBe(true);
  });

  it('sets forward + buttonA for ryoTsurizao', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'button', attack: 'ryoTsurizao', delay: 3 };
    applyComboStep(step, base);
    expect(base.forward).toBe(true);
    expect(base.buttonA).toBe(true);
    expect(base.punchPressed).toBe(true);
  });

  it('does not crash on unknown button attack', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'button', attack: 'nonExistentAttack', delay: 0 };
    expect(() => applyComboStep(step, base)).not.toThrow();
  });

  it('sets buttonC for jumpC attack', () => {
    const base = makeBaseInput();
    const step: ComboStep = { type: 'button', attack: 'jumpC', delay: 0 };
    applyComboStep(step, base);
    expect(base.buttonC).toBe(true);
    expect(base.punchPressed).toBe(true);
  });
});

// ===== routeComboSpecial =====

describe('routeComboSpecial', () => {
  it('returns null for unknown character', () => {
    const result = routeComboSpecial('unknown', 'test', {} as any, {} as any, 0);
    expect(result).toBeNull();
  });

  it('returns AttackType for known iori route', () => {
    const result = routeComboSpecial('iori', 'aoihana1', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.IORI_AOIHANA);
  });

  it('returns AttackType for iori aoihana2', () => {
    const result = routeComboSpecial('iori', 'aoihana2', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.IORI_AOIHANA_2);
  });

  it('returns default for iori unknown attack', () => {
    const result = routeComboSpecial('iori', 'unknownAttack', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.IORI_AOIHANA);
  });

  it('returns AttackType for terry burnKnuckle', () => {
    const result = routeComboSpecial('terry', 'burnKnuckle', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.TERRY_BURN_KNUCKLE);
  });

  it('returns AttackType for ryo ryoKoouC', () => {
    const result = routeComboSpecial('ryo', 'ryoKoouC', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.RYO_KOOU_C);
  });

  it('returns AttackType for kim hiensen default', () => {
    const result = routeComboSpecial('kim', 'unknown', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.KIM_HIENZAN);
  });
});
