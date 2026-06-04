/**
 * Clark Hit Effects — Character-specific VFX/SFX for grappler/wrestling style
 *
 * Clark's fighting style emphasizes close-range command grabs (Argentine Backbreaker,
 * Mount Tackle), anti-air grabs (Napalm Stretch), and multi-hit attacks (Vulcan Punch).
 * Hit effects reflect his military green energy theme.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function clarkVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Super Argentine Backbreaker — command grab slam
  if (atkName === 'CLARK_ARGENTINE' || atkName === 'CLARK_ARGENTINE_C') {
    const isStrong = atkName === 'CLARK_ARGENTINE_C';
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(isStrong ? 10 : 8, isStrong ? 8 : 6, attacker.facing * 5);
    vfx.spawnHeavyDust(hitX, hitY, isStrong ? 8 : 6);
    return true;
  }
  // Napalm Stretch — anti-air grab
  if (atkName === 'CLARK_NAPALM') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#448844', '#66aa66');
    screenShake.trigger(8, 6, attacker.facing * 4);
    return true;
  }
  // Flash Elbow — follow-up elbow strike
  if (atkName === 'CLARK_FLASH_ELBOW') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    return true;
  }
  // Mount Tackle — command grab tackle
  if (atkName === 'CLARK_MOUNT_TACKLE') {
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(10, 8, attacker.facing * 5);
    vfx.spawnHeavyDust(hitX, hitY, 8);
    return true;
  }
  // Vulcan Punch — multi-hit
  if (atkName === 'CLARK_VULCAN') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    return true;
  }
  // Death Lake Drive — overhead
  if (atkName === 'CLARK_DEATH_LAKE') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    return true;
  }
  // Stomp — low stomp
  if (atkName === 'CLARK_STOMP') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // DM Super Argentine Backbreaker — command grab DM
  if (atkName === 'DM_ARGENTINE_DM' || atkName === 'SDM_ARGENTINE_DM') {
    const isSDM = atkName === 'SDM_ARGENTINE_DM';
    vfx.spawnSuperBurst(hitX, hitY, '#448844', '#66aa66', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScorchMark(hitX, hitY, '#223322');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#448844', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 18 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Rolling Cradle — spinning grab DM
  if (atkName === 'DM_ROLLING_CRADLE' || atkName === 'SDM_ROLLING_CRADLE') {
    const isSDM = atkName === 'SDM_ROLLING_CRADLE';
    cinematic.addHitStop(isSDM ? 5 : 3, ctx.defIdx);
    vfx.spawnSuperBurst(hitX, hitY, '#448844', '#ffffff', isSDM);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnHeavyDust(hitX, hitY, 10);
    screenFlash.triggerDarken(isSDM ? 8 : 5);
    screenFlash.trigger('#448844', isSDM ? 0.4 : 0.25, isSDM ? 14 : 8);
    screenShake.trigger(isSDM ? 18 : 14, isSDM ? 16 : 12, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function clarkSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const CLARK_HIT_EFFECTS = {
  charId: 'clark',
  prefixes: ['CLARK_', 'DM_', 'SDM_'],
  onHitVFX: clarkVFX,
  onHitSFX: clarkSFX,
};
