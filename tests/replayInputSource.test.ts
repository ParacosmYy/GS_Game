import { describe, expect, it } from 'vitest';
import { InputLogger } from '../src/core/inputLog.js';
import { createReplayInputSource } from '../src/core/replayInputSource.js';
import { ReplaySession, type ReplayBundleV1 } from '../src/core/replaySession.js';
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

function createBundle(): ReplayBundleV1 {
  const inputLog = new InputLogger();
  const session = new ReplaySession(inputLog);
  session.beginLiveMatch({
    seed: 20240526,
    label: 'Kyo vs Iori',
    round: 1,
    p1CharId: 'kyo',
    p2CharId: 'iori',
    stageId: 'temple',
    teamMode: false,
    trainingMode: false,
  });
  inputLog.record(3, createInput({ right: true, buttonA: true }), createInput({ left: true }));
  inputLog.record(5, createInput({ down: true }), createInput({ buttonC: true }));
  return JSON.parse(session.exportBundle()) as ReplayBundleV1;
}

describe('ReplayInputSource', () => {
  it('reads recorded inputs by tick and returns neutral input for missing ticks', () => {
    const source = createReplayInputSource(createBundle());

    expect(source.readFrame(3)).toEqual({
      tick: 3,
      p1: createInput({ right: true, buttonA: true }),
      p2: createInput({ left: true }),
      recorded: true,
    });
    expect(source.readFrame(4)).toEqual({
      tick: 4,
      p1: createInput(),
      p2: createInput(),
      recorded: false,
    });
  });

  it('reports frame count and finish state without mutating the bundle', () => {
    const bundle = createBundle();
    const before = JSON.stringify(bundle);
    const source = createReplayInputSource(bundle);

    expect(source.getFrameCount()).toBe(2);
    expect(source.isFinished(5)).toBe(false);
    expect(source.isFinished(6)).toBe(true);
    expect(JSON.stringify(bundle)).toBe(before);
  });

  it('rejects invalid replay bundles', () => {
    expect(() => createReplayInputSource({
      version: 1,
      match: null,
      rngSnapshot: { state: 1 },
      inputLog: { version: 2, frames: [] },
    })).toThrow('Invalid replay bundle');
  });
});
