/**
 * Ryo Hit Effects — Character-specific VFX/SFX extracted from hitCallback
 *
 * All Ryo-specific hit feedback lives here.
 * Registered via CharacterHitEffects plugin system.
 */

import { playKoouken, playKoHou, playHien, playHaou, playHioHacker, playZanretsuKen, playHit, playHeavyHit, playSpecialLight } from '../../../../audio/sampler.js';
import type { HitEffectContext } from '../../../characterHitEffects.js';

// ===== VFX =====

function ryoVFX(ctx: HitEffectContext): boolean {
  const { vfx, cinematic, screenShake, screenFlash, attacker, defender, attackType, hitX, hitY, counterHit, combo, attackDirectionBias } = ctx;
  const atkName = attackType as string;
  let handled = false;

  // Ko'ou Ken (虎煌拳) projectile — ki blast effect
  if (atkName.startsWith('RYO_KOOU')) {
    vfx.spawnKooukenVFX(attacker.x, attacker.y, attacker.facing, attacker.charId);
    handled = true;
  }
  // Ko Hou (虎咲) uppercut — flame column (A version)
  if (atkName === 'RYO_KO_HOU') {
    vfx.spawnKoHouVFX(attacker.x, attacker.y, attacker.charId);
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(7, 8, attacker.facing * 5);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    handled = true;
  }
  // Ko Hou C (虎咲C) — doubled intensity flame column
  if (atkName === 'RYO_KO_HOU_C') {
    vfx.spawnKoHouCVFX(attacker.x, attacker.y, attacker.charId);
    cinematic.addHitStop(3, ctx.defIdx);
    screenShake.trigger(10, 10, attacker.facing * 6);
    vfx.spawnImpactRing(hitX, hitY, 1.3);
    screenFlash.trigger('#ffaa33', 0.12, 4);
    handled = true;
  }
  // Hien (飛燕) flying kick — speed line trail + landing dust
  if (atkName === 'RYO_HIEN') {
    vfx.spawnHienTrail(attacker.x, attacker.y, attacker.facing, attacker.charId);
    vfx.spawnHienLandingDust(hitX, hitY + 20);
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(9, 8, attacker.facing * 5);
    vfx.spawnImpactRing(hitX, hitY, 1.1);
    handled = true;
  }
  // RYO_KOOUKEN_D (强虎煌拳D版) — knockdown version
  if (atkName === 'RYO_KOOUKEN_D') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(9, 9, attacker.facing * 5);
    vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#88ccff');
    handled = true;
  }
  // RYO_KOOU_C (虎煌拳C版) — strong projectile burst
  if (atkName === 'RYO_KOOU_C') {
    vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#66aaff');
    vfx.spawnImpactRing(hitX, hitY, 0.7);
    cinematic.addHitStop(1, ctx.defIdx);
    handled = true;
  }
  // RYO_HIO_HACKER (氷果斬) — rush strike
  if (atkName === 'RYO_HIO_HACKER') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(6, 6, attacker.facing * 3);
    vfx.spawnImpactRing(hitX, hitY, 0.8);
    handled = true;
  }
  // RYO_TSURIZAO (釣瓶打) — overhead slam
  if (atkName === 'RYO_TSURIZAO') {
    cinematic.addHitStop(2, ctx.defIdx);
    screenShake.trigger(8, 8, attacker.facing * 4);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    handled = true;
  }
  // RYO_ORISHI (卸し) — low sweep
  if (atkName === 'RYO_ORISHI') {
    cinematic.addHitStop(1, ctx.defIdx);
    screenShake.trigger(5, 6, attacker.facing * 2);
    vfx.spawnHeavyDust(hitX, hitY + 30, 8);
    handled = true;
  }
  // RYO_ZANRETSU_KEN (斩裂拳) — multi-hit progressive escalation
  if (atkName === 'RYO_ZANRETSU_KEN') {
    const comboScale = 0.6 + Math.min(combo, 5) * 0.15;
    vfx.spawnImpactRing(hitX, hitY, comboScale);
    if (combo < 2) {
      // Early hits: quick sparks only
      cinematic.addHitStop(1, ctx.defIdx);
    } else if (combo < 4) {
      // Mid chain: add blue energy burst
      cinematic.addHitStop(1, ctx.defIdx);
      screenShake.trigger(4 + combo, 5, attacker.facing * 2);
      vfx.spawnProjectileExplosion(hitX, hitY, '#4488ff', '#88ccff');
    } else {
      // Late chain: flash + strong burst + shake escalation
      cinematic.addHitStop(2, ctx.defIdx);
      screenShake.trigger(6 + combo, 7, attacker.facing * 3);
      vfx.spawnProjectileExplosion(hitX, hitY, '#2266dd', '#aaddff');
      screenFlash.trigger('#4488ff', 0.08 + Math.min(combo, 6) * 0.02, 3);
    }
    handled = true;
  }
  // DM Ten Ha Ou (天地霸煌拳)
  if (atkName === 'DM_TEN_HA_OU') {
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    screenFlash.triggerDarken(6);
    screenFlash.trigger('#ffcc00', 0.35, 10);
    screenShake.trigger(14, 14, attackDirectionBias);
    handled = true;
  }
  // SDM Ten Ha Ou
  if (atkName === 'SDM_TEN_HA_OU') {
    vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
    vfx.spawnGroundSlam(hitX, hitY);
    vfx.spawnSuperBurst(hitX, hitY, '#4488ff', '#88ccff', true);
    screenFlash.triggerDarken(8);
    screenFlash.trigger('#ffdd44', 0.45, 14);
    screenShake.trigger(16, 16, attackDirectionBias);
    handled = true;
  }
  // DM/SDM/HSDM Ryuko Ranbu
  if (atkName === 'DM_RYUKO_RANBU' || atkName === 'SDM_RYUKO_RANBU' || atkName === 'HSDM_RYUKO_RANBU') {
    const isHSDM = atkName === 'HSDM_RYUKO_RANBU';
    const isSDM = atkName === 'SDM_RYUKO_RANBU';
    vfx.spawnImpactRing(hitX, hitY, isHSDM ? 1.8 : isSDM ? 1.5 : 1.2);
    screenFlash.trigger(isHSDM ? '#ffaa22' : '#ffcc00', isHSDM ? 0.5 : 0.3, isHSDM ? 16 : 10);
    screenShake.trigger(isHSDM ? 18 : isSDM ? 16 : 14, isHSDM ? 18 : isSDM ? 16 : 14, attackDirectionBias);
    handled = true;
  }
  // Haou Shou Kou Ken (霸王翔吼拳)
  if (atkName === 'RYO_HAOU') {
    vfx.spawnHaouFlash(attacker.x, attacker.y, attacker.charId);
    cinematic.addHitStop(2, ctx.defIdx);
    vfx.spawnImpactRing(hitX, hitY, 1.0);
    screenShake.trigger(8, 10, attacker.facing * 4);
    handled = true;
  }

  return handled;
}

// ===== SFX =====

function ryoSFX(ctx: HitEffectContext): boolean {
  const atkName = ctx.attackType as string;
  const combo = ctx.combo;

  if (atkName === 'RYO_KOOU' || atkName === 'RYO_KOOU_C' || atkName === 'RYO_KOOUKEN_D') {
    playKoouken(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_KO_HOU' || atkName === 'RYO_KO_HOU_C') {
    playKoHou(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_HIEN') {
    playHien(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_HAOU') {
    playHaou(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_HIO_HACKER') {
    playHioHacker(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_ZANRETSU_KEN') {
    playZanretsuKen(); if (combo > 0) playHit(0.4, combo);
    return true;
  }
  if (atkName === 'RYO_TSURIZAO') {
    playHeavyHit(); if (combo > 0) playHit(0.5, combo);
    return true;
  }
  if (atkName === 'RYO_ORISHI') {
    playSpecialLight(); if (combo > 0) playHit(0.5, combo);
    return true;
  }

  return false;
}

// ===== Plugin Registration =====

import type { CharacterHitEffects } from '../../../characterHitEffects.js';

export const RYO_HIT_EFFECTS: CharacterHitEffects = {
  charId: 'ryo',
  prefixes: ['RYO_', 'DM_TEN_HA', 'SDM_TEN_HA', 'DM_RYUKO', 'SDM_RYUKO', 'HSDM_RYUKO'],
  onHitVFX: ryoVFX,
  onHitSFX: ryoSFX,
};
