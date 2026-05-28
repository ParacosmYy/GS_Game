/**
 * Benimaru Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 *
 * Lightning/electric theme for all special moves.
 */
import type { HitEffectContext } from '../../../characterHitEffects.js';

function benimaruVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY } = ctx;
  const atkName = attackType as string;

  // Raijinken — lightning anti-air punch
  if (atkName === 'BENIMARU_RAIJINKEN' || atkName === 'BENIMARU_RAIJINKEN_C') {
    const isC = atkName === 'BENIMARU_RAIJINKEN_C';
    cinematic.addHitStop(isC ? 2 : 1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#88ccff');
    screenShake.trigger(isC ? 9 : 7, 7, attacker.facing * 4);
    screenFlash.trigger('#4488ff', 0.15, 4);
    return true;
  }
  // Iai Geri — lightning kick
  if (atkName === 'BENIMARU_IAI_GERI' || atkName === 'BENIMARU_IAI_GERI_D') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    screenShake.trigger(7, 6, attacker.facing * 4);
    return true;
  }
  // Handou Sandan Geri — 3-stage kick follow-up
  if (atkName === 'BENIMARU_HANDOU_SANDAN_GERI') {
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#aaddff');
    vfx.spawnHeavyDust(hitX, hitY, 6);
    screenShake.trigger(9, 8, attacker.facing * 5);
    return true;
  }
  // Shinkuu Katategoma — vacuum palm spin
  if (atkName === 'BENIMARU_SHINKUU_KATATEGOMA' || atkName === 'BENIMARU_SHINKUU_KATATEGOMA_C') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 1.2);
    screenShake.trigger(8, 7, attacker.facing * 4);
    return true;
  }
  // Benimaru Collider — command grab
  if (atkName === 'BENIMARU_COLLIDER') {
    cinematic.addHitStop(3, ctx.defIdx);
    vfx.spawnSuperBurst(hitX, hitY, '#4488ff', '#88ccff', false);
    screenShake.trigger(12, 10, attacker.facing * 6);
    screenFlash.trigger('#4488ff', 0.2, 6);
    return true;
  }
  // Super Inazuma Kick — rising lightning kick
  if (atkName === 'BENIMARU_SUPER_INAZUMA_KICK' || atkName === 'BENIMARU_SUPER_INAZUMA_KICK_D') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#88ccff');
    screenShake.trigger(7, 6, attacker.facing * 3);
    return true;
  }
  // Jackknife Kick — overhead
  if (atkName === 'BENIMARU_JACKKNIFE_KICK') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnHeavyDust(hitX, hitY, 4);
    return true;
  }
  // Flying Drill — air multi-hit
  if (atkName === 'BENIMARU_FLYING_DRILL') {
    screenShake.trigger(4, 4, attacker.facing * 2);
    return true;
  }
  // DM Raikouken — massive lightning fist
  if (atkName === 'DM_RAIKOUKEN' || atkName === 'SDM_RAIKOUKEN' || atkName === 'HSDM_RAIKOUKEN') {
    const isSDM = atkName.startsWith('SDM');
    const isHSDM = atkName.startsWith('HSDM');
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnSuperBurst(hitX, hitY, '#4488ff', '#aaddff', isSDM || isHSDM);
    vfx.spawnScorchMark(hitX, hitY, '#112244');
    screenFlash.triggerDarken(isHSDM ? 10 : isSDM ? 8 : 6);
    screenFlash.trigger('#4488ff', isHSDM ? 0.4 : isSDM ? 0.35 : 0.25, isHSDM ? 14 : isSDM ? 12 : 8);
    screenShake.trigger(isHSDM ? 18 : isSDM ? 16 : 14, 14, ctx.attackDirectionBias);
    return true;
  }
  // DM Genei Hurricane — phantom hurricane
  if (atkName === 'DM_GENEI_HURRICANE') {
    vfx.spawnSuperBurst(hitX, hitY, '#4488ff', '#88ccff', true);
    vfx.spawnImpactRing(hitX, hitY, 1.5);
    screenShake.trigger(14, 14, ctx.attackDirectionBias);
    screenFlash.trigger('#4488ff', 0.25, 8);
    return true;
  }
  return false;
}

function benimaruSFX(_ctx: HitEffectContext): boolean {
  return false;
}

export const BENIMARU_HIT_EFFECTS = {
  charId: 'benimaru',
  prefixes: ['BENIMARU_', 'DM_RAIKOUKEN', 'SDM_RAIKOUKEN', 'HSDM_RAIKOUKEN', 'DM_GENEI'],
  onHitVFX: benimaruVFX,
  onHitSFX: benimaruSFX,
};
