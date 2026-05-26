import { describe, it, expect } from 'vitest';
import { InputLogger } from '../src/core/inputLog.js';

function makeInput(overrides: Record<string, boolean> = {}) {
  return { up: false, down: false, left: false, right: false, buttonA: false, buttonB: false, buttonC: false, buttonD: false, throwAttack: false, start: false, ...overrides };
}

describe('InputLogger', () => {
  it('records frames and length tracks count', () => {
    const logger = new InputLogger();
    logger.record(0, makeInput(), makeInput());
    logger.record(1, makeInput(), makeInput());
    expect(logger.length).toBe(2);
  });

  it('getFrame finds by tick', () => {
    const logger = new InputLogger();
    logger.record(5, makeInput({ up: true }), makeInput());
    const frame = logger.getFrame(5);
    expect(frame).toBeDefined();
    expect(frame!.tick).toBe(5);
    expect(frame!.p1.up).toBe(true);
  });

  it('getFrameByIndex returns by position', () => {
    const logger = new InputLogger();
    logger.record(10, makeInput(), makeInput());
    logger.record(20, makeInput({ buttonA: true }), makeInput());
    const frame = logger.getFrameByIndex(1);
    expect(frame).toBeDefined();
    expect(frame!.tick).toBe(20);
    expect(frame!.p1.buttonA).toBe(true);
  });

  it('respects maxFrames limit', () => {
    const logger = new InputLogger(3);
    for (let i = 0; i < 5; i++) logger.record(i, makeInput(), makeInput());
    expect(logger.length).toBe(3);
  });

  it('oldest frames are dropped when over maxFrames', () => {
    const logger = new InputLogger(2);
    logger.record(10, makeInput(), makeInput());
    logger.record(20, makeInput({ up: true }), makeInput());
    logger.record(30, makeInput(), makeInput());
    expect(logger.length).toBe(2);
    const first = logger.getFrameByIndex(0);
    expect(first!.tick).toBe(20);
  });

  it('setMeta/getMeta roundtrip', () => {
    const logger = new InputLogger();
    logger.setMeta({ label: 'test', rngSeed: 42, round: 1 });
    const meta = logger.getMeta();
    expect(meta.label).toBe('test');
    expect(meta.rngSeed).toBe(42);
    expect(meta.round).toBe(1);
  });

  it('setRngSnapshot/getRngSnapshot roundtrip', () => {
    const logger = new InputLogger();
    logger.setRngSnapshot({ state: 12345 });
    expect(logger.getRngSnapshot()).toEqual({ state: 12345 });
  });

  it('getRngSnapshot returns null when not set', () => {
    expect(new InputLogger().getRngSnapshot()).toBeNull();
  });

  it('setRngSnapshot null clears snapshot', () => {
    const logger = new InputLogger();
    logger.setRngSnapshot({ state: 12345 });
    logger.setRngSnapshot(null);
    expect(logger.getRngSnapshot()).toBeNull();
  });

  it('dump and load roundtrip', () => {
    const logger = new InputLogger();
    logger.record(0, makeInput({ buttonA: true }), makeInput());
    logger.setMeta({ label: 'roundtrip' });
    const json = logger.dump();
    const logger2 = new InputLogger();
    expect(logger2.load(json)).toBe(true);
    expect(logger2.length).toBe(1);
    expect(logger2.getMeta().label).toBe('roundtrip');
    const frame = logger2.getFrameByIndex(0);
    expect(frame!.p1.buttonA).toBe(true);
  });

  it('load rejects invalid JSON', () => {
    expect(new InputLogger().load('not json')).toBe(false);
  });

  it('load rejects missing version', () => {
    expect(new InputLogger().load('{"frames":[]}')).toBe(false);
  });

  it('clear resets state', () => {
    const logger = new InputLogger();
    logger.record(0, makeInput(), makeInput());
    logger.setMeta({ label: 'test' });
    logger.clear();
    expect(logger.length).toBe(0);
    expect(logger.getMeta().label).toBeUndefined();
  });

  it('records deep-copied inputs', () => {
    const logger = new InputLogger();
    const p1 = makeInput({ buttonA: true });
    logger.record(0, p1, makeInput());
    p1.buttonA = false;
    expect(logger.getFrameByIndex(0)!.p1.buttonA).toBe(true);
  });

  it('getFrame returns undefined for missing tick', () => {
    expect(new InputLogger().getFrame(999)).toBeUndefined();
  });

  it('getFrameByIndex returns undefined for out of bounds', () => {
    expect(new InputLogger().getFrameByIndex(0)).toBeUndefined();
  });
});
