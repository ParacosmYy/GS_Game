/** Hit callback factory — extracts onHit() from main.ts into a pure, testable module. */

import type { HitCallback } from './combatSystem.js';
import { CombatSystem } from './combatSystem.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem, ScreenShake } from '../rendering/vfx.js';
import type { PowerGauge } from '../core/types.js';
import { AttackType } from '../core/types.js';
import { FRAME_DATA, STAGE_WIDTH } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun } from './meter.js';
import { playHit, playBlock, playSpecial, playDM, playThrow, playCounter } from '../audio/sfx.js';
import type { CinematicState } from '../state/cinematicState.js';

/** Classify attack as DM / special */
function classifyAttack(at: AttackType) {
  const s = at as string;
  const isDM = at === AttackType.DM_OROCHINAGI || at === AttackType.DM_YATAGARASU
    || at === AttackType.DM_POWER_GEYSER || at === AttackType.DM_PHOENIX_KICK;
  const isSpecial = at === AttackType.SPECIAL_PROJECTILE || at === AttackType.SPECIAL_UPPER
    || s.startsWith('KYO_') || s.startsWith('IORI_') || s.startsWith('TERRY_') || s.startsWith('KIM_');
  return { isDM, isSpecial };
}

/** Hit-stop freeze frames */
function calcHitStop(at: AttackType, isDM: boolean, isSpecial: boolean, ch: boolean): number {
  const heavy = at === AttackType.STAND_C || at === AttackType.STAND_D || at === AttackType.CLOSE_C
    || at === AttackType.CLOSE_D || at === AttackType.CROUCH_C || at === AttackType.CROUCH_D
    || at === AttackType.JUMP_C || at === AttackType.JUMP_D;
  const r = isDM ? 8 : isSpecial ? 6 : heavy ? 5 : 3;
  return ch ? r + 2 : r;
}

/** Screen shake intensity */
function calcShake(at: AttackType, ch: boolean, dmg: number): number {
  return at === AttackType.DM_OROCHINAGI ? 14 : at === AttackType.SPECIAL_UPPER ? 8
    : at === AttackType.THROW ? 6 : ch ? 7
    : at === AttackType.STAND_C || at === AttackType.STAND_D ? 5 : dmg > 50 ? 4 : 3;
}

export interface HitCallbackDeps {
  fighters: [Fighter, Fighter];
  vfx: VFXSystem;
  screenShake: ScreenShake;
  gauges: [PowerGauge, PowerGauge];
  cinematic: CinematicState;
  combatSystem: CombatSystem;
}

/** Create the onHit callback used by CombatSystem.resolveAttacks(). */
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
      deps.screenShake.trigger(3, 4);
      gainMeterOnBlock(deps.gauges[atkIdx]);
      gainMeterOnHitstun(deps.gauges[defIdx]);
      playBlock();
      return;
    }

    const { isDM, isSpecial } = classifyAttack(attackType);
    deps.cinematic.triggerHitStop(calcHitStop(attackType, isDM, isSpecial, counterHit));
    gainMeterOnHit(deps.gauges[atkIdx]);
    gainMeterOnHitstun(deps.gauges[defIdx]);

    // VFX: character-specific hit sparks + impact ring + damage number
    const atkChar = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    const sparks = attackType === AttackType.SPECIAL_UPPER ? 14 : isDM ? 20 : counterHit ? 12 : 8;
    deps.vfx.spawnCharacterHitSparks(hitX, hitY, sparks, atkChar.specialColor);
    deps.vfx.spawnImpactRing(hitX, hitY);
    deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage);

    // Rekka finisher: enhanced explosion VFX
    const isRekkaFinisher = attackType === AttackType.KYO_NANASE
      || attackType === AttackType.KYO_KOTO_TSUKI
      || attackType === AttackType.KYO_YAKISOGI
      || attackType === AttackType.KYO_BATSUYOMI;
    if (isRekkaFinisher) {
      deps.vfx.spawnCharacterHitSparks(hitX, hitY, 16, atkChar.specialGlow);
      deps.screenShake.trigger(8, 10);
    }

    // SFX
    if (isDM) playDM();
    else if (attackType === AttackType.THROW) playThrow();
    else if (isSpecial) playSpecial();
    else playHit(data.damage > 60 ? 1.3 : 1.0);

    if (counterHit) { deps.vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55); playCounter(); }
    if (counterHit && (data as { counterWire?: boolean }).counterWire) {
      const wallX = defender.x <= STAGE_WIDTH / 2 ? 30 : STAGE_WIDTH - 30;
      deps.vfx.spawnCounterWireSparks(wallX, defender.y - defender.displayHeight / 2);
      deps.screenShake.trigger(10, 10);
    }
    // Projectile impact explosion (enhanced over normal sparks)
    if (attackType === AttackType.SPECIAL_PROJECTILE) {
      deps.vfx.spawnProjectileExplosion(hitX, hitY, atkChar.specialColor, atkChar.specialGlow);
    }
    const combo = deps.combatSystem.getComboCount(defIdx);
    if (combo >= 2) deps.vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, combo);
    deps.screenShake.trigger(calcShake(attackType, counterHit, data.damage), 8);
    deps.cinematic.trackDamage(defIdx, data.damage);
  };
}
