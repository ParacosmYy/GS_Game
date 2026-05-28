/**
 * Kyo Cancel Paths Regression Tests
 *
 * Validates Kyo's cancel route matrix and validation API.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
  type CancelRoute,
} from '../src/content/characters/kyo/cancelPaths.js';

// ===== Data Structure Validation =====

describe('KYO_CANCEL_PATHS data structure', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(KYO_CANCEL_PATHS)).toBe(true);
    expect(KYO_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('every route has required fields', () => {
    for (const route of KYO_CANCEL_PATHS) {
      expect(route.from, 'from').toBeTruthy();
      expect(Array.isArray(route.to), 'to is array').toBe(true);
      expect(route.to.length, 'to non-empty').toBeGreaterThan(0);
      expect(route.cancelType, 'cancelType').toBeTruthy();
      expect(typeof route.requiresHit, 'requiresHit').toBe('boolean');
      expect(typeof route.stockCost, 'stockCost').toBe('number');
      expect(typeof route.timerCost, 'timerCost').toBe('number');
      expect(typeof route.windowFrames, 'windowFrames').toBe('number');
      expect(route.windowFrames, 'windowFrames positive').toBeGreaterThan(0);
    }
  });

  it('has normal cancel type routes', () => {
    const normalRoutes = getCancelRoutesByType('normal');
    expect(normalRoutes.length).toBeGreaterThan(0);
  });

  it('has super cancel type routes', () => {
    const superRoutes = getCancelRoutesByType('super');
    expect(superRoutes.length).toBeGreaterThan(0);
  });

  it('has rapid cancel type routes', () => {
    const rapidRoutes = getCancelRoutesByType('rapid');
    expect(rapidRoutes.length).toBeGreaterThan(0);
  });

  it('has free cancel type routes (MAX mode)', () => {
    const freeRoutes = getCancelRoutesByType('free');
    expect(freeRoutes.length).toBeGreaterThan(0);
  });

  it('has rekka cancel type routes', () => {
    const rekkaRoutes = getCancelRoutesByType('rekka');
    expect(rekkaRoutes.length).toBeGreaterThan(0);
  });

  it('normal cancels have zero stock cost', () => {
    const normalRoutes = getCancelRoutesByType('normal');
    for (const route of normalRoutes) {
      expect(route.stockCost).toBe(0);
    }
  });

  it('super cancels have positive stock cost', () => {
    const superRoutes = getCancelRoutesByType('super');
    for (const route of superRoutes) {
      expect(route.stockCost).toBeGreaterThan(0);
    }
  });
});

// ===== findCancelRoute =====

describe('findCancelRoute', () => {
  it('finds STAND_A -> KYO_YAMIBARAI', () => {
    const route = findCancelRoute('STAND_A', 'KYO_YAMIBARAI');
    expect(route).not.toBeNull();
    expect(route!.from).toBe('STAND_A');
    expect(route!.to).toContain('KYO_YAMIBARAI');
  });

  it('finds STAND_C -> KYO_ONIYAKI', () => {
    const route = findCancelRoute('STAND_C', 'KYO_ONIYAKI');
    expect(route).not.toBeNull();
  });

  it('finds CROUCH_A -> KYO_ARAGAMI', () => {
    const route = findCancelRoute('CROUCH_A', 'KYO_ARAGAMI');
    expect(route).not.toBeNull();
  });

  it('returns null for invalid cancel', () => {
    expect(findCancelRoute('STAND_A', 'INVALID_MOVE')).toBeNull();
  });

  it('returns null for non-existent source', () => {
    expect(findCancelRoute('NONEXISTENT', 'KYO_YAMIBARAI')).toBeNull();
  });

  it('finds super cancel routes', () => {
    const route = findCancelRoute('KYO_ONIYAKI', 'DM_OROCHINAGI');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });
});

// ===== getCancelTargets =====

describe('getCancelTargets', () => {
  it('STAND_A has multiple cancel targets', () => {
    const targets = getCancelTargets('STAND_A');
    expect(targets.length).toBeGreaterThan(0);
    expect(targets).toContain('KYO_YAMIBARAI');
  });

  it('STAND_C targets include C-version specials', () => {
    const targets = getCancelTargets('STAND_C');
    expect(targets).toContain('KYO_YAMIBARAI');
    expect(targets).toContain('KYO_YAMIBARAI_C');
  });

  it('returns empty for non-cancel source', () => {
    expect(getCancelTargets('NONEXISTENT')).toEqual([]);
  });
});

// ===== validateCancel =====

describe('validateCancel', () => {
  it('validates normal cancel with sufficient resources', () => {
    const result = validateCancel('STAND_A', 'KYO_YAMIBARAI', true, 3, false, 0, 0, 0);
    expect(result.valid).toBe(true);
  });

  it('rejects non-existent cancel route', () => {
    const result = validateCancel('STAND_A', 'INVALID', true, 3, false, 0, 0, 0);
    expect(result.valid).toBe(false);
  });

  it('rejects cancel when window expired', () => {
    const route = findCancelRoute('STAND_A', 'KYO_YAMIBARAI');
    const result = validateCancel('STAND_A', 'KYO_YAMIBARAI', true, 3, false, 0, 0, route!.windowFrames + 1);
    expect(result.valid).toBe(false);
  });

  it('rejects super cancel without stocks', () => {
    const result = validateCancel('KYO_ONIYAKI', 'DM_OROCHINAGI', true, 0, false, 0, 0, 0);
    expect(result.valid).toBe(false);
  });

  it('rejects free cancel without MAX mode', () => {
    const freeRoutes = getCancelRoutesByType('free');
    if (freeRoutes.length > 0) {
      const route = freeRoutes[0];
      const result = validateCancel(route.from, route.to[0], true, 3, false, 0, 0, 0);
      expect(result.valid).toBe(false);
    }
  });

  it('rejects hit-required cancel without hit', () => {
    const superRoutes = getCancelRoutesByType('super');
    for (const route of superRoutes) {
      if (route.requiresHit) {
        const result = validateCancel(route.from, route.to[0], false, 3, false, 0, 0, 0);
        expect(result.valid).toBe(false);
      }
    }
  });
});

// ===== isCancelSource =====

describe('isCancelSource', () => {
  it('identifies standing normals as cancel sources', () => {
    expect(isCancelSource('STAND_A')).toBe(true);
    expect(isCancelSource('STAND_B')).toBe(true);
    expect(isCancelSource('STAND_C')).toBe(true);
    expect(isCancelSource('STAND_D')).toBe(true);
  });

  it('identifies crouching normals as cancel sources', () => {
    expect(isCancelSource('CROUCH_A')).toBe(true);
    expect(isCancelSource('CROUCH_C')).toBe(true);
  });

  it('rejects non-cancel sources', () => {
    expect(isCancelSource('NONEXISTENT')).toBe(false);
  });
});

// ===== getBestCancelRoute =====

describe('getBestCancelRoute', () => {
  it('returns a route for normal sources', () => {
    const route = getBestCancelRoute('STAND_C', 3, false);
    expect(route).not.toBeNull();
  });

  it('prefers super routes with stocks', () => {
    const route = getBestCancelRoute('KYO_ONIYAKI', 3, false);
    expect(route).not.toBeNull();
  });

  it('returns null for non-source', () => {
    expect(getBestCancelRoute('NONEXISTENT', 3, false)).toBeNull();
  });
});
