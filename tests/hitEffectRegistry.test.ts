/**
 * Hit Effect Registry Dispatch Test
 * Verifies the registry correctly routes attacks to the right character plugin.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerHitEffects,
  dispatchHitVFX,
  dispatchHitSFX,
  getRegisteredEffectIds,
} from '../src/content/characterHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';

// Re-register to ensure they're in the registry
registerHitEffects(KYO_HIT_EFFECTS);
registerHitEffects(IORI_HIT_EFFECTS);

function makeMockCtx(attackType: string) {
  const calls: string[] = [];
  return {
    vfx: {
      spawnImpactRing: () => { calls.push('impactRing'); },
      spawnProjectileExplosion: () => { calls.push('projExplosion'); },
      spawnSuperBurst: () => { calls.push('superBurst'); },
      spawnGroundSlam: () => { calls.push('groundSlam'); },
      spawnHeavyDust: () => { calls.push('heavyDust'); },
      spawnKyoOniyakiVFX: () => { calls.push('kyoOniyaki'); },
      spawnKyoDokugamiTrail: () => { calls.push('kyoDokugami'); },
      spawnKyoFireKickTrail: () => { calls.push('kyoFireKick'); },
      spawnKyoOrochinagiVFX: () => { calls.push('kyoOrochinagi'); },
      spawnIoriOniyakiVFX: () => { calls.push('ioriOniyaki'); },
      spawnIoriYamibaraiVFX: () => { calls.push('ioriYamibarai'); },
      spawnIoriAoihanaTrail: () => { calls.push('ioriAoihana'); },
      spawnIoriYatagarasuVFX: () => { calls.push('ioriYatagarasu'); },
      spawnIoriKuzukazeVFX: () => { calls.push('ioriKuzukaze'); },
      spawnScreenCracks: () => { calls.push('screenCracks'); },
    },
    screenShake: { trigger: () => { calls.push('shake'); } },
    screenFlash: { trigger: () => { calls.push('flash'); }, triggerDarken: () => { calls.push('darken'); } },
    cinematic: { addHitStop: () => { calls.push('hitStop'); } },
    attacker: { facing: 1 } as any,
    defender: {} as any,
    attackType: attackType as any,
    hitX: 400, hitY: 300,
    counterHit: false, combo: 0,
    attackDirectionBias: 1, defIdx: 1,
    calls,
  };
}

describe('Hit Effect Registry — dispatch routing', () => {
  it('kyo and iori are registered', () => {
    const ids = getRegisteredEffectIds();
    expect(ids).toContain('kyo');
    expect(ids).toContain('iori');
  });

  it('dispatches Kyo attack to Kyo plugin', () => {
    const ctx = makeMockCtx('KYO_ONIYAKI');
    const handled = dispatchHitVFX(ctx as any);
    expect(handled).toBe(true);
    expect(ctx.calls.length).toBeGreaterThan(0);
  });

  it('dispatches Iori attack to Iori plugin', () => {
    const ctx = makeMockCtx('IORI_ONIYAKI');
    const handled = dispatchHitVFX(ctx as any);
    expect(handled).toBe(true);
    expect(ctx.calls.length).toBeGreaterThan(0);
  });

  it('dispatches Kyo DM correctly', () => {
    const ctx = makeMockCtx('DM_OROCHINAGI');
    const handled = dispatchHitVFX(ctx as any);
    expect(handled).toBe(true);
  });

  it('dispatches Iori DM correctly', () => {
    const ctx = makeMockCtx('DM_YATAGARASU');
    const handled = dispatchHitVFX(ctx as any);
    expect(handled).toBe(true);
  });

  it('Kyo attacks do not trigger Iori effects', () => {
    const ctx = makeMockCtx('KYO_ONIYAKI');
    dispatchHitVFX(ctx as any);
    expect(ctx.calls).not.toContain('ioriOniyaki');
    expect(ctx.calls).not.toContain('ioriYamibarai');
  });

  it('Iori attacks do not trigger Kyo effects', () => {
    const ctx = makeMockCtx('IORI_ONIYAKI');
    dispatchHitVFX(ctx as any);
    expect(ctx.calls).not.toContain('kyoOniyaki');
    expect(ctx.calls).not.toContain('kyoOrochinagi');
  });

  it('unknown attack returns false for VFX dispatch', () => {
    const ctx = makeMockCtx('UNKNOWN_ATTACK');
    const handled = dispatchHitVFX(ctx as any);
    expect(handled).toBe(false);
  });
});
