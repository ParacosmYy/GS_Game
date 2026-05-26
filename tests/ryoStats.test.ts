import { describe, it, expect } from 'vitest';
import { RYO_STATS } from '../src/content/characters/ryo/stats.js';

describe('ryoStats', () => {
  it('RYO_STATS is defined', () => {
    expect(RYO_STATS).toBeDefined();
    expect(typeof RYO_STATS).toBe('object');
  });
  it('has walkSpeed', () => {
    expect(typeof RYO_STATS.walkSpeed).toBe('number');
  });
  it('has runSpeed', () => {
    expect(typeof RYO_STATS.runSpeed).toBe('number');
  });
  it('has jumpVelocity', () => {
    expect(typeof RYO_STATS.jumpVelocity).toBe('number');
  });
  it('has maxHealth', () => {
    expect(typeof RYO_STATS.maxHealth).toBe('number');
  });
  it('has hopVelocity', () => {
    expect(typeof RYO_STATS.hopVelocity).toBe('number');
  });
});
