/**
 * Ryo Package Validation Regression Tests
 *
 * Validates validateRyoPackage() returns a structured ValidationReport
 * with all expected checks and valid scores.
 */
import { describe, it, expect } from 'vitest';
import {
  validateRyoPackage,
  type ValidationReport,
  type ValidationCheck,
} from '../src/tools/validateRyoPackage.js';

function validateCheck(check: ValidationCheck, label: string) {
  expect(check.name, `${label} name`).toBeTruthy();
  expect(typeof check.passed, `${label} passed`).toBe('boolean');
  expect(check.message, `${label} message`).toBeTruthy();
  expect(typeof check.message, `${label} message type`).toBe('string');
  if (check.details !== undefined) {
    expect(Array.isArray(check.details), `${label} details is array`).toBe(true);
  }
}

describe('validateRyoPackage', () => {
  let report: ValidationReport;

  it('runs without errors', () => {
    report = validateRyoPackage();
    expect(report).toBeDefined();
  });

  it('character is ryo', () => {
    expect(report.character).toBe('ryo');
  });

  it('has non-empty checks array', () => {
    expect(report.checks.length).toBeGreaterThan(0);
  });

  it('all checks have valid structure', () => {
    for (let i = 0; i < report.checks.length; i++) {
      validateCheck(report.checks[i], `check[${i}]`);
    }
  });

  it('check counts are consistent', () => {
    expect(report.totalChecks).toBe(report.checks.length);
    expect(report.passedChecks + report.failedChecks).toBe(report.totalChecks);
  });

  it('completenessScore is 0-100', () => {
    expect(report.completenessScore).toBeGreaterThanOrEqual(0);
    expect(report.completenessScore).toBeLessThanOrEqual(100);
  });

  it('completenessScore matches passed/total ratio', () => {
    const expected = Math.round((report.passedChecks / report.totalChecks) * 100);
    expect(report.completenessScore).toBe(expected);
  });

  it('has Content Package Exists check', () => {
    const check = report.checks.find(c => c.name === 'Content Package Exists');
    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
  });

  it('has Character Data Fields check', () => {
    const check = report.checks.find(c => c.name === 'Character Data Fields');
    expect(check).toBeDefined();
  });

  it('has Required Animations check', () => {
    const check = report.checks.find(c => c.name === 'Required Animations');
    expect(check).toBeDefined();
  });

  it('has Attack Frame Data check', () => {
    const check = report.checks.find(c => c.name === 'Attack Frame Data');
    expect(check).toBeDefined();
  });

  it('has Feedback Tier Mappings check', () => {
    const check = report.checks.find(c => c.name === 'Feedback Tier Mappings');
    expect(check).toBeDefined();
  });

  it('has Hitbox Data check', () => {
    const check = report.checks.find(c => c.name === 'Hitbox Data');
    expect(check).toBeDefined();
  });

  it('has Move List Mappings check', () => {
    const check = report.checks.find(c => c.name === 'Move List Mappings');
    expect(check).toBeDefined();
  });

  it('has Frame Data Alignment check', () => {
    const check = report.checks.find(c => c.name === 'Frame Data Alignment');
    expect(check).toBeDefined();
  });

  it('at least 6 checks present', () => {
    expect(report.totalChecks).toBeGreaterThanOrEqual(6);
  });

  it('most checks pass (score > 50)', () => {
    expect(report.completenessScore).toBeGreaterThan(50);
  });

  it('passed checks have non-empty messages', () => {
    for (const check of report.checks.filter(c => c.passed)) {
      expect(check.message.length).toBeGreaterThan(0);
    }
  });
});
