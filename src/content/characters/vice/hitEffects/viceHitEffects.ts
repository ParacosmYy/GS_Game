/**
 * Vice Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 *
 * Vice's hit effects emphasize dark Orochi energy:
 * - Outrage: purple energy rush impact
 * - Black End: dark grab slam shockwave
 * - Mayhem: low sweep with dark energy dust
 * - Gore Fest: brutal grab with dark aura burst
 * - Withering Surface DM: multi-hit dark energy barrage
 * - Negative Gain DM: massive grab slam with Orochi explosion
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function viceVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Outrage — purple energy rush punch
  if (atkName === 'VICE_OUTRAGE' || atkName === 'VICE_OUTRAGE_C') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#6622aa', '#9944cc');
    screenShake.trigger(7, 6, attacker.facing * 4);
    return true;
  }
  // Black End — dark grab slam shockwave
  if (atkName === 'VICE_BLACK_END') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(10, 8, attacker.facing * 5);
    vfx.spawnImpactRing(hitX, hitY, 1.2);
    return true;
  }
  // Mayhem — low sweep with dark energy dust
  if (atkName === 'VICE_MAYHEM') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    vfx.spawnProjectileExplosion(hitX, hitY, '#441166', '#773399');
    return true;
  }
  // Gore Fest — brutal grab with dark aura burst
  if (atkName === 'VICE_GORE_FEST') {
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnImpactRing(hitX, hitY, 1.5);
    vfx.spawnSuperBurst(hitX, hitY, '#6622aa', '#9944cc', false);
    screenShake.trigger(12, 10, attacker.facing * 6);
    return true;
  }
  // Monstrosity — command normal upper strike
  if (atkName === 'VICE_MONSTROSITY') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 3);
    return true;
  }
  // Overkill — command normal low strike
  if (atkName === 'VICE_OVERKILL') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    screenShake.trigger(5, 4, attacker.facing * 3);
    return true;
  }
  // Withering Surface DM — multi-hit dark energy barrage
  if (atkName === 'DM_WITHERING_SURFACE' || atkName === 'SDM_WITHERING_SURFACE') {
    const isSDM = atkName === 'SDM_WITHERING_SURFACE';
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnSuperBurst(hitX, hitY, '#6622aa', '#cc88ff', isSDM);
    vfx.spawnScorchMark(hitX, hitY, '#220033');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#6622aa', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // Negative Gain DM — massive grab slam with Orochi explosion
  if (atkName === 'DM_NEGATIVE_GAIN' || atkName === 'SDM_NEGATIVE_GAIN') {
    const isSDM = atkName === 'SDM_NEGATIVE_GAIN';
    vfx.spawnSuperBurst(hitX, hitY, '#440066', '#cc44ff', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnImpactRing(hitX, hitY, isSDM ? 2.0 : 1.5);
    screenFlash.triggerDarken(isSDM ? 10 : 8);
    screenFlash.trigger('#440066', isSDM ? 0.4 : 0.3, isSDM ? 14 : 10);
    screenShake.trigger(isSDM ? 18 : 16, 16, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function viceSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const VICE_HIT_EFFECTS = {
  charId: 'vice',
  prefixes: ['VICE_', 'DM_WITHERING', 'SDM_WITHERING', 'DM_NEGATIVE', 'SDM_NEGATIVE'],
  onHitVFX: viceVFX,
  onHitSFX: viceSFX,
};
