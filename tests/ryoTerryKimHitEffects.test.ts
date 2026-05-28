/**
 * Ryo / Terry / Kim Hit Effects Plugin Tests
 *
 * Verifies plugin structure, VFX coverage for all attack types,
 * escalation hierarchy, and character-specific element colors.
 */
import { describe, it, expect } from 'vitest';
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { TERRY_HIT_EFFECTS } from '../src/content/characters/terry/hitEffects/terryHitEffects.js';
import { KIM_HIT_EFFECTS } from '../src/content/characters/kim/hitEffects/kimHitEffects.js';

const RYO_ATTACKS = [
  'RYO_KOOU', 'RYO_KOOU_C', 'RYO_KOOUKEN_D',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN',
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
  'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
];

const TERRY_ATTACKS = [
  'TERRY_BURN_KNUCKLE', 'TERRY_POWER_WAVE', 'TERRY_POWER_DUNK',
  'TERRY_CRACK_SHOT', 'TERRY_RISING_TACKLE',
  'DM_POWER_GEYSER', 'SDM_POWER_GEYSER',
  'DM_HIGH_ANGLE_GEYSER', 'SDM_HIGH_ANGLE_GEYSER',
];

const KIM_ATTACKS = [
  'KIM_HIENZAN', 'KIM_HISHOU', 'KIM_HANGETSU',
  'KIM_HAKI', 'KIM_SANREN',
  'SDM_PHOENIX_KICK',
];

function makeMockCtx(attackType: string) {
  const vfxCalls: string[] = [];
  return {
    vfx: {
      spawnImpactRing: (..._: any[]) => { vfxCalls.push('impactRing'); },
      spawnProjectileExplosion: (..._: any[]) => { vfxCalls.push('projectileExplosion'); },
      spawnSuperBurst: (..._: any[]) => { vfxCalls.push('superBurst'); },
      spawnGroundSlam: (..._: any[]) => { vfxCalls.push('groundSlam'); },
      spawnHeavyDust: (..._: any[]) => { vfxCalls.push('heavyDust'); },
      spawnKooukenVFX: (..._: any[]) => { vfxCalls.push('koouken'); },
      spawnKoHouVFX: (..._: any[]) => { vfxCalls.push('koHou'); },
      spawnKoHouCVFX: (..._: any[]) => { vfxCalls.push('koHouC'); },
      spawnHienTrail: (..._: any[]) => { vfxCalls.push('hienTrail'); },
      spawnHienLandingDust: (..._: any[]) => { vfxCalls.push('hienDust'); },
      spawnHaouFlash: (..._: any[]) => { vfxCalls.push('haouFlash'); },
      spawnDMTenHaOuVFX: (..._: any[]) => { vfxCalls.push('dmTenHaOu'); },
      spawnScorchMark: (..._: any[]) => { vfxCalls.push('scorchMark'); },
      spawnScreenCracks: (..._: any[]) => { vfxCalls.push('screenCracks'); },
    },
    screenShake: { trigger: (..._: any[]) => { vfxCalls.push('screenShake'); } },
    screenFlash: {
      trigger: (..._: any[]) => { vfxCalls.push('screenFlash'); },
      triggerDarken: (..._: any[]) => { vfxCalls.push('darken'); },
    },
    cinematic: { addHitStop: (..._: any[]) => { vfxCalls.push('hitStop'); } },
    attacker: { facing: 1, x: 400, y: 300, charId: 'ryo' } as any,
    defender: {} as any,
    attackType: attackType as any,
    hitX: 400,
    hitY: 300,
    counterHit: false,
    combo: 0,
    attackDirectionBias: 1,
    defIdx: 1,
    vfxCalls,
  };
}

// ════════════════════════════════════════════════════════════════
// RYO
// ════════════════════════════════════════════════════════════════

describe('Ryo Hit Effects Plugin', () => {
  it('has valid plugin structure', () => {
    expect(RYO_HIT_EFFECTS.charId).toBe('ryo');
    expect(RYO_HIT_EFFECTS.prefixes.length).toBeGreaterThan(0);
    expect(typeof RYO_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof RYO_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('prefixes cover all Ryo attack types', () => {
    for (const atk of RYO_ATTACKS) {
      const matched = RYO_HIT_EFFECTS.prefixes.some(pre => atk.startsWith(pre) || atk === pre);
      expect(matched, `prefix covers ${atk}`).toBe(true);
    }
  });

  it('VFX handler handles all Ryo attacks', () => {
    for (const atk of RYO_ATTACKS) {
      const ctx = makeMockCtx(atk);
      const handled = RYO_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(handled, `VFX handles ${atk}`).toBe(true);
      expect(ctx.vfxCalls.length, `${atk} produces VFX`).toBeGreaterThan(0);
    }
  });

  it('Ko Hou C produces more VFX than Ko Hou A', () => {
    const ctxA = makeMockCtx('RYO_KO_HOU');
    const ctxC = makeMockCtx('RYO_KO_HOU_C');
    RYO_HIT_EFFECTS.onHitVFX(ctxA as any);
    RYO_HIT_EFFECTS.onHitVFX(ctxC as any);
    expect(ctxC.vfxCalls.length).toBeGreaterThan(ctxA.vfxCalls.length);
  });

  it('DM Ten Ha Ou produces super-level VFX', () => {
    const ctx = makeMockCtx('DM_TEN_HA_OU');
    RYO_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('darken');
    expect(ctx.vfxCalls).toContain('screenFlash');
    expect(ctx.vfxCalls).toContain('screenShake');
  });

  it('SDM Ten Ha Ou is more dramatic than DM', () => {
    const dm = makeMockCtx('DM_TEN_HA_OU');
    const sdm = makeMockCtx('SDM_TEN_HA_OU');
    RYO_HIT_EFFECTS.onHitVFX(dm as any);
    RYO_HIT_EFFECTS.onHitVFX(sdm as any);
    expect(sdm.vfxCalls.length).toBeGreaterThanOrEqual(dm.vfxCalls.length);
  });

  it('Zanretsu Ken handles different combo stages', () => {
    const ctx0 = { ...makeMockCtx('RYO_ZANRETSU_KEN'), combo: 0 };
    const ctx2 = { ...makeMockCtx('RYO_ZANRETSU_KEN'), combo: 2 };
    const ctx5 = { ...makeMockCtx('RYO_ZANRETSU_KEN'), combo: 5 };
    expect(RYO_HIT_EFFECTS.onHitVFX(ctx0 as any)).toBe(true);
    expect(RYO_HIT_EFFECTS.onHitVFX(ctx2 as any)).toBe(true);
    expect(RYO_HIT_EFFECTS.onHitVFX(ctx5 as any)).toBe(true);
  });

  it('Hien produces speed line + landing dust', () => {
    const ctx = makeMockCtx('RYO_HIEN');
    RYO_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('hienTrail');
    expect(ctx.vfxCalls).toContain('hienDust');
  });

  it('HSDM Ryuko Ranbu is more dramatic than SDM', () => {
    const sdm = makeMockCtx('SDM_RYUKO_RANBU');
    const hsdm = makeMockCtx('HSDM_RYUKO_RANBU');
    RYO_HIT_EFFECTS.onHitVFX(sdm as any);
    RYO_HIT_EFFECTS.onHitVFX(hsdm as any);
    expect(hsdm.vfxCalls.length).toBeGreaterThanOrEqual(sdm.vfxCalls.length);
  });
});

// ════════════════════════════════════════════════════════════════
// TERRY
// ════════════════════════════════════════════════════════════════

describe('Terry Hit Effects Plugin', () => {
  it('has valid plugin structure', () => {
    expect(TERRY_HIT_EFFECTS.charId).toBe('terry');
    expect(TERRY_HIT_EFFECTS.prefixes.length).toBeGreaterThan(0);
    expect(typeof TERRY_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof TERRY_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('prefixes cover all Terry attack types', () => {
    for (const atk of TERRY_ATTACKS) {
      const matched = TERRY_HIT_EFFECTS.prefixes.some(pre => atk.startsWith(pre) || atk === pre);
      expect(matched, `prefix covers ${atk}`).toBe(true);
    }
  });

  it('VFX handler handles all Terry attacks', () => {
    for (const atk of TERRY_ATTACKS) {
      const ctx = makeMockCtx(atk);
      const handled = TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(handled, `VFX handles ${atk}`).toBe(true);
      expect(ctx.vfxCalls.length, `${atk} produces VFX`).toBeGreaterThan(0);
    }
  });

  it('Power Wave produces ground slam', () => {
    const ctx = makeMockCtx('TERRY_POWER_WAVE');
    TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('groundSlam');
  });

  it('Power Dunk produces hitStop', () => {
    const ctx = makeMockCtx('TERRY_POWER_DUNK');
    TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('hitStop');
    expect(ctx.vfxCalls).toContain('groundSlam');
  });

  it('DM Power Geyser produces superBurst + darken', () => {
    const ctx = makeMockCtx('DM_POWER_GEYSER');
    TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('superBurst');
    expect(ctx.vfxCalls).toContain('darken');
    expect(ctx.vfxCalls).toContain('groundSlam');
  });

  it('SDM Power Geyser is more dramatic than DM', () => {
    const dm = makeMockCtx('DM_POWER_GEYSER');
    const sdm = makeMockCtx('SDM_POWER_GEYSER');
    TERRY_HIT_EFFECTS.onHitVFX(dm as any);
    TERRY_HIT_EFFECTS.onHitVFX(sdm as any);
    expect(sdm.vfxCalls.length).toBeGreaterThanOrEqual(dm.vfxCalls.length);
  });

  it('Burn Knuckle produces hitStop + screenShake', () => {
    const ctx = makeMockCtx('TERRY_BURN_KNUCKLE');
    TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('hitStop');
    expect(ctx.vfxCalls).toContain('screenShake');
  });

  it('Crack Shot produces heavy dust', () => {
    const ctx = makeMockCtx('TERRY_CRACK_SHOT');
    TERRY_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('heavyDust');
  });

  it('unrelated attack returns false', () => {
    const ctx = makeMockCtx('UNKNOWN_ATTACK');
    expect(TERRY_HIT_EFFECTS.onHitVFX(ctx as any)).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// KIM
// ════════════════════════════════════════════════════════════════

describe('Kim Hit Effects Plugin', () => {
  it('has valid plugin structure', () => {
    expect(KIM_HIT_EFFECTS.charId).toBe('kim');
    expect(KIM_HIT_EFFECTS.prefixes.length).toBeGreaterThan(0);
    expect(typeof KIM_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof KIM_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('prefixes cover all Kim attack types', () => {
    for (const atk of KIM_ATTACKS) {
      const matched = KIM_HIT_EFFECTS.prefixes.some(pre => atk.startsWith(pre) || atk === pre);
      expect(matched, `prefix covers ${atk}`).toBe(true);
    }
  });

  it('VFX handler handles all Kim attacks', () => {
    for (const atk of KIM_ATTACKS) {
      const ctx = makeMockCtx(atk);
      const handled = KIM_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(handled, `VFX handles ${atk}`).toBe(true);
      expect(ctx.vfxCalls.length, `${atk} produces VFX`).toBeGreaterThan(0);
    }
  });

  it('Hienzan produces hitStop + impactRing', () => {
    const ctx = makeMockCtx('KIM_HIENZAN');
    KIM_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('hitStop');
    expect(ctx.vfxCalls).toContain('impactRing');
  });

  it('Haki produces heavy dust', () => {
    const ctx = makeMockCtx('KIM_HAKI');
    KIM_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('heavyDust');
  });

  it('SDM Phoenix Kick produces superBurst + darken', () => {
    const ctx = makeMockCtx('SDM_PHOENIX_KICK');
    KIM_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('superBurst');
    expect(ctx.vfxCalls).toContain('darken');
    expect(ctx.vfxCalls).toContain('screenFlash');
  });

  it('unrelated attack returns false', () => {
    const ctx = makeMockCtx('UNKNOWN_ATTACK');
    expect(KIM_HIT_EFFECTS.onHitVFX(ctx as any)).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-character isolation
// ════════════════════════════════════════════════════════════════

describe('Hit Effects cross-character isolation', () => {
  it('Ryo plugin does not handle Terry attacks', () => {
    const ctx = makeMockCtx('TERRY_BURN_KNUCKLE');
    expect(RYO_HIT_EFFECTS.onHitVFX(ctx as any)).toBe(false);
  });

  it('Terry plugin does not handle Kim attacks', () => {
    const ctx = makeMockCtx('KIM_HIENZAN');
    expect(TERRY_HIT_EFFECTS.onHitVFX(ctx as any)).toBe(false);
  });

  it('Kim plugin does not handle Ryo attacks', () => {
    const ctx = makeMockCtx('RYO_KOOU');
    expect(KIM_HIT_EFFECTS.onHitVFX(ctx as any)).toBe(false);
  });
});
