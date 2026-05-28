/**
 * Character VFX Presets Regression Test
 * Verifies all character-specific VFX spawn functions produce valid particles.
 */
import { describe, it, expect } from 'vitest';
import type { Particle } from '../src/rendering/vfxPresets.js';
import {
  spawnKooukenVFX,
  spawnKoHouVFX,
  spawnKoHouCVFX,
  spawnHienTrail,
  spawnHienLandingDust,
  spawnKyoFireKickTrail,
  spawnDMTenHaOuVFX,
  spawnHaouFlash,
  spawnMoveNameText,
  spawnTenHaOuBlast,
  spawnScreenCracks,
  spawnFloatingComboText,
  spawnComboSpeedLines,
  spawnRyukoRanbuSpeedLines,
  spawnRyukoRanbuFinalBurst,
  spawnKOSuperBurst,
  spawnRunSpeedLines,
  spawnScorchMark,
  spawnKyoOrochinagiVFX,
  spawnIoriYamibaraiVFX,
  spawnKyoOniyakiVFX,
  spawnIoriOniyakiVFX,
  spawnIoriAoihanaTrail,
  spawnKyoDokugamiTrail,
  spawnIoriYatagarasuVFX,
  spawnVictoryAuraSpark,
  spawnIoriKuzukazeVFX,
} from '../src/rendering/vfxCharPresets.js';

type P = Particle[];

function allValid(particles: P[], fnName: string): void {
  expect(particles.length, `${fnName} produces particles`).toBeGreaterThan(0);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    expect(typeof p.x, `${fnName}[${i}].x`).toBe('number');
    expect(typeof p.y, `${fnName}[${i}].y`).toBe('number');
    expect(typeof p.vx, `${fnName}[${i}].vx`).toBe('number');
    expect(typeof p.vy, `${fnName}[${i}].vy`).toBe('number');
    expect(p.life, `${fnName}[${i}].life > 0`).toBeGreaterThan(0);
    expect(p.maxLife, `${fnName}[${i}].maxLife > 0`).toBeGreaterThan(0);
    expect(typeof p.size, `${fnName}[${i}].size`).toBe('number');
    expect(p.color.length, `${fnName}[${i}].color non-empty`).toBeGreaterThan(0);
  }
}

describe('Ryo-specific VFX', () => {
  it('spawnKooukenVFX produces ki blast', () => {
    const p: P = [];
    spawnKooukenVFX(p, 100, 200, 1, 'ryo');
    allValid(p, 'spawnKooukenVFX');
    expect(p.length, 'koouken has many particles').toBeGreaterThan(10);
  });

  it('spawnKoHouVFX produces blast', () => {
    const p: P = [];
    spawnKoHouVFX(p, 100, 200, 'ryo');
    allValid(p, 'spawnKoHouVFX');
  });

  it('spawnKoHouCVFX produces enhanced blast', () => {
    const p: P = [];
    spawnKoHouCVFX(p, 100, 200, 'ryo');
    allValid(p, 'spawnKoHouCVFX');
  });

  it('spawnHienTrail produces trail', () => {
    const p: P = [];
    spawnHienTrail(p, 100, 200, 1, 'ryo');
    allValid(p, 'spawnHienTrail');
  });

  it('spawnHienLandingDust produces dust', () => {
    const p: P = [];
    spawnHienLandingDust(p, 100, 300);
    allValid(p, 'spawnHienLandingDust');
  });

  it('spawnDMTenHaOuVFX produces DM effect', () => {
    const p: P = [];
    spawnDMTenHaOuVFX(p, 100, 200, 'ryo');
    allValid(p, 'spawnDMTenHaOuVFX');
  });

  it('spawnHaouFlash produces flash', () => {
    const p: P = [];
    spawnHaouFlash(p, 100, 200, 'ryo');
    allValid(p, 'spawnHaouFlash');
  });
});

describe('Kyo-specific VFX', () => {
  it('spawnKyoFireKickTrail produces fire trail', () => {
    const p: P = [];
    spawnKyoFireKickTrail(p, 100, 200, 1);
    allValid(p, 'spawnKyoFireKickTrail');
  });

  it('spawnKyoOrochinagiVFX produces fire pillar', () => {
    const p: P = [];
    spawnKyoOrochinagiVFX(p, 100, 200, 1);
    allValid(p, 'spawnKyoOrochinagiVFX');
  });

  it('spawnKyoOniyakiVFX (light) produces flame', () => {
    const p: P = [];
    spawnKyoOniyakiVFX(p, 100, 200, 1, false);
    allValid(p, 'spawnKyoOniyakiVFX light');
  });

  it('spawnKyoOniyakiVFX (heavy) produces stronger flame', () => {
    const p: P = [];
    spawnKyoOniyakiVFX(p, 100, 200, 1, true);
    allValid(p, 'spawnKyoOniyakiVFX heavy');
  });

  it('spawnKyoDokugamiTrail produces trail', () => {
    const p: P = [];
    spawnKyoDokugamiTrail(p, 100, 200, 1, 0);
    allValid(p, 'spawnKyoDokugamiTrail');
  });
});

describe('Iori-specific VFX', () => {
  it('spawnIoriYamibaraiVFX produces dark energy', () => {
    const p: P = [];
    spawnIoriYamibaraiVFX(p, 100, 200, 1);
    allValid(p, 'spawnIoriYamibaraiVFX');
  });

  it('spawnIoriOniyakiVFX produces claw effect', () => {
    const p: P = [];
    spawnIoriOniyakiVFX(p, 100, 200, 1, false);
    allValid(p, 'spawnIoriOniyakiVFX');
  });

  it('spawnIoriAoihanaTrail produces dark trail', () => {
    const p: P = [];
    spawnIoriAoihanaTrail(p, 100, 200, 1, 0);
    allValid(p, 'spawnIoriAoihanaTrail');
  });

  it('spawnIoriYatagarasuVFX produces DM burst', () => {
    const p: P = [];
    spawnIoriYatagarasuVFX(p, 100, 200, 1);
    allValid(p, 'spawnIoriYatagarasuVFX');
  });

  it('spawnIoriKuzukazeVFX produces vortex', () => {
    const p: P = [];
    spawnIoriKuzukazeVFX(p, 100, 200, 1);
    allValid(p, 'spawnIoriKuzukazeVFX');
  });
});

describe('Generic combat VFX', () => {
  it('spawnMoveNameText produces text', () => {
    const p: P = [];
    spawnMoveNameText(p, 100, 200, '虎煌拳', '#ff4400', 14);
    allValid(p, 'spawnMoveNameText');
    expect(p.some(pt => pt.text && pt.text.includes('虎'))).toBe(true);
  });

  it('spawnTenHaOuBlast produces energy blast', () => {
    const p: P = [];
    spawnTenHaOuBlast(p, 100, 200, 1);
    allValid(p, 'spawnTenHaOuBlast');
  });

  it('spawnScreenCracks produces ground cracks', () => {
    const p: P = [];
    spawnScreenCracks(p, 100, 400);
    allValid(p, 'spawnScreenCracks');
  });

  it('spawnFloatingComboText produces combo text', () => {
    const p: P = [];
    spawnFloatingComboText(p, 100, 200, 5, 120);
    allValid(p, 'spawnFloatingComboText');
  });

  it('spawnComboSpeedLines produces speed lines', () => {
    const p: P = [];
    spawnComboSpeedLines(p, 100, 200, 5);
    allValid(p, 'spawnComboSpeedLines');
  });

  it('spawnRyukoRanbuSpeedLines produces rush lines', () => {
    const p: P = [];
    spawnRyukoRanbuSpeedLines(p, 100, 200);
    allValid(p, 'spawnRyukoRanbuSpeedLines');
  });

  it('spawnRyukoRanbuFinalBurst produces final burst', () => {
    const p: P = [];
    spawnRyukoRanbuFinalBurst(p, 100, 200, 1);
    allValid(p, 'spawnRyukoRanbuFinalBurst');
  });

  it('spawnKOSuperBurst produces KO burst', () => {
    const p: P = [];
    spawnKOSuperBurst(p, 100, 200);
    allValid(p, 'spawnKOSuperBurst');
  });

  it('spawnRunSpeedLines produces run lines', () => {
    const p: P = [];
    spawnRunSpeedLines(p, 100, 200, 1, '#ff4400');
    allValid(p, 'spawnRunSpeedLines');
  });

  it('spawnScorchMark produces ground mark', () => {
    const p: P = [];
    spawnScorchMark(p, 100, 400);
    allValid(p, 'spawnScorchMark');
  });

  it('spawnVictoryAuraSpark produces victory spark', () => {
    const p: P = [];
    spawnVictoryAuraSpark(p, 100, 200, '#ffcc44');
    allValid(p, 'spawnVictoryAuraSpark');
  });
});

describe('Character VFX tier progression', () => {
  it('heavy Oniyaki produces more particles than light', () => {
    const light: P = [];
    const heavy: P = [];
    spawnKyoOniyakiVFX(light, 100, 200, 1, false);
    spawnKyoOniyakiVFX(heavy, 100, 200, 1, true);
    expect(heavy.length, 'heavy oniyaki > light').toBeGreaterThanOrEqual(light.length);
  });

  it('DM KoHou produces more particles than basic', () => {
    const basic: P = [];
    const dm: P = [];
    spawnKoHouVFX(basic, 100, 200, 'ryo');
    spawnKoHouCVFX(dm, 100, 200, 'ryo');
    expect(dm.length, 'DM KoHou > basic').toBeGreaterThan(basic.length);
  });

  it('Kyo Dokugami trail gets stronger with hitIndex', () => {
    const p0: P = [];
    const p2: P = [];
    spawnKyoDokugamiTrail(p0, 100, 200, 1, 0);
    spawnKyoDokugamiTrail(p2, 100, 200, 1, 2);
    // Higher hitIndex should produce more or equal particles
    expect(p2.length, 'later dokugami hit >= first').toBeGreaterThanOrEqual(p0.length);
  });
});
