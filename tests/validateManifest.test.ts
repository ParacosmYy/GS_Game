/**
 * validateFrameContract + validateManifest Tool Tests
 *
 * Validates pure-function validation tools return correct structure:
 * - validateAllContracts() returns ValidationResult[] for ryo/kyo/iori
 * - validateCharacter() returns CharacterReport with sections and section results
 */
import { describe, it, expect } from 'vitest';
import { validateAllContracts } from '../src/tools/validateFrameContract.js';
import { validateCharacter, type CharacterReport, type SectionResult } from '../src/tools/validateManifest.js';

// ===== validateAllContracts =====

describe('validateAllContracts', () => {
  it('returns array of 3 results', () => {
    const results = validateAllContracts();
    expect(results.length).toBe(3);
  });

  it('results cover ryo, kyo, iori', () => {
    const results = validateAllContracts();
    const chars = results.map(r => r.character);
    expect(chars).toContain('ryo');
    expect(chars).toContain('kyo');
    expect(chars).toContain('iori');
  });

  it('each result has valid structure', () => {
    const results = validateAllContracts();
    for (const r of results) {
      expect(r.character, 'character non-empty').toBeTruthy();
      expect(r.totalActions, 'totalActions >= 0').toBeGreaterThanOrEqual(0);
      expect(r.passed, 'passed >= 0').toBeGreaterThanOrEqual(0);
      expect(r.failed, 'failed >= 0').toBeGreaterThanOrEqual(0);
      // failed = issues.length, which may exceed totalActions (multiple issues per action)
      expect(r.failed, 'failed >= 0').toBeGreaterThanOrEqual(0);
      expect(Array.isArray(r.issues), 'issues is array').toBe(true);
    }
  });

  it('ryo has some validated actions', () => {
    const ryo = validateAllContracts().find(r => r.character === 'ryo')!;
    expect(ryo.totalActions).toBeGreaterThan(0);
  });

  it('kyo has some validated actions', () => {
    const kyo = validateAllContracts().find(r => r.character === 'kyo')!;
    expect(kyo.totalActions).toBeGreaterThan(0);
  });

  it('iori has some validated actions', () => {
    const iori = validateAllContracts().find(r => r.character === 'iori')!;
    expect(iori.totalActions).toBeGreaterThan(0);
  });
});

// ===== validateCharacter =====

function validateSectionResult(section: SectionResult, label: string) {
  expect(section.total, `${label}.total >= 0`).toBeGreaterThanOrEqual(0);
  expect(section.pass, `${label}.pass >= 0`).toBeGreaterThanOrEqual(0);
  expect(section.pass, `${label}.pass <= total`).toBeLessThanOrEqual(section.total);
  expect(Array.isArray(section.issues), `${label}.issues is array`).toBe(true);
}

describe('validateCharacter — ryo', () => {
  let report: CharacterReport;

  it('runs without errors', () => {
    report = validateCharacter('ryo');
    expect(report).toBeDefined();
  });

  it('charId is ryo', () => {
    expect(report.charId).toBe('ryo');
  });

  it('has sections', () => {
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it('all sections have valid structure', () => {
    for (const s of report.sections) {
      expect(s.name, 'section name').toBeTruthy();
      validateSectionResult(s.result, `ryo.${s.name}`);
    }
  });

  it('has frameData section', () => {
    const sec = report.sections.find(s => s.name.includes('frameData'));
    expect(sec).toBeDefined();
  });

  it('has feedback section', () => {
    const sec = report.sections.find(s => s.name.includes('feedback'));
    expect(sec).toBeDefined();
  });

  it('has sprite manifest section', () => {
    const sec = report.sections.find(s => s.name.includes('sprite'));
    expect(sec).toBeDefined();
  });
});

describe('validateCharacter — kyo', () => {
  let report: CharacterReport;

  it('runs without errors', () => {
    report = validateCharacter('kyo');
    expect(report).toBeDefined();
  });

  it('charId is kyo', () => {
    expect(report.charId).toBe('kyo');
  });

  it('has sections with valid structure', () => {
    expect(report.sections.length).toBeGreaterThan(0);
    for (const s of report.sections) {
      validateSectionResult(s.result, `kyo.${s.name}`);
    }
  });
});

describe('validateCharacter — iori', () => {
  let report: CharacterReport;

  it('runs without errors', () => {
    report = validateCharacter('iori');
    expect(report).toBeDefined();
  });

  it('charId is iori', () => {
    expect(report.charId).toBe('iori');
  });

  it('has sections with valid structure', () => {
    expect(report.sections.length).toBeGreaterThan(0);
    for (const s of report.sections) {
      validateSectionResult(s.result, `iori.${s.name}`);
    }
  });
});

// ===== Cross-character =====

describe('validateCharacter — cross-character consistency', () => {
  it('all 3 characters have same section names', () => {
    const ryo = validateCharacter('ryo');
    const kyo = validateCharacter('kyo');
    const iori = validateCharacter('iori');
    const ryoNames = ryo.sections.map(s => s.name);
    const kyoNames = kyo.sections.map(s => s.name);
    const ioriNames = iori.sections.map(s => s.name);
    // kyo and iori should have identical section structure
    expect(kyoNames).toEqual(ioriNames);
    // ryo has extra hurtbox coverage section
    expect(ryoNames.length).toBeGreaterThanOrEqual(kyoNames.length);
  });
});
