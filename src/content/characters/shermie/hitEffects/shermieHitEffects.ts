/**
 * Shermie Hit Effects — Character-specific VFX/SFX for grappling/wrestling style
 *
 * Shermie's fighting style emphasizes close-range command grabs (Spiral, Suplex),
 * spinning kicks (Shoot, Carnival), and multi-hit DMs.
 * Hit effects reflect her purple/silver energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function shermieVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Shermie Shoot — spinning kick impact
  if (atkName === 'SHERMIE_SHOOT' || atkName === 'SHERMIE_SHOOT_C') {
    const isStrong = atkName === 'SHERMIE_SHOOT_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#9933cc', '#cc99ff');
    return true;
  }
  // Shermie Carnival — multi-hit spinning attack
  if (atkName === 'SHERMIE_CARNIVAL') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    return true;
  }
  // Shermie Spiral / Suplex — command grab slam
  if (atkName === 'SHERMIE_SPIRAL' || atkName === 'SHERMIE_SPIRAL_C' || atkName === 'SHERMIE_SUPLEX') {
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(10, 8, attacker.facing * 5);
    vfx.spawnHeavyDust(hitX, hitY, 8);
    return true;
  }
  // Shermie Whip — whip kick sweep
  if (atkName === 'SHERMIE_WHIP' || atkName === 'SHERMIE_WHIP_C') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // Axle Spin Kick — low sweep
  if (atkName === 'SHERMIE_AXLE_SPIN') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // DM Shermie Carnival — multi-hit spinning super
  if (atkName === 'DM_SHERMIE_CARNIVAL' || atkName === 'SDM_SHERMIE_CARNIVAL') {
    const isSDM = atkName === 'SDM_SHERMIE_CARNIVAL';
    vfx.spawnSuperBurst(hitX, hitY, '#9933cc', '#cc99ff', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#220033');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#9933cc', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Shermie Flash — command grab DM
  if (atkName === 'DM_SHERMIE_FLASH' || atkName === 'SDM_SHERMIE_FLASH') {
    const isSDM = atkName === 'SDM_SHERMIE_FLASH';
    cinematic.addHitStop(isSDM ? 5 : 3, ctx.defIdx);
    vfx.spawnSuperBurst(hitX, hitY, '#9933cc', '#ffffff', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 10);
    screenFlash.triggerDarken(isSDM ? 8 : 5);
    screenFlash.trigger('#9933cc', isSDM ? 0.4 : 0.25, isSDM ? 14 : 8);
    screenShake.trigger(isSDM ? 18 : 14, isSDM ? 16 : 12, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function shermieSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const SHERMIE_HIT_EFFECTS = {
  charId: 'shermie',
  prefixes: ['SHERMIE_', 'DM_SHERMIE_', 'SDM_SHERMIE_'],
  onHitVFX: shermieVFX,
  onHitSFX: shermieSFX,
};
