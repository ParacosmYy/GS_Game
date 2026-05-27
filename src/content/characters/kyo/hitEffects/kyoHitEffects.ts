/**
 * Kyo Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 *
 * All Kyo-specific hit feedback lives here.
 * Registered via CharacterHitEffects plugin system.
 */

import { playKyoOniyaki, playKyoYamibarai, playKyoAragami, playKyoDokugami, playKyo75Kai, playKyoRedKick, playHit } from '../../../../audio/sampler.js';
import type { HitEffectContext, CharacterHitEffects } from '../../../characterHitEffects.js';

// ===== VFX =====

function kyoVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, attackType, hitX, hitY, attackDirectionBias } = ctx;
  const atkName = attackType as string;
  let handled = false;

  // Oniyaki (鬼焼き) uppercut — fire column burst
  if (atkName === 'KYO_ONIYAKI' || atkName === 'KYO_ONIYAKI_C') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ffaa22', atkName === 'KYO_ONIYAKI_C');
    cinematic.addHitStop(atkName === 'KYO_ONIYAKI_C' ? 3 : 2, ctx.defIdx);
    screenShake.trigger(atkName === 'KYO_ONIYAKI_C' ? 10 : 7, 8, attacker.facing * 5);
    vfx.spawnImpactRing(hitX, hitY, atkName === 'KYO_ONIYAKI_C' ? 1.4 : 1.1);
    handled = true;
  }
  // Yamibarai (闇払い) fire projectile — flame burst on hit
  if (atkName === 'KYO_YAMIBARAI') {
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6622', '#ffcc44');
    screenFlash.trigger('#ff6600', 0.08, 3);
    handled = true;
  }
  // Yamibarai C (strong)
  if (atkName === 'KYO_YAMIBARAI_C') {
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4400', '#ffee66');
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    cinematic.addHitStop(1, ctx.defIdx);
    screenFlash.trigger('#ff4400', 0.12, 4);
    handled = true;
  }
  // Aragami (荒咬み) — fire punch impact
  if (atkName === 'KYO_ARAGAMI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    handled = true;
  }
  // Aragami followups — Konokizu, Yanosabi, Nanase, Koto Tsuki, Yakisogi
  if (atkName === 'KYO_ARAGAMI_KONOKIZU' || atkName === 'KYO_ARAGAMI_YANOSABI') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6622', '#ffaa44');
    handled = true;
  }
  if (atkName === 'KYO_NANASE') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 5, attacker.facing * 3);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6622', '#ff8822');
    handled = true;
  }
  if (atkName === 'KYO_KOTO_TSUKI' || atkName === 'KYO_YAKISOGI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 0.9);
    handled = true;
  }
  // Dokugami (毒咬み) — flame followup
  if (atkName === 'KYO_DOKUGAMI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 4);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6622', '#ffaa44');
    handled = true;
  }
  // Dokugami followups — Tsumiyomi, Batsuyomi
  if (atkName === 'KYO_TSUMIYOMI') {
    cinematic.addHitStop(1, ctx.defIdx);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff5500', '#ff9933');
    handled = true;
  }
  if (atkName === 'KYO_BATSUYOMI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 6, attacker.facing * 4);
    vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ffaa22', false);
    handled = true;
  }
  // Red Kick
  if (atkName === 'KYO_RED_KICK') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(7, 7, attacker.facing * 4);
    vfx.spawnHeavyDust(hitX, hitY + 20, 6);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff4400', '#ff8822');
    handled = true;
  }
  // 75-Shiki Kai — rapid rekka
  if (atkName === 'KYO_75KAI' || atkName === 'KYO_75KAI_2') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 6, attacker.facing * 3);
    vfx.spawnProjectileExplosion(hitX, hitY, '#ff6622', '#ffaa44');
    handled = true;
  }
  // DM Orochinagi (大蛇薙)
  if (atkName === 'DM_OROCHINAGI') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ffdd44', true);
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#ff6600', 0.35, 10);
    screenShake.trigger(14, 14, attackDirectionBias);
    handled = true;
  }
  // SDM Orochinagi
  if (atkName === 'SDM_OROCHINAGI') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff2200', '#ffee44', true);
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    screenFlash.triggerDarken(8);
    screenFlash.trigger('#ff4400', 0.45, 14);
    screenShake.trigger(18, 16, attackDirectionBias);
    handled = true;
  }
  // HSDM Orochinagi — hidden ultimate, maximum fire drama
  if (atkName === 'HSDM_OROCHINAGI') {
    vfx.spawnSuperBurst(hitX, hitY, '#ff1100', '#ffff66', true);
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnScreenCracks(hitX, hitY);
    screenFlash.triggerDarken(10);
    screenFlash.trigger('#ff3300', 0.55, 16);
    screenShake.trigger(22, 18, attackDirectionBias);
    handled = true;
  }

  return handled;
}

// ===== SFX =====

function kyoSFX(ctx: HitEffectContext): boolean {
  const atkName = ctx.attackType as string;
  const combo = ctx.combo;

  if (atkName === 'KYO_ONIYAKI' || atkName === 'KYO_ONIYAKI_C') {
    playKyoOniyaki(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'KYO_YAMIBARAI' || atkName === 'KYO_YAMIBARAI_C') {
    playKyoYamibarai(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'KYO_RED_KICK') {
    playKyoRedKick(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'KYO_75KAI') {
    playKyo75Kai(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'KYO_ARAGAMI' || atkName === 'KYO_ARAGAMI_KONOKIZU' || atkName === 'KYO_ARAGAMI_YANOSABI'
    || atkName === 'KYO_NANASE' || atkName === 'KYO_KOTO_TSUKI' || atkName === 'KYO_YAKISOGI') {
    playKyoAragami(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'KYO_DOKUGAMI' || atkName === 'KYO_TSUMIYOMI' || atkName === 'KYO_BATSUYOMI') {
    playKyoDokugami(); if (combo > 0) playHit(0.5, combo);
    return true;
  }

  return false;
}

// ===== Plugin =====

export const KYO_HIT_EFFECTS: CharacterHitEffects = {
  charId: 'kyo',
  prefixes: ['KYO_', 'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI'],
  onHitVFX: kyoVFX,
  onHitSFX: kyoSFX,
};
