/**
 * Yuri Hit Effects — Character-specific VFX/SFX
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function yuriVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Ko-ou Ken — orange fireball spark
  if (atkName === 'YURI_KO_OU_KEN') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff8800', '#ffcc44');
    screenShake.trigger(6, 5, attacker.facing * 3);
    return true;
  }

  // Haoh Sho Ko Ken — large pink energy blast
  if (atkName === 'YURI_HAOH_SHO_KO_KEN') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4488', '#ffaacc');
    screenShake.trigger(8, 6, attacker.facing * 4);
    return true;
  }

  // Chou Upper — rising impact ring
  if (atkName === 'YURI_CHOU_UPPER') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    screenShake.trigger(7, 5, attacker.facing * 3);
    return true;
  }

  // Hyaku Retsu Binta — multi-hit slap
  if (atkName === 'YURI_HYAKU_RETSU_BINTA') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 2);
    return true;
  }

  // Hien Hou'ou Kyaku — kick combo
  if (atkName === 'YURI_HIEN_HOU_OU_KYAKU') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    screenShake.trigger(8, 6, attacker.facing * 4);
    return true;
  }

  // Hishou Kuuretsu Zan — air dive
  if (atkName === 'YURI_HISHOU_KUURETSU_ZAN') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 1.1);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    screenShake.trigger(8, 6, attacker.facing * 4);
    return true;
  }

  // DM — super flash + big spark
  if (atkName === 'DM_YURI_HAOH_SHO_KO_KEN' || atkName === 'DM_YURI_HIEN_HOU_OU_KYAKU') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff6699', '#ffaacc', false);
    vfx.spawnScorchMark(hitX, hitY, '#220011');
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#ff6699', 0.25, 10);
    screenShake.trigger(14, 12, ctx.attackDirectionBias);
    return true;
  }

  // SDM — stronger super flash
  if (atkName === 'SDM_YURI_HAOH_SHO_KO_KEN' || atkName === 'SDM_YURI_HIEN_HOU_OU_KYAKU') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff3377', '#ffaacc', true);
    vfx.spawnScorchMark(hitX, hitY, '#220011');
    screenFlash.triggerDarken(8);
    screenFlash.trigger('#ff3377', 0.4, 14);
    screenShake.trigger(16, 14, ctx.attackDirectionBias);
    return true;
  }

  // HSDM — maximum flash
  if (atkName === 'HSDM_YURI_HISHOU_KUURETSU_ZAN') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff0055', '#ffaacc', true);
    vfx.spawnGroundSlam(hitX, hitY);
    screenFlash.triggerDarken(10);
    screenFlash.trigger('#ff0055', 0.5, 16);
    screenShake.trigger(18, 16, ctx.attackDirectionBias);
    return true;
  }

  return false;
}

function yuriSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const YURI_HIT_EFFECTS = {
  charId: 'yuri',
  prefixes: ['YURI_', 'DM_YURI_', 'SDM_YURI_', 'HSDM_YURI_'],
  onHitVFX: yuriVFX,
  onHitSFX: yuriSFX,
};
