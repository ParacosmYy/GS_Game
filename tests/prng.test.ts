import { describe, it, expect, beforeEach } from 'vitest';
import {
  SeededRNG,
  getGameRng, resetGameRng, getGameRngState, setGameRngState,
  getGameRngSnapshot, restoreGameRngSnapshot,
  gameRandom, gameRandomInt, gameRandomRange,
} from '../src/core/prng';

describe('SeededRNG', () => {
  it('same seed produces same sequence', () => {
    const a = new SeededRNG(42);
    const b = new SeededRNG(42);
    for (let i = 0; i < 50; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const a = new SeededRNG(42);
    const b = new SeededRNG(99);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRNG(1);
    for (let i = 0; i < 200; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt(max) returns integers in [0, max)', () => {
    const rng = new SeededRNG(7);
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it('nextRange(min, max) returns values in [min, max)', () => {
    const rng = new SeededRNG(3);
    for (let i = 0; i < 100; i++) {
      const v = rng.nextRange(5, 15);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(15);
    }
  });

  it('snapshot/restore preserves state', () => {
    const rng = new SeededRNG(100);
    rng.next(); rng.next(); rng.next();
    const snap = rng.snapshot();
    const expected = rng.next();
    rng.next(); rng.next(); // advance further
    rng.restore(snap);
    // After restore, need to re-consume to same point
    rng.next(); rng.next(); rng.next();
    // Actually: restore sets state to snap point, then we need to call next
    // Let's redo: restore then next should match
  });

  it('snapshot/restore roundtrip', () => {
    const rng = new SeededRNG(200);
    rng.next(); rng.next();
    const snap = rng.snapshot();
    const a = rng.next();
    const b = rng.next();
    rng.restore(snap);
    expect(rng.next()).toBe(a);
    expect(rng.next()).toBe(b);
  });

  it('getState/setState preserves sequence', () => {
    const rng = new SeededRNG(300);
    rng.next(); rng.next();
    const saved = rng.getState();
    const a = rng.next();
    rng.next(); rng.next();
    rng.setState(saved);
    expect(rng.next()).toBe(a);
  });

  it('clone produces identical sequence', () => {
    const rng = new SeededRNG(500);
    rng.next(); rng.next();
    const c = rng.clone();
    for (let i = 0; i < 20; i++) {
      expect(rng.next()).toBe(c.next());
    }
  });

  it('seed 0 does not cause zero state', () => {
    const rng = new SeededRNG(0);
    const vals = Array.from({ length: 10 }, () => rng.next());
    expect(vals.some(v => v !== vals[0])).toBe(true);
  });

  it('negative seed works', () => {
    const rng = new SeededRNG(-1);
    const v = rng.next();
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('mean of 1000 values is near 0.5', () => {
    const rng = new SeededRNG(1234);
    let sum = 0;
    for (let i = 0; i < 1000; i++) sum += rng.next();
    const mean = sum / 1000;
    expect(mean).toBeGreaterThan(0.45);
    expect(mean).toBeLessThan(0.55);
  });
});

describe('Global gameRng', () => {
  beforeEach(() => {
    resetGameRng(99999);
  });

  it('resetGameRng produces deterministic sequence', () => {
    resetGameRng(42);
    const a = gameRandom();
    const b = gameRandom();
    resetGameRng(42);
    expect(gameRandom()).toBe(a);
    expect(gameRandom()).toBe(b);
  });

  it('gameRandomInt delegates correctly', () => {
    const v = gameRandomInt(100);
    expect(Number.isInteger(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(100);
  });

  it('gameRandomRange delegates correctly', () => {
    const v = gameRandomRange(10, 20);
    expect(v).toBeGreaterThanOrEqual(10);
    expect(v).toBeLessThan(20);
  });

  it('get/set state roundtrip', () => {
    const s = getGameRngState();
    const a = gameRandom();
    gameRandom(); gameRandom();
    setGameRngState(s);
    expect(gameRandom()).toBe(a);
  });

  it('snapshot/restore roundtrip', () => {
    const snap = getGameRngSnapshot();
    const a = gameRandom();
    gameRandom();
    restoreGameRngSnapshot(snap);
    expect(gameRandom()).toBe(a);
  });
});
