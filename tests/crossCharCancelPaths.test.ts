/**
 * Cross-Character Cancel Path Consistency Tests
 *
 * Validates structural consistency across Kyo, Iori, and Ryo cancel matrices.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_CANCEL_PATHS,
  findCancelRoute as kyoFind,
  getCancelTargets as kyoTargets,
  getCancelRoutesByType as kyoByType,
  isCancelSource as kyoIsSource,
} from '../src/content/characters/kyo/cancelPaths.js';
import {
  IORI_CANCEL_PATHS,
  findCancelRoute as ioriFind,
  getCancelTargets as ioriTargets,
  getCancelRoutesByType as ioriByType,
  isCancelSource as ioriIsSource,
} from '../src/content/characters/iori/cancelPaths.js';
import {
  RYO_CANCEL_PATHS,
  findCancelRoute as ryoFind,
  getCancelTargets as ryoTargets,
  getCancelRoutesByType as ryoByType,
  isCancelSource as ryoIsSource,
} from '../src/content/characters/ryo/cancelPaths.js';

const chars = [
  { name: 'Kyo', paths: KYO_CANCEL_PATHS, find: kyoFind, targets: kyoTargets, byType: kyoByType, isSource: kyoIsSource },
  { name: 'Iori', paths: IORI_CANCEL_PATHS, find: ioriFind, targets: ioriTargets, byType: ioriByType, isSource: ioriIsSource },
  { name: 'Ryo', paths: RYO_CANCEL_PATHS, find: ryoFind, targets: ryoTargets, byType: ryoByType, isSource: ryoIsSource },
];

// ===== Structural Consistency =====

describe('Cross-character cancel path structure', () => {
  it('all characters have normal cancel routes', () => {
    for (const c of chars) {
      expect(c.byType('normal').length, `${c.name} normal routes`).toBeGreaterThan(0);
    }
  });

  it('all characters have super cancel routes', () => {
    for (const c of chars) {
      expect(c.byType('super').length, `${c.name} super routes`).toBeGreaterThan(0);
    }
  });

  it('all characters have rapid cancel routes', () => {
    for (const c of chars) {
      expect(c.byType('rapid').length, `${c.name} rapid routes`).toBeGreaterThan(0);
    }
  });

  it('all characters have free cancel routes (MAX mode)', () => {
    for (const c of chars) {
      expect(c.byType('free').length, `${c.name} free routes`).toBeGreaterThan(0);
    }
  });

  it('all characters have cancel routes from every standing normal', () => {
    const STAND_NORMALS = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D'];
    for (const c of chars) {
      for (const normal of STAND_NORMALS) {
        expect(c.isSource(normal), `${c.name} ${normal} is cancel source`).toBe(true);
      }
    }
  });

  it('all characters have cancel routes from crouching normals', () => {
    const CROUCH_NORMALS = ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const c of chars) {
      for (const normal of CROUCH_NORMALS) {
        expect(c.isSource(normal), `${c.name} ${normal} is cancel source`).toBe(true);
      }
    }
  });

  it('all characters have cancel routes from close normals', () => {
    const CLOSE_NORMALS = ['CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D'];
    for (const c of chars) {
      for (const normal of CLOSE_NORMALS) {
        expect(c.isSource(normal), `${c.name} ${normal} is cancel source`).toBe(true);
      }
    }
  });

  it('normal cancel routes do not require hit (KOF2002 rule)', () => {
    for (const c of chars) {
      for (const route of c.byType('normal')) {
        expect(route.requiresHit, `${c.name} ${route.from} normal cancel requiresHit`).toBe(false);
      }
    }
  });

  it('normal cancel routes have zero stock cost', () => {
    for (const c of chars) {
      for (const route of c.byType('normal')) {
        expect(route.stockCost, `${c.name} ${route.from} normal cancel stockCost`).toBe(0);
      }
    }
  });

  it('super cancel routes require hit', () => {
    for (const c of chars) {
      for (const route of c.byType('super')) {
        expect(route.requiresHit, `${c.name} ${route.from} super cancel requiresHit`).toBe(true);
      }
    }
  });

  it('super cancel routes cost stocks', () => {
    for (const c of chars) {
      for (const route of c.byType('super')) {
        expect(route.stockCost, `${c.name} ${route.from} super cancel stockCost`).toBeGreaterThan(0);
      }
    }
  });

  it('rapid cancel routes target next light normal', () => {
    for (const c of chars) {
      const rapidRoutes = c.byType('rapid');
      expect(rapidRoutes.length, `${c.name} rapid routes`).toBeGreaterThan(0);
      // Rapid routes should chain between light normals
      for (const route of rapidRoutes) {
        const isLightSource = route.from.endsWith('_A') || route.from.endsWith('_B');
        expect(isLightSource, `${c.name} ${route.from} rapid source`).toBe(true);
      }
    }
  });

  it('free cancel routes only work in MAX mode (timerCost > 0)', () => {
    for (const c of chars) {
      for (const route of c.byType('free')) {
        expect(route.timerCost, `${c.name} ${route.from} free cancel timerCost`).toBeGreaterThan(0);
      }
    }
  });
});

// ===== No Overlap Between Characters =====

describe('Cross-character cancel path isolation', () => {
  it('Kyo and Iori have different normal cancel targets', () => {
    const kyoTargets_A = kyoTargets('STAND_A');
    const ioriTargets_A = ioriTargets('STAND_A');
    const overlap = kyoTargets_A.filter(t => ioriTargets_A.includes(t));
    // Character-specific specials should not overlap
    const kyoSpecific = kyoTargets_A.filter(t => t.startsWith('KYO_'));
    const ioriSpecific = ioriTargets_A.filter(t => t.startsWith('IORI_'));
    for (const k of kyoSpecific) {
      expect(ioriTargets_A).not.toContain(k);
    }
    for (const i of ioriSpecific) {
      expect(kyoTargets_A).not.toContain(i);
    }
  });

  it('Kyo and Ryo have different super cancel targets', () => {
    const kyoSuper = kyoByType('super').flatMap(r => r.to);
    const ryoSuper = ryoByType('super').flatMap(r => r.to);
    for (const k of kyoSuper) {
      expect(ryoSuper).not.toContain(k);
    }
  });

  it('Iori and Ryo have different super cancel targets', () => {
    const ioriSuper = ioriByType('super').flatMap(r => r.to);
    const ryoSuper = ryoByType('super').flatMap(r => r.to);
    for (const i of ioriSuper) {
      expect(ryoSuper).not.toContain(i);
    }
  });
});

// ===== KOF2002 Authenticity =====

describe('KOF2002 cancel authenticity', () => {
  it('C-version normals can cancel to C-version specials', () => {
    // STAND_C should be able to cancel to _C specials
    for (const c of chars) {
      const targets = c.targets('STAND_C');
      const hasCSpecial = targets.some(t => t.endsWith('_C') || t.endsWith('_D'));
      expect(hasCSpecial, `${c.name} STAND_C targets C/D specials`).toBe(true);
    }
  });

  it('light normals cannot cancel to DM directly', () => {
    for (const c of chars) {
      const lightTargets = c.targets('STAND_A');
      const hasDM = lightTargets.some(t => t.startsWith('DM_') || t.startsWith('SDM_') || t.startsWith('HSDM_'));
      expect(hasDM, `${c.name} STAND_A should not cancel directly to DM`).toBe(false);
    }
  });

  it('command normals require hit for cancel', () => {
    for (const c of chars) {
      const commandRoutes = c.byType('command');
      for (const route of commandRoutes) {
        expect(route.requiresHit, `${c.name} ${route.from} command cancel requiresHit`).toBe(true);
      }
    }
  });
});
