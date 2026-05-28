/**
 * Replay Snapshot & Integrity Verification Regression Tests
 *
 * Validates FNV-1a checksum determinism, recorder/verifier lifecycle.
 */
import { describe, it, expect } from 'vitest';
import {
  computeFrameChecksum,
  SnapshotRecorder,
  SnapshotVerifier,
  extractFighterSnapshot,
  extractGaugeSnapshot,
  extractMaxModeSnapshot,
  type FrameStateData,
} from '../src/core/replaySnapshot.js';

const mockFighter = {
  x: 100, y: 200, health: 1000, state: 'IDLE', facing: 1,
  stunGauge: 0, currentAttack: null, attackPhase: 'none',
  hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0,
  juggleState: 'grounded', airHitCount: 0, jugglePoints: 0,
  guardGauge: 100,
};

function makeFrame(overrides: Partial<FrameStateData> = {}): FrameStateData {
  return {
    frameNumber: 60,
    rngState: 12345,
    gamePhase: 'battle',
    timer: 99,
    fighters: [
      { ...mockFighter },
      { ...mockFighter, x: 300, facing: -1 },
    ],
    gauges: [
      { meter: 50, stocks: 1 },
      { meter: 30, stocks: 0 },
    ],
    maxModes: [
      { active: false, timer: 0 },
      { active: false, timer: 0 },
    ],
    ...overrides,
  };
}

// ===== Checksum Determinism =====

describe('computeFrameChecksum', () => {
  it('is deterministic for same input', () => {
    const data = makeFrame();
    const h1 = computeFrameChecksum(data);
    const h2 = computeFrameChecksum(data);
    expect(h1).toBe(h2);
  });

  it('changes when frame number changes', () => {
    const h1 = computeFrameChecksum(makeFrame({ frameNumber: 60 }));
    const h2 = computeFrameChecksum(makeFrame({ frameNumber: 120 }));
    expect(h1).not.toBe(h2);
  });

  it('changes when health changes', () => {
    const d1 = makeFrame();
    const d2 = makeFrame();
    d2.fighters[0].health = 999;
    expect(computeFrameChecksum(d1)).not.toBe(computeFrameChecksum(d2));
  });

  it('changes when position changes', () => {
    const d1 = makeFrame();
    const d2 = makeFrame();
    d2.fighters[0].x = 101;
    expect(computeFrameChecksum(d1)).not.toBe(computeFrameChecksum(d2));
  });

  it('changes when RNG state changes', () => {
    const h1 = computeFrameChecksum(makeFrame({ rngState: 11111 }));
    const h2 = computeFrameChecksum(makeFrame({ rngState: 22222 }));
    expect(h1).not.toBe(h2);
  });

  it('returns unsigned 32-bit integer', () => {
    const h = computeFrameChecksum(makeFrame());
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF);
    expect(Number.isInteger(h)).toBe(true);
  });
});

// ===== SnapshotRecorder =====

describe('SnapshotRecorder', () => {
  it('captures at correct interval', () => {
    const rec = new SnapshotRecorder(60);
    const data = makeFrame();
    expect(rec.tick(0, data)).toBe(false);
    expect(rec.tick(30, data)).toBe(false);
    expect(rec.tick(60, data)).toBe(true);
    expect(rec.tick(120, data)).toBe(true);
    expect(rec.getCheckpoints().length).toBe(2);
  });

  it('checkpoints have correct frame numbers', () => {
    const rec = new SnapshotRecorder(60);
    const data = makeFrame();
    rec.tick(60, data);
    rec.tick(120, data);
    const cps = rec.getCheckpoints();
    expect(cps[0].frame).toBe(60);
    expect(cps[1].frame).toBe(120);
  });

  it('reset clears checkpoints', () => {
    const rec = new SnapshotRecorder(60);
    rec.tick(60, makeFrame());
    rec.reset();
    expect(rec.getCheckpoints()).toEqual([]);
  });

  it('export/import roundtrip', () => {
    const rec = new SnapshotRecorder(60);
    rec.tick(60, makeFrame());
    rec.tick(120, makeFrame());
    const exported = rec.export();
    const imported = SnapshotRecorder.import(exported);
    expect(imported.getCheckpoints()).toEqual(rec.getCheckpoints());
  });
});

// ===== SnapshotVerifier =====

describe('SnapshotVerifier', () => {
  it('passes when checksums match', () => {
    const data = makeFrame();
    const checksum = computeFrameChecksum(data);
    const recorded = [{ frame: 60, checksum }];
    const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
    verifier.tick(60, data);
    const report = verifier.getReport();
    expect(report.passed).toBe(true);
    expect(report.totalCheckpoints).toBe(1);
    expect(report.mismatches).toEqual([]);
    expect(report.firstDivergenceFrame).toBeNull();
  });

  it('fails when checksums differ', () => {
    const data = makeFrame();
    const recorded = [{ frame: 60, checksum: 0xDEADBEEF }];
    const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
    verifier.tick(60, data);
    const report = verifier.getReport();
    expect(report.passed).toBe(false);
    expect(report.mismatches.length).toBe(1);
    expect(report.firstDivergenceFrame).toBe(60);
  });

  it('stops on first mismatch when configured', () => {
    const data = makeFrame();
    const recorded = [
      { frame: 60, checksum: 0xDEAD },
      { frame: 120, checksum: 0xBEEF },
    ];
    const verifier = new SnapshotVerifier(recorded, {
      logMismatches: false,
      stopOnFirstMismatch: true,
    });
    verifier.tick(60, data);
    verifier.tick(120, data);
    const report = verifier.getReport();
    expect(report.mismatches.length).toBe(1);
    expect(report.firstDivergenceFrame).toBe(60);
  });

  it('tracks verified count', () => {
    const data = makeFrame();
    const checksum = computeFrameChecksum(data);
    const recorded = [{ frame: 60, checksum }];
    const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
    expect(verifier.getVerifiedCount()).toBe(0);
    verifier.tick(60, data);
    expect(verifier.getVerifiedCount()).toBe(1);
  });
});

// ===== Extract Helpers =====

describe('extractFighterSnapshot', () => {
  it('extracts all fields correctly', () => {
    const snap = extractFighterSnapshot(mockFighter);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(200);
    expect(snap.health).toBe(1000);
    expect(snap.state).toBe('IDLE');
    expect(snap.facing).toBe(1);
    expect(snap.guardGauge).toBe(100);
  });
});

describe('extractGaugeSnapshot', () => {
  it('extracts meter and stocks', () => {
    const snap = extractGaugeSnapshot({ meter: 75, stocks: 2 });
    expect(snap.meter).toBe(75);
    expect(snap.stocks).toBe(2);
  });
});

describe('extractMaxModeSnapshot', () => {
  it('extracts active and timer', () => {
    const snap = extractMaxModeSnapshot({ active: true, timer: 500 });
    expect(snap.active).toBe(true);
    expect(snap.timer).toBe(500);
  });
});
