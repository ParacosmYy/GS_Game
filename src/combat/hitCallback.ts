/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType, FighterState } from '../core/types.js';
import {
  FRAME_DATA, STAGE_WIDTH, MAX_STOCKS, METER_PER_STOCK,
  SHAKE_KO, SHAKE_DURATION_KO,
} from '../core/constants.js';
import { getFeedback } from '../core/feedbackManifest.js';
import { ROSTER } from '../characters/index.js';
import { isDM as isDMCheck } from '../core/attackClassifier.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter, playHeavyHit, playSuperFlash, playWire, playJuggleHit, playBlockSpecial, playBlockDM, playSpecialLight, playSpecialHeavy, playKOHit, playHitAccent, playLandingHeavy, playDizzyHit, playGroundBounce, playWallBounce, playGuardCrush, playComboMilestone } from '../audio/sampler.js';
import { playCharVoice } from '../audio/charVoice.js';
import { spawnTierSparks } from '../rendering/vfxPresets.js';
import { bgm } from '../audio/bgm.js';
import { announcer } from '../audio/announcer.js';
import { announcerOverlay } from '../rendering/announcerOverlay.js';
import type { CinematicState } from '../state/cinematicState.js';
import { dispatchHitVFX, dispatchHitSFX, type HitEffectContext } from '../content/characterHitEffects.js';

// ===== KOF2002: 命中招式名映射 =====
// AttackType → 中文招式名, 按角色分组
// 只包含必杀技/DM级别, 通常技不显示招式名
export const MOVE_NAME_MAP: Partial<Record<AttackType, string>> = {
  // Ryo (坂崎亮)
  [AttackType.RYO_KOOU]: '虎煌拳',
  [AttackType.RYO_KOOU_C]: '虎煌拳',
  [AttackType.RYO_KO_HOU]: '虎咆',
  [AttackType.RYO_KO_HOU_C]: '虎咆',
  [AttackType.RYO_HIEN]: '飛燕疾風脚',
  [AttackType.RYO_HAOU]: '霸王翔吼拳',
  [AttackType.RYO_KOOUKEN_D]: '虎煌拳',
  [AttackType.RYO_HIO_HACKER]: '氷果斬',
  [AttackType.RYO_ZANRETSU_KEN]: '斩裂拳',
  [AttackType.DM_TEN_HA_OU]: '天地霸煌拳',
  [AttackType.SDM_TEN_HA_OU]: '天地霸煌拳',
  [AttackType.SDM_RYUKO_RANBU]: '龍虎乱舞',
  [AttackType.HSDM_RYUKO_RANBU]: '龍虎乱舞',
  // Kyo (草薙京)
  [AttackType.KYO_YAMIBARAI]: '闇払い',
  [AttackType.KYO_YAMIBARAI_C]: '闇払い',
  [AttackType.KYO_ARAGAMI]: '荒咬み',
  [AttackType.KYO_DOKUGAMI]: '毒咬み',
  [AttackType.KYO_ONIYAKI]: '鬼焼き',
  [AttackType.KYO_ONIYAKI_C]: '鬼焼き',
  [AttackType.KYO_NANASE]: '七瀬',
  [AttackType.KYO_KOTO_TSUKI]: '琴月陽',
  [AttackType.KYO_YAKISOGI]: '破砕',
  [AttackType.KYO_BATSUYOMI]: '罰詠み',
  [AttackType.KYO_TSUMIYOMI]: '罪詠み',
  [AttackType.KYO_75KAI]: '七拾五式・改',
  [AttackType.KYO_75KAI_2]: '七拾五式・改',
  [AttackType.KYO_RED_KICK]: 'R.E.D.KICK',
  [AttackType.DM_OROCHINAGI]: '大蛇薙',
  [AttackType.SDM_OROCHINAGI]: '大蛇薙',
  // Iori (八神庵)
  [AttackType.IORI_YAMIBARAI]: '闇払い',
  [AttackType.IORI_YAMIBARAI_C]: '闇払い',
  [AttackType.DM_YATAGARASU]: '八咫烏',
  [AttackType.SDM_YATAGARASU]: '八咫烏',
  [AttackType.IORI_AOIHANA]: '葵花',
  [AttackType.IORI_AOIHANA_2]: '葵花',
  [AttackType.IORI_AOIHANA_3]: '葵花',
  [AttackType.IORI_KOTOTSUKI]: '琴月陰',
  [AttackType.IORI_ONIYAKI]: '鬼焼き',
  [AttackType.IORI_ONIYAKI_C]: '鬼焼き',
  [AttackType.IORI_KUZUKAZE]: '屑風',
  // Terry (テリー・ボガード)
  [AttackType.TERRY_BURN_KNUCKLE]: 'Burn Knuckle',
  [AttackType.TERRY_RISING_TACKLE]: 'Rising Tackle',
  [AttackType.TERRY_POWER_DUNK]: 'Power Dunk',
  [AttackType.TERRY_POWER_WAVE]: 'Power Wave',
  [AttackType.TERRY_CRACK_SHOT]: 'Crack Shot',
  [AttackType.DM_POWER_GEYSER]: 'Power Geyser',
  [AttackType.SDM_POWER_GEYSER]: 'Power Geyser',
  // Kim (キム・カッファン)
  [AttackType.KIM_HIENZAN]: '飛燕斬',
  [AttackType.KIM_HISHOU]: '飛翔脚',
  [AttackType.KIM_HANGETSU]: '半月斬',
  [AttackType.KIM_HAKI]: '覇気脚',
  [AttackType.KIM_SANREN]: '三連撃',
  [AttackType.SDM_PHOENIX_KICK]: '鳳凰脚',
};

/** 根据攻击类型获取招式名样式 */
function getMoveNameStyle(at: AttackType, charSpecialColor: string): { color: string; fontSize: number } | null {
  const atStr = at as string;
  const isHSDM = atStr.startsWith('HSDM_');
  const isSDM = atStr.startsWith('SDM_') || isHSDM;
  const _isDM = atStr.startsWith('DM_') || isSDM;

  if (isHSDM) {
    return { color: '#ff44ff', fontSize: 30 };
  }
  if (isSDM) {
    return { color: '#ffd700', fontSize: 28 };
  }
  if (_isDM) {
    return { color: '#ffd700', fontSize: 26 };
  }
  // 必殺技: 角色色, 20px
  return { color: charSpecialColor, fontSize: 20 };
}

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
    || s.includes('TSUMIYOMI') || s.includes('BATSUYOMI')
    || s.includes('KOOUKEN_D') || s.includes('HIO_HACKER') || s.includes('ZANRETSU_KEN');
  return { isDM: _isDM, isSDM, isSpecial, isPunch };
}

const HITSTOP_COUNTER_BONUS = 3;

function calcHitStop(at: AttackType, ch: boolean): number {
  const fb = getFeedback(at);
  return ch ? fb.hitstop + HITSTOP_COUNTER_BONUS : fb.hitstop;
}

function calcShake(at: AttackType, ch: boolean, dmg: number): number {
  if (ch) return Math.max(getFeedback(at).shakeIntensity, 6);
  return getFeedback(at).shakeIntensity;
}

/** 判断是否为重攻击(需要斩击线特效) */
function isHeavyAttack(at: AttackType): boolean {
  return at === AttackType.STAND_C || at === AttackType.STAND_D
    || at === AttackType.CLOSE_C || at === AttackType.CLOSE_D
    || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D
    || at === AttackType.STAND_CD || at === AttackType.JUMP_CD;
}

/**
 * 斩击线角度按攻击部位差异化 — KOF2002风格
 * - punch (拳): steep ~60°
 * - kick (脚): shallow ~30°
 * - uppercut/升龙: near-vertical ~80°
 * - sweep/扫腿: near-horizontal ~10°
 */
function getSlashAngle(attackType: AttackType): number {
  const at = attackType as string;
  // Uppercut / 升龙系 — 近乎垂直
  if (at.includes('KO_HOU') || at.includes('ONIYAKI') || at.includes('HIENZAN')
    || at.includes('RISING_TACKLE') || at.includes('POWER_DUNK'))
    return 80;
  // Sweep / 下段 — 近乎水平
  if (at === 'CROUCH_D' || at.includes('HAKI') || at.includes('CRACK_SHOT'))
    return 10;
  // Kick attacks — 浅斜
  if (at.endsWith('_D') || at === 'STAND_CD' || at === 'JUMP_CD'
    || at.includes('HIEN') || at.includes('HISHOU') || at.includes('HANGETSU')
    || at.includes('RED_KICK') || at.includes('PHOENIX_KICK'))
    return 30;
  // Punch attacks — 陡斜
  if (at.endsWith('_C') || at.endsWith('_A') || at.endsWith('_B')
    || at.includes('KOOU') || at.includes('HAOU') || at.includes('ARAGAMI')
    || at.includes('DOKUGAMI') || at.includes('BURN_KNUCKLE'))
    return 60;
  // Default: 45° diagonal
  return 45;
}

function isThrowAttack(at: AttackType): boolean {
  return at === AttackType.THROW || at === AttackType.THROW_FORWARD || at === AttackType.THROW_BACK;
}

/**
 * 基于攻击高度的垂直震屏偏置:
 * - Overhead/uppercut/air attacks: positive bias (shake downward)
 * - Low/sweep attacks: negative bias (shake upward) 
 * - Mid attacks: neutral (0)
 * KOF2002: 攻击轨迹决定震屏方向，增强打击方向感
 */
function getShakeBiasY(attackType: AttackType): number {
  const at = attackType as string;
  // Overhead / uppercut — shake downward
  if (at === 'STAND_CD' || at === 'JUMP_CD' || at === 'JUMP_C' || at === 'JUMP_D'
    || at === 'JUMP_A' || at === 'JUMP_B'
    || at.includes('KO_HOU') || at.includes('HIENZAN') || at.includes('ONIYAKI')
    || at.includes('RISING_TACKLE') || at.includes('POWER_DUNK'))
    return 0.6;
  // Low / sweep — shake upward
  if (at === 'CROUCH_D' || at === 'CROUCH_B' || at === 'STAND_B'
    || at.includes('HAKI') || at.includes('CRACK_SHOT'))
    return -0.4;
  // DM / Special mid — slight downward
  if (at.startsWith('DM_') || at.startsWith('SDM_') || at.startsWith('HSDM_'))
    return 0.3;
  // Special moves — slight upward by default
  if (at.includes('RYO_') || at.includes('KYO_') || at.includes('IORI_')
    || at.includes('TERRY_') || at.includes('KIM_'))
    return 0.2;
  // Default mid: neutral
  return 0;
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
      // 防御顿帧 — manifest驱动
      const blkFb = getFeedback(attackType);
      deps.cinematic.triggerHitStop(blkFb.blockstop, defIdx, attacker.facing);
      // 防御反馈更偏"硬切"而不是层层铺开
      const blkBias = (blkDM || blkSpecial || blkHeavy) ? attacker.facing * 3 : 0;
      deps.screenShake.trigger(
        blkFb.blockShakeIntensity,
        blkFb.blockShakeDuration,
        blkBias,
      );
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
      // KOF2002: Block sparks — small white sparks at block point
      const blockSparkCount = blkDM ? 6 : blkSpecial ? 4 : blkHeavy ? 3 : 2;
      const blockSparkColor = blkDM ? '#ffcc00' : '#88aacc';
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, blockSparkCount, blockSparkColor, 0.5, 0.4, 0.2, false, attacker.facing);
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
    const baseStop = calcHitStop(attackType, counterHit);
    // KOF2002: 连击hitstop递减 — 高连击时每hit的hitstop逐步缩短
    // hits 1-4: full, hits 5-8: 70%, hits 9+: 50%
    // DM不受递减影响
    const comboDecayMultiplier = isDM ? 1.0
      : combo < 4 ? 1.0
      : combo < 8 ? 0.7
      : 0.5;
    // 低血补强: 不受连击递减
    const criticalStop = defender.health < defender.maxHealth * 0.15 ? 1 : 0;
    // KOF2002: MAX模式命中加成 — 攻击者在MAX模式下命中获得额外hitstop
    const maxModeStop = attacker.maxModeActive && !isDM ? 3 : 0;
    deps.cinematic.triggerHitStop(Math.round(baseStop * comboDecayMultiplier) + criticalStop + maxModeStop, defIdx, attacker.facing);
    gainMeterOnHitstun(deps.gauges[defIdx], attackType, defender.health, defender.maxHealth);
    // 风云再起特色: 第一次命中奖励 — 每回合首次命中额外+30气槽
    if (!deps.combatSystem.wasFirstHitAwarded(defIdx)) {
      deps.gauges[atkIdx].meter = Math.min(deps.gauges[atkIdx].meter + 30, MAX_STOCKS * METER_PER_STOCK);
    }

    // KOF2002: Defender hurt voice — character-specific pained vocalization
    if (defender.charId && !isDM) {
      playCharVoice(defender.charId, 'hurt', 0.25);
    }

    const atkChar = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    const { isPunch } = classifyAttack(attackType);

    // === 基于伤害的火花尺寸分级 ===
    // manifest驱动基础值，伤害分级取较大值
    const fb = getFeedback(attackType);
    const dmgSizeScale = getDamageSizeScale(data.damage);
    const sparkSize = Math.max(fb.sparkSize, dmgSizeScale);
    // Counter Hit: 火花尺寸翻倍
    const chSizeBonus = counterHit ? 2.0 : 1.0;

    // 火花收口：保留主爆点，砍掉过多补层
    const comboSparkBonus = combo >= 10 ? 3 : combo >= 5 ? 1 : 0;
    const lowHpBonus = defender.health < defender.maxHealth * 0.25 ? 2 : 0;
    const sparks = fb.sparkCount + (counterHit ? 2 : 0) + comboSparkBonus + lowHpBonus;
    // CH时用橙红色调, 重攻击用更亮的颜色
    const sparkColor = counterHit ? '#ff6600' : isSpecial ? atkChar.specialColor : isPunch ? (isHeavyAttack(attackType) ? '#ffcc22' : '#ffdd44') : (isHeavyAttack(attackType) ? '#33bbff' : '#44ddff');
    // 连击中VFX递减: 高连击时火花逐步缩小，避免画面过于密集
    const comboSparkScale = combo >= 6 ? 0.8 : combo >= 3 ? 0.9 : 1.0;
    // KOF2002: 重攻击火花速度稍快，模拟更强冲击感
    const sparkSpeed = isDM ? 1.15 : isSpecial ? 1.05 : isHeavyAttack(attackType) ? 1.0 : 0.9;
    // 星体比例 — manifest驱动
    const sparkStarRatio = fb.sparkStarRatio;
    const sparkLowGrav = !defender.isGrounded() && !isDM;
    // === 传递facing参数，让火花方向基于攻击者朝向 ===
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, sparkColor, sparkSize * comboSparkScale * chSizeBonus, sparkSpeed, sparkStarRatio, sparkLowGrav, attacker.facing);
    // FR-2: Tier-differentiated sparks from manifest
    deps.vfx.spawnTierSparks(hitX, hitY, fb.sparkCount, fb.sparkType, fb.sparkPalette, fb.sparkSpeed);

    // KOF2002: MAX模式命中视觉强化 — 金色火花+冲击环+闪光
    if (attacker.maxModeActive && !isDM) {
      const maxSparks = isSpecial ? 6 : isHeavyAttack(attackType) ? 4 : 3;
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, maxSparks, '#ffcc00', sparkSize * 0.7, sparkSpeed * 1.1, 0.15, false, attacker.facing);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.0);
      if (isSpecial) {
        deps.screenFlash.trigger('#ffcc00', 0.08, 3);
      }
    }

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

    // 冲击环 — manifest驱动数量和尺寸
    const ringScale = fb.impactRingScale + (combo >= 5 ? 0.2 : 0);
    deps.vfx.spawnImpactRing(hitX, hitY, ringScale, fb.impactRingCount);

    // 重攻击斩击线 — 角度按攻击部位差异化
    if (isHeavyAttack(attackType) || isSpecial) {
      const slashScale = isDM ? 1.6 : isSpecial ? 1.2 : 1.0;
      const slashAngle = getSlashAngle(attackType);
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, sparkColor, slashScale, slashAngle);
    }

    // 伤害数字 — KOF2002: DM用角色色, CH用橙色, 通常用默认分级色
    const dmgColor = isDM ? atkChar.specialColor : counterHit ? '#ff8800' : undefined;
    deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage, dmgColor);

    // === KOF2002: 命中招式名显示 ===
    // 必杀技/DM命中时在命中位置上方浮动显示招式名
    if (isSpecial || isDM) {
      const moveName = MOVE_NAME_MAP[attackType];
      if (moveName) {
        const style = getMoveNameStyle(attackType, atkChar.specialColor);
        if (style) {
          // 位置: 被击方头顶上方偏移, 避免与伤害数字重叠
          const nameY = defender.y - defender.displayHeight - 45;
          deps.vfx.spawnMoveNameText(defender.x, nameY, moveName, style.color, style.fontSize);
        }
      }
    }

    // 命中确认光效收短，强调"硬切"而不是长时间白闪
    attacker.hitFlashFrames = fb.hitFlashFrames;
    attacker.hitFlashColor = isDM ? atkChar.specialColor : '#ffffff';

    // KOF2002: 被击者按档位产生不同强度的强调光效
    // heavy: 橙色微光 / special: 蓝白光 / DM/SDM: 强闪光 (已有superBgFlash)
    if (isSpecial && !isDM) {
      defender.hitImpactGlowFrames = 6;
      defender.hitImpactGlowColor = '#88ccff';
      defender.hitImpactGlowSize = 40;
    } else if (isHeavyAttack(attackType) && !isSpecial && !isDM) {
      defender.hitImpactGlowFrames = 4;
      defender.hitImpactGlowColor = '#ff8833';
      defender.hitImpactGlowSize = 25;
    }

    // KOF2002: DM/SDM命中时屏幕短暂暗化突出超必杀效果
    if (isDM) { attacker.superBgFlashFrames = isSDM ? 12 : 8; }

    // KOF2002: 命中灰尘 — 地面命中时击中点产生微小灰尘
    if (defender.isGrounded() && !isDM) {
      deps.vfx.spawnDust(hitX, hitY + 20);
    }

    // 重攻击保留一层短促微闪，不再额外叠更多环
    if (isHeavyAttack(attackType) && !isSpecial && !isDM) {
      deps.vfx.spawnImpactRing(hitX, hitY, 0.75);
      deps.screenFlash.trigger('#ffffcc', 0.05, 2);
    }

    // KOF2002: Counter hit发光轮廓 — 反击命中时攻击者短暂轮廓+屏幕闪烁
    // Escalating feedback: special/DM counter hits are more dramatic
    if (counterHit) {
      attacker.counterGlowFrames = isDM ? 10 : isSpecial ? 8 : 6;
      const counterFlashColor = isDM ? '#ff4400' : isSpecial ? '#ff6600' : '#ff8800';
      const counterFlashAlpha = isDM ? 0.15 : isSpecial ? 0.12 : 0.08;
      const counterFlashFrames = isDM ? 6 : isSpecial ? 4 : 3;
      deps.screenFlash.trigger(counterFlashColor, counterFlashAlpha, counterFlashFrames);
      // Special/DM counter: extra impact ring
      if (isSpecial || isDM) {
        deps.vfx.spawnImpactRing(hitX, hitY, isDM ? 1.6 : 1.2);
      }
    }

    // KOF2002: 绝境反击视觉 — 攻击者低血量时命中闪现红色边框暗示危机反击
    if (attacker.health < attacker.maxHealth * 0.25 && !isDM) {
      deps.screenFlash.trigger('#ff2200', 0.06, 2);
    }

    // KOF2002: 必杀技/超必杀命中斩线 — 特殊技以上命中时产生方向性斩线
    if ((isSpecial || isDM) && !isThrowAttack(attackType)) {
      const slashColor = isDM ? (isSDM ? '#ff44ff' : '#ffaa00') : '#ffffff';
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, slashColor, isDM ? 1.2 : 0.8);
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

    // === Character-specific VFX dispatch via plugin registry ===
    const hitEffectCtx: HitEffectContext = {
      vfx: deps.vfx,
      screenShake: deps.screenShake,
      screenFlash: deps.screenFlash,
      cinematic: deps.cinematic,
      attacker,
      defender,
      attackType,
      hitX,
      hitY,
      counterHit,
      combo,
      attackDirectionBias: getAttackDirectionBias(attacker, defender, attackType, counterHit),
      defIdx,
    };
    dispatchHitVFX(hitEffectCtx);

    // === Terry 角色专属必杀技VFX — 旋风主题 ===
    // Burn Knuckle — energy fist burst
    if (atkName === 'TERRY_BURN_KNUCKLE') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(7, 6, attacker.facing * 4);
      deps.vfx.spawnProjectileExplosion(hitX, hitY, '#44aaff', '#88ddff');
    }
    // Power Wave — ground energy burst
    if (atkName === 'TERRY_POWER_WAVE') {
      deps.vfx.spawnGroundSlam(hitX, hitY);
      deps.vfx.spawnProjectileExplosion(hitX, hitY, '#ffcc22', '#ffee66');
      deps.screenShake.trigger(8, 8, attacker.facing * 4);
    }
    // Power Dunk — slam impact
    if (atkName === 'TERRY_POWER_DUNK') {
      deps.cinematic.addHitStop(2, defIdx);
      deps.vfx.spawnGroundSlam(hitX, hitY);
      deps.screenShake.trigger(10, 8, attacker.facing * 5);
    }
    // Crack Shot — sweep kick with heavy dust
    if (atkName === 'TERRY_CRACK_SHOT') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(6, 5, attacker.facing * 3);
      deps.vfx.spawnHeavyDust(hitX, hitY, 6);
    }
    // Rising Tackle — upward hit
    if (atkName === 'TERRY_RISING_TACKLE') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(6, 6, attacker.facing * 3);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.0);
    }

    // === Kim 角色专属必杀技VFX — 跆拳道主题 ===
    // Hienzan (飛燕斬) — flash kick uppercut
    if (atkName === 'KIM_HIENZAN') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(7, 6, attacker.facing * 4);
      deps.vfx.spawnImpactRing(hitX, hitY, 1.0);
    }
    // Hishou (飛翔脚) — flying kick
    if (atkName === 'KIM_HISHOU') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(6, 5, attacker.facing * 3);
    }
    // Hangetsu (半月斬) — crescent kick
    if (atkName === 'KIM_HANGETSU') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(7, 7, attacker.facing * 4);
      deps.vfx.spawnImpactRing(hitX, hitY, 0.9);
    }
    // Haki (蹴り払い) — axe kick slam
    if (atkName === 'KIM_HAKI') {
      deps.vfx.spawnHeavyDust(hitX, hitY, 4);
      deps.screenShake.trigger(5, 5, attacker.facing * 3);
    }
    // Sanren (三連撃) — triple kick combo
    if (atkName === 'KIM_SANREN') {
      deps.cinematic.addHitStop(1, defIdx);
      deps.screenShake.trigger(5, 5, attacker.facing * 3);
    }

    // DM Power Geyser (Terry) — massive ground energy eruption
    if (atkName === 'DM_POWER_GEYSER' || atkName === 'SDM_POWER_GEYSER') {
      const isGeyserSDM = atkName === 'SDM_POWER_GEYSER';
      deps.vfx.spawnDMTenHaOuVFX(hitX, hitY, attacker.charId);
      deps.vfx.spawnGroundSlam(hitX, hitY);
      deps.vfx.spawnSuperBurst(hitX, hitY, '#ffaa00', '#ffee44', isGeyserSDM);
      deps.vfx.spawnScorchMark(hitX, hitY, '#331100');
      deps.screenFlash.triggerDarken(isGeyserSDM ? 8 : 6);
      deps.screenFlash.trigger('#ffaa00', isGeyserSDM ? 0.35 : 0.25, isGeyserSDM ? 12 : 8);
      deps.screenShake.trigger(isGeyserSDM ? 16 : 14, 14, getAttackDirectionBias(attacker, defender, attackType, counterHit));
    }
    // SDM Phoenix Kick (Kim) — soaring fire kick
    if (atkName === 'SDM_PHOENIX_KICK') {
      deps.vfx.spawnSuperBurst(hitX, hitY, '#ff4400', '#ffcc44', true);
      deps.screenFlash.triggerDarken(6);
      deps.screenFlash.trigger('#ff6600', 0.3, 10);
      deps.screenShake.trigger(14, 14, getAttackDirectionBias(attacker, defender, attackType, counterHit));
    }

    // SFX
    if (isDM) {
      const isHSDM = (attackType as string).startsWith('HSDM_');
      playSuperFlash(isHSDM ? 'HSDM' : isSDM ? 'SDM' : 'DM');
      playDM();
    }
    // === Character-specific SFX dispatch via plugin registry ===
    else if (!dispatchHitSFX(hitEffectCtx) && isThrowAttack(attackType)) {
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
    else if (data.damage >= 70) playHeavyHit(1 + Math.min(data.damage - 70, 50) / 62.5, combo);
    else if (!defender.isGrounded()) playJuggleHit(combo);
    else playHit(data.damage > 50 ? 1.2 : 1.0, combo);

    // Combo milestone SFX — escalating feedback at 5/10/15+ hits
    playComboMilestone(combo);

    // 角色特有能量点缀 — 必杀技/DM命中时叠加角色属性音效
    if (isDM || isSpecial) {
      playHitAccent(attacker.charId, isDM);
    }

    // KO命中检测 — 最后一击将对手击至0血时播放KO命中音效
    const isKOHit = defender.health <= 0;
    if (isKOHit) {
      playKOHit();
      // KOF2002: KO冲击 — 击倒时屏幕裂纹+地面冲击波
      deps.vfx.spawnScreenCracks(defender.x, defender.y - defender.displayHeight / 2);
      deps.vfx.spawnGroundSlam(defender.x, defender.y);
      deps.screenFlash.trigger('#ffffff', 0.3, 4);
    }

    // Sidechain duck: manifest驱动基础值
    bgm.duck(fb.bgmDuckVolume, fb.bgmDuckDuration);
    // KOF2002: MAX模式命中时BGM更深沉地压低
    if (attacker.maxModeActive && !isDM) {
      bgm.duck(Math.max(0.4, fb.bgmDuckVolume - 0.15), fb.bgmDuckDuration + 40);
    }

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
      try { announcer.counter(); } catch { /* audio unavailable in test env */ }
      announcerOverlay.trigger('counter_hit');
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

    // 空中命中 — 按连击次数递进视觉强度
    if (!defender.isGrounded() && !isDM) {
      const airHits = defender.airHitCount;
      // 第一次浮空命中：强发光+冲击环
      if (airHits <= 1) {
        deps.vfx.spawnCharacterHitSparks(hitX, hitY - 14, 8, '#ffffff', 0.9, 1.0, 0.2, true, attacker.facing);
        deps.vfx.spawnImpactRing(hitX, hitY - 10, 0.7);
      } else if (airHits <= 3) {
        // 中段连击：蓝色渐变+递增sparks
        const sparkCount = 5 + airHits;
        deps.vfx.spawnCharacterHitSparks(hitX, hitY - 14, sparkCount, '#88ccff', 0.75, 0.85, 0.15, true, attacker.facing);
        if (airHits >= 3) deps.vfx.spawnImpactRing(hitX, hitY, 0.45);
      } else {
        // 高段连击(4+)：紫色+速度线+里程碑环
        const sparkCount = 6 + airHits;
        deps.vfx.spawnCharacterHitSparks(hitX, hitY - 14, sparkCount, '#cc88ff', 0.85, 0.95, 0.18, true, attacker.facing);
        deps.vfx.spawnImpactRing(hitX, hitY, 0.6);
      }
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
      // KOF2002: 角色专属晕眩呻吟
      playCharVoice(defender.charId, 'dizzy', 0.4);
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
    // KOF2002: Combo milestone sound at 5, 10, 15+ hits
    playComboMilestone(combo);
    // KOF2002: 高连击速度线 — combo>=6时出现背景速度线
    if (combo >= 6) {
      deps.vfx.spawnComboSpeedLines(hitX, hitY, combo);
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

    // 震屏 — manifest驱动, 垂直方向由攻击高度决定
    const comboShakeBonus = combo >= 10 ? 1 : 0;
    // 连击中震屏递减: 高连击时震屏强度逐步衰减，最低保留60%
    const comboShakeDecay = combo >= 3 ? Math.max(0.6, 1 - combo * 0.05) : 1;
    deps.screenShake.trigger(
      Math.round(calcShake(attackType, counterHit, data.damage) * comboShakeDecay) + comboShakeBonus,
      fb.shakeDuration,
      getAttackDirectionBias(attacker, defender, attackType, counterHit),
      getShakeBiasY(attackType),
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
  // KOF2002: KO落地震屏55帧, 模拟地面冲击波持续感 — 使用KO分层常量
  deps.screenShake.trigger(SHAKE_KO, SHAKE_DURATION_KO);
  // KOF2002: KO落地焦痕
  deps.vfx.spawnScorchMark(defender.x, defender.y, '#221100');
}
