/**
 * Ryo Content Reports Regression Tests
 *
 * Validates Ryo's subdomain status tracking and completion queries.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_SUBDOMAIN_STATUS,
  getCompletedSubdomains,
  getSubdomainsNeedingTests,
  getRyoContentCompletion,
} from '../src/content/characters/ryo/reports/ryoReports.js';

describe('RYO_SUBDOMAIN_STATUS', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(RYO_SUBDOMAIN_STATUS)).toBe(true);
    expect(RYO_SUBDOMAIN_STATUS.length).toBeGreaterThan(0);
  });

  it('every entry has required fields', () => {
    for (const sub of RYO_SUBDOMAIN_STATUS) {
      expect(sub.name).toBeTruthy();
      expect(typeof sub.hasRealData).toBe('boolean');
      expect(sub.dataFile).toBeTruthy();
      expect(sub.testFile).toBeTruthy();
      expect(typeof sub.testCount).toBe('number');
      expect(sub.testCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('has expected core subdomains', () => {
    const names = RYO_SUBDOMAIN_STATUS.map(s => s.name);
    expect(names).toContain('commands');
    expect(names).toContain('moves');
    expect(names).toContain('attacks');
    expect(names).toContain('hitboxes');
    expect(names).toContain('feedback');
    expect(names).toContain('animations');
    expect(names).toContain('portraits');
  });

  it('all core subdomains have real data', () => {
    const coreNames = ['commands', 'moves', 'attacks', 'hitboxes', 'feedback', 'animations', 'portraits'];
    for (const name of coreNames) {
      const sub = RYO_SUBDOMAIN_STATUS.find(s => s.name === name);
      expect(sub, `${name} subdomain`).toBeDefined();
      expect(sub!.hasRealData, `${name} hasRealData`).toBe(true);
    }
  });
});

describe('getCompletedSubdomains', () => {
  it('returns positive count', () => {
    const count = getCompletedSubdomains();
    expect(count).toBeGreaterThan(0);
  });

  it('returns count <= total subdomains', () => {
    const completed = getCompletedSubdomains();
    expect(completed).toBeLessThanOrEqual(RYO_SUBDOMAIN_STATUS.length);
  });

  it('all subdomains currently have real data', () => {
    expect(getCompletedSubdomains()).toBe(RYO_SUBDOMAIN_STATUS.length);
  });
});

describe('getSubdomainsNeedingTests', () => {
  it('returns array', () => {
    const needTests = getSubdomainsNeedingTests();
    expect(Array.isArray(needTests)).toBe(true);
  });

  it('returned entries have testCount 0', () => {
    const needTests = getSubdomainsNeedingTests();
    for (const sub of needTests) {
      expect(sub.testCount).toBe(0);
    }
  });
});

describe('getRyoContentCompletion', () => {
  it('returns percentage 0-100', () => {
    const pct = getRyoContentCompletion();
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('returns 100 when all subdomains have real data', () => {
    const allHaveData = RYO_SUBDOMAIN_STATUS.every(s => s.hasRealData);
    if (allHaveData) {
      expect(getRyoContentCompletion()).toBe(100);
    }
  });
});
