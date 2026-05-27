/**
 * Ryo Cancel Paths Tests
 *
 * Covers: cancel route matrix, normal->special, special->DM,
 * rapid cancel, free cancel (MAX mode), validation logic.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_CANCEL_PATHS,
  findCancelRoute,
  getCancelTargets,
  validateCancel,
  getCancelRoutesByType,
  isCancelSource,
  type CancelType,
} from '../src/content/characters/ryo/cancelPaths.js';
import {
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  MAX_MODE_DURATION,
} from '../src/core/constants.js';

// ── 1. Cancel Path Matrix ───────────────────────────────────────
describe('Ryo Cancel Path Matrix', () => {
  it('has cancel paths defined', () => {
    expect(RYO_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('all routes have valid from/to pairs', () => {
    for (const route of RYO_CANCEL_PATHS) {
      expect(route.from, 'route.from must be non-empty').toBeTruthy();
      expect(route.to.length, `route.to for ${route.from} must be non-empty`).toBeGreaterThan(0);
    }
  });

  it('all routes have valid cancel types', () => {
    const validTypes: CancelType[] = ['normal', 'rapid', 'super', 'free', 'command'];
    for (const route of RYO_CANCEL_PATHS) {
      expect(validTypes, `route type "${route.cancelType}" for ${route.from}`).toContain(route.cancelType);
    }
  });

  it('normal cancel routes have zero stock cost', () => {
    const normalRoutes = getCancelRoutesByType('normal');
    for (const route of normalRoutes) {
      expect(route.stockCost).toBe(0);
    }
  });

  it('rapid cancel routes have zero stock cost', () => {
    const rapidRoutes = getCancelRoutesByType('rapid');
    for (const route of rapidRoutes) {
      expect(route.stockCost).toBe(0);
    }
  });

  it('super cancel routes cost extra stock', () => {
    const superRoutes = getCancelRoutesByType('super');
    for (const route of superRoutes) {
      expect(route.stockCost).toBeGreaterThanOrEqual(1);
    }
  });

  it('free cancel routes drain MAX timer', () => {
    const freeRoutes = getCancelRoutesByType('free');
    for (const route of freeRoutes) {
      expect(route.timerCost).toBeGreaterThan(0);
    }
  });
});

// ── 2. Normal -> Special Cancel Routes ──────────────────────────
describe('Normal -> Special Cancels', () => {
  it('STAND_A can cancel to RYO_KOOU', () => {
    const route = findCancelRoute('STAND_A', 'RYO_KOOU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('normal');
  });

  it('STAND_C can cancel to RYO_KOOU_C', () => {
    const route = findCancelRoute('STAND_C', 'RYO_KOOU_C');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('normal');
  });

  it('CLOSE_C can cancel to RYO_KO_HOU_C', () => {
    const route = findCancelRoute('CLOSE_C', 'RYO_KO_HOU_C');
    expect(route).not.toBeNull();
  });

  it('CROUCH_C can cancel to RYO_HIEN', () => {
    const route = findCancelRoute('CROUCH_C', 'RYO_HIEN');
    expect(route).not.toBeNull();
  });

  it('CROUCH_A can cancel to specials', () => {
    const targets = getCancelTargets('CROUCH_A');
    expect(targets).toContain('RYO_KOOU');
    expect(targets).toContain('RYO_KO_HOU');
  });

  it('command normal RYO_TSURIZAO can cancel to specials', () => {
    const route = findCancelRoute('RYO_TSURIZAO', 'RYO_KOOU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('command');
    expect(route!.requiresHit).toBe(true);
  });

  it('normal cancel works on block (requiresHit=false)', () => {
    const route = findCancelRoute('STAND_C', 'RYO_KOOU');
    expect(route).not.toBeNull();
    expect(route!.requiresHit).toBe(false);
  });

  it('all grounded normals are valid cancel sources', () => {
    const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const n of normals) {
      expect(isCancelSource(n), `${n} should be a cancel source`).toBe(true);
    }
  });

  it('jump normals are NOT cancel sources for grounded specials', () => {
    const route = findCancelRoute('JUMP_C', 'RYO_KOOU');
    expect(route).toBeNull();
  });
});

// ── 3. Special -> DM (Super Cancel) Routes ──────────────────────
describe('Special -> DM (Super Cancel)', () => {
  it('RYO_KOOU can super cancel to DM_TEN_HA_OU', () => {
    const route = findCancelRoute('RYO_KOOU', 'DM_TEN_HA_OU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
    expect(route!.stockCost).toBe(SUPER_CANCEL_STOCK_COST);
  });

  it('RYO_KOOU_C can super cancel to DM_RYUKO_RANBU', () => {
    const route = findCancelRoute('RYO_KOOU_C', 'DM_RYUKO_RANBU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('RYO_KO_HOU can super cancel to DM_TEN_HA_OU', () => {
    const route = findCancelRoute('RYO_KO_HOU', 'DM_TEN_HA_OU');
    expect(route).not.toBeNull();
  });

  it('RYO_KO_HOU_C can super cancel to DM_RYUKO_RANBU', () => {
    const route = findCancelRoute('RYO_KO_HOU_C', 'DM_RYUKO_RANBU');
    expect(route).not.toBeNull();
  });

  it('RYO_HIEN can super cancel to DMs', () => {
    const route = findCancelRoute('RYO_HIEN', 'DM_TEN_HA_OU');
    expect(route).not.toBeNull();
    expect(route!.requiresHit).toBe(true);
  });

  it('RYO_HAOU can super cancel to DMs', () => {
    const route = findCancelRoute('RYO_HAOU', 'DM_RYUKO_RANBU');
    expect(route).not.toBeNull();
  });

  it('super cancel has wider window than normal cancel', () => {
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThanOrEqual(CANCEL_WINDOW_NORMAL);
  });

  it('all Ryo specials can super cancel to at least one DM', () => {
    const specials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU'];
    const dms = ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'];
    for (const sp of specials) {
      const hasRoute = dms.some(dm => findCancelRoute(sp, dm) !== null);
      expect(hasRoute, `${sp} should have super cancel route to a DM`).toBe(true);
    }
  });
});

// ── 4. Rapid Cancel (Light Normal Chains) ───────────────────────
describe('Rapid Cancel (Light Normals)', () => {
  it('STAND_A can rapid cancel to STAND_B', () => {
    const route = findCancelRoute('STAND_A', 'STAND_B');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('rapid');
  });

  it('CROUCH_A can rapid cancel to STAND_A', () => {
    const route = findCancelRoute('CROUCH_A', 'STAND_A');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('rapid');
  });

  it('CLOSE_A can rapid cancel to CROUCH_A', () => {
    const route = findCancelRoute('CLOSE_A', 'CROUCH_A');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('rapid');
  });

  it('rapid cancel requires hit', () => {
    const route = findCancelRoute('STAND_A', 'STAND_B');
    expect(route!.requiresHit).toBe(true);
  });

  it('rapid cancel has narrow window', () => {
    const rapidRoutes = getCancelRoutesByType('rapid');
    for (const r of rapidRoutes) {
      expect(r.windowFrames).toBeLessThanOrEqual(CANCEL_WINDOW_RAPID);
    }
  });

  it('light normals cannot rapid cancel to heavy normals', () => {
    const route = findCancelRoute('STAND_A', 'STAND_C');
    // This should be null for rapid cancel (STAND_C is not in rapid targets)
    if (route && route.cancelType === 'rapid') {
      expect.fail('STAND_A should not rapid cancel to STAND_C');
    }
    // If there's a normal cancel route, that's fine (but not rapid)
  });
});

// ── 5. Free Cancel (MAX Mode) ───────────────────────────────────
describe('Free Cancel (MAX Mode)', () => {
  it('RYO_KOOU can free cancel to RYO_KO_HOU', () => {
    const route = findCancelRoute('RYO_KOOU', 'RYO_KO_HOU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('free');
    expect(route!.timerCost).toBe(FREE_CANCEL_TIMER_COST);
  });

  it('RYO_HIEN can free cancel to RYO_KOOU', () => {
    const route = findCancelRoute('RYO_HIEN', 'RYO_KOOU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('free');
  });

  it('free cancel requires MAX mode', () => {
    const result = validateCancel('RYO_KOOU', 'RYO_KO_HOU', true, 5, false, 0, MAX_MODE_DURATION, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('MAX mode');
  });

  it('free cancel requires hit', () => {
    const result = validateCancel('RYO_KOOU', 'RYO_KO_HOU', false, 5, true, MAX_MODE_DURATION, MAX_MODE_DURATION, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('hit');
  });

  it('free cancel works with MAX mode active and hit', () => {
    const result = validateCancel('RYO_KOOU', 'RYO_KO_HOU', true, 5, true, MAX_MODE_DURATION, MAX_MODE_DURATION, 1);
    expect(result.valid).toBe(true);
  });

  it('free cancel fails when MAX timer is too low', () => {
    const result = validateCancel('RYO_KOOU', 'RYO_KO_HOU', true, 5, true, 10, MAX_MODE_DURATION, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('timer');
  });
});

// ── 6. Cancel Validation ────────────────────────────────────────
describe('Cancel Validation', () => {
  it('valid cancel passes all checks', () => {
    const result = validateCancel('STAND_C', 'RYO_KOOU', true, 3, false, 0, 0, 1);
    expect(result.valid).toBe(true);
  });

  it('invalid route returns error', () => {
    const result = validateCancel('STAND_A', 'DM_TEN_HA_OU', true, 5, false, 0, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('No cancel route');
  });

  it('super cancel requires hit', () => {
    const result = validateCancel('RYO_KOOU', 'DM_TEN_HA_OU', false, 5, false, 0, 0, 1);
    expect(result.valid).toBe(false);
  });

  it('super cancel requires sufficient stocks', () => {
    const result = validateCancel('RYO_KOOU', 'DM_TEN_HA_OU', true, 0, false, 0, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('stocks');
  });

  it('cancel window expiration rejects late cancels', () => {
    const result = validateCancel('STAND_C', 'RYO_KOOU', true, 3, false, 0, 0, 10);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expired');
  });

  it('cancel within window succeeds', () => {
    const result = validateCancel('STAND_C', 'RYO_KOOU', true, 3, false, 0, 0, 1);
    expect(result.valid).toBe(true);
  });
});

// ── 7. Cancel Route Queries ─────────────────────────────────────
describe('Cancel Route Queries', () => {
  it('getCancelTargets returns all valid targets', () => {
    const targets = getCancelTargets('STAND_C');
    expect(targets.length).toBeGreaterThan(0);
    expect(targets).toContain('RYO_KOOU');
    expect(targets).toContain('RYO_KO_HOU');
    expect(targets).toContain('RYO_HIEN');
  });

  it('getCancelRoutesByType filters correctly', () => {
    const superRoutes = getCancelRoutesByType('super');
    expect(superRoutes.length).toBeGreaterThan(0);
    for (const r of superRoutes) {
      expect(r.cancelType).toBe('super');
    }
  });

  it('isCancelSource identifies all cancel sources', () => {
    expect(isCancelSource('STAND_A')).toBe(true);
    expect(isCancelSource('RYO_KOOU')).toBe(true);
    expect(isCancelSource('DM_TEN_HA_OU')).toBe(false);
  });

  it('findCancelRoute returns null for invalid pair', () => {
    expect(findCancelRoute('JUMP_C', 'RYO_KOOU')).toBeNull();
    expect(findCancelRoute('STAND_A', 'DM_TEN_HA_OU')).toBeNull();
  });
});

// ── New special moves cancel routes ─────────────────────────────
describe('Ryo new specials cancel routes (KOOUKEN_D/HIO_HACKER/ZANRETSU_KEN)', () => {
  const newSpecials = ['RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'];

  for (const special of newSpecials) {
    describe(`${special}`, () => {
      it('is a cancel target from STAND_C (heavy normal)', () => {
        const targets = getCancelTargets('STAND_C');
        expect(targets).toContain(special);
      });

      it('is a cancel target from CLOSE_C (heavy close normal)', () => {
        const targets = getCancelTargets('CLOSE_C');
        expect(targets).toContain(special);
      });

      it('has super cancel route to DM_TEN_HA_OU', () => {
        const route = findCancelRoute(special, 'DM_TEN_HA_OU');
        expect(route, `No super cancel from ${special} to DM_TEN_HA_OU`).toBeDefined();
        expect(route!.cancelType).toBe('super');
      });

      it('has super cancel route to DM_RYUKO_RANBU', () => {
        const route = findCancelRoute(special, 'DM_RYUKO_RANBU');
        expect(route, `No super cancel from ${special} to DM_RYUKO_RANBU`).toBeDefined();
        expect(route!.cancelType).toBe('super');
      });

      it('is a cancel source (super cancel)', () => {
        expect(isCancelSource(special)).toBe(true);
      });
    });
  }
});
