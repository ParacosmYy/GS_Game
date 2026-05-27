/**
 * Kyo & Iori Cancel Path Structure Tests
 *
 * Validates cancel route matrices have correct structure,
 * essential cancel paths exist, and cancel types are valid.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_CANCEL_PATHS,
  findCancelRoute as findKyoCancelRoute,
  getCancelTargets as getKyoCancelTargets,
  isCancelSource as isKyoCancelSource,
  type CancelType as KyoCancelType,
} from '../src/content/characters/kyo/cancelPaths.js';
import {
  IORI_CANCEL_PATHS,
  findCancelRoute as findIoriCancelRoute,
  getCancelTargets as getIoriCancelTargets,
  isCancelSource as isIoriCancelSource,
  type CancelType as IoriCancelType,
} from '../src/content/characters/iori/cancelPaths.js';

const VALID_CANCEL_TYPES = ['normal', 'rapid', 'super', 'free', 'command', 'rekka'];

describe('Kyo cancel path structure', () => {
  it('has cancel paths defined', () => {
    expect(KYO_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('all routes have valid cancel types', () => {
    for (const route of KYO_CANCEL_PATHS) {
      expect(VALID_CANCEL_TYPES, `route type "${route.cancelType}" for ${route.from}`).toContain(route.cancelType);
    }
  });

  it('all routes have non-empty from/to', () => {
    for (const route of KYO_CANCEL_PATHS) {
      expect(route.from).toBeTruthy();
      expect(route.to.length, `${route.from} has empty to`).toBeGreaterThan(0);
    }
  });

  it('STAND_C can cancel to specials', () => {
    const targets = getKyoCancelTargets('STAND_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('CLOSE_C can cancel to specials', () => {
    const targets = getKyoCancelTargets('CLOSE_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('CROUCH_C can cancel to specials', () => {
    const targets = getKyoCancelTargets('CROUCH_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('specials can super cancel to DM', () => {
    const route = findKyoCancelRoute('KYO_ONIYAKI', 'DM_OROCHINAGI');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('specials can super cancel to SDM', () => {
    const route = findKyoCancelRoute('KYO_ONIYAKI', 'SDM_OROCHINAGI');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('has free cancel routes (MAX mode)', () => {
    const freeRoutes = KYO_CANCEL_PATHS.filter(r => r.cancelType === 'free');
    expect(freeRoutes.length).toBeGreaterThan(0);
  });

  it('grounded normals are valid cancel sources', () => {
    const normals = ['STAND_A', 'STAND_C', 'CLOSE_C', 'CROUCH_C'];
    for (const n of normals) {
      expect(isKyoCancelSource(n), `${n} should be a cancel source`).toBe(true);
    }
  });

  it('has rekka followup routes (Aragami chain)', () => {
    const targets = getKyoCancelTargets('KYO_ARAGAMI');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('has rekka followup routes (Dokugami chain)', () => {
    const targets = getKyoCancelTargets('KYO_DOKUGAMI');
    expect(targets.length).toBeGreaterThan(0);
  });
});

describe('Iori cancel path structure', () => {
  it('has cancel paths defined', () => {
    expect(IORI_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('all routes have valid cancel types', () => {
    for (const route of IORI_CANCEL_PATHS) {
      expect(VALID_CANCEL_TYPES, `route type "${route.cancelType}" for ${route.from}`).toContain(route.cancelType);
    }
  });

  it('all routes have non-empty from/to', () => {
    for (const route of IORI_CANCEL_PATHS) {
      expect(route.from).toBeTruthy();
      expect(route.to.length, `${route.from} has empty to`).toBeGreaterThan(0);
    }
  });

  it('STAND_C can cancel to specials', () => {
    const targets = getIoriCancelTargets('STAND_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('CLOSE_C can cancel to specials', () => {
    const targets = getIoriCancelTargets('CLOSE_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('CROUCH_C can cancel to specials', () => {
    const targets = getIoriCancelTargets('CROUCH_C');
    expect(targets.length).toBeGreaterThan(0);
  });

  it('specials can super cancel to DM', () => {
    const route = findIoriCancelRoute('IORI_ONIYAKI', 'DM_YATAGARASU');
    expect(route).not.toBeNull();
    expect(route!.cancelType).toBe('super');
  });

  it('has free cancel routes (MAX mode)', () => {
    const freeRoutes = IORI_CANCEL_PATHS.filter(r => r.cancelType === 'free');
    expect(freeRoutes.length).toBeGreaterThan(0);
  });

  it('grounded normals are valid cancel sources', () => {
    const normals = ['STAND_A', 'STAND_C', 'CLOSE_C', 'CROUCH_C'];
    for (const n of normals) {
      expect(isIoriCancelSource(n), `${n} should be a cancel source`).toBe(true);
    }
  });

  it('has rekka followup routes (Aoihana chain)', () => {
    const targets = getIoriCancelTargets('IORI_AOIHANA');
    expect(targets.length).toBeGreaterThan(0);
  });
});
