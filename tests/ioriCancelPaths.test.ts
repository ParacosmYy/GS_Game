/**
 * Iori Cancel Paths Regression Tests
 *
 * Validates Iori's cancel route matrix and validation API.
 */
import { describe, it, expect } from 'vitest';
import {
  IORI_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  getBestCancelRoute,
} from '../src/content/characters/iori/cancelPaths.js';

describe('IORI_CANCEL_PATHS data structure', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(IORI_CANCEL_PATHS)).toBe(true);
    expect(IORI_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('every route has required fields', () => {
    for (const route of IORI_CANCEL_PATHS) {
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

  it('has rekka cancel type routes (Aoihana chains)', () => {
    expect(getCancelRoutesByType('rekka').length).toBeGreaterThan(0);
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
});

describe('Iori findCancelRoute', () => {
  it('finds STAND_A -> IORI_AOIHANA', () => {
    const route = findCancelRoute('STAND_A', 'IORI_AOIHANA');
    expect(route).not.toBeNull();
    expect(route!.from).toBe('STAND_A');
  });

  it('finds STAND_C -> IORI_ONIYAKI', () => {
    expect(findCancelRoute('STAND_C', 'IORI_ONIYAKI')).not.toBeNull();
  });

  it('finds rekka chain routes (Aoihana -> Aoihana_2)', () => {
    const route = findCancelRoute('IORI_AOIHANA', 'IORI_AOIHANA_2');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('rekka');
  });

  it('finds C-version rekka chain', () => {
    const route = findCancelRoute('IORI_AOIHANA_C', 'IORI_AOIHANA_C_2');
    expect(route).not.toBeNull();
  });

  it('finds super cancel to DM', () => {
    const route = findCancelRoute('IORI_ONIYAKI', 'DM_YATAGARASU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('returns null for invalid cancel', () => {
    expect(findCancelRoute('STAND_A', 'INVALID')).toBeNull();
  });
});

describe('Iori getCancelTargets', () => {
  it('STAND_A targets include Iori specials', () => {
    const targets = getCancelTargets('STAND_A');
    expect(targets).toContain('IORI_AOIHANA');
    expect(targets).toContain('IORI_YAMIBARAI');
  });

  it('STAND_C targets include C-version specials', () => {
    const targets = getCancelTargets('STAND_C');
    expect(targets).toContain('IORI_YAMIBARAI_C');
    expect(targets).toContain('IORI_ONIYAKI_C');
  });

  it('returns empty for non-cancel source', () => {
    expect(getCancelTargets('NONEXISTENT')).toEqual([]);
  });
});

describe('Iori validateCancel', () => {
  it('validates normal cancel', () => {
    const result = validateCancel('STAND_A', 'IORI_AOIHANA', true, 3, false, 0, 0, 0);
    expect(result.valid).toBe(true);
  });

  it('rejects non-existent route', () => {
    expect(validateCancel('STAND_A', 'INVALID', true, 3, false, 0, 0, 0).valid).toBe(false);
  });

  it('rejects expired cancel window', () => {
    const route = findCancelRoute('STAND_A', 'IORI_YAMIBARAI');
    const result = validateCancel('STAND_A', 'IORI_YAMIBARAI', true, 3, false, 0, 0, route!.windowFrames + 1);
    expect(result.valid).toBe(false);
  });

  it('rejects super cancel without stocks', () => {
    expect(validateCancel('IORI_ONIYAKI', 'DM_YATAGARASU', true, 0, false, 0, 0, 0).valid).toBe(false);
  });

  it('rejects free cancel without MAX mode', () => {
    const freeRoutes = getCancelRoutesByType('free');
    if (freeRoutes.length > 0) {
      const r = freeRoutes[0];
      expect(validateCancel(r.from, r.to[0], true, 3, false, 0, 0, 0).valid).toBe(false);
    }
  });
});

describe('Iori isCancelSource', () => {
  it('identifies standing normals', () => {
    expect(isCancelSource('STAND_A')).toBe(true);
    expect(isCancelSource('STAND_C')).toBe(true);
  });

  it('identifies crouching normals', () => {
    expect(isCancelSource('CROUCH_A')).toBe(true);
    expect(isCancelSource('CROUCH_C')).toBe(true);
  });

  it('rejects non-source', () => {
    expect(isCancelSource('NONEXISTENT')).toBe(false);
  });
});

describe('Iori getBestCancelRoute', () => {
  it('returns route for normal sources', () => {
    expect(getBestCancelRoute('STAND_C', 3, false)).not.toBeNull();
  });

  it('returns null for non-source', () => {
    expect(getBestCancelRoute('NONEXISTENT', 3, false)).toBeNull();
  });
});
