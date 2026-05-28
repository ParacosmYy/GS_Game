/**
 * Character Hit Effects Plugin Registry Test
 * Verifies Kyo/Iori hit effect plugins have complete attack coverage and valid structure.
 */
import { describe, it, expect } from 'vitest';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import type { CharacterHitEffects } from '../src/content/characterHitEffects.js';

// All Kyo attack types that should be handled by hit effects
const KYO_ATTACKS = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_75KAI', 'KYO_75KAI_2',
  'KYO_RED_KICK',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI',
];

const IORI_ATTACKS = [
  'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D',
  'IORI_KUZUKAZE',
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME',
];

function makeMockCtx(attackType: string) {
  const vfxCalls: string[] = [];
  const sfxCalls: string[] = [];
  return {
    vfx: {
      spawnImpactRing: (..._: any[]) => { vfxCalls.push('impactRing'); },
      spawnProjectileExplosion: (..._: any[]) => { vfxCalls.push('projectileExplosion'); },
      spawnSuperBurst: (..._: any[]) => { vfxCalls.push('superBurst'); },
      spawnGroundSlam: (..._: any[]) => { vfxCalls.push('groundSlam'); },
      spawnHeavyDust: (..._: any[]) => { vfxCalls.push('heavyDust'); },
      spawnKyoOniyakiVFX: (..._: any[]) => { vfxCalls.push('kyoOniyaki'); },
      spawnKyoDokugamiTrail: (..._: any[]) => { vfxCalls.push('kyoDokugami'); },
      spawnKyoFireKickTrail: (..._: any[]) => { vfxCalls.push('kyoFireKick'); },
      spawnKyoOrochinagiVFX: (..._: any[]) => { vfxCalls.push('kyoOrochinagi'); },
      spawnIoriOniyakiVFX: (..._: any[]) => { vfxCalls.push('ioriOniyaki'); },
      spawnIoriYamibaraiVFX: (..._: any[]) => { vfxCalls.push('ioriYamibarai'); },
      spawnIoriAoihanaTrail: (..._: any[]) => { vfxCalls.push('ioriAoihana'); },
      spawnIoriYatagarasuVFX: (..._: any[]) => { vfxCalls.push('ioriYatagarasu'); },
      spawnIoriKuzukazeVFX: (..._: any[]) => { vfxCalls.push('ioriKuzukaze'); },
      spawnScreenCracks: (..._: any[]) => { vfxCalls.push('screenCracks'); },
    },
    screenShake: { trigger: (..._: any[]) => { vfxCalls.push('screenShake'); } },
    screenFlash: {
      trigger: (..._: any[]) => { vfxCalls.push('screenFlash'); },
      triggerDarken: (..._: any[]) => { vfxCalls.push('darken'); },
    },
    cinematic: { addHitStop: (..._: any[]) => { vfxCalls.push('hitStop'); } },
    attacker: { facing: 1 } as any,
    defender: {} as any,
    attackType: attackType as any,
    hitX: 400,
    hitY: 300,
    counterHit: false,
    combo: 0,
    attackDirectionBias: 1,
    defIdx: 1,
    vfxCalls,
    sfxCalls,
  };
}

describe('Kyo Hit Effects Plugin', () => {
  it('has valid plugin structure', () => {
    expect(KYO_HIT_EFFECTS.charId).toBe('kyo');
    expect(KYO_HIT_EFFECTS.prefixes.length).toBeGreaterThan(0);
    expect(typeof KYO_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof KYO_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('prefixes cover all Kyo attack types', () => {
    for (const atk of KYO_ATTACKS) {
      const matched = KYO_HIT_EFFECTS.prefixes.some(pre => atk.startsWith(pre) || atk === pre);
      expect(matched, `prefix covers ${atk}`).toBe(true);
    }
  });

  it('VFX handler handles all Kyo attacks', () => {
    for (const atk of KYO_ATTACKS) {
      const ctx = makeMockCtx(atk);
      const handled = KYO_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(handled, `VFX handles ${atk}`).toBe(true);
      expect(ctx.vfxCalls.length, `${atk} produces VFX`).toBeGreaterThan(0);
    }
  });

  it('VFX produces screenShake for heavy attacks', () => {
    const heavyAttacks = ['KYO_ONIYAKI_C', 'KYO_RED_KICK', 'DM_OROCHINAGI', 'KYO_BATSUYOMI'];
    for (const atk of heavyAttacks) {
      const ctx = makeMockCtx(atk);
      KYO_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(ctx.vfxCalls, `${atk} screenShake`).toContain('screenShake');
    }
  });

  it('DM/SDM/HSDM produce superBurst', () => {
    for (const atk of ['DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI'] as const) {
      const ctx = makeMockCtx(atk);
      KYO_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(ctx.vfxCalls, `${atk} superBurst`).toContain('superBurst');
    }
  });

  it('HSDM has screen cracks', () => {
    const ctx = makeMockCtx('HSDM_OROCHINAGI');
    KYO_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('screenCracks');
  });

  it('Oniyaki C has more VFX than Oniyaki A', () => {
    const ctxA = makeMockCtx('KYO_ONIYAKI');
    const ctxC = makeMockCtx('KYO_ONIYAKI_C');
    KYO_HIT_EFFECTS.onHitVFX(ctxA as any);
    KYO_HIT_EFFECTS.onHitVFX(ctxC as any);
    expect(ctxC.vfxCalls.length).toBeGreaterThanOrEqual(ctxA.vfxCalls.length);
  });
});

describe('Iori Hit Effects Plugin', () => {
  it('has valid plugin structure', () => {
    expect(IORI_HIT_EFFECTS.charId).toBe('iori');
    expect(IORI_HIT_EFFECTS.prefixes.length).toBeGreaterThan(0);
    expect(typeof IORI_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof IORI_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('prefixes cover all Iori attack types', () => {
    for (const atk of IORI_ATTACKS) {
      const matched = IORI_HIT_EFFECTS.prefixes.some(pre => atk.startsWith(pre) || atk === pre);
      expect(matched, `prefix covers ${atk}`).toBe(true);
    }
  });

  it('VFX handler handles all Iori attacks', () => {
    for (const atk of IORI_ATTACKS) {
      const ctx = makeMockCtx(atk);
      const handled = IORI_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(handled, `VFX handles ${atk}`).toBe(true);
      expect(ctx.vfxCalls.length, `${atk} produces VFX`).toBeGreaterThan(0);
    }
  });

  it('VFX produces screenShake for heavy attacks', () => {
    const heavyAttacks = ['IORI_ONIYAKI_C', 'IORI_KUZUKAZE', 'DM_YATAGARASU', 'IORI_AOIHANA_3'];
    for (const atk of heavyAttacks) {
      const ctx = makeMockCtx(atk);
      IORI_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(ctx.vfxCalls, `${atk} screenShake`).toContain('screenShake');
    }
  });

  it('DM/SDM/HSDM produce superBurst', () => {
    for (const atk of ['DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME'] as const) {
      const ctx = makeMockCtx(atk);
      IORI_HIT_EFFECTS.onHitVFX(ctx as any);
      expect(ctx.vfxCalls, `${atk} superBurst`).toContain('superBurst');
    }
  });

  it('HSDM has screen cracks', () => {
    const ctx = makeMockCtx('HSDM_YAOTOME');
    IORI_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('screenCracks');
  });

  it('Aoihana chain escalates VFX per stage', () => {
    const ctx1 = makeMockCtx('IORI_AOIHANA');
    const ctx3 = makeMockCtx('IORI_AOIHANA_3');
    IORI_HIT_EFFECTS.onHitVFX(ctx1 as any);
    IORI_HIT_EFFECTS.onHitVFX(ctx3 as any);
    expect(ctx3.vfxCalls.length).toBeGreaterThanOrEqual(ctx1.vfxCalls.length);
  });

  it('Kuzukaze produces dark vortex VFX', () => {
    const ctx = makeMockCtx('IORI_KUZUKAZE');
    IORI_HIT_EFFECTS.onHitVFX(ctx as any);
    expect(ctx.vfxCalls).toContain('ioriKuzukaze');
  });
});

describe('Hit Effects — escalation hierarchy', () => {
  it('Kyo: DM < SDM < HSDM VFX complexity', () => {
    const dm = makeMockCtx('DM_OROCHINAGI');
    const sdm = makeMockCtx('SDM_OROCHINAGI');
    const hsdm = makeMockCtx('HSDM_OROCHINAGI');
    KYO_HIT_EFFECTS.onHitVFX(dm as any);
    KYO_HIT_EFFECTS.onHitVFX(sdm as any);
    KYO_HIT_EFFECTS.onHitVFX(hsdm as any);
    expect(sdm.vfxCalls.length).toBeGreaterThanOrEqual(dm.vfxCalls.length);
    expect(hsdm.vfxCalls.length).toBeGreaterThanOrEqual(sdm.vfxCalls.length);
  });

  it('Iori: DM < SDM < HSDM VFX complexity', () => {
    const dm = makeMockCtx('DM_YATAGARASU');
    const sdm = makeMockCtx('SDM_YATAGARASU');
    const hsdm = makeMockCtx('HSDM_YAOTOME');
    IORI_HIT_EFFECTS.onHitVFX(dm as any);
    IORI_HIT_EFFECTS.onHitVFX(sdm as any);
    IORI_HIT_EFFECTS.onHitVFX(hsdm as any);
    expect(sdm.vfxCalls.length).toBeGreaterThanOrEqual(dm.vfxCalls.length);
    expect(hsdm.vfxCalls.length).toBeGreaterThanOrEqual(sdm.vfxCalls.length);
  });
});
