import { describe, it, expect } from 'vitest';
import { InputLogger } from '../src/core/inputLog.js';
import type { PlayerInput } from '../src/core/types.js';

function createInput(overrides: Partial<PlayerInput> = {}): PlayerInput {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    start: false,
    ...overrides,
  };
}

describe('InputLogger', () => {
  it('dump/load should preserve frames, meta, and rng snapshot', () => {
    const logger = new InputLogger();
    const p1 = createInput({ right: true, buttonA: true });
    const p2 = createInput({ left: true, buttonB: true });

    logger.setMeta({
      rngSeed: 20240526,
      label: 'round-1',
      source: 'live',
    });
    logger.setRngSnapshot({ state: 0xdeadbeef });
    logger.record(10, p1, p2);
    logger.record(11, createInput({ down: true }), createInput({ up: true }));

    const dumped = logger.dump();
    const restored = new InputLogger();

    expect(restored.load(dumped)).toBe(true);
    expect(restored.length).toBe(2);
    expect(restored.getFrame(10)).toEqual({
      tick: 10,
      p1,
      p2,
    });
    expect(restored.getFrame(11)).toEqual({
      tick: 11,
      p1: createInput({ down: true }),
      p2: createInput({ up: true }),
    });
    expect(restored.getMeta()).toEqual({
      rngSeed: 20240526,
      label: 'round-1',
      source: 'live',
      rngState: 0xdeadbeef,
    });
    expect(restored.getRngSnapshot()).toEqual({ state: 0xdeadbeef });
  });

  it('load should keep v1 compatibility and drop absent meta', () => {
    const logger = new InputLogger();
    const loaded = logger.load(JSON.stringify({
      version: 1,
      frames: [
        {
          tick: 1,
          p1: createInput({ right: true }),
          p2: createInput({ left: true }),
        },
      ],
    }));

    expect(loaded).toBe(true);
    expect(logger.length).toBe(1);
    expect(logger.getFrame(1)).toEqual({
      tick: 1,
      p1: createInput({ right: true }),
      p2: createInput({ left: true }),
    });
    expect(logger.getMeta()).toEqual({});
    expect(logger.getRngSnapshot()).toBeNull();
  });
});
