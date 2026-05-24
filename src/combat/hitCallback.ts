/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType } from '../core/types.js';
import { FRAME_DATA, STAGE_WIDTH } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter, playHeavyHit, playSuperFlash, playWire, playJuggleHit } from '../audio/sfx.js';
import type { CinematicState } from '../state/cinematicState.js';

function classifyAttack(at: AttackType) {
  const s = at as string;
  const isDM = s.startsWith('DM_');
  const isSpecial = at === AttackType.SPECIAL_PROJECTILE || at === AttackType.SPECIAL_UPPER
    || s.startsWith('KYO_') || s.startsWith('IORI_') || s.startsWith('TERRY_') || s.startsWith('KIM_')
    || s.startsWith('RYO_') || s.startsWith('LEONA_') || s.startsWith('KDASH_') || s.startsWith('KULA_');
  const isPunch = s.endsWith('_A') || s.endsWith('_C') || s.includes('ARAGAMI') || s.includes('DOKUGAMI')
    || s.includes('ONIYAKI') || s.includes('KOTOTSUKI') || s.includes('KUZUKAZE')
    || s.includes('BURN_KNUCKLE') || s.includes('RISING_TACKLE') || s.includes('POWER_DUNK')
    || s.includes('SANREN') || s.includes('TSUMIYOMI') || s.includes('BATSUYOMI');
  return { isDM, isSpecial, isPunch };
}

function calcHitStop(at: AttackType, isDM: boolean, isSpecial: boolean, ch: boolean): number {
  const heavy = at === AttackType.STAND_C || at === AttackType.STAND_D || at === AttackType.CLOSE_C
    || at === AttackType.CLOSE_D || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D;
  // KOF2002标准: 轻攻击4F, 重攻击8F, 必杀技6F, 超必杀12F, Counter+3F
  const r = isDM ? 12 : isSpecial ? 6 : heavy ? 8 : 4;
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
      deps.vfx.spawnBlockFlash(hitX, hitY);
      // 防御顿帧: 重攻击5F, 轻攻击3F (比命中略短)
      const { isSpecial: blkSpecial } = classifyAttack(attackType);
      const blkHeavy = attackType === AttackType.STAND_C || attackType === AttackType.STAND_D
        || attackType === AttackType.CLOSE_C || attackType === AttackType.CLOSE_D
        || attackType === AttackType.CROUCH_C || attackType === AttackType.CROUCH_D;
      const blkStop = blkSpecial ? 5 : blkHeavy ? 5 : 3;
      deps.cinematic.triggerHitStop(blkStop);
      deps.screenShake.trigger(blkSpecial ? 5 : blkHeavy ? 4 : 2, 6);
      gainMeterOnBlock(deps.gauges[atkIdx]);
      gainMeterOnHitstun(deps.gauges[defIdx]);
      playBlock();
      return;
    }

    const { isDM, isSpecial } = classifyAttack(attackType);
    deps.cinematic.triggerHitStop(calcHitStop(attackType, isDM, isSpecial, counterHit));
    gainMeterOnHit(deps.gauges[atkIdx]);
    gainMeterOnHitstun(deps.gauges[defIdx]);

    const atkChar = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    const { isPunch } = classifyAttack(attackType);
    const sparks = isDM ? 20 : isSpecial ? 14 : counterHit ? 12 : 8;
    const sparkColor = isSpecial ? atkChar.specialColor : isPunch ? '#ffdd44' : '#44ddff';
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, sparkColor);
    deps.vfx.spawnImpactRing(hitX, hitY);

    // 重攻击斩击线
    if (isHeavyAttack(attackType) || isSpecial) {
      deps.vfx.spawnSlashLine(hitX, hitY, attacker.facing, sparkColor);
    }

    // DM: 超必杀华丽爆发 + 全屏闪白
    if (isDM) {
      deps.vfx.spawnSuperBurst(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
      deps.screenFlash.trigger('#ffffff', 0.35, 10);
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
    else if (attackType === AttackType.THROW) playThrow();
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
      deps.screenFlash.trigger('#ff6600', 0.2, 6);
      deps.screenShake.trigger(10, 10);
      playWire();
    }

    // 飞行道具爆炸
    if (attackType === AttackType.SPECIAL_PROJECTILE) {
      deps.vfx.spawnProjectileExplosion(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
    }

    // 连击数
    const combo = deps.combatSystem.getComboCount(defIdx);
    if (combo >= 2) deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, combo);

    deps.screenShake.trigger(calcShake(attackType, counterHit, data.damage), 8);
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
