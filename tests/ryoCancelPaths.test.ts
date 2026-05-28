/**
 * Ryo Cancel Paths Regression Tests
 *
 * Validates Ryo's cancel route matrix and validation API.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
} from '../src/content/characters/ryo/cancelPaths.js';

describe('RYO_CANCEL_PATHS data structure', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(RYO_CANCEL_PATHS)).toBe(true);
    expect(RYO_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('every route has required fields', () => {
    for (const route of RYO_CANCEL_PATHS) {
      expect(route.from).toBeTruthy();
      expect(Array.isArray(route.to)).toBe(true);
      expect(route.to.length).toBeGreaterThan(0);
      expect(route.cancelType).toBeTruthy();
      expect(typeof route.requiresHit).toBe('boolean');
      expect(typeof route.stockCost).toBe('number');
      expect(typeof route.timerCost).toBe('number');
      expect(route.windowFrames).toBeGreaterThan(0);
    }
  });

  it('has normal cancel type routes', () => {
    expect(getCancelRoutesByType('normal').length).toBeGreaterThan(0);
  });

  it('has super cancel type routes', () => {
    expect(getCancelRoutesByType('super').length).toBeGreaterThan(0);
  });

  it('has rapid cancel type routes', () => {
    expect(getCancelRoutesByType('rapid').length).toBeGreaterThan(0);
  });

  it('has free cancel type routes (MAX mode)', () => {
    expect(getCancelRoutesByType('free').length).toBeGreaterThan(0);
  });

  it('normal cancels have zero stock cost', () => {
    for (const route of getCancelRoutesByType('normal')) {
      expect(route.stockCost).toBe(0);
    }
  });

  it('super cancels have positive stock cost', () => {
    for (const route of getCancelRoutesByType('super')) {
      expect(route.stockCost).toBeGreaterThan(0);
    }
  });

  it('STAND_C targets include C-version specials', () => {
    const targets = getCancelTargets('STAND_C');
    expect(targets).toContain('RYO_KOOU_C');
    expect(targets).toContain('RYO_KO_HOU_C');
  });
});

describe('Ryo findCancelRoute', () => {
  it('finds STAND_A -> RYO_KOOU', () => {
    const route = findCancelRoute('STAND_A', 'RYO_KOOU');
    expect(route).not.toBeNull();
    expect(route!.from).toBe('STAND_A');
  });

  it('finds STAND_C -> RYO_KO_HOU', () => {
    expect(findCancelRoute('STAND_C', 'RYO_KO_HOU')).not.toBeNull();
  });

  it('finds CROUCH_A -> RYO_ZANRETSU_KEN', () => {
    expect(findCancelRoute('CROUCH_A', 'RYO_ZANRETSU_KEN')).not.toBeNull();
  });

  it('finds super cancel to DM', () => {
    const route = findCancelRoute('RYO_KOOU', 'DM_TEN_HA_OU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('returns null for invalid cancel', () => {
    expect(findCancelRoute('STAND_A', 'INVALID')).toBeNull();
  });

  it('returns null for non-existent source', () => {
    expect(findCancelRoute('NONEXISTENT', 'RYO_KOOU')).toBeNull();
  });
});

describe('Ryo getCancelTargets', () => {
  it('STAND_A targets include Ryo specials', () => {
    const targets = getCancelTargets('STAND_A');
    expect(targets).toContain('RYO_KOOU');
    expect(targets).toContain('RYO_KO_HOU');
    expect(targets).toContain('RYO_HIEN');
  });

  it('returns empty for non-cancel source', () => {
    expect(getCancelTargets('NONEXISTENT')).toEqual([]);
  });
});

describe('Ryo validateCancel', () => {
  it('validates normal cancel', () => {
    expect(validateCancel('STAND_A', 'RYO_KOOU', true, 3, false, 0, 0, 0).valid).toBe(true);
  });

  it('rejects non-existent route', () => {
    expect(validateCancel('STAND_A', 'INVALID', true, 3, false, 0, 0, 0).valid).toBe(false);
  });

  it('rejects expired cancel window', () => {
    const route = findCancelRoute('STAND_A', 'RYO_KOOU');
    const result = validateCancel('STAND_A', 'RYO_KOOU', true, 3, false, 0, 0, route!.windowFrames + 1);
    expect(result.valid).toBe(false);
  });

  it('rejects super cancel without stocks', () => {
    expect(validateCancel('RYO_KOOU', 'DM_TEN_HA_OU', true, 0, false, 0, 0, 0).valid).toBe(false);
  });

  it('rejects free cancel without MAX mode', () => {
    const freeRoutes = getCancelRoutesByType('free');
    if (freeRoutes.length > 0) {
      const r = freeRoutes[0];
      expect(validateCancel(r.from, r.to[0], true, 3, false, 0, 0, 0).valid).toBe(false);
    }
  });

  it('accepts super cancel with stocks', () => {
    const result = validateCancel('RYO_KOOU', 'DM_TEN_HA_OU', true, 3, false, 0, 0, 0);
    expect(result.valid).toBe(true);
  });
});

describe('Ryo isCancelSource', () => {
  it('identifies standing normals', () => {
    expect(isCancelSource('STAND_A')).toBe(true);
    expect(isCancelSource('STAND_C')).toBe(true);
  });

  it('identifies crouching normals', () => {
    expect(isCancelSource('CROUCH_A')).toBe(true);
  });

  it('rejects non-source', () => {
    expect(isCancelSource('NONEXISTENT')).toBe(false);
  });
});

describe('Ryo getBestCancelRoute', () => {
  it('returns route for normal sources', () => {
    expect(getBestCancelRoute('STAND_C', 3, false)).not.toBeNull();
  });

  it('returns null for non-source', () => {
    expect(getBestCancelRoute('NONEXISTENT', 3, false)).toBeNull();
  });
});
