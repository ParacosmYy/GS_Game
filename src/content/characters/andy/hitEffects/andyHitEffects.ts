/**
 * Andy Hit Effects — Character-specific VFX/SFX for Shiranui-ryu ninja style
 *
 * Andy's fighting style emphasizes speed and precision:
 * energy projectiles (Hishou Ken), rising uppercuts (Shouryuu Dan),
 * dash punches (Zan'ei Ryuusei Ken), and aerial dives (Geki Hishou Ken).
 * Hit effects reflect his blue/orange energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function andyVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Hishou Ken — energy projectile impact
  if (atkName === 'ANDY_HISHOU_KEN' || atkName === 'ANDY_HISHOU_KEN_C') {
    const isStrong = atkName === 'ANDY_HISHOU_KEN_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#2266cc', '#88bbff');
    return true;
  }
  // Shouryuu Dan — rising uppercut
  if (atkName === 'ANDY_SHOURYUU_DAN' || atkName === 'ANDY_SHOURYUU_DAN_C') {
    const isStrong = atkName === 'ANDY_SHOURYUU_DAN_C';
    cinematic.addHitStop(isStrong ? 3 : 2, ctx.defIdx);
    screenShake.trigger(isStrong ? 10 : 8, isStrong ? 8 : 6, attacker.facing * (isStrong ? 6 : 4));
    vfx.spawnImpactRing(hitX, hitY, isStrong ? 1.2 : 0.8);
    vfx.spawnHeavyDust(hitX, hitY, isStrong ? 6 : 4);
    return true;
  }
  // Zan'ei Ryuusei Ken — dash punch
  if (atkName === 'ANDY_ZANEI_RYUSEI_KEN' || atkName === 'ANDY_ZANEI_RYUSEI_KEN_D') {
    const isStrong = atkName === 'ANDY_ZANEI_RYUSEI_KEN_D';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 9 : 7, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#ffaa22', '#ffcc44');
    vfx.spawnHeavyDust(hitX, hitY, isStrong ? 5 : 3);
    return true;
  }
  // Geki Hishou Ken — air dive
  if (atkName === 'ANDY_GEKI_HISHOU_KEN') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(10, 8, attacker.facing * 6);
    vfx.spawnHeavyDust(hitX, hitY, 8);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    return true;
  }
  // Uwa Agito / Gedan Agito — command normals
  if (atkName === 'ANDY_UWA_AGITO' || atkName === 'ANDY_GEDAN_AGITO') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 2);
    return true;
  }
  // DM Cho Reppa Dan — multi-hit rising uppercut super
  if (atkName === 'DM_CHO_REPPA_DAN') {
    vfx.spawnSuperBurst(hitX, hitY, '#2266cc', '#ffaa22', false);
    vfx.spawnScorchMark(hitX, hitY, '#001133');
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#2266cc', 0.3, 10);
    screenShake.trigger(16, 14, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function andySFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const ANDY_HIT_EFFECTS = {
  charId: 'andy',
  prefixes: ['ANDY_', 'DM_CHO_'],
  onHitVFX: andyVFX,
  onHitSFX: andySFX,
};
