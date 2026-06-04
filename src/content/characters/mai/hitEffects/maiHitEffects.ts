/**
 * Mai Hit Effects — Character-specific VFX/SFX for kunoichi/flame style
 *
 * Mai's fighting style emphasizes fan projectiles (Kachousen), flame attacks
 * (Ryuuenbu, Ryuenjin), and acrobatic kunoichi moves.
 * Hit effects reflect her pink/flame red energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function maiVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Kachousen — fan projectile impact
  if (atkName === 'MAI_KA_CHO_SEN' || atkName === 'MAI_KA_CHO_SEN_C') {
    const isStrong = atkName === 'MAI_KA_CHO_SEN_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    screenShake.trigger(isStrong ? 8 : 6, isStrong ? 7 : 5, attacker.facing * (isStrong ? 5 : 3));
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4488', '#ff88aa');
    return true;
  }
  // Ryuuenbu — flame fan swipe
  if (atkName === 'MAI_RYU_EN_BU') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(8, 7, attacker.facing * 4);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6644', '#ffaa66');
    vfx.spawnScorchMark(hitX, hitY, '#440000');
    return true;
  }
  // Hishou Ryuenjin — flame uppercut
  if (atkName === 'MAI_HISHO_RYU_EN_JIN') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(10, 8, attacker.facing * 5);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff2266', '#ffaa66');
    return true;
  }
  // Hissatsu Shinobibachi — command normal overhead
  if (atkName === 'MAI_HISSATSU_SHINOBIBACHI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // Yusura Uma — command normal low
  if (atkName === 'MAI_YUSURA_UMA') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // DM Haka Otoshi — super fan dance
  if (atkName === 'DM_HAKA_OTOSHI') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff4488', '#ff88aa', false);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#330011');
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#ff4488', 0.25, 8);
    screenShake.trigger(14, 14, ctx.attackDirectionBias);
    return true;
  }
  // SDM Haka Otoshi — MAX super fan dance
  if (atkName === 'SDM_HAKA_OTOSHI') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff4488', '#ff88aa', true);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#440022');
    screenFlash.triggerDarken(8);
    screenFlash.trigger('#ff4488', 0.35, 12);
    screenShake.trigger(16, 14, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function maiSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const MAI_HIT_EFFECTS = {
  charId: 'mai',
  prefixes: ['MAI_', 'DM_HAKA_', 'SDM_HAKA_'],
  onHitVFX: maiVFX,
  onHitSFX: maiSFX,
};
