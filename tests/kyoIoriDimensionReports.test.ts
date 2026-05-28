/**
 * Kyo & Iori Dimension Report Regression Tests
 *
 * Validates generateKyoDimensionReport() and generateIoriDimensionReport()
 * return valid structured completeness data across all 8 dimensions.
 */
import { describe, it, expect } from 'vitest';
import {
  generateKyoDimensionReport,
  type KyoDimensionReport,
  type DimensionResult,
} from '../src/tools/kyoCompletenessReport.js';
import {
  generateIoriDimensionReport,
  type IoriDimensionReport,
} from '../src/tools/ioriCompletenessReport.js';

function validateDimension(dim: DimensionResult, label: string) {
  expect(dim.dimension, `${label} dimension`).toBeTruthy();
  expect(dim.total, `${label} total`).toBeGreaterThanOrEqual(0);
  expect(dim.passed, `${label} passed`).toBeGreaterThanOrEqual(0);
  expect(dim.passed, `${label} passed <= total`).toBeLessThanOrEqual(dim.total);
  expect(dim.pct, `${label} pct range`).toBeGreaterThanOrEqual(0);
  expect(dim.pct, `${label} pct range`).toBeLessThanOrEqual(100);
  expect(Array.isArray(dim.missing), `${label} missing is array`).toBe(true);
  expect(Array.isArray(dim.complete), `${label} complete is array`).toBe(true);
  expect(dim.passed, `${label} passed == complete.length`).toBe(dim.complete.length);
  expect(dim.total - dim.passed, `${label} missing count`).toBe(dim.missing.length);
}

const DIMENSION_KEYS = [
  'animationMeta', 'frameData', 'attackFrames', 'feedback',
  'portrait', 'moveList', 'cancelPaths', 'hitEffects',
] as const;

// ===== Kyo =====

describe('generateKyoDimensionReport', () => {
  let report: KyoDimensionReport;

  it('runs without errors', () => {
    report = generateKyoDimensionReport();
    expect(report).toBeDefined();
  });

  it('has all 8 dimensions', () => {
    for (const key of DIMENSION_KEYS) {
      expect(report[key], `report.${key}`).toBeDefined();
    }
  });

  it('all dimensions have valid structure', () => {
    for (const key of DIMENSION_KEYS) {
      validateDimension(report[key], `kyo.${key}`);
    }
  });

  it('overallScore is between 0 and 100', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('animationMeta checks at least 20 animations', () => {
    expect(report.animationMeta.total).toBeGreaterThanOrEqual(20);
  });

  it('frameData checks all attack keys', () => {
    expect(report.frameData.total).toBeGreaterThan(20);
  });

  it('feedback checks all attack keys', () => {
    expect(report.feedback.total).toBeGreaterThan(20);
  });

  it('portrait checks 4 sizes', () => {
    expect(report.portrait.total).toBe(4);
  });

  it('cancelPaths checks expected routes', () => {
    expect(report.cancelPaths.total).toBeGreaterThan(0);
  });

  it('hitEffects checks attack types', () => {
    expect(report.hitEffects.total).toBeGreaterThan(10);
  });

  it('moveList checks expected entries', () => {
    expect(report.moveList.total).toBeGreaterThanOrEqual(8);
  });
});

// ===== Iori =====

describe('generateIoriDimensionReport', () => {
  let report: IoriDimensionReport;

  it('runs without errors', () => {
    report = generateIoriDimensionReport();
    expect(report).toBeDefined();
  });

  it('has all 8 dimensions', () => {
    for (const key of DIMENSION_KEYS) {
      expect(report[key], `report.${key}`).toBeDefined();
    }
  });

  it('all dimensions have valid structure', () => {
    for (const key of DIMENSION_KEYS) {
      validateDimension(report[key], `iori.${key}`);
    }
  });

  it('overallScore is between 0 and 100', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('animationMeta checks at least 20 animations', () => {
    expect(report.animationMeta.total).toBeGreaterThanOrEqual(20);
  });

  it('frameData checks all attack keys', () => {
    expect(report.frameData.total).toBeGreaterThan(20);
  });

  it('feedback checks all attack keys', () => {
    expect(report.feedback.total).toBeGreaterThan(20);
  });

  it('portrait checks 4 sizes', () => {
    expect(report.portrait.total).toBe(4);
  });

  it('cancelPaths checks expected routes', () => {
    expect(report.cancelPaths.total).toBeGreaterThan(0);
  });

  it('hitEffects checks attack types', () => {
    expect(report.hitEffects.total).toBeGreaterThan(10);
  });

  it('moveList checks expected entries', () => {
    expect(report.moveList.total).toBeGreaterThanOrEqual(8);
  });
});

// ===== Cross-character consistency =====

describe('Kyo vs Iori dimension report consistency', () => {
  it('both check portrait for same number of sizes', () => {
    const kyo = generateKyoDimensionReport();
    const iori = generateIoriDimensionReport();
    expect(kyo.portrait.total).toBe(iori.portrait.total);
  });

  it('both have non-zero overall scores', () => {
    const kyo = generateKyoDimensionReport();
    const iori = generateIoriDimensionReport();
    expect(kyo.overallScore).toBeGreaterThan(0);
    expect(iori.overallScore).toBeGreaterThan(0);
  });

  it('both check frame data for their full attack key set', () => {
    const kyo = generateKyoDimensionReport();
    const iori = generateIoriDimensionReport();
    // Both should have substantial attack key coverage checks
    expect(kyo.frameData.total).toBeGreaterThan(20);
    expect(iori.frameData.total).toBeGreaterThan(20);
  });
});
