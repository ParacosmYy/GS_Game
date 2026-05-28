/**
 * VFX Presets Regression Test
 * Verifies all spawn functions produce valid particles.
 */
import { describe, it, expect } from 'vitest';
import {
  spawnTierSparks,
  spawnHitSparks,
  spawnBlockFlash,
  getSparkSizeScaleFromDamage,
  spawnCharacterHitSparks,
  spawnGuardCrushSparks,
  spawnGuardCrushText,
  spawnWireText,
  spawnQuickStandText,
  spawnThrowEscapeSparks,
  spawnImpactRing,
  spawnSlashLine,
  spawnSuperBurst,
  spawnGroundSlam,
  spawnDamageText,
  spawnCounterText,
  spawnTechText,
  spawnFirstAttackText,
  spawnComboEndText,
  spawnComboHitCounter,
  spawnComboDamageText,
  spawnSuperCancelText,
  spawnFreeCancelText,
  spawnGCCDText,
  spawnCounterStanceText,
  spawnReversalText,
  spawnRecoverySpark,
  spawnDust,
  spawnHeavyDust,
  spawnCounterWireSparks,
  spawnMAXAura,
  spawnMAXActivationFlash,
  spawnPerfectFlash,
  spawnProjectileExplosion,
  spawnCancelFlash,
  spawnTauntSparks,
  spawnDizzyStars,
  type Particle,
} from '../src/rendering/vfxPresets.js';

type P = Particle[];

function isValidParticle(p: Particle, ctx: string): void {
  expect(typeof p.x, `${ctx}.x`).toBe('number');
  expect(typeof p.y, `${ctx}.y`).toBe('number');
  expect(typeof p.vx, `${ctx}.vx`).toBe('number');
  expect(typeof p.vy, `${ctx}.vy`).toBe('number');
  expect(typeof p.life, `${ctx}.life`).toBe('number');
  expect(p.life, `${ctx}.life > 0`).toBeGreaterThan(0);
  expect(typeof p.maxLife, `${ctx}.maxLife`).toBe('number');
  expect(p.maxLife, `${ctx}.maxLife > 0`).toBeGreaterThan(0);
  expect(typeof p.size, `${ctx}.size`).toBe('number');
  expect(typeof p.color, `${ctx}.color`).toBe('string');
  expect(p.color.length, `${ctx}.color non-empty`).toBeGreaterThan(0);
}

function allValid(particles: P[], fnName: string): void {
  expect(particles.length, `${fnName} produces particles`).toBeGreaterThan(0);
  for (let i = 0; i < particles.length; i++) {
    isValidParticle(particles[i], `${fnName}[${i}]`);
  }
}

const PALETTES = {
  fire: ['#ff4400', '#ff8800', '#ffcc44'],
  purple: ['#8800cc', '#aa44ff', '#cc88ff'],
  blue: ['#4488ff', '#88bbff', '#ffffff'],
};

describe('VFX Presets — basic spawn functions', () => {
  it('spawnTierSparks small', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 5, 'small', PALETTES.fire, 1.0);
    allValid(p, 'small');
  });

  it('spawnTierSparks medium', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 5, 'medium', PALETTES.fire, 1.0);
    allValid(p, 'medium');
  });

  it('spawnTierSparks large', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 5, 'large', PALETTES.fire, 1.0);
    allValid(p, 'large');
  });

  it('spawnTierSparks burst', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 8, 'burst', PALETTES.purple, 1.2);
    allValid(p, 'burst');
  });

  it('spawnTierSparks mega', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 10, 'mega', PALETTES.blue, 1.5);
    allValid(p, 'mega');
  });

  it('spawnTierSparks hyper', () => {
    const p: P = [];
    spawnTierSparks(p, 100, 200, 12, 'hyper', PALETTES.fire, 2.0);
    allValid(p, 'hyper');
  });

  it('spawnHitSparks', () => {
    const p: P = [];
    spawnHitSparks(p, 100, 200, 6);
    allValid(p, 'spawnHitSparks');
  });

  it('spawnBlockFlash', () => {
    const p: P = [];
    spawnBlockFlash(p, 100, 200, 1.0);
    allValid(p, 'spawnBlockFlash');
  });

  it('spawnCharacterHitSparks', () => {
    const p: P = [];
    spawnCharacterHitSparks(p, 100, 200, 8, '#ff4400', 1.0, 1.0, 0.2, false, 1);
    allValid(p, 'spawnCharacterHitSparks');
  });
});

describe('VFX Presets — special effect spawns', () => {
  it('spawnGuardCrushSparks', () => {
    const p: P = [];
    spawnGuardCrushSparks(p, 100, 200);
    allValid(p, 'spawnGuardCrushSparks');
  });

  it('spawnImpactRing', () => {
    const p: P = [];
    spawnImpactRing(p, 100, 200, 1.0, 2);
    allValid(p, 'spawnImpactRing');
  });

  it('spawnSlashLine', () => {
    const p: P = [];
    spawnSlashLine(p, 100, 200, 1, '#ff4400', 1.0, 45);
    allValid(p, 'spawnSlashLine');
  });

  it('spawnSuperBurst (DM)', () => {
    const p: P = [];
    spawnSuperBurst(p, 100, 200, '#ff4400', '#ffcc44', false);
    allValid(p, 'spawnSuperBurst DM');
  });

  it('spawnSuperBurst (SDM)', () => {
    const p: P = [];
    spawnSuperBurst(p, 100, 200, '#8800cc', '#cc88ff', true);
    allValid(p, 'spawnSuperBurst SDM');
  });

  it('spawnGroundSlam', () => {
    const p: P = [];
    spawnGroundSlam(p, 100, 200);
    allValid(p, 'spawnGroundSlam');
  });

  it('spawnProjectileExplosion', () => {
    const p: P = [];
    spawnProjectileExplosion(p, 100, 200, '#ff4400', '#ffcc44');
    allValid(p, 'spawnProjectileExplosion');
  });

  it('spawnCancelFlash', () => {
    const p: P = [];
    spawnCancelFlash(p, 100, 200, 80);
    allValid(p, 'spawnCancelFlash');
  });
});

describe('VFX Presets — text spawns', () => {
  const textFns: [string, (p: P, x: number, y: number) => void][] = [
    ['spawnGuardCrushText', (p, x, y) => spawnGuardCrushText(p, x, y)],
    ['spawnWireText', (p, x, y) => spawnWireText(p, x, y)],
    ['spawnQuickStandText', (p, x, y) => spawnQuickStandText(p, x, y)],
    ['spawnCounterText', (p, x, y) => spawnCounterText(p, x, y)],
    ['spawnTechText', (p, x, y) => spawnTechText(p, x, y)],
    ['spawnFirstAttackText', (p, x, y) => spawnFirstAttackText(p, x, y)],
    ['spawnSuperCancelText', (p, x, y) => spawnSuperCancelText(p, x, y)],
    ['spawnFreeCancelText', (p, x, y) => spawnFreeCancelText(p, x, y)],
    ['spawnGCCDText', (p, x, y) => spawnGCCDText(p, x, y)],
    ['spawnCounterStanceText', (p, x, y) => spawnCounterStanceText(p, x, y)],
    ['spawnReversalText', (p, x, y) => spawnReversalText(p, x, y)],
  ];

  for (const [name, fn] of textFns) {
    it(`${name} produces text particles`, () => {
      const p: P = [];
      fn(p, 100, 200);
      allValid(p, name);
      const hasText = p.some(pt => pt.text && pt.text.length > 0);
      expect(hasText, `${name} has text content`).toBe(true);
    });
  }

  it('spawnDamageText produces numeric text', () => {
    const p: P = [];
    spawnDamageText(p, 100, 200, 42);
    allValid(p, 'spawnDamageText');
    expect(p[0].text).toContain('42');
  });

  it('spawnComboEndText shows hit count', () => {
    const p: P = [];
    spawnComboEndText(p, 100, 200, 7);
    allValid(p, 'spawnComboEndText');
  });

  it('spawnComboHitCounter shows count', () => {
    const p: P = [];
    spawnComboHitCounter(p, 100, 200, 5);
    allValid(p, 'spawnComboHitCounter');
  });

  it('spawnComboDamageText shows total', () => {
    const p: P = [];
    spawnComboDamageText(p, 100, 200, 120);
    allValid(p, 'spawnComboDamageText');
  });
});

describe('VFX Presets — misc spawns', () => {
  it('spawnThrowEscapeSparks', () => {
    const p: P = [];
    spawnThrowEscapeSparks(p, 100, 200);
    allValid(p, 'spawnThrowEscapeSparks');
  });

  it('spawnRecoverySpark', () => {
    const p: P = [];
    spawnRecoverySpark(p, 100, 200);
    allValid(p, 'spawnRecoverySpark');
  });

  it('spawnDust', () => {
    const p: P = [];
    spawnDust(p, 100, 200);
    allValid(p, 'spawnDust');
  });

  it('spawnHeavyDust', () => {
    const p: P = [];
    spawnHeavyDust(p, 100, 200, 10);
    allValid(p, 'spawnHeavyDust');
  });

  it('spawnCounterWireSparks', () => {
    const p: P = [];
    spawnCounterWireSparks(p, 100, 200);
    allValid(p, 'spawnCounterWireSparks');
  });

  it('spawnMAXAura', () => {
    const p: P = [];
    spawnMAXAura(p, 100, 200);
    allValid(p, 'spawnMAXAura');
  });

  it('spawnMAXActivationFlash', () => {
    const p: P = [];
    spawnMAXActivationFlash(p, 100, 200);
    allValid(p, 'spawnMAXActivationFlash');
  });

  it('spawnPerfectFlash', () => {
    const p: P = [];
    spawnPerfectFlash(p, 100, 200);
    allValid(p, 'spawnPerfectFlash');
  });

  it('spawnTauntSparks', () => {
    const p: P = [];
    spawnTauntSparks(p, 100, 200);
    allValid(p, 'spawnTauntSparks');
  });

  it('spawnDizzyStars', () => {
    const p: P = [];
    spawnDizzyStars(p, 100, 200);
    allValid(p, 'spawnDizzyStars');
    const stars = p.filter(pt => pt.type === 'star');
    expect(stars.length, 'dizzy stars present').toBeGreaterThan(0);
  });
});

describe('VFX Presets — utility functions', () => {
  it('getSparkSizeScaleFromDamage scales with damage', () => {
    const light = getSparkSizeScaleFromDamage(30);
    const heavy = getSparkSizeScaleFromDamage(80);
    const super_ = getSparkSizeScaleFromDamage(150);
    const mega = getSparkSizeScaleFromDamage(250);
    expect(light, '<50 → 0.5').toBe(0.5);
    expect(heavy, '50-99 → 0.8').toBe(0.8);
    expect(super_, '100-149 → 1.1').toBe(1.4);
    expect(mega, '>=200 → 1.7').toBe(1.7);
    expect(light).toBeLessThan(heavy);
    expect(heavy).toBeLessThan(super_);
    expect(super_).toBeLessThan(mega);
  });

  it('getSparkSizeScaleFromDamage clamps to positive', () => {
    expect(getSparkSizeScaleFromDamage(0)).toBeGreaterThan(0);
    expect(getSparkSizeScaleFromDamage(-10)).toBeGreaterThan(0);
  });
});

describe('VFX Presets — particle type coverage', () => {
  it('all spawn functions produce valid Particle types', () => {
    const validTypes = new Set(['spark', 'flash', 'ring', 'text', 'star', 'slash', 'superburst', 'groundslam', 'scorch']);
    const p: P = [];
    spawnTierSparks(p, 0, 0, 3, 'large', ['#fff'], 1.0);
    spawnSuperBurst(p, 0, 0, '#fff', '#fff');
    spawnDizzyStars(p, 0, 0);
    spawnDust(p, 0, 0);
    for (const pt of p) {
      expect(validTypes, `particle type "${pt.type}" is valid`).toContain(pt.type);
    }
  });
});
