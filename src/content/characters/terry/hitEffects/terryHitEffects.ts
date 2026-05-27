/**
 * Terry Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function terryVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Burn Knuckle — energy fist burst
  if (atkName === 'TERRY_BURN_KNUCKLE') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 4);
    vfx.spawnProjectileExplosion(hitX, hitY, '#44aaff', '#88ddff');
    return true;
  }
  // Power Wave — ground energy burst
  if (atkName === 'TERRY_POWER_WAVE') {
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ffcc22', '#ffee66');
    screenShake.trigger(8, 8, attacker.facing * 4);
    return true;
  }
  // Power Dunk — slam impact
  if (atkName === 'TERRY_POWER_DUNK') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(10, 8, attacker.facing * 5);
    return true;
  }
  // Crack Shot — sweep kick with heavy dust
  if (atkName === 'TERRY_CRACK_SHOT') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 6);
    return true;
  }
  // Rising Tackle — upward hit
  if (atkName === 'TERRY_RISING_TACKLE') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    return true;
  }
  // DM/SDM Power Geyser — massive ground energy eruption
  if (atkName === 'DM_POWER_GEYSER' || atkName === 'SDM_POWER_GEYSER') {
    const isSDM = atkName === 'SDM_POWER_GEYSER';
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnSuperBurst(hitX, hitY, '#ffaa00', '#ffee44', isSDM);
    vfx.spawnScorchMark(hitX, hitY, '#331100');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#ffaa00', isSDM ? 0.35 : 0.25, isSDM ? 12 : 8);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // High Angle Geyser DM
  if (atkName === 'DM_HIGH_ANGLE_GEYSER' || atkName === 'SDM_HIGH_ANGLE_GEYSER') {
    vfx.spawnSuperBurst(hitX, hitY, '#ffaa00', '#ffee44', true);
    screenShake.trigger(14, 14, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function terrySFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const TERRY_HIT_EFFECTS = {
  charId: 'terry',
  prefixes: ['TERRY_', 'DM_POWER_GEYSER', 'SDM_POWER_GEYSER', 'DM_HIGH_ANGLE', 'SDM_HIGH_ANGLE'],
  onHitVFX: terryVFX,
  onHitSFX: terrySFX,
};
