/**
 * Yashiro Hit Effects — Character-specific VFX/SFX for heavy puncher style
 *
 * Yashiro's fighting style emphasizes raw power punches (Upper Duke, Sledgehammer),
 * charging attacks (Jet Counter), palm strikes (Regret Bash), and multi-hit DMs.
 * Hit effects reflect his purple/or dark energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function yashiroVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Upper Duke — hook punch rush
  if (atkName === 'YASHIRO_UPPER_DU' || atkName === 'YASHIRO_UPPER_DU_C') {
    const isStrong = atkName === 'YASHIRO_UPPER_DU_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#9966cc', '#bb88ee');
    return true;
  }
  // Regret Bash — palm strike
  if (atkName === 'YASHIRO_NIRAAI' || atkName === 'YASHIRO_NIRAAI_C') {
    const isStrong = atkName === 'YASHIRO_NIRAAI_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, 6, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnHeavyDust(hitX, hitY, isStrong ? 7 : 5);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    return true;
  }
  // Jet Counter — dash attack
  if (atkName === 'YASHIRO_MUSATSU' || atkName === 'YASHIRO_MUSATSU_D') {
    const isStrong = atkName === 'YASHIRO_MUSATSU_D';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 9 : 7, 6, attacker.facing * (isStrong ? 6 : 4));
    vfx.spawnHeavyDust(hitX, hitY, 6);
    vfx.spawnProjectileExplosion(hitX, hitY, '#9966cc', '#bb88ee');
    return true;
  }
  // Sledgehammer — anti-air uppercut
  if (atkName === 'YASHIRO_SLEDGEHAMMER' || atkName === 'YASHIRO_SLEDGEHAMMER_C') {
    const isStrong = atkName === 'YASHIRO_SLEDGEHAMMER_C';
    cinematic.addHitStop(isStrong ? 3 : 2, ctx.defIdx);
    screenShake.trigger(isStrong ? 10 : 8, 8, attacker.facing * (isStrong ? 6 : 4));
    vfx.spawnProjectileExplosion(hitX, hitY, '#9966cc', '#bb88ee');
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // Shuu Wani — command normal upper
  if (atkName === 'YASHIRO_SHUU_WANI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 3);
    return true;
  }
  // Juu Zutsu — command normal overhead
  if (atkName === 'YASHIRO_JUU_ZUTSU') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    return true;
  }
  // DM Million Bash Stream — multi-hit punch super
  if (atkName === 'DM_MILLION_BASH_STREAM' || atkName === 'SDM_MILLION_BASH_STREAM') {
    const isSDM = atkName === 'SDM_MILLION_BASH_STREAM';
    vfx.spawnSuperBurst(hitX, hitY, '#9966cc', '#bb88ee', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#220033');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#9966cc', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Ore Maji Mamire — command throw DM
  if (atkName === 'DM_ORE_MAJI_MAMIRE' || atkName === 'SDM_ORE_MAJI_MAMIRE') {
    const isSDM = atkName === 'SDM_ORE_MAJI_MAMIRE';
    cinematic.addHitStop(isSDM ? 5 : 3, ctx.defIdx);
    vfx.spawnSuperBurst(hitX, hitY, '#9966cc', '#ffffff', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 10);
    screenFlash.triggerDarken(isSDM ? 8 : 5);
    screenFlash.trigger('#9966cc', isSDM ? 0.4 : 0.25, isSDM ? 14 : 8);
    screenShake.trigger(isSDM ? 18 : 14, isSDM ? 16 : 12, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function yashiroSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const YASHIRO_HIT_EFFECTS = {
  charId: 'yashiro',
  prefixes: ['YASHIRO_', 'DM_', 'SDM_'],
  onHitVFX: yashiroVFX,
  onHitSFX: yashiroSFX,
};
