import { describe, it, expect, vi } from 'vitest';
import type { HitEffectContext, CharacterHitEffects } from '../src/content/characterHitEffects.js';

// Import Kyo hit effects plugin
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';

function makeCtx(atkName: string): HitEffectContext {
  return {
    vfx: {
      spawnImpactRing: vi.fn(),
      spawnProjectileExplosion: vi.fn(),
      spawnHeavyDust: vi.fn(),
      spawnSuperBurst: vi.fn(),
      spawnKyoOniyakiVFX: vi.fn(),
      spawnKyoOrochinagiVFX: vi.fn(),
      spawnKyoDokugamiTrail: vi.fn(),
      spawnKyoFireKickTrail: vi.fn(),
      spawnGroundSlam: vi.fn(),
      spawnScreenCracks: vi.fn(),
      spawnSlashLine: vi.fn(),
    } as any,
    cinematic: { addHitStop: vi.fn() } as any,
    screenShake: { trigger: vi.fn() } as any,
    screenFlash: { trigger: vi.fn(), triggerDarken: vi.fn() } as any,
    attacker: { x: 200, y: 0, facing: 1, charId: 'kyo', displayHeight: 80 } as any,
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

describe('Kyo Aragami Chain Progressive VFX', () => {
  it('ARAGAMI (opener) triggers projectileExplosion + impactRing', () => {
    const ctx = makeCtx('KYO_ARAGAMI');
    KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(ctx.vfx.spawnImpactRing).toHaveBeenCalled();
    expect(ctx.vfx.spawnProjectileExplosion).toHaveBeenCalled();
    expect(ctx.cinematic.addHitStop).toHaveBeenCalledWith(1, 1);
  });

  it('KONOKIZU triggers shake + ring + explosion (escalating)', () => {
    const ctx = makeCtx('KYO_ARAGAMI_KONOKIZU');
    KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(ctx.screenShake.trigger).toHaveBeenCalled();
    expect(ctx.vfx.spawnImpactRing).toHaveBeenCalled();
    expect(ctx.vfx.spawnProjectileExplosion).toHaveBeenCalled();
  });

  it('NANASE triggers explosion + impactRing', () => {
    const ctx = makeCtx('KYO_NANASE');
    KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(ctx.vfx.spawnProjectileExplosion).toHaveBeenCalled();
    expect(ctx.vfx.spawnImpactRing).toHaveBeenCalled();
  });

  it('KOTO_TSUKI (finisher) triggers screenFlash + hitstop(2)', () => {
    const ctx = makeCtx('KYO_KOTO_TSUKI');
    KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(ctx.screenFlash.trigger).toHaveBeenCalled();
    expect(ctx.cinematic.addHitStop).toHaveBeenCalledWith(2, 1);
    expect(ctx.vfx.spawnImpactRing).toHaveBeenCalled();
    expect(ctx.vfx.spawnProjectileExplosion).toHaveBeenCalled();
  });

  it('YAKISOGI (finisher) triggers same as KOTO_TSUKI', () => {
    const ctx = makeCtx('KYO_YAKISOGI');
    KYO_HIT_EFFECTS.onHitVFX(ctx);
    expect(ctx.screenFlash.trigger).toHaveBeenCalled();
    expect(ctx.cinematic.addHitStop).toHaveBeenCalledWith(2, 1);
  });

  it('ARAGAMI hitstop is less than finisher hitstop', () => {
    const openCtx = makeCtx('KYO_ARAGAMI');
    const finCtx = makeCtx('KYO_KOTO_TSUKI');
    KYO_HIT_EFFECTS.onHitVFX(openCtx);
    KYO_HIT_EFFECTS.onHitVFX(finCtx);
    // Opener gets hitstop(1), finisher gets hitstop(2) — progressive escalation
    expect(openCtx.cinematic.addHitStop).toHaveBeenCalledWith(1, 1);
    expect(finCtx.cinematic.addHitStop).toHaveBeenCalledWith(2, 1);
  });
});
