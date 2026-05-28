/**
 * Yamazaki Hit Effects — Character-specific VFX/SFX for Ryuji Yamazaki
 *
 * Snake Arm: dark green energy lash, whip-like impact
 * Sandstorm: explosive burst, dust clouds
 * Bai Gaeshi: low sweep with heavy dust
 * Guillotine DM: massive downward slash, dark energy burst
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function yamazakiVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Snake Arm — dark energy whip lash
  if (atkName === 'YAMAZAKI_SNAKE_ARM' || atkName === 'YAMAZAKI_SNAKE_ARM_C') {
    const isStrong = atkName === 'YAMAZAKI_SNAKE_ARM_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, isStrong ? 1.2 : 0.8);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * 4);
    vfx.spawnProjectileExplosion(hitX, hitY, '#335522', '#88aa44');
    return true;
  }
  // Sandstorm / Hebi Tsukai — explosive burst
  if (atkName === 'YAMAZAKI_SANDSTORM') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 8);
    screenShake.trigger(10, 8, attacker.facing * 5);
    return true;
  }
  // Bai Gaeshi — low sweep with heavy dust
  if (atkName === 'YAMAZAKI_BAI_GA_SE') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // Sashi — quick thrust
  if (atkName === 'YAMAZAKI_SASHI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(4, 4, attacker.facing * 2);
    return true;
  }
  // Bokkai — low thrust
  if (atkName === 'YAMAZAKI_BOKKAI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(4, 4, attacker.facing * 2);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    return true;
  }
  // Drill — multi-hit rush
  if (atkName === 'YAMAZAKI_DRILL') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(8, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    return true;
  }
  // Guillotine DM — massive dark energy slash
  if (atkName === 'DM_GUILLOTINE' || atkName === 'SDM_GUILLOTINE') {
    const isSDM = atkName === 'SDM_GUILLOTINE';
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnSuperBurst(hitX, hitY, '#446622', '#88cc44', isSDM);
    vfx.spawnScorchMark(hitX, hitY, '#112200');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#446622', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // HSDM Drill — ultimate
  if (atkName === 'HSDM_DRILL') {
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnSuperBurst(hitX, hitY, '#556622', '#aaff44', true);
    vfx.spawnScorchMark(hitX, hitY, '#223300');
    screenFlash.triggerDarken(10);
    screenFlash.trigger('#556622', 0.4, 14);
    screenShake.trigger(18, 16, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function yamazakiSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const YAMAZAKI_HIT_EFFECTS = {
  charId: 'yamazaki',
  prefixes: ['YAMAZAKI_', 'DM_GUILLOTINE', 'SDM_GUILLOTINE', 'HSDM_DRILL'],
  onHitVFX: yamazakiVFX,
  onHitSFX: yamazakiSFX,
};
