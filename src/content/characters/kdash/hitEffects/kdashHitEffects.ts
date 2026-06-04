/**
 * K' Hit Effects — Character-specific VFX/SFX for fire/explosive fighting style
 *
 * K''s fighting style emphasizes fire projectiles (Eins Trigger),
 * rising uppercuts (Crow Bites), and overhead kicks (Minute Spike).
 * Hit effects reflect his steel blue-gray / fire orange energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function kdashVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Eins Trigger — fire projectile impact
  if (atkName === 'KDASH_EINS' || atkName === 'KDASH_EINS_C') {
    const isStrong = atkName === 'KDASH_EINS_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4400', '#ff6600');
    return true;
  }
  // Crow Bites — rising uppercut
  if (atkName === 'KDASH_CROW' || atkName === 'KDASH_CROW_C') {
    const isStrong = atkName === 'KDASH_CROW_C';
    cinematic.addHitStop(isStrong ? 3 : 2, ctx.defIdx);
    screenShake.trigger(isStrong ? 10 : 7, isStrong ? 8 : 6, attacker.facing * (isStrong ? 6 : 4));
    vfx.spawnImpactRing(hitX, hitY, isStrong ? 1.0 : 0.7);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4400', '#ff6600');
    return true;
  }
  // Minute Spike — overhead kick
  if (atkName === 'KDASH_MINUTE') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 4);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // Narrow Spike — low kick
  if (atkName === 'KDASH_NARROW') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    return true;
  }
  // One Inch — command normal punch
  if (atkName === 'KDASH_ONE_INCH') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4400', '#6666aa');
    return true;
  }
  // Trigger Shot — command normal low kick
  if (atkName === 'KDASH_TRIGGER') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 2);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // DM Chain Shot — multi-hit super
  if (atkName === 'DM_CHAIN_SHOT' || atkName === 'SDM_CHAIN_SHOT') {
    const isSDM = atkName === 'SDM_CHAIN_SHOT';
    vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ff6600', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#442200');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#ff4400', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function kdashSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const KDASH_HIT_EFFECTS = {
  charId: 'kdash',
  prefixes: ['KDASH_', 'DM_CHAIN_SHOT', 'SDM_CHAIN_SHOT'],
  onHitVFX: kdashVFX,
  onHitSFX: kdashSFX,
};
