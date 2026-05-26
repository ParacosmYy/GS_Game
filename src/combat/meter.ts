import type { PowerGauge, MaxModeState } from '../core/types.js';
import { AttackType } from '../core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK,
  METER_GAIN_HIT, METER_GAIN_BLOCK, METER_GAIN_WHIFF, METER_GAIN_HITSTUN,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
  DESPERATION_HEALTH_THRESHOLD, DESPERATION_METER_GAIN_BONUS,
  GC_ROLL_STOCK_COST, GC_CD_STOCK_COST,
} from '../core/constants.js';
import { isDM, isCharacterSpecial } from '../core/attackClassifier.js';
import { snapshotGauge, emitGaugeChange, emitMaxActivate, emitMaxExpire } from '../core/meterEvents.js';
import type { MeterEventSource } from '../core/meterEvents.js';

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

/** Check if a fighter is in desperation mode (health < 25% maxHealth) */
export function isDesperation(health: number, maxHealth: number): boolean {
  return maxHealth > 0 && health > 0 && health / maxHealth < DESPERATION_HEALTH_THRESHOLD;
}

/** Add meter gain from hitting opponent. Optionally apply desperation bonus. */
export function gainMeterOnHit(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C, health?: number, maxHealth?: number, playerIndex: number = -1): void {
  const before = snapshotGauge(gauge);
  let gain = meterGainForAttack(METER_GAIN_HIT, attackType);
  if (health !== undefined && maxHealth !== undefined && isDesperation(health, maxHealth)) {
    gain = Math.round(gain * DESPERATION_METER_GAIN_BONUS);
  }
  addMeter(gauge, gain);
  if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, 'hit');
}

/** Add meter gain from having attack blocked */
export function gainMeterOnBlock(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C, playerIndex: number = -1): void {
  const before = snapshotGauge(gauge);
  addMeter(gauge, meterGainForAttack(METER_GAIN_BLOCK, attackType));
  if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, 'block');
}

/** Add meter gain from whiffing a special move (small gain) */
export function gainMeterOnWhiff(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C, playerIndex: number = -1): void {
  // KOF2002: whiff meter gain only for specials/DMs, not normals
  const name = attackType as string;
  if (!isCharacterSpecial(name) && name !== 'SPECIAL_UPPER' && name !== 'SPECIAL_PROJECTILE' && !isDM(name)) {
    return; // normals give zero meter on whiff
  }
  const before = snapshotGauge(gauge);
  addMeter(gauge, meterGainForAttack(METER_GAIN_WHIFF, attackType));
  if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, 'whiff');
}

/** Add meter gain from getting hit (defender side). Optionally apply desperation bonus. */
export function gainMeterOnHitstun(gauge: PowerGauge, attackType: AttackType = AttackType.STAND_C, health?: number, maxHealth?: number, playerIndex: number = -1): void {
  const before = snapshotGauge(gauge);
  let gain = meterGainForAttack(METER_GAIN_HITSTUN, attackType);
  // Desperation bonus: defender gains meter faster when low health
  if (health !== undefined && maxHealth !== undefined && isDesperation(health, maxHealth)) {
    gain = Math.round(gain * DESPERATION_METER_GAIN_BONUS);
  }
  addMeter(gauge, gain);
  if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, 'hitstun');
}

/** Spend stocks for a move. Returns true if enough stocks */
export function spendStocks(gauge: PowerGauge, cost: number, playerIndex: number = -1, source: MeterEventSource = 'dm'): boolean {
  if (gauge.stocks >= cost) {
    const before = snapshotGauge(gauge);
    gauge.stocks -= cost;
    if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, source);
    return true;
  }
  return false;
}

/** Spend stocks for Guard Cancel Roll. Returns true if enough stocks. */
export function spendGCRoll(gauge: PowerGauge, playerIndex: number = -1): boolean {
  return spendStocks(gauge, GC_ROLL_STOCK_COST, playerIndex, 'gc_roll');
}

/** Spend stocks for Guard Cancel CD. Returns true if enough stocks. */
export function spendGCCD(gauge: PowerGauge, playerIndex: number = -1): boolean {
  return spendStocks(gauge, GC_CD_STOCK_COST, playerIndex, 'gc_cd');
}

/** Activate MAX mode. Returns true if activation succeeded.
 *  KOF2002正版: costs 3 stocks in Advanced mode. */
export function activateMaxMode(gauge: PowerGauge, maxMode: MaxModeState, playerIndex: number = -1): boolean {
  if (maxMode.active) return false;
  if (!spendStocks(gauge, MAX_MODE_STOCK_COST, playerIndex, 'max_mode')) return false;
  maxMode.active = true;
  maxMode.timer = maxMode.maxDuration;
  if (playerIndex >= 0) emitMaxActivate(playerIndex, gauge, maxMode);
  return true;
}

/** Tick MAX mode timer */
export function tickMaxMode(maxMode: MaxModeState, playerIndex: number = -1): void {
  if (!maxMode.active) return;
  maxMode.timer--;
  if (maxMode.timer <= 0) {
    maxMode.active = false;
    maxMode.timer = 0;
    if (playerIndex >= 0) emitMaxExpire(playerIndex);
  }
}

/**
 * Spend MAX mode timer by a percentage of the full duration.
 * Returns true if MAX mode was active and timer was consumed.
 */
export function drainMaxModeTimer(maxMode: MaxModeState, ratio: number): boolean {
  if (!maxMode.active) return false;
  const drain = Math.max(1, Math.round(maxMode.maxDuration * ratio));
  maxMode.timer = Math.max(0, maxMode.timer - drain);
  if (maxMode.timer <= 0) {
    maxMode.active = false;
    maxMode.timer = 0;
  }
  return true;
}

/** 风云再起 auto meter regen — called every frame */
export function tickAutoMeter(gauges: [PowerGauge, PowerGauge]): void {
  for (let i = 0; i < gauges.length; i++) {
    const g = gauges[i];
    if (g.stocks < MAX_STOCKS) {
      const before = snapshotGauge(g);
      // KOF2002风云再起模式: 快速回气 (100点/3.3秒 ≈ 0.5/frame → 加速到1.0/frame)
      g.meter = Math.min(METER_PER_STOCK, g.meter + 1.0);
      if (g.meter >= METER_PER_STOCK && g.stocks < MAX_STOCKS) {
        g.stocks++;
        g.meter = 0;
      }
      if (before.meter !== g.meter || before.stocks !== g.stocks) {
        emitGaugeChange(i, before, g, 'auto');
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
export function drainMeterByTaunt(gauge: PowerGauge, playerIndex: number = -1): void {
  const before = snapshotGauge(gauge);
  if (gauge.stocks > 0) {
    gauge.meter -= METER_PER_STOCK * 0.8;
    if (gauge.meter < 0) {
      gauge.stocks = Math.max(0, gauge.stocks - 1);
      gauge.meter = Math.max(0, gauge.meter + METER_PER_STOCK);
    }
  } else {
    gauge.meter = Math.max(0, gauge.meter - METER_PER_STOCK * 0.3);
  }
  if (playerIndex >= 0) emitGaugeChange(playerIndex, before, gauge, 'taunt_drain');
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
