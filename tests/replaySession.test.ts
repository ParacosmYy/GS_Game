import { describe, expect, it } from 'vitest';
import { InputLogger } from '../src/core/inputLog.js';
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

function createLiveReplay(): { session: ReplaySession; bundle: ReplayBundleV1 } {
  const inputLog = new InputLogger();
  const session = new ReplaySession(inputLog);

  session.beginLiveMatch({
    seed: 20240526,
    label: 'Ryo vs Iori',
    round: 2,
    p1CharId: 'ryo',
    p2CharId: 'iori',
    stageId: 'temple',
    teamMode: false,
    trainingMode: false,
  });

  inputLog.record(18, createInput({ right: true, buttonA: true }), createInput({ left: true, buttonB: true }));
  inputLog.record(19, createInput({ right: true }), createInput({ left: true, buttonC: true }));

  return {
    session,
    bundle: JSON.parse(session.exportBundle()) as ReplayBundleV1,
  };
}

describe('ReplaySession', () => {
  it('exports and imports a versioned replay bundle round-trip', () => {
    const { session, bundle } = createLiveReplay();

    expect(bundle.version).toBe(1);
    expect(bundle.match).toEqual({
      seed: 20240526,
      label: 'Ryo vs Iori',
      round: 2,
      p1CharId: 'ryo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
      source: 'live',
    });
    expect(bundle.rngSnapshot).toEqual({ state: expect.any(Number) });
    expect(bundle.inputLog.version).toBe(2);
    expect(bundle.inputLog.meta).toMatchObject({
      rngSeed: 20240526,
      label: 'Ryo vs Iori',
      source: 'live',
      round: 2,
      p1CharId: 'ryo',
      p2CharId: 'iori',
      stageId: 'temple',
      teamMode: false,
      trainingMode: false,
    });

    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle(JSON.stringify(bundle));

    expect(result.ok).toBe(true);
    expect(imported.getMatchEnvelope()).toEqual(bundle.match);
    expect(imported.getRngSnapshot()).toEqual(bundle.rngSnapshot);
    expect(JSON.parse(imported.exportBundle())).toEqual(bundle);

    // Sanity-check: the original session remains usable after export.
    expect(JSON.parse(session.exportBundle())).toEqual(bundle);
  });

  it('rejects malformed or mismatched replay bundles with clear reasons', () => {
    const { bundle } = createLiveReplay();
    const imported = new ReplaySession(new InputLogger());

    const missingMatch = imported.importBundle(JSON.stringify({
      version: 1,
      rngSnapshot: bundle.rngSnapshot,
      inputLog: bundle.inputLog,
    }));
    expect(missingMatch.ok).toBe(false);
    expect(missingMatch.error).toContain('match envelope');

    const versionMismatch = imported.importBundle(JSON.stringify({
      ...bundle,
      version: 2,
    }));
    expect(versionMismatch.ok).toBe(false);
    expect(versionMismatch.error).toContain('Unsupported replay bundle version');

    const inconsistent = imported.importBundle(JSON.stringify({
      ...bundle,
      match: {
        ...bundle.match,
        seed: 999,
      },
    }));
    expect(inconsistent.ok).toBe(false);
    expect(inconsistent.error).toContain('mismatch');

    const invalidInputLog = imported.importBundle(JSON.stringify({
      ...bundle,
      inputLog: {
        ...bundle.inputLog,
        frames: 'not-an-array',
      },
    }));
    expect(invalidInputLog.ok).toBe(false);
    expect(invalidInputLog.error).toContain('input log');
  });

  it('rejects invalid JSON input', () => {
    const imported = new ReplaySession(new InputLogger());
    const result = imported.importBundle('{not-json');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('invalid');
  });
});
