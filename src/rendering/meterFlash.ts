/**
 * Meter Flash — visual feedback state for power gauge changes
 *
 * Tracks per-player flash timers that trigger when meter is gained.
 * Subscribes to MeterEventBus for automatic updates.
 */
import { getMeterEventBus } from '../core/meterEvents.js';

const FLASH_DURATION = 12;
const STOCK_FLASH_DURATION = 20;

export const meterFlashTimers = [0, 0] as [number, number];
export const meterStockFlashes = [0, 0] as [number, number];

let subscribed = false;

/** Subscribe to meter events for visual flash feedback */
export function subscribeMeterFlash(): void {
  if (subscribed) return;
  subscribed = true;
  const bus = getMeterEventBus();

  bus.on('gain', (event) => {
    if (event.source === 'hit' || event.source === 'block' || event.source === 'first_hit') {
      meterFlashTimers[event.playerIndex] = FLASH_DURATION;
    }
  });

  bus.on('stock_up', (event) => {
    meterStockFlashes[event.playerIndex] = STOCK_FLASH_DURATION;
    meterFlashTimers[event.playerIndex] = FLASH_DURATION;
  });
}

/** Tick flash timers — call once per frame */
export function tickMeterFlash(): void {
  for (let i = 0; i < 2; i++) {
    if (meterFlashTimers[i] > 0) meterFlashTimers[i]--;
    if (meterStockFlashes[i] > 0) meterStockFlashes[i]--;
  }
}
