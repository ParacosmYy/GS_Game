import { describe, it, expect } from 'vitest';
import {
  SeededRNG,
  gameRandom,
  getGameRngSnapshot,
  resetGameRng,
  restoreGameRngSnapshot,
} from '../src/core/prng.js';

describe('SeededRNG', () => {
  it('snapshot/restore should rewind an instance to the same random stream', () => {
    const rng = new SeededRNG(123456);
    const snapshot = rng.snapshot();
    const first = rng.next();
    const second = rng.next();

    rng.restore(snapshot);

    expect(rng.next()).toBe(first);
    expect(rng.next()).toBe(second);
  });
});

describe('gameRng', () => {
  it('snapshot/restore should preserve the global sequence', () => {
    resetGameRng(20240526);
    const snapshot = getGameRngSnapshot();
    const first = gameRandom();
    const second = gameRandom();

    restoreGameRngSnapshot(snapshot);

    expect(gameRandom()).toBe(first);
    expect(gameRandom()).toBe(second);
  });
});
