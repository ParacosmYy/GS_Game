import { describe, it, expect } from 'vitest';
import {
  computeFrameChecksum,
  SnapshotRecorder,
  SnapshotVerifier,
  extractFighterSnapshot,
  extractGaugeSnapshot,
  extractMaxModeSnapshot,
} from '../src/core/replaySnapshot.js';
import type { FrameStateData } from '../src/core/replaySnapshot.js';

function makeFrameData(overrides: Partial<FrameStateData> = {}): FrameStateData {
  return {
    frameNumber: 0,
    rngState: 12345,
    gamePhase: 'battle',
    timer: 99,
    fighters: [
      { x: 100, y: 0, health: 100, state: 'IDLE', facing: 1, stunGauge: 0, currentAttack: null, attackPhase: 'none', hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0, juggleState: 'GROUND', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
      { x: 300, y: 0, health: 100, state: 'IDLE', facing: -1, stunGauge: 0, currentAttack: null, attackPhase: 'none', hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0, juggleState: 'GROUND', airHitCount: 0, jugglePoints: 0, guardGauge: 100 },
    ],
    gauges: [
      { meter: 0, stocks: 0 },
      { meter: 0, stocks: 0 },
    ],
    maxModes: [
      { active: false, timer: 0 },
      { active: false, timer: 0 },
    ],
    ...overrides,
  };
}

describe('replaySnapshot', () => {
  describe('computeFrameChecksum', () => {
    it('returns a number', () => {
      const checksum = computeFrameChecksum(makeFrameData());
      expect(typeof checksum).toBe('number');
    });

    it('same data produces same checksum', () => {
      const data = makeFrameData();
      expect(computeFrameChecksum(data)).toBe(computeFrameChecksum(data));
    });

    it('different health produces different checksum', () => {
      const a = makeFrameData();
      const b = makeFrameData();
      b.fighters[0].health = 50;
      expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
    });

    it('different rngState produces different checksum', () => {
      const a = makeFrameData();
      const b = makeFrameData({ rngState: 99999 });
      expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
    });

    it('different position produces different checksum', () => {
      const a = makeFrameData();
      const b = makeFrameData();
      b.fighters[0].x = 200;
      expect(computeFrameChecksum(a)).not.toBe(computeFrameChecksum(b));
    });
  });

  describe('SnapshotRecorder', () => {
    it('captures checkpoint at interval', () => {
      const rec = new SnapshotRecorder(60);
      const data = makeFrameData();
      expect(rec.tick(0, data)).toBe(false);
      expect(rec.tick(59, data)).toBe(false);
      expect(rec.tick(60, data)).toBe(true);
    });

    it('getCheckpoints returns recorded checkpoints', () => {
      const rec = new SnapshotRecorder(60);
      const data = makeFrameData();
      rec.tick(60, data);
      rec.tick(120, data);
      expect(rec.getCheckpoints().length).toBe(2);
      expect(rec.getCheckpoints()[0].frame).toBe(60);
      expect(rec.getCheckpoints()[1].frame).toBe(120);
    });

    it('reset clears checkpoints', () => {
      const rec = new SnapshotRecorder(60);
      rec.tick(60, makeFrameData());
      rec.reset();
      expect(rec.getCheckpoints().length).toBe(0);
    });

    it('export/import roundtrip', () => {
      const rec = new SnapshotRecorder(60);
      rec.tick(60, makeFrameData());
      rec.tick(120, makeFrameData({ rngState: 99 }));
      const exported = rec.export();
      const rec2 = SnapshotRecorder.import(exported);
      expect(rec2.getCheckpoints()).toEqual(exported);
    });
  });

  describe('SnapshotVerifier', () => {
    it('passes with matching checksums', () => {
      const data = makeFrameData();
      const checksum = computeFrameChecksum(data);
      const recorded = [{ frame: 60, checksum }];
      const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
      verifier.tick(60, data);
      const report = verifier.getReport();
      expect(report.passed).toBe(true);
      expect(report.mismatches.length).toBe(0);
      expect(report.firstDivergenceFrame).toBeNull();
    });

    it('detects mismatch', () => {
      const data = makeFrameData();
      const checksum = computeFrameChecksum(data);
      const recorded = [{ frame: 60, checksum }];
      const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
      const modifiedData = makeFrameData({ rngState: 99999 });
      verifier.tick(60, modifiedData);
      const report = verifier.getReport();
      expect(report.passed).toBe(false);
      expect(report.mismatches.length).toBe(1);
      expect(report.firstDivergenceFrame).toBe(60);
    });

    it('getVerifiedCount tracks progress', () => {
      const data = makeFrameData();
      const checksum = computeFrameChecksum(data);
      const recorded = [{ frame: 60, checksum }];
      const verifier = new SnapshotVerifier(recorded, { logMismatches: false });
      expect(verifier.getVerifiedCount()).toBe(0);
      verifier.tick(60, data);
      expect(verifier.getVerifiedCount()).toBe(1);
    });

    it('stopOnFirstMismatch stops early', () => {
      const data = makeFrameData();
      const checksum = computeFrameChecksum(data);
      const recorded = [{ frame: 60, checksum }, { frame: 120, checksum }];
      const verifier = new SnapshotVerifier(recorded, { logMismatches: false, stopOnFirstMismatch: true });
      verifier.tick(60, makeFrameData({ rngState: 99999 }));
      // Should have skipped remaining
      expect(verifier.getVerifiedCount()).toBe(2);
    });
  });

  describe('extract helpers', () => {
    it('extractFighterSnapshot copies fields', () => {
      const f = { x: 100, y: 50, health: 80, state: 'IDLE', facing: 1, stunGauge: 0, currentAttack: null, attackPhase: 'none', hitstunTimer: 0, blockstunTimer: 0, knockdownTimer: 0, juggleState: 'GROUND', airHitCount: 0, jugglePoints: 0, guardGauge: 100 };
      const snap = extractFighterSnapshot(f);
      expect(snap.x).toBe(100);
      expect(snap.health).toBe(80);
    });

    it('extractGaugeSnapshot copies fields', () => {
      const g = { meter: 50, stocks: 2 };
      expect(extractGaugeSnapshot(g)).toEqual({ meter: 50, stocks: 2 });
    });

    it('extractMaxModeSnapshot copies fields', () => {
      const m = { active: true, timer: 100 };
      expect(extractMaxModeSnapshot(m)).toEqual({ active: true, timer: 100 });
    });
  });
});
