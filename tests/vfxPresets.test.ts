/**
 * VFX Presets Regression Test
 * Verifies all spawn functions produce valid particles with correct structure and tier scaling.
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
  spawnGroundSlam,
  spawnDamageText,
  spawnCounterText,
  spawnTechText,
  spawnFirstAttackText,
  spawnComboEndText,
  spawnSuperBurst,
  spawnImpactRing,
  spawnSlashLine,
  spawnMAXAura,
  spawnMAXActivationFlash,
  spawnPerfectFlash,
  spawnDizzyStars,
  spawnTauntSparks,
  spawnDust,
  spawnHeavyDust,
  spawnCounterWireSparks,
  spawnThrowEscapeSparks,
  spawnRecoverySpark,
  spawnProjectileExplosion,
  spawnCancelFlash,
  spawnWireText,
  spawnQuickStandText,
  spawnSuperCancelText,
  spawnFreeCancelText,
  spawnGCCDText,
  spawnCounterStanceText,
  spawnReversalText,
  spawnComboHitCounter,
  spawnComboDamageText,
  type Particle,
} from '../src/rendering/vfxPresets.js';

function freshParticles(): Particle[] { return []; }

const PALETTE = ['#ffcc00', '#ff6600', '#ffffff'];

describe('vfxPresets getSparkSizeScaleFromDamage', () => {
  it('returns 0.5 for damage 0', () => {
    expect(getSparkSizeScaleFromDamage(0)).toBe(0.5);
  });
  it('returns 0.5 for damage 49', () => {
    expect(getSparkSizeScaleFromDamage(49)).toBe(0.5);
  });
  it('returns 0.8 for damage 50', () => {
    expect(getSparkSizeScaleFromDamage(50)).toBe(0.8);
  });
  it('returns 0.8 for damage 99', () => {
    expect(getSparkSizeScaleFromDamage(99)).toBe(0.8);
  });
  it('returns 1.1 for damage 100', () => {
    expect(getSparkSizeScaleFromDamage(100)).toBe(1.1);
  });
  it('returns 1.4 for damage 150', () => {
    expect(getSparkSizeScaleFromDamage(150)).toBe(1.4);
  });
  it('returns 1.7 for damage 200', () => {
    expect(getSparkSizeScaleFromDamage(200)).toBe(1.7);
  });
  it('returns 1.7 for damage 500', () => {
    expect(getSparkSizeScaleFromDamage(500)).toBe(1.7);
  });
  it('scale increases monotonically', () => {
    const s1 = getSparkSizeScaleFromDamage(10);
    const s2 = getSparkSizeScaleFromDamage(60);
    const s3 = getSparkSizeScaleFromDamage(110);
    const s4 = getSparkSizeScaleFromDamage(160);
    const s5 = getSparkSizeScaleFromDamage(250);
    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
    expect(s3).toBeLessThan(s4);
    expect(s4).toBeLessThan(s5);
  });
});

describe('VFX Tier Sparks — all 6 types', () => {
  const types = ['small', 'medium', 'large', 'burst', 'mega', 'hyper'] as const;

  it('all 6 types produce at least 1 particle', () => {
    for (const t of types) {
      const p = freshParticles();
      spawnTierSparks(p, 400, 300, 8, t, PALETTE, 1.0);
      expect(p.length, `${t} particle count`).toBeGreaterThan(0);
    }
  });

  it('all types produce particles with valid lifecycle', () => {
    for (const t of types) {
      const p = freshParticles();
      spawnTierSparks(p, 400, 300, 8, t, PALETTE, 1.0);
      for (const particle of p) {
        expect(particle.life, `${t} life`).toBeGreaterThan(0);
        expect(particle.maxLife, `${t} maxLife`).toBeGreaterThan(0);
        expect(particle.size, `${t} size`).toBeGreaterThan(0);
        expect(particle.color, `${t} color`).toBeTruthy();
      }
    }
  });

  it('tier particle count scales monotonically (small < hyper)', () => {
    const small = freshParticles();
    const hyper = freshParticles();
    spawnTierSparks(small, 400, 300, 8, 'small', PALETTE, 1.0);
    spawnTierSparks(hyper, 400, 300, 8, 'hyper', PALETTE, 1.0);
    expect(hyper.length).toBeGreaterThan(small.length);
  });

  it('small produces a white flash core', () => {
    const p = freshParticles();
    spawnTierSparks(p, 400, 300, 4, 'small', PALETTE, 1.0);
    const flashes = p.filter(x => x.type === 'flash');
    expect(flashes.length).toBeGreaterThanOrEqual(1);
    expect(flashes[0].color).toBe('#ffffff');
  });

  it('hyper produces at least 4 rings', () => {
    const p = freshParticles();
    spawnTierSparks(p, 400, 300, 8, 'hyper', PALETTE, 1.0);
    const rings = p.filter(x => x.type === 'ring');
    expect(rings.length).toBeGreaterThanOrEqual(4);
  });

  it('burst produces superburst particles', () => {
    const p = freshParticles();
    spawnTierSparks(p, 400, 300, 8, 'burst', PALETTE, 1.0);
    const bursts = p.filter(x => x.type === 'superburst');
    expect(bursts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Hit / Block spark spawning', () => {
  it('spawnHitSparks produces sparks with gravity', () => {
    const p = freshParticles();
    spawnHitSparks(p, 400, 300, 6);
    expect(p.length).toBe(6);
    for (const s of p) {
      expect(s.type).toBe('spark');
      expect(s.life).toBeGreaterThan(0);
      expect(s.gravity).toBeGreaterThan(0);
    }
  });

  it('spawnBlockFlash produces blue-tinted particles', () => {
    const p = freshParticles();
    spawnBlockFlash(p, 400, 300);
    const blueParticles = p.filter(x => x.color.includes('ff') && (x.color.includes('44') || x.color.includes('88') || x.color.includes('66')));
    expect(blueParticles.length).toBeGreaterThan(0);
  });

  it('spawnBlockFlash has a ring particle', () => {
    const p = freshParticles();
    spawnBlockFlash(p, 400, 300);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Character hit sparks with facing', () => {
  it('produces sparks with facing=1 (right)', () => {
    const p = freshParticles();
    spawnCharacterHitSparks(p, 400, 300, 6, '#ff4400', 1.0, 1.0, 0.2, false, 1);
    expect(p.length).toBeGreaterThan(0);
  });

  it('produces sparks with facing=-1 (left)', () => {
    const p = freshParticles();
    spawnCharacterHitSparks(p, 400, 300, 6, '#ff4400', 1.0, 1.0, 0.2, false, -1);
    expect(p.length).toBeGreaterThan(0);
  });

  it('produces superburst at high sizeScale', () => {
    const p = freshParticles();
    spawnCharacterHitSparks(p, 400, 300, 6, '#ff4400', 1.6, 1.0, 0.2, false, 0);
    const bursts = p.filter(x => x.type === 'superburst');
    expect(bursts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Guard crush VFX', () => {
  it('spawnGuardCrushSparks produces many star particles', () => {
    const p = freshParticles();
    spawnGuardCrushSparks(p, 400, 300);
    expect(p.length).toBeGreaterThan(10);
    expect(p.filter(x => x.type === 'star').length).toBeGreaterThan(0);
  });

  it('spawnGuardCrushText produces text particle', () => {
    const p = freshParticles();
    spawnGuardCrushText(p, 400, 300);
    expect(p.length).toBe(1);
    expect(p[0].type).toBe('text');
    expect(p[0].text).toContain('GUARD');
  });
});

describe('Ground slam VFX', () => {
  it('produces groundslam + many particles', () => {
    const p = freshParticles();
    spawnGroundSlam(p, 400, 300);
    expect(p.filter(x => x.type === 'groundslam').length).toBe(1);
    expect(p.length).toBeGreaterThan(20);
  });
});

describe('Damage text scaling', () => {
  it('combo damage (<=50) shows orange text', () => {
    const p = freshParticles();
    spawnDamageText(p, 400, 300, 30);
    expect(p[0].color).toBe('#ff8800');
  });

  it('low non-combo damage shows white text', () => {
    const p = freshParticles();
    spawnDamageText(p, 400, 300, 0);
    expect(p[0].color).toBe('#ffffff');
  });

  it('high damage shows red text', () => {
    const p = freshParticles();
    spawnDamageText(p, 400, 300, 130);
    expect(p[0].color).toBe('#ff0000');
  });

  it('combo text shows HITS!', () => {
    const p = freshParticles();
    spawnDamageText(p, 400, 300, 8);
    expect(p[0].text).toContain('HITS!');
  });

  it('non-combo text shows negative number', () => {
    const p = freshParticles();
    spawnDamageText(p, 400, 300, 80);
    expect(p[0].text).toContain('-');
  });
});

describe('Text particle spawners', () => {
  it('spawnCounterText has COUNTER!', () => {
    const p = freshParticles();
    spawnCounterText(p, 400, 300);
    expect(p[0].text).toBe('COUNTER!');
  });

  it('spawnTechText has TECH!', () => {
    const p = freshParticles();
    spawnTechText(p, 400, 300);
    expect(p[0].text).toBe('TECH!');
  });

  it('spawnFirstAttackText has FIRST ATTACK!', () => {
    const p = freshParticles();
    spawnFirstAttackText(p, 400, 300);
    expect(p[0].text).toBe('FIRST ATTACK!');
  });

  it('spawnWireText has WIRE!', () => {
    const p = freshParticles();
    spawnWireText(p, 400, 300);
    expect(p[0].text).toBe('WIRE!');
  });

  it('spawnQuickStandText has RECOVERY', () => {
    const p = freshParticles();
    spawnQuickStandText(p, 400, 300);
    expect(p[0].text).toBe('RECOVERY');
  });

  it('spawnSuperCancelText has S.CANCEL!', () => {
    const p = freshParticles();
    spawnSuperCancelText(p, 400, 300);
    expect(p[0].text).toBe('S.CANCEL!');
  });

  it('spawnFreeCancelText has F.CANCEL!', () => {
    const p = freshParticles();
    spawnFreeCancelText(p, 400, 300);
    expect(p[0].text).toBe('F.CANCEL!');
  });

  it('spawnGCCDText has GC CD!', () => {
    const p = freshParticles();
    spawnGCCDText(p, 400, 300);
    expect(p[0].text).toBe('GC CD!');
  });

  it('spawnCounterStanceText has COUNTER!', () => {
    const p = freshParticles();
    spawnCounterStanceText(p, 400, 300);
    expect(p[0].text).toBe('COUNTER!');
  });

  it('spawnReversalText has REVERSAL!', () => {
    const p = freshParticles();
    spawnReversalText(p, 400, 300);
    expect(p[0].text).toBe('REVERSAL!');
  });
});

describe('Super burst', () => {
  it('DM super burst produces particles', () => {
    const p = freshParticles();
    spawnSuperBurst(p, 400, 300, '#ff4400', '#ff8800', false);
    expect(p.length).toBeGreaterThan(20);
  });

  it('SDM super burst produces more particles than DM', () => {
    const dm = freshParticles();
    const sdm = freshParticles();
    spawnSuperBurst(dm, 400, 300, '#ff4400', '#ff8800', false);
    spawnSuperBurst(sdm, 400, 300, '#ff4400', '#ff8800', true);
    expect(sdm.length).toBeGreaterThan(dm.length);
  });
});

describe('Impact ring / slash line', () => {
  it('spawnImpactRing produces ring particles', () => {
    const p = freshParticles();
    spawnImpactRing(p, 400, 300, 1.0, 1);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(1);
  });

  it('spawnImpactRing count=3 produces 3 rings + warm ring', () => {
    const p = freshParticles();
    spawnImpactRing(p, 400, 300, 1.0, 3);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(4);
  });

  it('spawnSlashLine produces slash particles', () => {
    const p = freshParticles();
    spawnSlashLine(p, 400, 300, 1, '#ffcc00');
    expect(p.filter(x => x.type === 'slash').length).toBeGreaterThanOrEqual(2);
  });
});

describe('MAX mode VFX', () => {
  it('spawnMAXAura produces rings and stars', () => {
    const p = freshParticles();
    spawnMAXAura(p, 400, 300);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(3);
    expect(p.filter(x => x.type === 'star').length).toBeGreaterThan(0);
  });

  it('spawnMAXActivationFlash produces flash + rings', () => {
    const p = freshParticles();
    spawnMAXActivationFlash(p, 400, 300);
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(4);
  });
});

describe('Perfect flash', () => {
  it('produces golden star particles and rings', () => {
    const p = freshParticles();
    spawnPerfectFlash(p, 400, 300);
    expect(p.filter(x => x.type === 'star').length).toBeGreaterThan(0);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(2);
  });
});

describe('Dizzy / Taunt / Dust', () => {
  it('spawnDizzyStars produces 3 orbiting stars', () => {
    const p = freshParticles();
    spawnDizzyStars(p, 400, 300);
    expect(p.length).toBe(3);
    expect(p.every(x => x.type === 'star')).toBe(true);
  });

  it('spawnTauntSparks produces descending energy', () => {
    const p = freshParticles();
    spawnTauntSparks(p, 400, 300);
    expect(p.length).toBe(8);
  });

  it('spawnDust produces 10 particles', () => {
    const p = freshParticles();
    spawnDust(p, 400, 300);
    expect(p.length).toBe(10);
  });

  it('spawnHeavyDust produces more particles than dust', () => {
    const dust = freshParticles();
    const heavy = freshParticles();
    spawnDust(dust, 400, 300);
    spawnHeavyDust(heavy, 400, 300, 16);
    expect(heavy.length).toBeGreaterThan(dust.length);
  });
});

describe('Counter wire / Throw escape / Recovery', () => {
  it('spawnCounterWireSparks produces flash + stars + ring', () => {
    const p = freshParticles();
    spawnCounterWireSparks(p, 400, 300);
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'star').length).toBeGreaterThan(0);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(1);
  });

  it('spawnThrowEscapeSparks produces blue flash + sparks', () => {
    const p = freshParticles();
    spawnThrowEscapeSparks(p, 400, 300);
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'spark').length).toBeGreaterThan(0);
  });

  it('spawnRecoverySpark produces white flash + sparks', () => {
    const p = freshParticles();
    spawnRecoverySpark(p, 400, 300);
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'spark').length).toBeGreaterThanOrEqual(6);
  });

  it('spawnProjectileExplosion produces flash + stars + rings', () => {
    const p = freshParticles();
    spawnProjectileExplosion(p, 400, 300, '#ff4400', '#ff8800');
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'star').length).toBeGreaterThan(0);
    expect(p.filter(x => x.type === 'ring').length).toBeGreaterThanOrEqual(1);
  });

  it('spawnCancelFlash produces flash + ring particles', () => {
    const p = freshParticles();
    spawnCancelFlash(p, 400, 300, 120);
    expect(p.filter(x => x.type === 'flash').length).toBeGreaterThanOrEqual(1);
    expect(p.filter(x => x.type === 'spark').length).toBeGreaterThanOrEqual(8);
  });
});

describe('Combo counter / combo damage', () => {
  it('spawnComboHitCounter skips for hitCount < 2', () => {
    const p = freshParticles();
    spawnComboHitCounter(p, 400, 300, 1);
    expect(p.length).toBe(0);
  });

  it('spawnComboHitCounter produces text for hitCount >= 2', () => {
    const p = freshParticles();
    spawnComboHitCounter(p, 400, 300, 5);
    expect(p.length).toBe(1);
    expect(p[0].text).toContain('5 HIT');
  });

  it('spawnComboDamageText produces damage display', () => {
    const p = freshParticles();
    spawnComboDamageText(p, 400, 300, 150);
    expect(p.length).toBe(1);
    expect(p[0].text).toContain('DMG');
    expect(p[0].text).toContain('150');
  });

  it('spawnComboEndText produces hits count', () => {
    const p = freshParticles();
    spawnComboEndText(p, 400, 300, 12);
    expect(p.length).toBe(1);
    expect(p[0].text).toContain('12');
  });
});

describe('All particles have valid structure', () => {
  it('mixed spawners produce particles with required fields', () => {
    const all: Particle[] = [];
    spawnHitSparks(all, 400, 300, 4);
    spawnBlockFlash(all, 400, 300);
    spawnGuardCrushSparks(all, 400, 300);
    spawnDizzyStars(all, 400, 300);
    spawnDust(all, 400, 300);
    expect(all.length).toBeGreaterThan(0);
    const validTypes = ['spark', 'flash', 'ring', 'text', 'star', 'slash', 'superburst', 'groundslam', 'scorch'];
    for (const p of all) {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(typeof p.vx).toBe('number');
      expect(typeof p.vy).toBe('number');
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBeGreaterThan(0);
      expect(p.size).toBeGreaterThan(0);
      expect(p.color).toBeTruthy();
      expect(validTypes).toContain(p.type);
    }
  });
});
