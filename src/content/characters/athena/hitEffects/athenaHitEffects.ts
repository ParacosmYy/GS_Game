/**
 * Athena Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function athenaVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Psycho Ball — psychic projectile burst
  if (atkName === 'ATHENA_PSYCHO_BALL' || atkName === 'ATHENA_PSYCHO_BALL_C') {
    const isStrong = atkName === 'ATHENA_PSYCHO_BALL_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff88dd', '#ffaaff');
    screenShake.trigger(isStrong ? 8 : 6, 6, attacker.facing * 4);
    return true;
  }
  // Psycho Sword — psychic rising slash
  if (atkName === 'ATHENA_PSYCHO_SWORD' || atkName === 'ATHENA_PSYCHO_SWORD_C') {
    const isStrong = atkName === 'ATHENA_PSYCHO_SWORD_C';
    cinematic.addHitStop(isStrong ? 2 : 1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, isStrong ? 1.2 : 0.9);
    screenShake.trigger(isStrong ? 8 : 6, 6, attacker.facing * 3);
    return true;
  }
  // Phoenix Arrow — aerial diving kick with psychic trail
  if (atkName === 'ATHENA_PHOENIX_ARROW') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 5);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    return true;
  }
  // Phoenix Reflect — overhead psychic burst
  if (atkName === 'ATHENA_PHOENIX_REFLECT') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff66aa', '#ffaacc');
    screenShake.trigger(5, 4, attacker.facing * 2);
    return true;
  }
  // DM Shining Crystal Bit — massive psychic crystal explosion
  if (atkName === 'DM_SHINING_CRYSTAL_BIT' || atkName === 'SDM_SHINING_CRYSTAL_BIT') {
    const isSDM = atkName === 'SDM_SHINING_CRYSTAL_BIT';
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnSuperBurst(hitX, hitY, '#ff66aa', '#ffaaff', isSDM);
    vfx.spawnScorchMark(hitX, hitY, '#220022');
    screenFlash.triggerDarken(isSDM ? 8 : 6);
    screenFlash.trigger('#ff66aa', isSDM ? 0.4 : 0.25, isSDM ? 14 : 10);
    screenShake.trigger(isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Phoenix Fang Arrow — aerial DM explosion
  if (atkName === 'DM_PHOENIX_FANG_ARROW' || atkName === 'SDM_PHOENIX_FANG_ARROW') {
    const isSDM = atkName === 'SDM_PHOENIX_FANG_ARROW';
    vfx.spawnSuperBurst(hitX, hitY, '#ff66aa', '#ffaaff', true);
    vfx.spawnGroundSlam(hitX, hitY);
    screenShake.trigger(isSDM ? 16 : 12, 12, ctx.attackDirectionBias);
    return true;
  }
  return false;
}

function athenaSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const ATHENA_HIT_EFFECTS = {
  charId: 'athena',
  prefixes: ['ATHENA_', 'DM_SHINING_CRYSTAL', 'SDM_SHINING_CRYSTAL', 'DM_PHOENIX_FANG', 'SDM_PHOENIX_FANG'],
  onHitVFX: athenaVFX,
  onHitSFX: athenaSFX,
};
