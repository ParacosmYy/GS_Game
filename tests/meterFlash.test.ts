/**
 * Meter Flash Regression Test
 * Verifies meter flash timer lifecycle: tick, drain, independence.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  meterFlashTimers,
  meterStockFlashes,
  tickMeterFlash,
} from '../src/rendering/meterFlash.js';

describe('Meter Flash timers', () => {
  beforeEach(() => {
    meterFlashTimers[0] = 0;
    meterFlashTimers[1] = 0;
    meterStockFlashes[0] = 0;
    meterStockFlashes[1] = 0;
  });

  it('tickMeterFlash decrements positive timers', () => {
    meterFlashTimers[0] = 5;
    meterStockFlashes[1] = 3;
    tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(4);
    expect(meterStockFlashes[1]).toBe(2);
  });

  it('tickMeterFlash does not go below zero', () => {
    tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(0);
    expect(meterStockFlashes[0]).toBe(0);
  });

  it('tickMeterFlash fully drains timers', () => {
    meterFlashTimers[0] = 3;
    for (let i = 0; i < 5; i++) tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(0);
  });

  it('stock flash drains slower than meter flash', () => {
    meterFlashTimers[0] = 12;
    meterStockFlashes[0] = 20;
    for (let i = 0; i < 12; i++) tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(0);
    expect(meterStockFlashes[0]).toBe(8);
  });

  it('both players tick independently', () => {
    meterFlashTimers[0] = 5;
    meterFlashTimers[1] = 10;
    tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(4);
    expect(meterFlashTimers[1]).toBe(9);
  });

  it('both stock flashes tick independently', () => {
    meterStockFlashes[0] = 8;
    meterStockFlashes[1] = 15;
    tickMeterFlash();
    expect(meterStockFlashes[0]).toBe(7);
    expect(meterStockFlashes[1]).toBe(14);
  });

  it('stock flash fully drains to zero', () => {
    meterStockFlashes[0] = 5;
    for (let i = 0; i < 10; i++) tickMeterFlash();
    expect(meterStockFlashes[0]).toBe(0);
  });

  it('mixed meter and stock timers drain together', () => {
    meterFlashTimers[0] = 3;
    meterStockFlashes[0] = 7;
    for (let i = 0; i < 3; i++) tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(0);
    expect(meterStockFlashes[0]).toBe(4);
  });

  it('large tick count does not cause negative values', () => {
    meterFlashTimers[0] = 1;
    meterStockFlashes[0] = 1;
    for (let i = 0; i < 100; i++) tickMeterFlash();
    expect(meterFlashTimers[0]).toBe(0);
    expect(meterStockFlashes[0]).toBe(0);
  });
});
