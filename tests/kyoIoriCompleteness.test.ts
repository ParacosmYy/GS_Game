/**
 * Kyo & Iori Completeness Report Regression Tests
 *
 * Validates that the completeness report tools return valid data
 * across all 8 dimensions and that scores meet minimum thresholds.
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

// ===== Shared Helpers =====

function expectValidDimension(dim: DimensionResult) {
  expect(dim.total).toBeGreaterThan(0);
  expect(dim.passed).toBeGreaterThanOrEqual(0);
  expect(dim.passed).toBeLessThanOrEqual(dim.total);
  expect(dim.pct).toBeGreaterThanOrEqual(0);
  expect(dim.pct).toBeLessThanOrEqual(100);
  expect(dim.missing.length + dim.complete.length).toBe(dim.total);
  expect(dim.pct).toBe(Math.round((dim.passed / dim.total) * 100));
}

// ===== Kyo Completeness Report =====

describe('Kyo Completeness Report', () => {
  let report: KyoDimensionReport;

  it('generates without error', () => {
    report = generateKyoDimensionReport();
    expect(report).toBeDefined();
  });

  it('has overallScore between 0 and 100', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('animationMeta is valid', () => {
    expectValidDimension(report.animationMeta);
    // Should cover basic + normals + specials = at least 35 animations
    expect(report.animationMeta.total).toBeGreaterThanOrEqual(35);
  });

  it('frameData is valid', () => {
    expectValidDimension(report.frameData);
    expect(report.frameData.total).toBeGreaterThan(0);
  });

  it('attackFrames is valid', () => {
    expectValidDimension(report.attackFrames);
  });

  it('feedback is valid', () => {
    expectValidDimension(report.feedback);
    // All attacks should have feedback coverage
    expect(report.feedback.pct).toBe(100);
  });

  it('portrait is valid', () => {
    expectValidDimension(report.portrait);
    // 4 portrait sizes
    expect(report.portrait.total).toBe(4);
  });

  it('moveList is valid', () => {
    expectValidDimension(report.moveList);
    expect(report.moveList.total).toBeGreaterThanOrEqual(8);
  });

  it('cancelPaths is valid', () => {
    expectValidDimension(report.cancelPaths);
    expect(report.cancelPaths.total).toBeGreaterThanOrEqual(5);
  });

  it('hitEffects is valid', () => {
    expectValidDimension(report.hitEffects);
    // Should cover specials + DMs
    expect(report.hitEffects.total).toBeGreaterThanOrEqual(18);
  });

  it('animationMeta covers basic animations', () => {
    const basicExpected = ['idle', 'walk_forward', 'walk_backward', 'crouch', 'hitstun', 'knockdown', 'win'];
    for (const anim of basicExpected) {
      expect(report.animationMeta.complete).toContain(anim);
    }
  });

  it('animationMeta covers Kyo specials', () => {
    const specialExpected = ['kyo_oniyaki', 'kyo_yamibarai', 'kyo_aragami', 'kyo_dokugami', 'dm_orochinagi'];
    for (const anim of specialExpected) {
      expect(report.animationMeta.complete).toContain(anim);
    }
  });

  it('portrait has all 4 sizes complete', () => {
    expect(report.portrait.pct).toBe(100);
    expect(report.portrait.complete).toContain('select');
    expect(report.portrait.complete).toContain('vs');
    expect(report.portrait.complete).toContain('hud');
    expect(report.portrait.complete).toContain('win');
  });

  it('hitEffects covers DM/SDM/HSDM', () => {
    expect(report.hitEffects.complete).toContain('DM_OROCHINAGI');
    expect(report.hitEffects.complete).toContain('SDM_OROCHINAGI');
    expect(report.hitEffects.complete).toContain('HSDM_OROCHINAGI');
  });

  it('cancelPaths covers core routes', () => {
    const labels = report.cancelPaths.complete;
    const hasSpecial = labels.some(l => l.includes('KYO_ONIYAKI') && l.includes('special'));
    expect(hasSpecial).toBe(true);
  });

  it('overallScore meets minimum threshold (70%)', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(70);
  });
});

// ===== Iori Completeness Report =====

describe('Iori Completeness Report', () => {
  let report: IoriDimensionReport;

  it('generates without error', () => {
    report = generateIoriDimensionReport();
    expect(report).toBeDefined();
  });

  it('has overallScore between 0 and 100', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('animationMeta is valid', () => {
    expectValidDimension(report.animationMeta);
    // Should cover basic + normals + specials
    expect(report.animationMeta.total).toBeGreaterThanOrEqual(30);
  });

  it('frameData is valid', () => {
    expectValidDimension(report.frameData);
    expect(report.frameData.total).toBeGreaterThan(0);
  });

  it('attackFrames is valid', () => {
    expectValidDimension(report.attackFrames);
  });

  it('feedback is valid', () => {
    expectValidDimension(report.feedback);
    expect(report.feedback.pct).toBe(100);
  });

  it('portrait is valid', () => {
    expectValidDimension(report.portrait);
    expect(report.portrait.total).toBe(4);
  });

  it('moveList is valid', () => {
    expectValidDimension(report.moveList);
    expect(report.moveList.total).toBeGreaterThanOrEqual(8);
  });

  it('cancelPaths is valid', () => {
    expectValidDimension(report.cancelPaths);
    expect(report.cancelPaths.total).toBeGreaterThanOrEqual(5);
  });

  it('hitEffects is valid', () => {
    expectValidDimension(report.hitEffects);
    expect(report.hitEffects.total).toBeGreaterThanOrEqual(15);
  });

  it('animationMeta covers basic animations', () => {
    const basicExpected = ['idle', 'walk_forward', 'walk_backward', 'crouch', 'hitstun', 'knockdown', 'dizzy', 'win'];
    for (const anim of basicExpected) {
      expect(report.animationMeta.complete).toContain(anim);
    }
  });

  it('animationMeta covers Iori specials', () => {
    const specialExpected = ['iori_oniyaki', 'iori_yamibarai', 'iori_aoihana', 'iori_kototsuki', 'iori_kuzukaze'];
    for (const anim of specialExpected) {
      expect(report.animationMeta.complete).toContain(anim);
    }
  });

  it('portrait has all 4 sizes complete', () => {
    expect(report.portrait.pct).toBe(100);
    expect(report.portrait.complete).toContain('select');
    expect(report.portrait.complete).toContain('vs');
    expect(report.portrait.complete).toContain('hud');
    expect(report.portrait.complete).toContain('win');
  });

  it('hitEffects covers DM/SDM/HSDM', () => {
    expect(report.hitEffects.complete).toContain('DM_YATAGARASU');
    expect(report.hitEffects.complete).toContain('SDM_YATAGARASU');
    expect(report.hitEffects.complete).toContain('HSDM_YAOTOME');
  });

  it('cancelPaths covers core routes', () => {
    const labels = report.cancelPaths.complete;
    const hasSpecial = labels.some(l => l.includes('IORI_ONIYAKI') && l.includes('special'));
    expect(hasSpecial).toBe(true);
  });

  it('hitEffects covers Aoihana rekka chain', () => {
    expect(report.hitEffects.complete).toContain('IORI_AOIHANA');
    expect(report.hitEffects.complete).toContain('IORI_AOIHANA_2');
    expect(report.hitEffects.complete).toContain('IORI_AOIHANA_3');
  });

  it('overallScore meets minimum threshold (70%)', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(70);
  });
});
