/**
 * 3-Character Special Attack VFX Coverage Regression Test
 *
 * Verifies every character's special/command/DM/SDM/HSDM attack type
 * is handled by the corresponding hit effect plugin (onHitVFX returns true).
 * Closes gap 2.3 (regression protection).
 */
import { describe, it, expect, vi } from 'vitest';
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import type { HitEffectContext } from '../src/content/characterHitEffects.js';

// Mock audio sampler to prevent real audio initialization
vi.mock('../src/audio/sampler.js', () => ({
  playKoouken: vi.fn(),
  playKoHou: vi.fn(),
  playHien: vi.fn(),
  playHaou: vi.fn(),
  playHioHacker: vi.fn(),
  playZanretsuKen: vi.fn(),
  playHit: vi.fn(),
  playHeavyHit: vi.fn(),
  playSpecialLight: vi.fn(),
  playKyoOniyaki: vi.fn(),
  playKyoYamibarai: vi.fn(),
  playKyoAragami: vi.fn(),
  playKyoDokugami: vi.fn(),
  playKyo75Kai: vi.fn(),
  playKyoRedKick: vi.fn(),
  playIoriAoihana: vi.fn(),
  playIoriYamibarai: vi.fn(),
  playIoriOniyaki: vi.fn(),
  playIoriKototsuki: vi.fn(),
  playIoriKuzukaze: vi.fn(),
}));

function makeCtx(atkName: string, charId: string): HitEffectContext {
  return {
    vfx: {
      spawnImpactRing: vi.fn(),
      spawnProjectileExplosion: vi.fn(),
      spawnHeavyDust: vi.fn(),
      spawnSuperBurst: vi.fn(),
      spawnKooukenVFX: vi.fn(),
      spawnKoHouVFX: vi.fn(),
      spawnKoHouCVFX: vi.fn(),
      spawnHienTrail: vi.fn(),
      spawnHienLandingDust: vi.fn(),
      spawnHaouFlash: vi.fn(),
      spawnDMTenHaOuVFX: vi.fn(),
      spawnGroundSlam: vi.fn(),
      spawnScreenCracks: vi.fn(),
      spawnKyoOniyakiVFX: vi.fn(),
      spawnKyoOrochinagiVFX: vi.fn(),
      spawnKyoDokugamiTrail: vi.fn(),
      spawnKyoFireKickTrail: vi.fn(),
      spawnIoriOniyakiVFX: vi.fn(),
      spawnIoriYamibaraiVFX: vi.fn(),
      spawnIoriAoihanaTrail: vi.fn(),
      spawnIoriYatagarasuVFX: vi.fn(),
      spawnIoriKuzukazeVFX: vi.fn(),
    } as any,
    cinematic: { addHitStop: vi.fn() } as any,
    screenShake: { trigger: vi.fn() } as any,
    screenFlash: { trigger: vi.fn(), triggerDarken: vi.fn() } as any,
    attacker: { x: 200, y: 0, facing: 1, charId } as any,
    defender: { x: 280 } as any,
    attackType: atkName,
    hitX: 250,
    hitY: -40,
    counterHit: false,
    combo: 0,
    defIdx: 1,
    attackDirectionBias: 5,
  };
}

// ===== Ryo =====
const RYO_ATTACKS = [
  'RYO_KOOU', 'RYO_KOOU_C', 'RYO_KOOUKEN_D',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN',
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
  'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
];

describe('Ryo special attack VFX coverage', () => {
  it.each(RYO_ATTACKS)('%s is handled by Ryo hit effects', (atkName) => {
    const ctx = makeCtx(atkName, 'ryo');
    const handled = RYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(handled).toBe(true);
  });

  it(`all ${RYO_ATTACKS.length} Ryo specials are covered`, () => {
    expect(RYO_ATTACKS.length).toBe(16);
  });
});

// ===== Kyo =====
const KYO_ATTACKS = [
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'KYO_RED_KICK', 'KYO_75KAI', 'KYO_75KAI_2',
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI',
];

describe('Kyo special attack VFX coverage', () => {
  it.each(KYO_ATTACKS)('%s is handled by Kyo hit effects', (atkName) => {
    const ctx = makeCtx(atkName, 'kyo');
    const handled = KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(handled).toBe(true);
  });

  it(`all ${KYO_ATTACKS.length} Kyo specials are covered`, () => {
    expect(KYO_ATTACKS.length).toBe(22);
  });
});

// ===== Iori =====
const IORI_ATTACKS = [
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D',
  'IORI_KUZUKAZE',
  'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
  'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME',
];

describe('Iori special attack VFX coverage', () => {
  it.each(IORI_ATTACKS)('%s is handled by Iori hit effects', (atkName) => {
    const ctx = makeCtx(atkName, 'iori');
    const handled = IORI_HIT_EFFECTS.onHitVFX(ctx);
    expect(handled).toBe(true);
  });

  it(`all ${IORI_ATTACKS.length} Iori specials are covered`, () => {
    expect(IORI_ATTACKS.length).toBe(19);
  });
});

// ===== SFX Coverage =====
describe('SFX coverage for all 3 characters', () => {
  it.each(RYO_ATTACKS)('Ryo %s has SFX handler', (atkName) => {
    const ctx = makeCtx(atkName, 'ryo');
    const handled = RYO_HIT_EFFECTS.onHitSFX(ctx);
    expect(handled).toBe(true);
  });

  it.each(KYO_ATTACKS)('Kyo %s has SFX handler', (atkName) => {
    const ctx = makeCtx(atkName, 'kyo');
    const handled = KYO_HIT_EFFECTS.onHitSFX(ctx);
    expect(handled).toBe(true);
  });

  it.each(IORI_ATTACKS)('Iori %s has SFX handler', (atkName) => {
    const ctx = makeCtx(atkName, 'iori');
    const handled = IORI_HIT_EFFECTS.onHitSFX(ctx);
    expect(handled).toBe(true);
  });
});

// ===== Total count =====
describe('Total coverage summary', () => {
  it('covers all 57 special attacks across 3 characters', () => {
    const total = RYO_ATTACKS.length + KYO_ATTACKS.length + IORI_ATTACKS.length;
    expect(total).toBe(57);
  });
});
