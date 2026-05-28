/**
 * Cancel Path Structure Consistency — regression test
 * Verifies all 3 characters' cancel paths have valid structure,
 * valid cancel types, and consistent routing patterns.
 */
import { describe, it, expect } from 'vitest';
import { KYO_CANCEL_PATHS } from '../src/content/characters/kyo/cancelPaths.js';
import { IORI_CANCEL_PATHS } from '../src/content/characters/iori/cancelPaths.js';
import { RYO_CANCEL_PATHS } from '../src/content/characters/ryo/cancelPaths.js';

interface CancelRoute {
  from: string;
  to: string[];
  cancelType: string;
  requiresHit: boolean;
  stockCost: number;
  timerCost: number;
  windowFrames: number;
}

const VALID_CANCEL_TYPES = ['normal', 'rapid', 'super', 'free', 'command', 'rekka'];

function validatePaths(name: string, paths: CancelRoute[]): void {
  describe(`${name} cancel paths`, () => {
    it('has at least 10 routes', () => {
      expect(paths.length).toBeGreaterThanOrEqual(10);
    });

    it('all routes have valid cancelType', () => {
      for (const route of paths) {
        expect(VALID_CANCEL_TYPES, `${name} route from ${route.from}`).toContain(route.cancelType);
      }
    });

    it('all routes have non-empty "to" list', () => {
      for (const route of paths) {
        expect(route.to.length, `${name} ${route.from}.to`).toBeGreaterThan(0);
      }
    });

    it('all routes have positive windowFrames', () => {
      for (const route of paths) {
        expect(route.windowFrames, `${name} ${route.from}.windowFrames`).toBeGreaterThan(0);
      }
    });

    it('all routes have non-negative stockCost', () => {
      for (const route of paths) {
        expect(route.stockCost, `${name} ${route.from}.stockCost`).toBeGreaterThanOrEqual(0);
      }
    });

    it('all routes have timerCost in 0..1', () => {
      for (const route of paths) {
        expect(route.timerCost, `${name} ${route.from}.timerCost`).toBeGreaterThanOrEqual(0);
        expect(route.timerCost, `${name} ${route.from}.timerCost`).toBeLessThanOrEqual(1);
      }
    });

    it('super cancel routes have positive stockCost', () => {
      const superCancels = paths.filter(r => r.cancelType === 'super');
      for (const route of superCancels) {
        expect(route.stockCost, `${name} super cancel ${route.from}.stockCost`).toBeGreaterThan(0);
      }
    });

    it('free cancel routes have positive timerCost', () => {
      const freeCancels = paths.filter(r => r.cancelType === 'free');
      for (const route of freeCancels) {
        expect(route.timerCost, `${name} free cancel ${route.from}.timerCost`).toBeGreaterThan(0);
      }
    });

    it('rapid cancel routes have zero stockCost', () => {
      const rapidCancels = paths.filter(r => r.cancelType === 'rapid');
      for (const route of rapidCancels) {
        expect(route.stockCost, `${name} rapid cancel ${route.from}.stockCost`).toBe(0);
      }
    });

    it('normal cancel routes have requiresHit defined', () => {
      const normalCancels = paths.filter(r => r.cancelType === 'normal');
      for (const route of normalCancels) {
        expect(typeof route.requiresHit, `${name} normal cancel ${route.from}.requiresHit`).toBe('boolean');
      }
    });
  });
}

validatePaths('Kyo', KYO_CANCEL_PATHS as CancelRoute[]);
validatePaths('Iori', IORI_CANCEL_PATHS as CancelRoute[]);
validatePaths('Ryo', RYO_CANCEL_PATHS as CancelRoute[]);

describe('Cross-character cancel path consistency', () => {
  it('all 3 characters have normal cancel routes', () => {
    for (const paths of [KYO_CANCEL_PATHS, IORI_CANCEL_PATHS, RYO_CANCEL_PATHS]) {
      const normalRoutes = paths.filter(r => r.cancelType === 'normal');
      expect(normalRoutes.length, 'normal routes').toBeGreaterThan(0);
    }
  });

  it('all 3 characters have super cancel routes', () => {
    for (const paths of [KYO_CANCEL_PATHS, IORI_CANCEL_PATHS, RYO_CANCEL_PATHS]) {
      const superRoutes = paths.filter(r => r.cancelType === 'super');
      expect(superRoutes.length, 'super routes').toBeGreaterThan(0);
    }
  });

  it('all 3 characters have free cancel routes (MAX mode)', () => {
    for (const paths of [KYO_CANCEL_PATHS, IORI_CANCEL_PATHS, RYO_CANCEL_PATHS]) {
      const freeRoutes = paths.filter(r => r.cancelType === 'free');
      expect(freeRoutes.length, 'free routes').toBeGreaterThan(0);
    }
  });
});
