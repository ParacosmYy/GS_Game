import type { PowerGauge, MaxModeState } from '../core/types.js';
import {
  MAX_STOCKS, METER_PER_STOCK,
  METER_GAIN_HIT, METER_GAIN_BLOCK, METER_GAIN_WHIFF, METER_GAIN_HITSTUN,
  MAX_MODE_DURATION, MAX_MODE_STOCK_COST,
} from '../core/constants.js';

/** Create initial PowerGauge state */
export function createPowerGauge(): PowerGauge {
  return { meter: 0, stocks: 0, maxMeter: METER_PER_STOCK };
}

/** Create initial MaxModeState */
export function createMaxMode(): MaxModeState {
  return { active: false, timer: 0, maxDuration: MAX_MODE_DURATION };
}

/** Add meter gain from hitting opponent */
export function gainMeterOnHit(gauge: PowerGauge): void {
  addMeter(gauge, METER_GAIN_HIT);
}

/** Add meter gain from blocking */
export function gainMeterOnBlock(gauge: PowerGauge): void {
  addMeter(gauge, METER_GAIN_BLOCK);
}

/** Add meter gain from whiffing an attack */
export function gainMeterOnWhiff(gauge: PowerGauge): void {
  addMeter(gauge, METER_GAIN_WHIFF);
}

/** Add meter gain from getting hit */
export function gainMeterOnHitstun(gauge: PowerGauge): void {
  addMeter(gauge, METER_GAIN_HITSTUN);
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
      g.meter = Math.min(METER_PER_STOCK, g.meter + 0.5);
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
