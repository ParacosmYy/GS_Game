import { describe, it, expect } from 'vitest';
import { COMBO_ROUTES, JUMP_IN_ROUTE } from '../src/ai/aiRoutes.js';

describe('aiRoutes', () => {
  it('COMBO_ROUTES is object', () => {
    expect(COMBO_ROUTES).toBeDefined();
    expect(typeof COMBO_ROUTES).toBe('object');
  });
  it('COMBO_ROUTES has entries', () => {
    expect(Object.keys(COMBO_ROUTES).length).toBeGreaterThan(0);
  });
  it('JUMP_IN_ROUTE is array', () => {
    expect(Array.isArray(JUMP_IN_ROUTE)).toBe(true);
  });
  it('each combo route value is array', () => {
    for (const steps of Object.values(COMBO_ROUTES)) {
      expect(Array.isArray(steps)).toBe(true);
    }
  });
  it('combo steps have attack and delay fields', () => {
    for (const steps of Object.values(COMBO_ROUTES)) {
      for (const step of steps as Array<Record<string, unknown>>) {
        expect(step).toHaveProperty('attack');
        expect(step).toHaveProperty('delay');
      }
    }
  });
});
