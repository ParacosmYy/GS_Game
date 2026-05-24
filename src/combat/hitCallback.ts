/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType } from '../core/types.js';
import { FRAME_DATA, STAGE_WIDTH, MAX_STOCKS, METER_PER_STOCK } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter, playHeavyHit, playSuperFlash, playWire, playJuggleHit } from '../audio/sfx.js';
import type { CinematicState } from '../state/cinematicState.js';

function classifyAttack(at: AttackType) {
  const s = at as string;
  const isSDM = s.startsWith('SDM_');
  const isDM = s.startsWith('DM_') || isSDM;
  const isSpecial = at === AttackType.SPECIAL_PROJECTILE || at === AttackType.SPECIAL_UPPER
    || s.startsWith('KYO_') || s.startsWith('IORI_') || s.startsWith('TERRY_') || s.startsWith('KIM_')
    || s.startsWith('RYO_') || s.startsWith('LEONA_') || s.startsWith('KDASH_') || s.startsWith('KULA_');
  const isPunch = s.endsWith('_A') || s.endsWith('_C') || s.includes('ARAGAMI') || s.includes('DOKUGAMI')
    || s.includes('ONIYAKI') || s.includes('KOTOTSUKI') || s.includes('KUZUKAZE')
    || s.includes('BURN_KNUCKLE') || s.includes('RISING_TACKLE') || s.includes('POWER_DUNK')
    || s.includes('SANREN') || s.includes('TSUMIYOMI') || s.includes('BATSUYOMI');
  return { isDM, isSDM, isSpecial, isPunch };
}

function calcHitStop(at: AttackType, isDM: boolean, isSpecial: boolean, ch: boolean): number {
  const heavy = at === AttackType.STAND_C || at === AttackType.STAND_D || at === AttackType.CLOSE_C
    || at === AttackType.CLOSE_D || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D;
  // KOF2002: 轻攻击4F, 重攻击8F, 必杀技8F, 超必杀16F, Counter+3F
  const r = isDM ? 16 : isSpecial ? 8 : heavy ? 8 : 4;
  return ch ? r + 3 : r;
}

function calcShake(at: AttackType, ch: boolean, dmg: number): number {
  const s = at as string;
  if (s.startsWith('DM_')) return 14;
  if (s.startsWith('KYO_ONIYAKI') || s.startsWith('IORI_ONIYAKI')
    || s.startsWith('TERRY_POWER_DUNK') || s.startsWith('TERRY_RISING_TACKLE')
    || s.startsWith('KIM_HIENZAN') || s.startsWith('RYO_KO_HOU') || s.startsWith('LEONA_EAR_RING')) return 8;
  if (at === AttackType.SPECIAL_UPPER) return 8;
  if (at === AttackType.THROW || s.includes('KOTOTSUKI') || s.includes('KUZUKAZE')) return 6;
  if (ch) return 7;
  if (at === AttackType.STAND_C || at === AttackType.STAND_D
    || at === AttackType.CLOSE_C || at === AttackType.CLOSE_D
    || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D) return 5;
  if (dmg > 50) return 4;
  return 3;
}

/** 判断是否为重攻击(需要斩击线特效) */
function isHeavyAttack(at: AttackType): boolean {
  return at === AttackType.STAND_C || at === AttackType.STAND_D
    || at === AttackType.CLOSE_C || at === AttackType.CLOSE_D
    || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D
    || at === AttackType.STAND_CD || at === AttackType.JUMP_CD;
}

export interface HitCallbackDeps {
  fighters: [Fighter, Fighter];
  vfx: VFXSystem;
  screenShake: ScreenShake;
  screenFlash: ScreenFlash;
  gauges: [PowerGauge, PowerGauge];
  cinematic: CinematicState;
  combatSystem: CombatSystem;
}

export function createHitCallback(deps: HitCallbackDeps): HitCallback {
  return (attacker: Fighter, defender: Fighter, attackType: AttackType, blocked: boolean, counterHit: boolean): void => {
    const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
    const [p1, p2] = deps.fighters;
    const hitX = (attacker.x + defender.x) / 2;
    const hitY = defender.y - defender.displayHeight / 2;
    const atkIdx = attacker === p1 ? 0 : 1;
    const defIdx = defender === p1 ? 0 : 1;

    if (blocked) {
      // KOF2002: 防御火花按攻击类型着色 — 通常白色, 必杀金色, DM蓝色
      const { isDM: blkDM, isSpecial: blkSpecial } = classifyAttack(attackType);
      const blkColor = blkDM ? '#6688ff' : blkSpecial ? '#ffcc44' : '#ffffff';
      deps.vfx.spawnBlockFlash(hitX, hitY);
      if (blkSpecial) deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, blkColor);
      const blkHeavy = attackType === AttackType.STAND_C || attackType === AttackType.STAND_D
        || attackType === AttackType.CLOSE_C || attackType === AttackType.CLOSE_D
        || attackType === AttackType.CROUCH_C || attackType === AttackType.CROUCH_D;
      const blkStop = blkSpecial ? 5 : blkHeavy ? 5 : 3;
      deps.cinematic.triggerHitStop(blkStop);
      deps.screenShake.trigger(blkSpecial ? 5 : blkHeavy ? 4 : 2, 6);
      gainMeterOnBlock(deps.gauges[atkIdx], attackType);
      gainMeterOnHitstun(deps.gauges[defIdx], attackType);
      playBlock();
      return;
    }

    const { isDM, isSDM, isSpecial } = classifyAttack(attackType);
    const combo = deps.combatSystem.getComboCount(defIdx);
    const baseStop = calcHitStop(attackType, isDM, isSpecial, counterHit);
    // KOF2002: 高连击数额外hitstop (5+hits +1F, 10+hits +2F), 连段越久节奏感越强
    const comboStop = combo >= 10 ? 2 : combo >= 5 ? 1 : 0;
    deps.cinematic.triggerHitStop(baseStop + comboStop);
    gainMeterOnHitstun(deps.gauges[defIdx], attackType);
    // 风云再起特色: 第一次命中奖励 — 每回合首次命中额外+30气槽
    if (!deps.combatSystem.wasFirstHitAwarded(defIdx)) {
      deps.gauges[atkIdx].meter = Math.min(deps.gauges[atkIdx].meter + 30, MAX_STOCKS * METER_PER_STOCK);
    }

    const atkChar = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    const { isPunch } = classifyAttack(attackType);
    // KOF2002: 连击中火花递增 (5+hits +4, 10+hits +8)
    const comboSparkBonus = combo >= 10 ? 8 : combo >= 5 ? 4 : 0;
    // KOF2002: 低血量(25%以下)时火花增强, 终局更紧张
    const lowHpBonus = defender.health < defender.maxHealth * 0.25 ? 4 : 0;
    const sparks = (isSDM ? 28 : isDM ? 20 : isSpecial ? 14 : counterHit ? 12 : 8) + comboSparkBonus + lowHpBonus;
    const sparkColor = isSpecial ? atkChar.specialColor : isPunch ? '#ffdd44' : '#44ddff';
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, sparkColor);
    deps.vfx.spawnImpactRing(hitX, hitY);

    // 重攻击斩击线
    if (isHeavyAttack(attackType) || isSpecial) {
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, sparkColor);
    }

    // DM: 超必杀华丽爆发 + 全屏闪光
    if (isDM) {
      deps.vfx.spawnSuperBurst(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
      // SDM: 金色闪光+双冲击环, DM: 白色闪光
      if (isSDM) {
        deps.screenFlash.trigger('#ffdd44', 0.55, 16);
        deps.vfx.spawnImpactRing(hitX, hitY);
        deps.vfx.spawnImpactRing(hitX, hitY);
      } else {
        deps.screenFlash.trigger('#ffffff', 0.35, 10);
      }
    }

    // 伤害数字
    deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage);

    // Rekka finisher增强
    const isRekkaFinisher = attackType === AttackType.KYO_NANASE
      || attackType === AttackType.KYO_KOTO_TSUKI
      || attackType === AttackType.KYO_YAKISOGI
      || attackType === AttackType.KYO_BATSUYOMI
      || attackType === AttackType.IORI_AOIHANA_3
      || attackType === AttackType.TERRY_POWER_DUNK
      || attackType === AttackType.KIM_HIENZAN
      || attackType === AttackType.RYO_HIEN;
    if (isRekkaFinisher) {
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 16, atkChar.specialGlow);
      deps.screenFlash.trigger(atkChar.specialColor, 0.15, 5);
      deps.screenShake.trigger(8, 10);
    }

    // SFX
    if (isDM) { playSuperFlash(); playDM(); }
    else if (attackType === AttackType.THROW || attackType === AttackType.THROW_FORWARD || attackType === AttackType.THROW_BACK) {
      playThrow();
      // 投技火花+弧线特效
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 10, '#aaddff');
      deps.screenFlash.trigger('#aaddff', 0.12, 4);
      deps.screenShake.trigger(6, 8);
    }
    else if (isSpecial) playSpecial();
    else if (data.damage >= 70) playHeavyHit();
    else if (!defender.isGrounded()) playJuggleHit();
    else playHit(data.damage > 50 ? 1.2 : 1.0);

    // Counter Hit
    if (counterHit) {
      deps.vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55);
      deps.screenFlash.trigger('#ffaa00', 0.12, 4);
      playCounter();
    }
    if (counterHit && (data as { counterWire?: boolean }).counterWire) {
      deps.vfx.spawnWireText(defender.x, defender.y - defender.displayHeight - 55);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 20, '#ff6600');
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.screenFlash.trigger('#ff6600', 0.2, 6);
      deps.screenShake.trigger(10, 10);
      playWire();
    }

    // 飞行道具爆炸
    if (attackType === AttackType.SPECIAL_PROJECTILE) {
      deps.vfx.spawnProjectileExplosion(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
    }

    // KOF2002: 空中命中额外特效 — 飘散粒子+小闪光
    if (!defender.isGrounded() && !isDM) {
      deps.vfx.spawnCharacterHitSparks(hitX, hitY - 15, 6, '#aaddff');
    }

    // CD击飞攻击: 更强的冲击反馈
    if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) {
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 16, '#ffaa00');
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.screenFlash.trigger('#ffcc44', 0.15, 4);
    }

    // 连击数显示
    if (combo >= 2) deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, combo);

    // 震屏时长: 轻攻击5帧, 重攻击8帧, 必杀10帧, DM 14帧
    const shakeDur = isDM ? 14 : isSpecial ? 10 : isHeavyAttack(attackType) ? 8 : 5;
    // KOF2002: 高连击数增强震屏 (5+hits时额外+2强度, 10+hits时+4)
    const comboShake = combo >= 10 ? 4 : combo >= 5 ? 2 : 0;
    deps.screenShake.trigger(calcShake(attackType, counterHit, data.damage) + comboShake, shakeDur);
    deps.cinematic.trackDamage(defIdx, data.damage);

    // KO检测 — 角色倒地时触发震撼效果
    if (defender.health <= 0 && !defender.isGrounded()) {
      // 延迟到落地时触发groundslam（在main.ts的KO逻辑中处理）
    }
  };
}

/** KO落地特效触发 — 从main.ts调用 */
export function triggerKOGroundEffect(deps: { vfx: VFXSystem; screenFlash: ScreenFlash; screenShake: ScreenShake }, defender: Fighter): void {
  deps.vfx.spawnGroundSlam(defender.x, defender.y);
  deps.screenFlash.trigger('#ff2200', 0.3, 12);
  deps.screenShake.trigger(16, 15);
}
