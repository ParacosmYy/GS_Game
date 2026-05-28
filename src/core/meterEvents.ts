/**
 * MeterEventBus — event bus for meter/power gauge state changes
 *
 * Decouples meter mutation from visual/audio feedback.
 * Combat/meter logic emits events; HUD/VFX/audio subscribe to them.
 *
 * Event types:
 *  - gain:          meter gained (hit/block/whiff/hitstun/auto)
 *  - spend:         stocks spent (DM/GC/taunt drain)
 *  - stock_up:      a new stock was earned (meter filled to maxMeter)
 *  - stock_down:    a stock was lost (spent/drank)
 *  - max_activate:  MAX mode activated (consumed stocks)
 *  - max_expire:    MAX mode timer expired
 *  - desperation:   fighter entered desperation range (<25% health)
 *  - full_meter:    all stocks filled (meter is maxed out)
 */
import type { PowerGauge, MaxModeState } from './types.js';
import { MAX_STOCKS } from './constants.js';

// ===== Event Types =====

export type MeterEventSource =
  | 'hit'
  | 'block'
  | 'whiff'
  | 'hitstun'
  | 'auto'
  | 'first_hit'
  | 'taunt_drain'
  | 'dm'
  | 'gc_roll'
  | 'gc_cd'
  | 'max_mode'
  | 'free_cancel'
  | 'desperation_bonus';

export interface MeterEvent {
  /** Player index (0=P1, 1=P2) */
  playerIndex: number;
  /** Event type */
  type: MeterEventType;
  /** Previous meter value (before this event) */
  prevMeter: number;
  /** Previous stock count (before this event) */
  prevStocks: number;
  /** Current meter value (after this event) */
  meter: number;
  /** Current stock count (after this event) */
  stocks: number;
  /** Maximum meter per stock */
  maxMeter: number;
  /** What caused this event */
  source: MeterEventSource;
  /** Amount of meter changed (positive=gain, negative=loss) */
  amount: number;
}

export type MeterEventType =
  | 'gain'
  | 'spend'
  | 'stock_up'
  | 'stock_down'
  | 'max_activate'
  | 'max_expire'
  | 'desperation'
  | 'full_meter';

export type MeterEventHandler = (event: MeterEvent) => void;

// ===== Event Bus =====

class MeterEventBus {
  private listeners: Map<MeterEventType, MeterEventHandler[]> = new Map();
  private allListeners: MeterEventHandler[] = [];

  /** Subscribe to a specific event type */
  on(type: MeterEventType, handler: MeterEventHandler): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(handler);
  }

  /** Subscribe to ALL meter events */
  onAny(handler: MeterEventHandler): void {
    this.allListeners.push(handler);
  }

  /** Unsubscribe from a specific event type */
  off(type: MeterEventType, handler: MeterEventHandler): void {
    const list = this.listeners.get(type);
    if (list) {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  /** Unsubscribe from all events */
  offAny(handler: MeterEventHandler): void {
    const idx = this.allListeners.indexOf(handler);
    if (idx >= 0) this.allListeners.splice(idx, 1);
  }

  /** Emit a meter event to all subscribers */
  emit(event: MeterEvent): void {
    // Type-specific listeners
    const list = this.listeners.get(event.type);
    if (list) {
      for (const handler of list) {
        handler(event);
      }
    }
    // All-event listeners
    for (const handler of this.allListeners) {
      handler(event);
    }
  }

  /** Remove all listeners */
  clear(): void {
    this.listeners.clear();
    this.allListeners = [];
  }
}

// ===== Singleton bus instance =====

let globalBus: MeterEventBus | null = null;

/** Get the global meter event bus (creates on first call) */
export function getMeterEventBus(): MeterEventBus {
  if (!globalBus) {
    globalBus = new MeterEventBus();
  }
  return globalBus;
}

/** Reset the global bus (for testing or between rounds) */
export function resetMeterEventBus(): void {
  if (globalBus) {
    globalBus.clear();
  }
  globalBus = null;
}

// ===== Snapshot helper =====

/** Capture a gauge snapshot for before/after comparison */
export interface GaugeSnapshot {
  meter: number;
  stocks: number;
}

/** Take a snapshot of a gauge's current state */
export function snapshotGauge(gauge: PowerGauge): GaugeSnapshot {
  return { meter: gauge.meter, stocks: gauge.stocks };
}

/** Emit events based on gauge state change */
export function emitGaugeChange(
  playerIndex: number,
  before: GaugeSnapshot,
  after: PowerGauge,
  source: MeterEventSource,
): void {
  const bus = getMeterEventBus();
  const meterDelta = after.meter - before.meter;
  const stocksDelta = after.stocks - before.stocks;

  // Total meter change including stock conversions
  // (stocks * maxMeter + meter) gives the total accumulated value
  const totalBefore = before.stocks * after.maxMeter + before.meter;
  const totalAfter = after.stocks * after.maxMeter + after.meter;
  const totalDelta = totalAfter - totalBefore;

  // Stock gained
  if (stocksDelta > 0) {
    bus.emit({
      playerIndex,
      type: 'stock_up',
      prevMeter: before.meter,
      prevStocks: before.stocks,
      meter: after.meter,
      stocks: after.stocks,
      maxMeter: after.maxMeter,
      source,
      amount: stocksDelta,
    });
  }

  // Stock lost
  if (stocksDelta < 0) {
    bus.emit({
      playerIndex,
      type: 'stock_down',
      prevMeter: before.meter,
      prevStocks: before.stocks,
      meter: after.meter,
      stocks: after.stocks,
      maxMeter: after.maxMeter,
      source,
      amount: stocksDelta,
    });
  }

  // Meter gained (total value increased)
  if (totalDelta > 0) {
    bus.emit({
      playerIndex,
      type: 'gain',
      prevMeter: before.meter,
      prevStocks: before.stocks,
      meter: after.meter,
      stocks: after.stocks,
      maxMeter: after.maxMeter,
      source,
      amount: totalDelta,
    });
  }

  // Meter spent (total value decreased)
  if (totalDelta < 0) {
    bus.emit({
      playerIndex,
      type: 'spend',
      prevMeter: before.meter,
      prevStocks: before.stocks,
      meter: after.meter,
      stocks: after.stocks,
      maxMeter: after.maxMeter,
      source,
      amount: totalDelta,
    });
  }

  // Full meter: all stocks filled
  if (after.stocks >= MAX_STOCKS && before.stocks < MAX_STOCKS) {
    bus.emit({
      playerIndex,
      type: 'full_meter',
      prevMeter: before.meter,
      prevStocks: before.stocks,
      meter: after.meter,
      stocks: after.stocks,
      maxMeter: after.maxMeter,
      source,
      amount: MAX_STOCKS - before.stocks,
    });
  }
}

/** Emit MAX mode activation event */
export function emitMaxActivate(
  playerIndex: number,
  gauge: PowerGauge,
  maxMode: MaxModeState,
): void {
  getMeterEventBus().emit({
    playerIndex,
    type: 'max_activate',
    prevMeter: gauge.meter,
    prevStocks: gauge.stocks + 3, // 3 stocks were spent
    meter: gauge.meter,
    stocks: gauge.stocks,
    maxMeter: gauge.maxMeter,
    source: 'max_mode',
    amount: 3,
  });
}

/** Emit MAX mode expiration event */
export function emitMaxExpire(playerIndex: number): void {
  getMeterEventBus().emit({
    playerIndex,
    type: 'max_expire',
    prevMeter: 0,
    prevStocks: 0,
    meter: 0,
    stocks: 0,
    maxMeter: 100,
    source: 'max_mode',
    amount: 0,
  });
}

/** Emit desperation mode event */
export function emitDesperation(
  playerIndex: number,
  gauge: PowerGauge,
  health: number,
  maxHealth: number,
): void {
  getMeterEventBus().emit({
    playerIndex,
    type: 'desperation',
    prevMeter: gauge.meter,
    prevStocks: gauge.stocks,
    meter: gauge.meter,
    stocks: gauge.stocks,
    maxMeter: gauge.maxMeter,
    source: 'desperation_bonus',
    amount: Math.round(health / maxHealth * 100),
  });
}

// Re-export types for convenience
export type { PowerGauge, MaxModeState };
