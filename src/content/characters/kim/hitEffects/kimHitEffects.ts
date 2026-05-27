/**
 * Kim Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function kimVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Hienzan (飛燕斬) — flash kick uppercut
  if (atkName === 'KIM_HIENZAN') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 4);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    return true;
  }
  // Hishou (飛翔脚) — flying kick
  if (atkName === 'KIM_HISHOU') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 5, attacker.facing * 3);
    return true;
  }
  // Hangetsu (半月斬) — crescent kick
  if (atkName === 'KIM_HANGETSU') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 7, attacker.facing * 4);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    return true;
  }
  // Haki (蹴り払い) — axe kick slam
  if (atkName === 'KIM_HAKI') {
    vfx.spawnHeavyDust(hitX, hitY, 4);
    screenShake.trigger(5, 5, attacker.facing * 3);
    return true;
  }
  // Sanren (三連撃) — triple kick combo
  if (atkName === 'KIM_SANREN') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    return true;
  }
  // SDM Phoenix Kick — soaring fire kick
  if (atkName === 'SDM_PHOENIX_KICK') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ffcc44', true);
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#ff6600', 0.3, 10);
    screenShake.trigger(14, 14, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function kimSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const KIM_HIT_EFFECTS = {
  charId: 'kim',
  prefixes: ['KIM_', 'SDM_PHOENIX'],
  onHitVFX: kimVFX,
  onHitSFX: kimSFX,
};
