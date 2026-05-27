import { describe, it, expect, vi } from 'vitest';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import type { HitEffectContext } from '../src/content/characterHitEffects.js';

vi.mock('../src/audio/sampler.js', () => ({
  playIoriKototsuki: vi.fn(),
  playHit: vi.fn(),
}));

function makeCtx(atkName: string): HitEffectContext {
  return {
    vfx: {
      spawnImpactRing: vi.fn(),
      spawnProjectileExplosion: vi.fn(),
      spawnSuperBurst: vi.fn(),
      spawnIoriAoihanaTrail: vi.fn(),
      spawnIoriKuzukazeVFX: vi.fn(),
      spawnIoriYatagarasuVFX: vi.fn(),
      spawnIoriOniyakiVFX: vi.fn(),
      spawnIoriYamibaraiVFX: vi.fn(),
      spawnGroundSlam: vi.fn(),
      spawnScreenCracks: vi.fn(),
    } as any,
    cinematic: { addHitStop: vi.fn() } as any,
    screenShake: { trigger: vi.fn() } as any,
    screenFlash: { trigger: vi.fn(), triggerDarken: vi.fn() } as any,
    attacker: { x: 200, y: 0, facing: 1, charId: 'iori' } as any,
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

describe('Iori Kototsuki A vs D version VFX', () => {
  it('both versions are handled by Iori hit effects', () => {
    const ctxA = makeCtx('IORI_KOTOTSUKI');
    const ctxD = makeCtx('IORI_KOTOTSUKI_D');
    expect(IORI_HIT_EFFECTS.onHitVFX(ctxA)).toBe(true);
    expect(IORI_HIT_EFFECTS.onHitVFX(ctxD)).toBe(true);
  });

  it('both get impact ring + projectile explosion + trail', () => {
    for (const atk of ['IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D']) {
      const ctx = makeCtx(atk);
      IORI_HIT_EFFECTS.onHitVFX(ctx);
      expect(ctx.vfx.spawnImpactRing).toHaveBeenCalled();
      expect(ctx.vfx.spawnProjectileExplosion).toHaveBeenCalled();
      expect(ctx.vfx.spawnIoriAoihanaTrail).toHaveBeenCalled();
    }
  });

  it('both get hitstop and screen shake', () => {
    for (const atk of ['IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D']) {
      const ctx = makeCtx(atk);
      IORI_HIT_EFFECTS.onHitVFX(ctx);
      expect(ctx.cinematic.addHitStop).toHaveBeenCalled();
      expect(ctx.screenShake.trigger).toHaveBeenCalled();
    }
  });

  it('both have SFX handler', () => {
    const ctxA = makeCtx('IORI_KOTOTSUKI');
    const ctxD = makeCtx('IORI_KOTOTSUKI_D');
    expect(IORI_HIT_EFFECTS.onHitSFX(ctxA)).toBe(true);
    expect(IORI_HIT_EFFECTS.onHitSFX(ctxD)).toBe(true);
  });
});
