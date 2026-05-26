/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType, FighterState } from '../core/types.js';
import { FRAME_DATA, STAGE_WIDTH, MAX_STOCKS, METER_PER_STOCK } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { isDM as isDMCheck } from '../core/attackClassifier.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter, playHeavyHit, playSuperFlash, playWire, playJuggleHit, playBlockSpecial, playBlockDM, playSpecialLight, playSpecialHeavy, playKOHit, playHitAccent, playLandingHeavy, playDizzyHit, playGroundBounce, playWallBounce, playGuardCrush } from '../audio/sampler.js';
import { bgm } from '../audio/bgm.js';
import type { CinematicState } from '../state/cinematicState.js';

function classifyAttack(at: AttackType) {
  const s = at as string;
  const isSDM = s.startsWith('SDM_');
  const _isDM = s.startsWith('DM_') || isSDM;
  // 通常技/投技/CD/COMMAND_NORMAL以外的全部视为必杀技
  const normalAttack = at === AttackType.STAND_A || at === AttackType.STAND_B || at === AttackType.STAND_C || at === AttackType.STAND_D
    || at === AttackType.CLOSE_A || at === AttackType.CLOSE_B || at === AttackType.CLOSE_C || at === AttackType.CLOSE_D
    || at === AttackType.CROUCH_A || at === AttackType.CROUCH_B || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_A || at === AttackType.JUMP_B || at === AttackType.JUMP_C || at === AttackType.JUMP_D
    || at === AttackType.STAND_CD || at === AttackType.JUMP_CD;
  const isThrow = at === AttackType.THROW || at === AttackType.THROW_FORWARD || at === AttackType.THROW_BACK;
  const isSpecial = !normalAttack && !isThrow && !_isDM;
  const isPunch = s.endsWith('_A') || s.endsWith('_C')
    || s.includes('ARAGAMI') || s.includes('DOKUGAMI') || s.includes('ONIYAKI')
    || s.includes('KOTOTSUKI') || s.includes('KUZUKAZE') || s.includes('BURN_KNUCKLE')
    || s.includes('RISING_TACKLE') || s.includes('POWER_DUNK') || s.includes('SANREN')
    || s.includes('TSUMIYOMI') || s.includes('BATSUYOMI');
  return { isDM: _isDM, isSDM, isSpecial, isPunch };
}

function calcHitStop(at: AttackType, isDM: boolean, isSpecial: boolean, ch: boolean): number {
  const heavy = at === AttackType.STAND_C || at === AttackType.STAND_D || at === AttackType.CLOSE_C
    || at === AttackType.CLOSE_D || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D;
  const s = at as string;
  const isSDM = s.startsWith('SDM_');
  const r = isDM ? (isSDM ? 22 : 19) : isSpecial ? 13 : heavy ? 7 : 4;
  return ch ? r + 3 : r;
}

function calcShake(at: AttackType, isDM: boolean, isSpecial: boolean, ch: boolean, dmg: number): number {
  const s = at as string;
  if (isDM) return 14;
  if (isSpecial) return 8;
  if (at === AttackType.THROW) return 8;
  if (ch) return 6;
  if (at === AttackType.STAND_C || at === AttackType.STAND_D
    || at === AttackType.CLOSE_C || at === AttackType.CLOSE_D
    || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D) return 6;
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

function isThrowAttack(at: AttackType): boolean {
  return at === AttackType.THROW || at === AttackType.THROW_FORWARD || at === AttackType.THROW_BACK;
}

function getAttackDirectionBias(attacker: Fighter, defender: Fighter, attackType: AttackType, counterHit: boolean): number {
  const atkToDef = defender.x - attacker.x;
  const closeBias = atkToDef === 0 ? attacker.facing * 4 : Math.sign(atkToDef) * 4;
  if (counterHit) return attacker.facing * 8;
  if (attackType === AttackType.THROW || isThrowAttack(attackType)) return attacker.facing * 10;
  if (isHeavyAttack(attackType) || attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return closeBias;
  return attacker.facing * 2;
}

/**
 * 基于伤害量的火花尺寸分级:
 * - Light (damage < 50): small spark (radius 8-12)
 * - Medium (50-100): medium spark (radius 14-20)
 * - Heavy (100-150): large spark (radius 22-30)
 * - Special (150+): extra large with ring burst
 * - DM (200+): screen-wide flash + massive spark
 */
function getDamageSizeScale(damage: number): number {
  if (damage >= 200) return 1.7;
  if (damage >= 150) return 1.4;
  if (damage >= 100) return 1.1;
  if (damage >= 50) return 0.8;
  return 0.5;
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
    const isClose = atkName.startsWith('CLOSE_') || isThrowAttack(attackType);
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
      const blkFlashScale = blkDM ? 1.5 : blkSpecial ? 1.15 : blkHeavy ? 1.05 : 0.9;
      deps.vfx.spawnBlockFlash(blkX, blkY, blkFlashScale);
      if (blkDM) {
        deps.vfx.spawnCharacterHitSparks(blkX, blkY, 12, blkColor, 1.3, undefined, undefined, undefined, attacker.facing);
        deps.screenFlash.trigger('#4466ff', 0.1, 3);
      } else if (blkSpecial) {
        deps.vfx.spawnCharacterHitSparks(blkX, blkY, 4, blkColor, 1.0, undefined, undefined, undefined, attacker.facing);
      }
      // KOF2002: 重攻击/必杀防御时脚下尘土
      if (blkHeavy || blkDM) {
        deps.vfx.spawnDust(defender.x, defender.y);
      }
      // 防御顿帧 — KOF2002: DM防御8f, 必杀技防御5f, 重攻击防御4f, 轻攻击防御2f
      const blkStop = blkDM ? 8 : blkSpecial ? 5 : blkHeavy ? 4 : 2;
      deps.cinematic.triggerHitStop(blkStop, defIdx, attacker.facing);
      // 防御反馈更偏"硬切"而不是层层铺开
      const blkBias = (blkDM || blkSpecial || blkHeavy) ? attacker.facing * 3 : 0;
      deps.screenShake.trigger(blkDM ? 8 : blkSpecial ? 5 : blkHeavy ? 4 : 3, blkDM ? 10 : blkSpecial ? 7 : blkHeavy ? 6 : 5, blkBias);
      gainMeterOnBlock(deps.gauges[atkIdx], attackType);
      gainMeterOnHitstun(deps.gauges[defIdx], attackType, defender.health, defender.maxHealth);
      // Chip伤害数字: 必杀技/DM防御时显示灰色小数字
      if (blkSpecial || blkDM) {
        const chip = Math.round(data.damage * 0.07);
        deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 15, chip);
        // KOF2002: Chip伤害微闪 — 防守方感受到持续压力
        deps.screenFlash.trigger(blkDM ? '#2244aa' : '#443300', 0.04, 2);
      }
      if (blkDM) playBlockDM();
      else if (blkSpecial) playBlockSpecial();
      else playBlock(blkHeavy);
      // Guard Crush: 防御槽耗尽时播放金属碎裂声
      // (onGuardCrush回调在main.ts中也会触发VFX，此处补充SFX)
      if (defender.state === FighterState.GUARD_CRUSH) {
        playGuardCrush();
      }
      return;
    }

    const { isDM, isSDM, isSpecial } = classifyAttack(attackType);
    const combo = deps.combatSystem.getComboCount(defIdx);
    const comboDmg = deps.combatSystem.getComboDamage(defIdx);
    const baseStop = calcHitStop(attackType, isDM, isSpecial, counterHit);
    // 连击和低血只做轻微补强，避免把命中时间线拖成堆栈
    const comboStop = combo >= 10 ? 1 : 0;
    const criticalStop = defender.health < defender.maxHealth * 0.15 ? 1 : 0;
    deps.cinematic.triggerHitStop(baseStop + comboStop + criticalStop, defIdx, attacker.facing);
    gainMeterOnHitstun(deps.gauges[defIdx], attackType, defender.health, defender.maxHealth);
    // 风云再起特色: 第一次命中奖励 — 每回合首次命中额外+30气槽
    if (!deps.combatSystem.wasFirstHitAwarded(defIdx)) {
      deps.gauges[atkIdx].meter = Math.min(deps.gauges[atkIdx].meter + 30, MAX_STOCKS * METER_PER_STOCK);
    }

    const atkChar = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    const { isPunch } = classifyAttack(attackType);

    // === 基于伤害的火花尺寸分级 ===
    // 取攻击类型分类和伤害分级中的较大值，确保DM/必杀技有足够的辨识度
    const typeSizeScale = isSDM ? 1.5 : isDM ? 1.3 : isSpecial ? 1.1 : isHeavyAttack(attackType) ? 0.85 : 0.55;
    const dmgSizeScale = getDamageSizeScale(data.damage);
    const sparkSize = Math.max(typeSizeScale, dmgSizeScale);
    // Counter Hit: 火花尺寸翻倍
    const chSizeBonus = counterHit ? 2.0 : 1.0;

    // 火花收口：保留主爆点，砍掉过多补层
    const comboSparkBonus = combo >= 10 ? 3 : combo >= 5 ? 1 : 0;
    const lowHpBonus = defender.health < defender.maxHealth * 0.25 ? 2 : 0;
    const sparks = (isSDM ? 18 : isDM ? 14 : isSpecial ? 10 : counterHit ? 8 : 6) + comboSparkBonus + lowHpBonus;
    // CH时用橙红色调
    const sparkColor = counterHit ? '#ff6600' : isSpecial ? atkChar.specialColor : isPunch ? '#ffdd44' : '#44ddff';
    // 连击中VFX递减: 高连击时火花逐步缩小，避免画面过于密集
    const comboSparkScale = combo >= 6 ? 0.8 : combo >= 3 ? 0.9 : 1.0;
    const sparkSpeed = isDM ? 1.15 : isSpecial ? 1.05 : 0.95;
    // 星体比例收紧，避免画面太"烟花化"
    const sparkStarRatio = isSDM ? 0.55 : isDM ? 0.45 : isSpecial ? 0.3 : isHeavyAttack(attackType) ? 0.2 : 0.15;
    const sparkLowGrav = !defender.isGrounded() && !isDM;
    // === 传递facing参数，让火花方向基于攻击者朝向 ===
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, sparkColor, sparkSize * comboSparkScale * chSizeBonus, sparkSpeed, sparkStarRatio, sparkLowGrav, attacker.facing);

    // === DM (200+ damage): 屏幕宽闪光 + 巨大火花 ===
    if (isDM) {
      deps.vfx.spawnSuperBurst(hitX, hitY, atkChar.specialColor, atkChar.specialGlow, isSDM);
      if (defender.isGrounded()) {
        deps.vfx.spawnHeavyDust(hitX, defender.y, 6);
        deps.vfx.spawnImpactRing(hitX, defender.y, 2.0);
      } else {
        deps.vfx.spawnCharacterHitSparks(hitX, hitY - 16, 4, atkChar.specialGlow, 0.6, 0.75, 0.18, true, attacker.facing);
      }
      if (isSDM) {
        // SDM: 全屏明亮闪光
        deps.screenFlash.trigger('#ffdd44', 0.35, 10);
        deps.vfx.spawnImpactRing(hitX, hitY, 1.1);
      } else {
        deps.screenFlash.trigger('#fffde8', 0.25, 6);
      }
    }

    // 冲击环只保留主环，连击只轻微放大，不再堆双环
    const ringScale = sparkSize + (combo >= 5 ? 0.2 : 0);
    deps.vfx.spawnImpactRing(hitX, hitY, ringScale);

    // 重攻击斩击线
    if (isHeavyAttack(attackType) || isSpecial) {
      const slashScale = isDM ? 1.6 : isSpecial ? 1.2 : 1.0;
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, sparkColor, slashScale);
    }

    // 伤害数字 — KOF2002: DM用角色色, CH用橙色, 通常用默认分级色
    const dmgColor = isDM ? atkChar.specialColor : counterHit ? '#ff8800' : undefined;
    deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage, dmgColor);

    // 命中确认光效收短，强调"硬切"而不是长时间白闪
    attacker.hitFlashFrames = isDM ? 4 : isSpecial ? 3 : isHeavyAttack(attackType) ? 2 : 1;
    attacker.hitFlashColor = isDM ? atkChar.specialColor : '#ffffff';

    // 重攻击保留一层短促微闪，不再额外叠更多环
    if (isHeavyAttack(attackType) && !isSpecial && !isDM) {
      deps.vfx.spawnImpactRing(hitX, hitY, 0.75);
      deps.screenFlash.trigger('#ffffcc', 0.05, 2);
    }

    // 取消点闪光 — 命中(非投技)时在攻击者身上显示可取消提示
    if (!isThrowAttack(attackType)) {
      deps.vfx.spawnCancelFlash(attacker.x, attacker.y, attacker.displayHeight);
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
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 10, atkChar.specialGlow, 1.0, undefined, undefined, undefined, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.1);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 4, atkChar.specialColor, 0.6, undefined, undefined, undefined, attacker.facing);
      deps.screenFlash.trigger(atkChar.specialColor, 0.1, 4);
      deps.screenShake.trigger(6, 8, getAttackDirectionBias(attacker, defender, attackType, counterHit));
    }

    // SFX
    if (isDM) { playSuperFlash(isSDM); playDM(); }
    else if (isThrowAttack(attackType)) {
      playThrow();
      // 投技保留一层主火花，减少蓝白多段铺开
      const throwColor = atkChar.specialColor;
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 8, throwColor, 0.95, 0.95, 0.25, false, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY, 0.95);
      deps.screenFlash.trigger('#aaddff', 0.1, 4);
      if (defender.isGrounded()) {
        deps.vfx.spawnDust(defender.x, defender.y);
      }
      deps.screenShake.trigger(7, 8, getAttackDirectionBias(attacker, defender, attackType, counterHit));
    }
    else if (isSpecial) { if (data.damage >= 90) playSpecialHeavy(); else playSpecialLight(); if (combo > 0) playHit(0.6, combo); }
    else if (data.damage >= 70) playHeavyHit(1 + Math.min(data.damage - 70, 50) / 62.5);
    else if (!defender.isGrounded()) playJuggleHit(combo);
    else playHit(data.damage > 50 ? 1.2 : 1.0, combo);

    // 角色特有能量点缀 — 必杀技/DM命中时叠加角色属性音效
    if (isDM || isSpecial) {
      playHitAccent(attacker.charId, isDM);
    }

    // KO命中检测 — 最后一击将对手击至0血时播放KO命中音效
    const isKOHit = defender.health <= 0;
    if (isKOHit) {
      playKOHit();
    }

    // Sidechain duck: lower BGM briefly so SFX cuts through
    if (isDM) bgm.duck(0.55, 200);
    else if (isSpecial) bgm.duck(0.65, 150);
    else if (isThrowAttack(attackType) || counterHit) bgm.duck(0.65, 150);
    else if (isHeavyAttack(attackType)) bgm.duck(0.72, 120);
    else bgm.duck(0.78, 100);

    // === Counter Hit 增强 ===
    if (counterHit) {
      // CH文字 — 位置在被击方头顶上方
      deps.vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55);
      // CH: 橙色2帧屏幕闪光
      deps.screenFlash.trigger('#ff8800', 0.18, 2);
      // CH: 橙红色爆发 + 双倍尺寸
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, '#ff8800', 0.9 * 2, 1.0, 0.22, false, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.15);
      playCounter();
      bgm.duck(0.6, 180);
    }
    if (counterHit && (data as { counterWire?: boolean }).counterWire) {
      deps.vfx.spawnWireText(defender.x, defender.y - defender.displayHeight - 55);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 10, '#ff6600', 0.95, 1.0, 0.2, false, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.0);
      deps.screenFlash.trigger('#ff6600', 0.12, 4);
      deps.screenShake.trigger(8, 8, getAttackDirectionBias(attacker, defender, attackType, counterHit));
      if (defender.isGrounded()) {
        deps.vfx.spawnHeavyDust(defender.x, defender.y, 8);
      }
      // Counter Wire: 延长顿帧而非覆盖 — 叠加到已有hitstop上
      deps.cinematic.addHitStop(5, defIdx);
      playWire();
    }

    // 飞行道具爆炸
    if (attackType === AttackType.SPECIAL_PROJECTILE) {
      deps.vfx.spawnProjectileExplosion(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
    }

    // 空中命中只保留轻飘粒子和一个很弱的辅助环，避免层数过多
    if (!defender.isGrounded() && !isDM) {
      const airBonus = combo >= 5 ? 2 : 0;
      deps.vfx.spawnCharacterHitSparks(hitX, hitY - 14, 4 + airBonus, '#aaddff', 0.65, 0.75, 0.15, true, attacker.facing);
      if (combo >= 5) deps.vfx.spawnImpactRing(hitX, hitY, 0.45);
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
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 10, '#ffaa00', 0.95, 1.0, 0.25, false, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 6, '#ffffff', 0.7, 0.9, 0.1, false, attacker.facing);
      deps.screenFlash.trigger('#ffcc44', 0.1, 3);
      deps.screenShake.trigger(5, 7, getAttackDirectionBias(attacker, defender, attackType, counterHit));
    }

    // 壁弹(Counter Wire / CD击飞): 飞向墙壁时播放撞击声
    if (defender.isCounterWire) {
      playWallBounce();
    }
    // 地面弹跳: 角色从地面弹起时播放弹跳声
    if (defender.isGroundBounce) {
      playGroundBounce();
    }

    // Dizzy: if defender just entered DIZZY state, dramatic flash and burst
    if (defender.state === FighterState.DIZZY) {
      deps.screenFlash.trigger('#ffffaa', 0.18, 6);
      deps.screenShake.trigger(8, 12);
      // Extra burst at the dizzy point
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 12, '#ffff44', 1.2, 1.0, 0.3, false, attacker.facing);
      // Dizzy Hit SFX — 带回声的打击声
      playDizzyHit();
    }

    // === 浮动连击文本 ===
    // combo >= 2 时在防守方头顶显示 "N HIT (totalDmg)" 格式的浮动文本
    if (combo >= 2) {
      // 保留旧版数字显示(向后兼容)
      deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, combo);
      // 新增: 浮动连击文本 — 位置在头顶偏上，显示连击数+累计伤害
      deps.vfx.spawnFloatingComboText(
        defender.x, defender.y - defender.displayHeight - 55,
        combo, comboDmg,
      );
    }
    // 连击只轻微补一层，不再额外叠满屏中环
    if (combo >= 5 && combo < 10) {
      deps.vfx.spawnImpactRing(hitX, hitY, 1.1);
    }
    if (combo >= 10) {
      deps.vfx.spawnImpactRing(hitX, hitY, 1.4);
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 4, '#ffffff', 0.45, 1.6, 0.1, false, attacker.facing);
      deps.screenFlash.trigger('#ffffff', 0.04, 2);
    }

    // 震屏方向更明确，DM/KO层次拉开
    const shakeDur = isDM ? 16 : isSpecial ? 10 : isHeavyAttack(attackType) ? 8 : 4;
    const comboShakeBonus = combo >= 10 ? 1 : 0;
    // 连击中震屏递减: 高连击时震屏强度逐步衰减，最低保留60%
    const comboShakeDecay = combo >= 3 ? Math.max(0.6, 1 - combo * 0.05) : 1;
    deps.screenShake.trigger(
      Math.round(calcShake(attackType, isDM, isSpecial, counterHit, data.damage) * comboShakeDecay) + comboShakeBonus,
      shakeDur,
      getAttackDirectionBias(attacker, defender, attackType, counterHit),
    );
    deps.cinematic.trackDamage(defIdx, data.damage);

    // KO检测 — 角色倒地时触发震撼效果
    if (defender.health <= 0 && !defender.isGrounded()) {
      // KO前最后一击: 延长顿帧而非覆盖
      deps.cinematic.addHitStop(3, defIdx);
      deps.screenFlash.trigger('#ff4400', 0.08, 3);
    }
  };
}

/** KO落地特效触发 — 从main.ts调用 */
export function triggerKOGroundEffect(deps: { vfx: VFXSystem; screenFlash: ScreenFlash; screenShake: ScreenShake }, defender: Fighter): void {
  // KO落地重击音效 — 区别于普通落地
  playLandingHeavy();
  deps.vfx.spawnGroundSlam(defender.x, defender.y);
  deps.vfx.spawnHeavyDust(defender.x, defender.y, 16);
  // KOF2002: KO落地冲击环+白色火花
  deps.vfx.spawnImpactRing(defender.x, defender.y, 2.0);
  // KOF2002: KO落地暗红色脉冲环 — 最终终结感
  deps.vfx.spawnImpactRing(defender.x, defender.y, 3.0);
  deps.vfx.spawnCharacterHitSparks(defender.x, defender.y - 20, 16, '#ff4400', 1.2, 1.5);
  // KO: 去饱和闪光 — 先白色2帧模拟去色, 再暗红脉冲
  deps.screenFlash.trigger('#ffffff', 0.25, 2);
  // 短暂延迟后叠加红色(通过延长闪光时间实现)
  deps.screenFlash.trigger('#ff2200', 0.35, 14);
  // KOF2002: KO落地震屏55帧, 模拟地面冲击波持续感
  deps.screenShake.trigger(22, 55);
}
