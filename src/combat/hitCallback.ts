/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType, FighterState } from '../core/types.js';
import { FRAME_DATA, STAGE_WIDTH, MAX_STOCKS, METER_PER_STOCK } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter, playHeavyHit, playSuperFlash, playWire, playJuggleHit } from '../audio/sampler.js';
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
  // KOF2002正版: 轻攻击8F, 重攻击12F, 必杀技12F, 超必杀22F, Counter+4F
  // 参考: MUGEN标准轻10/中12/重14, SF系列统一14F, SNK以更长的hitstop著称
  const r = isDM ? 22 : isSpecial ? 12 : heavy ? 12 : 8;
  return ch ? r + 4 : r;
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
    const atkName = attackType as string;
    // KOF2002: 近距离攻击火花偏向防守方, 远距离/投射偏向中间
    const isClose = atkName.startsWith('CLOSE_') || attackType === AttackType.THROW
      || attackType === AttackType.THROW_FORWARD || attackType === AttackType.THROW_BACK;
    const isAir = !defender.isGrounded();
    const hitX = isClose ? defender.x + (attacker.x - defender.x) * 0.2 : (attacker.x + defender.x) / 2;
    // KOF2002: 空中命中偏上, 必杀/DM偏胸部, 通常攻击偏腰部
    const { isDM: preDM, isSpecial: preSpecial } = classifyAttack(attackType);
    const hitY = isAir ? defender.y - defender.displayHeight * 0.6
      : preDM ? defender.y - defender.displayHeight * 0.65
      : preSpecial ? defender.y - defender.displayHeight * 0.6
      : defender.y - defender.displayHeight * 0.45;
    const atkIdx = attacker === p1 ? 0 : 1;
    const defIdx = defender === p1 ? 0 : 1;

    if (blocked) {
      // KOF2002: 防御火花偏向防御者面前
      const blkX = defender.x - defender.facing * 15;
      const isCrouchBlock = defender.state === FighterState.CROUCH;
      const blkY = isCrouchBlock ? defender.y - 10 : defender.y - defender.displayHeight / 2;
      const { isDM: blkDM, isSpecial: blkSpecial } = classifyAttack(attackType);
      const blkColor = blkDM ? '#6688ff' : blkSpecial ? '#ffcc44' : '#ffffff';
      const blkHeavy = attackType === AttackType.STAND_C || attackType === AttackType.STAND_D
        || attackType === AttackType.CLOSE_C || attackType === AttackType.CLOSE_D
        || attackType === AttackType.CROUCH_C || attackType === AttackType.CROUCH_D;
      const blkFlashScale = blkDM ? 1.8 : blkSpecial ? 1.4 : blkHeavy ? 1.2 : 1.0;
      deps.vfx.spawnBlockFlash(blkX, blkY, blkFlashScale);
      if (blkDM) {
        deps.vfx.spawnCharacterHitSparks(blkX, blkY, 18, blkColor, 1.6);
        deps.screenFlash.trigger('#4466ff', 0.15, 4);
      } else if (blkSpecial) {
        deps.vfx.spawnCharacterHitSparks(blkX, blkY, 6, blkColor, 1.2);
      }
      // KOF2002: 重攻击/必杀防御时脚下尘土
      if (blkHeavy || blkDM) {
        deps.vfx.spawnDust(defender.x, defender.y);
      }
      // KOF2002: 防御顿帧 — DM 8F, 必杀/重攻击 5F, 轻攻击 3F
      const blkStop = blkDM ? 8 : blkSpecial ? 5 : blkHeavy ? 5 : 3;
      deps.cinematic.triggerHitStop(blkStop);
      // KOF2002: 重攻击/必杀被防时震屏有方向偏移
      const blkBias = (blkDM || blkSpecial || blkHeavy) ? attacker.facing * 4 : 0;
      deps.screenShake.trigger(blkDM ? 8 : blkSpecial ? 5 : blkHeavy ? 4 : 2, blkDM ? 10 : 6, blkBias);
      gainMeterOnBlock(deps.gauges[atkIdx], attackType);
      gainMeterOnHitstun(deps.gauges[defIdx], attackType);
      // Chip伤害数字: 必杀技/DM防御时显示灰色小数字
      if (blkSpecial || blkDM) {
        const chip = Math.round(data.damage * 0.07);
        deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 15, chip);
        // KOF2002: Chip伤害微闪 — 防守方感受到持续压力
        deps.screenFlash.trigger(blkDM ? '#2244aa' : '#443300', 0.04, 2);
      }
      playBlock(blkDM || blkHeavy);
      return;
    }

    const { isDM, isSDM, isSpecial } = classifyAttack(attackType);
    const combo = deps.combatSystem.getComboCount(defIdx);
    const baseStop = calcHitStop(attackType, isDM, isSpecial, counterHit);
    // KOF2002: 高连击数额外hitstop (5+hits +1F, 10+hits +2F), 连段越久节奏感越强
    const comboStop = combo >= 10 ? 2 : combo >= 5 ? 1 : 0;
    // KOF2002: 防守方低血量(<15%)额外+2F顿帧, 终局打击感更强
    const criticalStop = defender.health < defender.maxHealth * 0.15 ? 2 : 0;
    deps.cinematic.triggerHitStop(baseStop + comboStop + criticalStop);
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
    const sparkSize = isSDM ? 1.8 : isDM ? 1.5 : isSpecial ? 1.3 : isHeavyAttack(attackType) ? 1.0 : 0.7;
    const sparkSpeed = isDM ? 1.4 : isSpecial ? 1.2 : 1.0;
    // KOF2002: DM火花70%星形, 必杀50%, 重攻击35%, 轻攻击25%
    const sparkStarRatio = isSDM ? 0.8 : isDM ? 0.7 : isSpecial ? 0.5 : isHeavyAttack(attackType) ? 0.35 : 0.25;
    // KOF2002: 空中命中火花低重力, 延长悬浮效果
    const sparkLowGrav = !defender.isGrounded() && !isDM;
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, sparkColor, sparkSize, sparkSpeed, sparkStarRatio, sparkLowGrav);
    // KOF2002: 连击数增强冲击环 — 5+hits稍大, 10+hits双环
    const ringScale = sparkSize + (combo >= 5 ? 0.3 : 0);
    deps.vfx.spawnImpactRing(hitX, hitY, ringScale);
    if (combo >= 10) deps.vfx.spawnImpactRing(hitX, hitY, ringScale * 0.6);

    // 重攻击斩击线
    if (isHeavyAttack(attackType) || isSpecial) {
      const slashScale = isDM ? 2.0 : isSpecial ? 1.4 : 1.0;
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, sparkColor, slashScale);
    }

    // KOF2002: 必杀技额外冲击环 — 角色色+白色双层
    if (isSpecial && !isDM) {
      deps.vfx.spawnImpactRing(hitX, hitY, 0.8);
    }

    // DM: 超必杀华丽爆发 + 全屏闪光
    if (isDM) {
      deps.vfx.spawnSuperBurst(hitX, hitY, atkChar.specialColor, atkChar.specialGlow, isSDM);
      // KOF2002: DM命中额外尘土效果 — 地面冲击感
      if (defender.isGrounded()) {
        deps.vfx.spawnHeavyDust(hitX, defender.y, 8);
        // KOF2002: DM命中地面冲击波环 — 扩散感
        deps.vfx.spawnImpactRing(hitX, defender.y, 2.5);
      } else {
        // KOF2002: DM空中命中额外飘散
        deps.vfx.spawnCharacterHitSparks(hitX, hitY - 20, 8, atkChar.specialGlow, 0.7, 0.8, 0.3, true);
      }
      // KOF2002: 低血量DM命中额外冲击环 — 终局打击感
      if (defender.health < defender.maxHealth * 0.25) {
        deps.vfx.spawnImpactRing(hitX, hitY, 2.0);
      }
      // SDM: 金色闪光+双冲击环, DM: 白色闪光
      if (isSDM) {
        deps.screenFlash.trigger('#ffdd44', 0.65, 18);
        deps.vfx.spawnImpactRing(hitX, hitY);
        deps.vfx.spawnImpactRing(hitX, hitY);
      } else {
        deps.screenFlash.trigger('#fffde8', 0.38, 10);
      }
    }

    // 伤害数字 — KOF2002: DM用角色色, CH用橙色, 通常用默认分级色
    const dmgColor = isDM ? atkChar.specialColor : counterHit ? '#ff8800' : undefined;
    deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage, dmgColor);

    // KOF2002: 命中确认光效 — 攻击者身上微弱白色闪光确认命中
    attacker.hitFlashFrames = 2;
    attacker.hitFlashColor = isDM ? atkChar.specialColor : '#ffffff';

    // KOF2002: 重攻击(非必杀)命中微闪 — 增强打击感
    if (isHeavyAttack(attackType) && !isSpecial && !isDM) {
      deps.screenFlash.trigger('#ffffcc', 0.07, 3);
    }

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
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 16, atkChar.specialGlow, 1.3);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.3);
      // KOF2002: Rekka finisher额外角色色小火花+方向性震屏
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, atkChar.specialColor, 0.7);
      deps.screenFlash.trigger(atkChar.specialColor, 0.15, 5);
      deps.screenShake.trigger(8, 10, attacker.facing * 6);
    }

    // SFX
    if (isDM) { playSuperFlash(isSDM); playDM(); }
    else if (attackType === AttackType.THROW || attackType === AttackType.THROW_FORWARD || attackType === AttackType.THROW_BACK) {
      playThrow();
      // 投技火花+弧线特效 — 角色专属色混合蓝白
      const throwColor = atkChar.specialColor;
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 10, throwColor, 1.0, 1.0, 0.4);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, '#ffffff', 0.7, 0.8);
      // KOF2002: 投技额外向上飘散蓝色小火花
      deps.vfx.spawnCharacterHitSparks(hitX, hitY - 30, 4, '#aaddff', 0.5, 0.6);
      // KOF2002: 投技命中冲击环 — 物理冲击感
      deps.vfx.spawnImpactRing(hitX, hitY, 1.2);
      deps.screenFlash.trigger('#aaddff', 0.15, 5);
      // KOF2002: 投技命中地面扬尘
      if (defender.isGrounded()) {
        deps.vfx.spawnDust(defender.x, defender.y);
      }
      deps.screenShake.trigger(9, 9);
    }
    else if (isSpecial) { playSpecial(); if (combo > 0) playHit(0.6, combo); }
    else if (data.damage >= 70) playHeavyHit(1 + Math.min(data.damage - 70, 50) / 62.5);
    else if (!defender.isGrounded()) playJuggleHit(combo);
    else playHit(data.damage > 50 ? 1.2 : 1.0, combo);

    // Counter Hit — KOF2002: CH额外顿帧+橙色爆发+冲击波
    if (counterHit) {
      deps.vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55);
      deps.screenFlash.trigger('#ffaa00', 0.18, 6);
      // KOF2002: CH额外橙色火花爆发 — 强调反击
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 8, '#ff8800', 1.0, 1.2, 0.4);
      // KOF2002: CH冲击波 — 明显的双层冲击环
      deps.vfx.spawnImpactRing(hitX, hitY, 1.5);
      playCounter();
    }
    if (counterHit && (data as { counterWire?: boolean }).counterWire) {
      deps.vfx.spawnWireText(defender.x, defender.y - defender.displayHeight - 55);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 20, '#ff6600');
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.screenFlash.trigger('#ff6600', 0.2, 6);
      deps.screenShake.trigger(10, 10);
      // KOF2002: 壁弹命中额外地面尘土
      if (defender.isGrounded()) {
        deps.vfx.spawnHeavyDust(defender.x, defender.y, 8);
      }
      // KOF2002: Counter Wire额外顿帧 — 壁弹前明显停顿, 强调打击感
      deps.cinematic.triggerHitStop(4);
      playWire();
    }

    // 飞行道具爆炸
    if (attackType === AttackType.SPECIAL_PROJECTILE) {
      deps.vfx.spawnProjectileExplosion(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
    }

    // KOF2002: 空中命中额外特效 — 飘散粒子+小闪光+连击增强+浮空冲击环
    if (!defender.isGrounded() && !isDM) {
      const airBonus = combo >= 5 ? 4 : 0;
      deps.vfx.spawnCharacterHitSparks(hitX, hitY - 15, 6 + airBonus, '#aaddff', 0.8, 0.8, 0.3, true);
      // KOF2002: 空中命中额外淡蓝飘散
      deps.vfx.spawnCharacterHitSparks(hitX, hitY - 25, 3, '#ddeeff', 0.5, 0.6, 0.2, true);
      // KOF2002: 空中命中微弱冲击环 — 悬浮感
      if (combo >= 3) deps.vfx.spawnImpactRing(hitX, hitY, 0.5);
    }
    // KOF2002: 站立被通常技命中时脚下尘土
    if (defender.isGrounded() && !isDM && !isSpecial) {
      deps.vfx.spawnDust(defender.x, defender.y);
    }
    // KOF2002: 必杀技地面命中额外微尘
    if (defender.isGrounded() && isSpecial && !isDM) {
      deps.vfx.spawnDust(defender.x, defender.y);
    }

    // CD击飞攻击: 更强的冲击反馈
    if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) {
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 16, '#ffaa00');
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.vfx.spawnImpactRing(hitX, hitY);
      // KOF2002: CD攻击额外白色爆发核心+方向性震屏
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 12, '#ffffff', 0.9);
      deps.screenFlash.trigger('#ffcc44', 0.15, 4);
      deps.screenShake.trigger(6, 8, attacker.facing * 5);
    }

    // 连击数显示 + 高连击冲击环
    if (combo >= 2) deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, combo);
    // KOF2002: 5+hits中等冲击环 — 填充10hits和0hits之间的视觉空白
    if (combo >= 5 && combo < 10) {
      deps.vfx.spawnImpactRing(hitX, hitY, 1.3);
    }
    if (combo >= 10) {
      deps.vfx.spawnImpactRing(hitX, hitY, 2.0);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, '#ffffff', 0.5, 2.0);
      // KOF2002: 10+hits微闪白 — 强化连段满足感
      deps.screenFlash.trigger('#ffffff', 0.06, 3);
    }

    // 震屏时长: 轻攻击5帧, 重攻击8帧, 必杀10帧, DM 14帧
    const shakeDur = isDM ? 14 : isSpecial ? 10 : isHeavyAttack(attackType) ? 8 : 5;
    // KOF2002: 高连击数增强震屏 (5+hits时额外+2强度, 10+hits时+4)
    const comboShake = combo >= 10 ? 4 : combo >= 5 ? 2 : 0;
    deps.screenShake.trigger(calcShake(attackType, counterHit, data.damage) + comboShake, shakeDur, attacker.facing * 8);
    deps.cinematic.trackDamage(defIdx, data.damage);

    // KO检测 — 角色倒地时触发震撼效果
    if (defender.health <= 0 && !defender.isGrounded()) {
      // KOF2002: KO前最后一击额外顿帧+微闪
      deps.cinematic.triggerHitStop(2);
      deps.screenFlash.trigger('#ff4400', 0.08, 3);
    }
  };
}

/** KO落地特效触发 — 从main.ts调用 */
export function triggerKOGroundEffect(deps: { vfx: VFXSystem; screenFlash: ScreenFlash; screenShake: ScreenShake }, defender: Fighter): void {
  deps.vfx.spawnGroundSlam(defender.x, defender.y);
  deps.vfx.spawnHeavyDust(defender.x, defender.y, 16);
  // KOF2002: KO落地冲击环+白色火花
  deps.vfx.spawnImpactRing(defender.x, defender.y, 2.0);
  // KOF2002: KO落地暗红色脉冲环 — 最终终结感
  deps.vfx.spawnImpactRing(defender.x, defender.y, 3.0);
  deps.vfx.spawnCharacterHitSparks(defender.x, defender.y - 20, 16, '#ff4400', 1.2, 1.5);
  deps.screenFlash.trigger('#ff2200', 0.35, 14);
  deps.screenShake.trigger(18, 18);
}
