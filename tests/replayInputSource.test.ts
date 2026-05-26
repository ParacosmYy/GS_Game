import { describe, it, expect } from 'vitest';
import { createReplayInputSource } from '../src/core/replayInputSource.js';
import type { ReplayBundleV1 } from '../src/core/replaySession.js';

function makeBundle(frames: Array<{ tick: number; p1: Record<string, boolean>; p2: Record<string, boolean> }>): ReplayBundleV1 {
  return {
    version: 1 as any,
    match: { p1: 'ryo', p2: 'kyo', stage: 'temple', rounds: 2, timerSpeed: 1 },
    rngSnapshot: { seed: 12345, state: new Uint32Array(4) } as any,
    inputLog: { frames } as any,
  };
}

const neutral = { up: false, down: false, left: false, right: false, buttonA: false, buttonB: false, buttonC: false, buttonD: false, throwAttack: false, burst: false, start: false };

describe('replayInputSource', () => {
  it('creates source from valid bundle', () => {
    const src = createReplayInputSource(makeBundle([]));
    expect(src).toBeDefined();
  });
  it('getFrameCount returns 0 for empty', () => {
    const src = createReplayInputSource(makeBundle([]));
    expect(src.getFrameCount()).toBe(0);
  });
  it('readFrame returns neutral for missing tick', () => {
    const src = createReplayInputSource(makeBundle([]));
    const frame = src.readFrame(5);
    expect(frame.recorded).toBe(false);
  });
  it('readFrame returns recorded data', () => {
    const src = createReplayInputSource(makeBundle([
      { tick: 0, p1: { ...neutral, buttonA: true }, p2: neutral },
    ]));
    const frame = src.readFrame(0);
    expect(frame.recorded).toBe(true);
    expect(frame.p1.buttonA).toBe(true);
  });
  it('isFinished returns true past last frame', () => {
    const src = createReplayInputSource(makeBundle([
      { tick: 0, p1: neutral, p2: neutral },
      { tick: 5, p1: neutral, p2: neutral },
    ]));
    expect(src.isFinished(6)).toBe(true);
    expect(src.isFinished(3)).toBe(false);
  });
});
