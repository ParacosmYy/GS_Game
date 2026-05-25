import type { PowerGauge, MaxModeState } from '../core/types.js';
import { AttackType } from '../core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK,
  METER_GAIN_HIT, METER_GAIN_BLOCK, METER_GAIN_WHIFF, METER_GAIN_HITSTUN,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
} from '../core/constants.js';
import { isDM, isCharacterSpecial } from '../core/attackClassifier.js';

// KOF2002: 气槽增益按攻击类型差异化
// 基准: light=60%, heavy=100%, command=120%, special=150%, DM=200%
function meterGainForAttack(base: number, attackType: AttackType): number {
  const name = attackType as string;
  if (isDM(name)) return Math.round(base * 2.0);
  if (isCharacterSpecial(name) || name === 'SPECIAL_UPPER' || name === 'SPECIAL_PROJECTILE') return Math.round(base * 1.5);
  if (name.startsWith('CMD_') || name === 'STAND_CD' || name === 'JUMP_CD') return Math.round(base * 1.2);
  if (name.startsWith('CLOSE_C') || name.startsWith('CLOSE_D') || name.startsWith('STAND_C') || name.startsWith('STAND_D')
    || name.startsWith('CROUCH_C') || name.startsWith('CROUCH_D')) return base;
  if (name.startsWith('JUMP_C') || name.startsWith('JUMP_D')) return base;
  return Math.round(base * 0.6); // light attacks
}

/** Create initial PowerGauge state */
export function createPowerGauge(): PowerGauge {
  return { meter: 0, stocks: 0, maxMeter: METER_PER_STOCK };
}

/** Create initial MaxModeState */
export function createMaxMode(): MaxModeState {
  return { active: false, timer: 0, maxDuration: MAX_MODE_DURATION };
}

/** Add meter gain from hitting opponent */
export function gainMeterOnHit(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C): void {
  addMeter(gauge, meterGainForAttack(METER_GAIN_HIT, attackType));
}

/** Add meter gain from having attack blocked */
export function gainMeterOnBlock(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C): void {
  addMeter(gauge, meterGainForAttack(METER_GAIN_BLOCK, attackType));
}

/** Add meter gain from whiffing an attack */
export function gainMeterOnWhiff(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C): void {
  addMeter(gauge, meterGainForAttack(METER_GAIN_WHIFF, attackType));
}

/** Add meter gain from getting hit (defender side) */
export function gainMeterOnHitstun(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C): void {
  addMeter(gauge, meterGainForAttack(METER_GAIN_HITSTUN, attackType));
}

/** Spend stocks for a move. Returns true if enough stocks */
export function spendStocks(gauge: PowerGauge, cost: number): boolean {
  if (gauge.stocks >= cost) {
    gauge.stocks -= cost;
    return true;
  }
  return false;
}

/** Activate MAX mode. Returns true if activation succeeded */
export function activateMaxMode(gauge: PowerGauge, maxMode: MaxModeState): boolean {
  if (maxMode.active) return false;
  if (!spendStocks(gauge, MAX_MODE_STOCK_COST)) return false;
  maxMode.active = true;
  maxMode.timer = maxMode.maxDuration;
  return true;
}

/** Tick MAX mode timer */
export function tickMaxMode(maxMode: MaxModeState): void {
  if (!maxMode.active) return;
  maxMode.timer--;
  if (maxMode.timer <= 0) {
    maxMode.active = false;
    maxMode.timer = 0;
  }
}

/** 风云再起 auto meter regen — called every frame */
export function tickAutoMeter(gauges: [PowerGauge, PowerGauge]): void {
  for (const g of gauges) {
    if (g.stocks < MAX_STOCKS) {
      // KOF2002风云再起模式: 快速回气 (100点/3.3秒 ≈ 0.5/frame → 加速到1.0/frame)
      g.meter = Math.min(METER_PER_STOCK, g.meter + 1.0);
      if (g.meter >= METER_PER_STOCK && g.stocks < MAX_STOCKS) {
        g.stocks++;
        g.meter = 0;
      }
    }
  }
}

/** Reset gauge and MAX mode */
export function resetMeterSystem(gauge: PowerGauge, maxMode: MaxModeState): void {
  gauge.meter = 0;
  gauge.stocks = 0;
  maxMode.active = false;
  maxMode.timer = 0;
}

/** KOF2002: Taunt drains opponent's meter — about 1 stock's worth over the taunt duration */
export function drainMeterByTaunt(gauge: PowerGauge): void {
  if (gauge.stocks > 0) {
    gauge.meter -= METER_PER_STOCK * 0.8;
    if (gauge.meter < 0) {
      gauge.stocks = Math.max(0, gauge.stocks - 1);
      gauge.meter = Math.max(0, gauge.meter + METER_PER_STOCK);
    }
  } else {
    gauge.meter = Math.max(0, gauge.meter - METER_PER_STOCK * 0.3);
  }
}

function addMeter(gauge: PowerGauge, amount: number): void {
  gauge.meter += amount;
  while (gauge.meter >= gauge.maxMeter && gauge.stocks < MAX_STOCKS) {
    gauge.meter -= gauge.maxMeter;
    gauge.stocks++;
  }
  if (gauge.stocks >= MAX_STOCKS) {
    gauge.stocks = MAX_STOCKS;
    gauge.meter = Math.min(gauge.meter, gauge.maxMeter - 1);
  }
}
