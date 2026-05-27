/**
 * Iori Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 *
 * All Iori-specific hit feedback lives here.
 * Registered via CharacterHitEffects plugin system.
 */

import { playIoriAoihana, playIoriYamibarai, playIoriOniyaki, playIoriKototsuki, playIoriKuzukaze, playHit } from '../../../../audio/sampler.js';
import type { HitEffectContext, CharacterHitEffects } from '../../../characterHitEffects.js';

// ===== VFX =====

function ioriVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY, attackDirectionBias } = ctx;
  const atkName = attackType as string;
  let handled = false;

  // Command Normals — purple accent, consistent with Iori element
  if (atkName === 'IORI_YUMEYUMI') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    vfx.spawnProjectileExplosion(hitX, hitY, '#6622aa', '#9944cc');
    handled = true;
  }
  if (atkName === 'IORI_KATANUGI') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    vfx.spawnProjectileExplosion(hitX, hitY, '#5500aa', '#8833cc');
    handled = true;
  }
  if (atkName === 'IORI_YUKIWARUI') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 0.7);
    handled = true;
  }
  // Oniyaki (鬼焼き) dark uppercut — purple burst
  if (atkName === 'IORI_ONIYAKI' || atkName === 'IORI_ONIYAKI_C') {
    const isHeavy = atkName === 'IORI_ONIYAKI_C';
    vfx.spawnSuperBurst(hitX, hitY, '#8800aa', '#cc44ff', isHeavy);
    vfx.spawnIoriOniyakiVFX(hitX, hitY, attacker.facing, isHeavy);
    cinematic.addHitStop(isHeavy ? 3 : 2, ctx.defIdx);
    screenShake.trigger(isHeavy ? 10 : 7, 8, attacker.facing * 5);
    vfx.spawnImpactRing(hitX, hitY, isHeavy ? 1.4 : 1.1);
    handled = true;
  }
  // Yamibarai (闇払い) dark projectile
  if (atkName === 'IORI_YAMIBARAI') {
    vfx.spawnProjectileExplosion(hitX, hitY, '#7722aa', '#bb55ff');
    vfx.spawnIoriYamibaraiVFX(hitX, hitY, attacker.facing);
    screenFlash.trigger('#7722aa', 0.08, 3);
    handled = true;
  }
  // Yamibarai C (strong)
  if (atkName === 'IORI_YAMIBARAI_C') {
    vfx.spawnProjectileExplosion(hitX, hitY, '#6611aa', '#cc66ff');
    vfx.spawnIoriYamibaraiVFX(hitX, hitY, attacker.facing);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    cinematic.addHitStop(1, ctx.defIdx);
    screenFlash.trigger('#6611aa', 0.12, 4);
    handled = true;
  }
  // Aoihana (葵花) rekka chain — escalating per hit
  if (atkName === 'IORI_AOIHANA' || atkName === 'IORI_AOIHANA_C') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 0.7);
    vfx.spawnIoriAoihanaTrail(hitX, hitY, attacker.facing, 0);
    handled = true;
  }
  if (atkName === 'IORI_AOIHANA_2' || atkName === 'IORI_AOIHANA_C_2') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    vfx.spawnIoriAoihanaTrail(hitX, hitY, attacker.facing, 1);
    handled = true;
  }
  // Aoihana finisher
  if (atkName === 'IORI_AOIHANA_3' || atkName === 'IORI_AOIHANA_C_3') {
    vfx.spawnSuperBurst(hitX, hitY, '#660088', '#aa33dd', false);
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(9, 8, attacker.facing * 5);
    screenFlash.trigger('#8822cc', 0.1, 4);
    vfx.spawnIoriAoihanaTrail(hitX, hitY, attacker.facing, 2);
    handled = true;
  }
  // Kototsuki (琴月) — dark rush with trailing claw wisps
  if (atkName === 'IORI_KOTOTSUKI' || atkName === 'IORI_KOTOTSUKI_D') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(8, 8, attacker.facing * 4);
    vfx.spawnImpactRing(hitX, hitY, 1.2);
    vfx.spawnProjectileExplosion(hitX, hitY, '#6600aa', '#aa44ff');
    vfx.spawnIoriAoihanaTrail(hitX, hitY, attacker.facing, 2);
    handled = true;
  }
  // Kuzukaze (屑風) — command grab dark vortex
  if (atkName === 'IORI_KUZUKAZE') {
    cinematic.addHitStop(3, ctx.defIdx);
    screenShake.trigger(10, 10, attacker.facing * 5);
    vfx.spawnIoriKuzukazeVFX(hitX, hitY, attacker.facing);
    screenFlash.trigger('#6622aa', 0.15, 5);
    handled = true;
  }
  // DM Yatagarasu (八咫烏)
  if (atkName === 'DM_YATAGARASU') {
    vfx.spawnSuperBurst(hitX, hitY, '#440066', '#8822cc', true);
    vfx.spawnIoriYatagarasuVFX(hitX, hitY, attacker.facing);
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#6622aa', 0.35, 10);
    screenShake.trigger(14, 14, attackDirectionBias);
    handled = true;
  }
  // SDM Yatagarasu
  if (atkName === 'SDM_YATAGARASU') {
    vfx.spawnSuperBurst(hitX, hitY, '#330055', '#aa33ee', true);
    vfx.spawnIoriYatagarasuVFX(hitX, hitY, attacker.facing);
    vfx.spawnGroundSlam(hitX, hitY);
    screenFlash.triggerDarken(8);
    screenFlash.trigger('#5500aa', 0.45, 14);
    screenShake.trigger(18, 16, attackDirectionBias);
    handled = true;
  }
  // HSDM Yaotome — hidden ultimate, maximum drama
  if (atkName === 'HSDM_YAOTOME') {
    vfx.spawnSuperBurst(hitX, hitY, '#220044', '#cc44ff', true);
    vfx.spawnIoriYatagarasuVFX(hitX, hitY, attacker.facing);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScreenCracks(hitX, hitY);
    screenFlash.triggerDarken(10);
    screenFlash.trigger('#7700cc', 0.55, 16);
    screenShake.trigger(22, 18, attackDirectionBias);
    handled = true;
  }

  return handled;
}

// ===== SFX =====

function ioriSFX(ctx: HitEffectContext): boolean {
  const atkName = ctx.attackType as string;
  const combo = ctx.combo;

  if (atkName === 'IORI_AOIHANA' || atkName === 'IORI_AOIHANA_2' || atkName === 'IORI_AOIHANA_3'
    || atkName === 'IORI_AOIHANA_C' || atkName === 'IORI_AOIHANA_C_2' || atkName === 'IORI_AOIHANA_C_3') {
    playIoriAoihana(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'IORI_ONIYAKI' || atkName === 'IORI_ONIYAKI_C') {
    playIoriOniyaki(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'IORI_YAMIBARAI' || atkName === 'IORI_YAMIBARAI_C') {
    playIoriYamibarai(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'IORI_KOTOTSUKI' || atkName === 'IORI_KOTOTSUKI_D') {
    playIoriKototsuki(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'IORI_KUZUKAZE') {
    playIoriKuzukaze(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'IORI_YUMEYUMI' || atkName === 'IORI_KATANUGI' || atkName === 'IORI_YUKIWARUI') {
    playHit(0.6, combo); return true;
  }

  return false;
}

// ===== Plugin =====

export const IORI_HIT_EFFECTS: CharacterHitEffects = {
  charId: 'iori',
  prefixes: ['IORI_', 'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME'],
  onHitVFX: ioriVFX,
  onHitSFX: ioriSFX,
};
