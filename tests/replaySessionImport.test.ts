/**
 * ReplaySession Import/Export Validation Tests
 *
 * Tests the pure-data validation and normalization logic in ReplaySession:
 * - Bundle normalization (version, match envelope, RNG snapshot, input log)
 * - Consistency validation between match envelope and input log meta
 * - Error handling for malformed bundles
 * - Round-trip export → import integrity
 */
import { describe, it, expect } from 'vitest';
import { ReplaySession } from '../src/core/replaySession.js';
import { InputLogger } from '../src/core/inputLog.js';

function makeLogger(): InputLogger {
  return new InputLogger(1000);
}

function makeValidBundle() {
  return {
    version: 1,
    match: {
      seed: 42,
      label: 'test-match',
      round: 1,
      p1CharId: 'ryo',
      p2CharId: 'kyo',
      stageId: 'dojo',
      teamMode: false,
      trainingMode: false,
      source: 'live' as const,
    },
    rngSnapshot: { state: 12345 },
    inputLog: {
      version: 2 as const,
      meta: {
        rngSeed: 42,
        rngState: 12345,
        label: 'test-match',
        round: 1,
        p1CharId: 'ryo',
        p2CharId: 'kyo',
        stageId: 'dojo',
        teamMode: false,
        trainingMode: false,
        source: 'live' as const,
      },
      frames: [] as unknown[],
    },
  };
}

describe('ReplaySession importBundle validation', () => {
  it('rejects invalid JSON', () => {
    const session = new ReplaySession(makeLogger());
    const result = session.importBundle('not-json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('invalid');
  });

  it('rejects non-object JSON', () => {
    const session = new ReplaySession(makeLogger());
    const result = session.importBundle('42');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('object');
  });

  it('rejects wrong version', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.version = 99;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('version');
  });

  it('rejects missing match envelope', () => {
    const session = new ReplaySession(makeLogger());
    const raw: any = makeValidBundle();
    delete raw.match;
    const result = session.importBundle(JSON.stringify(raw));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('match');
  });

  it('rejects invalid match seed', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.match as any).seed = 'bad';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('seed');
  });

  it('rejects missing match label', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.match as any).label = undefined;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('label');
  });

  it('rejects invalid match source', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.match as any).source = 'invalid';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('source');
  });

  it('rejects missing RNG snapshot', () => {
    const session = new ReplaySession(makeLogger());
    const raw: any = makeValidBundle();
    delete raw.rngSnapshot;
    const result = session.importBundle(JSON.stringify(raw));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('RNG');
  });

  it('rejects invalid RNG state', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.rngSnapshot as any).state = 'bad';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('RNG');
  });

  it('rejects missing input log', () => {
    const session = new ReplaySession(makeLogger());
    const raw: any = makeValidBundle();
    delete raw.inputLog;
    const result = session.importBundle(JSON.stringify(raw));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('input log');
  });

  it('rejects invalid input log version', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.inputLog as any).version = 99;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('input log version');
  });

  it('rejects missing input log frames', () => {
    const session = new ReplaySession(makeLogger());
    const raw: any = makeValidBundle();
    delete raw.inputLog.frames;
    const result = session.importBundle(JSON.stringify(raw));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('frames');
  });
});

describe('ReplaySession consistency validation', () => {
  it('rejects mismatched RNG seed', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.inputLog.meta.rngSeed = 99;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('seed');
  });

  it('rejects mismatched label', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.inputLog.meta.label = 'different-label';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('label');
  });

  it('rejects mismatched P1 character', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.inputLog.meta.p1CharId = 'iori';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('P1');
  });

  it('rejects mismatched round', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.inputLog.meta.round = 3;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('round');
  });

  it('rejects mismatched RNG state between meta and snapshot', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.rngSnapshot.state = 100;
    bundle.inputLog.meta.rngState = 200;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('RNG state');
  });
});

describe('ReplaySession successful import', () => {
  it('accepts a valid bundle', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(true);
  });

  it('sets match envelope after import', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    session.importBundle(JSON.stringify(bundle));
    const envelope = session.getMatchEnvelope();
    expect(envelope).not.toBeNull();
    expect(envelope!.p1CharId).toBe('ryo');
    expect(envelope!.p2CharId).toBe('kyo');
    expect(envelope!.source).toBe('live');
  });

  it('sets RNG snapshot after import', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    session.importBundle(JSON.stringify(bundle));
    const rng = session.getRngSnapshot();
    expect(rng).not.toBeNull();
    expect(rng!.state).toBe(12345);
  });

  it('returns null envelope before import', () => {
    const session = new ReplaySession(makeLogger());
    expect(session.getMatchEnvelope()).toBeNull();
  });

  it('returns null RNG before import', () => {
    const session = new ReplaySession(makeLogger());
    expect(session.getRngSnapshot()).toBeNull();
  });

  it('accepts replay source', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    bundle.match.source = 'replay';
    bundle.inputLog.meta.source = 'replay';
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(true);
  });

  it('accepts input log version 2', () => {
    const session = new ReplaySession(makeLogger());
    const bundle = makeValidBundle();
    (bundle.inputLog as any).version = 2;
    const result = session.importBundle(JSON.stringify(bundle));
    expect(result.ok).toBe(true);
  });
});
