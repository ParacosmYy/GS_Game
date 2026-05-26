import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';

describe('commandBuffer', () => {
  it('can be instantiated', () => {
    const cb = new CommandBuffer();
    expect(cb).toBeDefined();
  });

  it('reset clears state', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 2);
    cb.reset();
    expect(cb.getRecentHistory(10)).toEqual([]);
  });

  it('record stores direction', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 2);
    const hist = cb.getRecentHistory(10);
    expect(hist.length).toBeGreaterThanOrEqual(2);
  });

  it('neutral not stored', () => {
    const cb = new CommandBuffer();
    cb.record('neutral', 1);
    expect(cb.getRecentHistory(10)).toEqual([]);
  });

  it('getRecentHistory returns array', () => {
    const cb = new CommandBuffer();
    const result = cb.getRecentHistory(5);
    expect(Array.isArray(result)).toBe(true);
  });

  it('checkSpecial returns null with no input', () => {
    const cb = new CommandBuffer();
    expect(cb.checkSpecial(0, false)).toBeNull();
  });

  it('getChargeState returns object', () => {
    const cb = new CommandBuffer();
    const state = cb.getChargeState('down');
    expect(state).toBeDefined();
    expect(typeof state.frames).toBe('number');
  });

  it('hasQCF false with no input', () => {
    const cb = new CommandBuffer();
    expect(cb.hasQCF(0)).toBe(false);
  });
});
