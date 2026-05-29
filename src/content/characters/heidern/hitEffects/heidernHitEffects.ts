/**
 * Heidern Hit Effects — Character-specific VFX/SFX for military mercenary style
 *
 * Heidern's fighting style emphasizes military precision:
 * knife strikes, command grabs (Stormbringer, Killing Bringer, Critical Driver),
 * charge projectile (Cross Cutter), and anti-air slash (Moon Slasher).
 * Hit effects use green/dark military colors with energy blade effects.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function heidernVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Cross Cutter — military blade projectile
  if (atkName === 'HEIDERN_CROSS_CUTTER' || atkName === 'HEIDERN_CROSS_CUTTER_C') {
    const isStrong = atkName === 'HEIDERN_CROSS_CUTTER_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#44cc44', '#88ff88');
    screenShake.trigger(isStrong ? 8 : 6, 6, attacker.facing * 4);
    return true;
  }
  // Moon Slasher — rising blade slash
  if (atkName === 'HEIDERN_MOON_SLASHER' || atkName === 'HEIDERN_MOON_SLASHER_C') {
    const isStrong = atkName === 'HEIDERN_MOON_SLASHER_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, isStrong ? 1.2 : 0.9);
    screenShake.trigger(isStrong ? 8 : 6, 6, attacker.facing * 3);
    return true;
  }
  // Neck Roller — neck grab throw
  if (atkName === 'HEIDERN_NECK_ROLLER' || atkName === 'HEIDERN_NECK_ROLLER_C') {
    const isStrong = atkName === 'HEIDERN_NECK_ROLLER_C';
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(isStrong ? 10 : 8, 8, attacker.facing * 5);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // Stormbringer — command grab with energy drain
  if (atkName === 'HEIDERN_STORMBRINGER' || atkName === 'HEIDERN_STORMBRINGER_C') {
    const isStrong = atkName === 'HEIDERN_STORMBRINGER_C';
    cinematic.addHitStop(isStrong ? 4 : 3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 8);
    screenShake.trigger(isStrong ? 12 : 10, 8, attacker.facing * 5);
    return true;
  }
  // Killing Bringer — counter grab
  if (atkName === 'HEIDERN_KILLING_BRINGER' || atkName === 'HEIDERN_KILLING_BRINGER_D') {
    const isStrong = atkName === 'HEIDERN_KILLING_BRINGER_D';
    cinematic.addHitStop(isStrong ? 4 : 3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 7);
    screenShake.trigger(isStrong ? 10 : 8, 8, attacker.facing * 4);
    return true;
  }
  // Leiden Reitter — spinning kick
  if (atkName === 'HEIDERN_LEIDEN_REITTER' || atkName === 'HEIDERN_LEIDEN_REITTER_D') {
    const isStrong = atkName === 'HEIDERN_LEIDEN_REITTER_D';
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(isStrong ? 7 : 6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    return true;
  }
  // Sliding — low sweep
  if (atkName === 'HEIDERN_SLIDING') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 4, attacker.facing * 2);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    return true;
  }
  // DM Critical Driver — command grab super
  if (atkName === 'DM_HEIDERN_CRITICAL_DRIVER' || atkName === 'SDM_HEIDERN_CRITICAL_DRIVER') {
    const isSDM = atkName === 'SDM_HEIDERN_CRITICAL_DRIVER';
    vfx.spawnSuperBurst(hitX, hitY, '#44cc44', '#88ff88', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#002200');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#44cc44', isSDM ? 0.4 : 0.25, isSDM ? 14 : 10);
    screenShake.trigger(isSDM ? 18 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Heidern End — rush blade super
  if (atkName === 'DM_HEIDERN_END' || atkName === 'SDM_HEIDERN_END') {
    const isSDM = atkName === 'SDM_HEIDERN_END';
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnSuperBurst(hitX, hitY, '#44cc44', '#aaffaa', isSDM);
    vfx.spawnScorchMark(hitX, hitY, '#002200');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#44cc44', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 12, 12, ctx.attackDirectionBias);
    return true;
  }
  // HSDM Heidern Execution — ultimate command grab
  if (atkName === 'HSDM_HEIDERN_EXECUTION') {
    vfx.spawnSuperBurst(hitX, hitY, '#44cc44', '#ffffff', true);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#001100');
    screenFlash.triggerDarken(10);
    screenFlash.trigger('#44cc44', 0.5, 16);
    screenShake.trigger(20, 16, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function heidernSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const HEIDERN_HIT_EFFECTS = {
  charId: 'heidern',
  prefixes: ['HEIDERN_', 'DM_HEIDERN_', 'SDM_HEIDERN_', 'HSDM_HEIDERN_'],
  onHitVFX: heidernVFX,
  onHitSFX: heidernSFX,
};
